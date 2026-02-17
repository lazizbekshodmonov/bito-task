import { Injectable, Logger, NestMiddleware, OnModuleDestroy } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';
import { JwtPayload } from '../modules/auth/auth.types';
import * as fs from 'fs';
import * as path from 'path';
import { getClientIp } from '../common/utils/client-ip';

interface RequestWithUser extends Request {
  user?: JwtPayload;
}

interface SanitizedUser {
  sub: number;
  role: string;
}

interface TruncatedData {
  _truncated: true;
  _originalSize: number;
  _preview: string;
}

interface LogEntry {
  timestamp: string;
  level: 'error' | 'warn' | 'log';
  context: string;
  ip: string;
  method: string;
  url: string;
  statusCode: number;
  delay: string;
  user: SanitizedUser | null;
  requestBody?: unknown;
  responseBody?: unknown;
  error?: unknown;
}

/** Paths that should never have their bodies logged (even on error) */
const SENSITIVE_PATHS = ['/auth/login', '/auth/register', '/auth/refresh', '/auth/reset-password'];

/** Fields to strip from any logged body */
const SENSITIVE_FIELDS = new Set(['password', 'confirmPassword', 'currentPassword', 'newPassword', 'token', 'refreshToken', 'accessToken', 'secret', 'creditCard', 'cardNumber', 'cvv', 'ssn']);

@Injectable()
export class LoggerMiddleware implements NestMiddleware, OnModuleDestroy {
  private readonly logger = new Logger('HTTP');

  // ── File logging config ────────────────────────────────────────────
  private readonly logDir = path.join(process.cwd(), 'logs');
  private readonly logFileName = 'app.log';
  private readonly maxFileSize = 10 * 1024 * 1024; // 10 MB
  private readonly maxFiles = 5;

  // ── Write buffer ───────────────────────────────────────────────────
  private buffer: string[] = [];
  private readonly bufferSize = 50; // flush every N entries
  private readonly flushInterval = 5_000; // or every 5 seconds
  private flushTimer: NodeJS.Timeout | null = null;
  private isFlushing = false;

  // ── Truncation defaults ────────────────────────────────────────────
  private readonly bodyMaxLength = 1_000; // characters
  private readonly bodyLogMode: 'error-only' | 'always' | 'never' = 'error-only';

  constructor() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }

    this.flushTimer = setInterval(() => {
      void this.flush();
    }, this.flushInterval);
  }

  // ── NestMiddleware ─────────────────────────────────────────────────

  use(req: RequestWithUser, res: Response, next: NextFunction): void {
    const { method, originalUrl } = req;
    const body = req.body as Record<string, unknown> | undefined;
    const start = Date.now();
    const ip = getClientIp(req);

    // Capture response body only when needed
    let responseBody: unknown;
    const shouldCaptureBody = this.shouldLogBody(originalUrl);

    if (shouldCaptureBody) {
      const originalSend = res.send;
      res.send = function (this: Response, data: any): Response {
        responseBody = data;
        return originalSend.apply(this, [data]) as Response;
      };
    }

    res.on('finish', () => {
      const { statusCode } = res;
      const delay = Date.now() - start;
      const user = (res.locals as Record<string, unknown>).user ?? req.user ?? null;

      const sanitizedUser = this.sanitizeUser(user as JwtPayload | null);
      const shortMessage = `${method} - ${statusCode} ${originalUrl} - ${delay}ms, IP: ${ip}`;

      // Build details based on status code and config
      const includeBody = shouldCaptureBody && this.shouldIncludeBody(statusCode);

      const logEntry: LogEntry = {
        timestamp: new Date().toISOString(),
        level: this.getLevel(statusCode),
        context: 'HTTP',
        ip,
        method,
        url: originalUrl,
        statusCode,
        delay: `${delay}ms`,
        user: sanitizedUser,
      };

      if (includeBody) {
        if (body && Object.keys(body).length > 0) {
          logEntry.requestBody = this.sanitizeAndTruncate(body);
        }
        if (responseBody) {
          logEntry.responseBody = this.sanitizeAndTruncate(this.tryParseJson(responseBody));
        }
      }

      // Console log — always short, details only on error
      if (statusCode >= 500) {
        this.logger.error(shortMessage, JSON.stringify(logEntry));
      } else if (statusCode >= 400) {
        this.logger.warn(shortMessage);
      } else {
        this.logger.log(shortMessage);
      }

      // File log — buffered
      this.bufferLog(logEntry);
    });

    next();
  }

  // ── Cleanup ────────────────────────────────────────────────────────

  async onModuleDestroy(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }

  // ── Sanitization helpers ───────────────────────────────────────────

  /**
   * Extract only non-sensitive fields from the JWT payload.
   */
  private sanitizeUser(user: JwtPayload | null): SanitizedUser | null {
    if (!user) return null;
    return {
      sub: user.sub,
      role: user.role,
    };
  }

  /**
   * Recursively strip sensitive fields and truncate large payloads.
   */
  private sanitizeAndTruncate(data: unknown, maxLength = this.bodyMaxLength): unknown {
    if (data == null) return null;

    // Strip sensitive fields first
    const cleaned = this.stripSensitiveFields(data);

    // Check serialized size
    const serialized = JSON.stringify(cleaned);
    if (serialized.length <= maxLength) return cleaned;

    return {
      _truncated: true,
      _originalSize: serialized.length,
      _preview: serialized.substring(0, maxLength) + '…',
    } satisfies TruncatedData;
  }

  /**
   * Recursively remove sensitive fields from an object.
   */
  private stripSensitiveFields(data: unknown): unknown {
    if (data == null || typeof data !== 'object') return data;

    if (Array.isArray(data)) {
      return data.map((item) => this.stripSensitiveFields(item));
    }

    const result: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (SENSITIVE_FIELDS.has(key)) {
        result[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        result[key] = this.stripSensitiveFields(value);
      } else {
        result[key] = value;
      }
    }
    return result;
  }

  // ── Body logging rules ─────────────────────────────────────────────

  /**
   * Check if this path should have its body captured at all.
   */
  private shouldLogBody(url: string): boolean {
    if (this.bodyLogMode === 'never') return false;

    // Never capture bodies for auth-related endpoints
    const pathname = url.split('?')[0];
    return !SENSITIVE_PATHS.some((p) => pathname.includes(p));
  }

  /**
   * Decide whether to include body in the final log entry.
   */
  private shouldIncludeBody(statusCode: number): boolean {
    if (this.bodyLogMode === 'always') return true;
    if (this.bodyLogMode === 'never') return false;
    // 'error-only' — log body only for 4xx and 5xx
    return statusCode >= 400;
  }

  // ── Log level ──────────────────────────────────────────────────────

  private getLevel(statusCode: number): 'error' | 'warn' | 'log' {
    if (statusCode >= 500) return 'error';
    if (statusCode >= 400) return 'warn';
    return 'log';
  }

  // ── Buffered file writing with rotation ────────────────────────────

  private bufferLog(entry: LogEntry): void {
    this.buffer.push(JSON.stringify(entry));
    if (this.buffer.length >= this.bufferSize) {
      void this.flush();
    }
  }

  private async flush(): Promise<void> {
    if (this.isFlushing || this.buffer.length === 0) return;
    this.isFlushing = true;

    const entries = this.buffer.splice(0);
    const data = entries.join('\n') + '\n';

    try {
      await this.rotateIfNeeded();
      await fs.promises.appendFile(this.currentLogPath, data, 'utf-8');
    } catch (error) {
      this.logger.debug(`Failed to write log file: ${String(error)}`);
      // Re-add entries to buffer on failure (but cap to prevent memory leak)
      if (this.buffer.length < this.bufferSize * 3) {
        this.buffer.unshift(...entries);
      }
    } finally {
      this.isFlushing = false;
    }
  }

  private get currentLogPath(): string {
    return path.join(this.logDir, this.logFileName);
  }

  /**
   * Simple size-based log rotation.
   * app.log → app.1.log → app.2.log → ... → app.5.log (deleted)
   */
  private async rotateIfNeeded(): Promise<void> {
    try {
      const stats = await fs.promises.stat(this.currentLogPath);
      if (stats.size < this.maxFileSize) return;
    } catch {
      // File doesn't exist yet — no rotation needed
      return;
    }

    // Shift existing rotated files
    for (let i = this.maxFiles - 1; i >= 1; i--) {
      const older = path.join(this.logDir, `app.${i + 1}.log`);
      const newer = path.join(this.logDir, `app.${i}.log`);
      try {
        if (i === this.maxFiles - 1) {
          // Delete the oldest file
          await fs.promises.unlink(older).catch(() => {});
        }
        await fs.promises.rename(newer, older);
      } catch {
        // File may not exist, skip
      }
    }

    // Rotate current → app.1.log
    try {
      await fs.promises.rename(this.currentLogPath, path.join(this.logDir, 'app.1.log'));
    } catch {
      // If rename fails, just continue writing to current
    }
  }

  // ── Utils ──────────────────────────────────────────────────────────

  private tryParseJson(data: unknown): unknown {
    try {
      return typeof data === 'string' ? JSON.parse(data) : data;
    } catch {
      return data;
    }
  }
}

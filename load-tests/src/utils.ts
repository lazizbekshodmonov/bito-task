export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function uuidv4(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  bold: '\x1b[1m',
};

export function log(message: string): void {
  const ts = new Date().toISOString().slice(11, 23);
  console.log(`${COLORS.gray}[${ts}]${COLORS.reset} ${message}`);
}

export function pass(message: string): void {
  console.log(`${COLORS.green}${COLORS.bold}  ✓ PASS${COLORS.reset} ${message}`);
}

export function fail(message: string): void {
  console.log(`${COLORS.red}${COLORS.bold}  ✗ FAIL${COLORS.reset} ${message}`);
}

export function info(message: string): void {
  console.log(`${COLORS.cyan}  ℹ ${message}${COLORS.reset}`);
}

export function warn(message: string): void {
  console.log(`${COLORS.yellow}  ⚠ ${message}${COLORS.reset}`);
}

export function header(title: string): void {
  console.log();
  console.log(`${COLORS.bold}${COLORS.magenta}${'═'.repeat(60)}${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.magenta}  ${title}${COLORS.reset}`);
  console.log(`${COLORS.bold}${COLORS.magenta}${'═'.repeat(60)}${COLORS.reset}`);
  console.log();
}

export function assert(condition: boolean, message: string): void {
  if (condition) {
    pass(message);
  } else {
    fail(message);
    throw new Error(`Assertion failed: ${message}`);
  }
}

export function randomEmail(): string {
  return `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}@loadtest.local`;
}

export function randomPassword(): string {
  return `Test@1${Date.now().toString(36)}`;
}

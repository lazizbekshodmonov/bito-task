import { header, log, pass, fail, info, warn } from './utils.js';
import { runSmoke } from './01-smoke.js';
import { runRaceCondition } from './02-race-condition.js';
import { runExpiredConfirm } from './03-expired-confirm.js';
import { runDoubleBooking } from './04-double-booking.js';
import { runConcurrentInstances } from './05-concurrent-instances.js';
import { runDbPressure } from './06-db-pressure.js';
import { runCrashRecovery } from './07-crash-recovery.js';
import { runFullLoad } from './08-full-load.js';

interface TestDef {
  name: string;
  fn: () => Promise<void>;
  skip?: boolean;
}

const SKIP_INTERACTIVE = process.argv.includes('--skip-interactive');
const SKIP_SLOW = process.argv.includes('--skip-slow');

const tests: TestDef[] = [
  { name: '01 Smoke', fn: runSmoke },
  { name: '02 Race Condition', fn: runRaceCondition },
  { name: '03 Expired Confirm', fn: runExpiredConfirm, skip: SKIP_SLOW },
  { name: '04 Double Booking', fn: runDoubleBooking },
  { name: '05 Concurrent Instances', fn: runConcurrentInstances },
  { name: '06 DB Pressure', fn: runDbPressure },
  { name: '07 Crash Recovery', fn: runCrashRecovery, skip: SKIP_INTERACTIVE },
  { name: '08 Full Load', fn: runFullLoad, skip: SKIP_SLOW },
];

async function main(): Promise<void> {
  header('Load Test Suite — Run All');
  info(`Target: ${process.env.BASE_URL || 'https://dsrs.powerapp.uz'}`);
  if (SKIP_INTERACTIVE) info('Skipping interactive tests (--skip-interactive)');
  if (SKIP_SLOW) info('Skipping slow tests (--skip-slow)');
  console.log();

  const results: { name: string; status: 'PASS' | 'FAIL' | 'SKIP'; error?: string; duration: number }[] = [];

  for (const test of tests) {
    if (test.skip) {
      warn(`SKIP ${test.name}`);
      results.push({ name: test.name, status: 'SKIP', duration: 0 });
      continue;
    }

    const start = Date.now();
    try {
      await test.fn();
      const duration = Date.now() - start;
      results.push({ name: test.name, status: 'PASS', duration });
    } catch (err: any) {
      const duration = Date.now() - start;
      results.push({ name: test.name, status: 'FAIL', error: err.message, duration });
    }
  }

  // Summary
  header('Test Results Summary');
  let allPassed = true;

  for (const r of results) {
    const dur = r.duration > 0 ? ` (${(r.duration / 1000).toFixed(1)}s)` : '';
    if (r.status === 'PASS') {
      pass(`${r.name}${dur}`);
    } else if (r.status === 'FAIL') {
      fail(`${r.name}${dur} — ${r.error}`);
      allPassed = false;
    } else {
      warn(`SKIP ${r.name}`);
    }
  }

  const passed = results.filter((r) => r.status === 'PASS').length;
  const failed = results.filter((r) => r.status === 'FAIL').length;
  const skipped = results.filter((r) => r.status === 'SKIP').length;

  console.log();
  info(`Total: ${passed} passed, ${failed} failed, ${skipped} skipped`);

  if (!allPassed) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

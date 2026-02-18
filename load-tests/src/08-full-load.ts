import { registerAndLogin, getSeats, reserve, confirm, cancel, findAvailableSeats, Seat } from './api.js';
import { header, log, assert, info, warn, sleep, randomEmail, randomPassword } from './utils.js';

interface Stats {
  reserveSuccess: number;
  reserveFail: number;
  confirmSuccess: number;
  confirmFail: number;
  cancelSuccess: number;
  cancelFail: number;
  totalRequests: number;
  totalResponseTime: number;
  errors500: number;
}

export async function runFullLoad(userCount = 1000): Promise<void> {
  const USER_COUNT = userCount;
  const DURATION_MS = 3 * 60 * 1000; // 3 minutes
  const STATS_INTERVAL_MS = 10_000;  // 10 seconds
  const BATCH_SIZE = 25;

  header(`08 — Full Load Test (${USER_COUNT} users, 3 min sustained)`);

  // Step 1: Register users in batches
  log(`Registering ${USER_COUNT} users (batch size ${BATCH_SIZE})...`);
  const tokens: string[] = [];
  const regStart = Date.now();

  for (let batch = 0; batch < USER_COUNT; batch += BATCH_SIZE) {
    const batchSize = Math.min(BATCH_SIZE, USER_COUNT - batch);
    const batchPromises = Array.from({ length: batchSize }, (_, i) => {
      const email = randomEmail();
      const password = randomPassword();
      return registerAndLogin(`Load User ${batch + i}`, email, password);
    });
    const batchTokens = await Promise.all(batchPromises);
    tokens.push(...batchTokens);
    if (tokens.length % 100 === 0 || tokens.length === USER_COUNT) {
      info(`  ${tokens.length}/${USER_COUNT} users registered`);
    }
  }
  const regElapsed = ((Date.now() - regStart) / 1000).toFixed(1);
  info(`All ${tokens.length} users ready (${regElapsed}s)`);

  // Step 2: Get initial seats snapshot
  const seatsRes = await getSeats(tokens[0]);
  assert(seatsRes.status === 200, 'GET /seats OK');
  const allSeats = seatsRes.data;
  const availableIds = findAvailableSeats(allSeats).map((s) => s.id);
  info(`${availableIds.length} available seats to work with`);

  if (availableIds.length === 0) {
    warn('No available seats — skipping load test');
    return;
  }

  // Stats tracking
  const stats: Stats = {
    reserveSuccess: 0,
    reserveFail: 0,
    confirmSuccess: 0,
    confirmFail: 0,
    cancelSuccess: 0,
    cancelFail: 0,
    totalRequests: 0,
    totalResponseTime: 0,
    errors500: 0,
  };

  const activeReservations: Map<number, { reservationId: string; seatId: string }> = new Map();
  let running = true;

  let lastStatReqs = 0;
  let lastStatTime = 0;

  // Stats printer
  const statsInterval = setInterval(() => {
    const avgTime = stats.totalRequests > 0
      ? Math.round(stats.totalResponseTime / stats.totalRequests)
      : 0;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const intervalReqs = stats.totalRequests - lastStatReqs;
    const intervalSec = (Date.now() - (lastStatTime || startTime)) / 1000;
    const rps = intervalSec > 0 ? Math.round(intervalReqs / intervalSec) : 0;
    lastStatReqs = stats.totalRequests;
    lastStatTime = Date.now();

    console.log();
    info(`━━━ Stats @ ${elapsed}s ━━━`);
    info(`  Reserves:  ${stats.reserveSuccess} ok / ${stats.reserveFail} fail`);
    info(`  Confirms:  ${stats.confirmSuccess} ok / ${stats.confirmFail} fail`);
    info(`  Cancels:   ${stats.cancelSuccess} ok / ${stats.cancelFail} fail`);
    info(`  Total:     ${stats.totalRequests} reqs, avg ${avgTime}ms, ~${rps} rps`);
    info(`  500 errors: ${stats.errors500}`);
    info(`  Active reservations: ${activeReservations.size}`);
  }, STATS_INTERVAL_MS);

  // Worker function for each user
  async function userWorker(userIdx: number): Promise<void> {
    const token = tokens[userIdx];

    while (running) {
      try {
        // Pick a random seat
        const seatId = availableIds[Math.floor(Math.random() * availableIds.length)];

        // Reserve
        const t0 = Date.now();
        const reserveRes = await reserve(token, seatId);
        const reserveTime = Date.now() - t0;
        stats.totalRequests++;
        stats.totalResponseTime += reserveTime;

        if (reserveRes.status >= 500) stats.errors500++;

        if (reserveRes.status === 201) {
          stats.reserveSuccess++;
          const reservationId = reserveRes.data.id;
          activeReservations.set(userIdx, { reservationId, seatId });

          // Wait a random short time
          await sleep(500 + Math.random() * 2000);

          if (!running) break;

          // 70% confirm, 30% cancel
          if (Math.random() < 0.7) {
            const t1 = Date.now();
            const confirmRes = await confirm(token, reservationId);
            stats.totalRequests++;
            stats.totalResponseTime += Date.now() - t1;
            if (confirmRes.status >= 500) stats.errors500++;

            if (confirmRes.status === 200 || confirmRes.status === 201) {
              stats.confirmSuccess++;
              // After confirm, cancel to free up the seat for next iteration
              await sleep(200 + Math.random() * 500);
              const t2 = Date.now();
              const cancelRes = await cancel(token, reservationId);
              stats.totalRequests++;
              stats.totalResponseTime += Date.now() - t2;
              if (cancelRes.status >= 500) stats.errors500++;
              if (cancelRes.status === 200 || cancelRes.status === 201) stats.cancelSuccess++;
              else stats.cancelFail++;
            } else {
              stats.confirmFail++;
            }
          } else {
            const t1 = Date.now();
            const cancelRes = await cancel(token, reservationId);
            stats.totalRequests++;
            stats.totalResponseTime += Date.now() - t1;
            if (cancelRes.status >= 500) stats.errors500++;

            if (cancelRes.status === 200 || cancelRes.status === 201) {
              stats.cancelSuccess++;
            } else {
              stats.cancelFail++;
            }
          }
          activeReservations.delete(userIdx);
        } else {
          stats.reserveFail++;
        }

        // Small delay between iterations
        await sleep(500 + Math.random() * 1500);
      } catch {
        // Network error — just continue
        await sleep(1000);
      }
    }
  }

  // Step 3: Run load test
  log(`Starting ${DURATION_MS / 1000}s load test with ${USER_COUNT} concurrent users...`);
  const startTime = Date.now();

  // Launch all workers
  const workers = tokens.map((_, i) => userWorker(i));

  // Wait for duration
  await sleep(DURATION_MS);
  running = false;

  // Wait for workers to finish current operations
  log('Stopping workers...');
  await Promise.allSettled(workers);
  clearInterval(statsInterval);

  // Final stats
  const totalElapsed = Math.round((Date.now() - startTime) / 1000);
  const avgTime = stats.totalRequests > 0
    ? Math.round(stats.totalResponseTime / stats.totalRequests)
    : 0;

  const rps = totalElapsed > 0 ? Math.round(stats.totalRequests / totalElapsed) : 0;

  console.log();
  info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  info('          FINAL STATS');
  info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  info(`  Users:     ${USER_COUNT}`);
  info(`  Duration:  ${totalElapsed}s`);
  info(`  Reserves:  ${stats.reserveSuccess} ok / ${stats.reserveFail} fail`);
  info(`  Confirms:  ${stats.confirmSuccess} ok / ${stats.confirmFail} fail`);
  info(`  Cancels:   ${stats.cancelSuccess} ok / ${stats.cancelFail} fail`);
  info(`  Total:     ${stats.totalRequests} requests`);
  info(`  Avg time:  ${avgTime}ms`);
  info(`  RPS:       ~${rps} req/s`);
  info(`  500 errors: ${stats.errors500}`);

  // Step 4: Consistency check
  log('Running consistency check...');
  const finalSeats = await getSeats(tokens[0]);
  assert(finalSeats.status === 200, 'Final GET /seats OK');

  const reservedSeats = finalSeats.data.filter((s) => s.status === 'RESERVED');
  const confirmedSeats = finalSeats.data.filter((s) => s.status === 'CONFIRMED');
  const availableSeatsCount = finalSeats.data.filter((s) => s.status === 'AVAILABLE').length;

  info(`  AVAILABLE: ${availableSeatsCount}`);
  info(`  RESERVED:  ${reservedSeats.length}`);
  info(`  CONFIRMED: ${confirmedSeats.length}`);

  assert(stats.errors500 === 0, `No 500 errors during load test (got ${stats.errors500})`);

  log('Full load test completed!');
}

if (process.argv[1]?.includes('08-full')) {
  const userArg = process.argv.find((a) => a.startsWith('--users='));
  const userCount = userArg ? parseInt(userArg.split('=')[1], 10) : 1000;
  runFullLoad(userCount)
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

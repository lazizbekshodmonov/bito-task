import { registerAndLogin, getSeats, reserve, cancel, findAvailableSeats } from './api.js';
import { header, log, assert, info, warn, randomEmail, randomPassword } from './utils.js';

export async function runDbPressure(): Promise<void> {
  header('06 — DB Pressure (concurrent reserves on different seats)');

  const TARGET_CONCURRENCY = 80;

  // Step 1: First check how many seats are actually available
  log('Checking available seats...');
  const preCheckEmail = randomEmail();
  const preCheckPassword = randomPassword();
  const preCheckToken = await registerAndLogin('PreCheck User', preCheckEmail, preCheckPassword);

  const preSeatsRes = await getSeats(preCheckToken);
  const preAvailable = findAvailableSeats(preSeatsRes.data);
  const CONCURRENCY = Math.min(TARGET_CONCURRENCY, preAvailable.length);

  if (CONCURRENCY < TARGET_CONCURRENCY) {
    warn(`Only ${preAvailable.length} available seats (wanted ${TARGET_CONCURRENCY}), using ${CONCURRENCY}`);
  }
  assert(CONCURRENCY >= 10, `Need at least 10 available seats, found ${preAvailable.length}`);

  // Step 2: Register users in batches
  log(`Registering ${CONCURRENCY} users...`);
  const tokens: string[] = [];

  for (let batch = 0; batch < CONCURRENCY; batch += 10) {
    const batchSize = Math.min(10, CONCURRENCY - batch);
    const batchPromises = Array.from({ length: batchSize }, (_, i) => {
      const idx = batch + i;
      const email = randomEmail();
      const password = randomPassword();
      return registerAndLogin(`Pressure User ${idx}`, email, password);
    });
    const batchTokens = await Promise.all(batchPromises);
    tokens.push(...batchTokens);
    info(`  Batch ${Math.floor(batch / 10) + 1}: ${batchTokens.length} users registered`);
  }
  info(`${tokens.length} users ready`);

  // Step 3: Get available seats fresh
  const seatsRes = await getSeats(tokens[0]);
  const available = findAvailableSeats(seatsRes.data);
  const actualCount = Math.min(CONCURRENCY, available.length);
  const targetSeats = available.slice(0, actualCount);
  const activeTokens = tokens.slice(0, actualCount);
  info(`Selected ${targetSeats.length} different seats`);

  // Step 4: Concurrent reserves, each on a different seat
  log(`Firing ${actualCount} concurrent reserve requests...`);
  const start = Date.now();
  const results = await Promise.all(
    activeTokens.map((token, i) => reserve(token, targetSeats[i].id)),
  );
  const elapsed = Date.now() - start;

  // Step 5: Analyze results
  const statuses = results.reduce<Record<number, number>>((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});

  info(`Completed in ${elapsed}ms`);
  for (const [status, count] of Object.entries(statuses)) {
    info(`  Status ${status}: ${count}`);
  }

  const successes = results.filter((r) => r.status === 201);
  const errors500 = results.filter((r) => r.status >= 500);

  assert(successes.length === actualCount, `All ${actualCount} should succeed (got ${successes.length})`);
  assert(errors500.length === 0, `No 500 errors (got ${errors500.length})`);

  info(`Average response time: ${Math.round(elapsed / actualCount)}ms per request (total parallel time)`);

  // Cleanup: cancel all reservations
  log('Cleaning up reservations...');
  const cancelPromises = successes.map((r, i) => cancel(activeTokens[i], r.data.id));
  await Promise.all(cancelPromises);
  info('All reservations cancelled');

  log('DB pressure test completed successfully!');
}

if (process.argv[1]?.includes('06-db')) {
  runDbPressure()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

import { registerAndLogin, getSeats, reserve, findAvailableSeats } from './api.js';
import { header, log, assert, info, randomEmail, randomPassword } from './utils.js';

export async function runRaceCondition(): Promise<void> {
  header('02 — Race Condition (50 concurrent reserves → 1 seat)');

  const CONCURRENCY = 50;

  // Step 1: Register 50 users
  log(`Registering ${CONCURRENCY} users...`);
  const tokens: string[] = [];

  // Register in batches of 10 to avoid overwhelming the server
  for (let batch = 0; batch < CONCURRENCY; batch += 10) {
    const batchSize = Math.min(10, CONCURRENCY - batch);
    const batchPromises = Array.from({ length: batchSize }, (_, i) => {
      const idx = batch + i;
      const email = randomEmail();
      const password = randomPassword();
      return registerAndLogin(`Race User ${idx}`, email, password);
    });
    const batchTokens = await Promise.all(batchPromises);
    tokens.push(...batchTokens);
  }
  info(`${tokens.length} users registered and logged in`);

  // Step 2: Pick 1 available seat
  const seatsRes = await getSeats(tokens[0]);
  const available = findAvailableSeats(seatsRes.data);
  assert(available.length > 0, 'Found available seats');
  const targetSeat = available[0];
  info(`Target seat: ${targetSeat.label} (${targetSeat.id})`);

  // Step 3: 50 concurrent reserves on the same seat
  log(`Firing ${CONCURRENCY} concurrent reserve requests...`);
  const start = Date.now();
  const results = await Promise.all(
    tokens.map((token) => reserve(token, targetSeat.id)),
  );
  const elapsed = Date.now() - start;
  info(`All responses received in ${elapsed}ms`);

  // Step 4: Assert exactly 1 success
  const successes = results.filter((r) => r.status === 201);
  const conflicts = results.filter((r) => r.status === 409);
  const others = results.filter((r) => r.status !== 201 && r.status !== 409);

  info(`201 (success): ${successes.length}`);
  info(`409 (conflict): ${conflicts.length}`);
  if (others.length > 0) {
    info(`Other statuses: ${others.map((r) => r.status).join(', ')}`);
  }

  assert(successes.length === 1, `Exactly 1 success (got ${successes.length})`);
  assert(conflicts.length === CONCURRENCY - 1, `${CONCURRENCY - 1} conflicts (got ${conflicts.length})`);

  // Step 5: Verify seat is RESERVED
  const seatsAfter = await getSeats(tokens[0]);
  const seatAfter = seatsAfter.data.find((s) => s.id === targetSeat.id);
  assert(seatAfter?.status === 'RESERVED', `Seat status is ${seatAfter?.status}`);

  log('Race condition test completed successfully!');
}

if (process.argv[1]?.includes('02-race')) {
  runRaceCondition()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

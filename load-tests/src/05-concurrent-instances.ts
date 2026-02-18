import { registerAndLogin, getSeats, reserve, confirm, findAvailableSeats } from './api.js';
import { header, log, assert, info, randomEmail, randomPassword } from './utils.js';

export async function runConcurrentInstances(): Promise<void> {
  header('05 — Concurrent Instances (2 users → 1 seat → Promise.all)');

  // Step 1: Register 2 users
  const email1 = randomEmail();
  const email2 = randomEmail();
  const password1 = randomPassword();
  const password2 = randomPassword();

  log('Registering 2 users...');
  const [token1, token2] = await Promise.all([
    registerAndLogin('Instance User 1', email1, password1),
    registerAndLogin('Instance User 2', email2, password2),
  ]);
  info('Both users logged in');

  // Step 2: Pick 1 available seat
  const seatsRes = await getSeats(token1);
  const available = findAvailableSeats(seatsRes.data);
  assert(available.length > 0, 'Found available seats');
  const seat = available[0];
  info(`Target seat: ${seat.label} (${seat.id})`);

  // Step 3: 2 concurrent reserves
  log('Firing 2 concurrent reserve requests...');
  const [res1, res2] = await Promise.all([
    reserve(token1, seat.id),
    reserve(token2, seat.id),
  ]);

  info(`User 1: ${res1.status}, User 2: ${res2.status}`);

  const statuses = [res1.status, res2.status].sort();
  assert(
    statuses.includes(201) && statuses.includes(409),
    `Expected one 201 and one 409 (got ${statuses.join(', ')})`,
  );

  const successes = [res1, res2].filter((r) => r.status === 201);
  assert(successes.length === 1, `Exactly 1 success (got ${successes.length})`);

  // Step 4: Winner confirms
  const winner = successes[0];
  const winnerToken = res1.status === 201 ? token1 : token2;

  log('Winner confirming reservation...');
  const confirmRes = await confirm(winnerToken, winner.data.id);
  assert(confirmRes.status === 200 || confirmRes.status === 201, `Confirm returned ${confirmRes.status}`);
  assert(confirmRes.data.status === 'CONFIRMED', `Status is ${confirmRes.data.status}`);

  // Verify seat is confirmed
  const seatsAfter = await getSeats(token1);
  const seatAfter = seatsAfter.data.find((s) => s.id === seat.id);
  assert(seatAfter?.status === 'CONFIRMED', `Seat status is ${seatAfter?.status}`);

  log('Concurrent instances test completed successfully!');
}

if (process.argv[1]?.includes('05-concurrent')) {
  runConcurrentInstances()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

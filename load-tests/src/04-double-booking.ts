import { registerAndLogin, getSeats, reserve, cancel, findAvailableSeats } from './api.js';
import { header, log, assert, info, randomEmail, randomPassword, uuidv4 } from './utils.js';

export async function runDoubleBooking(): Promise<void> {
  header('04 — Double Booking (Idempotency + Unique Index)');

  // Step 1: Register two users
  const emailA = randomEmail();
  const emailB = randomEmail();
  const passwordA = randomPassword();
  const passwordB = randomPassword();

  log('Registering User A and User B...');
  const [tokenA, tokenB] = await Promise.all([
    registerAndLogin('User A', emailA, passwordA),
    registerAndLogin('User B', emailB, passwordB),
  ]);
  info('Both users logged in');

  // Step 2: Pick an available seat
  const seatsRes = await getSeats(tokenA);
  const available = findAvailableSeats(seatsRes.data);
  assert(available.length > 0, 'Found available seats');
  const seat = available[0];
  info(`Target seat: ${seat.label} (${seat.id})`);

  // Step 3: User A reserves seat → 201
  log('User A reserving seat...');
  const resA = await reserve(tokenA, seat.id);
  assert(resA.status === 201, `User A reserve returned ${resA.status}`);
  info(`User A reservation ID: ${resA.data.id}`);

  // Step 4: User B tries to reserve the same seat → 409
  log('User B attempting to reserve same seat...');
  const resB = await reserve(tokenB, seat.id);
  assert(resB.status === 409, `User B reserve returned ${resB.status} (expected 409)`);
  info('User B correctly blocked (409)');

  // Step 5: User A cancels
  log('User A cancelling reservation...');
  const cancelRes = await cancel(tokenA, resA.data.id);
  assert(cancelRes.status === 200 || cancelRes.status === 201, `Cancel returned ${cancelRes.status}`);

  // Step 6: User B retries → 201
  log('User B retrying reserve after cancellation...');
  const idempKey = uuidv4();
  const resB2 = await reserve(tokenB, seat.id, idempKey);
  assert(resB2.status === 201, `User B retry returned ${resB2.status}`);
  info(`User B reservation ID: ${resB2.data.id}`);

  // Step 7: User B same idempotency key → cached 201
  log('User B retrying with same idempotency key...');
  const resB3 = await reserve(tokenB, seat.id, idempKey);
  assert(resB3.status === 201, `Idempotent retry returned ${resB3.status}`);
  assert(
    resB3.data.id === resB2.data.id,
    `Same reservation ID returned (${resB3.data.id} === ${resB2.data.id})`,
  );

  // Cleanup: cancel User B's reservation
  await cancel(tokenB, resB2.data.id);

  log('Double booking test completed successfully!');
}

if (process.argv[1]?.includes('04-double')) {
  runDoubleBooking()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

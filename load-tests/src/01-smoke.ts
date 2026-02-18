import { registerAndLogin, getSeats, reserve, confirm, cancel, findAvailableSeats } from './api.js';
import { header, log, assert, info, randomEmail, randomPassword } from './utils.js';

export async function runSmoke(): Promise<void> {
  header('01 — Smoke Test (Happy Path)');

  const email = randomEmail();
  const password = randomPassword();

  // Step 1: Register & Login
  log('Registering and logging in...');
  const token = await registerAndLogin('Smoke User', email, password);
  info(`Logged in as ${email}`);

  // Step 2: Get seats
  log('Fetching seats...');
  const seatsRes = await getSeats(token);
  assert(seatsRes.status === 200, `GET /seats returned ${seatsRes.status}`);

  const available = findAvailableSeats(seatsRes.data);
  assert(available.length > 0, `Found ${available.length} available seats`);

  const seat = available[0];
  info(`Selected seat: ${seat.label} (${seat.id})`);

  // Step 3: Reserve
  log('Reserving seat...');
  const reserveRes = await reserve(token, seat.id);
  assert(reserveRes.status === 201, `Reserve returned ${reserveRes.status}`);
  assert(reserveRes.data.status === 'RESERVED', `Reservation status is ${reserveRes.data.status}`);

  const reservationId = reserveRes.data.id;
  info(`Reservation ID: ${reservationId}`);

  // Step 4: Confirm
  log('Confirming reservation...');
  const confirmRes = await confirm(token, reservationId);
  assert(confirmRes.status === 200 || confirmRes.status === 201, `Confirm returned ${confirmRes.status}`);
  assert(confirmRes.data.status === 'CONFIRMED', `Reservation status is ${confirmRes.data.status}`);

  // Step 5: Verify seat is CONFIRMED
  log('Verifying seat status...');
  const seatsAfterConfirm = await getSeats(token);
  const confirmedSeat = seatsAfterConfirm.data.find((s) => s.id === seat.id);
  assert(confirmedSeat?.status === 'CONFIRMED', `Seat status is ${confirmedSeat?.status}`);

  // Step 6: Cancel
  log('Cancelling reservation...');
  const cancelRes = await cancel(token, reservationId);
  assert(cancelRes.status === 200 || cancelRes.status === 201, `Cancel returned ${cancelRes.status}`);

  // Step 7: Verify seat is AVAILABLE again
  log('Verifying seat is available again...');
  const seatsAfterCancel = await getSeats(token);
  const freedSeat = seatsAfterCancel.data.find((s) => s.id === seat.id);
  assert(freedSeat?.status === 'AVAILABLE', `Seat status is ${freedSeat?.status}`);

  log('Smoke test completed successfully!');
}

// Run standalone
if (process.argv[1]?.includes('01-smoke')) {
  runSmoke()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

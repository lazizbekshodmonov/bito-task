import { registerAndLogin, getSeats, reserve, confirm, findAvailableSeats } from './api.js';
import { header, log, assert, info, warn, sleep, randomEmail, randomPassword } from './utils.js';
import { EXPIRE_WAIT_MS } from './config.js';

export async function runExpiredConfirm(): Promise<void> {
  header('03 — Expired Confirm (Reserve → wait 130s → confirm → 410)');

  const email = randomEmail();
  const password = randomPassword();
  const token = await registerAndLogin('Expire User', email, password);
  info(`Logged in as ${email}`);

  // Step 1: Get available seat
  const seatsRes = await getSeats(token);
  const available = findAvailableSeats(seatsRes.data);
  assert(available.length > 0, 'Found available seats');
  const seat = available[0];
  info(`Selected seat: ${seat.label} (${seat.id})`);

  // Step 2: Reserve
  log('Reserving seat...');
  const reserveRes = await reserve(token, seat.id);
  assert(reserveRes.status === 201, `Reserve returned ${reserveRes.status}`);
  const reservationId = reserveRes.data.id;
  info(`Reservation ID: ${reservationId}`);
  info(`Expires at: ${reserveRes.data.expiresAt}`);

  // Step 3: Wait for TTL to expire
  const waitSec = EXPIRE_WAIT_MS / 1000;
  warn(`Waiting ${waitSec}s for reservation to expire...`);

  // Show countdown every 10 seconds
  const startWait = Date.now();
  while (Date.now() - startWait < EXPIRE_WAIT_MS) {
    const remaining = Math.ceil((EXPIRE_WAIT_MS - (Date.now() - startWait)) / 1000);
    process.stdout.write(`\r  ⏳ ${remaining}s remaining...   `);
    await sleep(Math.min(10_000, EXPIRE_WAIT_MS - (Date.now() - startWait)));
  }
  console.log(); // newline after countdown

  // Step 4: Try to confirm — expect 410 GONE (lazy check) or 409 CONFLICT (cron already expired)
  // Both are valid: 410 if confirm catches expiry, 409 if cron job already set status to EXPIRED
  log('Attempting to confirm expired reservation...');
  const confirmRes = await confirm(token, reservationId);
  info(`Confirm returned status: ${confirmRes.status}`);
  assert(
    confirmRes.status === 410 || confirmRes.status === 409,
    `Expected 410 or 409 for expired reservation, got ${confirmRes.status}`,
  );

  // Step 5: Verify seat is AVAILABLE again
  log('Verifying seat is available...');
  const seatsAfter = await getSeats(token);
  const seatAfter = seatsAfter.data.find((s) => s.id === seat.id);
  assert(seatAfter?.status === 'AVAILABLE', `Seat status is ${seatAfter?.status}`);

  log('Expired confirm test completed successfully!');
}

if (process.argv[1]?.includes('03-expired')) {
  runExpiredConfirm()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

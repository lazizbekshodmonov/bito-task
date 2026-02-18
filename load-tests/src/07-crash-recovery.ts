import * as readline from 'readline';
import { registerAndLogin, getSeats, reserve, confirm, findAvailableSeats } from './api.js';
import { header, log, assert, info, warn, randomEmail, randomPassword } from './utils.js';

function waitForEnter(prompt: string): Promise<void> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(prompt, () => {
      rl.close();
      resolve();
    });
  });
}

export async function runCrashRecovery(): Promise<void> {
  header('07 — Crash Recovery (Reserve → restart → verify)');

  const email = randomEmail();
  const password = randomPassword();
  const token = await registerAndLogin('Crash User', email, password);
  info(`Logged in as ${email}`);

  // Step 1: Reserve 5 seats
  const seatsRes = await getSeats(token);
  const available = findAvailableSeats(seatsRes.data);
  assert(available.length >= 5, `Need 5 available seats, found ${available.length}`);

  const targetSeats = available.slice(0, 5);
  log('Reserving 5 seats...');

  const reservations: { id: string; seatId: string; label: string }[] = [];
  for (const seat of targetSeats) {
    const res = await reserve(token, seat.id);
    assert(res.status === 201, `Reserve ${seat.label} returned ${res.status}`);
    reservations.push({ id: res.data.id, seatId: seat.id, label: seat.label });
    info(`  Reserved: ${seat.label} → ${res.data.id}`);
  }

  // Step 2: Ask user to restart the server
  console.log();
  warn('╔══════════════════════════════════════════════════════════╗');
  warn('║  Endi serverni restart qiling:                         ║');
  warn('║  docker compose restart backend                        ║');
  warn('║                                                        ║');
  warn('║  Restart tugagach Enter bosing...                      ║');
  warn('╚══════════════════════════════════════════════════════════╝');
  console.log();

  await waitForEnter('  >>> Server restart tugadimi? Enter bosing: ');

  // Step 3: Re-login (token might still be valid, but let's be safe)
  log('Re-logging in after restart...');
  const newToken = await registerAndLogin(
    'Crash User Check',
    randomEmail(),
    randomPassword(),
  );

  // We can still use old token if JWT is valid, but let's also login fresh
  // The original token should still work since JWT is stateless

  // Step 4: Verify reserved seats are still in DB
  log('Verifying seats after restart...');
  const seatsAfter = await getSeats(token);
  assert(seatsAfter.status === 200, `GET /seats returned ${seatsAfter.status}`);

  let stillReserved = 0;
  for (const res of reservations) {
    const seat = seatsAfter.data.find((s) => s.id === res.seatId);
    if (seat?.status === 'RESERVED') {
      stillReserved++;
      info(`  ${res.label}: still RESERVED ✓`);
    } else if (seat?.status === 'AVAILABLE') {
      // Might have expired during restart if it took > 2 min
      warn(`  ${res.label}: became AVAILABLE (may have expired during restart)`);
    } else {
      warn(`  ${res.label}: status is ${seat?.status}`);
    }
  }

  info(`${stillReserved}/${reservations.length} seats still RESERVED after restart`);

  // Step 5: Confirm one seat that is still reserved
  if (stillReserved > 0) {
    const stillReservedSeat = reservations.find((r) => {
      const s = seatsAfter.data.find((s) => s.id === r.seatId);
      return s?.status === 'RESERVED';
    });

    if (stillReservedSeat) {
      log(`Confirming reservation ${stillReservedSeat.label}...`);
      const confirmRes = await confirm(token, stillReservedSeat.id);
      assert(confirmRes.status === 200 || confirmRes.status === 201, `Confirm returned ${confirmRes.status}`);
      info('Reservation confirmed after restart — data consistency OK');

      // Verify
      const seatsVerify = await getSeats(token);
      const confirmedSeat = seatsVerify.data.find((s) => s.id === stillReservedSeat.seatId);
      assert(confirmedSeat?.status === 'CONFIRMED', `Seat status is ${confirmedSeat?.status}`);
    }
  } else {
    warn('All reservations expired during restart — this is expected if restart took > 2 min');
  }

  log('Crash recovery test completed!');
}

if (process.argv[1]?.includes('07-crash')) {
  runCrashRecovery()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err.message);
      process.exit(1);
    });
}

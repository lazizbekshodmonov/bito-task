# DSRS — Distributed Seat Reservation System

Real-time seat reservation platform with concurrent booking control, WebSocket live updates, and admin dashboard.

## Tech Stack

**Backend:** NestJS, TypeORM, PostgreSQL, Redis, Socket.IO, JWT, Swagger

**Frontend:** Vue 3, TypeScript, Tailwind CSS 4, Naive UI, Pinia, TanStack Query, Socket.IO Client

**Infrastructure:** Docker Compose, Nginx

## Quick Start

### Docker (recommended)

```bash
docker compose up --build
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost              |
| API      | http://localhost:8080         |
| Swagger  | http://localhost:8080/api-docs|

### Seed the database

```bash
docker compose exec backend npm run seed
```

This creates 80 seats (8 rows x 10 seats) with categories and an admin user.

### Demo credentials

| Role  | Email            | Password    |
|-------|------------------|-------------|
| Admin | admin@dsrs.uz    | Admin@123!  |

Regular users can register via the registration page.

### Local Development

**Backend:**

```bash
cd backend
npm install
npm run start:dev
```

Requires PostgreSQL and Redis running locally (see `backend/src/config/yml/application.yml`).

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Vite dev server on http://localhost:5174 with API proxy to backend:8080.

## Architecture

```
┌──────────┐    HTTP/WS     ┌──────────┐    SQL     ┌────────────┐
│ Frontend ├───────────────→│ Backend  ├──────────→│ PostgreSQL │
│ (Nginx)  │    /api proxy   │ (NestJS) │           └────────────┘
│ port 80  │    /socket.io   │ port 8080│    KV     ┌────────────┐
└──────────┘                 │          ├──────────→│   Redis    │
                             └──────────┘           └────────────┘
```

## Reservation Flow

```
AVAILABLE ──[reserve]──→ RESERVED (2 min TTL)
                              │
                   ┌──────────┼──────────┐
                   │          │          │
              [confirm]   [cancel]   [expire]
                   │          │          │
                   ▼          ▼          ▼
              CONFIRMED   CANCELLED   EXPIRED
                                    (auto by cron)
```

- **Reserve:** Pessimistic lock on seat row + READ COMMITTED transaction
- **2-min window:** User must confirm within 2 minutes or reservation auto-expires
- **Idempotency:** Redis-backed dedup via `Idempotency-Key` header (24h TTL)
- **Real-time:** Socket.IO broadcasts `seat:updated` / `seat:bulk-updated` to all clients

### Expiration Strategy: Cron + Lazy (Hybrid)

Muddati o'tgan RESERVED holatdagi joylarni AVAILABLE ga qaytarish uchun 4 ta variant ko'rib chiqildi:

| Variant | Afzalligi | Kamchiligi |
|---------|-----------|------------|
| **Cron job** | Oddiy, ishonchli, barcha expired larni batch bilan tozalaydi | Kichik kechikish bor (interval oralig'ida) |
| **Lazy expiration** | Kechikish yo'q — request kelganda darhol tekshiriladi | Faqat request kelganda ishlaydi, agar hech kim so'ramasa seat "RESERVED" qolib ketadi |
| **Redis TTL** | Aniq vaqtda tetiklanadi | Arxitekturani murakkablashtiradi — Redis event ni tutib, DB ni yangilash kerak; Redis Keyspace Notification ishonchli emas (at-most-once) |
| **Background worker** | Mustaqil process, scale qilish mumkin | Kichik loyiha uchun ortiqcha infra (queue, worker process) |

**Tanlangan yechim: Cron + Lazy hybrid**

1. **Cron job** (`@Cron(EVERY_30_SECONDS)`) — har 30 sekundda `expires_at < NOW()` bo'lgan RESERVED larni topib, EXPIRED ga o'zgartiradi, seat ni AVAILABLE qiladi va WebSocket orqali barcha clientlarga xabar beradi. Bu asosiy tozalash mexanizmi.

2. **Lazy expiration** — yangi reserve so'rovi kelganda, agar seat RESERVED bo'lsa va aktiv reservationning `expires_at` o'tgan bo'lsa, shu joyda darhol EXPIRED qilib, seat ni bo'shatadi. Bu cron interval oralig'idagi 0-30 soniyalik "gap" ni yopadi.

Nima uchun Redis TTL emas:
- Redis Keyspace Notification `at-most-once` — xabar yo'qolishi mumkin, ya'ni seat abadiy RESERVED qolib ketish xavfi bor
- DB bilan sinxronlash uchun qo'shimcha kod kerak (event listener → DB update → WebSocket emit)
- Cron + Lazy kombinatsiyasi oddiyroq va ishonchliroq

Nima uchun Background worker emas:
- 80 ta o'rindiq uchun alohida queue/worker infra ortiqcha
- NestJS `@nestjs/schedule` ichki cron yetarli
- Kelajakda minglab o'rindiq bo'lsa, BullMQ worker ga o'tish mumkin

## Seat Layout

```
         ── STAGE ──
Row A   [VIP     $10.00] x 10
Row B   [VIP     $10.00] x 10
Row C   [PREMIUM  $7.50] x 10
Row D   [PREMIUM  $7.50] x 10
Row E   [STANDARD $5.00] x 10
Row F   [STANDARD $5.00] x 10
Row G   [ECONOMY  $3.00] x 10
Row H   [ECONOMY  $3.00] x 10
```

## API Endpoints

### Auth `/api/v1/auth`

| Method | Endpoint       | Auth | Description       |
|--------|----------------|------|-------------------|
| POST   | /register      | No   | Register user     |
| POST   | /login         | No   | User login        |
| POST   | /admin-login   | No   | Admin login       |
| POST   | /refresh       | No   | Refresh JWT token |

### Seats `/api/v1/seats`

| Method | Endpoint | Auth | Description                        |
|--------|----------|------|------------------------------------|
| GET    | /        | No   | All seats with active reservations |

### Reservations `/api/v1/reservations`

| Method | Endpoint  | Auth | Description          |
|--------|-----------|------|----------------------|
| POST   | /reserve  | Yes  | Reserve a seat       |
| POST   | /confirm  | Yes  | Confirm reservation  |
| POST   | /cancel   | Yes  | Cancel reservation   |
| GET    | /my       | Yes  | My reservations list |

### Users `/api/v1/user` (Admin)

| Method | Endpoint            | Description         |
|--------|---------------------|---------------------|
| GET    | /profile            | Own profile         |
| GET    | /                   | List users (paged)  |
| POST   | /                   | Create user         |
| PUT    | /:id                | Update user         |
| PUT    | /change-status/:id  | Toggle active       |
| DELETE | /:id                | Soft delete         |

## Frontend Pages

| Route              | Layout    | Description              |
|--------------------|-----------|--------------------------|
| /auth/login        | default   | User login               |
| /auth/register     | default   | User registration        |
| /auth/admin-login  | default   | Admin login              |
| /seats             | client    | Seat map + reserve       |
| /reservations      | client    | My reservations          |
| /dashboard         | dashboard | Admin stats + seat grid  |
| /dashboard/seats   | dashboard | Admin seat management    |
| /dashboard/users   | dashboard | User management          |
| /dashboard/admins  | dashboard | Admin management         |

## Environment Variables

### Backend (via `application.yml` or env vars)

| Variable       | Default        | Description          |
|----------------|----------------|----------------------|
| POSTGRES_HOST  | localhost      | PostgreSQL host      |
| REDIS_HOST     | localhost      | Redis host           |
| JWT_SECRET     | —              | JWT signing secret   |
| HASH_SECRET    | —              | Password hash secret |
| NODE_ENV       | development    | Environment          |

### Frontend

| Variable       | Default | Description    |
|----------------|---------|----------------|
| VITE_API_BASE  | (empty) | API base URL   |

In Docker, `VITE_API_BASE` stays empty — Nginx proxies `/api` and `/socket.io` to the backend.

## Concurrency & Safety

- **Pessimistic write lock** (`SELECT ... FOR UPDATE`) prevents double-booking
- **READ COMMITTED** transaction isolation avoids serialization conflicts
- **Partial unique index** on `reservations(seat_id) WHERE status IN ('RESERVED','CONFIRMED')` guarantees one active reservation per seat at DB level
- **Idempotency interceptor** prevents duplicate reservations on network retries
- **Optimistic UI** with rollback on failure for instant user feedback

## Localization

Error messages support 4 languages: `uz` (O'zbek), `ru` (Русский), `en` (English), `cyr` (Ўзбек кирил). Set via `Accept-Language` header.

## License

MIT

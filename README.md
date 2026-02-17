# Distributed Seat Reservation System (DSRS)

## Loyiha haqida

Real-time teatr/kino zali o'rindiqlarini band qilish tizimi. Foydalanuvchilar o'rindiqni band qiladi, 2 daqiqa ichida tasdiqlaydi yoki bekor qiladi. Adminlar barcha o'rindiqlar, foydalanuvchilar va adminlarni boshqaradi. WebSocket orqali barcha o'zgarishlar real-time yangilanadi.

---

## Texnologiyalar

### Backend
| Texnologiya | Vazifasi |
|---|---|
| NestJS | Framework |
| TypeORM | ORM |
| PostgreSQL | Database |
| Redis (ioredis) | Idempotency cache (TTL bilan) |
| Socket.IO | Real-time WebSocket |
| JWT | Autentifikatsiya |
| class-validator | DTO validatsiya |
| Swagger/OpenAPI | API dokumentatsiya |
| Helmet + Compression | Xavfsizlik va optimizatsiya |
| node-cron (@nestjs/schedule) | Scheduled jobs |

### Frontend
| Texnologiya | Vazifasi |
|---|---|
| Vue 3 (Composition API) | Framework |
| TypeScript | Tip xavfsizligi |
| Vite | Build tool |
| Pinia | State management |
| TanStack Vue Query | Server state / caching |
| Naive UI | UI component library |
| Tailwind CSS 4 | Styling |
| Socket.IO Client | Real-time WebSocket |
| Axios | HTTP client |
| vite-plugin-pages | File-based routing |
| unplugin-auto-import | Vue/Router/Pinia auto-imports |

---

## Arxitektura

### Backend tuzilishi

```
backend/src/
├── common/
│   ├── dto/                     # ErrorResponseDto
│   ├── entities/                # BaseEntity (int ID), BaseUuidEntity (UUID)
│   ├── filters/                 # HttpExceptionFilter (lokalizatsiya: uz/ru/en/cyr)
│   ├── interceptors/            # IdempotencyInterceptor
│   ├── middlewares/              # LoggerMiddleware (file rotation, sensitive redaction)
│   ├── pipes/                   # ValidationPipe (whitelist, transform)
│   └── utils/                   # IP extraction, YAML config loader
├── config/
│   ├── swagger.config.ts        # Swagger UI setup
│   └── yml/application.yml      # Barcha konfiguratsiya (DB, Redis, JWT, CORS, admin)
├── database/
│   ├── database.module.ts       # TypeORM PostgreSQL ulanishi
│   ├── redis.module.ts          # Redis (ioredis) global provider (REDIS_CLIENT)
│   └── seed.ts                  # 80 ta o'rindiq yaratish (8 qator × 10 o'rindiq)
└── modules/
    ├── auth/                    # Autentifikatsiya moduli
    ├── user/                    # Foydalanuvchi CRUD
    ├── seats/                   # O'rindiqlar moduli
    ├── reservations/            # Rezervatsiya moduli
    └── events/                  # WebSocket gateway
```

### Frontend tuzilishi

```
frontend/src/
├── assets/style.css             # Global CSS, seat animatsiyalari, minimalist B&W tema
├── components/icons/            # SVG ikonkalar (tabler, carbon, fa)
├── composables/
│   ├── useAuthentication.ts     # Auth tekshiruv
│   ├── useCountdown.ts          # Reaktiv countdown timer (MaybeRefOrGetter)
│   ├── useDarkMode.ts           # Qorong'i/yorug' rejim
│   ├── usePaginationQuery.ts    # Paginatsiya wrapper
│   └── useSocket.ts             # WebSocket seat:updated / seat:bulk-updated + reconnect refetch
├── layouts/
│   ├── default.vue              # Auth sahifalari uchun (minimal)
│   ├── client.vue               # Foydalanuvchi (navbar + footer, marketplace style)
│   └── dashboard.vue            # Admin (sidebar + header)
├── middleware/
│   ├── auth.ts                  # Login sahifalardan redirect
│   ├── user.ts                  # Foydalanuvchi himoyasi
│   └── admin.ts                 # Admin himoyasi
├── pages/                       # File-based routing
│   ├── auth/                    # Login, Register, Admin Login
│   ├── seats/                   # O'rindiqlar xaritasi (client)
│   ├── reservations/            # Mening rezervatsiyalarim
│   └── dashboard/               # Admin panel (stats, seats, users, admins)
├── plugins/
│   ├── axios.ts                 # Bearer token, 401 refresh, queue
│   └── socket.ts                # Socket.IO singleton (/seats namespace, auto-reconnect)
├── services/
│   ├── auth/                    # login, adminLogin, register, refreshToken
│   ├── user/                    # getProfile
│   ├── seats/                   # getAllSeats
│   ├── reservations/            # reserve, confirm, cancel, getMyReservations
│   └── admin/                   # users CRUD, admins CRUD, changeStatus
├── stores/
│   ├── auth.store.ts            # user, tokens, isAdmin/isUser, logout
│   └── seats.store.ts           # seats[], selectedSeatId, seatsByRow, stats, patchSeatLocally (optimistic)
└── utils/
    ├── http-client.ts           # Axios wrapper (URL builder, 401 retry)
    ├── handleError.ts           # Error notification
    └── query-client.ts          # TanStack Query config
```

---

## Ma'lumotlar bazasi sxemasi

### users jadvali
| Ustun | Turi | Izoh |
|---|---|---|
| id | integer (PK, auto-increment) | |
| name | varchar(150) | |
| email | varchar (UNIQUE) | |
| password_hash | varchar | Bcrypt hash |
| role | enum(USER, ADMIN) | |
| status | enum(ACTIVE, INACTIVE) | |
| created_at | timestamptz | |
| updated_at | timestamptz | |
| deleted_at | timestamptz | Soft delete |

### seats jadvali
| Ustun | Turi | Izoh |
|---|---|---|
| id | uuid (PK) | |
| label | varchar(10) UNIQUE | "A1", "B5" |
| row | varchar(5) | "A"-"H" |
| number | smallint | 1-10 |
| status | enum(AVAILABLE, RESERVED, CONFIRMED) | |
| category | enum(VIP, PREMIUM, STANDARD, ECONOMY) | |
| price | integer | Narxi (cent) |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Indekslar**: IDX_seat_status, IDX_seat_category, UQ_one_active_reservation_per_seat (partial unique)

### reservations jadvali
| Ustun | Turi | Izoh |
|---|---|---|
| id | uuid (PK) | |
| seat_id | uuid (FK → seats.id) | |
| user_id | integer (FK → users.id) | |
| status | enum(RESERVED, CONFIRMED, EXPIRED, CANCELLED) | |
| expires_at | timestamptz | Band qilish muddati |
| idempotency_key | varchar(255) | Takroriy so'rovlardan himoya |
| created_at | timestamptz | |
| updated_at | timestamptz | |

**Indekslar**: IDX_reservation_seat_status, IDX_reservation_user_status, IDX_reserved_expiring (partial), IDX_user_active_reservation (partial)

### Idempotency cache (Redis)

Idempotency kalitlari endi PostgreSQL jadvalda emas, **Redis** da saqlanadi:

| Kalit | Turi | Izoh |
|---|---|---|
| `{idempotency-key}` | JSON string | `{ statusCode, response }` |

- TTL: 24 soat (`EX 86400`)
- Atomic yozish: `SET key value EX 86400 NX` (faqat mavjud bo'lmasa)
- Avtomatik tozalash: Redis TTL orqali (cron kerak emas)

---

## API Endpointlari

### Autentifikatsiya (`/api/v1/auth`)
| Metod | Yo'l | Auth | Vazifa |
|---|---|---|---|
| POST | /auth/register | Yo'q | Ro'yxatdan o'tish |
| POST | /auth/login | Yo'q | Foydalanuvchi kirish |
| POST | /auth/admin-login | Yo'q | Admin kirish |
| POST | /auth/refresh | Yo'q | Token yangilash (X-Refresh-Token header) |

### O'rindiqlar (`/api/v1/seats`)
| Metod | Yo'l | Auth | Vazifa |
|---|---|---|---|
| GET | /seats | Yo'q | Barcha o'rindiqlarni olish (rezervatsiyalar bilan) |

### Rezervatsiyalar (`/api/v1/reservations`)
| Metod | Yo'l | Auth | Vazifa |
|---|---|---|---|
| POST | /reservations/reserve | Ha | O'rindiqni band qilish (Idempotency-Key) |
| POST | /reservations/confirm | Ha | Rezervatsiyani tasdiqlash |
| POST | /reservations/cancel | Ha | Rezervatsiyani bekor qilish |
| GET | /reservations/my | Ha | Mening rezervatsiyalarim |

### Foydalanuvchilar boshqaruvi (`/api/v1/user`)
| Metod | Yo'l | Auth | Role | Vazifa |
|---|---|---|---|---|
| GET | /user/profile | Ha | - | O'z profilini olish |
| GET | /user | Ha | ADMIN | Barcha foydalanuvchilar (pagination, search) |
| POST | /user | Ha | ADMIN | Foydalanuvchi yaratish |
| PUT | /user/:id | Ha | ADMIN | Foydalanuvchini tahrirlash |
| PUT | /user/change-status/:id | Ha | ADMIN | Statusni o'zgartirish |
| DELETE | /user/:id | Ha | ADMIN | O'chirish (soft delete) |

### Adminlar boshqaruvi (`/api/v1/admin`)
| Metod | Yo'l | Auth | Role | Vazifa |
|---|---|---|---|---|
| GET | /admin | Ha | ADMIN | Barcha adminlar |
| POST | /admin | Ha | ADMIN | Admin yaratish |
| PUT | /admin/:id | Ha | ADMIN | Admin tahrirlash |
| PUT | /admin/change-status/:id | Ha | ADMIN | Statusni o'zgartirish |
| DELETE | /admin/:id | Ha | ADMIN | O'chirish (soft delete) |

---

## Asosiy funksiyalar va ularning yechimi

### 1. Real-time o'rindiq yangilanishi

**Muammo**: Bir foydalanuvchi o'rindiq band qilganda, boshqa foydalanuvchilar darhol ko'rishi kerak.

**Yechim**: Socket.IO WebSocket gateway `/seats` namespace orqali `seat:updated` va `seat:bulk-updated` eventlarni broadcast qiladi. Frontend `useSocket` composable orqali tinglaydi va Pinia store ni darhol yangilaydi.

```
Backend: ReservationsService → EventsGateway.emitSeatUpdate()
   ↓ WebSocket (seat:updated / seat:bulk-updated)
Frontend: useSocket → seatsStore.patchSeatFromSocket(seatId, patch)
   ↓ Reactivity
UI: SeatIcon avtomatik yangi status ko'rsatadi
```

### 2. Rezervatsiya muddati (2 daqiqa countdown)

**Muammo**: Band qilingan o'rindiq tasdiqlash kutilganda, boshqa foydalanuvchilarni to'smasligi kerak.

**Yechim**:
- Backend: `expiresAt = NOW + 120 soniya` bilan reservation yaratadi
- Backend: `@Cron(EVERY_30_SECONDS)` bilan muddati o'tgan rezervatsiyalarni EXPIRED ga o'tkazadi
- Backend: Lazy expiration — yangi reserve so'rovida muddati o'tgan RESERVED ni darhol EXPIRED qiladi
- Frontend: `useCountdown(MaybeRefOrGetter)` composable reaktiv countdown timer ko'rsatadi
- Frontend: Countdown tugaganda "Confirm" tugmasi disabled bo'ladi

**Expiration strategiyasi tanlash asosi**:

| Variant | Afzalligi | Kamchiligi |
|---------|-----------|------------|
| Cron job | Oddiy, ishonchli, batch tozalash | Interval oralig'ida kechikish |
| Lazy expiration | Request kelganda darhol | Hech kim so'ramasa seat RESERVED qoladi |
| Redis TTL | Aniq vaqtda tetiklanadi | Keyspace Notification at-most-once, ishonchsiz |
| Background worker | Mustaqil, scale mumkin | 80 seat uchun ortiqcha infra |

Cron + Lazy hybrid tanlandi: Cron asosiy tozalash, Lazy 0-30s gap ni yopadi. Redis TTL ishonchsiz (xabar yo'qolishi mumkin), worker esa kichik loyiha uchun ortiqcha.

### 3. Race condition himoyasi

**Muammo**: Ikki foydalanuvchi bir vaqtda bitta o'rindiqni band qilishga harakat qilishi mumkin.

**Yechim**:
- `READ COMMITTED` tranzaksiya izolyatsiyasi
- Pessimistic write lock (`FOR UPDATE`) seat va reservation yozuvlarida
- Partial unique index: `UQ_one_active_reservation_per_seat` — bitta o'rindiqda faqat bitta aktiv rezervatsiya

### 4. Idempotentlik (takroriy so'rovlar himoyasi)

**Muammo**: Foydalanuvchi "Reserve" tugmasini tez-tez bossa yoki tarmoq xatosi bo'lsa, takroriy rezervatsiyalar yaratilishi mumkin.

**Yechim**:
- Frontend: `Idempotency-Key` header bir marta generatsiya qilinadi (composable darajasida) va shu key qayta ishlatiladi
- Backend: `IdempotencyInterceptor` Redis dan key ni tekshiradi — agar mavjud bo'lsa, cached javobni qaytaradi
- Key Redis da 24 soat TTL bilan saqlanadi (`SET key value EX 86400 NX`), avtomatik tozalanadi (cron kerak emas)

### 5. Optimistic Updates (UI)

**Muammo**: API javobini kutish UX ni sekinlashtiradi — foydalanuvchi tugmani bosganda 200-500ms kutishi kerak.

**Yechim**:
- `seatsStore.patchSeatLocally(seatId, patch)` — o'rindiq statusini darhol mahalliy yangilaydi va rollback funksiya qaytaradi
- Reserve/Confirm/Cancel amallarida: avval UI yangilanadi, keyin API so'rov yuboriladi
- Xatolik bo'lsa: rollback funksiya chaqirilib, eski holat tiklanadi
- Muvaffaqiyatli bo'lsa: `queryClient.invalidateQueries()` orqali server ma'lumotlari yangilanadi

```
Foydalanuvchi "Reserve" bosdi
   ↓ (darhol)
UI: seat.status = RESERVED (optimistic)
   ↓ (parallel)
API: POST /reservations/reserve
   ├── Muvaffaqiyat → invalidateQueries (server data replaces optimistic)
   └── Xatolik → rollback() → UI: seat.status = AVAILABLE (qaytarildi)
```

### 6. WebSocket Reconnection

**Muammo**: Tarmoq uzilib qayta ulanganida, foydalanuvchi eskirgan ma'lumotlar ko'rishi mumkin.

**Yechim**:
- Socket.IO konfiguratsiyasida reconnection yoqilgan: `reconnectionAttempts: Infinity`, `reconnectionDelay: 1-5s`
- `useSocket` composable `connect` eventni tinglaydi — qayta ulanishda (birinchi ulanishdan tashqari) barcha seats va reservations so'rovlarini yangilaydi
- `queryClient.invalidateQueries({ queryKey: ["seats"] })` va `["my-reservations"]`

### 7. Docker Setup

**Muammo**: Loyihani ishga tushirish uchun PostgreSQL, Redis, Node.js o'rnatish va sozlash kerak.

**Yechim**: `docker-compose.yml` barcha 4 xizmatni bir buyruq bilan ishga tushiradi:

| Xizmat | Image | Port | Vazifa |
| --- | --- | --- | --- |
| postgres | postgres:16-alpine | 5432 | Ma'lumotlar bazasi |
| redis | redis:7-alpine | 6379 | Idempotency cache |
| backend | node:20-alpine (build) | 8080 | NestJS API + WebSocket |
| frontend | nginx:alpine (build) | 80 | Vue SPA + reverse proxy |

```bash
docker-compose up --build    # Barcha xizmatlarni ishga tushirish
# http://localhost            # Frontend (Nginx)
# http://localhost:8080       # Backend (to'g'ridan-to'g'ri)
```

Nginx konfiguratsiyasi:
- `/` → SPA static fayllar (`try_files $uri $uri/ /index.html`)
- `/api` → `http://backend:8080` (reverse proxy)
- `/socket.io` → `http://backend:8080` (WebSocket upgrade headerlari bilan)

### 8. Token yangilash va autentifikatsiya

**Muammo**: Access token muddati tugaganda foydalanuvchi qayta login qilmasligi kerak.

**Yechim**:
- `httpClient` 401 javob olsa → `ensureTokenRefreshed()` chaqiradi
- `POST /auth/refresh` ga `X-Refresh-Token` header bilan so'rov
- Yangi access va refresh tokenlar localStorage ga saqlanadi
- Asl so'rov qayta yuboriladi
- Refresh queue — parallel 401 lar uchun bitta refresh so'rov

### 9. Xavfsizlik

**Yechimlar**:
- JWT Bearer token autentifikatsiya
- Role-based access control (USER/ADMIN)
- Bcrypt parol hashing
- Helmet security headers
- CORS konfiguratsiya
- Input validatsiya (class-validator, whitelist mode)
- Soft delete (foydalanuvchilar hech qachon butunlay o'chirilmaydi)
- Sensitive data redaction (logda parollar ko'rinmaydi)

### 10. Xatoliklarni ko'rsatish

**Muammo**: Xatolik xabari ikki marta ko'rinmasligi kerak.

**Yechim**: `httpClient` xatolikni faqat `throw` qiladi, `handleError()` faqat composable/component darajasida chaqiriladi — bitta xatolik = bitta notification.

---

## Sahifalar va UI

### Foydalanuvchi sahifalari

| Sahifa | Route | Tavsif |
|---|---|---|
| Login | `/auth/login` | Minimalist B&W dizayn, email/parol, admin login linki |
| Register | `/auth/register` | Ro'yxatdan o'tish formasi, parol validatsiya |
| Admin Login | `/auth/admin-login` | Qorong'i minimalist dizayn, qalqon ikonka |
| Seat Map | `/seats` | Zal ko'rinishi: Stage, qatorlar, SVG seat ikonkalar, filter, detail panel |
| My Reservations | `/reservations` | Kartalar ro'yxati, All/Active/Past tablar, countdown, confirm/cancel |

### Admin sahifalari

| Sahifa | Route | Tavsif |
|---|---|---|
| Dashboard | `/dashboard` | Statistika kartalari + zal ko'rinishidagi seat grid + detail panel |
| Seats | `/dashboard/seats` | Zal ko'rinishi + category/status filterlar + detail panel |
| Users | `/dashboard/users` | DataTable + search + create/edit modal + status toggle + delete |
| Admins | `/dashboard/admins` | DataTable + search + create/edit modal + status toggle + delete |

### Layout'lar

| Layout | Ishlatiladi | Tavsif |
|---|---|---|
| default | Auth sahifalari | Minimal, faqat content |
| client | /seats, /reservations | Sticky navbar (logo, nav, dark mode, user dropdown) + footer |
| dashboard | /dashboard/* | Sidebar (collapse qiluvchi) + header (breadcrumbs, dark mode, user) |

---

## O'rindiq dizayni

Har bir o'rindiq SVG ikonka sifatida tasvirlanadi — real teatr o'rindig'i ko'rinishida:
- **Suyanch** (backrest) — yuqori qism
- **O'tirg'ich** (cushion) — o'rta qism
- **Qo'l dayamalari** (armrests) — yon tomonlar
- **Oyoqlar** (legs) — pastki qism

**Ranglar (kategoriya bo'yicha)**:
- VIP: oltin (#F59E0B)
- Premium: binafsha (#8B5CF6)
- Standard: ko'k (#3B82F6)
- Economy: yashil (#10B981)

**Statuslar (vizual)**:
- AVAILABLE: to'liq rang, soya
- RESERVED: yarim shaffof (opacity 0.5), pulsatsiya animatsiya
- CONFIRMED: qorong'i overlay + qulf ikonka

**Interaktivlik**:
- Hover: tooltip (label, category, narx, status)
- Click: tanlash, detail panel ochiladi
- Real-time: WebSocket orqali boshqalar band qilganda darhol ko'rinadi

---

## O'rindiq joylashuvi (Seed)

```
      ┌──────────── STAGE ────────────┐

  A   [VIP     ] [VIP     ] ... × 10    $10.00
  B   [VIP     ] [VIP     ] ... × 10    $10.00
  C   [PREMIUM ] [PREMIUM ] ... × 10    $7.50
  D   [PREMIUM ] [PREMIUM ] ... × 10    $7.50
  E   [STANDARD] [STANDARD] ... × 10    $5.00
  F   [STANDARD] [STANDARD] ... × 10    $5.00
  G   [ECONOMY ] [ECONOMY ] ... × 10    $3.00
  H   [ECONOMY ] [ECONOMY ] ... × 10    $3.00

  Jami: 80 o'rindiq
```

---

## Rezervatsiya holatlari diagrammasi

```
  ┌─────────────┐
  │  AVAILABLE  │ ← bekor qilinganda / muddati tugaganda
  └──────┬──────┘
         │ reserve (2 daqiqa)
         ▼
  ┌─────────────┐
  │  RESERVED   │──── 2 daqiqa o'tsa ──→ EXPIRED
  └──────┬──────┘
         │ confirm                          │ cancel
         ▼                                  ▼
  ┌─────────────┐                    ┌─────────────┐
  │  CONFIRMED  │                    │  CANCELLED  │
  └─────────────┘                    └─────────────┘
         │ cancel
         ▼
  ┌─────────────┐
  │  CANCELLED  │
  └─────────────┘
```

---

## Route xaritasi

| Route | Layout | Middleware | Komponent |
|---|---|---|---|
| `/` | default | — | → redirect `/seats` |
| `/auth/login` | default | auth | LoginPage |
| `/auth/register` | default | — | RegisterPage |
| `/auth/admin-login` | default | auth | AdminLoginPage |
| `/seats` | client | user | SeatsPage (zal ko'rinishi) |
| `/reservations` | client | user | ReservationsPage (kartalar) |
| `/dashboard` | dashboard | admin | DashboardPage (stats + zal) |
| `/dashboard/seats` | dashboard | admin | AdminSeatsPage (zal + filterlar) |
| `/dashboard/users` | dashboard | admin | UsersPage (jadval + CRUD) |
| `/dashboard/admins` | dashboard | admin | AdminsPage (jadval + CRUD) |

---

## Komponent fayl strukturasi (pattern)

Har bir sahifa quyidagi pattern ga amal qiladi:

```
pages/<section>/
├── index.vue                              # Route wrapper (<route> block)
└── components/
    ├── <section>-page/
    │   ├── <SectionPage>.vue              # Template (UI)
    │   ├── use<SectionPage>.ts            # Logic (composable)
    │   └── index.ts                       # Re-export
    ├── <sub-component>/
    │   ├── <SubComponent>.vue
    │   ├── use<SubComponent>.ts
    │   ├── <sub-component>.types.ts
    │   └── index.ts
    └── index.ts                           # Barrel export
```

---

## Xulosa

| Talab | Holat | Yechim |
|---|---|---|
| JWT autentifikatsiya | ✅ | Bearer token, refresh, role-based guards |
| Real-time yangilanish | ✅ | Socket.IO WebSocket (`seat:updated`, `seat:bulk-updated`) |
| O'rindiqni band qilish | ✅ | 2 daqiqa countdown, READ COMMITTED tranzaksiya, pessimistic lock |
| Idempotentlik (Redis) | ✅ | `Idempotency-Key` header, Redis cache 24h TTL (auto-expiry) |
| Race condition himoyasi | ✅ | Pessimistic lock + partial unique index |
| Muddati tugash (expiration) | ✅ | Cron job (har 30 soniya), lazy expiration |
| Optimistic updates | ✅ | UI darhol yangilanadi, xatolikda rollback |
| WebSocket reconnection | ✅ | Auto-reconnect (1-5s), qayta ulanishda refetch |
| Docker setup | ✅ | docker-compose: PostgreSQL, Redis, Backend, Frontend (Nginx) |
| Admin panel | ✅ | Dashboard, seats (zal ko'rinishi), users CRUD, admins CRUD |
| Foydalanuvchi panel | ✅ | Seat map (zal ko'rinishi), rezervatsiyalar, countdown timer |
| Responsive dizayn | ✅ | Desktop/tablet/mobile, Tailwind CSS |
| Dark mode | ✅ | localStorage, Naive UI theme, toggle |
| Xatolik boshqaruvi | ✅ | Lokalizatsiya (4 til), bitta notification |
| Parol validatsiya | ✅ | 8+ belgi, katta/kichik harf, raqam, maxsus belgi |
| Swagger dokumentatsiya | ✅ | `/api-docs`, JWT auth, error schemas |
| Logo | ✅ | SVG seat logo (black) |
| Logging | ✅ | File rotation, sensitive redaction, request/response logging |
| Soft delete | ✅ | Foydalanuvchilar o'chirilganda `deleted_at` belgilanadi |

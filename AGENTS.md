# Quraishi Property Dealers Shop — Base44 dev environment

Non-obvious setup knowledge for this imported app.

## Stack
- Next.js 14 (App Router, JS not TS) + better-sqlite3. Single service, single origin (Next dev server serves API routes on the same port 3000).
- Database: SQLite file at `/app/data/shop.db` (compose named volume `appdata`). Seeded with 8 sample Kabul properties automatically on first boot when the table is empty. Reset data by deleting the volume (`docker compose -f docker-compose.base44.yml down -v`).
- Admin dashboard at `/admin` — session cookie contains a SHA-256 token derived from `ADMIN_PASSWORD`. Login page: `/admin/login`.

## Run
- `docker compose -f docker-compose.base44.yml up -d --build` — installs deps via `npm install` at container start (package.json + lockfile are bind-mounted), then runs `npm run dev` (`next dev -H 0.0.0.0 -p 3000`).
- Verify: `docker compose -f docker-compose.base44.yml ps` (healthcheck = node fetch of `/`), then `curl -s http://localhost:3000/ | head -40`.

## Secrets
- `ADMIN_PASSWORD` — required at boot (admin login has no fallback). Generated development placeholder lives in `/run/base44/app.env` (never in the repo).
- `FACEBOOK_PAGE_URL` — optional; when set, a "Follow us on Facebook" footer link appears (user's Facebook page).
- `GOOGLE_SHEETS_ID` + `GOOGLE_SERVICE_ACCOUNT_EMAIL` + `GOOGLE_PRIVATE_KEY` — optional; when all three are set, every inquiry is appended to that Google Sheet (`src/lib/googleSheets.js`, service-account JWT, no extra npm deps). Missing credentials = sync silently skipped; sheets errors are logged, the inquiry is still saved in SQLite.

## Data
- No demo/seed data. Listings are added by the owner via `/admin` (dashboard form, image by URL).

## Sandbox-only overrides (gated on `BASE44_PREVIEW_MODE === "1"`)
- `next.config.mjs` appends `3000-$BASE44_PUBLIC_HOST_SUFFIX` and `.$BASE44_SANDBOX_HOST_DOMAIN` to `allowedDevOrigins` so the preview proxy can load dev assets/HMR. With the flag unset the list is empty (stock Next behavior).
- Compose passes `BASE44_PREVIEW_MODE`, `BASE44_PUBLIC_HOST_SUFFIX`, `BASE44_SANDBOX_HOST_DOMAIN` through as bare entries.

## Verify the app works
- `curl http://localhost:3000/` → HTML containing "Quraishi Property Dealers Shop" and property cards.
- `curl http://localhost:3000/api/properties` → JSON list of seeded properties.
- Post an inquiry: `curl -s -X POST http://localhost:3000/api/inquiries -H 'Content-Type: application/json' -d '{"propertyId":1,"name":"Test","phone":"070000000"}'`.
- Admin APIs (`/api/admin/*`) return 401 without the session cookie.

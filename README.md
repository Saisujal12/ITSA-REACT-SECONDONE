# IT Association KITSW — React website

React + Vite + React Router rebuild of the IT Association website (previously
static HTML/CSS/JS in the `IT-Association-` repository). Content, visual
identity, registration flow and admin tools were migrated as-is; the Express
backend is unchanged and still lives in `IT-Association-/backend`.

## Running locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run lint
npm run build      # production build in dist/
npm run preview    # serve the production build
```

The site calls the backend at `/api/...`. In development and preview, Vite
proxies `/api` to `http://127.0.0.1:5000` (see `vite.config.js`), which keeps
the admin session cookie first-party. Start the backend separately:

```bash
cd ../IT-Association-/backend
npm install
npm run dev        # needs its .env and Google service-account file
```

> macOS: the AirPlay Receiver also listens on port 5000. If the backend fails
> to start or the proxy reaches AirPlay, disable AirPlay Receiver or run the
> backend on another port (`PORT=5050`) and set `DEV_API_PROXY_TARGET`.

### Environment (`.env`, see `.env.example`)

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Backend base URL used by the browser. Empty = same-origin `/api` (recommended). |
| `DEV_API_PROXY_TARGET` | Where the dev/preview server proxies `/api`. Default `http://127.0.0.1:5000`. |

### Deployment

The app is a single-page app: the host must serve `index.html` for every
unknown path so deep links and the legacy `.html` URLs resolve. Either serve
the site and the API from the same origin (reverse proxy `/api` to Express),
or set `VITE_API_URL` and configure CORS/cookies for cross-site use
(backend change — see "Deferred backend work").

## Routes

| Route | Legacy page |
| --- | --- |
| `/` | `index.html` |
| `/sumshodhini` | `pages/sumshodini.html` |
| `/about` | `pages/about.html` |
| `/association` | `pages/association.html` |
| `/events` | `pages/events.html` |
| `/workshops` | `pages/workshop.html` |
| `/gallery` | `pages/gallery.html` |
| `/register` | `pages/register.html` |
| `/contact` | `pages/contact.html` |
| `/admin/login`, `/admin` | `pages/admin-login.html`, `pages/admin-dashboard.html` |

`/index.html`, every `/pages/*.html` URL and the spelling variants
`/samshodini`, `/sumshodini`, `/samshodhini` redirect to the new routes,
keeping query strings and hashes (`/pages/register.html?event=llm` →
`/register?event=llm`).

Registration keeps the legacy query contract: `/register`,
`/register?day=day2`, `/register?day=day1`, `/register?event=<id>&from=<day2|events|workshops|day1>`.

## Project structure

```
src/
  assets/images/   brand, gallery, posters, qr, team (optimised WebP; EXIF/GPS stripped)
  components/      layout (Navbar, Footer, layouts), ui, and page-specific components
  data/            site, navigation, events, workshops, team, gallery — all content lives here
  hooks/           reveal, carousel, 3D tilt, magnetic, media queries, visibility, …
  pages/           one component + CSS Module per route (admin/ for the admin area)
  services/        api.js (fetch wrapper), registrations.js, admin.js
  styles/          tokens, reset, typography, shared primitives, motion
  utils/           asset resolver, validation, registration routing, cx
```

## Updating content

- **Events / workshops** — `src/data/events.js` is the single source for the
  events page, workshops page and registration. Entries marked `verify` have
  two differing legacy descriptions; both are kept until the team picks one.
- **Registration fees** — every event has `fee: null`. The backend requires an
  `amount`, so the form shows "Registration fee not yet announced" and
  cannot be submitted until a verified fee (a number in rupees) is added.
- **Team** — `src/data/team.js`. Add real names to `PEOPLE`; they appear on
  both the About and Association pages. Placeholder names from the legacy
  site (`HOD NAME`, `Joint Secretary 1`, …) are shown until then.
- **Previous workshops** — `src/data/workshops.js` holds the legacy sample
  records (`sample: true`, labelled "Sample record" on the page).
- **Gallery** — `src/data/gallery.js`. Drive links set to `null` were
  placeholders and are hidden until real links are added.

## Adding missing images

Images are resolved by name from `src/assets/images` (`src/utils/assets.js`).
Drop a file with the expected name (`.png`, `.jpg` or `.webp`) and it appears
automatically — no code changes. Until then a designed placeholder is shown.

| Folder | Expected files |
| --- | --- |
| `qr/` | `workshop-qr`, `events-qr` (payment QR codes) |
| `posters/` | `llm-poster`, `code-build-poster`, `innovation-poster`, `cyber-quest-poster`, `design-deploy-poster`, `tech-connect-poster` |
| `gallery/` | `inaugural-1`, `inaugural-2`, `sumshodini-workshop-1` … `sumshodini-workshop-6` |
| `team/` | `hod`, `faculty-coordinator-1`, `faculty-coordinator-2`, `president`, `student-coordinator`, `vice-president`, `general-secretary`, `treasurer`, `pr-media`, `technical-head` (+ `<role>-name` images), `joint-secretary-01` … `12`, `executive-member-01` … `12` |

Large photos: provide `name-800.webp` and `name-1600.webp` to get a
responsive `srcset`, or a single file (it is used as-is).

## Deferred backend work (not part of the migration)

The backend was intentionally left unchanged. Issues found for a separate
hardening pass:

1. Registration values are written to Google Sheets with `USER_ENTERED`, so
   a value starting with `=` is evaluated as a formula (formula injection).
   The frontend validation rejects such names/branches, but the API must
   enforce it too.
2. `GET /api/test-email` is unauthenticated and sends mail to a hard-coded
   address.
3. CORS reflects any origin with credentials (`origin: true`).
4. No rate limiting on `/api/admin/login`; plain-text credential comparison.
5. Session cookie has `secure: false`; `SESSION_SECRET` is not validated at startup.
6. No server-side length/format validation on registration fields.
7. Registration IDs use 4 random digits (collisions possible); no duplicate
   UTR/submission check.
8. Status updates address Sheet rows by row number, which breaks if the
   sheet is sorted or edited.
9. `/api/admin/check` returns 401 when logged out, which browsers log as a
   failed request in the console on the admin login redirect.

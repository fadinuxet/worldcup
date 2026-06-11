# My World Cup 2026 ⚽

A simple, friend-shareable FIFA World Cup 2026 web app: **all 48 teams, all 104 matches, live
scores, follow your teams, and web-push match alerts.** No accounts, no login — follows are saved
in your browser. Installable as a PWA.

Live data comes from ESPN's free public API (no key). The server polls and caches it; visitors only
ever hit this app's own API, so the upstream is queried politely regardless of traffic.

## Stack
- **Backend:** Node + Express (one service, no database). In-memory cache + two pollers
  (full fixtures every 10 min, live scores every 25 s).
- **Frontend:** static HTML/CSS/JS in the "Pitch Velocity" design (Tailwind via CDN, dark mode), PWA.
- **Notifications:** Web Push (VAPID). A small JSON subscription store persists on a volume.

## Run locally
```bash
npm install
npm start            # http://localhost:3000
```
Useful env:
- `LIVE_FEED=all` — point the live poller at ESPN's all-soccer feed so you can see live cards
  before the tournament starts (verification aid).
- Web push (optional locally): set `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`
  (generate a pair with `node -e "console.log(require('web-push').generateVAPIDKeys())"`).
- `DATA_DIR` — where the push subscription store lives (default `./data`; set to a mounted volume in prod).

## API
| Endpoint | Description |
|---|---|
| `GET /api/health` | readiness, counts, freshness |
| `GET /api/teams` | 48 teams (id, name, abbr, logo, group) |
| `GET /api/groups` | 12 groups + computed standings |
| `GET /api/matches` | all matches; filters `?team= ?status=in\|pre\|post ?stage= ?date=` |
| `GET /api/live` | in-progress matches (polled by the client) |
| `GET /api/push/key` · `POST /api/push/subscribe` · `POST /api/push/unsubscribe` | web push |

## License
MIT. Not affiliated with FIFA. Data via ESPN's public endpoints.

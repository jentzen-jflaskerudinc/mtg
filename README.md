# MTG Commander Life Tracker

Real-time life tracker: each player controls their own life from their phone, a Firestick displays everything live. WebSocket sync — updates hit the TV in well under 150ms, no refreshing ever.

## Pages

| URL | Who | What |
|---|---|---|
| `/` | Players | Join with name + commander (Scryfall search), big +/− life buttons, commander damage per opponent, End Turn |
| `/tv` | Firestick | 4 corners with life, name, commander art. Center: turn number, turn order, active player's full card art. Shows a QR code to join when the game is empty |
| `/` → ⚙ master | You | Enter PIN to unlock override: adjust anyone's life, force turns, set active player, remove players, reset life, new game |

## Deploy to Render

1. Push this folder to a GitHub repo.
2. Render dashboard → **New → Web Service** → connect the repo.
3. Settings:
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Environment variable:** `MASTER_PIN` = your secret PIN (defaults to `1234` if unset — change it!)
4. Deploy. Your URL will be something like `https://mtg-life.onrender.com`.

Game night: open `https://your-app.onrender.com/tv` in the Firestick's Silk browser. Players scan the QR code shown on the TV.

## Run locally

```bash
npm install
MASTER_PIN=9999 npm start   # http://localhost:3000
```

Test suite: start the server, then `node test.js` (expects PIN 1234, i.e. default).

## Notes

- **Free tier:** Render spins down after ~15 min idle; first visit takes ~30-60s to wake. Active WebSocket connections keep it awake during games.
- **State is in memory.** A server restart mid-game resets it (master panel → players rejoin in ~30 seconds since names are remembered on each phone). Restarts during an active game are rare because connections keep the service alive.
- **Rules built in:** 40 starting life; commander damage tracked per opponent, mirrors onto life, 21+ flagged lethal on the TV; players at 0 life or lethal commander damage grey out on the TV.
- Player identity is stored in the phone's localStorage — refreshing or reopening the page reclaims your seat automatically.
- Supports up to 6 players (5th/6th get side panels on the TV).

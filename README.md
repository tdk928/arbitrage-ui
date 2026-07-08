# Arbitrage UI

React frontend for the [arbitrage](https://github.com/tdk928/arbitrage) scraper backend.

## Backend endpoints used

- `POST http://localhost:8000/arbitrage/v3/run` — trigger a scrape
- `GET http://localhost:8000/arbitrage/v3/top10` — read top 10 arbitrage bets from the database

## Quick start

```bash
npm install
npm run dev
```

The dev server proxies `/arbitrage` requests to `http://localhost:8000`, so start the backend first:

```bash
cd ../arbitrage && source .venv/bin/activate
uvicorn api.main:app --reload --port 8000
```

## Branches

- `main` — production
- `test` — testing
- `development` — active development (feature branches start here)

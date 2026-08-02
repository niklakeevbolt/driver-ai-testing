# Driver AI Testing

Standalone Bolt Driver App Redesign prototype — no playground or Bolt npm dependencies. Icons and illustrations are vendored locally under `src/vendor` and `src/assets`.

## Markets

Each market has its own URL with local currency, campaigns, map location, addresses, and acceptance/cancellation metrics:

| Market | Capital | Currency | URL |
|---|---|---|---|
| United Kingdom | London | GBP (£) | https://niklakeevbolt.github.io/driver-ai-testing/UK |
| Romania | Bucharest | RON (lei) | https://niklakeevbolt.github.io/driver-ai-testing/Romania |
| South Africa | Johannesburg | ZAR (R) | https://niklakeevbolt.github.io/driver-ai-testing/SouthAfrica |

Root URL shows a market picker.

## Password

Default: `driver-ai`

Set GitHub repository secret `SITE_PASSWORD` to change it for production deploys.

## Local dev

```bash
npm install
npm run dev
```

Then open `http://localhost:5174/UK`, `/Romania`, or `/SouthAfrica`.

## Deploy

Push to `main` — GitHub Actions builds and publishes to GitHub Pages automatically.

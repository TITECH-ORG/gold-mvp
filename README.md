# Goldex MVP (PWA)

Minimal PWA prototype for a multi-language gold trading experience (English / Turkish / Arabic) with country-specific compliance flows for Turkey and the UAE.

## Run locally

```bash
npm install
npm run dev
```

Open the URL shown by Vite in Chrome. Use the "Install" option (or Add to Home Screen) to test PWA behavior.

## What’s included

- Country + language selection (TR/AE + EN/TR/AR)
- Onboarding carousel
- Auth flow (phone, OTP, password)
- Legal consents (terms, privacy, risk, AML/KYC)
- KYC/Identity verification flow
- Home with live price ticker (demo or API)
- Buy/Sell, Wallet, Deposit/Withdraw, Transfer, Physical Delivery
- Alerts, History, Services, Support, Legal screens
- Offline-ready PWA shell (manifest + service worker)

## Price feed integration

The UI expects an official licensed data feed. Configure in `src/config.js`:

```
priceFeed: {
  endpoint: 'https://your-backend.example.com/price'
}
```

The endpoint should return JSON like:

```
{ "price": 245.12, "change": 0.12 }
```

Note: Most official gold market data feeds require licensing and are not directly accessible from browsers (CORS + licensing). Use a server-side proxy.

## Legal & compliance

Legal text is a template and must be reviewed by local counsel. The UI assumes identity verification and AML/KYC monitoring are required by Turkey/UAE regulations. Replace all legal copy after review.

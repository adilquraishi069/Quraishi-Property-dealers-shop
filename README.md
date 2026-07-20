# قریشی پراپرٹی ڈیلرز — Property Management System

A complete, single-page property dealer management app for **Quraishi Property Dealers**, in Urdu (RTL). No build step, no backend — pure HTML/CSS/JS, data persisted in the browser via `localStorage`.

## Features

- **ڈیش بورڈ (Dashboard)** — live stats on rent/sale/mortgage listings, property-type breakdown, monthly income/expense summary, and recent listings.
- **نئی انٹری (Registration)** — register properties under three deal types with auto-generated codes: `ADR` (rent), `ADS` (sale), `ADG` (mortgage).
- **جائیدادیں (Properties)** — searchable/filterable property grid.
- **کلائنٹس (Clients / CRM)** — owners, buyers and tenants with one-tap call and WhatsApp links.
- **مالیات (Finance)** — income/expense ledger, net profit, and a commission calculator pre-loaded with standard dealer splits (house/flat/shop sale 1.5% at 50/50, land sale 1.25% at 55/45, rent = 1 month at 60/40), with one click to record a commission as income.
- **ٹولز (Tools)** — house measurement (sq ft → marla), rent calculator, installment calculator, and a property comparison table.
- **دستاویزات (Documents)** — per-property document tracking (verified/pending).
- **عملہ (HR)** — employee records, daily attendance marking, and estimated monthly salary (base salary minus attendance-based deduction).

## Running it

No build tools required. Just open `index.html` in a browser, or serve the folder statically:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

All data is seeded on first run and stored in your browser's `localStorage` — it persists across reloads on the same device/browser.

## Structure

```
index.html
assets/
  css/styles.css   — theme (navy & gold), layout, components
  js/data.js       — seed data + localStorage persistence
  js/app.js        — app state, routing, all screen rendering & logic
```

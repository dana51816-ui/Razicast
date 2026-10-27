# RAZICAST CONTROL

Business control room for RAZICAST (Hebrew, RTL, iPhone-first): instructors, frameworks,
activities, payouts, profitability, receipts and month close.

Design direction: **The Split** — stone ground, ink type, cobalt for the company's share,
sand for instructor payment, red only for real losses, amber dashed only for missing data.

**Current phase:** frontend with a real client-side data layer. No backend or auth yet.
Data persists in this browser's localStorage.

## Run

```bash
npm install
npm run dev            # http://localhost:3000
npm run build && npm start
npm run preview:build  # single-file preview → preview/dist/razicast-preview.html
```

User guide (Hebrew PDF): `docs/RAZICAST_CONTROL_Guide.pdf`. To rebuild it, run the app on
:3000 and `node docs/guide/build.mjs <fonts-dir> docs/RAZICAST_CONTROL_Guide.pdf` (the
script lists the woff2 files it expects; take them from `@fontsource/ibm-plex-sans-hebrew`
and `@fontsource/karantina`). It retakes the screenshots in `docs/guide/img` each run.

## Architecture

```
src/lib/types.ts        domain model (Instructor, Framework, Activity, ReceiptRecord, MonthRecord)
src/lib/seed.ts         demo data, each record tagged origin: "brief" | "sample"
src/lib/calc.ts         calculation engine: quoteActivity, totals, instructor status, flags
src/lib/audit.ts        month audit + home issues, generated from state (what / why / action)
src/lib/repository.ts   persistence interface; localStorage today, Supabase later
src/lib/store.tsx       one shared reducer + UI state (flows, add menu, toasts with undo)
src/lib/backup.ts       backup file (export / share / parse / restore), persistent storage
src/components/flows/   guided flows: activity (new / repeat / edit), activity card,
                        instructor, framework, resolve, backup & restore
app/                    /  /team  /instructor?id=…  /month
```

### Rules the code enforces

- `null` is unknown, never 0. Profit is computed only from activities where both revenue
  and instructor payment are known; everything else is reported as incomplete.
- Rates are never invented. Revenue = framework billing × quantity. Payment = instructor
  terms × quantity (+ travel), else the framework's default instructor rate, else the
  flow asks for the amount.
- Financial status (רווחי / הפסדי / מידע חסר) is separate from operational flags
  (קבלה חסרה, חסר תעריף, חסרה מסגרת).
- Whether missing receipts block closing is a setting (`receiptsBlockClosing`), off by default.

Swapping localStorage for Supabase means writing another `Repository` (or moving the
reducer's actions to API calls); `calc.ts` and `audit.ts` stay as they are.

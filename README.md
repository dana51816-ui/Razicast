# RAZICAST CONTROL

Internal business-management web app (Hebrew, RTL, mobile-first) for managing instructors,
monthly activity, payouts, profitability and receipts.

**Phase 1:** frontend only, running on realistic mock data. No backend, auth or Supabase yet.
All changes (new activity, marking a receipt as received, closing a month) live in memory
and reset when the page reloads.

## Stack

Next.js (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion · Recharts · Lucide

## Run

```bash
npm install
npm run dev        # http://localhost:3000
# or a production build:
npm run build && npm start
```

To open it on an iPhone, run `npm run dev -- -H 0.0.0.0` and browse to
`http://<your-computer-LAN-IP>:3000` from the phone. Then use "Add to Home Screen"
and it opens full screen like an app (manifest and safe-area handling are included).

## Structure

```
app/                     routes: / (ראשי), /activity, /instructors, /receipts, /close
src/lib/                 types, mock data, selectors (all numbers derived), store (context), formatting
src/components/ui/       design-system primitives (Sheet, Money, AnimatedNumber, MonthSelector, …)
src/components/shell/    sidebar (desktop), bottom nav (mobile), app shell
src/components/<screen>/ screen-specific components
```

All totals are computed from the activity log in `src/lib/data.ts`, so the dashboard,
instructor cards, receipts and month-close stay consistent when data changes.

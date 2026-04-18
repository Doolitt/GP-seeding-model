# GP Seeding Economics Model

A portfolio-level returns model for GP seeding investments. Model the economics of taking an initial ~25% stake in a GP management company across multiple seed deals, accounting for ownership step-down, management fee participation, carry participation, and terminal GP equity value.

Built with Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui primitives, and Recharts. No backend — all portfolio data persists in browser localStorage with JSON export/import.

## Features

- **Smart-default wizard** — Build a seed deal in under a minute with five key questions. Institutional defaults fill in the rest.
- **Full deal editor** — Slider + input pairs for every assumption. Add/remove funds freely. Toggle individual funds on/off. Edit the ownership step-down schedule.
- **Portfolio aggregation** — Run up to N seed deals and see combined IRR/MOIC, cumulative cash flows aligned on calendar year, per-deal contribution rankings, and vintage diversification.
- **Live preview** — Every input change recalculates the model instantly. No save-and-refresh loops.
- **Persistence** — Deals saved to localStorage. Export/import JSON for backup or device migration.
- **Single-deal output** — IRR/MOIC/Payback KPIs, annual + cumulative cash flow chart, source-of-value breakdown (fees/carry/terminal), ownership step-down visualization, full annual cash flow table.

## Quick start

```bash
# Install dependencies
npm install

# Run in dev mode
npm run dev
# → http://localhost:3000

# Production build
npm run build
npm start
```

Requires Node.js 18.17 or later.

## Deploying to Vercel

1. Push this project to a new GitHub repository.
2. Go to [vercel.com](https://vercel.com), click **Add New Project**.
3. Import the repo. Vercel auto-detects Next.js — no configuration needed.
4. Click **Deploy**. Done.

Every subsequent `git push` redeploys automatically.

## How the model works

### Single deal

A seed deal has:

- **Seed investment** — upfront check paid by the seeder
- **Fund family** — 1 to N underlying funds, each with its own size, vintage, MOIC, fee rate, carry rate, and realization window
- **Ownership schedule** — the seeder's % of the GP management company over time, typically stepping down (e.g. 25% → 20% → 15% → 10%)
- **GP firm margin** — FRE (fee-related earnings) margin on management fee revenue
- **Terminal value** — GP equity exit at `FRE × terminal multiple × ownership at exit`

For each year from 0 to exit:

```
Mgmt fee revenue  = Σ (fund size × fee rate) for funds in their fee-paying window
FRE               = Mgmt fee revenue × firm margin
Gross carry       = Σ (fund profit × carry rate) / realization window for realizing funds
Seeder fee CF     = FRE × seeder ownership
Seeder carry CF   = Gross carry × seeder carry share
Terminal CF       = FRE × terminal multiple × ownership (exit year only)
Total CF          = Fee CF + Carry CF + Terminal CF - (Investment if year 0)
```

IRR is solved via Newton-Raphson with bisection fallback. MOIC = total inflows / seed investment. Payback = first year where cumulative CF ≥ 0.

### Portfolio

Each deal has an absolute `dealStartYear`. The portfolio aggregates cash flows on the calendar timeline:

```
Portfolio CF(calendar year) = Σ Deal CF(calendar year - deal start year)
```

Portfolio IRR is computed on the aggregated annual cash flow series. The vintage chart shows when underlying fund capital is actually deployed (peak concentration years highlighted in gold).

All calculation logic lives in [`lib/model.ts`](./lib/model.ts) and [`lib/portfolio.ts`](./lib/portfolio.ts). Both are pure functions with no React or DOM dependencies — easy to test, easy to extend.

## Project structure

```
app/
  layout.tsx                 Root layout + fonts
  page.tsx                   Portfolio dashboard (landing page)
  deal/
    new/page.tsx             Smart-default wizard
    [id]/page.tsx            Full deal editor with live output
  globals.css                Design tokens + Tailwind

components/
  ui/                        shadcn primitives (button, card, slider, etc.)
  wizard/                    (inline in app/deal/new/page.tsx)
  deal/
    assumptions-editor.tsx   Full editor composing all deal inputs
    fund-editor.tsx          Per-fund row with on/off + all params
    ownership-editor.tsx     Dynamic ownership schedule editor
    slider-input.tsx         Paired slider + numeric input
  portfolio/
    deal-list.tsx            Sidebar list with toggles
    portfolio-kpis.tsx       Aggregate KPI cards
    portfolio-cashflow.tsx   Stacked area chart by deal
    contribution-table.tsx   Per-deal ranking table
    vintage-timeline.tsx     Capital deployment by vintage
  shared/
    kpi-cards.tsx            Single-deal KPI cards
    cashflow-chart.tsx       Annual + cumulative CF chart
    cashflow-table.tsx       Year-by-year table
    ownership-chart.tsx      Step-down visualization
    value-breakdown.tsx      Fees/carry/terminal breakdown

lib/
  model.ts                   Single-deal financial model
  portfolio.ts               Portfolio aggregation logic
  defaults.ts                Wizard defaults + sample deals
  storage.ts                 localStorage persistence
  utils.ts                   Formatters (fmtM, fmtPct, fmtX)

hooks/
  use-portfolio.ts           Deal CRUD + localStorage sync

types/
  index.ts                   All TypeScript types
```

## Customization

- **Change defaults**: Edit `WIZARD_DEFAULTS` in `lib/defaults.ts` for different starting values, or `makeFundsFromAum` for different fund family ratios.
- **Change terminal multiple methodology**: Modify the terminal calculation in `lib/model.ts` — currently `FRE × multiple × exit-year ownership`.
- **Change colors**: Design tokens are in `tailwind.config.ts` (ink, paper, accent2, sage, rust) and `app/globals.css`.
- **Add scenarios**: The old Base/Upside/Downside concept can be layered back in by duplicating a deal with shocked MOICs and margins, then toggling which is active.

## Notes

- Carry recognition is straight-line across the realization window. Real-world GP carry is lumpier — extend `fundCarry()` in `lib/model.ts` with a distribution profile if needed.
- Fees assume full-size management fees through the investment period and a step-down rate on full committed thereafter. If your deals use stepped-down on invested capital, modify `fundMgmtFee()`.
- Terminal value uses exit-year FRE × multiple, not smoothed/run-rate FRE. For most cases this is fine, but you may want to average the last 2–3 years of FRE.

## License

MIT

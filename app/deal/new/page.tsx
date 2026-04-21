'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { usePortfolio } from '@/hooks/use-portfolio';
import { runModel } from '@/lib/model';
import {
  INTAKE_DEFAULTS,
  buildAssumptionsFromIntake,
  buildDealFromIntake,
} from '@/lib/defaults';
import { cn, fmtM, fmtPct, fmtX, fmtYear } from '@/lib/utils';
import type {
  GrowthProfile,
  IntakeAnswers,
  StepDownPace,
  Strategy,
} from '@/types';

// ─── Constants ───────────────────────────────────────────────────────────────

const STRATEGIES: Strategy[] = ['Buyout', 'Growth', 'Venture', 'Credit', 'Other'];

const GROWTH_LABELS: Record<GrowthProfile, string> = {
  Conservative: 'Conservative',
  Base: 'Base Case',
  Aggressive: 'Aggressive',
};

const GROWTH_HINTS: Record<GrowthProfile, string> = {
  Conservative: '~2× Fund III growth · steady, de-risked trajectory',
  Base:         '~2.8× Fund III growth · institutional standard',
  Aggressive:   '~3.5× Fund III growth · high-conviction breakout',
};

const STEP_HINTS: Record<StepDownPace, string> = {
  Slow:     'Retains 65% at year 12 · long-form partnership alignment',
  Standard: '60% at year 8, 40% at year 12 · typical market terms',
  Fast:     '45% at year 6, 25% at year 10 · near-term liquidity focus',
};

const GROWTH_FACTORS: Record<GrowthProfile, number> = {
  Conservative: 2.0,
  Base: 2.8,
  Aggressive: 3.5,
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({
  n,
  title,
  subtitle,
}: {
  n: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-4 pb-1">
      <span className="display-serif text-3xl font-medium text-muted-foreground/40 leading-none select-none w-6 shrink-0">
        {n}
      </span>
      <div>
        <CardTitle>{title}</CardTitle>
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
}

function SliderQ({
  label,
  value,
  onChange,
  min,
  max,
  step,
  display,
  help,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  display: string;
  help?: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2.5">
        <Label className="eyebrow">{label}</Label>
        <span className="display-serif text-2xl font-medium tabular">{display}</span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      />
      {help && <p className="text-[11px] text-muted-foreground mt-1.5">{help}</p>}
    </div>
  );
}

function PillGroup<T extends string>({
  options,
  value,
  onChange,
  labels,
}: {
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
  labels?: Partial<Record<T, string>>;
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={cn(
            'flex-1 py-2 rounded-lg text-sm transition-all border',
            value === opt
              ? 'bg-ink text-paper border-ink font-medium'
              : 'bg-transparent text-muted-foreground border-border hover:border-foreground/40',
          )}
        >
          {labels?.[opt] ?? opt}
        </button>
      ))}
    </div>
  );
}

function AllocationBar({
  gpPct,
  lpPct,
  coPct,
}: {
  gpPct: number;
  lpPct: number;
  coPct: number;
}) {
  return (
    <div className="flex h-2.5 w-full overflow-hidden rounded-full">
      <div style={{ width: `${gpPct}%`, background: '#0F1629' }} />
      <div style={{ width: `${lpPct}%`, background: '#4A7C9E' }} />
      <div style={{ width: `${coPct}%`, background: '#8B6DB5' }} />
      {gpPct + lpPct + coPct < 100 && (
        <div
          style={{ width: `${100 - gpPct - lpPct - coPct}%` }}
          className="bg-muted"
        />
      )}
    </div>
  );
}

function PreviewKpi({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-paper/60">{label}</div>
      <div className="display-serif text-2xl font-medium tabular mt-1">{value}</div>
    </div>
  );
}

function BreakdownRow({
  label,
  pct,
  value,
}: {
  label: string;
  pct: number;
  value: number;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.12em] text-paper/60">{label}</div>
      <div className="tabular mt-0.5">
        <span className="text-accent2 font-mono">{fmtPct(pct, 0)}</span>
        <span className="text-paper/40 mx-1.5">·</span>
        <span className="font-mono text-paper/80">{fmtM(value, 0)}</span>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NewDealPage() {
  const router = useRouter();
  const { addDeal } = usePortfolio();
  const [intake, setIntake] = useState<IntakeAnswers>(INTAKE_DEFAULTS);

  const set = <K extends keyof IntakeAnswers>(k: K, v: IntakeAnswers[K]) =>
    setIntake((prev) => ({ ...prev, [k]: v }));

  // Keep GP + LP ≤ 100 when either slider moves
  const setGp = (v: number) => {
    const gp = v;
    const lp = Math.min(intake.lpFundAllocationPct, 100 - gp);
    setIntake((prev) => ({ ...prev, gpStakeAllocationPct: gp, lpFundAllocationPct: lp }));
  };
  const setLp = (v: number) =>
    set('lpFundAllocationPct', Math.min(v, 100 - intake.gpStakeAllocationPct));

  const coInvestPct = Math.max(
    0,
    100 - intake.gpStakeAllocationPct - intake.lpFundAllocationPct,
  );
  const gpM  = Math.round(intake.totalCommitmentM * intake.gpStakeAllocationPct / 100);
  const lpM  = Math.round(intake.totalCommitmentM * intake.lpFundAllocationPct  / 100);
  const coM  = Math.round(intake.totalCommitmentM * coInvestPct / 100);

  const fundIIISizeM = Math.round(
    (intake.fundISizeM * GROWTH_FACTORS[intake.growthProfile]) / 25,
  ) * 25;
  const fundIIILabel =
    fundIIISizeM >= 1000
      ? `$${(fundIIISizeM / 1000).toFixed(1)}bn`
      : `$${fundIIISizeM}M`;

  const preview = useMemo(
    () => runModel(buildAssumptionsFromIntake(intake)),
    [intake],
  );

  const lpNetReturn =
    preview.totals.totalLpDistributions + preview.totals.totalLpCalls;
  const showLp = lpNetReturn > 0.5;
  const showCo = preview.totals.totalCoInvestNet > 0.5;

  const isValid = intake.name.trim().length > 0;

  const save = () => {
    if (!isValid) return;
    const deal = buildDealFromIntake(intake);
    addDeal(deal);
    router.push(`/deal/${deal.id}`);
  };

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-border bg-card sticky top-0 z-20">
        <div className="mx-auto max-w-3xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="eyebrow">New Seed Deal</div>
              <h1 className="display-serif text-xl font-medium leading-tight">
                {intake.name.trim() || 'Untitled deal'}
              </h1>
            </div>
          </div>
          <Button onClick={save} disabled={!isValid}>
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Save &amp; refine
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-6 py-6 space-y-5 animate-fade-up">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Answer five questions to build your deal. Institutional defaults fill
          in fund schedule, fee structure, step-down curve, and terminal
          assumptions — refine anything on the next screen.
        </p>

        {/* ── 1. The Manager ─────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-4">
            <SectionHeader
              n="1"
              title="The Manager"
              subtitle="Strategy, name, and target launch year"
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="eyebrow">Deal name</Label>
              <Input
                value={intake.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Acme Growth Partners"
                className="mt-1.5"
                autoFocus
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="eyebrow">Strategy</Label>
                <Select
                  value={intake.strategy}
                  onValueChange={(v) => set('strategy', v as Strategy)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STRATEGIES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="eyebrow">Launch year</Label>
                <Input
                  type="number"
                  value={intake.dealStartYear}
                  onChange={(e) => set('dealStartYear', Number(e.target.value))}
                  className="mt-1.5 tabular"
                  min={2000}
                  max={2060}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ── 2. Capital Commitment ──────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-4">
            <SectionHeader
              n="2"
              title="Capital Commitment"
              subtitle="Total allocation and how it splits across the relationship"
            />
          </CardHeader>
          <CardContent className="space-y-6">
            <SliderQ
              label="Total commitment"
              value={intake.totalCommitmentM}
              onChange={(v) => set('totalCommitmentM', v)}
              min={25}
              max={500}
              step={25}
              display={fmtM(intake.totalCommitmentM, 0)}
              help="All-in capital: GP stake purchase + LP fund commitments + co-invest"
            />

            <div className="space-y-3">
              <AllocationBar
                gpPct={intake.gpStakeAllocationPct}
                lpPct={intake.lpFundAllocationPct}
                coPct={coInvestPct}
              />
              <div className="grid grid-cols-3 text-xs gap-2">
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                    <span className="h-2 w-2 rounded-full bg-ink shrink-0" />
                    GP Stake
                  </div>
                  <div className="font-mono font-medium tabular">
                    {intake.gpStakeAllocationPct}% · {fmtM(gpM, 0)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: '#4A7C9E' }} />
                    LP Funds
                  </div>
                  <div className="font-mono font-medium tabular">
                    {intake.lpFundAllocationPct}% · {fmtM(lpM, 0)}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5 text-muted-foreground mb-0.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: '#8B6DB5' }} />
                    Co-invest
                  </div>
                  <div className={cn('font-mono font-medium tabular', coInvestPct === 0 && 'text-muted-foreground')}>
                    {coInvestPct}% · {fmtM(coM, 0)}
                  </div>
                </div>
              </div>
            </div>

            <SliderQ
              label="GP stake allocation"
              value={intake.gpStakeAllocationPct}
              onChange={setGp}
              min={5}
              max={60}
              step={5}
              display={`${intake.gpStakeAllocationPct}%`}
              help="Upfront capital to purchase ownership in the GP management company"
            />
            <SliderQ
              label="LP fund allocation"
              value={intake.lpFundAllocationPct}
              onChange={setLp}
              min={0}
              max={75}
              step={5}
              display={`${intake.lpFundAllocationPct}%`}
              help="Capital committed as LP across the fund family — remainder goes to co-invest"
            />
          </CardContent>
        </Card>

        {/* ── 3. Manager Scale ───────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-4">
            <SectionHeader
              n="3"
              title="Manager Scale"
              subtitle="Fund I launch size and expected growth trajectory"
            />
          </CardHeader>
          <CardContent className="space-y-6">
            <SliderQ
              label="Fund I size"
              value={intake.fundISizeM}
              onChange={(v) => set('fundISizeM', v)}
              min={100}
              max={2000}
              step={50}
              display={fmtM(intake.fundISizeM, 0)}
              help={`Fund III projected at ${fundIIILabel} on this trajectory`}
            />
            <div className="space-y-2.5">
              <Label className="eyebrow">Growth trajectory</Label>
              <PillGroup
                options={['Conservative', 'Base', 'Aggressive'] as const}
                value={intake.growthProfile}
                onChange={(v) => set('growthProfile', v)}
                labels={GROWTH_LABELS}
              />
              <p className="text-[11px] text-muted-foreground/70">
                {GROWTH_HINTS[intake.growthProfile]}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── 4. Expected Returns ────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-4">
            <SectionHeader
              n="4"
              title="Expected Returns"
              subtitle="Net MOIC to LP after fund fees and carry"
            />
          </CardHeader>
          <CardContent>
            <SliderQ
              label="Net fund MOIC to LP"
              value={intake.netFundMoic}
              onChange={(v) => set('netFundMoic', v)}
              min={1.0}
              max={3.5}
              step={0.1}
              display={fmtX(intake.netFundMoic, 1)}
              help={`Gross MOIC derived automatically — approx. ${fmtX(1 + (intake.netFundMoic - 1) / 0.8, 1)} at 20% carry`}
            />
          </CardContent>
        </Card>

        {/* ── 5. GP Economics ────────────────────────────────────────────── */}
        <Card>
          <CardHeader className="pb-4">
            <SectionHeader
              n="5"
              title="GP Economics"
              subtitle="Your opening stake and how ownership evolves over time"
            />
          </CardHeader>
          <CardContent className="space-y-6">
            <SliderQ
              label="Initial GP ownership"
              value={intake.initialOwnershipPct}
              onChange={(v) => set('initialOwnershipPct', v)}
              min={5}
              max={40}
              step={1}
              display={`${intake.initialOwnershipPct}%`}
              help="Opening stake in the GP management company — steps down per schedule below"
            />
            <div className="space-y-2.5">
              <Label className="eyebrow">Ownership step-down</Label>
              <PillGroup
                options={['Slow', 'Standard', 'Fast'] as const}
                value={intake.stepDownPace}
                onChange={(v) => set('stepDownPace', v)}
              />
              <p className="text-[11px] text-muted-foreground/70">
                {STEP_HINTS[intake.stepDownPace]}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* ── Live Preview ───────────────────────────────────────────────── */}
        <Card className="bg-ink text-paper border-ink">
          <CardHeader className="pb-3">
            <div className="text-[10px] uppercase tracking-[0.18em] font-medium text-accent2">
              Live Preview
            </div>
            <CardTitle className="text-paper mt-1">Projected returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <PreviewKpi label="IRR"         value={fmtPct(preview.kpis.irr)} />
              <PreviewKpi label="MOIC"        value={fmtX(preview.kpis.moic)} />
              <PreviewKpi label="Total Value" value={fmtM(preview.kpis.totalValueM, 0)} />
              <PreviewKpi label="Payback"     value={fmtYear(preview.kpis.paybackYear)} />
            </div>
            <Separator className="my-4 bg-white/10" />
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              <BreakdownRow
                label="From fees"
                pct={preview.breakdown.feesPct}
                value={preview.totals.totalFeeCF}
              />
              <BreakdownRow
                label="From carry"
                pct={preview.breakdown.carryPct}
                value={preview.totals.totalCarryCF}
              />
              <BreakdownRow
                label="Terminal"
                pct={preview.breakdown.terminalPct}
                value={preview.totals.totalTerminalCF}
              />
              {showLp && (
                <BreakdownRow
                  label="LP funds"
                  pct={preview.breakdown.lpFundPct}
                  value={lpNetReturn}
                />
              )}
              {showCo && (
                <BreakdownRow
                  label="Co-invest"
                  pct={preview.breakdown.coInvestPct}
                  value={preview.totals.totalCoInvestNet}
                />
              )}
            </div>
            <p className="mt-4 text-[10px] text-paper/40 leading-relaxed">
              On {fmtM(preview.totals.totalInvested, 0)} total capital deployed ·
              refine all assumptions on the next screen
            </p>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pb-10">
          <Link href="/">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={save} disabled={!isValid}>
            Save &amp; refine →
          </Button>
        </div>
      </div>
    </main>
  );
}

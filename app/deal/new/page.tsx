'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Check } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { WIZARD_DEFAULTS, buildAssumptions, buildDeal } from '@/lib/defaults';
import { fmtM, fmtPct, fmtX, fmtYear } from '@/lib/utils';
import type { Strategy, WizardAnswers } from '@/types';

const STRATEGIES: Strategy[] = [
  'Buyout',
  'Growth',
  'Venture',
  'Credit',
  'Other',
];

export default function NewDealPage() {
  const router = useRouter();
  const { addDeal } = usePortfolio();
  const [answers, setAnswers] = useState<WizardAnswers>(WIZARD_DEFAULTS);

  const preview = useMemo(
    () => runModel(buildAssumptions(answers)),
    [answers],
  );

  const update = <K extends keyof WizardAnswers>(
    k: K,
    v: WizardAnswers[K],
  ) => setAnswers((prev) => ({ ...prev, [k]: v }));

  const isValid = answers.name.trim().length > 0;

  const save = () => {
    if (!isValid) return;
    const deal = buildDeal(answers);
    addDeal(deal);
    router.push(`/deal/${deal.id}`);
  };

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="eyebrow">New Seed Deal</div>
              <h1 className="display-serif text-xl font-medium">
                Five questions
              </h1>
            </div>
          </div>
          <Button onClick={save} disabled={!isValid}>
            <Check className="h-3.5 w-3.5 mr-1.5" />
            Save & refine
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-6 space-y-5 animate-fade-up">
        <p className="text-sm text-muted-foreground">
          Answer five questions below. Institutional defaults fill in the rest —
          fund schedule, fee structure, step-down curve, terminal assumptions. You
          can refine anything on the next screen.
        </p>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>1. Basics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="eyebrow">Deal name</Label>
              <Input
                value={answers.name}
                onChange={(e) => update('name', e.target.value)}
                placeholder="e.g. Acme Growth Partners"
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="eyebrow">Strategy</Label>
                <Select
                  value={answers.strategy}
                  onValueChange={(v) => update('strategy', v as Strategy)}
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
                <Label className="eyebrow">Start year</Label>
                <Input
                  type="number"
                  value={answers.dealStartYear}
                  onChange={(e) =>
                    update('dealStartYear', Number(e.target.value))
                  }
                  className="mt-1.5 tabular"
                  min={2000}
                  max={2050}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>2. Key Economics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-7">
            <SliderQuestion
              label="Seed check size"
              value={answers.seedInvestmentM}
              onChange={(v) => update('seedInvestmentM', v)}
              min={10}
              max={200}
              step={5}
              format={(v) => fmtM(v, 0)}
              help="Upfront capital from the seeder to the GP"
            />
            <SliderQuestion
              label="GP firm AUM at seeding"
              value={answers.firmAum}
              onChange={(v) => update('firmAum', v)}
              min={100}
              max={3000}
              step={50}
              format={(v) => fmtM(v, 0)}
              help="Used to size the fund family (Fund I smaller, Fund III larger)"
            />
            <SliderQuestion
              label="Expected gross fund MOIC"
              value={answers.expectedMoic}
              onChange={(v) => update('expectedMoic', v)}
              min={1.0}
              max={3.5}
              step={0.1}
              format={(v) => fmtX(v, 1)}
              help="Applied uniformly across funds — refine per-fund on the next screen"
            />
            <SliderQuestion
              label="Initial GP ownership"
              value={answers.initialOwnership}
              onChange={(v) => update('initialOwnership', v)}
              min={0.1}
              max={0.4}
              step={0.01}
              format={(v) => fmtPct(v, 0)}
              help="Starting stake in the GP management company. Steps down over time."
            />
          </CardContent>
        </Card>

        <Card className="bg-ink text-paper border-ink">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.18em] font-medium text-accent2">
                  Live Preview
                </div>
                <CardTitle className="text-paper mt-1">
                  Projected returns
                </CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <PreviewKpi
                label="IRR"
                value={fmtPct(preview.kpis.irr)}
              />
              <PreviewKpi label="MOIC" value={fmtX(preview.kpis.moic)} />
              <PreviewKpi
                label="Total Value"
                value={fmtM(preview.kpis.totalValueM, 0)}
              />
              <PreviewKpi
                label="Payback"
                value={fmtYear(preview.kpis.paybackYear)}
              />
            </div>
            <Separator className="my-4 bg-ink-light" />
            <div className="grid grid-cols-3 gap-4 text-xs">
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
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3 pb-8">
          <Link href="/">
            <Button variant="outline">Cancel</Button>
          </Link>
          <Button onClick={save} disabled={!isValid}>
            Save & refine →
          </Button>
        </div>
      </div>
    </main>
  );
}

function SliderQuestion({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
  help,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  help?: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2.5">
        <Label className="eyebrow">{label}</Label>
        <span className="display-serif text-2xl font-medium tabular">
          {format(value)}
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      />
      {help && (
        <p className="text-[11px] text-muted-foreground mt-2">{help}</p>
      )}
    </div>
  );
}

function PreviewKpi({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.18em] text-paper/60">
        {label}
      </div>
      <div className="display-serif text-2xl font-medium tabular mt-1">
        {value}
      </div>
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
      <div className="text-[10px] uppercase tracking-[0.12em] text-paper/60">
        {label}
      </div>
      <div className="tabular mt-0.5">
        <span className="text-accent2 font-mono">{fmtPct(pct, 0)}</span>
        <span className="text-paper/40 mx-1.5">·</span>
        <span className="font-mono text-paper/80">{fmtM(value, 0)}</span>
      </div>
    </div>
  );
}

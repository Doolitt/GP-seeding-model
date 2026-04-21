'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { usePortfolio } from '@/hooks/use-portfolio';
import { runModel } from '@/lib/model';
import { AssumptionsEditor } from '@/components/deal/assumptions-editor';
import { KpiCards } from '@/components/shared/kpi-cards';
import { CashflowChart } from '@/components/shared/cashflow-chart';
import { CashflowTable } from '@/components/shared/cashflow-table';
import { ValueBreakdown } from '@/components/shared/value-breakdown';
import { OwnershipChart } from '@/components/shared/ownership-chart';
import type { Strategy } from '@/types';

const STRATEGIES: Strategy[] = [
  'Buyout',
  'Growth',
  'Venture',
  'Credit',
  'Other',
];

export default function DealPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const router = useRouter();
  const { deals, loaded, updateDeal, removeDeal } = usePortfolio();

  const deal = deals.find((d) => d.id === id);

  const output = useMemo(
    () => (deal ? runModel(deal.assumptions) : null),
    [deal],
  );

  if (!loaded) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </main>
    );
  }

  if (!deal || !output) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="display-serif text-xl font-medium">Deal not found</h2>
          <p className="text-sm text-muted-foreground mt-2 mb-4">
            It may have been deleted, or you're on a different browser than
            where the deal was created.
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" />
              Back to portfolio
            </Button>
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-border bg-card sticky top-0 z-20">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Link href="/">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
              <div className="flex-1 min-w-0">
                <div className="eyebrow">Deal</div>
                <Input
                  value={deal.name}
                  onChange={(e) =>
                    updateDeal(deal.id, { name: e.target.value })
                  }
                  className="display-serif text-xl font-medium h-9 border-0 bg-transparent px-0 focus-visible:ring-0 shadow-none -ml-0.5"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={deal.strategy}
                onValueChange={(v) =>
                  updateDeal(deal.id, { strategy: v as Strategy })
                }
              >
                <SelectTrigger className="h-8 w-28 text-xs">
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
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground">Starts</span>
                <Input
                  type="number"
                  value={deal.dealStartYear}
                  onChange={(e) =>
                    updateDeal(deal.id, {
                      dealStartYear: Number(e.target.value),
                    })
                  }
                  className="h-8 w-20 text-xs font-mono tabular text-center"
                  min={2000}
                  max={2050}
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm(`Delete "${deal.name}"? This cannot be undone.`)) {
                    removeDeal(deal.id);
                    router.push('/');
                  }
                }}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6 space-y-6 animate-fade-up">
        <KpiCards output={output} />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <AssumptionsEditor
              assumptions={deal.assumptions}
              onChange={(a) => updateDeal(deal.id, { assumptions: a })}
            />
          </div>
          <div className="lg:col-span-3 space-y-6">
            <CashflowChart rows={output.rows} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OwnershipChart
                schedule={deal.assumptions.ownershipSchedule}
                exitYear={deal.assumptions.exitYear}
              />
              <ValueBreakdown output={output} />
            </div>
            <CashflowTable rows={output.rows} />
          </div>
        </div>
      </div>
    </main>
  );
}

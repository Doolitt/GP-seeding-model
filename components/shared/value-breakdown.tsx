'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fmtM, fmtPct } from '@/lib/utils';
import type { ModelOutput } from '@/types';

export function ValueBreakdown({ output }: { output: ModelOutput }) {
  const lpFundNet =
    output.totals.totalLpDistributions + output.totals.totalLpCalls;

  const allSegments = [
    {
      label: 'Management Fees',
      value: output.totals.totalFeeCF,
      pct: output.breakdown.feesPct,
      color: '#0F1629',
    },
    {
      label: 'Carry',
      value: output.totals.totalCarryCF,
      pct: output.breakdown.carryPct,
      color: '#B8863F',
    },
    {
      label: 'Terminal GP Equity',
      value: output.totals.totalTerminalCF,
      pct: output.breakdown.terminalPct,
      color: '#6B8068',
    },
    {
      label: 'LP Fund Returns',
      value: lpFundNet,
      pct: output.breakdown.lpFundPct,
      color: '#4A7C9E',
    },
    {
      label: 'Co-Invest Returns',
      value: output.totals.totalCoInvestNet,
      pct: output.breakdown.coInvestPct,
      color: '#8B6DB5',
    },
  ];

  // Only show segments that have a non-trivial value
  const visibleSegments = allSegments.filter((s) => Math.abs(s.value) > 0.01);
  const barSegments = allSegments.filter((s) => s.pct > 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Source of Value</CardTitle>
        <div className="eyebrow mt-1">
          Contribution to total returns · $M
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex h-2 w-full overflow-hidden rounded-full mb-4">
          {barSegments.map((s) => (
            <div
              key={s.label}
              style={{
                width: `${s.pct * 100}%`,
                backgroundColor: s.color,
              }}
            />
          ))}
        </div>
        <div className="space-y-3">
          {visibleSegments.map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-sm">{s.label}</span>
              </div>
              <div className="flex items-baseline gap-3 tabular">
                <span className="text-xs text-muted-foreground">
                  {s.pct > 0 ? fmtPct(s.pct, 0) : '—'}
                </span>
                <span className="text-sm font-medium w-20 text-right">
                  {fmtM(s.value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

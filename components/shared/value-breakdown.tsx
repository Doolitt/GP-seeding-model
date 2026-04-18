'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fmtM, fmtPct } from '@/lib/utils';
import type { ModelOutput } from '@/types';

export function ValueBreakdown({ output }: { output: ModelOutput }) {
  const segments = [
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
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Source of Value</CardTitle>
        <div className="eyebrow mt-1">
          Contribution to total returns · $M
        </div>
      </CardHeader>
      <CardContent>
        {/* Stacked horizontal bar */}
        <div className="flex h-2 w-full overflow-hidden rounded-full mb-4">
          {segments.map((s) => (
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
          {segments.map((s) => (
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
                  {fmtPct(s.pct, 0)}
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

'use client';

import { Card } from '@/components/ui/card';
import { fmtM, fmtPct, fmtX, fmtYear } from '@/lib/utils';
import type { ModelOutput } from '@/types';

export function KpiCards({ output }: { output: ModelOutput }) {
  const items = [
    {
      label: 'Net IRR',
      value: fmtPct(output.kpis.irr),
      caption: 'After seed check',
    },
    {
      label: 'MOIC',
      value: fmtX(output.kpis.moic),
      caption: `Net profit ${fmtM(output.totals.netProfit)}`,
    },
    {
      label: 'Total Value',
      value: fmtM(output.kpis.totalValueM, 0),
      caption: `On ${fmtM(output.totals.totalInvested, 0)} invested`,
    },
    {
      label: 'Payback',
      value: fmtYear(output.kpis.paybackYear),
      caption: 'Cumulative CF ≥ 0',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {items.map((i) => (
        <Card key={i.label} className="p-5">
          <div className="eyebrow">{i.label}</div>
          <div className="mt-3 display-serif text-3xl font-medium tabular">
            {i.value}
          </div>
          <div className="mt-1 text-xs text-muted-foreground tabular">
            {i.caption}
          </div>
        </Card>
      ))}
    </div>
  );
}

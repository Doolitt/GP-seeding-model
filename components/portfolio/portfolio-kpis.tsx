'use client';

import { Card } from '@/components/ui/card';
import { fmtM, fmtPct, fmtX } from '@/lib/utils';
import type { PortfolioOutput } from '@/lib/portfolio';

export function PortfolioKpis({
  kpis,
}: {
  kpis: PortfolioOutput['kpis'];
}) {
  const items = [
    {
      label: 'Portfolio IRR',
      value: fmtPct(kpis.irr),
      caption: `${kpis.activeDealCount} active deal${kpis.activeDealCount !== 1 ? 's' : ''}`,
    },
    {
      label: 'Portfolio MOIC',
      value: fmtX(kpis.moic),
      caption: `Net profit ${fmtM(kpis.netProfit, 0)}`,
    },
    {
      label: 'Committed Capital',
      value: fmtM(kpis.totalInvested, 0),
      caption: 'Total seed checks',
    },
    {
      label: 'Projected Value',
      value: fmtM(kpis.totalValueM, 0),
      caption:
        kpis.paybackYear !== null
          ? `Payback ${kpis.paybackYear}`
          : 'Not yet paid back',
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

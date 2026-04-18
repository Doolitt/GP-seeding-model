'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ArrowUpRight } from 'lucide-react';
import { fmtM, fmtPct, fmtX } from '@/lib/utils';
import type { Deal } from '@/types';
import type { PortfolioContribution } from '@/lib/portfolio';

interface Props {
  deals: Deal[];
  contributions: PortfolioContribution[];
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
}

export function DealList({ deals, contributions, onToggle, onRemove }: Props) {
  const contribMap = new Map(contributions.map((c) => [c.dealId, c]));

  return (
    <Card className="p-0 overflow-hidden">
      <div className="px-4 py-3 border-b bg-muted/30">
        <div className="eyebrow">Deals</div>
      </div>
      <div className="divide-y divide-border max-h-[640px] overflow-auto">
        {deals.map((d) => {
          const c = contribMap.get(d.id);
          return (
            <div
              key={d.id}
              className={
                'p-4 transition-colors ' +
                (d.enabled ? '' : 'opacity-60 bg-muted/20')
              }
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={d.enabled}
                      onCheckedChange={() => onToggle(d.id)}
                    />
                    <Link
                      href={`/deal/${d.id}`}
                      className="font-serif font-medium text-base truncate hover:text-accent2 transition-colors"
                    >
                      {d.name}
                    </Link>
                  </div>
                  <div className="mt-1 ml-11 text-xs text-muted-foreground flex items-center flex-wrap gap-x-2 gap-y-0.5">
                    <span>{d.strategy}</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="tabular">Start {d.dealStartYear}</span>
                    <span className="text-muted-foreground/40">·</span>
                    <span className="tabular">
                      {fmtM(d.assumptions.seedInvestmentM, 0)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  <Link href={`/deal/${d.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground"
                      aria-label="Edit"
                    >
                      <Pencil className="h-3 w-3" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Delete "${d.name}"?`)) onRemove(d.id);
                    }}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {c && d.enabled && (
                <div className="mt-3 ml-11 grid grid-cols-3 gap-2 text-[11px]">
                  <Metric label="IRR" value={fmtPct(c.irr)} />
                  <Metric label="MOIC" value={fmtX(c.moic)} />
                  <Metric label="Value" value={fmtM(c.totalValue, 0)} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/70">
        {label}
      </div>
      <div className="font-mono tabular text-xs mt-0.5">{value}</div>
    </div>
  );
}

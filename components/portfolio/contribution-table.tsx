'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ArrowUpRight } from 'lucide-react';
import { cn, fmtM, fmtPct, fmtX } from '@/lib/utils';
import type { PortfolioContribution } from '@/lib/portfolio';

interface Props {
  contributions: PortfolioContribution[];
}

export function ContributionTable({ contributions }: Props) {
  const sorted = [...contributions].sort((a, b) => b.totalValue - a.totalValue);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Per-Deal Contribution</CardTitle>
        <div className="eyebrow mt-1">
          Ranked by total value · active deals only
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Deal</TableHead>
              <TableHead className="text-right">Invested</TableHead>
              <TableHead className="text-right">Value</TableHead>
              <TableHead className="text-right">MOIC</TableHead>
              <TableHead className="text-right">IRR</TableHead>
              <TableHead className="text-right">% of Value</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((c) => (
              <TableRow key={c.dealId} className="group">
                <TableCell className="py-2.5">
                  <Link
                    href={`/deal/${c.dealId}`}
                    className="flex items-center gap-1.5 font-medium hover:text-accent2 transition-colors"
                  >
                    <span className="truncate max-w-[140px]">{c.name}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {c.strategy}
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-xs tabular py-2.5">
                  {fmtM(c.invested, 0)}
                </TableCell>
                <TableCell className="text-right font-mono text-xs tabular py-2.5 font-medium">
                  {fmtM(c.totalValue, 0)}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-mono text-xs tabular py-2.5',
                    c.moic < 1 ? 'text-rust' : c.moic >= 2 ? 'text-sage' : '',
                  )}
                >
                  {fmtX(c.moic)}
                </TableCell>
                <TableCell
                  className={cn(
                    'text-right font-mono text-xs tabular py-2.5',
                    c.irr < 0.05
                      ? 'text-rust'
                      : c.irr >= 0.15
                        ? 'text-sage'
                        : '',
                  )}
                >
                  {fmtPct(c.irr)}
                </TableCell>
                <TableCell className="text-right py-2.5">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-ink"
                        style={{ width: `${Math.min(100, c.pctOfValue * 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs tabular w-10 text-right">
                      {fmtPct(c.pctOfValue, 0)}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

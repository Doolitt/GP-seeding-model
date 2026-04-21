'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn, fmtM, fmtPct } from '@/lib/utils';
import type { YearRow } from '@/types';

interface Props {
  rows: YearRow[];
}

const th = 'h-10 px-3 text-left align-middle text-[10px] uppercase tracking-[0.12em] font-medium text-muted-foreground whitespace-nowrap';
const td = 'p-3 align-middle font-mono text-xs whitespace-nowrap';

export function CashflowTable({ rows }: Props) {
  const hasLp = rows.some((r) => r.lpCapitalCalls !== 0 || r.lpDistributions !== 0);
  const hasCo = rows.some((r) => r.coInvestCF !== 0);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Annual Cash Flow Detail</CardTitle>
        <div className="eyebrow mt-1">Seeder-level cash flows · $M</div>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Single scroll container — keeps sticky thead working on all browsers */}
        <div className="overflow-auto max-h-[440px]">
          <table className="min-w-max w-full caption-bottom text-sm">
            <thead className="sticky top-0 z-10 bg-card [&_tr]:border-b">
              <tr className="border-b border-border">
                <th className={th}>Yr</th>
                <th className={cn(th, 'text-right')}>Own%</th>
                <th className={cn(th, 'text-right')}>Mgmt Fee Rev</th>
                <th className={cn(th, 'text-right')}>FRE</th>
                <th className={cn(th, 'text-right')}>Fee CF</th>
                <th className={cn(th, 'text-right')}>Carry CF</th>
                <th className={cn(th, 'text-right')}>Term CF</th>
                {hasLp && (
                  <>
                    <th className={cn(th, 'text-right')}>LP Calls</th>
                    <th className={cn(th, 'text-right')}>LP Dist</th>
                  </>
                )}
                {hasCo && <th className={cn(th, 'text-right')}>Co-inv</th>}
                <th className={cn(th, 'text-right')}>Total CF</th>
                <th className={cn(th, 'text-right')}>Cum CF</th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {rows.map((r) => (
                <tr
                  key={r.year}
                  className="border-b border-border transition-colors hover:bg-muted/40"
                >
                  <td className={td}>{r.year}</td>
                  <td className={cn(td, 'text-right tabular')}>{fmtPct(r.gpOwnership, 0)}</td>
                  <td className={cn(td, 'text-right tabular text-muted-foreground')}>{fmtM(r.mgmtFeeRevenue)}</td>
                  <td className={cn(td, 'text-right tabular text-muted-foreground')}>{fmtM(r.fre)}</td>
                  <td className={cn(td, 'text-right tabular')}>{fmtM(r.seederFeeCF)}</td>
                  <td className={cn(td, 'text-right tabular')}>{fmtM(r.seederCarryCF)}</td>
                  <td className={cn(td, 'text-right tabular')}>
                    {r.seederTerminalCF > 0 ? fmtM(r.seederTerminalCF) : '—'}
                  </td>
                  {hasLp && (
                    <>
                      <td className={cn(td, 'text-right tabular', r.lpCapitalCalls < 0 ? 'text-rust' : 'text-muted-foreground')}>
                        {r.lpCapitalCalls !== 0 ? fmtM(r.lpCapitalCalls) : '—'}
                      </td>
                      <td className={cn(td, 'text-right tabular')}>
                        {r.lpDistributions > 0 ? fmtM(r.lpDistributions) : '—'}
                      </td>
                    </>
                  )}
                  {hasCo && (
                    <td className={cn(td, 'text-right tabular', r.coInvestCF < 0 ? 'text-rust' : '')}>
                      {r.coInvestCF !== 0 ? fmtM(r.coInvestCF) : '—'}
                    </td>
                  )}
                  <td className={cn(td, 'text-right tabular font-medium', r.seederTotalCF < 0 ? 'text-rust' : '')}>
                    {fmtM(r.seederTotalCF)}
                  </td>
                  <td className={cn(td, 'text-right tabular font-medium', r.cumulativeCF < 0 ? 'text-rust' : 'text-sage')}>
                    {fmtM(r.cumulativeCF)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

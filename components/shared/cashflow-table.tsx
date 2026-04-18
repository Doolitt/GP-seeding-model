'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn, fmtM, fmtPct } from '@/lib/utils';
import type { YearRow } from '@/types';

interface Props {
  rows: YearRow[];
}

export function CashflowTable({ rows }: Props) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Annual Cash Flow Detail</CardTitle>
        <div className="eyebrow mt-1">
          Seeder-level cash flows · $M
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="max-h-[440px] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead>Yr</TableHead>
                <TableHead className="text-right">Own%</TableHead>
                <TableHead className="text-right">Mgmt Fee Rev</TableHead>
                <TableHead className="text-right">FRE</TableHead>
                <TableHead className="text-right">Fee CF</TableHead>
                <TableHead className="text-right">Carry CF</TableHead>
                <TableHead className="text-right">Term CF</TableHead>
                <TableHead className="text-right">Total CF</TableHead>
                <TableHead className="text-right">Cum CF</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.year}>
                  <TableCell className="font-mono text-xs">{r.year}</TableCell>
                  <TableCell className="font-mono text-xs text-right tabular">
                    {fmtPct(r.gpOwnership, 0)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-right tabular text-muted-foreground">
                    {fmtM(r.mgmtFeeRevenue)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-right tabular text-muted-foreground">
                    {fmtM(r.fre)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-right tabular">
                    {fmtM(r.seederFeeCF)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-right tabular">
                    {fmtM(r.seederCarryCF)}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-right tabular">
                    {r.seederTerminalCF > 0 ? fmtM(r.seederTerminalCF) : '—'}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'font-mono text-xs text-right tabular font-medium',
                      r.seederTotalCF < 0 ? 'text-rust' : '',
                    )}
                  >
                    {fmtM(r.seederTotalCF)}
                  </TableCell>
                  <TableCell
                    className={cn(
                      'font-mono text-xs text-right tabular font-medium',
                      r.cumulativeCF < 0 ? 'text-rust' : 'text-sage',
                    )}
                  >
                    {fmtM(r.cumulativeCF)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

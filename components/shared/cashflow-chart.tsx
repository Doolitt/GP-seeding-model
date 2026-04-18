'use client';

import {
  Bar,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fmtM } from '@/lib/utils';
import type { YearRow } from '@/types';

interface Props {
  rows: YearRow[];
}

export function CashflowChart({ rows }: Props) {
  const data = rows.map((r) => ({
    year: r.year,
    annual: +r.seederTotalCF.toFixed(2),
    cumulative: +r.cumulativeCF.toFixed(2),
  }));

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-end justify-between">
          <div>
            <CardTitle>Cash Flow</CardTitle>
            <div className="eyebrow mt-1">
              Annual bars · cumulative line · $M
            </div>
          </div>
          <div className="flex gap-4 text-xs">
            <Legend color="#0F1629" label="Annual" />
            <Legend color="#B8863F" label="Cumulative" dashed />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: 'hsl(225 15% 45%)' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(40 15% 85%)' }}
                label={{
                  value: 'Year',
                  position: 'insideBottomRight',
                  offset: -2,
                  style: { fontSize: 10, fill: 'hsl(225 15% 45%)' },
                }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(225 15% 45%)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}M`}
                width={55}
              />
              <Tooltip
                contentStyle={{
                  background: '#0F1629',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 12,
                  color: '#FAF8F3',
                }}
                labelStyle={{ color: '#D4A85C', fontWeight: 500 }}
                formatter={(value: number, name: string) => [
                  fmtM(value),
                  name === 'annual' ? 'Annual CF' : 'Cumulative',
                ]}
              />
              <ReferenceLine y={0} stroke="hsl(225 15% 45%)" strokeWidth={1} />
              <Bar
                dataKey="annual"
                fill="#0F1629"
                opacity={0.9}
                radius={[2, 2, 0, 0]}
              />
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="#B8863F"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function Legend({
  color,
  label,
  dashed,
}: {
  color: string;
  label: string;
  dashed?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <span
        className="inline-block h-[2px] w-4"
        style={{
          background: dashed
            ? `repeating-linear-gradient(to right, ${color} 0 4px, transparent 4px 7px)`
            : color,
        }}
      />
      {label}
    </div>
  );
}

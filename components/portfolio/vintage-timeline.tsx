'use client';

import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { fmtM } from '@/lib/utils';
import type { VintagePoint } from '@/lib/portfolio';

interface Props {
  vintages: VintagePoint[];
}

export function VintageTimeline({ vintages }: Props) {
  const maxCap = Math.max(...vintages.map((v) => v.capitalDeployedM), 1);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Vintage Diversification</CardTitle>
        <div className="eyebrow mt-1">
          Underlying fund capital deployed per year · $M
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={vintages}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <XAxis
                dataKey="year"
                tick={{ fontSize: 11, fill: 'hsl(225 15% 45%)' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(40 15% 85%)' }}
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
                formatter={(value: number, _name: string, entry: any) => {
                  const payload = entry?.payload as VintagePoint | undefined;
                  return [
                    `${fmtM(value, 0)} across ${payload?.dealCount ?? 0} deal${payload?.dealCount === 1 ? '' : 's'}`,
                    'Deployed',
                  ];
                }}
              />
              <Bar dataKey="capitalDeployedM" radius={[2, 2, 0, 0]}>
                {vintages.map((v, i) => {
                  // Gold highlight for peak concentration years
                  const isPeak = v.capitalDeployedM / maxCap > 0.8;
                  return (
                    <Cell
                      key={i}
                      fill={isPeak ? '#B8863F' : '#0F1629'}
                      fillOpacity={isPeak ? 0.9 : 0.75}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex items-center gap-4 text-[11px] text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-ink/75" />
            <span>Standard vintage</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-accent2" />
            <span>Peak concentration</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

'use client';

import { useState } from 'react';
import {
  Area,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fmtM } from '@/lib/utils';
import type { Deal } from '@/types';
import type { PortfolioRow } from '@/lib/portfolio';

interface Props {
  rows: PortfolioRow[];
  deals: Deal[];
}

const DEAL_COLORS = [
  '#0F1629', // ink
  '#B8863F', // gold
  '#6B8068', // sage
  '#A84B2F', // rust
  '#2D3656', // ink-light
  '#D4A85C', // gold-soft
  '#4A5D73', // slate
  '#8B6F47', // tobacco
];

export function PortfolioCashflow({ rows, deals }: Props) {
  const [mode, setMode] = useState<'calendar' | 'relative'>('calendar');
  const activeDeals = deals.filter((d) => d.enabled);

  // Transform rows based on mode
  const data = rows.map((r, idx) => {
    const entry: Record<string, number> = {
      yearLabel: mode === 'calendar' ? r.year : idx,
      cumulative: +r.cumulative.toFixed(2),
    };
    for (const d of activeDeals) {
      entry[d.id] = +(r.byDeal[d.id] ?? 0).toFixed(2);
    }
    return entry;
  });

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-end justify-between">
          <div>
            <CardTitle>Portfolio Cash Flow</CardTitle>
            <div className="eyebrow mt-1">
              Stacked annual · cumulative · $M
            </div>
          </div>
          <Tabs
            value={mode}
            onValueChange={(v) => setMode(v as 'calendar' | 'relative')}
          >
            <TabsList>
              <TabsTrigger value="calendar" className="text-xs">
                Calendar
              </TabsTrigger>
              <TabsTrigger value="relative" className="text-xs">
                Relative
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              stackOffset="sign"
            >
              <XAxis
                dataKey="yearLabel"
                tick={{ fontSize: 11, fill: 'hsl(225 15% 45%)' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(40 15% 85%)' }}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'hsl(225 15% 45%)' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}M`}
                width={60}
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
                formatter={(value: number, name: string) => {
                  if (name === 'cumulative') return [fmtM(value), 'Cumulative'];
                  const deal = activeDeals.find((d) => d.id === name);
                  return [fmtM(value), deal?.name ?? name];
                }}
              />
              <ReferenceLine y={0} stroke="hsl(225 15% 45%)" strokeWidth={1} />
              {activeDeals.map((d, i) => (
                <Area
                  key={d.id}
                  dataKey={d.id}
                  stackId="1"
                  stroke={DEAL_COLORS[i % DEAL_COLORS.length]}
                  fill={DEAL_COLORS[i % DEAL_COLORS.length]}
                  fillOpacity={0.8}
                  strokeWidth={0}
                />
              ))}
              <Line
                type="monotone"
                dataKey="cumulative"
                stroke="#FAF8F3"
                strokeWidth={2}
                dot={false}
                strokeDasharray="4 4"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="mt-3 flex flex-wrap gap-3 text-[11px]">
          {activeDeals.map((d, i) => (
            <div key={d.id} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{
                  backgroundColor: DEAL_COLORS[i % DEAL_COLORS.length],
                }}
              />
              <span className="text-muted-foreground">{d.name}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

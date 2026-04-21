'use client';

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OwnershipStep } from '@/types';

export function OwnershipChart({
  schedule,
  exitYear,
}: {
  schedule: OwnershipStep[];
  exitYear: number;
}) {
  // Expand schedule into yearly samples so the step-chart is smooth
  const sorted = [...schedule].sort((a, b) => a.year - b.year);
  const data: Array<{ year: number; ownership: number }> = [];
  for (let y = 0; y <= exitYear; y++) {
    let current = sorted[0]?.gpOwnership ?? 0;
    for (const s of sorted) {
      if (s.year <= y) current = s.gpOwnership;
      else break;
    }
    data.push({ year: y, ownership: +(current * 100).toFixed(2) });
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Ownership Step-Down</CardTitle>
        <div className="eyebrow mt-1">
          Seeder stake in GP mgmt co over time
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="ownGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0F1629" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#0F1629" stopOpacity={0.05} />
                </linearGradient>
              </defs>
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
                tickFormatter={(v) => `${v}%`}
                width={40}
                domain={[0, 'auto']}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div style={{ background: '#0F1629', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: '#FAF8F3' }}>
                      <div style={{ color: '#D4A85C', fontWeight: 500, marginBottom: 4 }}>Year {label}</div>
                      <div>{Number(payload[0].value).toFixed(1)}% Ownership</div>
                    </div>
                  );
                }}
              />
              <Area
                type="stepAfter"
                dataKey="ownership"
                stroke="#0F1629"
                strokeWidth={2}
                fill="url(#ownGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

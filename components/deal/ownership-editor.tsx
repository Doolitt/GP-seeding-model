'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import type { OwnershipStep } from '@/types';

interface Props {
  schedule: OwnershipStep[];
  onChange: (s: OwnershipStep[]) => void;
}

export function OwnershipEditor({ schedule, onChange }: Props) {
  const sorted = [...schedule].sort((a, b) => a.year - b.year);

  const update = (idx: number, patch: Partial<OwnershipStep>) => {
    const next = sorted.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    onChange(next);
  };

  const remove = (idx: number) => {
    if (sorted.length <= 1) return;
    onChange(sorted.filter((_, i) => i !== idx));
  };

  const add = () => {
    const lastYear = sorted[sorted.length - 1]?.year ?? 0;
    const lastOwn = sorted[sorted.length - 1]?.gpOwnership ?? 0.25;
    onChange([
      ...sorted,
      {
        year: lastYear + 3,
        gpOwnership: +(lastOwn * 0.8).toFixed(4),
        carryShare: sorted[0]?.carryShare ?? 0.25,
      },
    ]);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-medium">
            Ownership Schedule
          </div>
          <div className="text-[11px] text-muted-foreground/70 mt-0.5">
            When each stake takes effect
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={add}>
          <Plus className="h-3 w-3 mr-1" />
          Step
        </Button>
      </div>
      <div className="space-y-2">
        <div className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 text-[10px] uppercase tracking-[0.12em] text-muted-foreground px-1">
          <span className="w-12">Yr</span>
          <span>GP Own</span>
          <span>Carry</span>
          <span className="w-7" />
        </div>
        {sorted.map((s, idx) => (
          <div
            key={idx}
            className="grid grid-cols-[auto_1fr_1fr_auto] gap-2 items-center"
          >
            <Input
              type="number"
              value={s.year}
              onChange={(e) => update(idx, { year: Number(e.target.value) })}
              className="h-7 w-12 font-mono text-xs text-center px-1"
              min={0}
              max={25}
            />
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={+(s.gpOwnership * 100).toFixed(1)}
                onChange={(e) =>
                  update(idx, { gpOwnership: Number(e.target.value) / 100 })
                }
                className="h-7 font-mono text-xs text-right px-1.5"
                min={0}
                max={50}
                step={0.5}
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
            <div className="flex items-center gap-1">
              <Input
                type="number"
                value={+(s.carryShare * 100).toFixed(1)}
                onChange={(e) =>
                  update(idx, { carryShare: Number(e.target.value) / 100 })
                }
                className="h-7 font-mono text-xs text-right px-1.5"
                min={0}
                max={50}
                step={0.5}
              />
              <span className="text-xs text-muted-foreground">%</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => remove(idx)}
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              disabled={sorted.length <= 1}
              aria-label="Remove step"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

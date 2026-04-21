'use client';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SliderInput } from './slider-input';
import { Trash2 } from 'lucide-react';
import type { CoInvest } from '@/types';

interface Props {
  co: CoInvest;
  onChange: (c: CoInvest) => void;
  onRemove: () => void;
}

export function CoInvestEditor({ co, onChange, onRemove }: Props) {
  const patch = <K extends keyof CoInvest>(k: K, v: CoInvest[K]) =>
    onChange({ ...co, [k]: v });

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <Input
          value={co.name}
          onChange={(e) => patch('name', e.target.value)}
          className="h-8 font-medium max-w-[200px]"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label="Remove co-investment"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        <SliderInput
          label="Commitment"
          suffix="M"
          value={co.commitment}
          onChange={(v) => patch('commitment', v)}
          min={1}
          max={200}
          step={1}
        />
        <SliderInput
          label="Gross MOIC"
          suffix="x"
          value={co.moic}
          onChange={(v) => patch('moic', v)}
          min={0.1}
          max={10}
          step={0.1}
          help="No fees or carry applied"
        />
        <SliderInput
          label="Vintage year"
          value={co.vintageYear}
          onChange={(v) => patch('vintageYear', v)}
          min={0}
          max={20}
          step={1}
        />
        <SliderInput
          label="Exit year"
          value={co.exitYear}
          onChange={(v) => patch('exitYear', v)}
          min={1}
          max={25}
          step={1}
        />
      </div>
    </Card>
  );
}

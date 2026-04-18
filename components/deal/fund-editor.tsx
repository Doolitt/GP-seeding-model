'use client';

import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SliderInput } from './slider-input';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Fund } from '@/types';

interface Props {
  fund: Fund;
  onChange: (f: Fund) => void;
  onRemove: () => void;
}

export function FundEditor({ fund, onChange, onRemove }: Props) {
  const patch = <K extends keyof Fund>(k: K, v: Fund[K]) =>
    onChange({ ...fund, [k]: v });

  return (
    <Card
      className={cn(
        'p-4 transition-opacity',
        !fund.enabled && 'opacity-60',
      )}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <Switch
            checked={fund.enabled}
            onCheckedChange={(v) => patch('enabled', v)}
          />
          <Input
            value={fund.name}
            onChange={(e) => patch('name', e.target.value)}
            className="h-8 font-medium max-w-[180px]"
          />
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label="Remove fund"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-x-5 gap-y-4">
        <SliderInput
          label="Fund size"
          suffix="M"
          value={fund.sizeM}
          onChange={(v) => patch('sizeM', v)}
          min={50}
          max={5000}
          step={25}
        />
        <SliderInput
          label="Vintage year"
          value={fund.vintageYear}
          onChange={(v) => patch('vintageYear', v)}
          min={0}
          max={20}
          step={1}
        />
        <SliderInput
          label="Gross MOIC"
          suffix="x"
          value={fund.moic}
          onChange={(v) => patch('moic', v)}
          min={0.5}
          max={4}
          step={0.1}
        />
        <SliderInput
          label="Mgmt fee"
          suffix="%"
          value={+(fund.mgmtFeeRate * 100).toFixed(2)}
          onChange={(v) => patch('mgmtFeeRate', v / 100)}
          min={0.5}
          max={3}
          step={0.05}
        />
        <SliderInput
          label="Carry rate"
          suffix="%"
          value={+(fund.carryRate * 100).toFixed(0)}
          onChange={(v) => patch('carryRate', v / 100)}
          min={10}
          max={30}
          step={1}
        />
        <SliderInput
          label="Realization start"
          value={fund.realizationStartYr}
          onChange={(v) => patch('realizationStartYr', v)}
          min={0}
          max={20}
          step={1}
        />
      </div>
    </Card>
  );
}

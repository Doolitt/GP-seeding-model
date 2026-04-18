'use client';

import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface Props {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  prefix?: string;
  suffix?: string;
  help?: string;
  className?: string;
}

export function SliderInput({
  label,
  value,
  onChange,
  min,
  max,
  step,
  prefix,
  suffix,
  help,
  className,
}: Props) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between items-center">
        <label className="text-xs uppercase tracking-[0.12em] text-muted-foreground font-medium">
          {label}
        </label>
        <div className="flex items-center gap-1">
          {prefix && (
            <span className="text-xs text-muted-foreground">{prefix}</span>
          )}
          <Input
            type="number"
            value={value}
            step={step}
            min={min}
            max={max}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (!isNaN(v)) onChange(clamp(v));
            }}
            className="h-7 w-20 text-right font-mono text-xs px-1.5 tabular"
          />
          {suffix && (
            <span className="text-xs text-muted-foreground w-4">{suffix}</span>
          )}
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
      />
      {help && <p className="text-[11px] text-muted-foreground/70">{help}</p>}
    </div>
  );
}

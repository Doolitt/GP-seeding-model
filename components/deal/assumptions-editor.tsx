'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SliderInput } from './slider-input';
import { FundEditor } from './fund-editor';
import { OwnershipEditor } from './ownership-editor';
import { Plus } from 'lucide-react';
import { newFund } from '@/lib/defaults';
import type { Assumptions, Fund, OwnershipStep } from '@/types';

interface Props {
  assumptions: Assumptions;
  onChange: (a: Assumptions) => void;
}

export function AssumptionsEditor({ assumptions, onChange }: Props) {
  const patch = <K extends keyof Assumptions>(k: K, v: Assumptions[K]) =>
    onChange({ ...assumptions, [k]: v });

  const updateFund = (id: string, fund: Fund) =>
    patch(
      'funds',
      assumptions.funds.map((f) => (f.id === id ? fund : f)),
    );

  const removeFund = (id: string) =>
    patch(
      'funds',
      assumptions.funds.filter((f) => f.id !== id),
    );

  const addFund = () => {
    const nextIdx = assumptions.funds.length + 1;
    patch('funds', [
      ...assumptions.funds,
      {
        ...newFund(`Fund ${nextIdx}`),
        vintageYear: (assumptions.funds.at(-1)?.vintageYear ?? 0) + 4,
        realizationStartYr: (assumptions.funds.at(-1)?.realizationStartYr ?? 5) + 4,
        realizationEndYr: (assumptions.funds.at(-1)?.realizationEndYr ?? 10) + 4,
      },
    ]);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Deal Economics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <SliderInput
            label="Seed investment"
            suffix="M"
            value={assumptions.seedInvestmentM}
            onChange={(v) => patch('seedInvestmentM', v)}
            min={5}
            max={300}
            step={5}
          />
          <SliderInput
            label="FRE margin"
            suffix="%"
            value={+(assumptions.gpFirmMargin * 100).toFixed(0)}
            onChange={(v) => patch('gpFirmMargin', v / 100)}
            min={20}
            max={75}
            step={1}
            help="Fee-related earnings margin at the GP firm level"
          />
          <SliderInput
            label="Terminal multiple"
            suffix="x"
            value={assumptions.terminalMultiple}
            onChange={(v) => patch('terminalMultiple', v)}
            min={5}
            max={30}
            step={0.5}
            help="Exit multiple applied to FRE"
          />
          <SliderInput
            label="Exit year"
            value={assumptions.exitYear}
            onChange={(v) => patch('exitYear', v)}
            min={7}
            max={25}
            step={1}
          />
        </CardContent>
      </Card>

      <OwnershipEditor
        schedule={assumptions.ownershipSchedule}
        onChange={(s: OwnershipStep[]) => patch('ownershipSchedule', s)}
      />

      <Card>
        <CardHeader className="pb-3 flex-row items-center justify-between space-y-0">
          <CardTitle>Fund Family</CardTitle>
          <Button variant="outline" size="sm" onClick={addFund}>
            <Plus className="h-3 w-3 mr-1" />
            Add fund
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {assumptions.funds.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              No funds configured. Add one to begin.
            </p>
          )}
          {assumptions.funds.map((f) => (
            <FundEditor
              key={f.id}
              fund={f}
              onChange={(u) => updateFund(f.id, u)}
              onRemove={() => removeFund(f.id)}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

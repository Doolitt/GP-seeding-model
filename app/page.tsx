'use client';

import Link from 'next/link';
import { useMemo, useRef } from 'react';
import { Plus, Download, Upload, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePortfolio } from '@/hooks/use-portfolio';
import { runPortfolio } from '@/lib/portfolio';
import { sampleDeals } from '@/lib/defaults';
import { storage } from '@/lib/storage';
import { DealList } from '@/components/portfolio/deal-list';
import { PortfolioKpis } from '@/components/portfolio/portfolio-kpis';
import { PortfolioCashflow } from '@/components/portfolio/portfolio-cashflow';
import { ContributionTable } from '@/components/portfolio/contribution-table';
import { VintageTimeline } from '@/components/portfolio/vintage-timeline';

export default function PortfolioPage() {
  const { deals, loaded, addDeals, toggleDeal, removeDeal, replaceAll } =
    usePortfolio();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const portfolio = useMemo(() => runPortfolio(deals), [deals]);

  const onExport = () => {
    const json = storage.export(deals);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gp-seeding-portfolio-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const onImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imported = storage.import(String(reader.result));
      if (imported) {
        if (
          deals.length === 0 ||
          confirm(
            `Replace existing ${deals.length} deal(s) with ${imported.length} imported deal(s)?`,
          )
        ) {
          replaceAll(imported);
        }
      } else {
        alert('Invalid file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const onLoadSamples = () => {
    if (
      deals.length === 0 ||
      confirm('Add 5 sample deals to your current portfolio?')
    ) {
      addDeals(sampleDeals());
    }
  };

  if (!loaded) {
    return (
      <main className="min-h-screen bg-paper flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Loading…</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper">
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="eyebrow">GP Seeding Economics Model</div>
              <h1 className="display-serif text-2xl md:text-3xl font-medium mt-1 tracking-tight">
                Portfolio Dashboard
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {deals.length === 0
                  ? 'Build your first seed deal to begin'
                  : `${deals.length} deal${deals.length !== 1 ? 's' : ''} · ${portfolio.kpis.activeDealCount} active`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {deals.length > 0 && (
                <>
                  <Button variant="outline" size="sm" onClick={onExport}>
                    <Download className="h-3.5 w-3.5 mr-1.5" />
                    Export
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/json"
                    onChange={onImportFile}
                    className="hidden"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Import
                  </Button>
                </>
              )}
              <Link href="/deal/new">
                <Button size="sm">
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  New Deal
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-6 space-y-6 animate-fade-up">
        {deals.length === 0 ? (
          <EmptyState onLoadSamples={onLoadSamples} />
        ) : (
          <>
            <PortfolioKpis kpis={portfolio.kpis} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <DealList
                  deals={deals}
                  contributions={portfolio.contributions}
                  onToggle={toggleDeal}
                  onRemove={removeDeal}
                />
              </div>
              <div className="lg:col-span-2 space-y-6">
                <PortfolioCashflow rows={portfolio.rows} deals={deals} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <VintageTimeline vintages={portfolio.vintages} />
                  <ContributionTable contributions={portfolio.contributions} />
                </div>
              </div>
            </div>
            <Footer />
          </>
        )}
      </div>
    </main>
  );
}

function EmptyState({ onLoadSamples }: { onLoadSamples: () => void }) {
  return (
    <Card className="py-20 px-6 text-center">
      <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
        <Sparkles className="h-5 w-5 text-accent2" />
      </div>
      <h2 className="display-serif text-xl font-medium">
        No seed deals yet
      </h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">
        Build a deal in under a minute with five key questions, or load a sample
        portfolio to explore the model.
      </p>
      <div className="mt-6 flex items-center justify-center gap-3">
        <Link href="/deal/new">
          <Button>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Create first deal
          </Button>
        </Link>
        <Button variant="outline" onClick={onLoadSamples}>
          <Sparkles className="h-3.5 w-3.5 mr-1.5" />
          Load sample portfolio
        </Button>
      </div>
    </Card>
  );
}

function Footer() {
  return (
    <div className="pt-4 text-center text-[11px] text-muted-foreground">
      Data saved locally in your browser. Use Export / Import to back up.
    </div>
  );
}

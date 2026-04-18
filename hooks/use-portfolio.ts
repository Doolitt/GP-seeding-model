'use client';

import { useCallback, useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import type { Deal } from '@/types';

export function usePortfolio() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setDeals(storage.load());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) storage.save(deals);
  }, [deals, loaded]);

  const addDeal = useCallback(
    (d: Deal) => setDeals((prev) => [...prev, d]),
    [],
  );

  const addDeals = useCallback(
    (ds: Deal[]) => setDeals((prev) => [...prev, ...ds]),
    [],
  );

  const updateDeal = useCallback(
    (id: string, patch: Partial<Deal>) =>
      setDeals((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...patch } : d)),
      ),
    [],
  );

  const removeDeal = useCallback(
    (id: string) => setDeals((prev) => prev.filter((d) => d.id !== id)),
    [],
  );

  const toggleDeal = useCallback(
    (id: string) =>
      setDeals((prev) =>
        prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d)),
      ),
    [],
  );

  const replaceAll = useCallback((ds: Deal[]) => setDeals(ds), []);

  return {
    deals,
    loaded,
    addDeal,
    addDeals,
    updateDeal,
    removeDeal,
    toggleDeal,
    replaceAll,
  };
}

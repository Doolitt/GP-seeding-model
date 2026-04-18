import type { Deal } from '@/types';

const KEY = 'gp-seeding-portfolio-v1';

export const storage = {
  load(): Deal[] {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as Deal[]) : [];
    } catch {
      return [];
    }
  },
  save(deals: Deal[]) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(KEY, JSON.stringify(deals));
    } catch {
      /* quota exceeded, etc */
    }
  },
  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(KEY);
  },
  export(deals: Deal[]): string {
    return JSON.stringify({ version: 1, deals }, null, 2);
  },
  import(json: string): Deal[] | null {
    try {
      const parsed = JSON.parse(json);
      if (parsed && Array.isArray(parsed.deals)) return parsed.deals as Deal[];
      if (Array.isArray(parsed)) return parsed as Deal[];
      return null;
    } catch {
      return null;
    }
  },
};

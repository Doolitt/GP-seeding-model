import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fmtM = (n: number, digits = 1): string => {
  if (!isFinite(n)) return '—';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  return `${sign}$${abs.toFixed(digits)}M`;
};

export const fmtPct = (n: number, digits = 1): string => {
  if (!isFinite(n)) return '—';
  return `${(n * 100).toFixed(digits)}%`;
};

export const fmtX = (n: number, digits = 2): string => {
  if (!isFinite(n)) return '—';
  return `${n.toFixed(digits)}x`;
};

export const fmtYear = (n: number | null): string => {
  return n === null ? 'N/A' : `Year ${n}`;
};

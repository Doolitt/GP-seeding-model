import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GP Seeding Economics Model',
  description: 'Portfolio-level returns model for GP seeding investments — management fee, carry, and terminal equity value.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

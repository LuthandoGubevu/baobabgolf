import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppProviders } from '@/components/AppProviders';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Baobab Golf',
  description:
    'The premier corporate golf challenge. Register your team, track scores, and follow the leaderboard live.',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-body antialiased`}>
        <AppProviders>{children}</AppProviders>
        <Toaster />
      </body>
    </html>
  );
}

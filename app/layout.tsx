import './globals.css';
import type { Metadata } from 'next';
import { Inter, Rajdhani } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { BackgroundAudio } from '@/components/background-audio';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'], variable: '--font-body' });
const rajdhani = Rajdhani({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-heading' });

export const metadata: Metadata = {
  title: 'Military Helper - Missions, Supply, Briefings',
  description:
    'Military Helper keeps your unit ready: coordinate missions, move supplies, and share briefings with the force.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${rajdhani.variable} font-sans`}>
        {children}
        <BackgroundAudio />
        <Toaster richColors position="top-right" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

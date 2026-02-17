import type { Metadata } from 'next';
import './globals.css';
import Providers from '@/components/providers';
import Header from '@/components/header';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'ByFin Dashboard | Tokenized Real-World Assets',
  description: 'DeFi platform for tokenized real-world assets on Base Sepolia. Trade OPR tokens, stake BYFN, and earn yield.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
  },
  openGraph: {
    title: 'ByFin Dashboard',
    description: 'DeFi platform for tokenized real-world assets',
    images: ['/og-image.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js" />
      </head>
      <body className="min-h-screen bg-[#060a14]">
        <Providers>
          <Header />
          <main className="max-w-[1200px] mx-auto px-4 py-6">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}

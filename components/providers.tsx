'use client';

import { useState, useEffect, type ReactNode } from 'react';
import dynamic from 'next/dynamic';

const Web3Provider = dynamic(() => import('./web3-provider'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#060a14] flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export default function Providers({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#060a14] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return <Web3Provider>{children}</Web3Provider>;
}

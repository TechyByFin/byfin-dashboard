'use client';

import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Shield, TrendingUp, Layers, Zap, Hexagon } from 'lucide-react';
import GlassCard from '@/components/ui/card-glass';

const ConnectButton = dynamic(
  () => import('@rainbow-me/rainbowkit').then((mod) => mod.ConnectButton),
  { ssr: false, loading: () => <div className="w-40 h-10 rounded-lg bg-white/5 animate-pulse" /> }
);

const features = [
  { icon: TrendingUp, title: 'DCF Pricing', desc: 'Fair value calculations using Discounted Cash Flow models with reverse theta decay' },
  { icon: Layers, title: 'Dual Exit', desc: 'Trade peer-to-peer on the secondary market or instant-sell to the protocol' },
  { icon: Shield, title: 'Floor Protection', desc: 'Dynamic floor pricing ensures seller protection on all listings' },
  { icon: Zap, title: 'Yield Staking', desc: 'Stake BYFN tokens for tier benefits and boosted platform rewards' },
];

export default function DashboardDisconnected() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
          <Hexagon className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
          Welcome to <span className="text-blue-400">ByFin</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-lg mx-auto mb-8">
          The DeFi platform for tokenized real-world assets on Base Sepolia.
          Trade, stake, and earn yield on OPR tokens.
        </p>
        <ConnectButton />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-[1000px]">
        {features?.map((f, i) => (
          <GlassCard key={f?.title ?? i} delay={0.2 + i * 0.1}>
            <f.icon className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-white font-semibold mb-1">{f?.title}</h3>
            <p className="text-gray-400 text-xs leading-relaxed">{f?.desc}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

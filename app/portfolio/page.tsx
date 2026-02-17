'use client';

import { useAccount, useReadContract } from 'wagmi';
import dynamic from 'next/dynamic';
import { Wallet, Coins, DollarSign, TrendingUp, PieChart, ExternalLink } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import GlassCard from '@/components/ui/card-glass';
import StatCard from '@/components/ui/stat-card';
import { CONTRACTS } from '@/lib/contracts/addresses';
import { ERC20_ABI, STAKING_ABI } from '@/lib/contracts/abis';
import { formatToken, formatUSDC } from '@/lib/format';
import PortfolioChart from './_components/portfolio-chart';

const ConnectButton = dynamic(
  () => import('@rainbow-me/rainbowkit').then((mod) => mod.ConnectButton),
  { ssr: false, loading: () => <div className="w-32 h-10 rounded-lg bg-white/5 animate-pulse" /> }
);

export default function PortfolioPage() {
  const { isConnected, address } = useAccount() ?? {};

  const { data: byfnBalance } = useReadContract({
    address: CONTRACTS.TOKEN,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  }) ?? {};

  const { data: usdcBalance } = useReadContract({
    address: CONTRACTS.USDC,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  }) ?? {};

  const { data: stakedBalance } = useReadContract({
    address: CONTRACTS.STAKING,
    abi: STAKING_ABI,
    functionName: 'stakedBalance',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  }) ?? {};

  const { data: earnedRewards } = useReadContract({
    address: CONTRACTS.STAKING,
    abi: STAKING_ABI,
    functionName: 'earned',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  }) ?? {};

  if (!isConnected) {
    return (
      <div>
        <PageHeader title="Portfolio" description="View your token balances and positions" icon={Wallet} />
        <GlassCard>
          <div className="text-center py-12">
            <Wallet className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 mb-4">Connect your wallet to view your portfolio</p>
            <ConnectButton />
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Portfolio" description="Your token balances and on-chain positions" icon={Wallet} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="BYFN Balance" value={formatToken(byfnBalance as bigint | undefined)} icon={Coins} delay={0.1} />
        <StatCard title="USDC Balance" value={formatUSDC(usdcBalance as bigint | undefined)} icon={DollarSign} delay={0.2} />
        <StatCard title="Staked BYFN" value={formatToken(stakedBalance as bigint | undefined)} icon={TrendingUp} delay={0.3} />
        <StatCard title="Rewards" value={formatToken(earnedRewards as bigint | undefined)} icon={PieChart} suffix=" BYFN" delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        <GlassCard delay={0.5}>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-blue-400" /> Portfolio Allocation
          </h3>
          <div className="h-[250px]">
            <PortfolioChart
              byfn={Number(byfnBalance ?? 0n) / 1e18}
              staked={Number(stakedBalance ?? 0n) / 1e18}
              usdc={Number(usdcBalance ?? 0n) / 1e6}
            />
          </div>
        </GlassCard>

        <GlassCard delay={0.6}>
          <h3 className="text-white font-semibold mb-4">Token Addresses</h3>
          <div className="space-y-3">
            {[
              { label: 'BYFN Token', addr: CONTRACTS.TOKEN },
              { label: 'USDC (Mock)', addr: CONTRACTS.USDC },
              { label: 'OPR Vault', addr: CONTRACTS.OPR_VAULT },
              { label: 'Staking', addr: CONTRACTS.STAKING },
              { label: 'Secondary Market', addr: CONTRACTS.SECONDARY_MARKET },
            ]?.map((item) => (
              <div key={item?.addr} className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">{item?.label}</span>
                <a
                  href={`https://sepolia.basescan.org/address/${item?.addr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 text-xs hover:text-blue-300 transition-colors font-mono"
                >
                  {item?.addr?.slice(0, 6)}...{item?.addr?.slice(-4)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

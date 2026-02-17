'use client';

import { useAccount, useReadContract } from 'wagmi';
import { BarChart3, DollarSign, Coins, Activity, TrendingUp, Layers } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import StatCard from '@/components/ui/stat-card';
import GlassCard from '@/components/ui/card-glass';
import { CONTRACTS } from '@/lib/contracts/addresses';
import { ERC20_ABI, STAKING_ABI, SECONDARY_MARKET_ABI } from '@/lib/contracts/abis';
import { formatToken, formatUSDC } from '@/lib/format';
import DashboardChart from './dashboard-chart';

export default function DashboardConnected() {
  const { address } = useAccount() ?? {};

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

  const { data: totalStaked } = useReadContract({
    address: CONTRACTS.STAKING,
    abi: STAKING_ABI,
    functionName: 'totalStaked',
  }) ?? {};

  const { data: listingCount } = useReadContract({
    address: CONTRACTS.SECONDARY_MARKET,
    abi: SECONDARY_MARKET_ABI,
    functionName: 'listingCounter',
  }) ?? {};

  const { data: feePercent } = useReadContract({
    address: CONTRACTS.SECONDARY_MARKET,
    abi: SECONDARY_MARKET_ABI,
    functionName: 'feePercent',
  }) ?? {};

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Overview of your portfolio and platform activity on Base Sepolia"
        icon={BarChart3}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="BYFN Balance"
          value={formatToken(byfnBalance as bigint | undefined)}
          icon={Coins}
          delay={0.1}
        />
        <StatCard
          title="USDC Balance"
          value={formatUSDC(usdcBalance as bigint | undefined)}
          icon={DollarSign}
          delay={0.2}
        />
        <StatCard
          title="Staked BYFN"
          value={formatToken(stakedBalance as bigint | undefined)}
          icon={TrendingUp}
          delay={0.3}
        />
        <StatCard
          title="Market Listings"
          value={listingCount != null ? Number(listingCount).toString() : '0'}
          icon={Layers}
          delay={0.4}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <div className="lg:col-span-2">
          <GlassCard delay={0.5}>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" />
              Platform Activity
            </h3>
            <div className="h-[280px]">
              <DashboardChart />
            </div>
          </GlassCard>
        </div>
        <GlassCard delay={0.6}>
          <h3 className="text-white font-semibold mb-4">Protocol Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Total Staked</span>
              <span className="text-white font-medium">{formatToken(totalStaked as bigint | undefined)} BYFN</span>
            </div>
            <div className="w-full h-px bg-white/5" />
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Market Fee</span>
              <span className="text-white font-medium">{feePercent != null ? `${Number(feePercent)}%` : '—'}</span>
            </div>
            <div className="w-full h-px bg-white/5" />
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Total Listings</span>
              <span className="text-white font-medium">{listingCount != null ? Number(listingCount).toString() : '0'}</span>
            </div>
            <div className="w-full h-px bg-white/5" />
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Network</span>
              <span className="text-blue-400 font-medium text-sm">Base Sepolia</span>
            </div>
            <div className="w-full h-px bg-white/5" />
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Pricing Model</span>
              <span className="text-blue-400 font-medium text-sm">DCF / Theta</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

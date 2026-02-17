'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import dynamic from 'next/dynamic';
import { Coins, Shield, Award, Zap, Star, Lock, TrendingUp, Gift, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import GlassCard from '@/components/ui/card-glass';
import StatCard from '@/components/ui/stat-card';
import TxButton from '@/components/ui/tx-button';
import { CONTRACTS } from '@/lib/contracts/addresses';
import { ERC20_ABI, STAKING_ABI } from '@/lib/contracts/abis';
import { formatToken } from '@/lib/format';

const ConnectButton = dynamic(
  () => import('@rainbow-me/rainbowkit').then((mod) => mod.ConnectButton),
  { ssr: false, loading: () => <div className="w-32 h-10 rounded-lg bg-white/5 animate-pulse" /> }
);

const TIERS = [
  { name: 'Bronze', minStake: '1,000', benefits: ['5% fee discount', 'Basic analytics'], color: '#CD7F32', icon: Shield },
  { name: 'Silver', minStake: '10,000', benefits: ['10% fee discount', 'Priority listings', 'Advanced analytics'], color: '#C0C0C0', icon: Award },
  { name: 'Gold', minStake: '50,000', benefits: ['15% fee discount', 'Early access', 'Premium analytics', 'Governance votes'], color: '#FFD700', icon: Star },
  { name: 'Diamond', minStake: '100,000', benefits: ['20% fee discount', 'Exclusive pools', 'All benefits', 'Fee sharing'], color: '#B9F2FF', icon: Zap },
];

export default function StakingPage() {
  const { isConnected, address } = useAccount() ?? {};
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [activeAction, setActiveAction] = useState<'stake' | 'unstake'>('stake');

  const { data: byfnBalance } = useReadContract({
    address: CONTRACTS.TOKEN,
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

  const { data: totalStaked } = useReadContract({
    address: CONTRACTS.STAKING,
    abi: STAKING_ABI,
    functionName: 'totalStaked',
  }) ?? {};

  const { data: stakingTier } = useReadContract({
    address: CONTRACTS.STAKING,
    abi: STAKING_ABI,
    functionName: 'getStakingTier',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  }) ?? {};

  const { writeContractAsync } = useWriteContract();

  const handleStake = async () => {
    if (!stakeAmount || !address) return;
    const amount = parseUnits(stakeAmount, 18);
    await writeContractAsync?.({
      address: CONTRACTS.TOKEN,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.STAKING, amount],
    });
    await writeContractAsync?.({
      address: CONTRACTS.STAKING,
      abi: STAKING_ABI,
      functionName: 'stake',
      args: [amount],
    });
    setStakeAmount('');
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || !address) return;
    const amount = parseUnits(unstakeAmount, 18);
    await writeContractAsync?.({
      address: CONTRACTS.STAKING,
      abi: STAKING_ABI,
      functionName: 'unstake',
      args: [amount],
    });
    setUnstakeAmount('');
  };

  const handleClaimRewards = async () => {
    if (!address) return;
    await writeContractAsync?.({
      address: CONTRACTS.STAKING,
      abi: STAKING_ABI,
      functionName: 'claimRewards',
      args: [],
    });
  };

  const currentTierNum = stakingTier != null ? Number(stakingTier) : 0;

  return (
    <div>
      <PageHeader
        title="Staking"
        description="Stake BYFN tokens to unlock tier benefits and earn platform rewards"
        icon={Coins}
      />

      {!isConnected && (
        <GlassCard className="mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
            <p className="text-gray-300 text-sm">Connect your wallet to stake BYFN tokens.</p>
            <div className="ml-auto"><ConnectButton /></div>
          </div>
        </GlassCard>
      )}

      {isConnected && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard title="Available BYFN" value={formatToken(byfnBalance as bigint | undefined)} icon={Coins} delay={0.1} />
            <StatCard title="Staked BYFN" value={formatToken(stakedBalance as bigint | undefined)} icon={Lock} delay={0.2} />
            <StatCard title="Rewards Earned" value={formatToken(earnedRewards as bigint | undefined)} icon={Gift} delay={0.3} />
            <StatCard title="Total Protocol Staked" value={formatToken(totalStaked as bigint | undefined)} icon={TrendingUp} delay={0.4} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
            <GlassCard delay={0.5}>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveAction('stake')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeAction === 'stake' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  Stake
                </button>
                <button
                  onClick={() => setActiveAction('unstake')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeAction === 'unstake' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400'
                  }`}
                >
                  Unstake
                </button>
              </div>

              {activeAction === 'stake' ? (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Amount to stake"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e?.target?.value ?? '')}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 pr-16"
                    />
                    <button
                      onClick={() => {
                        const bal = byfnBalance as bigint | undefined;
                        if (bal) setStakeAmount((Number(bal) / 1e18).toString());
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded bg-blue-500/10"
                    >
                      MAX
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Available: {formatToken(byfnBalance as bigint | undefined)} BYFN</p>
                  <TxButton onClick={handleStake} className="w-full">
                    Approve & Stake
                  </TxButton>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="Amount to unstake"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e?.target?.value ?? '')}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 pr-16"
                    />
                    <button
                      onClick={() => {
                        const bal = stakedBalance as bigint | undefined;
                        if (bal) setUnstakeAmount((Number(bal) / 1e18).toString());
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-blue-400 hover:text-blue-300 px-2 py-1 rounded bg-blue-500/10"
                    >
                      MAX
                    </button>
                  </div>
                  <p className="text-xs text-gray-500">Staked: {formatToken(stakedBalance as bigint | undefined)} BYFN</p>
                  <TxButton onClick={handleUnstake} className="w-full" variant="secondary">
                    Unstake
                  </TxButton>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-white/5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Claimable Rewards</span>
                  <span className="text-white font-medium">{formatToken(earnedRewards as bigint | undefined)} BYFN</span>
                </div>
                <TxButton onClick={handleClaimRewards} className="w-full" variant="secondary">
                  <Gift className="w-4 h-4" /> Claim Rewards
                </TxButton>
              </div>
            </GlassCard>

            <GlassCard delay={0.6}>
              <h3 className="text-white font-semibold mb-4">Your Staking Tier</h3>
              <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-white/5">
                {currentTierNum > 0 ? (
                  <>
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ backgroundColor: `${TIERS[currentTierNum - 1]?.color ?? '#3B82F6'}20` }}
                    >
                      {(() => {
                        const TierIcon = TIERS[currentTierNum - 1]?.icon ?? Shield;
                        return <TierIcon className="w-6 h-6" style={{ color: TIERS[currentTierNum - 1]?.color ?? '#3B82F6' }} />;
                      })()}
                    </div>
                    <div>
                      <p className="text-white font-semibold">{TIERS[currentTierNum - 1]?.name ?? 'Unknown'} Tier</p>
                      <p className="text-gray-400 text-xs">Active staking benefits</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
                      <Shield className="w-6 h-6 text-gray-500" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">No Tier</p>
                      <p className="text-gray-400 text-xs">Stake BYFN to unlock benefits</p>
                    </div>
                  </>
                )}
              </div>

              <div className="space-y-3">
                {TIERS?.map((tier, i) => {
                  const TIcon = tier?.icon ?? Shield;
                  const isActive = currentTierNum === i + 1;
                  return (
                    <div
                      key={tier?.name}
                      className={`p-3 rounded-xl border transition-all ${
                        isActive
                          ? 'border-blue-500/30 bg-blue-500/5'
                          : 'border-white/5 bg-white/[0.02]'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <TIcon className="w-4 h-4" style={{ color: tier?.color ?? '#3B82F6' }} />
                        <span className="text-white text-sm font-medium">{tier?.name}</span>
                        <span className="text-gray-500 text-xs ml-auto">≥ {tier?.minStake} BYFN</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {tier?.benefits?.map((b) => (
                          <span key={b} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{b}</span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          </div>
        </>
      )}
    </div>
  );
}

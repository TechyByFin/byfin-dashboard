'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useConfig } from 'wagmi';
import { waitForTransactionReceipt } from '@wagmi/core';
import { parseUnits } from 'viem';
import dynamic from 'next/dynamic';
import { Shield, Award, Star, Zap } from 'lucide-react';
import { CONTRACTS } from '@/lib/contracts/addresses';
import { ERC20_ABI, STAKING_ABI } from '@/lib/contracts/abis';
import { formatToken } from '@/lib/format';

const ConnectButton = dynamic(
  () => import('@rainbow-me/rainbowkit').then((mod) => mod.ConnectButton),
  { ssr: false }
);

const TIERS = [
  { name: 'Bronze', minStake: '1,000', benefits: ['5% fee discount', 'Basic analytics'], color: '#CD7F32', icon: Shield },
  { name: 'Silver', minStake: '10,000', benefits: ['10% fee discount', 'Priority listings', 'Advanced analytics'], color: '#C0C0C0', icon: Award },
  { name: 'Gold', minStake: '50,000', benefits: ['15% fee discount', 'Early access', 'Premium analytics', 'Governance votes'], color: '#FFD700', icon: Star },
  { name: 'Diamond', minStake: '100,000', benefits: ['20% fee discount', 'Exclusive pools', 'All benefits', 'Fee sharing'], color: '#B9F2FF', icon: Zap },
];

export default function StakingPage() {
  const { isConnected, address } = useAccount();
  const config = useConfig();
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [activeAction, setActiveAction] = useState<'stake' | 'unstake'>('stake');
  const [isPending, setIsPending] = useState(false);

  const { data: byfnBalance } = useReadContract({
    address: CONTRACTS.TOKEN,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: stakedBalance } = useReadContract({
    address: CONTRACTS.STAKING,
    abi: STAKING_ABI,
    functionName: 'stakedBalance',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: earnedRewards } = useReadContract({
    address: CONTRACTS.STAKING,
    abi: STAKING_ABI,
    functionName: 'earned',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { data: stakingTier } = useReadContract({
    address: CONTRACTS.STAKING,
    abi: STAKING_ABI,
    functionName: 'getStakingTier',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const { writeContractAsync } = useWriteContract();

  const handleStake = async () => {
    if (!stakeAmount || !address) return;
    setIsPending(true);
    try {
      const amount = parseUnits(stakeAmount, 18);
      
      // 1. Send Approval
      const approveHash = await writeContractAsync({
        address: CONTRACTS.TOKEN,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [CONTRACTS.STAKING, amount],
      });
      
      // 2. WAIT for the blockchain to confirm the approval
      if (approveHash) {
        await waitForTransactionReceipt(config, { hash: approveHash });
      }

      // 3. Now it is safe to Stake
      await writeContractAsync({
        address: CONTRACTS.STAKING,
        abi: STAKING_ABI,
        functionName: 'stake',
        args: [amount],
      });
      
      setStakeAmount('');
    } catch (error) {
      console.error("Staking failed:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleUnstake = async () => {
    if (!unstakeAmount || !address) return;
    setIsPending(true);
    try {
      const amount = parseUnits(unstakeAmount, 18);
      await writeContractAsync({
        address: CONTRACTS.STAKING,
        abi: STAKING_ABI,
        functionName: 'unstake',
        args: [amount],
      });
      setUnstakeAmount('');
    } catch (error) {
      console.error("Unstaking failed:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleClaimRewards = async () => {
    if (!address) return;
    setIsPending(true);
    try {
      await writeContractAsync({
        address: CONTRACTS.STAKING,
        abi: STAKING_ABI,
        functionName: 'claimRewards',
        args: [],
      });
    } catch (error) {
      console.error("Claiming failed:", error);
    } finally {
      setIsPending(false);
    }
  };

  const currentTierNum = stakingTier != null ? Number(stakingTier) : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Staking</h1>
        <ConnectButton />
      </div>

      {!isConnected && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-400">
          Connect your wallet to stake BYFN tokens.
        </div>
      )}

      {isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Staking Actions */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-6">
            <div className="flex bg-black/20 rounded-lg p-1">
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Amount to Stake</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 pr-16"
                      placeholder="0.0"
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
                  <p className="text-xs text-gray-500 mt-2">
                    Available: {formatToken(byfnBalance as bigint | undefined)} BYFN
                  </p>
                </div>
                <button
                  onClick={handleStake}
                  disabled={isPending || !stakeAmount}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {isPending ? 'Processing...' : 'Approve & Stake'}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Amount to Unstake</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 pr-16"
                      placeholder="0.0"
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
                  <p className="text-xs text-gray-500 mt-2">
                    Staked: {formatToken(stakedBalance as bigint | undefined)} BYFN
                  </p>
                </div>
                <button
                  onClick={handleUnstake}
                  disabled={isPending || !unstakeAmount}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white py-3 rounded-lg font-medium transition-colors"
                >
                  {isPending ? 'Processing...' : 'Unstake'}
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Stats & Rewards */}
          <div className="space-y-6">
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Your Stats</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Total Staked</span>
                  <span className="text-white font-medium">{formatToken(stakedBalance as bigint | undefined)} BYFN</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Current Tier</span>
                  <span className="text-blue-400 font-medium">{currentTierNum > 0 ? TIERS[currentTierNum - 1].name : 'None'}</span>
                </div>
                <div className="pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-400">Claimable Rewards</span>
                    <span className="text-green-400 font-medium">{formatToken(earnedRewards as bigint | undefined)} BYFN</span>
                  </div>
                  <button
                    onClick={handleClaimRewards}
                    disabled={isPending || !earnedRewards || Number(earnedRewards) === 0}
                    className="w-full bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white py-2 rounded-lg font-medium transition-colors"
                  >
                    {isPending ? 'Processing...' : 'Claim Rewards'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { parseUnits } from 'viem';
import dynamic from 'next/dynamic';
import { Rocket, Clock, TrendingUp, Shield, DollarSign, AlertCircle } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import GlassCard from '@/components/ui/card-glass';
import TxButton from '@/components/ui/tx-button';
import { CONTRACTS } from '@/lib/contracts/addresses';
import { ERC20_ABI } from '@/lib/contracts/abis';

const ConnectButton = dynamic(
  () => import('@rainbow-me/rainbowkit').then((mod) => mod.ConnectButton),
  { ssr: false, loading: () => <div className="w-32 h-10 rounded-lg bg-white/5 animate-pulse" /> }
);

const SAMPLE_OFFERINGS = [
  {
    id: 1,
    name: 'Dubai Commercial Real Estate Fund',
    symbol: 'DCRE-OPR',
    faceValue: '1,000',
    yield: '8.5%',
    maturity: '24 months',
    raised: 75,
    target: '$500,000',
    minInvest: '$100',
    status: 'active' as const,
    description: 'Tokenized ownership in Grade-A commercial real estate in Dubai Business Bay.',
  },
  {
    id: 2,
    name: 'Singapore Trade Finance Pool',
    symbol: 'STFP-OPR',
    faceValue: '500',
    yield: '6.2%',
    maturity: '12 months',
    raised: 92,
    target: '$300,000',
    minInvest: '$50',
    status: 'active' as const,
    description: 'Short-term trade finance receivables from verified Singapore exporters.',
  },
  {
    id: 3,
    name: 'Green Energy Infrastructure',
    symbol: 'GEI-OPR',
    faceValue: '2,000',
    yield: '10.0%',
    maturity: '36 months',
    raised: 45,
    target: '$1,000,000',
    minInvest: '$250',
    status: 'upcoming' as const,
    description: 'Solar and wind farm infrastructure financing across Southeast Asia.',
  },
];

export default function LaunchpadPage() {
  const { isConnected, address } = useAccount() ?? {};
  const [selectedOffering, setSelectedOffering] = useState<number | null>(null);
  const [investAmount, setInvestAmount] = useState('');

  const { data: usdcBalance } = useReadContract({
    address: CONTRACTS.USDC,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  }) ?? {};

  const { writeContractAsync: approveUSDC } = useWriteContract();

  const handleInvest = async (offeringId: number) => {
    if (!investAmount || !address) return;
    const amount = parseUnits(investAmount, 6);
    await approveUSDC?.({
      address: CONTRACTS.USDC,
      abi: ERC20_ABI,
      functionName: 'approve',
      args: [CONTRACTS.LAUNCHPAD, amount],
    });
    setInvestAmount('');
    setSelectedOffering(null);
  };

  return (
    <div>
      <PageHeader
        title="Launchpad"
        description="Participate in initial OPR token offerings for tokenized real-world assets"
        icon={Rocket}
      />

      {!isConnected && (
        <GlassCard className="mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
            <p className="text-gray-300 text-sm">Connect your wallet to participate in offerings.</p>
            <div className="ml-auto">
              <ConnectButton />
            </div>
          </div>
        </GlassCard>
      )}

      <div className="space-y-4">
        {SAMPLE_OFFERINGS?.map((offering, i) => (
          <GlassCard key={offering?.id ?? i} delay={0.1 * i} className="!p-0 overflow-hidden">
            <div className="p-5">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider ${
                      offering?.status === 'active'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                    }`}>
                      {offering?.status}
                    </span>
                    <span className="text-[10px] text-gray-500 uppercase tracking-wider">{offering?.symbol}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-1">{offering?.name}</h3>
                  <p className="text-gray-400 text-sm mb-4">{offering?.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-3.5 h-3.5 text-blue-400" />
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">Face Value</p>
                        <p className="text-sm text-white font-medium">${offering?.faceValue}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-green-400" />
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">Yield</p>
                        <p className="text-sm text-white font-medium">{offering?.yield}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-purple-400" />
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">Maturity</p>
                        <p className="text-sm text-white font-medium">{offering?.maturity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-yellow-400" />
                      <div>
                        <p className="text-[10px] text-gray-500 uppercase">Min Invest</p>
                        <p className="text-sm text-white font-medium">{offering?.minInvest}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:text-right md:min-w-[180px]">
                  <p className="text-xs text-gray-500 mb-1">Target: {offering?.target}</p>
                  <div className="w-full bg-white/5 rounded-full h-2 mb-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all"
                      style={{ width: `${offering?.raised ?? 0}%` }}
                    />
                  </div>
                  <p className="text-sm text-white font-medium mb-3">{offering?.raised}% raised</p>

                  {isConnected && offering?.status === 'active' && (
                    <button
                      onClick={() => setSelectedOffering(selectedOffering === offering?.id ? null : (offering?.id ?? null))}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-all"
                    >
                      {selectedOffering === offering?.id ? 'Close' : 'Invest'}
                    </button>
                  )}
                  {offering?.status === 'upcoming' && (
                    <button disabled className="w-full bg-white/5 text-gray-500 text-sm font-medium py-2 px-4 rounded-lg cursor-not-allowed">
                      Coming Soon
                    </button>
                  )}
                </div>
              </div>

              {selectedOffering === offering?.id && (
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="number"
                      placeholder="USDC amount"
                      value={investAmount}
                      onChange={(e) => setInvestAmount(e?.target?.value ?? '')}
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
                    />
                    <TxButton onClick={() => handleInvest(offering?.id ?? 0)}>
                      Approve & Invest
                    </TxButton>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Balance: {usdcBalance != null ? (Number(usdcBalance) / 1e6).toFixed(2) : '0.00'} USDC
                  </p>
                </div>
              )}
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

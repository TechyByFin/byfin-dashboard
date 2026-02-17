'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import dynamic from 'next/dynamic';
import { ArrowLeftRight, ShoppingCart, Tag, TrendingDown, AlertCircle, ArrowUpDown } from 'lucide-react';
import PageHeader from '@/components/ui/page-header';
import GlassCard from '@/components/ui/card-glass';
import TxButton from '@/components/ui/tx-button';
import { CONTRACTS } from '@/lib/contracts/addresses';
import { SECONDARY_MARKET_ABI, ERC1155_ABI } from '@/lib/contracts/abis';
import { formatWAD, shortenAddress } from '@/lib/format';

const ConnectButton = dynamic(
  () => import('@rainbow-me/rainbowkit').then((mod) => mod.ConnectButton),
  { ssr: false, loading: () => <div className="w-32 h-10 rounded-lg bg-white/5 animate-pulse" /> }
);

export default function MarketPage() {
  const { isConnected, address } = useAccount() ?? {};
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [sellTokenId, setSellTokenId] = useState('');
  const [sellAmount, setSellAmount] = useState('');

  const { data: listingCounter } = useReadContract({
    address: CONTRACTS.SECONDARY_MARKET,
    abi: SECONDARY_MARKET_ABI,
    functionName: 'listingCounter',
  }) ?? {};

  const { data: spreadBps } = useReadContract({
    address: CONTRACTS.SECONDARY_MARKET,
    abi: SECONDARY_MARKET_ABI,
    functionName: 'spreadBps',
  }) ?? {};

  const { data: feePercent } = useReadContract({
    address: CONTRACTS.SECONDARY_MARKET,
    abi: SECONDARY_MARKET_ABI,
    functionName: 'feePercent',
  }) ?? {};

  const { writeContractAsync } = useWriteContract();

  const handleBuyListing = async (listingId: number) => {
    if (!address) return;
    await writeContractAsync?.({
      address: CONTRACTS.SECONDARY_MARKET,
      abi: SECONDARY_MARKET_ABI,
      functionName: 'buyListing',
      args: [BigInt(listingId), CONTRACTS.USDC],
    });
  };

  const handleCreateListing = async () => {
    if (!sellTokenId || !sellAmount || !address) return;
    await writeContractAsync?.({
      address: CONTRACTS.OPR_VAULT,
      abi: ERC1155_ABI,
      functionName: 'setApprovalForAll',
      args: [CONTRACTS.SECONDARY_MARKET, true],
    });
    await writeContractAsync?.({
      address: CONTRACTS.SECONDARY_MARKET,
      abi: SECONDARY_MARKET_ABI,
      functionName: 'createListing',
      args: [BigInt(sellTokenId), BigInt(sellAmount)],
    });
    setSellTokenId('');
    setSellAmount('');
  };

  const handleInstantSell = async () => {
    if (!sellTokenId || !sellAmount || !address) return;
    await writeContractAsync?.({
      address: CONTRACTS.OPR_VAULT,
      abi: ERC1155_ABI,
      functionName: 'setApprovalForAll',
      args: [CONTRACTS.SECONDARY_MARKET, true],
    });
    await writeContractAsync?.({
      address: CONTRACTS.SECONDARY_MARKET,
      abi: SECONDARY_MARKET_ABI,
      functionName: 'sellToProtocol',
      args: [BigInt(sellTokenId), BigInt(sellAmount), CONTRACTS.USDC],
    });
    setSellTokenId('');
    setSellAmount('');
  };

  const listingCountNum = listingCounter != null ? Number(listingCounter) : 0;

  return (
    <div>
      <PageHeader
        title="Secondary Market"
        description="Buy and sell OPR tokens with DCF-based fair value pricing"
        icon={ArrowLeftRight}
      />

      {!isConnected && (
        <GlassCard className="mb-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0" />
            <p className="text-gray-300 text-sm">Connect your wallet to trade on the secondary market.</p>
            <div className="ml-auto"><ConnectButton /></div>
          </div>
        </GlassCard>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <GlassCard delay={0.1}>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Active Listings</p>
          <p className="text-2xl font-bold text-white">{listingCountNum}</p>
        </GlassCard>
        <GlassCard delay={0.2}>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Protocol Fee</p>
          <p className="text-2xl font-bold text-white">{feePercent != null ? `${Number(feePercent)}%` : '—'}</p>
          <p className="text-[10px] text-gray-500">On profit only</p>
        </GlassCard>
        <GlassCard delay={0.3}>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Instant Sell Spread</p>
          <p className="text-2xl font-bold text-white">{spreadBps != null ? `${(Number(spreadBps) / 100).toFixed(2)}%` : '—'}</p>
          <p className="text-[10px] text-gray-500">Discount from mid price</p>
        </GlassCard>
      </div>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('buy')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'buy' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <ShoppingCart className="w-4 h-4" /> Buy OPR
        </button>
        <button
          onClick={() => setActiveTab('sell')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'sell' ? 'bg-blue-600 text-white' : 'bg-white/5 text-gray-400 hover:text-white'
          }`}
        >
          <Tag className="w-4 h-4" /> Sell OPR
        </button>
      </div>

      {activeTab === 'buy' && (
        <div>
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-blue-400" /> Active Listings
          </h3>
          {listingCountNum === 0 ? (
            <GlassCard>
              <div className="text-center py-8">
                <ArrowLeftRight className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No active listings at the moment</p>
                <p className="text-gray-500 text-sm">Be the first to list your OPR tokens</p>
              </div>
            </GlassCard>
          ) : (
            <div className="space-y-3">
              {Array.from({ length: Math.min(listingCountNum, 10) })?.map((_, i) => (
                <ListingRow key={i} listingId={i} onBuy={handleBuyListing} isConnected={isConnected ?? false} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'sell' && isConnected && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-400" /> Create Listing (Exit A)
            </h3>
            <p className="text-gray-400 text-xs mb-4">List your OPR tokens for other users to buy at fair market price.</p>
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Token ID"
                value={sellTokenId}
                onChange={(e) => setSellTokenId(e?.target?.value ?? '')}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
              />
              <input
                type="number"
                placeholder="Amount"
                value={sellAmount}
                onChange={(e) => setSellAmount(e?.target?.value ?? '')}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
              />
              <TxButton onClick={handleCreateListing} className="w-full">
                Create Listing
              </TxButton>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-orange-400" /> Instant Sell (Exit B)
            </h3>
            <p className="text-gray-400 text-xs mb-4">Sell instantly to the protocol at a discounted price (mid price minus spread).</p>
            <div className="space-y-3">
              <input
                type="number"
                placeholder="Token ID"
                value={sellTokenId}
                onChange={(e) => setSellTokenId(e?.target?.value ?? '')}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
              />
              <input
                type="number"
                placeholder="Amount"
                value={sellAmount}
                onChange={(e) => setSellAmount(e?.target?.value ?? '')}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50"
              />
              <TxButton onClick={handleInstantSell} className="w-full" variant="secondary">
                Instant Sell to Protocol
              </TxButton>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}

function ListingRow({ listingId, onBuy, isConnected }: { listingId: number; onBuy: (id: number) => Promise<void>; isConnected: boolean }) {
  const { data: listing } = useReadContract({
    address: CONTRACTS.SECONDARY_MARKET,
    abi: SECONDARY_MARKET_ABI,
    functionName: 'listings',
    args: [BigInt(listingId)],
  }) ?? {};

  const arr = listing as [string, bigint, bigint, bigint, boolean] | undefined;
  if (!arr || !arr?.[4]) return null;

  const seller = arr?.[0] ?? '';
  const tokenId = arr?.[1];
  const amount = arr?.[2];
  const floorPrice = arr?.[3];

  return (
    <GlassCard className="!p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Tag className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <p className="text-white font-medium">Listing #{listingId}</p>
            <p className="text-gray-500 text-xs">Token ID: {tokenId?.toString() ?? '?'} · Seller: {shortenAddress(seller)}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-white font-medium">{amount?.toString() ?? '0'} OPR</p>
            <p className="text-gray-400 text-xs">Floor: {formatWAD(floorPrice)} USDC</p>
          </div>
          {isConnected && (
            <TxButton onClick={() => onBuy(listingId)} className="text-xs">
              Buy
            </TxButton>
          )}
        </div>
      </div>
    </GlassCard>
  );
}

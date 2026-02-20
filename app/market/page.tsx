'use client';

import { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useConfig } from 'wagmi';
import { waitForTransactionReceipt } from '@wagmi/core';
import dynamic from 'next/dynamic';
import { CONTRACTS } from '@/lib/contracts/addresses';
import { SECONDARY_MARKET_ABI, ERC1155_ABI } from '@/lib/contracts/abis';
import { formatWAD, shortenAddress } from '@/lib/format';

const ConnectButton = dynamic(
  () => import('@rainbow-me/rainbowkit').then((mod) => mod.ConnectButton),
  { ssr: false }
);

export default function MarketPage() {
  const { isConnected, address } = useAccount();
  const config = useConfig();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [sellTokenId, setSellTokenId] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [isPending, setIsPending] = useState(false);

  const { data: listingCounter } = useReadContract({
    address: CONTRACTS.SECONDARY_MARKET,
    abi: SECONDARY_MARKET_ABI,
    functionName: 'listingCounter',
  });

  const { writeContractAsync } = useWriteContract();

  const handleBuyListing = async (listingId: number) => {
    if (!address) return;
    setIsPending(true);
    try {
      await writeContractAsync({
        address: CONTRACTS.SECONDARY_MARKET,
        abi: SECONDARY_MARKET_ABI,
        functionName: 'buyListing',
        args: [BigInt(listingId), CONTRACTS.USDC],
      });
    } catch (error) {
      console.error("Buy failed:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleCreateListing = async () => {
    if (!sellTokenId || !sellAmount || !address) return;
    setIsPending(true);
    try {
      const approveHash = await writeContractAsync({
        address: CONTRACTS.OPR_VAULT,
        abi: ERC1155_ABI,
        functionName: 'setApprovalForAll',
        args: [CONTRACTS.SECONDARY_MARKET, true],
      });
      
      if (approveHash) {
        await waitForTransactionReceipt(config, { hash: approveHash });
      }

      await writeContractAsync({
        address: CONTRACTS.SECONDARY_MARKET,
        abi: SECONDARY_MARKET_ABI,
        functionName: 'createListing',
        args: [BigInt(sellTokenId), BigInt(sellAmount)],
      });
      
      setSellTokenId('');
      setSellAmount('');
    } catch (error) {
      console.error("Listing failed:", error);
    } finally {
      setIsPending(false);
    }
  };

  const handleInstantSell = async () => {
    if (!sellTokenId || !sellAmount || !address) return;
    setIsPending(true);
    try {
      const approveHash = await writeContractAsync({
        address: CONTRACTS.OPR_VAULT,
        abi: ERC1155_ABI,
        functionName: 'setApprovalForAll',
        args: [CONTRACTS.SECONDARY_MARKET, true],
      });
      
      if (approveHash) {
        await waitForTransactionReceipt(config, { hash: approveHash });
      }

      await writeContractAsync({
        address: CONTRACTS.SECONDARY_MARKET,
        abi: SECONDARY_MARKET_ABI,
        functionName: 'sellToProtocol',
        args: [BigInt(sellTokenId), BigInt(sellAmount), CONTRACTS.USDC],
      });
      
      setSellTokenId('');
      setSellAmount('');
    } catch (error) {
      console.error("Instant sell failed:", error);
    } finally {
      setIsPending(false);
    }
  };

  const listingCountNum = listingCounter != null ? Number(listingCounter) : 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-white">Secondary Market</h1>
        <ConnectButton />
      </div>

      {!isConnected && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center text-gray-400">
          Connect your wallet to trade on the secondary market.
        </div>
      )}

      {isConnected && (
        <div className="space-y-6">
          <div className="flex bg-black/20 rounded-lg p-1 w-fit">
            <button
              onClick={() => setActiveTab('buy')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'buy' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Buy OPR
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'sell' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sell OPR
            </button>
          </div>

          {activeTab === 'buy' && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-medium text-white mb-4">Active Listings</h3>
              {listingCountNum === 0 ? (
                <p className="text-gray-400 text-center py-8">No active listings at the moment.</p>
              ) : (
                <div className="space-y-4">
                  {Array.from({ length: Math.min(listingCountNum, 10) }).map((_, i) => (
                    <ListingRow key={i} listingId={i} onBuy={handleBuyListing} isConnected={isConnected} isPending={isPending} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'sell' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-medium text-white">Create Listing (Exit A)</h3>
                <p className="text-sm text-gray-400">List your OPR tokens for other users to buy.</p>
                <input
                  type="number"
                  placeholder="Token ID"
                  value={sellTokenId}
                  onChange={(e) => setSellTokenId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                />
                <input
                  type="number"
                  placeholder="Amount of OPR"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                />
                <button
                  onClick={handleCreateListing}
                  disabled={isPending || !sellTokenId || !sellAmount}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white py-2 rounded-lg font-medium"
                >
                  {isPending ? 'Processing...' : 'Create Listing'}
                </button>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-medium text-white">Instant Sell (Exit B)</h3>
                <p className="text-sm text-gray-400">Sell instantly to the protocol at a discount.</p>
                <input
                  type="number"
                  placeholder="Token ID"
                  value={sellTokenId}
                  onChange={(e) => setSellTokenId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                />
                <input
                  type="number"
                  placeholder="Amount of OPR"
                  value={sellAmount}
                  onChange={(e) => setSellAmount(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white text-sm"
                />
                <button
                  onClick={handleInstantSell}
                  disabled={isPending || !sellTokenId || !sellAmount}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white py-2 rounded-lg font-medium"
                >
                  {isPending ? 'Processing...' : 'Instant Sell to Protocol'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ListingRow({ listingId, onBuy, isConnected, isPending }: { listingId: number; onBuy: (id: number) => Promise<void>; isConnected: boolean; isPending: boolean }) {
  const { data: listing } = useReadContract({
    address: CONTRACTS.SECONDARY_MARKET,
    abi: SECONDARY_MARKET_ABI,
    functionName: 'listings',
    args: [BigInt(listingId)],
  });

  const arr = listing as [string, bigint, bigint, bigint, boolean] | undefined;
  if (!arr || !arr[4]) return null;

  const seller = arr[0];
  const tokenId = arr[1];
  const amount = arr[2];
  const floorPrice = arr[3];

  return (
    <div className="flex justify-between items-center p-4 bg-white/5 rounded-lg border border-white/10">
      <div>
        <p className="text-white font-medium">Token ID: {tokenId.toString()}</p>
        <p className="text-sm text-gray-400">Seller: {shortenAddress(seller)}</p>
      </div>
      <div className="text-right">
        <p className="text-white font-medium">{amount.toString()} OPR</p>
        <p className="text-sm text-gray-400">Floor: {formatWAD(floorPrice)} USDC</p>
      </div>
      {isConnected && (
        <button
          onClick={() => onBuy(listingId)}
          disabled={isPending}
          className="ml-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          Buy
        </button>
      )}
    </div>
  );
}

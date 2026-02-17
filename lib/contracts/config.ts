'use client';

import { http, createConfig } from 'wagmi';
import { baseSepolia } from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? '';
const WALLETCONNECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? '';

const baseSepoliaWithAlchemy = {
  ...baseSepolia,
  rpcUrls: {
    ...baseSepolia.rpcUrls,
    default: {
      http: [`https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`],
    },
  },
};

export const wagmiConfig = getDefaultConfig({
  appName: 'ByFin Dashboard',
  projectId: WALLETCONNECT_ID,
  chains: [baseSepoliaWithAlchemy],
  transports: {
    [baseSepolia.id]: http(`https://base-sepolia.g.alchemy.com/v2/${ALCHEMY_KEY}`),
  },
  ssr: true,
});

'use client';

import { useAccount } from 'wagmi';
import DashboardConnected from './_components/dashboard-connected';
import DashboardDisconnected from './_components/dashboard-disconnected';

export default function HomePage() {
  const { isConnected } = useAccount() ?? {};
  return isConnected ? <DashboardConnected /> : <DashboardDisconnected />;
}

import { formatUnits } from 'viem';

export function formatWAD(value: bigint | undefined | null, decimals: number = 4): string {
  if (value == null) return '0.00';
  try {
    const formatted = formatUnits(value, 18);
    const num = parseFloat(formatted);
    if (isNaN(num)) return '0.00';
    return num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: decimals });
  } catch {
    return '0.00';
  }
}

export function formatUSDC(value: bigint | undefined | null, decimals: number = 2): string {
  if (value == null) return '$0.00';
  try {
    const formatted = formatUnits(value, 6);
    const num = parseFloat(formatted);
    if (isNaN(num)) return '$0.00';
    return '$' + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: decimals });
  } catch {
    return '$0.00';
  }
}

export function formatToken(value: bigint | undefined | null, tokenDecimals: number = 18, displayDecimals: number = 4): string {
  if (value == null) return '0';
  try {
    const formatted = formatUnits(value, tokenDecimals);
    const num = parseFloat(formatted);
    if (isNaN(num)) return '0';
    return num.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: displayDecimals });
  } catch {
    return '0';
  }
}

export function formatBps(bps: bigint | number | undefined | null): string {
  if (bps == null) return '0%';
  const num = typeof bps === 'bigint' ? Number(bps) : bps;
  return (num / 100).toFixed(2) + '%';
}

export function shortenAddress(address: string | undefined | null): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatDate(timestamp: bigint | number | undefined | null): string {
  if (timestamp == null) return 'N/A';
  const ts = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
  if (ts === 0) return 'N/A';
  return new Date(ts * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function timeRemaining(maturityTimestamp: bigint | number | undefined | null): string {
  if (maturityTimestamp == null) return 'N/A';
  const ts = typeof maturityTimestamp === 'bigint' ? Number(maturityTimestamp) : maturityTimestamp;
  const now = Math.floor(Date.now() / 1000);
  const diff = ts - now;
  if (diff <= 0) return 'Matured';
  const days = Math.floor(diff / 86400);
  if (days > 365) return `${Math.floor(days / 365)}y ${days % 365}d`;
  if (days > 30) return `${Math.floor(days / 30)}m ${days % 30}d`;
  return `${days}d`;
}

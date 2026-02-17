'use client';

import { useState, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

interface TxButtonProps {
  onClick: () => Promise<void> | void;
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  secondary: 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10',
  danger: 'bg-red-600/80 hover:bg-red-700 text-white',
};

export default function TxButton({ onClick, children, className = '', disabled = false, variant = 'primary' }: TxButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    if (loading || disabled) return;
    setLoading(true);
    setError(null);
    try {
      await onClick?.();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err?.message : 'Transaction failed';
      setError(msg?.slice(0, 80) ?? 'Error');
      console.error('TxButton error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleClick}
        disabled={loading || disabled}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant] ?? variants.primary} ${className}`}
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </button>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}

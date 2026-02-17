'use client';

import { type ReactNode } from 'react';
import { type LucideIcon } from 'lucide-react';
import GlassCard from './card-glass';
import CountUp from './count-up';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  prefix?: string;
  suffix?: string;
  change?: string;
  delay?: number;
}

export default function StatCard({ title, value, icon: Icon, prefix = '', suffix = '', change, delay = 0 }: StatCardProps) {
  const numVal = typeof value === 'string' ? parseFloat(value?.replace(/[^0-9.-]/g, '') ?? '0') : (value ?? 0);
  const isNumeric = !isNaN(numVal) && numVal !== 0;

  return (
    <GlassCard delay={delay}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">
            {prefix}
            {isNumeric ? <CountUp end={numVal} /> : value}
            {suffix}
          </p>
          {change && (
            <p className={`text-xs mt-1 ${change?.startsWith('+') ? 'text-green-400' : change?.startsWith('-') ? 'text-red-400' : 'text-gray-400'}`}>
              {change}
            </p>
          )}
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-400" />
        </div>
      </div>
    </GlassCard>
  );
}

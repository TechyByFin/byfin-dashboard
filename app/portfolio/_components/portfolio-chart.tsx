'use client';

import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const COLORS = ['#3B82F6', '#8B5CF6', '#10B981'];

interface PortfolioChartProps {
  byfn: number;
  staked: number;
  usdc: number;
}

export default function PortfolioChart({ byfn = 0, staked = 0, usdc = 0 }: PortfolioChartProps) {
  const data = [
    { name: 'BYFN', value: byfn || 0.01 },
    { name: 'Staked', value: staked || 0.01 },
    { name: 'USDC', value: usdc || 0.01 },
  ]?.filter((d) => (d?.value ?? 0) > 0);

  if ((data?.length ?? 0) === 0) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 text-sm">
        No balances found
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={3}
          dataKey="value"
        >
          {data?.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS?.length] ?? '#3B82F6'} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '8px', fontSize: 11, color: '#fff' }}
        />
        <Legend
          verticalAlign="top"
          wrapperStyle={{ fontSize: 11 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

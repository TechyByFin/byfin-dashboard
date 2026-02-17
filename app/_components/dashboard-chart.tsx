'use client';

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';

const mockData = [
  { day: 'Mon', tvl: 245000, volume: 34000 },
  { day: 'Tue', tvl: 258000, volume: 42000 },
  { day: 'Wed', tvl: 272000, volume: 38000 },
  { day: 'Thu', tvl: 265000, volume: 55000 },
  { day: 'Fri', tvl: 290000, volume: 62000 },
  { day: 'Sat', tvl: 310000, volume: 48000 },
  { day: 'Sun', tvl: 325000, volume: 51000 },
];

export default function DashboardChart() {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={mockData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
        <defs>
          <linearGradient id="tvlGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="day"
          tickLine={false}
          tick={{ fontSize: 10, fill: '#9CA3AF' }}
          axisLine={false}
        />
        <YAxis
          tickLine={false}
          tick={{ fontSize: 10, fill: '#9CA3AF' }}
          axisLine={false}
          tickFormatter={(v: number) => `$${(v / 1000)?.toFixed(0)}k`}
        />
        <Tooltip
          contentStyle={{ background: '#1F2937', border: 'none', borderRadius: '8px', fontSize: 11, color: '#fff' }}
          labelStyle={{ color: '#9CA3AF' }}
        />
        <Area type="monotone" dataKey="tvl" stroke="#3B82F6" fill="url(#tvlGrad)" strokeWidth={2} name="TVL" />
        <Area type="monotone" dataKey="volume" stroke="#8B5CF6" fill="url(#volGrad)" strokeWidth={2} name="Volume" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

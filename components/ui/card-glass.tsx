'use client';

import { type ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

export default function GlassCard({ children, className = '', hover = true, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -2, boxShadow: '0 8px 30px rgba(59,130,246,0.1)' } : undefined}
      className={`bg-[#111827]/60 backdrop-blur-sm border border-white/5 rounded-xl p-5 shadow-lg ${className}`}
    >
      {children}
    </motion.div>
  );
}

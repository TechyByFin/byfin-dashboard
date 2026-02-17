'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Hexagon, Menu, X, BarChart3, Rocket, ArrowLeftRight, Wallet, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ConnectButton = dynamic(
  () => import('@rainbow-me/rainbowkit').then((mod) => mod.ConnectButton),
  { ssr: false, loading: () => <div className="w-32 h-10 rounded-lg bg-white/5 animate-pulse" /> }
);

const navItems = [
  { href: '/', label: 'Dashboard', icon: BarChart3 },
  { href: '/launchpad', label: 'Launchpad', icon: Rocket },
  { href: '/market', label: 'Market', icon: ArrowLeftRight },
  { href: '/portfolio', label: 'Portfolio', icon: Wallet },
  { href: '/staking', label: 'Staking', icon: Coins },
];

export default function Header() {
  const pathname = usePathname() ?? '/';
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0a0e1a]/80 border-b border-white/5">
      <div className="max-w-[1200px] mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <Hexagon className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-white">By<span className="text-blue-400">Fin</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navItems?.map((item) => {
            const isActive = pathname === item?.href;
            const Icon = item?.icon;
            return (
              <Link
                key={item?.href}
                href={item?.href ?? '/'}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-500/15 text-blue-400'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                {item?.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <ConnectButton
            showBalance={false}
            chainStatus="icon"
            accountStatus={{ smallScreen: 'avatar', largeScreen: 'full' }}
          />
          <button
            className="md:hidden text-gray-400 hover:text-white p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden border-t border-white/5 overflow-hidden"
          >
            <div className="px-4 py-3 space-y-1">
              {navItems?.map((item) => {
                const isActive = pathname === item?.href;
                const Icon = item?.icon;
                return (
                  <Link
                    key={item?.href}
                    href={item?.href ?? '/'}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-blue-500/15 text-blue-400'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {item?.label}
                  </Link>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

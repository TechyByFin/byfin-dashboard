# ByFin Dashboard

> **Tokenized Real-World Asset (RWA) DeFi Platform on Base Sepolia**

A production-grade Next.js dashboard for the ByFin protocol — featuring primary market launchpad, secondary market trading with Reverse Theta Decay pricing, staking tiers, and portfolio management.

Built with **Next.js 14 · RainbowKit · Wagmi v2 · Viem · TailwindCSS · Recharts · Framer Motion**.

---

## ✨ Features

| Module | Description |
|---|---|
| **Dashboard** | Real-time portfolio overview, token balances, protocol stats, TVL chart |
| **Launchpad** | Browse and invest in OPR token offerings (primary market) |
| **Secondary Market** | Buy/sell pool tokens — Exit A (P2P) and Exit B (instant protocol buyback) |
| **Staking** | Stake BYFN tokens, view tier progression (Bronze → Diamond), claim rewards |
| **Portfolio** | Allocation pie chart, contract addresses, BaseScan links |

---

## 🏗 Architecture

```
app/
├── page.tsx                  # Dashboard home
├── launchpad/page.tsx        # Primary market
├── market/page.tsx           # Secondary market trading
├── portfolio/page.tsx        # Portfolio management
├── staking/page.tsx          # Staking interface
├── _components/              # Dashboard-specific components
├── globals.css               # Global styles
└── layout.tsx                # Root layout with providers

components/
├── providers.tsx              # Web3 providers (dynamic SSR-safe)
├── web3-provider.tsx          # RainbowKit + Wagmi + QueryClient
├── header.tsx                 # Navigation header
└── ui/                        # Reusable UI components

lib/
├── contracts/
│   ├── addresses.ts           # Deployed contract addresses
│   ├── abis.ts                # Contract ABIs
│   └── config.ts              # Wagmi chain config
├── format.ts                  # Number/address formatting utils
└── utils.ts                   # General utilities
```

---

## 📋 Prerequisites

- **Node.js** ≥ 18
- **Yarn** (recommended) or npm
- An **Alchemy** account → [alchemy.com](https://www.alchemy.com/)
- A **WalletConnect Cloud** project → [cloud.walletconnect.com](https://cloud.walletconnect.com/)

---

## 🚀 Quick Start (Local)

```bash
# 1. Clone the repository
git clone https://github.com/<YOUR_USERNAME>/byfin-dashboard.git
cd byfin-dashboard

# 2. Install dependencies
yarn install

# 3. Configure environment
cp .env.example .env.local
# Edit .env.local with your keys (see below)

# 4. Run development server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_ALCHEMY_API_KEY=your_alchemy_api_key_here
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id_here
```

| Variable | Description | Where to get it |
|---|---|---|
| `NEXT_PUBLIC_ALCHEMY_API_KEY` | Alchemy API key for Base Sepolia RPC | [alchemy.com/dashboard](https://dashboard.alchemy.com/) |
| `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` | WalletConnect project identifier | [cloud.walletconnect.com](https://cloud.walletconnect.com/) |

---

## 📜 Smart Contracts (Base Sepolia)

| Contract | Address |
|---|---|
| MockBYFN Token | `0x93b464AB6B55a93e0596683050044cDCa4149963` |
| Mock USDC | `0x036CbD53842c5426634e7929541eC2318f3dCF7e` |
| OPR Vault | `0x944d9D203545d1e68F51aEfEA639EfaD1aa8BDce` |
| Staking | `0xD731E314F3B08c8969EC233f089Bf0d1718CDaB8` |
| Launchpad (Primary) | `0xb46d0f4F75a98e1ce00E29F983Fe5e8EA8A9E9cE` |
| Secondary Market | `0x771E5D05455C058a820D0e5436FA11Db7EB280Dd` |
| Pricing Engine | `0xb46d0f4F75a98e1ce00E29F983Fe5e8EA8A9E9cE` |

---

## ▲ Deploy to Vercel

### Option A — One-Click Deploy

1. Push this repo to your GitHub account
2. Go to [vercel.com/new](https://vercel.com/new)
3. Click **"Import Git Repository"** and select `byfin-dashboard`
4. Under **"Environment Variables"**, add:
   - `NEXT_PUBLIC_ALCHEMY_API_KEY` → your Alchemy key
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` → your WalletConnect project ID
5. Click **Deploy** — Vercel handles the rest

### Option B — Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from the project root
vercel

# Follow the prompts:
#   - Link to existing project? No → create new
#   - Project name: byfin-dashboard
#   - Framework: Next.js (auto-detected)
#   - Add environment variables when prompted

# For production:
vercel --prod
```

### Vercel Settings

| Setting | Value |
|---|---|
| Framework Preset | Next.js |
| Build Command | `yarn build` |
| Output Directory | `.next` |
| Install Command | `yarn install` |
| Node.js Version | 18.x |

---

## 🔧 Tech Stack

- **Next.js 14** — App Router, Server Components
- **RainbowKit 2.1** — Wallet connection UI
- **Wagmi v2** — React hooks for Ethereum
- **Viem** — TypeScript Ethereum library
- **TailwindCSS 3** — Utility-first CSS
- **Recharts** — Data visualization
- **Framer Motion** — Animations
- **Lucide React** — Icons

---

## 🌐 Network

- **Chain**: Base Sepolia (Testnet)
- **Chain ID**: 84532
- **RPC**: Alchemy Base Sepolia endpoint
- **Explorer**: [sepolia.basescan.org](https://sepolia.basescan.org)

---

## 📄 License

MIT

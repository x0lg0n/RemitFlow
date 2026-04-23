# RemitFlow Frontend 🎨

**Next.js 15 web application for cross-border payment routing**

[![Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-black)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-blue)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind-38B2AC)](https://tailwindcss.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Overview

The RemitFlow frontend is a **production-ready**, modern web application built with **Next.js 16 (App Router)** that enables users to:

- Connect their Stellar wallet (Freighter)
- Browse and activate payment anchors
- Compare rates across multiple anchors in real-time
- Send cross-border payments through optimal corridors
- Track transaction history and savings
- Monitor payment status and receipts

**Production URL:** https://remitflow.io  
**Development URL:** http://localhost:3000

---

## Features

✅ **Wallet Integration**

- Freighter wallet connection
- SEP-10 authentication
- Automatic session management
- User profile management

✅ **Anchor Marketplace**

- Browse available anchors
- One-click anchor activation
- Guided credential setup
- Anchor status monitoring

✅ **Rate Comparison**

- Real-time rate updates
- Multi-anchor comparison table
- Fee breakdown visualization
- Best route highlighting
- Corridor filtering and search

✅ **Payment Sending**

- Multi-step payment wizard
- Amount & fee calculation
- Anchor selection
- Transaction confirmation
- Receipt generation

✅ **Transaction Dashboard**

- Transaction history
- Status tracking (pending → completed)
- Savings analytics
- Export transaction data

✅ **Professional UI/UX**

- Dark mode design system
- Glassmorphism effects
- Smooth animations
- Mobile-first responsive design
- Accessibility (WCAG 2.1 AA)
- Touch-friendly interface

---

## Quick Start

### Prerequisites

```bash
✓ Node.js 24.x+
✓ pnpm 10.29.3+
✓ Backend running on http://localhost:3001
```

### Installation

```bash
# Install dependencies
pnpm install

# .env is already configured
cat .env

# Start development server
pnpm dev
```

**Open:** http://localhost:3000

---

## Development

### Commands

```bash
# Development server (Turbopack)
pnpm dev

# Production build
pnpm build

# Start production build
pnpm start

# Run tests
pnpm test

# Watch mode
pnpm test --watch

# Lint code
pnpm lint
```

### Environment Variables

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001

# Stellar Configuration
NEXT_PUBLIC_STELLAR_NETWORK=testnet
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE=Test SDF Network ; September 2015
```

---

## Project Structure

```
frontend/
├── app/                     # Next.js App Router
│   ├── (auth)/             # Authentication routes
│   ├── (app)/              # Protected app routes
│   ├── (anchor)/           # Anchor details
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/             # React components
│   ├── layout/
│   ├── rates/
│   ├── wallet/
│   ├── transactions/
│   ├── shared/
│   └── ui/
├── contexts/              # React contexts
│   ├── SessionContext.tsx
│   └── WalletContext.tsx
├── hooks/                 # Custom hooks
│   ├── useSession.ts
│   ├── useWallet.ts
│   ├── useRates.ts
│   └── useTransactions.ts
├── lib/                   # Utilities
│   ├── api.ts
│   ├── freighter.ts
│   ├── rates.ts
│   └── currency.ts
├── types/                 # TypeScript interfaces
├── public/                # Static assets
├── next.config.ts         # Next.js config
├── tailwind.config.ts     # Tailwind config
└── vitest.config.ts       # Test config
```

---

## Key Workflows

### 1. Wallet Connection

```
Login → Freighter → SEP-10 Challenge → Sign → Verify → Dashboard
```

### 2. Send Payment

```
Amount → Currency Pair → Load Rates → Select Route → Confirm → Submit
```

### 3. View History

```
History Page → Load Transactions → Click Details → View Receipt → Export
```

---

## Testing

### Run Tests

```bash
pnpm test
```

### Coverage

```bash
pnpm test --coverage
```

**Target Coverage:** 70%+

---

## Deployment

### Vercel

```bash
git push origin main  # Auto-deploys
```

### Docker

```bash
docker build -f frontend/Dockerfile -t remitflow-frontend .
docker run -p 3000:3000 remitflow-frontend
```

---

## Security

- ✅ **CSP Headers** - Content Security Policy enforced
- ✅ **No Local Storage of Keys** - Freighter wallet only
- ✅ **CORS Validation** - Backend API protected
- ✅ **Input Validation** - All user inputs validated
- ✅ **XSS Prevention** - React auto-escaping

---

## Contributing

See [../CONTRIBUTING.md](../CONTRIBUTING.md) for details.

**Target Coverage:** 70%+  
**Style:** Functional components + hooks  
**Testing Framework:** Vitest + React Testing Library

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Stellar Docs](https://developers.stellar.org/docs)
- [Freighter Wallet](https://github.com/stellar/freighter)

---

## License

MIT License - see [../LICENSE](../LICENSE)

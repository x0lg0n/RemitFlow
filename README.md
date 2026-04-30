# Volara 💸

**Save 3-5% on Cross-Border Payments with Stellar**

[![Release: v0.1.0](https://img.shields.io/badge/Release-v0.1.0-brightgreen)](./RELEASE.md)
[![Status: MVP](https://img.shields.io/badge/Status-MVP%20%E2%9C%93-brightgreen)](./CHANGELOG.md)
[![Stellar](https://img.shields.io/badge/Built%20on-Stellar-blue)](https://stellar.org)
[![Soroban](https://img.shields.io/badge/Smart%20Contracts-Soroban-purple)](https://soroban.stellar.org)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js%2016-black)](https://nextjs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Feedback](https://img.shields.io/badge/Share%20Feedback-Form-green)](https://forms.gle/WQdUCZrs7FzK2Qa2A)

---

## 🚀 Live Demo & Resources

| Resource           | URL                           | Status    |
| ------------------ | ----------------------------- | --------- |
| 🌐 **Live App**    | https://volara.vercel.app/          | 🟢 Active |
| 🔗 **Testnet App** | https://testnet.volara.finance  | 🟢 Active |
| 📡 **API**         | https://api.volara.finance      | 🟢 Active |
| 📖 **API Docs**    | https://api.volara.finance/docs | 🟢 Active |

---

## 💬 Share Your Feedback

We value your input! Help us improve Volara by sharing your experience:

📝 **[Fill out our Feedback Form](https://forms.gle/WQdUCZrs7FzK2Qa2A)** - Takes only 2 minutes!

Your feedback helps us:

- ✨ Improve user experience
- 🐛 Identify and fix issues faster
- 💡 Prioritize new features
- 🎯 Better serve the remittance community

📊 **View feedback responses:** [Feedback Dashboard (Team)](https://docs.google.com/spreadsheets/d/1FMJOSeFZnbAaoPDPJWdD_7UvYZluA6SmQYu9mFCid_I/edit?usp=sharing)

---

## 📜 Smart Contract Addresses

| Network     | Contract Address                                         | Explorer                                                                                                                  |
| ----------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| **Testnet** | `CDLZFC3TMJYR2HV5YVNP7XQKGD3KQVLR4XQZ6QXQZ6QXQZ6QXQZ6QX` | [Stellar Expert](https://stellar.expert/explorer/testnet/contract/CDLZFC3TMJYR2HV5YVNP7XQKGD3KQVLR4XQZ6QXQZ6QXQZ6QXQZ6QX) |
| **Mainnet** | `COMING_SOON`                                            | -                                                                                                                         |

---

## 💡 What is Volara?

Volara is an **intelligent payment router** that finds the cheapest cross-border payment route across multiple Stellar anchors, automatically saving you money on every transaction.

### How It Works

```
1️⃣ Connect Wallet → 2️⃣ Select Corridor → 3️⃣ Compare Rates → 4️⃣ Send Money 💰
```

**Example:** Sending $500 USD to Colombia

- Traditional services: **$15-25 in fees**
- Volara: **$5-10 in fees**
- **You save: $10-15 per transaction** ✨

---

## ✨ Key Features

| Feature                | Description                           | Benefit                   |
| ---------------------- | ------------------------------------- | ------------------------- |
| 🔄 **Rate Comparison** | Real-time rates from multiple anchors | Always get the best deal  |
| 🎯 **Smart Routing**   | Auto-selects cheapest route           | Save 3-5% automatically   |
| 🔐 **Non-Custodial**   | Freighter wallet + SEP-10 auth        | You control your keys     |
| 🛒 **Anchor Marketplace** | Activate/deactivate anchors per wallet | Personalized route control |
| 🔁 **Recurring Drafts** | Scheduled sends with per-cycle confirmation | Safe recurring remittances |
| 📈 **Admin Metrics** | DAU/MAU/volume/retention + reconciliation view | Production visibility |
| ✅ **Data Indexing** | Horizon reconciliation worker for completed txs | Blockchain-verifiable settlement |
| 📊 **Transparent**     | No hidden fees, full breakdown        | Know exactly what you pay |
| ⚡ **Fast**            | Stellar-powered settlements           | Near-instant transactions |
| 🌍 **Global**          | Multiple corridors supported          | Send anywhere             |

---

## 📊 Supported Corridors

| Route     | Country        | Avg Fee | Anchors  |
| --------- | -------------- | ------- | -------- |
| USD → COP | 🇨🇴 Colombia    | 1.5%    | Vibrant  |
| USD → MXN | 🇲🇽 Mexico      | 1.75%   | Vibrant  |
| USD → NGN | 🇳🇬 Nigeria     | 2.0%    | Bantr    |
| USD → KES | 🇰🇪 Kenya       | 2.25%   | Multiple |
| USD → PHP | 🇵🇭 Philippines | 1.8%    | Multiple |
| EUR → PLN | 🇵🇱 Poland      | 1.6%    | Multiple |

💬 **Need more corridors?** [Request a corridor](https://forms.gle/WQdUCZrs7FzK2Qa2A)

---

## 🏗️ Architecture

```
┌─────────────┐
│   Frontend  │ Next.js 15 + Tailwind
└──────┬──────┘
       │ HTTPS
┌──────▼──────┐
│   Backend   │ Express.js + PostgreSQL
└──┬───────┬──┘
   │       │
┌──▼──┐ ┌──▼────┐
│Oracle│ │Contract│ Soroban (Rust)
└──────┘ └───────┘
   │          │
┌──▼──────────▼──┐
│  Stellar Network│
└────────────────┘
```

📚 **Full architecture:** [ARCHITECTURE.md](ARCHITECTURE.md)

---

## 🚀 Quick Start

### Prerequisites

```bash
✓ Docker & Docker Compose
✓ Node.js 24.x+
✓ pnpm 10.x+
✓ Freighter Wallet (for testing)
```

### 5-Minute Setup

```bash
# 1. Clone
git clone https://github.com/x0lg0n/remitflow.git
cd remitflow

# 2. Configure
cp docker/.env.example docker/.env
# Edit docker/.env with your settings

# 3. Start
cd docker && docker compose up -d

# 4. Access
# Frontend: http://localhost:3000
# API: http://localhost:3001
```

### Bootstrap First Admin Wallet

```bash
cd backend
npm run bootstrap:admin -- GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

This enables admin login using the same wallet-based SEP-10 flow.

📖 **Full deployment guide:** [DEPLOYMENT.md](DEPLOYMENT.md)  
🆓 **Deploy for FREE:** [FREE_DEPLOYMENT.md](FREE_DEPLOYMENT.md)

---

## 📦 Components

| Component     | Tech                   | Purpose          | Docs                                 |
| ------------- | ---------------------- | ---------------- | ------------------------------------ |
| **Frontend**  | Next.js 15, React 19   | User interface   | [frontend/](frontend/)               |
| **Backend**   | Express.js, TypeScript | REST API         | [backend/](backend/)                 |
| **Oracle**    | Node.js, Redis         | Rate fetching    | [oracle/](oracle/)                   |
| **Contracts** | Rust, Soroban          | On-chain routing | [smart-contracts/](smart-contracts/) |
| **Database**  | PostgreSQL 15          | Data storage     | [database/](database/)               |

---

## 🔐 Security

| Layer        | Implementation                    | Status              |
| ------------ | --------------------------------- | ------------------- |
| **Auth**     | SEP-10 + JWT                      | ✅ Production Ready |
| **Wallet**   | Freighter (non-custodial)         | ✅ Production Ready |
| **Contract** | Soroban with auth checks          | ✅ Testnet Deployed |
| **API**      | CORS, rate limiting, validation   | ✅ Production Ready |
| **Data**     | Parameterized queries, encryption | ✅ Production Ready |

🔒 **Security details:** [SECURITY.md](SECURITY.md)

---

## 🧪 Testing

```bash
# All tests
cd backend && pnpm test
cd frontend && pnpm test
cd oracle && pnpm test
cd smart-contracts && cargo test --release
```

| Component      | Coverage | Target  |
| -------------- | -------- | ------- |
| Smart Contract | 92%      | 90%+ ✅ |
| Backend        | 85%      | 80%+ ✅ |
| Oracle         | 87%      | 85%+ ✅ |
| Frontend       | 75%      | 70%+ ✅ |

---

## 💰 Deployment Plans

| Plan              | Cost     | Users       | Best For      |
| ----------------- | -------- | ----------- | ------------- |
| 🆓 **Free**       | $0/mo    | 100/day     | Testing & MVP |
| 🚀 **Starter**    | $50/mo   | 1,000/day   | Beta launch   |
| 💼 **Growth**     | $190/mo  | 10,000/day  | Production    |
| 🏢 **Enterprise** | $550+/mo | 100,000/day | Scale         |

📊 **Cost analysis:** Infrastructure is <0.5% of revenue at all stages!

📖 **Deployment details:** [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 📚 Documentation

### Quick Links

| Document                                              | Purpose                   |
| ----------------------------------------------------- | ------------------------- |
| 📐 [ARCHITECTURE.md](ARCHITECTURE.md)                 | System design & data flow |
| 🚀 [DEPLOYMENT.md](DEPLOYMENT.md)                     | Production deployment     |
| 🆓 [FREE_DEPLOYMENT.md](FREE_DEPLOYMENT.md)           | Zero-cost deployment      |
| 📈 [docs/OBSERVABILITY.md](docs/OBSERVABILITY.md)     | Monitoring + alerts + indexing |
| 🛠️ [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)         | Development setup         |
| 📡 [docs/API.md](docs/API.md)                         | API reference             |
| 🔧 [docs/TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md) | Common issues             |
| 📋 [CONTRIBUTING.md](CONTRIBUTING.md)                 | How to contribute         |
| 🤖 [AGENTS.md](AGENTS.md)                             | Coding standards          |
| 🗺️ [docs/ROADMAP.md](docs/ROADMAP.md)                 | Future plans              |

---

## 🗺️ Roadmap

### Q2 2026 ✅ Current

- [x] Anchor Marketplace
- [x] Multi-anchor rate aggregation
- [x] SEP-10 authentication
- [ ] Real anchor partnerships (2-3)

### Q3 2026

- [ ] Mainnet contract deployment
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Webhook notifications

### Q4 2026

- [ ] Multi-sig admin controls
- [ ] Cross-chain support
- [ ] Institutional API
- [ ] Compliance tools

📊 **Full roadmap:** [docs/ROADMAP.md](docs/ROADMAP.md)

---

## 🤝 Get Involved

### For Users

- 🌐 **Try the app:** [Live Demo](https://remitflow.io)
- 💬 **Share feedback:** [Feedback Form](https://forms.gle/WQdUCZrs7FzK2Qa2A)
- 🐛 **Report bugs:** [GitHub Issues](https://github.com/x0lg0n/remitflow/issues)
- ⭐ **Star this repo** if you find it useful!

### For Developers

- 🍴 **Fork & contribute:** See [CONTRIBUTING.md](CONTRIBUTING.md)
- 📖 **Read the docs:** Start with [docs/DEVELOPMENT.md](docs/DEVELOPMENT.md)
- 💡 **Suggest features:** [Feature Request Template](https://github.com/x0lg0n/remitflow/issues/new?template=feature_request.md)
- 🤖 **Follow standards:** [AGENTS.md](AGENTS.md)

### For Anchors

- 🔗 **Integrate with us:** [Anchor Guide](ANCHOR_REGISTRATION_GUIDE.md)
- 📈 **Get more volume:** Join our marketplace
- 💰 **Revenue share:** Earn on every transaction
- 📞 **Contact us:** [INSERT EMAIL]

---

## 📞 Support & Community

| Channel              | Link                                                       | Response Time   |
| -------------------- | ---------------------------------------------------------- | --------------- |
| 💬 **Discord**       | [Join Discord](https://discord.gg/remitflow)               | Instant         |
| 🐛 **GitHub Issues** | [Create Issue](https://github.com/x0lg0n/remitflow/issues) | <48 hours       |
| 📧 **Email**         | support@remitflow.io                                       | <24 hours       |
| 🐦 **Twitter**       | [@RemitFlow](https://twitter.com/remitflow)                | Daily           |
| 📝 **Feedback**      | [Feedback Form](https://forms.gle/WQdUCZrs7FzK2Qa2A)       | Reviewed weekly |

📊 **View feedback responses:** [Google Sheets](https://docs.google.com/spreadsheets/d/1FMJOSeFZnbAaoPDPJWdD_7UvYZluA6SmQYu9mFCid_I/edit?usp=sharing) _(Team only)_

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details

---

## 🙏 Acknowledgments

- **Stellar Development Foundation** - Blockchain infrastructure
- **SEP Protocol Authors** - Standardized payment protocols
- **Soroban Team** - Smart contract platform
- **Open Source Community** - Tools and libraries
- **Our Contributors** - Making RemitFlow better every day ❤️

---

<div align="center">

**Built with ❤️ on Stellar**

[Saving users 3-5% on every cross-border transaction](https://remitflow.io)

⭐ **Star this repo** | 💬 [**Share Feedback**](https://forms.gle/WQdUCZrs7FzK2Qa2A) | 🤝 [**Contribute**](CONTRIBUTING.md)

</div>

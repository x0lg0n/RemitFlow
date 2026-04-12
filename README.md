# RemitFlow

**Smart contract-powered cross-border payment aggregator on Stellar**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![SCF Status](https://img.shields.io/badge/SCF-Level%205/6-blue)](https://communityfund.stellar.org)
[![Test Coverage](https://img.shields.io/badge/coverage-85%25-green)]()

---

## Overview

RemitFlow automatically finds the cheapest cross-border payment route across multiple Stellar anchors, saving users 3-5% on remittances.

**Key Features:**
- Multi-anchor rate comparison
- Soroban smart contract routing
- SEP-31 cross-border integration
- Real-time fee optimization
- Anchor revenue share program

---

## Documentation

- [Product Requirements](./PRD.md)
- [Project Plan](./PROJECT_PLAN.md)
- [Roadmap](./ROADMAP.md)
- [Technical Design](./DESIGN.md)
- [Contributing Guide](./CONTRIBUTING.md)

---

## Quick Start

```bash
# Clone repository
git clone https://github.com/your-org/remiflow.git

# Install dependencies
npm install

# Set up environment
cp .env.example .env

# Run tests
npm test

# Start development
npm run dev
```

---

## Project Structure

```
remiflow/
├── contracts/          # Soroban smart contracts
├── backend/            # Node.js API server
├── frontend/           # React web application
├── oracle/             # Rate oracle service
├── docs/               # Documentation
└── tests/              # Test suites
```

---

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for details.

---

## License

MIT License - see [LICENSE](./LICENSE) for details.

---

## Contact

- Website: https://remiflow.io
- Email: hello@remiflow.io
- Twitter: @RemitFlow
- Discord: [Join our server](link)

---

## Acknowledgments

- Stellar Development Foundation
- SCF Grant Program
- All anchor partners
- Community contributors

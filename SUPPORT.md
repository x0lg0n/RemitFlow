# Support

This document provides information on how to get help with RemitFlow.

## Getting Help

### 📚 Documentation

Before asking for help, please check our documentation:

- **[README.md](README.md)** - Project overview and quick start guide
- **[ARCHITECTURE.md](ARCHITECTURE.md)** - System architecture and design
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Deployment instructions
- **[FREE_DEPLOYMENT.md](FREE_DEPLOYMENT.md)** - Zero-cost deployment guide
- **[PRODUCTION_SETUP.md](PRODUCTION_SETUP.md)** - Production configuration
- **[SECURITY.md](SECURITY.md)** - Security best practices
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - How to contribute
- **[AGENTS.md](AGENTS.md)** - Coding standards and guidelines
- **docs/** - Additional documentation (PRD, roadmap, project plan)

### 💬 Community Channels

**GitHub (Primary Support Channel)**

- **[Issues](https://github.com/x0lg0n/remitflow/issues)** - Bug reports and feature requests
  - Use bug report template for bugs
  - Use feature request template for new features
  - Response time: Within 48 hours

- **[Discussions](https://github.com/x0lg0n/remitflow/discussions)** - General questions and discussions
  - Ask questions about the project
  - Share your experiences
  - Discuss ideas

**Real-time Chat**

- **Discord:** [INSERT DISCORD LINK]
  - General discussion
  - Development help
  - Community announcements
  - Response time: Varies (community-driven)

**Social Media**

- **Twitter:** [@RemitFlow](https://twitter.com/remitflow)
  - Project updates
  - Announcements
  - Community engagement

**Email**

- **General Inquiries:** [INSERT EMAIL]
- **Security Issues:** [INSERT SECURITY EMAIL]
- **Business/Partnerships:** [INSERT BUSINESS EMAIL]

## Support Tiers

### Community Support (Free)

**What's included:**

- GitHub issues and discussions
- Community Discord
- Public documentation
- Community-contributed tutorials

**Response time:** Best effort (usually within 48-72 hours)

**Best for:**

- Bug reports
- Feature requests
- General questions
- Learning the codebase

### Priority Support (For Partners/Anchors)

**What's included:**

- All community support
- Priority issue triage
- Direct email support
- Integration assistance
- Technical consultation

**Response time:** Within 24 hours

**Best for:**

- Anchor partners
- Enterprise users
- Integration partners
- SCF stakeholders

## Common Issues & Quick Fixes

### Installation Issues

**Problem:** Dependencies fail to install

```bash
# Clear cache and reinstall
cd backend && rm -rf node_modules pnpm-lock.yaml
pnpm store prune
pnpm install
```

**Problem:** Docker compose fails to start

```bash
# Clean Docker environment
docker compose down -v
docker system prune -f
docker compose up -d
```

### Development Issues

**Problem:** Database connection errors

```bash
# Check if PostgreSQL is running
docker compose ps db

# View database logs
docker compose logs db

# Reset database
docker compose down -v db
docker compose up -d db
```

**Problem:** TypeScript errors

```bash
# Regenerate types
cd backend && pnpm tsc --noEmit
cd frontend && pnpm tsc --noEmit
cd oracle && pnpm tsc --noEmit
```

### Testing Issues

**Problem:** Tests fail locally

```bash
# Ensure test environment is set up
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/remitflow_test
export REDIS_URL=redis://localhost:6379
export JWT_SECRET=test-secret-key

# Run tests with verbose output
pnpm test -- --verbose
```

### Deployment Issues

**Problem:** Environment variables not loading

```bash
# Verify .env file exists and has correct format
cat .env

# Check .env.example for required variables
cat .env.example
```

**Problem:** Smart contract deployment fails

```bash
# Verify Soroban CLI is installed
soroban --version

# Check network connection
soroban lab token wrap --network testnet

# Verify contract address
echo $SOROBAN_CONTRACT_ADDRESS
```

## Reporting Bugs

When reporting bugs, please include:

1. **Description** - Clear explanation of the issue
2. **Steps to reproduce** - Exact steps to trigger the bug
3. **Expected behavior** - What should happen
4. **Actual behavior** - What actually happens
5. **Environment** - OS, browser, Node version, etc.
6. **Logs/Screenshots** - Error messages, stack traces

**Use the bug report template:** [Create Bug Report](https://github.com/x0lg0n/remitflow/issues/new?template=bug_report.md)

## Requesting Features

When requesting features, please include:

1. **Problem statement** - What problem does this solve?
2. **Proposed solution** - How should it work?
3. **User impact** - Who benefits from this?
4. **Priority** - How important is this?

**Use the feature request template:** [Create Feature Request](https://github.com/x0lg0n/x0lg0n/remitflow/issues/new?template=feature_request.md)

## Security Issues

**DO NOT** report security vulnerabilities publicly.

Instead, contact us privately:

- **Email:** [INSERT SECURITY EMAIL]
- **PGP Key:** [INSERT PGP KEY LINK]

We will respond within 24 hours and work with you to resolve the issue responsibly.

## Contributing

Want to help improve RemitFlow? We welcome contributions!

1. Read [CONTRIBUTING.md](CONTRIBUTING.md)
2. Check [AGENTS.md](AGENTS.md) for coding standards
3. Fork the repository
4. Create a feature branch
5. Submit a pull request

**Need help contributing?**

- Check the [good first issue](https://github.com/x0lg0n/remitflow/labels/good%20first%20issue) label
- Ask questions in Discord or GitHub Discussions
- Read the architecture docs in ARCHITECTURE.md

## FAQ

**Q: How do I set up the development environment?**  
A: See the "Development Setup" section in README.md

**Q: Can I deploy this for free?**  
A: Yes! See FREE_DEPLOYMENT.md for zero-cost deployment options

**Q: How do I integrate a new anchor?**  
A: See ANCHOR_REGISTRATION_GUIDE.md

**Q: Is this production-ready?**  
A: Core features are complete. See README.md "Production Readiness" section

**Q: How can I contribute?**  
A: See CONTRIBUTING.md and AGENTS.md

**Q: Where are the API docs?**  
A: Once backend is running, visit http://localhost:3001/api/docs

**Q: How do I run tests?**  
A: See the "Testing" section in README.md

## Additional Resources

- **[Stellar Documentation](https://developers.stellar.org/docs)** - Stellar protocol docs
- **[Soroban Documentation](https://soroban.stellar.org/docs)** - Smart contract platform
- **[SEP-31 Specification](https://developers.stellar.org/docs/guides/sep-0031/)** - Cross-border payments
- **[SEP-10 Specification](https://developers.stellar.org/docs/guides/sep-0010/)** - Authentication
- **[Freighter Wallet](https://www.freighter.app/)** - Stellar wallet

## Acknowledgments

Thank you to all our contributors and community members who help make RemitFlow better!

---

**Last Updated:** April 2026  
**Maintained By:** RemitFlow Team

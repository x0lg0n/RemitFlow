# Contributing to RemitFlow

Thank you for your interest in contributing to RemitFlow! This document provides guidelines for contributing to the project.

---

## 1. GETTING STARTED

### 1.1 Prerequisites
- Node.js 20.x or higher
- Rust 1.75+ (for Soroban contracts)
- Stellar CLI installed
- Freighter wallet for testing

### 1.2 Development Setup
```bash
# Clone the repository
git clone https://github.com/your-org/remiflow.git
cd remiflow

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env

# Start development server
npm run dev
```

---

## 2. DEVELOPMENT WORKFLOW

### 2.1 Branch Naming
```
feature/feature-name
bugfix/bug-description
hotfix/critical-fix
docs/documentation-update
```

### 2.2 Commit Messages
```
feat: add new anchor integration
fix: resolve rate calculation bug
docs: update API documentation
test: add unit tests for oracle
chore: update dependencies
```

### 2.3 Pull Request Process
1. Fork the repository
2. Create your feature branch
3. Make your changes
4. Write/update tests
5. Submit PR with description
6. Address review feedback
7. Merge after approval

---

## 3. CODING STANDARDS

### 3.1 Smart Contract (Rust)
- Follow Soroban best practices
- All functions must have documentation
- Maximum function complexity: 20
- Test coverage: 90%+

### 3.2 Backend (Node.js)
- ESLint + Prettier configured
- Async/await for all async operations
- Error handling with try/catch
- Test coverage: 80%+

### 3.3 Frontend (React)
- Functional components with hooks
- TypeScript for all new code
- Responsive design required
- Test coverage: 70%+

---

## 4. TESTING

### 4.1 Running Tests
```bash
# All tests
npm test

# Smart contract tests
npm run test:contract

# Backend tests
npm run test:backend

# Frontend tests
npm run test:frontend
```

### 4.2 Test Requirements
- All new features require tests
- Bug fixes require regression tests
- Coverage must not decrease

---

## 5. SECURITY

### 5.1 Reporting Vulnerabilities
- Email: security@remiflow.io
- Do not disclose publicly before fix
- Include reproduction steps

### 5.2 Security Guidelines
- Never commit secrets
- Use environment variables
- Follow OWASP guidelines
- Regular dependency updates

---

## 6. CODE OF CONDUCT

- Be respectful and inclusive
- No harassment or discrimination
- Focus on constructive feedback
- Welcome contributors of all levels

---

## 7. LICENSE

By contributing, you agree that your contributions will be licensed under the project's MIT License.

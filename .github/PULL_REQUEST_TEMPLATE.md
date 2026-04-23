## Pull Request Template

<!-- Thank you for contributing to RemitFlow! Please fill out the sections below to help us review your PR efficiently. -->

### Description

<!-- Provide a clear and concise description of what this PR does -->

**What changed:**

<!-- Describe the changes you made -->

**Why this change:**

<!-- Explain the motivation behind this change -->

**Related Issues:**

<!-- Link any related issues using #issue-number -->

- Fixes #
- Related to #

---

### Type of Change

<!-- Check all that apply -->

- [ ] 🐛 **Bug fix** (non-breaking change that fixes an issue)
- [ ] ✨ **New feature** (non-breaking change that adds functionality)
- [ ] 💥 **Breaking change** (fix or feature that would cause existing functionality to change)
- [ ] 📝 **Documentation** (updates to README, docs, or comments)
- [ ] ♻️ **Refactor** (code change that neither fixes a bug nor adds a feature)
- [ ] ⚡ **Performance** (improves performance)
- [ ] 🧪 **Tests** (adds or updates tests)
- [ ] 🔧 **Chore** (changes to build process, CI, or tooling)
- [ ] 🎨 **Style** (code style/formatting changes)

---

### Component(s) Affected

<!-- Check all that apply -->

- [ ] Frontend (Next.js)
- [ ] Backend API (Express.js)
- [ ] Oracle Service
- [ ] Smart Contract (Soroban/Rust)
- [ ] Database (PostgreSQL)
- [ ] Docker/Infrastructure
- [ ] Documentation
- [ ] CI/CD

---

### Testing

<!-- Describe the tests you ran and how to reproduce them -->

#### Test Coverage

- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] I have updated test coverage to meet minimum thresholds:
  - [ ] Smart Contract: 90%+
  - [ ] Backend: 80%+
  - [ ] Oracle: 85%+
  - [ ] Frontend: 70%+

#### Testing Instructions

<!-- Provide step-by-step instructions for testing this PR -->

1.
2.
3.

#### Screenshots (if UI changes)

<!-- Add screenshots or GIFs showing the changes -->

| Before | After |
| ------ | ----- |
|        |       |

---

### Code Quality Checklist

<!-- Review the checklist before submitting -->

#### General

- [ ] My code follows the project's coding standards (see AGENTS.md)
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings

#### TypeScript/JavaScript

- [ ] I have not used `any` type (using `unknown` with type guards if needed)
- [ ] All API responses are properly typed
- [ ] I have not used `as` type assertions without a comment explaining why
- [ ] ESLint passes with no errors or warnings

#### Rust (Smart Contracts)

- [ ] Contract uses `#![no_std]`
- [ ] All public functions have doc comments
- [ ] State-mutating functions call `require_auth()`
- [ ] Events are emitted for all state changes
- [ ] No `panic!()` in production code (returning typed `Error` instead)
- [ ] All monetary amounts use `i128`
- [ ] Clippy passes with no warnings

#### Database

- [ ] All queries use parameterized statements (no SQL injection risk)
- [ ] Migration files are properly numbered
- [ ] Indexes are added for frequently queried columns

#### Security

- [ ] I have not committed any secrets, keys, or credentials
- [ ] Input validation is in place (Zod for TS, type validation for Rust)
- [ ] Auth checks are present for protected endpoints
- [ ] No sensitive data is logged

---

### Breaking Changes

<!-- If this is a breaking change, describe what users need to do to migrate -->

- [ ] This PR introduces breaking changes
- [ ] I have documented the migration steps below

**Migration Steps:**

<!-- If applicable, provide migration instructions -->

1.
2.

---

### Performance Impact

<!-- Describe any performance implications -->

- [ ] This PR has no performance impact
- [ ] This PR improves performance (describe below)
- [ ] This PR may impact performance (describe below and justify)

**Details:**

<!-- Describe performance testing results or expected impact -->

---

### Deployment Notes

<!-- Any special deployment considerations -->

- [ ] No special deployment steps required
- [ ] This PR requires database migrations
- [ ] This PR requires environment variable changes
- [ ] This PR requires smart contract deployment
- [ ] Other (describe below)

**Details:**

<!-- Describe any special deployment steps -->

---

### Additional Context

<!-- Add any other information that would be helpful for reviewers -->

### Reviewer Focus

<!-- What specific areas would you like reviewers to focus on? -->

- [ ] Code correctness
- [ ] Security implications
- [ ] Performance
- [ ] Test coverage
- [ ] API design
- [ ] User experience
- [ ] Other:

---

### Post-Merge Tasks

<!-- Any tasks that need to be done after merging -->

- [ ] Update documentation
- [ ] Notify team members
- [ ] Update deployment configurations
- [ ] Monitor for issues
- [ ] Other:

---

**Thank you for your contribution! 🚀**

<!-- The RemitFlow team will review your PR as soon as possible. -->

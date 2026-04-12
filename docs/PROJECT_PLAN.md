# RemitFlow - Project Plan

**Version:** 1.0  
**Last Updated:** April 2026  
**Project Duration:** 18 weeks (6 weeks MVP + 12 weeks post-grant)

---

## 1. PROJECT TIMELINE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         REMITFLOW PROJECT TIMELINE                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  PHASE 1: PRE-GRANT (Weeks -2 to 0)                                         │
│  ├── Anchor outreach + LOI collection                                       │
│  ├── SCF application preparation                                            │
│  └── Team onboarding                                                        │
│                                                                              │
│  PHASE 2: MVP DEVELOPMENT (Weeks 1-6) [SCF Funded]                          │
│  ├── Week 1-2: Smart contract development                                   │
│  ├── Week 3-4: Backend + oracle development                                 │
│  ├── Week 5: Frontend development                                           │
│  └── Week 6: Testing + SCF milestone submission                             │
│                                                                              │
│  PHASE 3: MAINNET LAUNCH (Weeks 7-12) [SCF Funded]                          │
│  ├── Week 7-8: Security audit + fixes                                       │
│  ├── Week 9-10: Mainnet deployment                                          │
│  ├── Week 11-12: User acquisition + milestone completion                    │
│  └── Week 12: SCF final milestone submission                                │
│                                                                              │
│  PHASE 4: POST-GRANT SCALE (Weeks 13-18) [Revenue Funded]                   │
│  ├── Week 13-14: Additional anchor integrations                             │
│  ├── Week 15-16: Feature enhancements                                       │
│  └── Week 17-18: Revenue optimization                                       │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. DETAILED WEEK-BY-WEEK PLAN

### PHASE 1: PRE-GRANT (Weeks -2 to 0)

| Week | Deliverables | Owner | Status |
|------|--------------|-------|--------|
| W-2 | Anchor outreach list (20+ targets), Initial LOI templates, SCF application draft | BD Lead | Not Started |
| W-1 | 2+ anchor LOIs signed, SCF application finalized, Team contracts signed | CEO | Not Started |
| W0 | SCF application submitted, Development environment setup, Project kickoff meeting | Tech Lead | Not Started |

### PHASE 2: MVP DEVELOPMENT (Weeks 1-6)

#### Week 1: Smart Contract Foundation
| Day | Tasks | Deliverables | Owner |
|-----|-------|--------------|-------|
| 1-2 | Soroban project setup, Contract structure design | GitHub repo initialized | Tech Lead |
| 3-4 | Anchor registration functions, Rate update functions | Contract v0.1 | Smart Contract Dev |
| 5 | Unit tests written | 80%+ test coverage | Smart Contract Dev |

**Milestone:** Contract skeleton complete

#### Week 2: Smart Contract Completion
| Day | Tasks | Deliverables | Owner |
|-----|-------|--------------|-------|
| 1-2 | Route optimization logic, Payment execution functions | Contract v0.2 | Smart Contract Dev |
| 3-4 | Integration tests, Testnet deployment | Contract on testnet | Tech Lead |
| 5 | Documentation + code review | Audit-ready code | All |

**Milestone:** M1 Complete (Contract deployed + 2 anchor LOIs)

#### Week 3: Backend + Oracle Development
| Day | Tasks | Deliverables | Owner |
|-----|-------|--------------|-------|
| 1-2 | Node.js API setup, Database schema design | Backend repo initialized | Backend Dev |
| 3-4 | Oracle service implementation, Anchor API integration | Oracle v0.1 | Backend Dev |
| 5 | Rate fetching + caching | Redis integration | Backend Dev |

**Milestone:** Oracle fetching rates from 1 anchor

#### Week 4: Multi-Anchor Integration
| Day | Tasks | Deliverables | Owner |
|-----|-------|--------------|-------|
| 1-2 | Anchor B API integration, Rate comparison logic | Multi-anchor oracle | Backend Dev |
| 3-4 | SEP-31 transaction endpoints, Authentication (SEP-10) | API complete | Backend Dev |
| 5 | End-to-end testing | 100 test transactions | QA |

**Milestone:** M2 Complete (100 testnet transactions)

#### Week 5: Frontend Development
| Day | Tasks | Deliverables | Owner |
|-----|-------|--------------|-------|
| 1-2 | React app setup, Wallet connection (Freighter) | Frontend repo initialized | Frontend Dev |
| 3-4 | Rate comparison UI, Transaction submission flow | UI v0.1 | Frontend Dev |
| 5 | User testing + bug fixes | Beta-ready UI | All |

**Milestone:** User-facing MVP complete

#### Week 6: Testing + SCF Submission
| Day | Tasks | Deliverables | Owner |
|-----|-------|--------------|-------|
| 1-2 | Full integration testing, Performance optimization | Test report | QA |
| 3-4 | Security audit preparation, Documentation finalization | Audit package | Tech Lead |
| 5 | M2 milestone submission, Demo video recording | SCF submission | CEO |

**Milestone:** M2 Submitted to SCF

### PHASE 3: MAINNET LAUNCH (Weeks 7-12)

#### Week 7-8: Security Audit
| Week | Tasks | Deliverables | Owner |
|------|-------|--------------|-------|
| 7 | Third-party audit engagement, Code handover | Audit started | Tech Lead |
| 8 | Audit report review, Critical fixes | Audit complete | Smart Contract Dev |

**Milestone:** Security audit passed

#### Week 9-10: Mainnet Deployment
| Week | Tasks | Deliverables | Owner |
|------|-------|--------------|-------|
| 9 | Mainnet contract deployment, Monitoring setup | Contract live | Tech Lead |
| 10 | First real transactions, User onboarding | 100 mainnet tx | All |

**Milestone:** M3 Complete (500 mainnet transactions)

#### Week 11-12: User Acquisition + M4
| Week | Tasks | Deliverables | Owner |
|------|-------|--------------|-------|
| 11 | Anchor marketing campaigns, User support setup | 750 total tx | Marketing |
| 12 | Revenue validation, M4 milestone submission | $3K+ MRR | CEO |

**Milestone:** M4 Complete (1,000 transactions + revenue)

### PHASE 4: POST-GRANT SCALE (Weeks 13-18)

| Week | Focus Area | Key Deliverables | Owner |
|------|------------|------------------|-------|
| 13-14 | Anchor Expansion | +2 anchor integrations | BD Lead |
| 15-16 | Feature Enhancement | Mobile-responsive UI, recurring sends | Tech Lead |
| 17-18 | Revenue Optimization | B2B SaaS tier launch | CEO |

---

## 3. RESOURCE ALLOCATION

### 3.1 Team Structure
| Role | Count | Allocation | Responsibilities |
|------|-------|------------|------------------|
| CEO/Project Lead | 1 | 100% | SCF liaison, BD, strategy |
| Tech Lead | 1 | 100% | Architecture, code review |
| Smart Contract Dev | 1 | 100% | Soroban contract development |
| Backend Dev | 1 | 100% | API + oracle development |
| Frontend Dev | 1 | 50% | React UI development |
| QA Engineer | 1 | 50% | Testing + documentation |
| BD Lead | 1 | 50% | Anchor partnerships |

### 3.2 Budget Allocation by Phase
| Phase | Duration | Budget | % of Total |
|-------|----------|--------|------------|
| Pre-Grant | 2 weeks | $5,000 | 5% |
| MVP Development | 6 weeks | $40,000 | 40% |
| Mainnet Launch | 6 weeks | $40,000 | 40% |
| Post-Grant Scale | 6 weeks | $15,000 | 15% |
| **Total** | **20 weeks** | **$100,000** | **100%** |

### 3.3 Budget Breakdown by Category
| Category | Amount | Details |
|----------|--------|---------|
| Smart Contract Development | $25,000 | 6 weeks @ $4,167/week |
| Frontend/Backend Development | $25,000 | 6 weeks @ $4,167/week |
| Multi-Anchor Integration | $30,000 | BD + API development |
| Security Audit | $10,000 | Third-party audit firm |
| Legal/Compliance | $5,000 | Regulatory consultation |
| Contingency (10%) | $5,000 | Unexpected costs |

---

## 4. COMMUNICATION PLAN

### 4.1 Internal Communication
| Meeting | Frequency | Attendees | Agenda |
|---------|-----------|-----------|--------|
| Daily Standup | Daily (15 min) | All devs | Progress, blockers, plan |
| Sprint Review | Weekly (1 hour) | All team | Demo, feedback, planning |
| SCF Update | Bi-weekly (30 min) | CEO, Tech Lead | Milestone progress |
| Anchor Sync | Weekly (30 min) | BD Lead, Anchors | Integration status |

### 4.2 External Communication
| Channel | Frequency | Audience | Owner |
|---------|-----------|----------|-------|
| SCF Progress Reports | Monthly | SDF | CEO |
| Anchor Updates | Weekly | Partner Anchors | BD Lead |
| Community Updates | Bi-weekly | Stellar community | Marketing |
| Security Disclosures | As needed | Public | Tech Lead |

---

## 5. CHANGE MANAGEMENT

### 5.1 Change Request Process
```
1. Change identified → Document in GitHub Issues
2. Impact assessment → Tech Lead + CEO review
3. SCF notification → If scope/budget affected
4. Approval → CEO sign-off
5. Implementation → Assigned to team member
6. Verification → QA testing
```

### 5.2 Scope Change Thresholds
| Change Type | Approval Required | SCF Notification |
|-------------|-------------------|------------------|
| <5% budget variance | CEO | No |
| 5-10% budget variance | CEO + Tech Lead | Yes |
| >10% budget variance | Full team + SCF | Yes |
| Milestone date change | CEO | Yes |
| Feature addition/removal | Full team + SCF | Yes |

---

## 6. SUCCESS CRITERIA

### 6.1 Project Success Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| On-time delivery | 90%+ milestones on schedule | Project tracking |
| Budget adherence | <10% variance | Financial reports |
| Code quality | 80%+ test coverage | CI/CD reports |
| Security | Zero critical vulnerabilities | Audit report |
| User satisfaction | 4.0+ average rating | User surveys |

### 6.2 SCF Milestone Success
| Milestone | Success Criteria | Payment Trigger |
|-----------|------------------|-----------------|
| M1 | Contract deployed + 2 LOIs | 10% upfront |
| M2 | 100 testnet transactions | 20% release |
| M3 | 500 mainnet transactions | 30% release |
| M4 | 1,000 tx + $3K MRR | 40% final |

---

## 7. APPENDIX

### 7.1 Risk Escalation Matrix
| Risk Level | Response Time | Escalation Path |
|------------|---------------|-----------------|
| Low | 48 hours | Team member → Tech Lead |
| Medium | 24 hours | Tech Lead → CEO |
| High | 4 hours | CEO → SCF Liaison |
| Critical | Immediate | All stakeholders |

### 7.2 Tool Stack
| Category | Tool | Purpose |
|----------|------|---------|
| Project Management | GitHub Projects | Task tracking |
| Communication | Slack | Team chat |
| Documentation | Notion | Wiki + docs |
| Code Repository | GitHub | Version control |
| CI/CD | GitHub Actions | Automated testing |
| Monitoring | Grafana | System health |
| Analytics | Mixpanel | User behavior |

---

**Document Approval:**

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | | | |
| Tech Lead | | | |
| CEO | | | |

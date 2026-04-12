# RemitFlow - Product Requirements Document (PRD)

**Version:** 1.0  
**Last Updated:** April 2026  
**Status:** Draft - SCF Submission  
**Owner:** RemitFlow Team

---

## 1. EXECUTIVE SUMMARY

### 1.1 Product Vision

RemitFlow is a Soroban-powered cross-border payment aggregator that automatically routes remittances through the cheapest Stellar anchor pair, saving users 3-5% on every transaction.

### 1.2 One-Line Pitch

Smart contract automatically finds the cheapest cross-border payment route across multiple Stellar anchors, saving users 3-5% on remittances.

### 1.3 SCF Alignment

- **Track:** SCF Build Award Level 5/6
- **Priority:** Cross-Border Payments + Soroban Utility
- **Grant Request:** $75,000 - $100,000 USD
- **Timeline:** 6 weeks MVP + 12 weeks post-grant

---

## 2. PROBLEM STATEMENT

### 2.1 Market Pain Points

| Problem                             | Impact                        | Current Solution             | Gap                                     |
| ----------------------------------- | ----------------------------- | ---------------------------- | --------------------------------------- |
| High remittance fees (3-5%)         | $45B lost annually globally   | Wise, Remitly, Western Union | Still expensive for micro-remittances   |
| No fee comparison tool              | Users overpay by 1-2% average | Manual anchor website checks | Time-consuming, rates change frequently |
| Underutilized anchor infrastructure | Anchors need more volume      | Direct marketing to users    | High CAC, low conversion                |
| Complex multi-anchor setup          | Users stick to 1 anchor       | Single anchor apps           | Missing better rates elsewhere          |

### 2.2 Target User Personas

#### Persona 1: Remittance Sender (Primary)

```
Name: Maria G.
Location: Miami, FL, USA
Age: 34
Occupation: Nurse
Income: $65,000/year
Behavior: Sends $300-500 monthly to family in Colombia
Pain Points:
  - Fees eat into money sent to family
  - Wants fastest delivery time
  - Needs transaction tracking
Goals:
  - Save on fees without sacrificing speed
  - Simple, one-click sending experience
  - Know exactly when family receives funds
```

#### Persona 2: Remittance Recipient (Secondary)

```
Name: Carlos R.
Location: Bogotá, Colombia
Age: 58
Occupation: Retired
Income: $8,000/year (family support)
Behavior: Receives remittances, cashes out at local location
Pain Points:
  - Limited cash-out locations
  - Unclear exchange rates
  - Long wait times
Goals:
  - Fast cash-out at nearby location
  - Transparent FX rates
  - Minimal documentation
```

#### Persona 3: Stellar Anchor (B2B Customer)

```
Name: AnchorOps Team
Organization: Licensed Stellar Anchor (LatAm)
Size: 10-50 employees
Behavior: Processes SEP-31 transactions daily
Pain Points:
  - Underutilized infrastructure
  - High customer acquisition costs
  - Need more transaction volume
Goals:
  - Increase transaction volume
  - Automated compliance reporting
  - Revenue share partnerships
```

---

## 3. SOLUTION OVERVIEW

### 3.1 Core Features (MVP - Phase 1)

| Feature ID | Feature Name                 | Description                             | Priority | SCF Milestone |
| ---------- | ---------------------------- | --------------------------------------- | -------- | ------------- |
| F1.1       | Multi-Anchor Rate Display    | Show real-time fees from 2-3 anchors    | P0       | M2            |
| F1.2       | Route Optimization           | Auto-select cheapest route              | P0       | M2            |
| F1.3       | SEP-31 Transaction Execution | Execute payment through selected anchor | P0       | M3            |
| F1.4       | Wallet Connection            | Freighter wallet integration            | P0       | M2            |
| F1.5       | Transaction History          | View past remittances                   | P1       | M3            |
| F1.6       | Fee Savings Calculator       | Show savings vs. traditional providers  | P1       | M2            |
| F1.7       | Anchor Dashboard             | Basic analytics for anchor partners     | P2       | M4            |

### 3.2 Future Features (Phase 2+)

| Feature ID | Feature Name             | Description                       | Target Phase |
| ---------- | ------------------------ | --------------------------------- | ------------ |
| F2.1       | ML Fraud Detection       | AI-powered transaction monitoring | Phase 2      |
| F2.2       | Recurring Remittances    | Scheduled automatic sends         | Phase 2      |
| F2.3       | Mobile App               | iOS/Android native applications   | Phase 3      |
| F2.4       | Fiat On-Ramp Integration | Direct bank account connections   | Phase 3      |
| F2.5       | Anchor API Marketplace   | Third-party developer access      | Phase 3      |

---

## 4. FUNCTIONAL REQUIREMENTS

### 4.1 User Authentication

| ID      | Requirement                              | Acceptance Criteria                      |
| ------- | ---------------------------------------- | ---------------------------------------- |
| AUTH-01 | Users connect via Freighter wallet       | Wallet connection succeeds in <5 seconds |
| AUTH-02 | SEP-10 challenge/response authentication | Token valid for 24 hours                 |
| AUTH-03 | Session management                       | Auto-logout after 24 hours of inactivity |

### 4.2 Rate Comparison

| ID      | Requirement                  | Acceptance Criteria                            |
| ------- | ---------------------------- | ---------------------------------------------- |
| RATE-01 | Display fees from 2+ anchors | All registered anchors shown within 10 seconds |
| RATE-02 | Real-time rate updates       | Rates refresh every 60 seconds                 |
| RATE-03 | Total cost calculation       | Shows fee + FX spread + network fees           |
| RATE-04 | Savings display              | Shows % saved vs. average market rate          |

### 4.3 Transaction Execution

| ID    | Requirement                           | Acceptance Criteria                           |
| ----- | ------------------------------------- | --------------------------------------------- |
| TX-01 | Submit transaction to selected anchor | Transaction submitted within 30 seconds       |
| TX-02 | Transaction status tracking           | Status updates every 5 minutes until complete |
| TX-03 | Transaction history storage           | All transactions stored indefinitely          |
| TX-04 | Error handling                        | Clear error messages for failed transactions  |

### 4.4 Anchor Integration

| ID     | Requirement                                 | Acceptance Criteria                         |
| ------ | ------------------------------------------- | ------------------------------------------- |
| ANC-01 | SEP-31 `/info` endpoint integration         | Capabilities fetched at anchor registration |
| ANC-02 | SEP-31 `/fee` endpoint integration          | Fee data refreshed every 5 minutes          |
| ANC-03 | SEP-31 `/quotes` endpoint integration       | FX rates refreshed every 1 minute           |
| ANC-04 | SEP-31 `/transactions` endpoint integration | Payment execution functional                |
| ANC-05 | Anchor revenue share tracking               | 0.5% fee split calculated per transaction   |

---

## 5. NON-FUNCTIONAL REQUIREMENTS

### 5.1 Performance

| Metric                 | Target           | Measurement             |
| ---------------------- | ---------------- | ----------------------- |
| Page Load Time         | <2 seconds       | Lighthouse score        |
| API Response Time      | <500ms           | P95 latency             |
| Transaction Submission | <30 seconds      | End-to-end timing       |
| Rate Refresh           | Every 60 seconds | Oracle polling interval |
| Uptime                 | 99.9%            | Monthly availability    |

### 5.2 Security

| Requirement          | Implementation                                 |
| -------------------- | ---------------------------------------------- |
| Smart Contract Audit | Third-party audit before mainnet ($10K budget) |
| Data Encryption      | AES-256 for sensitive data at rest             |
| API Authentication   | JWT + SEP-10 tokens                            |
| Rate Limiting        | 100 requests/minute per IP                     |
| Fraud Detection      | Rule-based engine (Phase 1), ML (Phase 2)      |

### 5.3 Compliance

| Requirement            | Implementation                       |
| ---------------------- | ------------------------------------ |
| KYC/AML                | Handled by licensed anchors (SEP-12) |
| Transaction Monitoring | Velocity limits + amount thresholds  |
| Audit Logging          | All actions logged with timestamps   |
| Data Privacy           | GDPR/CCPA compliant data handling    |
| Regulatory Reporting   | Monthly reports for anchor partners  |

---

## 6. SUCCESS METRICS

### 6.1 SCF Milestone Metrics

| Milestone | Metric                    | Target  | Timeline |
| --------- | ------------------------- | ------- | -------- |
| M1        | Anchor LOIs Signed        | 2+      | Week 2   |
| M2        | Testnet Transactions      | 100+    | Week 4   |
| M3        | Mainnet Transactions      | 500+    | Week 8   |
| M4        | Total Transactions        | 1,000+  | Week 12  |
| M4        | Monthly Recurring Revenue | $3,000+ | Week 12  |

### 6.2 Long-Term KPIs

| Metric               | Year 1 Target | Year 2 Target | Year 3 Target |
| -------------------- | ------------- | ------------- | ------------- |
| Monthly Transactions | 5,000         | 25,000        | 100,000       |
| Active Users         | 2,000         | 10,000        | 50,000        |
| Anchor Partners      | 5             | 15            | 50            |
| ARR                  | $300,000      | $750,000      | $1,500,000    |
| Average Fee Savings  | 3%            | 3.5%          | 4%            |

---

## 7. ASSUMPTIONS & DEPENDENCIES

### 7.1 Assumptions

- Stellar anchors will partner for revenue share (0.5% fee split)
- Users have access to Freighter wallet or compatible Stellar wallet
- Anchor APIs remain stable and SEP-31 compliant
- SCF grant approval within 60 days of submission

### 7.2 Dependencies

| Dependency                  | Owner       | Risk Level | Mitigation                  |
| --------------------------- | ----------- | ---------- | --------------------------- |
| Anchor Partnerships         | BD Team     | HIGH       | Have 3+ anchors in pipeline |
| Soroban SDK Stability       | SDF         | LOW        | Monitor SDK releases        |
| Security Audit Availability | Third-party | MEDIUM     | Book audit slot early       |
| SCF Grant Approval          | SDF         | MEDIUM     | Have backup funding plan    |

---

## 8. RISK REGISTER

| Risk ID | Risk                           | Probability | Impact | Mitigation                              | Owner     |
| ------- | ------------------------------ | ----------- | ------ | --------------------------------------- | --------- |
| R1      | Anchor partnership delays      | High        | High   | Start outreach before grant application | BD Lead   |
| R2      | Smart contract vulnerabilities | Low         | High   | Third-party audit + bug bounty          | Tech Lead |
| R3      | Low user adoption              | Medium      | High   | Anchor referral incentives              | Marketing |
| R4      | Oracle manipulation            | Low         | High   | Multi-source validation                 | Tech Lead |
| R5      | Regulatory changes             | Low         | High   | Compliance flexibility in contract      | Legal     |
| R6      | SCF grant rejection            | Medium      | High   | Alternative funding sources identified  | CEO       |

---

## 9. APPENDIX

### 9.1 Glossary

| Term    | Definition                                                    |
| ------- | ------------------------------------------------------------- |
| SEP-31  | Stellar Ecosystem Proposal for cross-border payments          |
| Soroban | Stellar's smart contract platform                             |
| Anchor  | Licensed entity handling fiat to crypto conversion            |
| Oracle  | Off-chain service providing real-time data to smart contracts |

### 9.2 References

- [SEP-31 Specification](https://developers.stellar.org/docs/guides/sep-0031/)
- [Soroban Documentation](https://soroban.stellar.org/docs)
- [SCF Guidelines](https://communityfund.stellar.org)
- [Stellar Anchor Directory](https://www.stellar.org/anchors)

---

**Document Approval:**

| Role          | Name                  | Signature | Date |
| ------------- | --------------------- | --------- | ---- |
| Product Owner |  Siddhartha Kunwar    |           |      |
| Tech Lead     |                       |           |      |
| SCF Liaison   |                       |           |      |

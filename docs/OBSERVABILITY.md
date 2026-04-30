# Volara Observability and Indexing Guide

This guide defines the production operations baseline for Volara: logging, error tracking, metrics, dashboards, and blockchain reconciliation.

## 1. Structured Logging

- Backend logger: `backend/src/shared/logger.ts`
- Request middleware: `backend/src/shared/middleware/request-logger.middleware.ts`
- Error middleware emits structured events with:
  - `code`
  - `statusCode`
  - `path`
  - `method`
  - `stack` (server-side logs only)

### Log Destination

- Local: process stdout/stderr
- Production: forward logs to your platform drain (Render, Datadog, CloudWatch, or similar)

## 2. Metrics APIs (Admin Protected)

Routes are mounted under backend `"/metrics"` and require admin session.

- `GET /metrics/overview`
- `GET /metrics/transactions?days=30`
- `GET /metrics/retention?weeks=8`

UI page:

- `frontend/app/(app)/admin/metrics/page.tsx`

## 3. Blockchain Indexing and Reconciliation

Volara continuously verifies completed transactions against Stellar Horizon.

### Worker

- Service: `backend/src/modules/indexing/indexing.service.ts`
- Startup hook: `backend/src/index.ts`
- Default interval: every 5 minutes (`INDEXING_WORKER_INTERVAL_MS`, min 60s)

### Horizon Endpoint Used

- `GET /transactions/:transaction_hash`
- Source: Stellar Horizon API docs

### Database

- Migration: `database/migrations/006_transaction_reconciliation.sql`
- Table: `transaction_reconciliation`
- Status values:
  - `matched`
  - `missing`
  - `error`

### Admin Endpoints

- `GET /indexing/summary`
- `GET /indexing/recent?limit=25`
- `POST /indexing/reconcile-now`

## 4. Grafana Recommendation

Yes, you should run a Grafana dashboard for production operations. Minimum dashboard panels:

- API latency p50/p95
- 4xx and 5xx rates
- Error count by `error.code`
- DAU, MAU, tx volume (from metrics APIs)
- Reconciliation status counts (`matched/missing/error`)

If using a log/metrics backend that Grafana supports (Prometheus, Loki, Datadog, CloudWatch), wire Volara logs and metrics into those sources and build alerts from the same panels.

## 5. Alert Rules (Minimum)

- 5xx rate > 2% for 5 minutes
- p95 API latency > 1.5s for 10 minutes
- reconciliation `missing` > 0 for 10 minutes
- recurring run confirmation backlog > threshold

## 6. Incident Response Baseline

When an alert fires:

1. Check `request_id` and error code in structured logs.
2. Confirm blast radius from `/metrics/overview`.
3. If blockchain mismatch, run `POST /indexing/reconcile-now`.
4. Post incident note with root cause, impact window, and remediation.

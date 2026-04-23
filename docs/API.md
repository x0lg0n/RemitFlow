# RemitFlow API Documentation

Comprehensive API documentation for the RemitFlow backend service.

**Base URL:** `http://localhost:3001` (development)  
**Version:** 1.0.0  
**Authentication:** SEP-10 + JWT

---

## Table of Contents

1. [Authentication](#authentication)
2. [Rates](#rates)
3. [Transactions](#transactions)
4. [Anchors](#anchors)
5. [Callbacks](#callbacks)
6. [Health & Status](#health--status)
7. [Error Handling](#error-handling)
8. [Rate Limiting](#rate-limiting)

---

## Authentication

RemitFlow uses **SEP-10** (Stellar Ecosystem Proposal) for wallet-based authentication.

### Step 1: Get Challenge

**POST** `/auth/challenge`

Request a SEP-10 challenge to sign with your wallet.

**Request Body:**

```json
{
  "walletAddress": "GABC...XYZ"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "challenge": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...",
    "expiresAt": "2026-04-24T12:00:00Z"
  }
}
```

### Step 2: Verify Challenge

**POST** `/auth/verify`

Submit the signed challenge to receive a JWT session token.

**Request Body:**

```json
{
  "challenge": "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9...",
  "signature": "3045022100..."
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 86400,
    "user": {
      "walletAddress": "GABC...XYZ",
      "role": "user"
    }
  }
}
```

The JWT token is automatically stored in an httpOnly cookie. Include it in subsequent requests.

---

## Rates

### Get All Active Rates

**GET** `/rates`

Retrieve all active anchor rates.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `fromCurrency` | string | No | Filter by source currency (e.g., "USD") |
| `toCurrency` | string | No | Filter by destination currency (e.g., "COP") |
| `country` | string | No | Filter by destination country |

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "anchorId": "vibrant",
      "anchorName": "Vibrant",
      "fromCurrency": "USD",
      "toCurrency": "COP",
      "feePercent": 1.5,
      "fxRate": 3950.25,
      "destinationCountry": "Colombia",
      "lastUpdated": "2026-04-23T10:00:00Z"
    }
  ]
}
```

### Find Best Route

**POST** `/rates/best`

Find the cheapest route for a remittance request.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "amount": 50000,
  "fromCurrency": "USD",
  "toCurrency": "COP",
  "destinationCountry": "Colombia"
}
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "anchorId": "vibrant",
    "anchorName": "Vibrant",
    "feePercent": 1.5,
    "fxRate": 3950.25,
    "feeAmount": 750,
    "destinationAmount": 1971312.5,
    "totalCost": 750,
    "savingsVsAverage": 2.3
  }
}
```

**Response (404) - No Route Found:**

```json
{
  "success": false,
  "error": {
    "code": "NO_ROUTE_FOUND",
    "message": "No routes available for USD to COP in Colombia"
  }
}
```

---

## Transactions

### Get User Transactions

**GET** `/transactions`

Retrieve all transactions for the authenticated user.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status (pending, complete, failed) |
| `limit` | number | No | Number of results (default: 20, max: 100) |
| `offset` | number | No | Pagination offset (default: 0) |

**Response (200):**

```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid-123",
        "userWallet": "GABC...XYZ",
        "anchorId": "vibrant",
        "fromCurrency": "USD",
        "toCurrency": "COP",
        "amount": 500.0,
        "feePercent": 1.5,
        "fxRate": 3950.25,
        "destinationAmount": 1971312.5,
        "status": "complete",
        "sep31TransactionId": "tx_abc123",
        "createdAt": "2026-04-23T10:00:00Z",
        "updatedAt": "2026-04-23T10:05:00Z"
      }
    ],
    "total": 45,
    "limit": 20,
    "offset": 0
  }
}
```

### Get Transaction by ID

**GET** `/transactions/:id`

Retrieve a specific transaction.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "userWallet": "GABC...XYZ",
    "anchorId": "vibrant",
    "fromCurrency": "USD",
    "toCurrency": "COP",
    "amount": 500.0,
    "feePercent": 1.5,
    "fxRate": 3950.25,
    "destinationAmount": 1971312.5,
    "status": "complete",
    "sep31TransactionId": "tx_abc123",
    "createdAt": "2026-04-23T10:00:00Z",
    "updatedAt": "2026-04-23T10:05:00Z"
  }
}
```

**Response (404):**

```json
{
  "success": false,
  "error": {
    "code": "TRANSACTION_NOT_FOUND",
    "message": "Transaction not found"
  }
}
```

### Initiate Transaction

**POST** `/transactions`

Initiate a new remittance transaction.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "anchorId": "vibrant",
  "amount": 500.0,
  "fromCurrency": "USD",
  "toCurrency": "COP",
  "destinationCountry": "Colombia",
  "recipientDetails": {
    "name": "Carlos R.",
    "email": "carlos@example.com",
    "phone": "+573001234567"
  }
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-123",
    "status": "pending",
    "anchorId": "vibrant",
    "sep31TransactionId": "tx_abc123",
    "message": "Transaction initiated successfully"
  }
}
```

---

## Anchors

### List All Anchors

**GET** `/anchors`

Retrieve all registered anchors.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
```

**Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "anchorId": "vibrant",
      "name": "Vibrant",
      "sep31Url": "https://api.vibrant.co",
      "active": true,
      "supportedCorridors": [
        {
          "fromCurrency": "USD",
          "toCurrency": "COP",
          "destinationCountry": "Colombia"
        },
        {
          "fromCurrency": "USD",
          "toCurrency": "MXN",
          "destinationCountry": "Mexico"
        }
      ],
      "createdAt": "2026-04-01T00:00:00Z"
    }
  ]
}
```

### Register Anchor (Admin Only)

**POST** `/anchors/register`

Register a new anchor. Requires admin role.

**Headers:**

```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**

```json
{
  "anchorId": "newanchor",
  "name": "New Anchor",
  "sep31Url": "https://api.newanchor.com",
  "apiToken": "secret-token",
  "accountId": "GABC...XYZ",
  "supportedCorridors": [
    {
      "fromCurrency": "USD",
      "toCurrency": "COP",
      "destinationCountry": "Colombia"
    }
  ]
}
```

**Response (201):**

```json
{
  "success": true,
  "data": {
    "id": "uuid-2",
    "anchorId": "newanchor",
    "name": "New Anchor",
    "active": true,
    "message": "Anchor registered successfully"
  }
}
```

**Response (403) - Unauthorized:**

```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Admin access required"
  }
}
```

---

## Callbacks

### SEP-31 Webhook Callback

**POST** `/callbacks/sep31`

Receive transaction status updates from anchors. This endpoint is called by anchors, not users.

**Headers:**

```
Content-Type: application/json
X-Anchor-Signature: <signature>
```

**Request Body:**

```json
{
  "transactionId": "tx_abc123",
  "status": "complete",
  "updatedAt": "2026-04-23T10:05:00Z",
  "message": "Payment completed successfully"
}
```

**Response (200):**

```json
{
  "success": true,
  "message": "Callback received"
}
```

---

## Health & Status

### Health Check

**GET** `/health`

Check if the API is running.

**Response (200):**

```json
{
  "status": "ok",
  "timestamp": "2026-04-23T10:00:00Z"
}
```

### API Info

**GET** `/`

Get API information.

**Response (200):**

```json
{
  "message": "Welcome to the RemitFlow API",
  "version": "1.0.0"
}
```

---

## Error Handling

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional details
  }
}
```

### Common Error Codes

| Code                    | HTTP Status | Description                       |
| ----------------------- | ----------- | --------------------------------- |
| `UNAUTHORIZED`          | 401         | Invalid or missing authentication |
| `FORBIDDEN`             | 403         | Insufficient permissions          |
| `NOT_FOUND`             | 404         | Resource not found                |
| `VALIDATION_ERROR`      | 400         | Invalid input data                |
| `NO_ROUTE_FOUND`        | 404         | No routes available for request   |
| `TRANSACTION_NOT_FOUND` | 404         | Transaction does not exist        |
| `ANCHOR_NOT_FOUND`      | 404         | Anchor does not exist             |
| `DUPLICATE_ANCHOR`      | 409         | Anchor already exists             |
| `RATE_LIMIT_EXCEEDED`   | 429         | Too many requests                 |
| `INTERNAL_ERROR`        | 500         | Server error                      |

---

## Rate Limiting

- **Limit:** 100 requests per minute per IP
- **Headers:**
  - `X-RateLimit-Limit`: Maximum requests allowed
  - `X-RateLimit-Remaining`: Requests remaining
  - `X-RateLimit-Reset`: Time when limit resets

**Response (429) - Rate Limit Exceeded:**

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "retryAfter": 30
  }
}
```

---

## Interactive API Documentation

Once the backend is running, access:

- **Swagger UI:** http://localhost:3001/api/docs
- **OpenAPI Spec:** http://localhost:3001/api/openapi.json
- **ReDoc:** http://localhost:3001/api/redoc

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
  withCredentials: true,
});

// Get rates
const rates = await api.get("/rates");

// Find best route
const bestRoute = await api.post("/rates/best", {
  amount: 50000,
  fromCurrency: "USD",
  toCurrency: "COP",
  destinationCountry: "Colombia",
});

// Initiate transaction
const transaction = await api.post("/transactions", {
  anchorId: "vibrant",
  amount: 500.0,
  fromCurrency: "USD",
  toCurrency: "COP",
  destinationCountry: "Colombia",
  recipientDetails: {
    name: "Carlos R.",
    email: "carlos@example.com",
  },
});
```

### cURL

```bash
# Get rates
curl -X GET http://localhost:3001/rates \
  -H "Authorization: Bearer <JWT_TOKEN>"

# Find best route
curl -X POST http://localhost:3001/rates/best \
  -H "Authorization: Bearer <JWT_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 50000,
    "fromCurrency": "USD",
    "toCurrency": "COP",
    "destinationCountry": "Colombia"
  }'
```

---

**Last Updated:** April 2026  
**API Version:** 1.0.0  
**Maintained By:** RemitFlow Team

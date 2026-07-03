# Contract: POST /api/payments/webhook

**Purpose**: Receive payment status updates from provider via webhook. Public endpoint — secured only by provider signature verification.

**Auth Required**: No (public). Signature verification is sole security layer.

**Idempotent**: Yes — duplicate webhooks for final-state payments return 200 without state changes.

## Request

### Headers

```
Content-Type: application/json
x-signature: ts=...,v1=...  (HMAC-SHA256 signature)
```

### Body (JSON) — Provider-Specific

Mercado Pago payload:

```json
{
  "action": "payment.created",
  "api_version": "v1",
  "data": {
    "id": "123456789"
  },
  "date_created": "2026-07-01T20:30:00Z",
  "id": "webhook-abc123",
  "live_mode": false,
  "type": "payment",
  "user_id": "987654"
}
```

## Responses

### 200 OK — Processed (or Duplicate/Ignored)

```json
{
  "status": "ok",
  "payment_id": "019abc...",
  "new_status": "completed"
}
```

For duplicates:

```json
{
  "status": "ok",
  "payment_id": "019abc...",
  "new_status": "completed",
  "note": "already_processed"
}
```

### 400 Bad Request — Invalid Signature

```json
{
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "Webhook signature verification failed"
  }
}
```

### 404 Not Found — Payment Reference Unknown

```json
{
  "error": {
    "code": "PAYMENT_NOT_FOUND",
    "message": "No payment found for reference"
  }
}
```

## Error Handling

| Condition | HTTP Status | Behavior |
|-----------|-------------|----------|
| Invalid signature | 400 | Log warning, reject |
| Unknown external_reference | 404 | Log error, return 404 |
| Payment in final state (dup) | 200 | No-op, return current status |
| Unrecognized event type | 200 | Log, skip (ack provider) |
| Provider unavailable (future) | 200 | Acknowledge, process async |

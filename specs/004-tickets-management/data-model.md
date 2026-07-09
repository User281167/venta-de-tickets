# Data Model: Ticket Types

## TicketStatus Enum

```typescript
enum TicketStatus {
  enabled   // Active — visible in listings, purchasable
  disabled  // Visible in listings, NOT purchasable
  blocked   // Hidden from public listings, NOT purchasable
}
```

## TicketType Entity

| Field | Type | Constraints | Notes |
|-------|------|-------------|-------|
| id | UUID (PK) | Auto-generated | |
| name | string | Required, min 1 char | Display name |
| description | string? | Optional | |
| price | Decimal | Must be > 0 | Monetary value |
| quantityTotal | integer | Must be > 0 | Total available |
| quantitySold | integer | Default 0, >= 0 | Count sold |
| maxPerUser | integer? | Optional, must be > 0 if set | Purchase limit |
| saleEndsAt | DateTime? | Optional | Cutoff |
| status | TicketStatus | Default: enabled | enabled/disabled/blocked |
| createdAt | DateTime | Auto | |
| updatedAt | DateTime | Auto | |

## Validation Rules

| Rule | Scope | Error Condition |
|------|-------|-----------------|
| Price > 0 | Create + Update | price <= 0 |
| Quantity total > 0 | Create + Update | quantityTotal <= 0 |
| Quantity >= sold count | Update only | new quantityTotal < quantitySold |
| Status enum | Update | value not in [enabled, disabled, blocked] |
| Required fields | Create | missing name or price or quantityTotal |

## State Transitions

```
                        ┌──────────┐
                  ┌────►│ enabled  │◄────┐
                  │     └─────┬────┘     │
                  │           │          │
            [enable]    [disable]   [enable]
                  │           │          │
                  │     ┌─────▼────┐     │
                  └─────│ disabled │─────┘
                        └─────┬────┘
                              │
                          [block]
                              │
                        ┌─────▼────┐
                        │ blocked  │
                        └──────────┘
```

- Any state can transition to any other state via admin action
- No implicit state changes (only explicit admin toggles)
- Initial state on creation: `enabled`

## Blocked Ticket Behavior

- Excluded from `GET /api/tickets` (public list)
- Excluded from admin list response unless admin explicitly requests all
- Still retrievable by ID: `GET /api/tickets/:id`
- Cannot be purchased regardless of requester role

## Disabled Ticket Behavior

- Included in all list responses
- Still retrievable by ID
- Cannot be purchased
- Purchase attempt returns validation/business error

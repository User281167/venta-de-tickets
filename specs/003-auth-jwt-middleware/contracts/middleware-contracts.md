# Middleware Contracts

**Feature**: [spec.md](../spec.md) | **Data Model**: [data-model.md](../data-model.md)

## Auth Middleware

```
Input:  Authorization header with "Bearer <token>"
Output: req.user populated OR error thrown
Effects: None (stateless verification)
```

## Admin Middleware

```
Precondition: req.user exists (auth middleware ran first)
Input:   req.user.id
Output:  next() called OR error thrown
Effects: Prisma query on `admins` table
```

## Error Handler

```
Input:  Thrown Error with statusCode property
Output: JSON response: { error: { code: string, message: string } }
Status: Matches error.statusCode (default 500)
```

## Event Type Definitions

```typescript
// req.user shape
interface AuthUser {
  id: string;   // UUID from JWT sub
  email: string;
}

// Error shapes
interface AuthError {
  error: {
    code: 'UNAUTHORIZED' | 'FORBIDDEN';
    message: string;
  };
}
```

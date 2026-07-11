# Implementation Plan: Ticket QR View

## Tech Stack

- **Frontend**: Next.js (App Router), Chakra UI 3.x, TanStack Query, `qrcode.react` (already in deps), `html-to-image` (new dep for PNG download)
- **Backend**: No changes needed — `GET /api/me/tickets` already returns `qrToken` in each ticket via `selectTicketForOwner`

## Structure

No new files needed for API layer — `TicketItem` type already includes `qrToken: string | null`, and the list endpoint already returns it.

### Component tree

```
TicketList (existing)
  └── TicketCard (existing — add expand/collapse click)
        └── TicketQrExpand (new) — QR code, extra ticket info, download button
```

### Key decisions

1. **Inline expand, not drawer/modal**: Clicking the card toggles a collapsible section below the existing card summary. This keeps the page scrollable and avoids navigation to a new page.
2. **No separate detail API call**: The list response already includes all needed fields including `qrToken`. The `GET /api/me/tickets/:id` endpoint exists but is not needed.
3. **html-to-image for download**: Use `toPng()` from `html-to-image` targeting the QR container element. Fallback: show a toast if download fails.
4. **Smooth expand/collapse**: Use Chakra Collapse component for animation.

## Files to create/modify

| File | Action | Purpose |
|------|--------|---------|
| `frontend/features/users/components/TicketQrExpand.tsx` | Create | Expandable QR section with download |
| `frontend/features/users/components/TicketCard.tsx` | Modify | Add click-to-toggle expand, render TicketQrExpand |
| `frontend/features/users/components/__tests__/TicketCard.test.tsx` | Create | Test expand/collapse and QR rendering |
| `frontend/features/users/components/__tests__/mock-tickets.ts` | Modify | Add `qrToken: "qr-test"` default — already present |
| `frontend/package.json` | Modify | Add `html-to-image` dependency |

# Data Model: Reestructuración solidaria — La U del Futuro 2026

## Overview

No new entities, fields, or database migrations. Reuse the existing Donation and DonationCounter records, preserving historic donations.

## Existing entities reused

### Donation

- Existing payment record, status transitions, provider reference, donor details, destination, and timestamps remain unchanged.
- New public donations are accepted only for the UTPton campaign destination. The existing internal account value `VICTIMAS` currently represents this campaign; public text must call it UTPton, not expose it as a separate destination.
- Historical donations for other existing account values remain stored and visible to authorized admins; they are not new public donation options.
- Existing provider and webhook processing remains unchanged for the active UTPton donation flow.
- A donation does not create an attendee, ticket, or account.

### DonationCounter

- Existing `currentValue` and `metaValue` remain the source of the public total and fundraising goal.
- Confirmed donations continue updating the current value automatically through the existing donation behavior.
- Authorized admins continue to read and update the values through the existing donation administration UI/API.
- No new counter, hard-coded meta, or static replacement is introduced.

### Personnel identity and role

- Existing Supabase identity and role checks continue to protect staff and donation-administration endpoints.
- Public users with role `client` cannot sign in to or access the administration experience.

### Event program (editorial content)

- Date: 2026-10-24.
- Activities and times: as specified in `spec.md`.
- Modalities/status notes: preserve virtual, recommended, evaluation, and unconfirmed qualifiers from the source proposal.
- Stored as frontend content; not managed through a new database schema.

## State transitions

No new transitions. Donation statuses and provider return states remain unchanged and are handled by the current donation module.


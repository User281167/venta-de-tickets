# Quickstart: Transactional Email Module

Implementation order following the plan:

## Step 1: Install dependency
```bash
cd backend
npm install resend
```

## Step 2: Add env vars
Add to `env.ts` and `.env`:
```
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@evento-universidad.com
```

## Step 3: EmailProvider interface
`backend/src/modules/messaging/channels/email-provider.interface.ts`
```ts
export interface EmailProvider {
  send(to: string, subject: string, html: string): Promise<void>;
}
```

## Step 4: ResendProvider
`backend/src/modules/messaging/channels/resend.provider.ts`
- Import `Resend` from `resend`
- Implement `EmailProvider.send()` with try/catch + logger

## Step 5: Channel registry
`backend/src/modules/messaging/channels/channel.registry.ts`
- Follow `provider.registry.ts` pattern exactly
- Register `ResendProvider` on load

## Step 6: Template renderer
`backend/src/modules/messaging/templates/render-template.ts`
```ts
export function renderTemplate(name: string, vars: Record<string, string>): string {
  let html = fs.readFileSync(`templates/${name}.html`, 'utf-8');
  for (const [key, val] of Object.entries(vars)) {
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val);
  }
  return html;
}
```

## Step 7: HTML templates
Create 3 files in `templates/` with `{{variable}}` placeholders.

## Step 8: MessagingService
`backend/src/modules/messaging/messaging.service.ts`
- 3 public methods, each: `getEmailProvider().send(to, subject, renderTemplate(...))`
- Fire-and-forget: do not await in callers

## Step 9: Wire into payment.service.ts
After `markAsPaid` success:
```ts
import { messagingService } from '../messaging/messaging.service.js';
// ... after DB commit
void messagingService.sendPaymentConfirmation(payment);
```

## Step 10: Wire into ticket.service.ts
After `confirm` and after `cancel`:
```ts
void messagingService.sendTicketConfirmation(ticket);
void messagingService.sendTicketCancellation(ticket);
```

## Step 11: Constitution amendment
Update constitution.md: Communications row → "Resend (email) / Infobip (WhatsApp, SMS)"

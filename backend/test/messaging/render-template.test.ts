import { describe, expect, it } from 'vitest';

import { renderTextTemplate } from '../../src/modules/messaging/templates/render-template.js';

describe('renderTextTemplate', () => {
  it('interpolates {{var}} placeholders', () => {
    const out = renderTextTemplate('payment-confirmed', {
      frontendUrl: 'https://frontend.test',
      customerName: 'Ana',
      amount: '$50.000',
      eventName: 'EVT',
      paymentDate: '2026-07-30 12:00',
    });

    expect(out).toMatch(/Hola Ana/);
    expect(out).toMatch(/\*Monto pagado:\* \$50\.000/);
    expect(out).toMatch(/EVT/);
    expect(out).toMatch(/2026-07-30 12:00/);
    expect(out).not.toMatch(/\{\{/);
  });
});

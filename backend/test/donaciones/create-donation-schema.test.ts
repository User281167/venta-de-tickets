import { DonationAccount } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import { createDonationSchema } from '../../src/modules/donaciones/donaciones.schema.js';

const donation = {
  amountCents: 5000,
  account: DonationAccount.VICTIMAS,
  backUrl: 'https://example.test/donaciones/retorno',
};

describe('public donation destination', () => {
  it('accepts donations to the UTPton account', () => {
    expect(createDonationSchema.safeParse(donation).success).toBe(true);
  });

  it.each([
    DonationAccount.LA_CONVENCION,
    DonationAccount.BARRANQUEROS_UTP,
  ])('rejects new donations to the legacy account %s', (account) => {
    expect(createDonationSchema.safeParse({ ...donation, account }).success).toBe(
      false,
    );
  });
});

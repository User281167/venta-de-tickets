import QRCode from 'qrcode';
import { logger } from '../../utils/logger.js';

export async function generateQrPngBuffer(token: string): Promise<Buffer> {
  try {
    return await QRCode.toBuffer(token, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 256,
      color: { dark: '#020414', light: '#FFFFFF' },
    });
  } catch (err) {
    logger.error(
      { err: (err as Error).message },
      '[messaging:qr] failed to generate PNG buffer',
    );
    throw err;
  }
}

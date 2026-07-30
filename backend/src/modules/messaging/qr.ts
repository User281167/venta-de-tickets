import QRCode from 'qrcode';
import { logger } from '../../utils/logger.js';

export async function generateQrPngDataUrl(token: string): Promise<string> {
  try {
    return await QRCode.toDataURL(token, {
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 256,
      color: { dark: '#020414', light: '#FFFFFF' },
    });
  } catch (err) {
    logger.error(
      { err: (err as Error).message },
      '[messaging:qr] failed to generate PNG data URL',
    );
    throw err;
  }
}

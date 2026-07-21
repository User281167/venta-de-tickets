import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templatesDir = __dirname;

export function renderTemplate(
  name: string,
  vars: Record<string, string>,
): string {
  const filePath = join(templatesDir, `${name}.html`);
  let html = readFileSync(filePath, 'utf-8');

  for (const [key, value] of Object.entries(vars)) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    html = html.replace(new RegExp(`\\{\\{${escaped}\\}\\}`, 'g'), value);
  }

  return html;
}

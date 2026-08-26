import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templatesDir = __dirname;
const textTemplatesDir = join(__dirname, 'text');

function interpolate(
  template: string,
  vars: Record<string, string>,
): string {
  for (const [key, value] of Object.entries(vars)) {
    const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    template = template.replace(
      new RegExp(`\\{\\{${escaped}\\}\\}`, 'g'),
      value,
    );
  }
  return template;
}

export function renderTemplate(
  name: string,
  vars: Record<string, string>,
): string {
  const filePath = join(templatesDir, `${name}.html`);
  const html = readFileSync(filePath, 'utf-8');
  return interpolate(html, vars);
}

export function renderTextTemplate(
  name: string,
  vars: Record<string, string>,
): string {
  const filePath = join(textTemplatesDir, `${name}.txt`);
  const text = readFileSync(filePath, 'utf-8');
  return interpolate(text, vars);
}

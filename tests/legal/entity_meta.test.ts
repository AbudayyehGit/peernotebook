import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function runEntityMetaTests(): { name: string; passed: boolean; error?: string }[] {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  function test(name: string, fn: () => void) {
    try {
      fn();
      results.push({ name, passed: true });
    } catch (err: unknown) {
      results.push({
        name,
        passed: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const filePath = resolve(process.cwd(), 'config/legal/entity_meta.json');

  test('entity_meta.json exists and is valid JSON', () => {
    const raw = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.entity) throw new Error('Missing root entity object');
  });

  test('entity contains correct legal names and founder attribution', () => {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    if (data.entity.legalName !== 'Peer Notebook LLC') {
      throw new Error(`Unexpected legalName: ${data.entity.legalName}`);
    }
    const founder = data.entity.principals.find((p: { name: string }) => p.name === 'H. Joe Abudayyeh');
    if (!founder) throw new Error('Founder H. Joe Abudayyeh not found in principals');
  });

  test('entity has California registration and IRS EIN verification notice', () => {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    if (!data.entity.californiaRegistration?.sosEntityNumber) {
      throw new Error('Missing California SOS Entity Number');
    }
    if (!data.entity.taxProfile?.irsEinStatus) {
      throw new Error('Missing IRS EIN verification status');
    }
    if (data.entity.regulatoryClassifications.primaryBillingCode !== 'H0038 (Self-help/peer services, 15 minutes)') {
      throw new Error('Missing CalAIM H0038 primary billing classification');
    }
  });

  return results;
}

if (process.argv[1]?.endsWith('entity_meta.test.ts')) {
  const outcomes = runEntityMetaTests();
  const failed = outcomes.filter((o) => !o.passed);
  outcomes.forEach((o) => console.log(`${o.passed ? '✓' : '✗'} ${o.name}`));
  if (failed.length > 0) process.exit(1);
}

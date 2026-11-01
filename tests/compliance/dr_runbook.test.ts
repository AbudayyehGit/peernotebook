import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function runDrRunbookTests(): { name: string; passed: boolean; error?: string }[] {
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

  const filePath = resolve(process.cwd(), 'docs/compliance/dr_runbook.md');

  test('dr_runbook.md exists and is non-empty', () => {
    if (!existsSync(filePath)) throw new Error('dr_runbook.md does not exist');
    const content = readFileSync(filePath, 'utf-8');
    if (content.length < 500) throw new Error('dr_runbook.md is too short to be a complete runbook');
  });

  test('contains statutory HIPAA § 164.308 reference and explicit RTO / RPO metrics', () => {
    const content = readFileSync(filePath, 'utf-8');
    if (!content.includes('164.308')) {
      throw new Error('Missing HIPAA § 164.308 contingency reference');
    }
    if (!content.includes('RTO') || !content.includes('RPO')) {
      throw new Error('Missing RTO / RPO definitions');
    }
    if (!content.includes('H. Joe Abudayyeh')) {
      throw new Error('Missing author/security officer H. Joe Abudayyeh');
    }
  });

  test('details Dexie.js offline-first recovery and conflict prevention', () => {
    const content = readFileSync(filePath, 'utf-8');
    if (!content.includes('Dexie') || !content.includes('H0038')) {
      throw new Error('Runbook must address Dexie.js offline sync and H0038 notes preservation');
    }
  });

  return results;
}

if (process.argv[1]?.endsWith('dr_runbook.test.ts')) {
  const outcomes = runDrRunbookTests();
  const failed = outcomes.filter((o) => !o.passed);
  outcomes.forEach((o) => console.log(`${o.passed ? '✓' : '✗'} ${o.name}`));
  if (failed.length > 0) process.exit(1);
}

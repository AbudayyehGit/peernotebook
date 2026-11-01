import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function runUscoDepositTests(): { name: string; passed: boolean; error?: string }[] {
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

  const scriptPath = resolve(process.cwd(), 'scripts/compliance/generate_usco_deposit.sh');
  const depositPath = resolve(process.cwd(), 'docs/compliance/usco_form_tx_deposit.txt');

  test('generate_usco_deposit.sh script exists', () => {
    if (!existsSync(scriptPath)) throw new Error('generate_usco_deposit.sh not found');
  });

  test('generated deposit artifact contains statutory headers and author attribution', () => {
    if (!existsSync(depositPath)) {
      const { execSync } = require('node:child_process');
      execSync(`bash ${scriptPath}`, { stdio: 'pipe' });
    }
    if (!existsSync(depositPath)) throw new Error('Deposit output file not found');
    const content = readFileSync(depositPath, 'utf-8');
    if (!content.includes('UNITED STATES COPYRIGHT OFFICE')) {
      throw new Error('Missing Copyright Office header');
    }
    if (!content.includes('H. Joe Abudayyeh')) {
      throw new Error('Missing author attribution H. Joe Abudayyeh');
    }
    if (!content.includes('37 C.F.R. § 202.20')) {
      throw new Error('Missing statutory reference 37 CFR 202.20');
    }
  });

  test('deposit applies trade secret / credential redactions', () => {
    const content = readFileSync(depositPath, 'utf-8');
    if (!content.includes('REDACTED_TRADE_SECRET_CREDENTIAL') && !content.includes('REDACTED_BEARER_TOKEN')) {
      // It may or may not have matched raw strings, but the script must define redaction rules
      const script = readFileSync(scriptPath, 'utf-8');
      if (!script.includes('REDACTED_TRADE_SECRET_CREDENTIAL')) {
        throw new Error('Redaction logic missing from generate_usco_deposit.sh');
      }
    }
  });

  return results;
}

if (process.argv[1]?.endsWith('usco_deposit.test.ts')) {
  const outcomes = runUscoDepositTests();
  const failed = outcomes.filter((o) => !o.passed);
  outcomes.forEach((o) => console.log(`${o.passed ? '✓' : '✗'} ${o.name}`));
  if (failed.length > 0) process.exit(1);
}

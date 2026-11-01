import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function runBetaCohortTests(): { name: string; passed: boolean; error?: string }[] {
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

  const filePath = resolve(process.cwd(), 'config/tenants/beta_cohort.json');

  test('beta_cohort.json exists and contains exactly 5 CBO tenants', () => {
    const raw = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.cohort || !Array.isArray(data.cohort.tenants)) {
      throw new Error('Missing cohort.tenants array');
    }
    if (data.cohort.tenants.length !== 5) {
      throw new Error(`Expected 5 tenants in pilot cohort, found ${data.cohort.tenants.length}`);
    }
  });

  test('each CBO tenant has valid NPI, Medi-Cal taxonomy, and H0038 rate profile', () => {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    for (const t of data.cohort.tenants) {
      if (!t.tenantId || !t.name || !t.county) {
        throw new Error(`Incomplete tenant identification: ${JSON.stringify(t)}`);
      }
      if (!t.npi || t.npi.length !== 10) {
        throw new Error(`Invalid 10-digit NPI for tenant ${t.tenantId}: ${t.npi}`);
      }
      if (t.primaryBillingCode !== 'H0038') {
        throw new Error(`Expected primaryBillingCode H0038, got ${t.primaryBillingCode}`);
      }
      if (typeof t.h0038ContractedUnitRateUsd !== 'number' || t.h0038ContractedUnitRateUsd <= 0) {
        throw new Error(`Invalid contracted rate for tenant ${t.tenantId}`);
      }
      if (t.offlineTokenGraceHours < 72) {
        throw new Error(`Offline token grace must be >= 72 hours for CalAIM field resilience`);
      }
    }
  });

  return results;
}

if (process.argv[1]?.endsWith('beta_cohort.test.ts')) {
  const outcomes = runBetaCohortTests();
  const failed = outcomes.filter((o) => !o.passed);
  outcomes.forEach((o) => console.log(`${o.passed ? '✓' : '✗'} ${o.name}`));
  if (failed.length > 0) process.exit(1);
}

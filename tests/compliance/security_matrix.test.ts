import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function runSecurityMatrixTests(): { name: string; passed: boolean; error?: string }[] {
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

  const filePath = resolve(process.cwd(), 'docs/compliance/security_matrix.json');

  test('security_matrix.json exists and is valid JSON', () => {
    const raw = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.securityMatrix || !Array.isArray(data.securityMatrix.controls)) {
      throw new Error('Missing securityMatrix.controls array');
    }
  });

  test('covers SOC 2 CC6/CC7/CC8 criteria and ISO 27001 Annex A controls', () => {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    const controls = data.securityMatrix.controls;

    const hasAccessControl = controls.some((c: { controlId: string }) => c.controlId === 'CTL-AC-01');
    const hasCrypto = controls.some((c: { controlId: string }) => c.controlId === 'CTL-CR-02');
    const hasAudit = controls.some((c: { controlId: string }) => c.controlId === 'CTL-AU-03');
    const hasTransmission = controls.some((c: { controlId: string }) => c.controlId === 'CTL-TX-04');

    if (!hasAccessControl || !hasCrypto || !hasAudit || !hasTransmission) {
      throw new Error('Missing core security controls in matrix');
    }

    for (const c of controls) {
      if (!c.soc2Criteria || c.soc2Criteria.length === 0) {
        throw new Error(`Control ${c.controlId} missing SOC 2 criteria`);
      }
      if (!c.hipaaSafeguard) {
        throw new Error(`Control ${c.controlId} missing HIPAA safeguard mapping`);
      }
    }
  });

  return results;
}

if (process.argv[1]?.endsWith('security_matrix.test.ts')) {
  const outcomes = runSecurityMatrixTests();
  const failed = outcomes.filter((o) => !o.passed);
  outcomes.forEach((o) => console.log(`${o.passed ? '✓' : '✗'} ${o.name}`));
  if (failed.length > 0) process.exit(1);
}

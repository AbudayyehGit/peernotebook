import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export function runTrademarkFilingTests(): { name: string; passed: boolean; error?: string }[] {
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

  const filePath = resolve(process.cwd(), 'config/legal/trademark_filing.json');

  test('trademark_filing.json exists and is valid JSON', () => {
    const raw = readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    if (!data.trademarkFiling) throw new Error('Missing trademarkFiling root object');
  });

  test('contains mark "PEER NOTEBOOK" and applicant Peer Notebook LLC', () => {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    if (data.trademarkFiling.mark !== 'PEER NOTEBOOK') {
      throw new Error(`Unexpected mark: ${data.trademarkFiling.mark}`);
    }
    if (data.trademarkFiling.applicant.organization !== 'Peer Notebook LLC') {
      throw new Error('Applicant must be Peer Notebook LLC');
    }
  });

  test('covers International Classes 009 and 042 with Section 1(a) basis', () => {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    const classes = data.trademarkFiling.internationalClasses;
    const has009 = classes.some((c: { classNumber: string }) => c.classNumber === '009');
    const has042 = classes.some((c: { classNumber: string }) => c.classNumber === '042');
    if (!has009 || !has042) {
      throw new Error('Both Class 009 and Class 042 must be defined');
    }
    for (const c of classes) {
      if (!c.filingBasis.includes('1(a)')) {
        throw new Error(`Class ${c.classNumber} must use Section 1(a) basis`);
      }
      if (!c.specimens || c.specimens.length === 0) {
        throw new Error(`Class ${c.classNumber} must include specimen references`);
      }
    }
  });

  return results;
}

if (process.argv[1]?.endsWith('trademark_filing.test.ts')) {
  const outcomes = runTrademarkFilingTests();
  const failed = outcomes.filter((o) => !o.passed);
  outcomes.forEach((o) => console.log(`${o.passed ? '✓' : '✗'} ${o.name}`));
  if (failed.length > 0) process.exit(1);
}

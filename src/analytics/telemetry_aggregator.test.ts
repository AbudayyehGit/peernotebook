import { TelemetryAggregator, RawEncounterMetric } from './telemetry_aggregator.ts';

export async function runTelemetryAggregatorTests(): Promise<{ name: string; passed: boolean; error?: string }[]> {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  async function test(name: string, fn: () => Promise<void> | void) {
    try {
      await fn();
      results.push({ name, passed: true });
    } catch (err: unknown) {
      results.push({
        name,
        passed: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const sampleData: RawEncounterMetric[] = [
    // Alameda County: 6 distinct clients (>= k=5, should not suppress)
    ...Array.from({ length: 6 }, (_, i) => ({
      syntheticPatientId: `alameda_client_${i + 1}`,
      county: 'Alameda',
      tenantId: 'cbo_alameda_01',
      h0038Units: 4,
      durationMinutes: 60,
      locationCode: '15' as const,
      focusDomains: ['Harm Reduction' as const, 'Housing Navigation' as const],
      completionLatencyHours: 1.5,
      cosignLatencyHours: 24.0,
    })),
    // Fresno County: 2 distinct clients (< k=5, should be suppressed)
    {
      syntheticPatientId: 'fresno_client_1',
      county: 'Fresno',
      tenantId: 'cbo_fresno_03',
      h0038Units: 2,
      durationMinutes: 30,
      locationCode: '11' as const,
      focusDomains: ['Recovery Mutual Aid' as const],
      completionLatencyHours: 2.0,
      cosignLatencyHours: 36.0,
    },
    {
      syntheticPatientId: 'fresno_client_2',
      county: 'Fresno',
      tenantId: 'cbo_fresno_03',
      h0038Units: 2,
      durationMinutes: 30,
      locationCode: '11' as const,
      focusDomains: ['Relapse Prevention' as const],
      completionLatencyHours: 0.8,
      cosignLatencyHours: 12.0,
    },
  ];

  await test('aggregate computes totals across counties accurately', () => {
    const report = TelemetryAggregator.aggregate(sampleData, '2026-Q1', 5);
    if (report.summary.statewideEncounters !== 8) {
      throw new Error(`Expected 8 total encounters, got ${report.summary.statewideEncounters}`);
    }
    if (report.summary.statewideTotalUnits !== 28) {
      throw new Error(`Expected 28 total H0038 units, got ${report.summary.statewideTotalUnits}`);
    }
  });

  await test('enforces k-anonymity masking for small cohorts (< 5)', () => {
    const report = TelemetryAggregator.aggregate(sampleData, '2026-Q1', 5);
    const alameda = report.counties['Alameda'];
    const fresno = report.counties['Fresno'];

    if (alameda.kAnonymitySuppressed || alameda.uniqueIndividualsServed !== 6) {
      throw new Error('Alameda (n=6) should not be suppressed');
    }
    if (!fresno.kAnonymitySuppressed || fresno.uniqueIndividualsServed !== '<5') {
      throw new Error('Fresno (n=2) must be masked with <5 for HIPAA/42 CFR Part 2 privacy');
    }
  });

  await test('generateMarkdownTable produces formatted table with mobile breakdown', () => {
    const report = TelemetryAggregator.aggregate(sampleData, '2026-Q1', 5);
    const md = TelemetryAggregator.generateMarkdownTable(report);
    if (!md.includes('| Alameda | 6 | 24 | 6 | 100% |')) {
      throw new Error('Markdown table does not match Alameda row');
    }
    if (!md.includes('| Fresno | 2 | 4 | <5 | 0% |')) {
      throw new Error('Markdown table does not reflect suppressed Fresno count');
    }
  });

  return results;
}

if (process.argv[1]?.endsWith('telemetry_aggregator.test.ts')) {
  runTelemetryAggregatorTests().then((outcomes) => {
    const failed = outcomes.filter((o) => !o.passed);
    outcomes.forEach((o) => console.log(`${o.passed ? '✓' : '✗'} ${o.name}`));
    if (failed.length > 0) process.exit(1);
  });
}

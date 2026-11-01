import { FhirR4Client, FhirEncounterPayload } from './fhir_r4_client.ts';

export async function runFhirClientTests(): Promise<{ name: string; passed: boolean; error?: string }[]> {
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

  const client = new FhirR4Client('https://mock-ehr.example.org/fhir/r4', 'mock-token');

  const sampleEncounter: FhirEncounterPayload = {
    encounterId: 'enc_field_20261101_81',
    syntheticPatientId: 'pat_synth_98a7c2',
    specialistNpi: '1942857102',
    specialistName: 'Jane Specialist, Certified Peer',
    organizationId: 'cbo_alameda_01',
    startTime: '2026-11-01T10:00:00Z',
    endTime: '2026-11-01T11:00:00Z',
    durationMinutes: 60,
    h0038Units: 4,
    serviceLocationCode: '15',
    carePlanGoalId: 'goal_relapse_prev_04',
    peerInterventions: [
      'Reviewed relapse prevention strategies',
      'Accompanied individual to recovery mutual aid group',
    ],
    clientResponse: 'Individual engaged openly, noted feeling encouraged, identified 2 sober support contacts.',
  };

  await test('buildEncounterResource constructs valid FHIR R4 Encounter with H0038 billing code', () => {
    const res = client.buildEncounterResource(sampleEncounter) as {
      resourceType: string;
      id: string;
      type: Array<{ coding: Array<{ code: string; system: string }> }>;
      subject: { reference: string };
      period: { start: string; end: string };
    };

    if (res.resourceType !== 'Encounter') throw new Error('Resource type must be Encounter');
    if (res.id !== sampleEncounter.encounterId) throw new Error('ID mismatch');
    const h0038Code = res.type[0].coding.find((c) => c.code === 'H0038');
    if (!h0038Code) throw new Error('H0038 coding missing from encounter');
    if (!res.subject.reference.includes('pat_synth_98a7c2')) {
      throw new Error('Subject must reference synthetic patient ID');
    }
  });

  await test('buildObservationResource includes CalAIM strengths-based notes and goal link', () => {
    const obs = client.buildObservationResource(sampleEncounter) as {
      resourceType: string;
      category: Array<{ coding: Array<{ code: string }> }>;
      note: Array<{ text: string }>;
      extension: Array<{ valueReference: { reference: string } }>;
    };

    if (obs.resourceType !== 'Observation') throw new Error('Resource type must be Observation');
    if (!obs.note.some((n) => n.text.includes('relapse prevention strategies'))) {
      throw new Error('Interventions missing from note');
    }
    if (!obs.extension.some((e) => e.valueReference.reference === 'Goal/goal_relapse_prev_04')) {
      throw new Error('CarePlan goal reference missing');
    }
  });

  return results;
}

if (process.argv[1]?.endsWith('fhir_r4_client.test.ts')) {
  runFhirClientTests().then((outcomes) => {
    const failed = outcomes.filter((o) => !o.passed);
    outcomes.forEach((o) => console.log(`${o.passed ? '✓' : '✗'} ${o.name}`));
    if (failed.length > 0) process.exit(1);
  });
}

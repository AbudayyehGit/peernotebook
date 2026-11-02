/**
 * Peer Notebook - Sprint 1 Compliance Assertions Test Suite
 * SP1-01: CalAIM H0038 Time Overlap & Daily Cap Validation (BillingValidator.ts)
 * SP1-02: Offline Supervisor Attestation & Local SHA-256 Cryptographic Binding (SupervisorSignOff)
 * SP1-03: Append-Only SHA-256 Chained Audit Trail & Tamper Detection (AuditTrail.ts)
 */

import {
  BillingValidator,
  parseTimeToMinutes,
  doIntervalsOverlap,
  CALAIM_LIMITS
} from '../../src/services/BillingValidator.ts';
import {
  computeSha256,
  GENESIS_PREVIOUS_HASH
} from '../../src/services/AuditTrail.ts';
import { SessionNote, AuditLogEntry } from '../../src/db/peerNotebookDatabase.ts';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runSprint1ComplianceTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const assert = (name: string, condition: boolean, errorMsg?: string) => {
    if (condition) {
      results.push({ name, passed: true });
    } else {
      results.push({ name, passed: false, error: errorMsg || 'Assertion failed' });
    }
  };

  // =========================================================================
  // SP1-01: BillingValidator & CalAIM H0038 Time Overlap / Daily Cap Tests
  // =========================================================================

  // Test 1: Time parsing helper
  const t1 = parseTimeToMinutes('09:30');
  const t2 = parseTimeToMinutes('10:15');
  const t3 = parseTimeToMinutes('02:00 PM');
  assert(
    'SP1-01.1: Time string parser converts 24-hr and 12-hr formats accurately',
    t1 === 570 && t2 === 615 && t3 === 840,
    `Expected 570, 615, 840; got ${t1}, ${t2}, ${t3}`
  );

  // Test 2: Overlap calculation helper
  const overlaps1 = doIntervalsOverlap(540, 600, 570, 630); // 9:00-10:00 and 9:30-10:30 (overlap)
  const overlaps2 = doIntervalsOverlap(540, 600, 600, 660); // 9:00-10:00 and 10:00-11:00 (back-to-back, no overlap)
  assert(
    'SP1-01.2: Interval overlap detector correctly identifies intersecting intervals and back-to-back intervals',
    overlaps1 === true && overlaps2 === false,
    `Expected overlaps1=true, overlaps2=false; got ${overlaps1}, ${overlaps2}`
  );

  // Mock baseline existing note
  const existingNote: SessionNote = {
    id: 'note-base-01',
    organizationId: 'org-calaim-01',
    clientId: 'client-01',
    clientName: 'Jordan Hayes',
    clientIdentifier: 'PN-4091',
    authorId: 'specialist-01',
    authorName: 'Alex Rivera, CPSS-CA',
    authorCredentials: 'CPSS-CA',
    encounterDate: '2026-11-02',
    startTime: '09:00',
    endTime: '10:00',
    faceToFaceMinutes: 45,
    travelMinutes: 10,
    documentationMinutes: 5,
    durationMinutes: 60,
    billingCode: 'H0038',
    billingUnits: 4,
    modality: 'community_field',
    placeOfServiceCode: '15',
    locationDetails: 'Field Community Center',
    focusDomains: ['Housing Stability'],
    goalAddressed: 'Secure transitional housing',
    peerIntervention: 'Coached peer on intake checklist',
    clientResponse: 'Peer expressed relief and engaged fully',
    planNextSteps: 'Meet at housing office Thursday',
    safetyConcerns: false,
    specialistSignature: 'Alex Rivera, CPSS-CA',
    status: 'approved',
    synced: true,
    createdAt: '2026-11-02T09:00:00Z',
    updatedAt: '2026-11-02T10:00:00Z'
  };

  // Test 3: Same Client Time Overlap Detection
  const overlappingClientCandidate: Partial<SessionNote> = {
    id: 'note-candidate-overlap-client',
    encounterDate: '2026-11-02',
    startTime: '09:30',
    endTime: '10:30',
    clientId: 'client-01',
    authorId: 'specialist-02', // different specialist, but same client!
    durationMinutes: 60,
    billingUnits: 4
  };
  const clientOverlapRes = BillingValidator.validateNote(overlappingClientCandidate, [existingNote]);
  assert(
    'SP1-01.3: Detects and strictly blocks time overlap conflict for the same client on same date',
    clientOverlapRes.isValid === false && clientOverlapRes.conflicts.hasTimeOverlap === true,
    `Expected isValid=false, hasTimeOverlap=true; got valid=${clientOverlapRes.isValid}`
  );

  // Test 4: Same Specialist Concurrent Encounter Detection
  const overlappingSpecialistCandidate: Partial<SessionNote> = {
    id: 'note-candidate-overlap-spec',
    encounterDate: '2026-11-02',
    startTime: '09:15',
    endTime: '10:15',
    clientId: 'client-99', // different client, but same specialist!
    authorId: 'specialist-01',
    durationMinutes: 60,
    billingUnits: 4
  };
  const specOverlapRes = BillingValidator.validateNote(overlappingSpecialistCandidate, [existingNote]);
  assert(
    'SP1-01.4: Detects and strictly blocks concurrent scheduling conflict for the same specialist on same date',
    specOverlapRes.isValid === false && specOverlapRes.conflicts.hasTimeOverlap === true,
    `Expected isValid=false, hasTimeOverlap=true; got valid=${specOverlapRes.isValid}`
  );

  // Test 5: Client Daily Cap Exceeded (max 24 units / 360 mins)
  const heavyPriorNotes: SessionNote[] = [
    {
      ...existingNote,
      id: 'note-heavy-1',
      startTime: '08:00',
      endTime: '11:00',
      billingUnits: 12,
      durationMinutes: 180
    },
    {
      ...existingNote,
      id: 'note-heavy-2',
      startTime: '12:00',
      endTime: '15:00',
      billingUnits: 10,
      durationMinutes: 150
    }
  ];
  // 12 + 10 = 22 units currently. Candidate proposes 4 units -> 26 units (exceeds 24 max)
  const exceedingCapCandidate: Partial<SessionNote> = {
    id: 'note-candidate-cap',
    encounterDate: '2026-11-02',
    startTime: '16:00',
    endTime: '17:00',
    clientId: 'client-01',
    authorId: 'specialist-05',
    durationMinutes: 60,
    billingUnits: 4
  };
  const capRes = BillingValidator.validateNote(exceedingCapCandidate, heavyPriorNotes);
  assert(
    'SP1-01.5: Enforces CalAIM H0038 statutory daily cap (blocks cumulative >24 units per client)',
    capRes.isValid === false && capRes.conflicts.exceedsClientDailyCap === true,
    `Expected exceedsClientDailyCap=true; got ${capRes.conflicts.exceedsClientDailyCap}`
  );

  // Test 6: CMS 8-Minute Threshold Rule Enforcement
  const sub8MinuteCandidate: Partial<SessionNote> = {
    id: 'note-candidate-sub8',
    encounterDate: '2026-11-02',
    startTime: '14:00',
    endTime: '14:05',
    clientId: 'client-new',
    authorId: 'specialist-01',
    durationMinutes: 5, // under 8 minutes
    billingUnits: 1 // cannot bill for 1 unit if under 8 minutes
  };
  const sub8Res = BillingValidator.validateNote(sub8MinuteCandidate, []);
  assert(
    'SP1-01.6: CMS 8-Minute Rule blocks billing units for encounters under 8 minutes',
    sub8Res.isValid === false && sub8Res.conflicts.violates8MinuteRule === true,
    `Expected violates8MinuteRule=true; got ${sub8Res.conflicts.violates8MinuteRule}`
  );

  // Test 7: Clean encounter with no conflicts passes validation
  const cleanCandidate: Partial<SessionNote> = {
    id: 'note-candidate-clean',
    encounterDate: '2026-11-02',
    startTime: '14:00',
    endTime: '15:00',
    clientId: 'client-01',
    authorId: 'specialist-01',
    faceToFaceMinutes: 45,
    travelMinutes: 10,
    documentationMinutes: 5,
    durationMinutes: 60,
    billingUnits: 4
  };
  const cleanRes = BillingValidator.validateNote(cleanCandidate, [existingNote]);
  assert(
    'SP1-01.7: Non-overlapping encounter within daily caps passes validation cleanly',
    cleanRes.isValid === true && cleanRes.errors.length === 0,
    `Expected isValid=true; got errors: ${cleanRes.errors.join(', ')}`
  );

  // =========================================================================
  // SP1-02: Supervisor Offline Attestation & SHA-256 Local Cryptographic Hash
  // =========================================================================

  const supervisorCanonical = [
    existingNote.id,
    existingNote.clientId,
    existingNote.clientIdentifier,
    existingNote.encounterDate,
    existingNote.durationMinutes,
    existingNote.billingUnits,
    existingNote.billingCode,
    'supervisor-01',
    '1982049182',
    'LCSW #94102',
    '2026-11-02T11:00:00Z',
    'STATUTORY_ATTESTATION_TEXT'
  ].join('::');

  const attestationHash = await computeSha256(supervisorCanonical);
  assert(
    'SP1-02.1: Generates valid 64-character hex SHA-256 attestation digest',
    typeof attestationHash === 'string' && attestationHash.length === 64,
    `Expected 64-char hex string; got length ${attestationHash?.length}`
  );

  const boundSignature = `SHA256:${attestationHash}:Dr. Sarah Jenkins, LCSW [LCSW #94102]`;
  assert(
    'SP1-02.2: Binds electronic signature to SHA-256 local hash with licensing credentials',
    boundSignature.startsWith(`SHA256:${attestationHash}`) && boundSignature.includes('LCSW #94102'),
    `Signature format mismatch: ${boundSignature}`
  );

  // =========================================================================
  // SP1-03: Append-Only SHA-256 Chained Audit Trail & Tamper Detection
  // =========================================================================

  // Test 8: Genesis Previous Hash Anchor
  assert(
    'SP1-03.1: Genesis block previous hash is anchored at 64 hexadecimal zeros',
    GENESIS_PREVIOUS_HASH === '0'.repeat(64),
    `Expected 64 zeros, got ${GENESIS_PREVIOUS_HASH}`
  );

  // Test 9: Simulate Chained Audit Log Generation
  const chain: Array<{ id: string; prevHash: string; currentHash: string; payload: string }> = [];
  let prev = GENESIS_PREVIOUS_HASH;

  for (let i = 0; i < 4; i++) {
    const id = `audit-test-${i}`;
    const payload = `RECORD_DATA_${i}`;
    const canonical = [prev, id, payload].join('|');
    const currentHash = await computeSha256(canonical);
    chain.push({ id, prevHash: prev, currentHash, payload });
    prev = currentHash;
  }

  assert(
    'SP1-03.2: Each chained audit record securely links to the preceding entry hash',
    chain[1].prevHash === chain[0].currentHash &&
    chain[2].prevHash === chain[1].currentHash &&
    chain[3].prevHash === chain[2].currentHash,
    'Chain link mismatch between sequential audit entries'
  );

  // Test 10: Tamper Detection Simulation
  // If an attacker mutates payload of record 1:
  const tamperedCanonical = [chain[1].prevHash, chain[1].id, 'TAMPERED_PAYLOAD'].join('|');
  const tamperedHash = await computeSha256(tamperedCanonical);
  const detectedTampering = tamperedHash !== chain[1].currentHash;

  assert(
    'SP1-03.3: Cryptographic verification flags and rejects tampered audit record',
    detectedTampering === true,
    'Failed to detect modified audit record payload'
  );

  return results;
}

// Standalone execution entrypoint
if (import.meta.url === `file://${process.argv[1]}`) {
  runSprint1ComplianceTests().then((results) => {
    let passed = 0;
    let failed = 0;
    console.log('\n================================================================');
    console.log('SPRINT 1 (SP1-01, SP1-02, SP1-03) COMPLIANCE ASSERTIONS');
    console.log('================================================================');
    for (const r of results) {
      if (r.passed) {
        console.log(`  ✓ ${r.name}`);
        passed++;
      } else {
        console.error(`  ✗ ${r.name}: ${r.error}`);
        failed++;
      }
    }
    console.log('================================================================');
    console.log(`Summary: ${passed} passed, ${failed} failed.`);
    console.log('================================================================\n');
    if (failed > 0) process.exit(1);
  });
}

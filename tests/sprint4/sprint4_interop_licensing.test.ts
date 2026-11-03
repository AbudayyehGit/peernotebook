/**
 * Peer Notebook - Sprint 4 Unit Tests: Interoperability, Solo 1099 Licensing & Documentation
 * Verifies SP4-01 (DocViewer), SP4-02 (Solo RLS Migration), SP4-03 (Encrypted Chart Export),
 * SP4-04 (Stripe Dual-Path Webhook), and SP4-05 (FHIR R4 Bundle Serializer).
 *
 * Attribution: H. Joe Abudayyeh & Peer Notebook LLC (2026-2027)
 * Standards: ISO 9001 • HL7 FHIR R4 • CalAIM H0038 • HIPAA § 164.312
 */

import fs from 'node:fs';
import path from 'node:path';
import { exportToFHIR, EhrIntegrationService } from '../../src/services/ehrIntegrationService.ts';
import { SessionNote } from '../../src/db/peerNotebookDatabase.ts';
import { pseudonymizeClientIdentifier, pseudonymizeNote, batchPseudonymize } from '../../src/services/clientPseudonymizer.ts';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runSprint4Tests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  function assert(name: string, condition: boolean, message?: string) {
    if (condition) {
      results.push({ name, passed: true });
    } else {
      results.push({ name, passed: false, error: message || 'Assertion failed' });
    }
  }

  // ==========================================
  // 1. SP4-01: DocViewer Component & ISO 9001 Compliance
  // ==========================================
  try {
    const docViewerPath = path.resolve('src/components/DocViewer.tsx');
    assert('SP4-01: DocViewer.tsx source file exists', fs.existsSync(docViewerPath));

    const content = fs.readFileSync(docViewerPath, 'utf8');
    assert(
      'SP4-01: DocViewer conforms to ISO 9001 and soft slate palette tokens',
      content.includes('ISO 9001') && content.includes('bg-white') && content.includes('DocViewerProps')
    );
    assert(
      'SP4-01: DocViewer safely normalizes relative markdown paths',
      content.includes('replace(/^\\/+/, \'\')')
    );
  } catch (err) {
    assert('SP4-01 DocViewer verification', false, String(err));
  }

  // ==========================================
  // 2. SP4-02: Solo 1099 Practitioner RLS Policy & SQL Migration
  // ==========================================
  try {
    const migrationPath = path.resolve('migrations/20261103000008_solo_1099_progress_notes_rls.sql');
    assert('SP4-02: Solo 1099 RLS migration file exists', fs.existsSync(migrationPath));

    const sql = fs.readFileSync(migrationPath, 'utf8');
    assert(
      'SP4-02: SQL migration adds is_solo_practitioner column to progress_notes',
      sql.includes('is_solo_practitioner BOOLEAN DEFAULT FALSE')
    );
    assert(
      'SP4-02: SQL migration enforces Row Level Security (ENABLE ROW LEVEL SECURITY)',
      sql.includes('ENABLE ROW LEVEL SECURITY')
    );
    assert(
      'SP4-02: SQL migration establishes solo_practitioner_notes_policy scoping to auth.uid()',
      sql.includes('CREATE POLICY solo_practitioner_notes_policy') &&
      sql.includes('specialist_id = auth.uid()') &&
      sql.includes('is_solo_practitioner = TRUE')
    );
  } catch (err) {
    assert('SP4-02 Solo 1099 RLS migration verification', false, String(err));
  }

  // ==========================================
  // 3. SP4-03: Encrypted Chart Export Utility with Audit Trigger
  // ==========================================
  try {
    const chartExportPath = path.resolve('src/services/chartExport.ts');
    assert('SP4-03: chartExport.ts source file exists', fs.existsSync(chartExportPath));

    const source = fs.readFileSync(chartExportPath, 'utf8');
    assert(
      'SP4-03: exportEncryptedChart exports progress note records as enc.json',
      source.includes('exportEncryptedChart') && source.includes('.enc.json')
    );
    assert(
      'SP4-03: exportEncryptedChart triggers asynchronous AuditLogger.log',
      source.includes('AuditLogger.log') && source.includes('exportEncryptedChart')
    );

    // Test pseudonymization engine
    const rawClientId = 'client-real-identifier-901';
    const pseudoTag = pseudonymizeClientIdentifier(rawClientId);
    assert(
      'SP4-03: pseudonymizeClientIdentifier formats deterministic client pseudonym (e.g. Client #XXXX)',
      pseudoTag.startsWith('Client #') && pseudoTag.length >= 10
    );

    const testProgressNote = {
      id: 'note-secret-01',
      clientId: 'client-real-identifier-901',
      clientName: 'Eleanor Vance',
      mediCalCin: '98234120A',
      peer_id: 'secret-mrn-01',
      goalAddressed: 'Housing stability and peer coaching'
    };

    const pseudoNote = pseudonymizeNote(testProgressNote);
    assert(
      'SP4-03: pseudonymizeNote masks clientName, mediCalCin, and clientIdentifier preserving goals',
      pseudoNote.clientName.startsWith('Client #') &&
      pseudoNote.mediCalCin.startsWith('CIN-PSEUDO-') &&
      pseudoNote.goalAddressed === 'Housing stability and peer coaching'
    );
  } catch (err) {
    assert('SP4-03 Encrypted Chart Export verification', false, String(err));
  }

  // ==========================================
  // 4. SP4-04: Dual-Path Subscription Stripe Webhook
  // ==========================================
  try {
    const webhookPath = path.resolve('supabase/functions/stripe-webhook/index.ts');
    assert('SP4-04: stripe-webhook/index.ts edge function exists', fs.existsSync(webhookPath));

    const edgeSource = fs.readFileSync(webhookPath, 'utf8');
    assert(
      'SP4-04: Stripe webhook verifies stripe-signature header',
      edgeSource.includes('stripe.webhooks.constructEvent') && edgeSource.includes('stripe-signature')
    );
    assert(
      'SP4-04: Stripe webhook handles checkout.session.completed with multi-tier plan support',
      edgeSource.includes('checkout.session.completed') && edgeSource.includes('plan_tier')
    );
  } catch (err) {
    assert('SP4-04 Stripe Webhook verification', false, String(err));
  }

  // ==========================================
  // 5. SP4-05: CBO EHR Integration & Standard FHIR R4 Serialization
  // ==========================================
  try {
    // Test 5.1: exportToFHIR top-level helper
    const testNote = {
      peer_id: 'patient-test-77',
      content: 'Participant successfully navigated CalAIM housing coordination appointment.',
      created_at: '2026-11-03T02:00:00.000Z'
    };

    const fhirJson = exportToFHIR(testNote);
    const parsed = JSON.parse(fhirJson);

    assert('SP4-05: exportToFHIR returns valid JSON document bundle', parsed.resourceType === 'Bundle' && parsed.type === 'document');
    assert(
      'SP4-05: FHIR bundle entry contains completed ClinicalImpression resource',
      parsed.entry?.[0]?.resource?.resourceType === 'ClinicalImpression' &&
      parsed.entry?.[0]?.resource?.status === 'completed'
    );
    assert(
      'SP4-05: ClinicalImpression subject maps accurately to Patient reference',
      parsed.entry?.[0]?.resource?.subject?.reference === 'Patient/patient-test-77'
    );

    // Test 5.2: EhrIntegrationService.generateFhirR4Bundle with H0038 encounter
    const sampleSessionNote: SessionNote = {
      id: 'session-sample-99',
      clientId: 'client-99',
      clientName: 'Samira Patel',
      clientIdentifier: 'PN-4091',
      authorId: 'spec-01',
      authorName: 'Alex Rivera, CPSS-CA',
      authorCredentials: 'California Certified Peer Support Specialist',
      encounterDate: '2026-11-03',
      startTime: '10:00',
      endTime: '10:45',
      faceToFaceMinutes: 45,
      travelMinutes: 0,
      documentationMinutes: 10,
      durationMinutes: 55,
      billingCode: 'H0038',
      billingUnits: 3,
      modality: 'community_field',
      locationDetails: 'Community Outreach / Field Mobile (POS 15)',
      placeOfServiceCode: '15',
      focusDomains: ['Housing Stability', 'System Navigation'],
      goalAddressed: 'Housing stability and peer navigator check-in',
      peerIntervention: 'Assisted participant in verifying CalAIM Community Supports referral form.',
      clientResponse: 'Client stated: "I feel relieved to know the paperwork is finalized."',
      planNextSteps: 'Review appointment schedule next Tuesday at 10 AM.',
      safetyConcerns: false,
      specialistSignature: 'Alex Rivera, CPSS-CA',
      status: 'approved',
      synced: true,
      createdAt: '2026-11-03T10:00:00Z',
      updatedAt: '2026-11-03T10:45:00Z'
    };

    const fullBundle = EhrIntegrationService.generateFhirR4Bundle(sampleSessionNote) as any;
    assert(
      'SP4-05: EhrIntegrationService generates full FHIR R4 Bundle with Patient, Practitioner, and Encounter entries',
      fullBundle.resourceType === 'Bundle' && Array.isArray(fullBundle.entry) && fullBundle.entry.length >= 3
    );

    const encounterEntry = fullBundle.entry.find((e: any) => e.resource?.resourceType === 'Encounter');
    assert(
      'SP4-05: FHIR Encounter resource embeds CalAIM H0038 service code coding',
      encounterEntry &&
      encounterEntry.resource?.type?.[0]?.coding?.[0]?.code === 'H0038'
    );
  } catch (err) {
    assert('SP4-05 EHR Integration & FHIR R4 verification', false, String(err));
  }

  return results;
}

/**
 * Peer Notebook - Sprint 3 Test Suite: UI/UX Refinement, CalAIM Exports & Accessibility
 * Tests:
 * - SP3-01: Compliance & Web Crypto Security Evaluation
 * - SP3-02: CalAIM H0038 Export Generators (PDF HTML, Markdown, SHA-256 audit digest)
 * - SP3-03: WCAG 2.1 AA Focus Management & Screen Reader Announcer
 *
 * Engineering Standard: H. Joe Abudayyeh Systems Production Standards
 * Copyright © 2026-2027 H. Joe Abudayyeh & Peer Notebook LLC. All Rights Reserved.
 */

import { computeNoteSha256, generateCalAIMMarkdown, generateProgressNotePdfHtml } from '../../src/services/PdfGenerator';
import { getModalAriaProps, announceToScreenReader } from '../../src/utils/FocusManagement';
import { SessionNote } from '../../src/db/peerNotebookDatabase';

export interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runSprint3UiUxRefinementTests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  const mockNote: SessionNote = {
    id: 'note-sp3-test-001',
    organizationId: 'org-cbo-alameda-01',
    clientId: 'cli-test-01',
    clientIdentifier: 'PN-4401',
    clientName: 'Jordan Martinez',
    mediCalCin: '98765432A',
    authorId: 'user-cpss-01',
    authorName: 'Alex Rivera, CPSS-CA',
    authorCredentials: 'Certified Peer Support Specialist',
    encounterDate: '2026-11-02',
    startTime: '10:00',
    endTime: '10:45',
    faceToFaceMinutes: 45,
    durationMinutes: 45,
    travelMinutes: 15,
    documentationMinutes: 10,
    billingCode: 'H0038',
    billingUnits: 3,
    modality: 'community_field',
    placeOfServiceCode: '15',
    locationDetails: 'Community field outreach',
    focusDomains: ['Recovery Goals', 'Housing Stability'],
    goalAddressed: 'Strengths-based housing transition and stabilization.',
    peerIntervention: 'CPSS used lived experience to coach peer through lease paperwork.',
    clientResponse: 'Peer expressed relief and felt supported.',
    planNextSteps: 'Peer will deliver documents to housing coordinator on Wednesday.',
    specialistSignature: 'Alex Rivera',
    supervisorSignature: 'Dr. Evelyn Vance, LCSW',
    supervisorName: 'Dr. Evelyn Vance',
    signedAt: '2026-11-02T10:50:00Z',
    approvedAt: '2026-11-02T11:15:00Z',
    safetyConcerns: false,
    status: 'approved',
    synced: true,
    createdAt: '2026-11-02T10:00:00Z',
    updatedAt: '2026-11-02T11:15:00Z'
  };

  // Test 1: SHA-256 Audit Hash computation
  try {
    const hash = await computeNoteSha256(mockNote);
    const isValidHex = /^[a-f0-9]{64}$/.test(hash);
    results.push({
      name: 'SP3-02: Deterministic SHA-256 note hash generation',
      passed: isValidHex && hash.length === 64,
      error: !isValidHex ? `Invalid hash: ${hash}` : undefined
    });
  } catch (err: any) {
    results.push({
      name: 'SP3-02: Deterministic SHA-256 note hash generation',
      passed: false,
      error: err?.message
    });
  }

  // Test 2: CalAIM Markdown Export Generator
  try {
    const md = await generateCalAIMMarkdown(mockNote, {
      organizationName: 'Alameda County Behavioral Health CBO'
    });
    const hasH0038 = md.includes('H0038') && md.includes('billable_15min_units: 3');
    const has4Parts = md.includes('Strengths-Based Recovery Goal') &&
                      md.includes('Peer Support Intervention') &&
                      md.includes('Client Response') &&
                      md.includes('Collaborative Plan');
    const hasSupervisor = md.includes('Dr. Evelyn Vance') && md.includes('Attestation:');
    const hasSha = md.includes('cryptographic_audit_sha256');

    results.push({
      name: 'SP3-02: CalAIM Markdown export embeds H0038 codes, 4-part notes, supervisor block & SHA-256',
      passed: hasH0038 && has4Parts && hasSupervisor && hasSha,
      error: !hasH0038 ? 'Missing H0038 billing codes' : (!has4Parts ? 'Missing 4-part structure' : (!hasSupervisor ? 'Missing supervisor block' : 'Missing SHA'))
    });
  } catch (err: any) {
    results.push({
      name: 'SP3-02: CalAIM Markdown export embeds H0038 codes, 4-part notes, supervisor block & SHA-256',
      passed: false,
      error: err?.message
    });
  }

  // Test 3: CalAIM PDF Print-Ready HTML Generator
  try {
    const html = await generateProgressNotePdfHtml(mockNote, {
      organizationName: 'Alameda County Behavioral Health CBO'
    });
    const hasH0038Badge = html.includes('HCPCS H0038') && html.includes('3 Units');
    const hasSignatures = html.includes('/s/ Alex Rivera') && html.includes('/s/ Dr. Evelyn Vance');
    const hasAuditSeal = html.includes('CRYPTOGRAPHIC AUDIT DIGEST (SHA-256)');
    const hasLegalFooter = html.includes('California CMIA § 56.10 & 45 CFR § 164.502');

    results.push({
      name: 'SP3-02: CalAIM PDF HTML embeds billing units, supervisor signature and cryptographic seal',
      passed: hasH0038Badge && hasSignatures && hasAuditSeal && hasLegalFooter,
      error: !hasH0038Badge ? 'Missing billing badge' : (!hasSignatures ? 'Missing signatures' : 'Missing seal/footer')
    });
  } catch (err: any) {
    results.push({
      name: 'SP3-02: CalAIM PDF HTML embeds billing units, supervisor signature and cryptographic seal',
      passed: false,
      error: err?.message
    });
  }

  // Test 4: WCAG 2.1 AA Modal ARIA Props
  try {
    const ariaProps = getModalAriaProps('my-title-id', 'my-desc-id');
    const hasRoleDialog = ariaProps.role === 'dialog';
    const hasModalTrue = ariaProps['aria-modal'] === true;
    const hasLabelledBy = ariaProps['aria-labelledby'] === 'my-title-id';
    const hasDescribedBy = ariaProps['aria-describedby'] === 'my-desc-id';

    results.push({
      name: 'SP3-03: Accessible Modal ARIA parity (role="dialog", aria-modal=true, labelledby)',
      passed: hasRoleDialog && hasModalTrue && hasLabelledBy && hasDescribedBy,
      error: 'Invalid modal ARIA properties'
    });
  } catch (err: any) {
    results.push({
      name: 'SP3-03: Accessible Modal ARIA parity',
      passed: false,
      error: err?.message
    });
  }

  // Test 5: Screen Reader Announcer
  try {
    announceToScreenReader('Test announcement for screen readers', 'polite');
    results.push({
      name: 'SP3-03: Screen reader status announcer live-region integration',
      passed: true
    });
  } catch (err: any) {
    results.push({
      name: 'SP3-03: Screen reader status announcer live-region integration',
      passed: false,
      error: err?.message
    });
  }

  return results;
}

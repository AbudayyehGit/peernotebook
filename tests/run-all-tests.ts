/**
 * PEER NOTEBOOK - MASTER UNIT TEST SUITE RUNNER
 * Executes all unit tests for Backlog Items 1 through 11
 */

import { runEntityMetaTests } from './legal/entity_meta.test.ts';
import { runTrademarkFilingTests } from './legal/trademark_filing.test.ts';
import { runUscoDepositTests } from './compliance/usco_deposit.test.ts';
import { runOfflineTokenTests } from '../src/auth/offline_token_engine.test.ts';
import { runWebhookGatewayTests } from '../src/alerts/webhook_gateway.test.ts';
import { runBetaCohortTests } from './tenants/beta_cohort.test.ts';
import { runDrRunbookTests } from './compliance/dr_runbook.test.ts';
import { runSecurityMatrixTests } from './compliance/security_matrix.test.ts';
import { runFhirClientTests } from '../src/interop/fhir_r4_client.test.ts';
import { runSmartLaunchpadTests } from '../src/interop/smart_launchpad.test.ts';
import { runTelemetryAggregatorTests } from '../src/analytics/telemetry_aggregator.test.ts';
import { runSprint1ComplianceTests } from './sprint1/sprint1_compliance.test.ts';
import { runSprint2Tests } from './sync/sprint2.test.ts';
import { runSprint3UiUxRefinementTests } from './sprint3/sprint3_ui_ux_refinement.test.ts';
import { runSprint4Tests } from './sprint4/sprint4_interop_licensing.test.ts';
import { runOrgProvisioningTests } from './tenants/org_provisioning.test.ts';

async function main() {
  console.log('================================================================');
  console.log('PEER NOTEBOOK: EXECUTING FULL OPERATIONAL BACKLOG TEST SUITE');
  console.log('================================================================');

  const testGroups = [
    { id: 1, name: 'State Registry & IRS EIN Confirmation', runner: () => Promise.resolve(runEntityMetaTests()) },
    { id: 2, name: 'USPTO Trademark Class 042 & 009', runner: () => Promise.resolve(runTrademarkFilingTests()) },
    { id: 3, name: 'USCO Form TX Copyright Code Deposit', runner: () => Promise.resolve(runUscoDepositTests()) },
    { id: 4, name: 'Offline OAuth & JWT Rotation > 72 Hours', runner: runOfflineTokenTests },
    { id: 5, name: 'PagerDuty/Opsgenie Webhook Gateway', runner: runWebhookGatewayTests },
    { id: 6, name: '5-CBO Beta Pilot Cohort Onboarding', runner: () => Promise.resolve(runBetaCohortTests()) },
    { id: 7, name: 'Cold Disaster Recovery Simulation Drill', runner: () => Promise.resolve(runDrRunbookTests()) },
    { id: 8, name: 'SOC 2 Type 1 & ISO 27001 Controls', runner: () => Promise.resolve(runSecurityMatrixTests()) },
    { id: 9, name: 'Bi-Directional HL7 FHIR R4 Write-Back', runner: runFhirClientTests },
    { id: 10, name: 'SMART-on-FHIR Triage Launchpad', runner: runSmartLaunchpadTests },
    { id: 11, name: 'Multi-County Population Telemetry', runner: runTelemetryAggregatorTests },
    { id: 12, name: 'Sprint 1: Compliance & Billing Integrity (SP1-01, SP1-02, SP1-03)', runner: runSprint1ComplianceTests },
    { id: 13, name: 'Sprint 2: Offline Synchronization & Resiliency (SP2-01, SP2-02, SP2-03)', runner: runSprint2Tests },
    { id: 14, name: 'Sprint 3: UI/UX Refinement, Exports & Accessibility (SP3-01, SP3-02, SP3-03)', runner: runSprint3UiUxRefinementTests },
    { id: 15, name: 'Sprint 4: Interoperability, Solo 1099 Licensing & Documentation (SP4-01 to SP4-05)', runner: runSprint4Tests },
    { id: 16, name: 'Super Admin CBO Organization Provisioning & Capacity Limits', runner: runOrgProvisioningTests },
  ];

  let totalPassed = 0;
  let totalFailed = 0;

  for (const group of testGroups) {
    console.log(`\n[Item ${group.id}] ${group.name}:`);
    const results = await group.runner();
    for (const res of results) {
      if (res.passed) {
        console.log(`  ✓ ${res.name}`);
        totalPassed++;
      } else {
        console.error(`  ✗ ${res.name}: ${res.error}`);
        totalFailed++;
      }
    }
  }

  console.log('\n================================================================');
  console.log(`Test Execution Summary: ${totalPassed} passed, ${totalFailed} failed.`);
  console.log('================================================================');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});

import { WebhookGateway, AlertPayload } from './webhook_gateway.ts';
import { createHmac } from 'node:crypto';

export async function runWebhookGatewayTests(): Promise<{ name: string; passed: boolean; error?: string }[]> {
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

  const sampleAlert: AlertPayload = {
    title: 'IndexedDB sync backlog exceeded 100 items',
    severity: 'error',
    source: 'calaim-sync-engine',
    tenantId: 'ten_sf_cbo_09',
    incidentCode: 'ERR_SYNC_BACKLOG',
    details: {
      pendingNotesCount: 142,
      maxLatencySeconds: 310,
      client_name: 'John Doe Sensitive Name', // test HIPAA sanitization
      ssn: '123-45-6789',
    },
  };

  await test('sanitizeDetails redacts HIPAA sensitive keys', () => {
    const sanitized = WebhookGateway.sanitizeDetails(sampleAlert.details);
    if (sanitized.client_name !== '[REDACTED_HIPAA_PHI]' || sanitized.ssn !== '[REDACTED_HIPAA_PHI]') {
      throw new Error('HIPAA keys were not redacted');
    }
    if (sanitized.pendingNotesCount !== 142) {
      throw new Error('Non-sensitive numerical fields should be preserved');
    }
  });

  await test('verifyInboundSignature verifies valid HMAC signatures and rejects invalid ones', () => {
    const secret = 'super_secret_webhook_key_2026';
    const body = JSON.stringify({ action: 'sync_check', timestamp: 1711200000 });
    const signature = createHmac('sha256', secret).update(body).digest('hex');

    const valid = WebhookGateway.verifyInboundSignature(body, signature, secret);
    if (!valid) throw new Error('Valid HMAC signature failed verification');

    const invalid = WebhookGateway.verifyInboundSignature(body, 'bad_signature', secret);
    if (invalid) throw new Error('Invalid signature unexpectedly passed verification');
  });

  await test('formatPagerDutyEvent creates compliant Events API v2 schema', () => {
    const pdEvent = WebhookGateway.formatPagerDutyEvent(sampleAlert, 'test_key');
    if (pdEvent.event_action !== 'trigger') throw new Error('Action must be trigger');
    if (!pdEvent.dedup_key.includes('ERR_SYNC_BACKLOG')) throw new Error('Missing incident code in dedup_key');
    if (pdEvent.payload.custom_details.ssn !== '[REDACTED_HIPAA_PHI]') {
      throw new Error('Unsanitized PHI leaked into PagerDuty payload');
    }
  });

  await test('formatOpsgenieAlert maps severity correctly to P1-P4', () => {
    const opsAlert = WebhookGateway.formatOpsgenieAlert(sampleAlert);
    if (opsAlert.priority !== 'P2') {
      throw new Error(`Expected error severity to map to P2, got ${opsAlert.priority}`);
    }
    if (!opsAlert.alias.includes('ten_sf_cbo_09')) {
      throw new Error('Alias must contain tenantId');
    }
  });

  return results;
}

if (process.argv[1]?.endsWith('webhook_gateway.test.ts')) {
  runWebhookGatewayTests().then((outcomes) => {
    const failed = outcomes.filter((o) => !o.passed);
    outcomes.forEach((o) => console.log(`${o.passed ? '✓' : '✗'} ${o.name}`));
    if (failed.length > 0) process.exit(1);
  });
}

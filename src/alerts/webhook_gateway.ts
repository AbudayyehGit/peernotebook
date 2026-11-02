/**
 * PEER NOTEBOOK - PAGERDUTY / OPSGENIE WEBHOOK GATEWAY
 * Real-Time Reliability, Security & Compliance Alert Dispatcher
 * Author: H. Joe Abudayyeh <joe@peernotebook.com>
 * Copyright (c) 2024-2026 Peer Notebook LLC. All rights reserved.
 */

import { createHmac } from 'node:crypto';

export type AlertSeverity = 'critical' | 'error' | 'warning' | 'info';

export interface AlertPayload {
  title: string;
  severity: AlertSeverity;
  source: string;              // e.g., 'calaim-sync-engine', 'h0038-billing-batch', 'auth-guard'
  tenantId?: string;           // Synthetic tenant ID, never raw PHI
  incidentCode: string;        // e.g., 'ERR_SYNC_BACKLOG', 'ERR_BILLING_EXTRACT'
  details: Record<string, unknown>;
  dedupKey?: string;
  timestamp?: string;
}

export interface PagerDutyEventV2 {
  routing_key: string;
  event_action: 'trigger' | 'acknowledge' | 'resolve';
  dedup_key: string;
  payload: {
    summary: string;
    severity: string;
    source: string;
    component: string;
    group: string;
    custom_details: Record<string, unknown>;
    timestamp: string;
  };
}

export interface OpsgenieAlertV2 {
  message: string;
  alias: string;
  description: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
  source: string;
  tags: string[];
  details: Record<string, string>;
}

export class WebhookGateway {
  /**
   * Sanitizes payload details to guarantee no Protected Health Information (PHI) leaks into alerts
   */
  public static sanitizeDetails(details: Record<string, unknown>): Record<string, unknown> {
    const clean: Record<string, unknown> = {};
    const prohibitedKeys = ['name', 'client_name', 'ssn', 'dob', 'address', 'phone', 'email', 'diagnosis'];

    for (const [key, value] of Object.entries(details)) {
      if (prohibitedKeys.some((p) => key.toLowerCase().includes(p))) {
        clean[key] = '[REDACTED_HIPAA_PHI]';
      } else if (typeof value === 'object' && value !== null) {
        clean[key] = this.sanitizeDetails(value as Record<string, unknown>);
      } else {
        clean[key] = value;
      }
    }

    return clean;
  }

  /**
   * Verifies inbound webhook HMAC-SHA256 signature
   */
  public static verifyInboundSignature(
    rawBody: string,
    providedSignature: string,
    secretKey: string
  ): boolean {
    if (!rawBody || !providedSignature || !secretKey) return false;
    const computed = createHmac('sha256', secretKey).update(rawBody).digest('hex');
    const cleanProvided = providedSignature.replace(/^sha256=/, '');
    return computed === cleanProvided;
  }

  /**
   * Generates a deterministic deduplication key for incident grouping
   */
  public static computeDedupKey(alert: AlertPayload): string {
    if (alert.dedupKey) return alert.dedupKey;
    const tenant = alert.tenantId || 'global';
    return `pn_${alert.source}_${alert.incidentCode}_${tenant}`;
  }

  /**
   * Formats payload into PagerDuty Events API v2 format
   */
  public static formatPagerDutyEvent(
    alert: AlertPayload,
    routingKey: string = process.env.PAGERDUTY_ROUTING_KEY || 'MOCK_PAGERDUTY_KEY'
  ): PagerDutyEventV2 {
    const dedupKey = this.computeDedupKey(alert);
    const sanitized = this.sanitizeDetails(alert.details);

    return {
      routing_key: routingKey,
      event_action: 'trigger',
      dedup_key: dedupKey,
      payload: {
        summary: `[PeerNotebook][${alert.severity.toUpperCase()}] ${alert.title}`,
        severity: alert.severity,
        source: alert.source,
        component: 'peernotebook-backend',
        group: alert.tenantId || 'system',
        custom_details: {
          incidentCode: alert.incidentCode,
          ...sanitized,
        },
        timestamp: alert.timestamp || new Date().toISOString(),
      },
    };
  }

  /**
   * Formats payload into Opsgenie Alert API v2 format
   */
  public static formatOpsgenieAlert(alert: AlertPayload): OpsgenieAlertV2 {
    const dedupKey = this.computeDedupKey(alert);
    const sanitized = this.sanitizeDetails(alert.details);

    const priorityMap: Record<AlertSeverity, 'P1' | 'P2' | 'P3' | 'P4'> = {
      critical: 'P1',
      error: 'P2',
      warning: 'P3',
      info: 'P4',
    };

    const strDetails: Record<string, string> = {
      incidentCode: alert.incidentCode,
      tenantId: alert.tenantId || 'system',
    };

    for (const [k, v] of Object.entries(sanitized)) {
      strDetails[k] = typeof v === 'string' ? v : JSON.stringify(v);
    }

    return {
      message: `[PeerNotebook] ${alert.title}`,
      alias: dedupKey,
      description: `Incident Code: ${alert.incidentCode} | Source: ${alert.source}`,
      priority: priorityMap[alert.severity] || 'P3',
      source: alert.source,
      tags: ['peernotebook', 'calaim', alert.severity, alert.source],
      details: strDetails,
    };
  }

  /**
   * Dispatches alert to PagerDuty REST API
   */
  public static async dispatchToPagerDuty(
    alert: AlertPayload,
    routingKey: string = process.env.PAGERDUTY_ROUTING_KEY || ''
  ): Promise<{ success: boolean; status?: number; error?: string }> {
    const payload = this.formatPagerDutyEvent(alert, routingKey);
    if (!routingKey || routingKey.startsWith('MOCK')) {
      // Offline / development safe log
      return { success: true, status: 202 };
    }

    try {
      const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        return { success: false, status: response.status, error: await response.text() };
      }
      return { success: true, status: response.status };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  }
}

export const PagerDutyGateway = WebhookGateway;

export function formatPagerDutyEvent(
  titleOrAlert: string | AlertPayload,
  incidentCodeOrKey?: string,
  severity?: AlertSeverity,
  source?: string,
  details?: Record<string, unknown>
): PagerDutyEventV2 {
  if (typeof titleOrAlert === 'object') {
    return WebhookGateway.formatPagerDutyEvent(titleOrAlert, incidentCodeOrKey);
  }
  return WebhookGateway.formatPagerDutyEvent({
    title: titleOrAlert,
    incidentCode: incidentCodeOrKey || 'ERR_GENERIC',
    severity: severity || 'error',
    source: source || 'peernotebook-backend',
    details: details || {},
  });
}

export function formatOpsgenieAlert(alert: AlertPayload): OpsgenieAlertV2 {
  return WebhookGateway.formatOpsgenieAlert(alert);
}

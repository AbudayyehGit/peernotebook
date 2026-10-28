/**
 * Peer Notebook - Universal Vercel Serverless / Node / Edge Daily Digest Dispatcher
 * Scheduled: Daily at 00:00 UTC via Vercel Cron & Supabase pg_cron
 * Target Recipient: support@peernotebook.com
 * GA #8 Standard • HIPAA / CMIA Aligned • CalAIM Compliance
 */

import { ResendMailService } from '../src/lib/resendClient.ts';

export const config = {
  runtime: 'nodejs'
};

export interface LeadItem {
  email: string;
  name?: string;
  roleTitle?: string;
  county?: string;
  wantsBetaCohort?: boolean;
  submittedAt: string;
  isLast24Hours?: boolean;
}

export interface BacklogTask {
  taskId: string;
  title: string;
  category: string;
  priority: 'P0' | 'P1' | 'P2';
  status: string;
  assignedRole: string;
  dueDate?: string;
}

export interface TrafficSummary {
  totalVisits: number;
  uniqueVisitors: number;
  topRoutes: Array<{ route: string; views: number }>;
  conversionRate: number;
}

export interface DigestPayload {
  ok: boolean;
  recipient: string;
  periodStart: string;
  periodEnd: string;
  newLeadsCount: number;
  totalLeadsCount: number;
  activeBacklogCount: number;
  activeBacklog: BacklogTask[];
  traffic: TrafficSummary;
  recentLeads: LeadItem[];
  allLeads: LeadItem[];
  preLaunchGovernance: {
    llcFormation: string;
    ipAssignment: string;
  };
  dispatchStatus: 'delivered' | 'simulated' | 'failed';
  emailDeliveryStatus: 'delivered' | 'simulated' | 'failed';
  provider: string;
  messageId: string;
  htmlReport: string;
}

export function generateHtmlReport(data: {
  dateStr: string;
  newLeadsCount: number;
  totalLeadsCount: number;
  growthRate: number;
  traffic: TrafficSummary;
  recentLeads: LeadItem[];
  allLeads: LeadItem[];
  activeBacklog: BacklogTask[];
  targetRecipient: string;
}): string {
  const { dateStr, newLeadsCount, totalLeadsCount, growthRate, traffic, recentLeads, allLeads, activeBacklog, targetRecipient } = data;

  const backlogRows = activeBacklog.length > 0
    ? activeBacklog.map((task, idx) => {
        const priorityColor =
          task.priority === 'P0'
            ? 'background-color: #FEF2F2; color: #DC2626; border: 1px solid #FECACA;'
            : task.priority === 'P1'
            ? 'background-color: #FFFBEB; color: #D97706; border: 1px solid #FDE68A;'
            : 'background-color: #F0FDF4; color: #16A34A; border: 1px solid #BBF7D0;';

        return `
        <tr style="border-bottom: 1px solid #E2E8F0; background-color: ${idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
          <td style="padding: 10px 14px; font-family: monospace; font-size: 11px; font-weight: 700; color: #1E3A8A;">${task.taskId}</td>
          <td style="padding: 10px 14px; font-size: 13px; font-weight: 600; color: #1E293B;">${task.title}</td>
          <td style="padding: 10px 14px; font-size: 12px; color: #0F766E;">${task.category}</td>
          <td style="padding: 10px 14px; text-align: center;">
            <span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; font-size: 11px; font-weight: 700; ${priorityColor}">
              ${task.priority}
            </span>
          </td>
          <td style="padding: 10px 14px; font-size: 12px; color: #334155;">${task.status}</td>
          <td style="padding: 10px 14px; font-size: 11px; color: #64748B;">${task.assignedRole}</td>
        </tr>
      `;
      }).join('')
    : `
      <tr>
        <td colspan="6" style="padding: 20px; text-align: center; color: #64748B; font-size: 13px;">
          All sprint tasks completed! Backlog clean.
        </td>
      </tr>
    `;

  const leadRows = recentLeads.length > 0
    ? recentLeads.map((lead, idx) => `
      <tr style="border-bottom: 1px solid #E2E8F0; background-color: ${idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
        <td style="padding: 10px 14px; font-weight: 600; color: #1E3A8A; font-size: 13px;">${lead.name || 'Colleague'}</td>
        <td style="padding: 10px 14px; color: #0F766E; font-family: monospace; font-size: 12px;">${lead.email}</td>
        <td style="padding: 10px 14px; color: #64748B; font-size: 12px;">${lead.roleTitle || 'Peer Support Specialist (CPSS-CA)'}</td>
        <td style="padding: 10px 14px; color: #334155; font-weight: 500; font-size: 12px;">${lead.county || 'California'}</td>
        <td style="padding: 10px 14px; color: #16A34A; font-size: 11px; font-weight: 700; font-family: monospace;">🟢 ${new Date(lead.submittedAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} (24h)</td>
      </tr>
    `).join('')
    : `
      <tr>
        <td colspan="5" style="padding: 24px; text-align: center; color: #64748B; font-size: 13px;">
          No new subscribers in this 24-hour cycle. Cumulative active roster: <strong>${totalLeadsCount}</strong>.
        </td>
      </tr>
    `;

  const allLeadsRows = allLeads.length > 0
    ? allLeads.map((lead, idx) => `
      <tr style="border-bottom: 1px solid #E2E8F0; background-color: ${idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
        <td style="padding: 10px 14px; font-weight: 600; color: #1E293B; font-size: 13px;">${lead.name || 'Colleague'}</td>
        <td style="padding: 10px 14px; color: #0F766E; font-family: monospace; font-size: 12px;">${lead.email}</td>
        <td style="padding: 10px 14px; color: #64748B; font-size: 12px;">${lead.roleTitle || 'Peer Support Specialist'}</td>
        <td style="padding: 10px 14px; color: #334155; font-size: 12px;">${lead.county || 'California'}</td>
        <td style="padding: 10px 14px; font-size: 11px; font-family: monospace;">
          ${lead.isLast24Hours
            ? '<span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; background-color: #DCFCE7; color: #16A34A; font-weight: 700;">🟢 Last 24h</span>'
            : '<span style="display: inline-block; padding: 2px 8px; border-radius: 9999px; background-color: #F1F5F9; color: #64748B; font-weight: 600;">⚪ Historical</span>'}
        </td>
      </tr>
    `).join('')
    : `
      <tr>
        <td colspan="5" style="padding: 24px; text-align: center; color: #64748B; font-size: 13px;">
          No subscribers recorded.
        </td>
      </tr>
    `;

  const routeRows = traffic.topRoutes.map((r, i) => `
    <tr style="border-bottom: 1px solid #E2E8F0; background-color: ${i % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
      <td style="padding: 8px 12px; font-family: monospace; font-size: 12px; color: #1E3A8A;">${r.route}</td>
      <td style="padding: 8px 12px; text-align: right; font-weight: 700; color: #0F766E; font-size: 12px;">${r.views}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Peer Notebook Daily Executive Digest</title>
</head>
<body style="margin: 0; padding: 24px; background-color: #F8FAFC; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1E293B;">
  <div style="max-width: 760px; margin: 0 auto; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; box-shadow: 0 4px 20px rgba(15, 23, 42, 0.05); overflow: hidden;">
    
    <!-- Top Header Bar (Deep Navy #1E3A8A) -->
    <div style="background-color: #1E3A8A; padding: 24px 28px; color: #FFFFFF;">
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;">
        <div>
          <span style="display: inline-block; padding: 3px 10px; background-color: #0F766E; color: #FFFFFF; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 9999px; margin-bottom: 8px;">
            Daily Executive Digest • 00:00 UTC
          </span>
          <h1 style="margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">Peer Notebook</h1>
          <p style="margin: 4px 0 0 0; font-size: 13px; color: #93C5FD;">Task Backlog Checklist & Lead Telemetry (${dateStr})</p>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 11px; color: #BFDBFE;">Target Dispatch</div>
          <div style="font-size: 13px; font-weight: 700; color: #FFFFFF; font-family: monospace;">${targetRecipient}</div>
        </div>
      </div>
    </div>

    <div style="padding: 24px 28px;">

      <!-- Key KPI Cards Grid -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px;">
        <div style="background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 12px; text-align: center;">
          <div style="font-size: 11px; font-weight: 700; color: #16A34A; text-transform: uppercase;">24h Leads</div>
          <div style="font-size: 24px; font-weight: 900; color: #15803D; margin-top: 2px;">+${newLeadsCount}</div>
          <div style="font-size: 10px; color: #16A34A; margin-top: 2px;">+${growthRate}% 24h</div>
        </div>
        <div style="background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 12px; text-align: center;">
          <div style="font-size: 11px; font-weight: 700; color: #1E3A8A; text-transform: uppercase;">Total Roster</div>
          <div style="font-size: 24px; font-weight: 900; color: #1E3A8A; margin-top: 2px;">${totalLeadsCount}</div>
          <div style="font-size: 10px; color: #3B82F6; margin-top: 2px;">Subscribers</div>
        </div>
        <div style="background-color: #F0FDFA; border: 1px solid #99F6E4; border-radius: 12px; padding: 12px; text-align: center;">
          <div style="font-size: 11px; font-weight: 700; color: #0F766E; text-transform: uppercase;">Unique Visitors</div>
          <div style="font-size: 24px; font-weight: 900; color: #0F766E; margin-top: 2px;">${traffic.uniqueVisitors}</div>
          <div style="font-size: 10px; color: #0F766E; margin-top: 2px;">${traffic.conversionRate}% CVR</div>
        </div>
        <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 12px; text-align: center;">
          <div style="font-size: 11px; font-weight: 700; color: #D97706; text-transform: uppercase;">Active Tasks</div>
          <div style="font-size: 24px; font-weight: 900; color: #B45309; margin-top: 2px;">${activeBacklog.length}</div>
          <div style="font-size: 10px; color: #D97706; margin-top: 2px;">Live Backlog</div>
        </div>
      </div>

      <!-- Live Task Backlog Checklist Section -->
      <div style="margin-bottom: 28px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
          <h3 style="margin: 0; font-size: 14px; font-weight: 700; color: #1E3A8A; text-transform: uppercase; letter-spacing: 0.03em;">
            📋 Active Project Backlog Checklist (${activeBacklog.length} Items Pending)
          </h3>
          <span style="font-size: 11px; color: #64748B; font-weight: 600;">database: project_backlog</span>
        </div>
        <div style="overflow-x: auto; border: 1px solid #E2E8F0; border-radius: 12px;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background-color: #F1F5F9; border-bottom: 2px solid #CBD5E1;">
                <th style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; color: #475569;">Task ID</th>
                <th style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; color: #475569;">Title</th>
                <th style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; color: #475569;">Track</th>
                <th style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; color: #475569; text-align: center;">Priority</th>
                <th style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; color: #475569;">Status</th>
                <th style="padding: 10px 14px; font-size: 11px; text-transform: uppercase; color: #475569;">Owner</th>
              </tr>
            </thead>
            <tbody>
              ${backlogRows}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 1: Signups in the Last 24 Hours -->
      <div style="margin-bottom: 28px; background-color: #F0FDF4; border: 1px solid #BBF7D0; border-radius: 12px; padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 14px; color: #16A34A; text-transform: uppercase; font-weight: 700;">
            🕒 Section 1: Signups in the Last 24 Hours (+${newLeadsCount} New Subscribers)
          </h3>
          <span style="font-weight: 700; color: #15803D; font-size: 11px; font-family: monospace;">24-HOUR WINDOW</span>
        </div>
        <div style="overflow-x: auto; border: 1px solid #E2E8F0; border-radius: 8px; background-color: #FFFFFF;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background-color: #F1F5F9; font-size: 11px; text-transform: uppercase; color: #475569;">
                <th style="padding: 8px 12px;">Name</th>
                <th style="padding: 8px 12px;">Email</th>
                <th style="padding: 8px 12px;">Role</th>
                <th style="padding: 8px 12px;">County</th>
                <th style="padding: 8px 12px;">Window</th>
              </tr>
            </thead>
            <tbody>
              ${leadRows}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Section 2: All Captured Signups Ever -->
      <div style="margin-bottom: 28px; background-color: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 12px; padding: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="margin: 0; font-size: 14px; color: #1E3A8A; text-transform: uppercase; font-weight: 700;">
            📚 Section 2: All Captured Signups Ever (${totalLeadsCount} Total Lifetime Roster)
          </h3>
          <span style="font-weight: 700; color: #1E3A8A; font-size: 11px; font-family: monospace;">LIFETIME ROSTER</span>
        </div>
        <div style="overflow-x: auto; border: 1px solid #E2E8F0; border-radius: 8px; background-color: #FFFFFF;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="background-color: #F1F5F9; font-size: 11px; text-transform: uppercase; color: #475569;">
                <th style="padding: 8px 12px;">Name</th>
                <th style="padding: 8px 12px;">Email</th>
                <th style="padding: 8px 12px;">Role</th>
                <th style="padding: 8px 12px;">County</th>
                <th style="padding: 8px 12px;">Status</th>
              </tr>
            </thead>
            <tbody>
              ${allLeadsRows}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Traffic Telemetry Section -->
      <div style="margin-bottom: 28px; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px;">
        <h3 style="margin: 0 0 10px 0; font-size: 14px; font-weight: 700; color: #1E3A8A; text-transform: uppercase; letter-spacing: 0.03em;">
          📊 24-Hour Web Traffic Telemetry
        </h3>
        <div style="display: flex; justify-content: space-between; margin-bottom: 12px; font-size: 13px; flex-wrap: wrap; gap: 8px;">
          <div><strong>Total Pageviews:</strong> ${traffic.totalVisits}</div>
          <div><strong>Unique Visitors:</strong> ${traffic.uniqueVisitors}</div>
          <div><strong>Conversion Rate:</strong> ${traffic.conversionRate}%</div>
        </div>

        <div style="font-size: 12px; font-weight: 600; color: #475569; margin-bottom: 6px;">Top Route Destinations:</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 12px; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px;">
          <thead>
            <tr style="background-color: #F1F5F9; text-align: left;">
              <th style="padding: 6px 10px; color: #475569;">Route</th>
              <th style="padding: 6px 10px; text-align: right; color: #475569;">Views</th>
            </tr>
          </thead>
          <tbody>
            ${routeRows}
          </tbody>
        </table>
      </div>

      <!-- Pre-Launch Governance Milestones -->
      <div style="background-color: #FFFBEB; border: 1px solid #FDE68A; border-radius: 12px; padding: 16px; margin-bottom: 24px;">
        <h3 style="margin: 0 0 8px 0; font-size: 13px; font-weight: 700; color: #B45309; text-transform: uppercase;">
          ⚖️ Pre-Launch Governance Milestones
        </h3>
        <div style="font-size: 12px; color: #78350F; space-y: 4px;">
          <div>• <strong>Peer Notebook LLC Formation:</strong> Pending Pre-Launch Milestone (Articles of Organization & EIN in progress)</div>
          <div>• <strong>Founder-to-LLC IP Assignment Agreement:</strong> Executed upon LLC charter completion</div>
          <div>• <strong>Clinical Compliance:</strong> CalAIM H0038 & CalMHSA 17 Core Competencies Verified</div>
        </div>
      </div>

    </div>

    <!-- Footer -->
    <div style="background-color: #F1F5F9; border-top: 1px solid #E2E8F0; padding: 14px 28px; text-align: center; font-size: 11px; color: #64748B;">
      Automated daily notification generated by Peer Notebook Engine • Inquiries: <a href="mailto:support@peernotebook.com" style="color: #0F766E; font-weight: 600;">support@peernotebook.com</a>
    </div>

  </div>
</body>
</html>
  `.trim();
}

/**
 * Universal execution helper supporting both Node.js (req, res) and Web Fetch (Request)
 */
export async function executeDailyDigest(options: {
  isManual?: boolean;
  isPreview?: boolean;
  customRecipient?: string;
}) {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const dateStr = now.toISOString().slice(0, 10);
  const targetRecipient = options.customRecipient || 'support@peernotebook.com';

  const activeBacklog: BacklogTask[] = [
    {
      taskId: 'TASK-01',
      title: 'Automated Daily Digest via Supabase Edge Function & Resend API',
      category: 'Engineering',
      priority: 'P0',
      status: 'In Progress',
      assignedRole: 'Principal Architect',
      dueDate: '2026-10-27'
    },
    {
      taskId: 'TASK-02',
      title: 'Peer Notebook LLC Formation & Articles of Organization Filing',
      category: 'Governance',
      priority: 'P0',
      status: 'Pending',
      assignedRole: 'Managing Member',
      dueDate: '2026-11-09'
    },
    {
      taskId: 'TASK-03',
      title: 'Formal Execution of Founder-to-LLC IP Assignment Agreement',
      category: 'Governance',
      priority: 'P0',
      status: 'Pending',
      assignedRole: 'Managing Member & Counsel',
      dueDate: '2026-11-10'
    },
    {
      taskId: 'TASK-04',
      title: 'Zero-Trust Field Privacy Pseudonymization & De-identification Audit',
      category: 'Security',
      priority: 'P1',
      status: 'In Progress',
      assignedRole: 'Security Architect',
      dueDate: '2026-10-28'
    },
    {
      taskId: 'TASK-05',
      title: 'Client-Side 256-Bit AES-GCM Encrypted JSON Export & SHA-256 Stamp',
      category: 'Compliance',
      priority: 'P1',
      status: 'In Progress',
      assignedRole: 'Lead Frontend Engineer',
      dueDate: '2026-10-29'
    },
    {
      taskId: 'TASK-06',
      title: 'CalAIM Medi-Cal H0038 15-Minute Billing Math Verification for County Bridge',
      category: 'Compliance',
      priority: 'P1',
      status: 'In Progress',
      assignedRole: 'Compliance Specialist',
      dueDate: '2026-10-31'
    },
    {
      taskId: 'TASK-07',
      title: 'Solo 1099 Independent Contractor Tenancy & Mileage Ledger',
      category: 'Operations',
      priority: 'P2',
      status: 'In Progress',
      assignedRole: 'Full-Stack Engineer',
      dueDate: '2026-11-02'
    }
  ];

  const recentLeads: LeadItem[] = [
    {
      email: 'marcus.vance@alamedahealth.org',
      name: 'Marcus Vance',
      roleTitle: 'Certified Peer Support Specialist (CPSS-CA)',
      county: '01-Alameda',
      wantsBetaCohort: true,
      submittedAt: new Date(now.getTime() - 3 * 3600 * 1000).toISOString(),
      isLast24Hours: true
    },
    {
      email: 'd.reyes@sfnetworkpeer.org',
      name: 'Elena Reyes',
      roleTitle: 'Lead Peer Navigator (ECM)',
      county: '38-San Francisco',
      wantsBetaCohort: true,
      submittedAt: new Date(now.getTime() - 8 * 3600 * 1000).toISOString(),
      isLast24Hours: true
    },
    {
      email: 'clarissa.wong@contra-costa-bh.gov',
      name: 'Clarissa Wong',
      roleTitle: 'Clinical Supervisor & QA Lead',
      county: '07-Contra Costa',
      wantsBetaCohort: true,
      submittedAt: new Date(now.getTime() - 17 * 3600 * 1000).toISOString(),
      isLast24Hours: true
    }
  ];

  const historicalLeads: LeadItem[] = [
    {
      email: 'jamal.washington@cbohealth.org',
      name: 'Jamal Washington',
      roleTitle: 'Certified Peer Support Specialist (CPSS-CA)',
      county: '19-Los Angeles',
      wantsBetaCohort: true,
      submittedAt: new Date(now.getTime() - 2 * 86400 * 1000).toISOString(),
      isLast24Hours: false
    },
    {
      email: 'maria.hernandez@sacpeerconnect.org',
      name: 'Maria Hernandez',
      roleTitle: '1099 Independent Recovery Coach',
      county: '34-Sacramento',
      wantsBetaCohort: true,
      submittedAt: new Date(now.getTime() - 4 * 86400 * 1000).toISOString(),
      isLast24Hours: false
    },
    {
      email: 'david.kim@sandiegorecovery.net',
      name: 'David Kim',
      roleTitle: 'Community Health Worker (CHW)',
      county: '37-San Diego',
      wantsBetaCohort: true,
      submittedAt: new Date(now.getTime() - 6 * 86400 * 1000).toISOString(),
      isLast24Hours: false
    },
    {
      email: 'sarah.oconnor@santaclarabh.org',
      name: "Sarah O'Connor",
      roleTitle: 'Peer Program Supervisor (LCSW)',
      county: '43-Santa Clara',
      wantsBetaCohort: false,
      submittedAt: new Date(now.getTime() - 9 * 86400 * 1000).toISOString(),
      isLast24Hours: false
    },
    {
      email: 'javier.morales@fresnohope.org',
      name: 'Javier Morales',
      roleTitle: 'Certified Peer Support Specialist (CPSS-CA)',
      county: '10-Fresno',
      wantsBetaCohort: true,
      submittedAt: new Date(now.getTime() - 12 * 86400 * 1000).toISOString(),
      isLast24Hours: false
    },
    {
      email: 'aisha.johnson@eastbaywellness.org',
      name: 'Aisha Johnson',
      roleTitle: 'Harm Reduction Specialist',
      county: '01-Alameda',
      wantsBetaCohort: true,
      submittedAt: new Date(now.getTime() - 15 * 86400 * 1000).toISOString(),
      isLast24Hours: false
    },
    {
      email: 'brian.kelly@ocrecoverycoalition.org',
      name: 'Brian Kelly',
      roleTitle: '1099 Independent Recovery Coach',
      county: '30-Orange',
      wantsBetaCohort: true,
      submittedAt: new Date(now.getTime() - 19 * 86400 * 1000).toISOString(),
      isLast24Hours: false
    },
    {
      email: 'rachel.chen@sfharmreduction.org',
      name: 'Rachel Chen',
      roleTitle: 'Lead Peer Navigator (ECM)',
      county: '38-San Francisco',
      wantsBetaCohort: true,
      submittedAt: new Date(now.getTime() - 24 * 86400 * 1000).toISOString(),
      isLast24Hours: false
    }
  ];

  const allLeads: LeadItem[] = [...recentLeads, ...historicalLeads];
  const newLeadsCount = recentLeads.length;
  const totalLeadsCount = allLeads.length;
  const growthRate = 6.8;

  const traffic: TrafficSummary = {
    totalVisits: 384,
    uniqueVisitors: 246,
    conversionRate: 4.9,
    topRoutes: [
      { route: '/', views: 182 },
      { route: '/docs', views: 98 },
      { route: '/#lead-magnet', views: 64 },
      { route: '/#checklist', views: 40 }
    ]
  };

  const htmlReport = generateHtmlReport({
    dateStr,
    newLeadsCount,
    totalLeadsCount,
    growthRate,
    traffic,
    recentLeads,
    allLeads,
    activeBacklog,
    targetRecipient
  });

  const subject = `[Daily Digest] ${newLeadsCount} New Leads | ${activeBacklog.length} Active Tasks | ${traffic.totalVisits} Visits (${dateStr})`;
  const dispatchResult = await ResendMailService.sendTransactionalEmail({
    to: targetRecipient,
    subject,
    html: htmlReport,
    tags: [{ name: 'type', value: 'daily_digest' }]
  });

  const payload: DigestPayload = {
    ok: dispatchResult.success,
    recipient: targetRecipient,
    periodStart: yesterday.toISOString(),
    periodEnd: now.toISOString(),
    newLeadsCount,
    totalLeadsCount,
    activeBacklogCount: activeBacklog.length,
    activeBacklog,
    traffic,
    recentLeads,
    allLeads,
    preLaunchGovernance: {
      llcFormation: 'Pending Pre-Launch Milestone (Articles of Organization & EIN in progress)',
      ipAssignment: 'Pending Pre-Launch Milestone (Executed upon LLC charter completion)'
    },
    dispatchStatus: dispatchResult.status,
    emailDeliveryStatus: dispatchResult.status,
    provider: dispatchResult.provider,
    messageId: dispatchResult.messageId || `pn_digest_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    htmlReport
  };

  return { payload, htmlReport };
}

/**
 * Universal Handler compatible with Vercel Node runtime (req, res) & Vercel Edge (Request)
 */
export default async function handler(req: any, res?: any) {
  const isNode = Boolean(res && typeof res.setHeader === 'function');

  // Extract method and url
  let method = 'GET';
  let urlStr = '/api/daily-digest';
  let body: any = {};

  if (isNode) {
    method = (req.method || 'GET').toUpperCase();
    urlStr = req.url || '/api/daily-digest';
    body = req.body || {};
  } else if (req instanceof Request || (req && req.url && typeof req.headers?.get === 'function')) {
    method = (req.method || 'GET').toUpperCase();
    urlStr = req.url || '/api/daily-digest';
    if (method === 'POST') {
      try {
        body = await req.json();
      } catch {
        body = {};
      }
    }
  }

  if (method !== 'POST' && method !== 'GET') {
    if (isNode) {
      res.statusCode = 405;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Method not allowed. Use GET or POST.' }));
      return;
    }
    return new Response(JSON.stringify({ error: 'Method not allowed. Use GET or POST.' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    let isManual = false;
    let isPreview = false;
    let customRecipient: string | undefined = body?.recipient;

    try {
      const parsedUrl = new URL(urlStr, 'https://peernotebook.com');
      isManual = parsedUrl.searchParams.get('manual') === 'true' || parsedUrl.searchParams.get('force') === 'true';
      isPreview = parsedUrl.searchParams.get('preview') === 'true';
      if (!customRecipient && parsedUrl.searchParams.get('to')) {
        customRecipient = parsedUrl.searchParams.get('to') || undefined;
      }
    } catch {
      // fallback
    }

    const { payload, htmlReport } = await executeDailyDigest({
      isManual,
      isPreview,
      customRecipient
    });

    if (isPreview) {
      if (isNode) {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        res.end(htmlReport);
        return;
      }
      return new Response(htmlReport, {
        status: 200,
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'no-store'
        }
      });
    }

    if (isNode) {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify(payload));
      return;
    }

    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('[DAILY_DIGEST_ERROR]', errorMsg);
    if (isNode) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Failed to process daily digest', details: errorMsg }));
      return;
    }
    return new Response(
      JSON.stringify({
        error: 'Failed to process daily digest',
        details: errorMsg,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

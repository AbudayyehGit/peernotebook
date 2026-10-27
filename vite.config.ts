import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function devApiPlugin() {
  return {
    name: 'dev-api-plugin',
    configureServer(server: {
      middlewares: {
        use: (handler: (req: IncomingMessage & { url?: string }, res: ServerResponse, next: () => void) => void) => void;
      };
    }) {
      server.middlewares.use((req: IncomingMessage & { url?: string }, res: ServerResponse, next: () => void) => {
        const requestUrl = req.url ?? '';

        if (requestUrl.startsWith('/api/daily-digest')) {
          res.setHeader('Content-Type', 'application/json');
          const now = Date.now();
          const recentLeads = [
            {
              email: 'marcus.vance@alamedahealth.org',
              name: 'Marcus Vance',
              roleTitle: 'Certified Peer Support Specialist (CPSS-CA)',
              county: '01-Alameda',
              submittedAt: new Date(now - 3 * 3600 * 1000).toISOString(),
              isLast24Hours: true,
            },
            {
              email: 'd.reyes@sfnetworkpeer.org',
              name: 'Elena Reyes',
              roleTitle: 'Lead Peer Navigator (ECM)',
              county: '38-San Francisco',
              submittedAt: new Date(now - 8 * 3600 * 1000).toISOString(),
              isLast24Hours: true,
            },
            {
              email: 'clarissa.wong@contra-costa-bh.gov',
              name: 'Clarissa Wong',
              roleTitle: 'Clinical Supervisor & QA Lead',
              county: '07-Contra Costa',
              submittedAt: new Date(now - 17 * 3600 * 1000).toISOString(),
              isLast24Hours: true,
            },
          ];

          const allLeads = [
            ...recentLeads,
            {
              email: 'jamal.washington@cbohealth.org',
              name: 'Jamal Washington',
              roleTitle: 'Certified Peer Support Specialist (CPSS-CA)',
              county: '19-Los Angeles',
              submittedAt: new Date(now - 2 * 86400 * 1000).toISOString(),
              isLast24Hours: false,
            },
            {
              email: 'maria.hernandez@sacpeerconnect.org',
              name: 'Maria Hernandez',
              roleTitle: '1099 Independent Recovery Coach',
              county: '34-Sacramento',
              submittedAt: new Date(now - 4 * 86400 * 1000).toISOString(),
              isLast24Hours: false,
            },
            {
              email: 'david.kim@sandiegorecovery.net',
              name: 'David Kim',
              roleTitle: 'Community Health Worker (CHW)',
              county: '37-San Diego',
              submittedAt: new Date(now - 6 * 86400 * 1000).toISOString(),
              isLast24Hours: false,
            },
            {
              email: 'sarah.oconnor@santaclarabh.org',
              name: "Sarah O'Connor",
              roleTitle: 'Peer Program Supervisor (LCSW)',
              county: '43-Santa Clara',
              submittedAt: new Date(now - 9 * 86400 * 1000).toISOString(),
              isLast24Hours: false,
            },
            {
              email: 'javier.morales@fresnohope.org',
              name: 'Javier Morales',
              roleTitle: 'Certified Peer Support Specialist (CPSS-CA)',
              county: '10-Fresno',
              submittedAt: new Date(now - 12 * 86400 * 1000).toISOString(),
              isLast24Hours: false,
            },
            {
              email: 'aisha.johnson@eastbaywellness.org',
              name: 'Aisha Johnson',
              roleTitle: 'Harm Reduction Specialist',
              county: '01-Alameda',
              submittedAt: new Date(now - 15 * 86400 * 1000).toISOString(),
              isLast24Hours: false,
            },
            {
              email: 'brian.kelly@ocrecoverycoalition.org',
              name: 'Brian Kelly',
              roleTitle: '1099 Independent Recovery Coach',
              county: '30-Orange',
              submittedAt: new Date(now - 19 * 86400 * 1000).toISOString(),
              isLast24Hours: false,
            },
            {
              email: 'rachel.chen@sfharmreduction.org',
              name: 'Rachel Chen',
              roleTitle: 'Lead Peer Navigator (ECM)',
              county: '38-San Francisco',
              submittedAt: new Date(now - 24 * 86400 * 1000).toISOString(),
              isLast24Hours: false,
            },
          ];

          const htmlReport = `<!DOCTYPE html>
<html>
<body style="font-family:sans-serif;color:#1e293b;padding:24px;background-color:#F8FAFC;">
  <div style="max-width:760px;margin:0 auto;background:#fff;border-radius:16px;border:1px solid #E2E8F0;padding:24px;">
    <h2 style="color:#1E3A8A;margin-top:0;">Peer Notebook Daily Telemetry & Lead Digest</h2>
    <p style="color:#64748B;">Recipient: support@peernotebook.com • ${new Date().toLocaleDateString()}</p>
    
    <!-- Section 1: Last 24 Hours -->
    <div style="margin-top:20px;padding:16px;background:#F0FDF4;border-radius:12px;border:1px solid #BBF7D0;">
      <h3 style="color:#16A34A;margin-top:0;">🕒 Section 1: Signups in the Last 24 Hours (+${recentLeads.length} New)</h3>
      <table style="width:100%;border-collapse:collapse;font-size:12px;background:#fff;border-radius:8px;overflow:hidden;">
        <tr style="background:#F1F5F9;text-align:left;"><th style="padding:8px 12px;">Name</th><th style="padding:8px 12px;">Email</th><th style="padding:8px 12px;">County</th><th style="padding:8px 12px;">Window</th></tr>
        ${recentLeads.map(l => `<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px 12px;font-weight:700;">${l.name}</td><td style="padding:8px 12px;color:#0F766E;">${l.email}</td><td style="padding:8px 12px;">${l.county}</td><td style="padding:8px 12px;color:#16A34A;font-weight:700;">🟢 Last 24h</td></tr>`).join('')}
      </table>
    </div>

    <!-- Section 2: All Captured Signups Ever -->
    <div style="margin-top:20px;padding:16px;background:#EFF6FF;border-radius:12px;border:1px solid #BFDBFE;">
      <h3 style="color:#1E3A8A;margin-top:0;">📚 Section 2: All Captured Signups Ever (${allLeads.length} Total Cumulative Roster)</h3>
      <table style="width:100%;border-collapse:collapse;font-size:12px;background:#fff;border-radius:8px;overflow:hidden;">
        <tr style="background:#F1F5F9;text-align:left;"><th style="padding:8px 12px;">Name</th><th style="padding:8px 12px;">Email</th><th style="padding:8px 12px;">County</th><th style="padding:8px 12px;">Status</th></tr>
        ${allLeads.map(l => `<tr style="border-bottom:1px solid #E2E8F0;"><td style="padding:8px 12px;font-weight:600;">${l.name}</td><td style="padding:8px 12px;color:#0F766E;">${l.email}</td><td style="padding:8px 12px;">${l.county}</td><td style="padding:8px 12px;">${l.isLast24Hours ? '<span style="color:#16A34A;font-weight:700;">Last 24h</span>' : '<span style="color:#64748B;">Historical</span>'}</td></tr>`).join('')}
      </table>
    </div>
  </div>
</body>
</html>`;

          res.end(
            JSON.stringify({
              recipient: 'support@peernotebook.com',
              periodStart: new Date(now - 86400000).toISOString(),
              periodEnd: new Date().toISOString(),
              newLeadsCount: recentLeads.length,
              totalLeadsCount: allLeads.length,
              traffic: {
                totalVisits: 384,
                uniqueVisitors: 246,
                conversionRate: 4.9,
                topRoutes: [
                  { route: '/', views: 182 },
                  { route: '/docs', views: 98 },
                  { route: '/#lead-magnet', views: 64 },
                ],
              },
              recentLeads,
              allLeads,
              dispatchStatus: 'delivered',
              provider: 'resend',
              messageId: `pn_digest_dev_${Date.now()}`,
              htmlReport,
            })
          );
          return;
        }

        if (requestUrl.startsWith('/api/lead-capture')) {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              ok: true,
              message: 'Lead registration captured successfully for beta cohort.',
              leadId: `lead_dev_${Date.now()}`,
              capturedAt: new Date().toISOString(),
              emailDeliveryStatus: 'simulated',
              targetRecipient: 'support@peernotebook.com',
            })
          );
          return;
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), devApiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: 3000,
      allowedHosts: true,
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

function devApiPlugin() {
  return {
    name: 'dev-api-plugin',
    configureServer(server: any) {
      server.middlewares.use((req: any, res: any, next: any) => {
        if (req.url?.startsWith('/api/daily-digest')) {
          res.setHeader('Content-Type', 'application/json');
          res.end(
            JSON.stringify({
              recipient: 'support@peernotebook.com',
              periodStart: new Date(Date.now() - 86400000).toISOString(),
              periodEnd: new Date().toISOString(),
              newLeadsCount: 5,
              totalLeadsCount: 48,
              traffic: {
                totalVisits: 342,
                uniqueVisitors: 218,
                conversionRate: 4.8,
                topRoutes: [
                  { route: '/', views: 168 },
                  { route: '/docs', views: 84 },
                  { route: '/#lead-magnet', views: 56 },
                ],
              },
              recentLeads: [
                {
                  email: 'marcus.vance@alamedahealth.org',
                  name: 'Marcus Vance',
                  roleTitle: 'Certified Peer Support Specialist (CPSS-CA)',
                  county: 'Alameda',
                  submittedAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
                },
                {
                  email: 'd.reyes@sfnetworkpeer.org',
                  name: 'Elena Reyes',
                  roleTitle: 'Lead Peer Navigator (ECM)',
                  county: 'San Francisco',
                  submittedAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
                },
              ],
              dispatchStatus: 'delivered',
              provider: 'resend',
              messageId: `pn_digest_dev_${Date.now()}`,
              htmlReport: `<!DOCTYPE html><html><body style="font-family:sans-serif;color:#1e293b;padding:20px;"><h2>Peer Notebook Daily Telemetry & Lead Digest</h2><p>Recipient: support@peernotebook.com</p><p>New Beta Cohort Leads: 5 | 24h Site Visits: 342 | Conversion: 4.8%</p></body></html>`,
            })
          );
          return;
        }
        if (req.url?.startsWith('/api/lead-capture')) {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ ok: true, message: 'Lead captured successfully' }));
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
        '@': path.resolve(import.meta.dirname, 'src'),
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

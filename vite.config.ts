import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig } from 'vite';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

import { executeDailyDigest } from './api/daily-digest.ts';
import { executeLeadCapture } from './api/lead-capture.ts';
import { executeTestEmail } from './api/test-email.ts';
import { executeVerifyEmail } from './api/verify-email.ts';
import { executePipelineAudit } from './api/email-pipeline-audit.ts';

function getRequestBody(req: IncomingMessage): Promise<any> {
  const method = (req.method || 'GET').toUpperCase();
  if (method === 'GET' || method === 'HEAD') {
    return Promise.resolve({});
  }
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(data || '{}'));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => resolve({}));
  });
}

function devApiPlugin() {
  return {
    name: 'dev-api-plugin',
    configureServer(server: {
      middlewares: {
        use: (handler: (req: IncomingMessage & { url?: string }, res: ServerResponse, next: () => void) => void) => void;
      };
    }) {
      server.middlewares.use(async (req: IncomingMessage & { url?: string }, res: ServerResponse, next: () => void) => {
        const requestUrl = req.url ?? '';

        if (requestUrl.startsWith('/api/daily-digest')) {
          try {
            const body = await getRequestBody(req);
            const parsedUrl = new URL(requestUrl, 'http://localhost:3000');
            const isManual = parsedUrl.searchParams.get('manual') === 'true' || parsedUrl.searchParams.get('force') === 'true';
            const isPreview = parsedUrl.searchParams.get('preview') === 'true';
            const customRecipient = body?.recipient || parsedUrl.searchParams.get('to') || undefined;

            const { payload, htmlReport } = await executeDailyDigest({
              isManual,
              isPreview,
              customRecipient
            });

            if (isPreview) {
              res.setHeader('Content-Type', 'text/html; charset=utf-8');
              res.setHeader('Cache-Control', 'no-store');
              res.end(htmlReport);
              return;
            }

            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-store');
            res.end(JSON.stringify(payload));
            return;
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to process daily digest', details: errorMsg }));
            return;
          }
        }

        if (requestUrl.startsWith('/api/verify-email')) {
          try {
            const body = await getRequestBody(req);
            const parsedUrl = new URL(requestUrl, 'http://localhost:3000');
            const payload = {
              action: (body?.action || parsedUrl.searchParams.get('action') || (req.method === 'GET' ? 'status' : 'send')) as any,
              email: body?.email || parsedUrl.searchParams.get('email') || '',
              code: body?.code || parsedUrl.searchParams.get('code') || '',
              name: body?.name || parsedUrl.searchParams.get('name') || undefined,
              roleTitle: body?.roleTitle || parsedUrl.searchParams.get('roleTitle') || undefined,
            };
            const { status, data } = await executeVerifyEmail(payload);
            res.statusCode = status;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-store');
            res.end(JSON.stringify(data));
            return;
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to process email verification', details: errorMsg }));
            return;
          }
        }

        if (requestUrl.startsWith('/api/lead-capture')) {
          try {
            const body = await getRequestBody(req);
            const result = await executeLeadCapture(body);
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-store');
            res.end(JSON.stringify(result));
            return;
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to capture lead', details: errorMsg }));
            return;
          }
        }

        if (requestUrl.startsWith('/api/test-email')) {
          try {
            const body = await getRequestBody(req);
            const parsedUrl = new URL(requestUrl, 'http://localhost:3000');
            const flow = body?.flow || body?.templateType || parsedUrl.searchParams.get('flow') || parsedUrl.searchParams.get('templateType') || 'all';
            const to = body?.to || parsedUrl.searchParams.get('to') || undefined;
            const customMessage = body?.customMessage || parsedUrl.searchParams.get('customMessage') || undefined;
            const subject = body?.subject || parsedUrl.searchParams.get('subject') || undefined;
            const name = body?.name || parsedUrl.searchParams.get('name') || undefined;
            const roleTitle = body?.roleTitle || parsedUrl.searchParams.get('roleTitle') || undefined;
            const county = body?.county || parsedUrl.searchParams.get('county') || undefined;

            const result = await executeTestEmail({
              flow: flow as any,
              to,
              customMessage,
              subject,
              name,
              roleTitle,
              county
            });
            const statusCode = (result as any).ok === false || (result as any).deliveryStatus === 'failed' ? 502 : 200;
            res.statusCode = statusCode;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-store');
            res.end(JSON.stringify(result));
            return;
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to dispatch test email', details: errorMsg }));
            return;
          }
        }

        if (requestUrl.startsWith('/api/email-pipeline-audit')) {
          try {
            const body = await getRequestBody(req);
            const parsedUrl = new URL(requestUrl, 'http://localhost:3000');
            const domain = body?.domain || parsedUrl.searchParams.get('domain') || 'peernotebook.com';
            const to = body?.to || parsedUrl.searchParams.get('to') || 'amunrael@gmail.com';
            const sendTest = body?.sendTest === true || parsedUrl.searchParams.get('sendTest') === 'true';
            const apiKey = body?.apiKey || parsedUrl.searchParams.get('apiKey') || undefined;

            const response = await executePipelineAudit({ domain, to, sendTest, apiKey });
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Cache-Control', 'no-store');
            res.end(JSON.stringify(response));
            return;
          } catch (err: unknown) {
            const errorMsg = err instanceof Error ? err.message : String(err);
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Failed to run pipeline audit', details: errorMsg }));
            return;
          }
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

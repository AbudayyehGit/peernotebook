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

function getRequestBody(req: IncomingMessage): Promise<any> {
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
          res.setHeader('Content-Type', 'application/json');
          let requestBody = '';
          req.on('data', (chunk) => {
            requestBody += chunk;
          });
          req.on('end', () => {
            try {
              const body = requestBody ? JSON.parse(requestBody) : {};
              const action = body.action || 'send';
              const email = body.email || 'specialist@peernotebook.com';
              const code = body.code || '';

              if (action === 'send') {
                const otp = Math.floor(100000 + Math.random() * 900000).toString();
                res.end(
                  JSON.stringify({
                    ok: true,
                    message: 'Verification code dispatched to your email address.',
                    email,
                    emailDeliveryStatus: 'simulated',
                    simulatedCode: otp,
                    expiresInMinutes: 15,
                  })
                );
              } else if (action === 'verify') {
                const isMatch = code === '123456' || (code && code.length === 6);
                if (isMatch) {
                  res.end(
                    JSON.stringify({
                      ok: true,
                      verified: true,
                      message: 'Email address verified successfully!',
                      email,
                      verifiedAt: new Date().toISOString(),
                    })
                  );
                } else {
                  res.statusCode = 400;
                  res.end(
                    JSON.stringify({
                      error: 'Invalid 6-digit verification code. Please try again.',
                    })
                  );
                }
              } else {
                res.end(
                  JSON.stringify({
                    ok: true,
                    email,
                    isVerified: true,
                  })
                );
              }
            } catch {
              res.end(
                JSON.stringify({
                  ok: true,
                  message: 'Verification code dispatched.',
                  simulatedCode: '492817',
                })
              );
            }
          });
          return;
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
            const result = await executeTestEmail(body);
            res.statusCode = 200;
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

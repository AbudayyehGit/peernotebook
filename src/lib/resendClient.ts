/**
 * Peer Notebook - Universal Resend API Email Dispatch & Diagnostic Engine
 * GA #8 Production Standard • Zero Silent Failures
 * Manages transactional email delivery, domain verification fallback,
 * and comprehensive error diagnostics for registration, leads, and OTP verification.
 */

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  tags?: Array<{ name: string; value: string }>;
}

export interface ResendErrorDetail {
  statusCode?: number;
  name?: string;
  message: string;
  suggestion?: string;
}

export interface ResendDispatchResult {
  success: boolean;
  status: 'delivered' | 'simulated' | 'failed';
  provider: 'resend' | 'simulated-resend';
  messageId?: string;
  error?: ResendErrorDetail;
  details: {
    from: string;
    to: string | string[];
    subject: string;
    sentAt: string;
  };
}

export interface ResendAuditReport {
  configured: boolean;
  apiKeyFound: boolean;
  apiKeyPrefixValid: boolean;
  fromEmail: string;
  supportEmail: string;
  recommendations: string[];
}

export class ResendMailService {
  private static DEFAULT_FROM = 'Peer Notebook <notifications@peernotebook.com>';
  private static FALLBACK_FROM = 'Peer Notebook <onboarding@resend.dev>';
  private static DEFAULT_REPLY_TO = 'support@peernotebook.com';

  private static getEnvVar(name: string): string | null {
    if (typeof globalThis !== 'undefined') {
      const g = globalThis as { process?: { env?: Record<string, string | undefined> } };
      if (g.process?.env && g.process.env[name]) {
        return g.process.env[name]!.trim();
      }
    }
    try {
      if (typeof import.meta !== 'undefined' && import.meta.env && (import.meta.env as Record<string, any>)[name]) {
        return String((import.meta.env as Record<string, any>)[name]).trim();
      }
    } catch {
      // In non-Vite contexts
    }
    return null;
  }

  /**
   * Resolve active API key across process.env or Vite runtime
   */
  public static getApiKey(): string | null {
    return this.getEnvVar('RESEND_API_KEY') || this.getEnvVar('VITE_RESEND_API_KEY');
  }

  /**
   * Resolve default from address
   */
  public static getDefaultFrom(): string {
    return this.getEnvVar('RESEND_FROM_EMAIL') || this.DEFAULT_FROM;
  }

  /**
   * Resolve default reply-to address
   */
  public static getDefaultReplyTo(): string {
    return this.getEnvVar('SUPPORT_EMAIL') || this.DEFAULT_REPLY_TO;
  }

  /**
   * Audit current configuration without dispatching emails
   */
  public static auditConfiguration(): ResendAuditReport {
    const key = this.getApiKey();
    const from = this.getDefaultFrom();
    const support = this.getDefaultReplyTo();
    const recommendations: string[] = [];

    if (!key) {
      recommendations.push(
        'RESEND_API_KEY is not defined in environment variables. Emails will execute in safe simulation mode.'
      );
    } else if (!key.startsWith('re_')) {
      recommendations.push(
        'RESEND_API_KEY does not start with standard prefix "re_". Verify key in resend.com/api-keys.'
      );
    }

    if (from.includes('@peernotebook.com')) {
      recommendations.push(
        'Using custom domain @peernotebook.com. Ensure DNS TXT (SPF) and CNAME (DKIM) records are verified at resend.com/domains.'
      );
    }

    return {
      configured: Boolean(key && key.startsWith('re_')),
      apiKeyFound: Boolean(key),
      apiKeyPrefixValid: Boolean(key && key.startsWith('re_')),
      fromEmail: from,
      supportEmail: support,
      recommendations
    };
  }

  /**
   * Send a transactional email with zero silent failure guarantee
   */
  public static async sendTransactionalEmail(options: SendEmailOptions): Promise<ResendDispatchResult> {
    const apiKey = this.getApiKey();
    const fromAddress = options.from || this.getDefaultFrom();
    const replyToAddress = options.replyTo || this.getDefaultReplyTo();
    const sentAt = new Date().toISOString();

    const resultDetails = {
      from: fromAddress,
      to: options.to,
      subject: options.subject,
      sentAt
    };

    // 1. Simulation Mode if no API key is provided
    if (!apiKey) {
      const simulatedId = `msg_sim_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      console.log(`[RESEND_SIMULATION] Simulated email to ${Array.isArray(options.to) ? options.to.join(', ') : options.to}: "${options.subject}" (ID: ${simulatedId})`);

      return {
        success: true,
        status: 'simulated',
        provider: 'simulated-resend',
        messageId: simulatedId,
        details: resultDetails
      };
    }

    // 2. Live API Dispatch to Resend
    try {
      const payload: Record<string, unknown> = {
        from: fromAddress,
        to: options.to,
        subject: options.subject,
        html: options.html,
        reply_to: replyToAddress
      };

      if (options.tags && options.tags.length > 0) {
        payload.tags = options.tags;
      }

      let resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      // Handle custom domain verification rejection with automatic fallback retry if configured
      if (!resendResponse.ok) {
        const errorText = await resendResponse.text();
        let errorJson: { statusCode?: number; name?: string; message?: string } = {};
        try {
          errorJson = JSON.parse(errorText);
        } catch {
          errorJson = { message: errorText };
        }

        const isDomainError =
          errorJson.name === 'validation_error' ||
          (errorJson.message && errorJson.message.toLowerCase().includes('domain is not verified'));

        // If domain not verified and sending from custom domain, try fallback if sending to verified owner
        if (isDomainError && fromAddress !== this.FALLBACK_FROM) {
          console.warn(`[RESEND_DOMAIN_WARNING] ${fromAddress} is not verified in Resend. Attempting fallback via ${this.FALLBACK_FROM}...`);

          const fallbackPayload = {
            ...payload,
            from: this.FALLBACK_FROM
          };

          const fallbackRes = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${apiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(fallbackPayload)
          });

          if (fallbackRes.ok) {
            const fallbackData = await fallbackRes.json();
            console.log(`[RESEND_FALLBACK_SUCCESS] Email delivered via fallback domain (${this.FALLBACK_FROM}):`, fallbackData.id);
            return {
              success: true,
              status: 'delivered',
              provider: 'resend',
              messageId: fallbackData.id,
              details: {
                ...resultDetails,
                from: this.FALLBACK_FROM
              }
            };
          }
        }

        // Actionable suggestion based on Resend error type
        let suggestion = 'Verify Resend API settings at resend.com/overview.';
        if (resendResponse.status === 401) {
          suggestion = 'RESEND_API_KEY is unauthorized or expired. Create a new key at resend.com/api-keys.';
        } else if (isDomainError) {
          suggestion = `Domain in '${fromAddress}' is not verified in Resend. Verify DNS at resend.com/domains or configure RESEND_FROM_EMAIL.`;
        } else if (resendResponse.status === 429) {
          suggestion = 'Resend rate limit exceeded (limit is 2 req/sec on free tier). Slow down dispatch.';
        }

        console.error(`[RESEND_API_ERROR] HTTP ${resendResponse.status}:`, JSON.stringify(errorJson));

        return {
          success: false,
          status: 'failed',
          provider: 'resend',
          error: {
            statusCode: resendResponse.status,
            name: errorJson.name || 'ResendApiError',
            message: errorJson.message || 'Unknown Resend API error',
            suggestion
          },
          details: resultDetails
        };
      }

      // 3. Successful Delivery
      const resendData = await resendResponse.json();
      console.log(`[RESEND_DELIVERED] Email successfully accepted by Resend gateway: ${resendData.id}`);

      return {
        success: true,
        status: 'delivered',
        provider: 'resend',
        messageId: resendData.id,
        details: resultDetails
      };
    } catch (networkErr: unknown) {
      const errorMsg = networkErr instanceof Error ? networkErr.message : String(networkErr);
      console.error('[RESEND_NETWORK_FAILURE]', errorMsg);

      return {
        success: false,
        status: 'failed',
        provider: 'resend',
        error: {
          name: 'NetworkError',
          message: errorMsg,
          suggestion: 'Check network connectivity to https://api.resend.com/emails.'
        },
        details: resultDetails
      };
    }
  }
}

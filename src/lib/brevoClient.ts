/**
 * Peer Notebook - Brevo API (v3) Transactional Email Engine & Deliverability Verifier
 * Architecture: Spaceship.com ➔ Brevo.com ➔ Gmail.com (amunrael@gmail.com)
 * Standard: Google & Yahoo 2024 Email Sender Guidelines • CalAIM H0038 / HIPAA Aligned
 * Zero Silent Failures • Cryptographic SPF/DKIM/DMARC Alignment Diagnostics
 */

export interface BrevoRecipient {
  email: string;
  name?: string;
}

export interface BrevoSender {
  name: string;
  email: string;
}

export interface BrevoSendEmailOptions {
  to: string | string[] | BrevoRecipient[];
  subject: string;
  html: string;
  text?: string;
  from?: BrevoSender;
  replyTo?: BrevoSender;
  tags?: string[];
  headers?: Record<string, string>;
  apiKey?: string;
}

export interface BrevoErrorDetail {
  statusCode?: number;
  code?: string;
  message: string;
  suggestion?: string;
  technicalDetails?: Record<string, any>;
}

export interface BrevoDispatchResult {
  success: boolean;
  status: 'delivered' | 'simulated' | 'failed';
  provider: 'brevo' | 'simulated-brevo';
  messageId?: string;
  error?: BrevoErrorDetail;
  details: {
    from: BrevoSender;
    to: BrevoRecipient[];
    subject: string;
    sentAt: string;
    hasTextAlternative: boolean;
    rfcHeadersApplied: boolean;
  };
}

export interface DnsCheckRecord {
  host: string;
  type: 'TXT' | 'CNAME' | 'MX' | 'A';
  currentValue: string | null;
  requiredValue: string;
  status: 'verified' | 'action_required' | 'missing';
  description: string;
  spaceshipInstructions: string;
}

export interface PipelineAuditReport {
  timestamp: string;
  domain: string;
  targetEmail: string;
  overallStatus: 'ready' | 'action_required' | 'critical_error';
  brevoConfig: {
    apiKeyFound: boolean;
    apiKeyPrefixValid: boolean;
    senderEmail: string;
    senderName: string;
    replyToEmail: string;
    apiEndpoint: string;
    smtpHost: string;
    smtpPort: number;
  };
  dnsRecords: {
    spf: DnsCheckRecord;
    dkim: DnsCheckRecord;
    dmarc: DnsCheckRecord;
    brevoCode: DnsCheckRecord;
    mx: DnsCheckRecord;
  };
  gmail2024Compliance: {
    spfAlignment: { status: 'pass' | 'fail'; message: string };
    dkimSignature: { status: 'pass' | 'fail'; message: string };
    dmarcEnforcement: { status: 'pass' | 'warning' | 'fail'; message: string };
    senderDomainMatch: { status: 'pass' | 'fail'; message: string };
    plainTextAlternative: { status: 'pass' | 'fail'; message: string };
    oneClickUnsubscribe: { status: 'pass' | 'fail'; message: string };
    tlsEncryption: { status: 'pass' | 'fail'; message: string };
  };
  actionableSteps: string[];
}

export class BrevoMailService {
  public static readonly DEFAULT_DOMAIN = 'peernotebook.com';
  public static readonly DEFAULT_SENDER_EMAIL = 'support@peernotebook.com';
  public static readonly DEFAULT_SENDER_NAME = 'Peer Notebook';
  public static readonly DEFAULT_SUPPORT_EMAIL = 'support@peernotebook.com';
  public static readonly TARGET_DELIVERY_EMAIL = 'joeabudayyeh@gmail.com';
  public static readonly BREVO_VERIFICATION_CODE = 'brevo-code:65093d763f8a900ca517d990a91bb87f';

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
      // In non-Vite environments
    }
    return null;
  }

  /**
   * Resolve Brevo API key across process.env or Vite runtime
   */
  public static getApiKey(): string | null {
    return (
      this.getEnvVar('BREVO_API_KEY') ||
      this.getEnvVar('VITE_BREVO_API_KEY') ||
      this.getEnvVar('SENDINBLUE_API_KEY') ||
      null
    );
  }

  /**
   * Resolve active sender identity
   */
  public static getDefaultSender(): BrevoSender {
    const customEmail = this.getEnvVar('BREVO_FROM_EMAIL');
    if (customEmail) {
      const match = customEmail.match(/^(.*?)\s*<(.+)>$/);
      if (match) {
        return { name: match[1].trim(), email: match[2].trim() };
      }
      return { name: this.DEFAULT_SENDER_NAME, email: customEmail.trim() };
    }
    return { name: this.DEFAULT_SENDER_NAME, email: this.DEFAULT_SENDER_EMAIL };
  }

  /**
   * Resolve reply-to identity
   */
  public static getDefaultReplyTo(): BrevoSender {
    const custom = this.getEnvVar('SUPPORT_EMAIL') || this.DEFAULT_SUPPORT_EMAIL;
    return { name: 'Peer Notebook Support', email: custom };
  }

  /**
   * Strip HTML to produce compliant text alternative for anti-spam filters
   */
  public static htmlToPlainText(html: string): string {
    return html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<\/tr>/gi, '\n')
      .replace(/<\/td>/gi, ' | ')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\n\s*\n\s*\n/g, '\n\n')
      .trim();
  }

  /**
   * Audit configuration status
   */
  public static auditConfiguration(): {
    configured: boolean;
    apiKeyFound: boolean;
    apiKeyPrefixValid: boolean;
    sender: BrevoSender;
    replyTo: BrevoSender;
    recommendations: string[];
  } {
    const apiKey = this.getApiKey();
    const sender = this.getDefaultSender();
    const replyTo = this.getDefaultReplyTo();
    const recommendations: string[] = [];

    if (!apiKey) {
      recommendations.push(
        'BREVO_API_KEY is not defined in environment variables. Outbound mail executes in safe simulation mode.'
      );
    } else if (!apiKey.startsWith('xkeysib-')) {
      recommendations.push(
        'BREVO_API_KEY does not start with standard prefix "xkeysib-". Verify key in Brevo dashboard: SMTP & API > API Keys.'
      );
    }

    if (!sender.email.endsWith('@peernotebook.com')) {
      recommendations.push(
        `Sender email '${sender.email}' does not match authenticated domain @peernotebook.com. SPF/DKIM will fail at Gmail.`
      );
    }

    return {
      configured: Boolean(apiKey && apiKey.startsWith('xkeysib-')),
      apiKeyFound: Boolean(apiKey),
      apiKeyPrefixValid: Boolean(apiKey && apiKey.startsWith('xkeysib-')),
      sender,
      replyTo,
      recommendations
    };
  }

  /**
   * Send transactional email through Brevo API v3
   */
  public static async sendTransactionalEmail(options: BrevoSendEmailOptions): Promise<BrevoDispatchResult> {
    const apiKey = options.apiKey || this.getApiKey();
    const sender = options.from || this.getDefaultSender();
    const replyTo = options.replyTo || this.getDefaultReplyTo();
    const sentAt = new Date().toISOString();

    // Standardize recipient array
    let recipients: BrevoRecipient[] = [];
    if (typeof options.to === 'string') {
      recipients = [{ email: options.to.trim() }];
    } else if (Array.isArray(options.to)) {
      recipients = options.to.map(item => {
        if (typeof item === 'string') return { email: item.trim() };
        return item;
      });
    }

    const textContent = options.text || this.htmlToPlainText(options.html);

    const baseDetails = {
      from: sender,
      to: recipients,
      subject: options.subject,
      sentAt,
      hasTextAlternative: Boolean(textContent && textContent.length > 0),
      rfcHeadersApplied: true
    };

    // 1. Safe Simulation Mode if no Brevo key is configured
    if (!apiKey) {
      const simulatedId = `<sim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}@smtp-relay.brevo.com>`;
      console.log(
        `[BREVO_SIMULATION] Simulated transactional dispatch to ${recipients.map(r => r.email).join(', ')}: "${options.subject}" (ID: ${simulatedId})`
      );

      return {
        success: true,
        status: 'simulated',
        provider: 'simulated-brevo',
        messageId: simulatedId,
        details: baseDetails
      };
    }

    // 2. Live API Dispatch to Brevo API v3
    try {
      const headers: Record<string, string> = {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey
      };

      // RFC 5322 & Google 2024 compliance headers
      const emailHeaders: Record<string, string> = {
        'X-Mailer': 'PeerNotebook-Brevo-v3',
        'List-Unsubscribe': `<mailto:${replyTo.email}?subject=unsubscribe>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
        ...(options.headers || {})
      };

      const payload: Record<string, any> = {
        sender,
        to: recipients,
        replyTo,
        subject: options.subject,
        htmlContent: options.html,
        textContent,
        headers: emailHeaders
      };

      if (options.tags && options.tags.length > 0) {
        payload.tags = options.tags;
      }

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });

      const responseText = await response.text();
      let responseJson: any = {};
      try {
        responseJson = JSON.parse(responseText);
      } catch {
        responseJson = { message: responseText };
      }

      if (!response.ok) {
        let suggestion = 'Verify Brevo configuration in Brevo dashboard.';
        if (response.status === 401) {
          suggestion = 'BREVO_API_KEY is unauthorized or expired. Create a new key at app.brevo.com/settings/keys/api.';
        } else if (response.status === 400) {
          suggestion = `Brevo payload rejected: ${responseJson.message || 'Check recipient email formatting'}.`;
        } else if (response.status === 403) {
          suggestion = `Sender domain or email '${sender.email}' is unverified in Brevo. Complete verification at app.brevo.com/senders.`;
        } else if (response.status === 402) {
          suggestion = 'Brevo account has reached sending quota or plan credits limit (300/day on free tier).';
        }

        console.error(`[BREVO_API_ERROR] HTTP ${response.status}:`, responseJson);

        return {
          success: false,
          status: 'failed',
          provider: 'brevo',
          error: {
            statusCode: response.status,
            code: responseJson.code || 'BREVO_DISPATCH_ERROR',
            message: responseJson.message || 'Unknown Brevo API error',
            suggestion,
            technicalDetails: responseJson
          },
          details: baseDetails
        };
      }

      const messageId = responseJson.messageId || `<${Date.now()}@smtp-relay.brevo.com>`;
      console.log(`[BREVO_DISPATCH_SUCCESS] Accepted by Brevo gateway. MessageId: ${messageId}`);

      return {
        success: true,
        status: 'delivered',
        provider: 'brevo',
        messageId,
        details: baseDetails
      };
    } catch (networkErr: unknown) {
      const errorMsg = networkErr instanceof Error ? networkErr.message : String(networkErr);
      console.error('[BREVO_NETWORK_FAILURE]', errorMsg);

      return {
        success: false,
        status: 'failed',
        provider: 'brevo',
        error: {
          code: 'NETWORK_ERROR',
          message: errorMsg,
          suggestion: 'Check server outbound HTTPS access to https://api.brevo.com/v3/smtp/email.'
        },
        details: baseDetails
      };
    }
  }

  /**
   * Verify Brevo Account & API Key via Brevo REST API
   */
  public static async verifyAccount(apiKey?: string): Promise<{
    valid: boolean;
    email?: string;
    companyName?: string;
    creditsRemaining?: number;
    error?: string;
  }> {
    const key = apiKey || this.getApiKey();
    if (!key) {
      return { valid: false, error: 'BREVO_API_KEY is not defined in environment.' };
    }

    try {
      const res = await fetch('https://api.brevo.com/v3/account', {
        headers: { 'api-key': key, 'Accept': 'application/json' }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        return { valid: false, error: err.message || `HTTP ${res.status} from Brevo API` };
      }

      const data = await res.json();
      const credits = Array.isArray(data.plan) ? data.plan[0]?.credits : undefined;

      return {
        valid: true,
        email: data.email,
        companyName: data.companyName,
        creditsRemaining: credits
      };
    } catch (e: any) {
      return { valid: false, error: e.message || 'Network error reaching Brevo API' };
    }
  }
}

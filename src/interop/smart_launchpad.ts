/**
 * PEER NOTEBOOK - SMART-ON-FHIR TRIAGE LAUNCHPAD
 * HL7 SMART App Launch (v2.0.0) Flow Handler & Triage Router
 * Author: H. Joe Abudayyeh <joe@peernotebook.com>
 * Copyright (c) 2024-2026 Peer Notebook LLC. All rights reserved.
 */

import { getRandomBytes, bytesToBase64Url, sha256Base64Url } from '../utils/cryptoUtils';

export interface SmartConfiguration {
  authorization_endpoint: string;
  token_endpoint: string;
  token_endpoint_auth_methods_supported?: string[];
  capabilities: string[];
  code_challenge_methods_supported?: string[];
}

export interface SmartLaunchParams {
  iss: string;           // EHR FHIR server URL
  launch: string;        // Launch context identifier provided by EHR
  clientId: string;      // Peer Notebook registered client ID
  redirectUri: string;   // Peer Notebook callback URI
  scope?: string;
}

export interface PkcePair {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256';
}

export interface SmartTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  patient?: string;      // Launched patient ID
  encounter?: string;    // Launched encounter ID
  user?: string;         // Logged-in clinician/supervisor user ID
  need_patient_banner?: boolean;
}

export class SmartLaunchpad {
  /**
   * Generates a cryptographically secure PKCE Code Verifier & Challenge (RFC 7636)
   */
  public static generatePkce(): PkcePair {
    // RFC 7636: Code verifier must be 43-128 characters; 32 random bytes = 43 base64url chars
    const verifierBytes = getRandomBytes(32);
    const verifier = bytesToBase64Url(verifierBytes);
    const challenge = sha256Base64Url(verifier);

    return {
      codeVerifier: verifier,
      codeChallenge: challenge,
      codeChallengeMethod: 'S256',
    };
  }

  /**
   * Discovers OAuth2 endpoints via SMART Well-Known configuration
   */
  public static async discoverSmartConfig(issUrl: string): Promise<SmartConfiguration> {
    const cleanIss = issUrl.replace(/\/+$/, '');
    const wellKnownUrl = `${cleanIss}/.well-known/smart-configuration`;

    try {
      const res = await fetch(wellKnownUrl, {
        headers: { Accept: 'application/json' },
      });

      if (!res.ok) {
        throw new Error(`SMART discovery returned HTTP ${res.status}`);
      }

      return (await res.json()) as SmartConfiguration;
    } catch {
      // Fallback standard endpoints if well-known is guarded or non-standard
      return {
        authorization_endpoint: `${cleanIss}/oauth2/authorize`,
        token_endpoint: `${cleanIss}/oauth2/token`,
        capabilities: ['launch-ehr', 'client-public', 'context-ehr-patient', 'permission-patient'],
        code_challenge_methods_supported: ['S256'],
      };
    }
  }

  /**
   * Builds the authorization redirect URL with PKCE and launch context
   */
  public static buildAuthorizeUrl(
    authEndpoint: string,
    params: SmartLaunchParams,
    pkce: PkcePair,
    state: string
  ): string {
    const url = new URL(authEndpoint);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('client_id', params.clientId);
    url.searchParams.set('redirect_uri', params.redirectUri);
    url.searchParams.set('launch', params.launch);
    url.searchParams.set('scope', params.scope || 'launch openid fhirUser patient/*.read patient/Encounter.write');
    url.searchParams.set('state', state);
    url.searchParams.set('aud', params.iss);
    url.searchParams.set('code_challenge', pkce.codeChallenge);
    url.searchParams.set('code_challenge_method', pkce.codeChallengeMethod);

    return url.toString();
  }

  /**
   * Exchanges authorization code for access token and launch context
   */
  public static async exchangeCodeForToken(
    tokenEndpoint: string,
    code: string,
    codeVerifier: string,
    clientId: string,
    redirectUri: string
  ): Promise<{ success: boolean; data?: SmartTokenResponse; error?: string }> {
    const bodyParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      code_verifier: codeVerifier,
    });

    try {
      const res = await fetch(tokenEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Accept: 'application/json',
        },
        body: bodyParams.toString(),
      });

      if (!res.ok) {
        return {
          success: false,
          error: `Token exchange failed with HTTP ${res.status}: ${await res.text()}`,
        };
      }

      const data = (await res.json()) as SmartTokenResponse;
      return { success: true, data };
    } catch (err: unknown) {
      return {
        success: false,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Triage router: translates SMART launch context into Peer Notebook view state
   */
  public static resolveTriageRoute(tokenResponse: SmartTokenResponse): {
    route: string;
    syntheticContext: { patientRef?: string; encounterRef?: string; directNoteLaunch: boolean };
  } {
    if (tokenResponse.patient) {
      return {
        route: `/notes/new?smart_pat=${encodeURIComponent(tokenResponse.patient)}${
          tokenResponse.encounter ? `&smart_enc=${encodeURIComponent(tokenResponse.encounter)}` : ''
        }`,
        syntheticContext: {
          patientRef: tokenResponse.patient,
          encounterRef: tokenResponse.encounter,
          directNoteLaunch: true,
        },
      };
    }

    return {
      route: '/notes',
      syntheticContext: {
        directNoteLaunch: false,
      },
    };
  }
}

export function generatePkce(): PkcePair {
  return SmartLaunchpad.generatePkce();
}

export function buildAuthorizeUrl(
  authEndpoint: string,
  params: SmartLaunchParams,
  pkce: PkcePair,
  state: string
): string {
  return SmartLaunchpad.buildAuthorizeUrl(authEndpoint, params, pkce, state);
}

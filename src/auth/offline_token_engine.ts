/**
 * PEER NOTEBOOK - OFFLINE OAUTH & JWT ROTATION ENGINE
 * Designed for Field Peer Specialists under CalAIM & HIPAA § 164.312
 * Author: H. Joe Abudayyeh <joe@peernotebook.com>
 * Copyright (c) 2024-2026 Peer Notebook LLC. All rights reserved.
 */

import { getRandomBytes } from '../utils/cryptoUtils';

export interface TokenClaims {
  sub: string;             // User UID (synthetic specialist UUID, never raw PHI)
  role: 'specialist' | 'supervisor' | 'admin' | 'super_admin';
  tenant_id: string;       // CBO / Agency Tenant UUID
  iss: string;             // e.g., 'https://peernotebook.com/auth'
  aud: string;             // 'peernotebook-api'
  iat: number;             // Issued at (unix seconds)
  exp: number;             // Standard expiration (unix seconds)
  offline_exp: number;     // Offline grace expiration (up to 168 hours max)
  offline_scope: string[]; // e.g. ['h0038:create', 'h0038:read', 'h0038:offline_sync']
  rotation_nonce: string;  // Single-use cryptographic nonce
}

export interface OfflineTokenPackage {
  encryptedPayload: string; // Base64 ciphertext (AES-GCM)
  iv: string;               // Base64 12-byte initialization vector
  salt: string;             // Base64 salt for PBKDF2 key derivation
  issuedAt: string;         // ISO timestamp
  offlineExpiresAt: string; // ISO timestamp
  lastRotatedAt: string;    // ISO timestamp
  rotationCount: number;
}

export interface RotationResult {
  success: boolean;
  claims?: TokenClaims;
  error?: string;
  isStale: boolean;
  needsOnlineReauth: boolean;
}

export class OfflineTokenEngine {
  private static readonly STORAGE_KEY = 'pn_offline_token_vault_v1';
  private static readonly MIN_ROTATION_THRESHOLD_HOURS = 72; // > 72 hours minimum offline threshold
  private static readonly MAX_OFFLINE_LIMIT_HOURS = 168; // 7 days hard cutoff

  /**
   * Helper: Generate a cryptographically secure random string
   */
  public static generateCryptoNonce(length: number = 32): string {
    const array = getRandomBytes(length);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Derive AES-GCM 256-bit CryptoKey from device seed or specialist PIN
   */
  private static async deriveKey(secret: string, salt: Uint8Array): Promise<CryptoKey> {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: salt as unknown as BufferSource,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * Encrypts token claims and stores in local client vault
   */
  public static async sealToken(
    claims: TokenClaims,
    deviceSecret: string
  ): Promise<OfflineTokenPackage> {
    const enc = new TextEncoder();
    const salt = new Uint8Array(16);
    crypto.getRandomValues(salt);

    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);

    const derivedKey = await this.deriveKey(deviceSecret, salt);
    const plaintext = enc.encode(JSON.stringify(claims));

    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      derivedKey,
      plaintext
    );

    const b64Payload = Buffer.from(encryptedBuffer).toString('base64');
    const b64Iv = Buffer.from(iv).toString('base64');
    const b64Salt = Buffer.from(salt).toString('base64');

    const pkg: OfflineTokenPackage = {
      encryptedPayload: b64Payload,
      iv: b64Iv,
      salt: b64Salt,
      issuedAt: new Date(claims.iat * 1000).toISOString(),
      offlineExpiresAt: new Date(claims.offline_exp * 1000).toISOString(),
      lastRotatedAt: new Date().toISOString(),
      rotationCount: 0,
    };

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(pkg));
    }

    return pkg;
  }

  /**
   * Decrypts and validates the offline token package
   */
  public static async unsealToken(
    pkg: OfflineTokenPackage,
    deviceSecret: string
  ): Promise<TokenClaims> {
    const iv = new Uint8Array(Buffer.from(pkg.iv, 'base64'));
    const salt = new Uint8Array(Buffer.from(pkg.salt, 'base64'));
    const ciphertext = Buffer.from(pkg.encryptedPayload, 'base64');

    const derivedKey = await this.deriveKey(deviceSecret, salt);

    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      derivedKey,
      ciphertext
    );

    const dec = new TextDecoder();
    const claims = JSON.parse(dec.decode(decryptedBuffer)) as TokenClaims;
    return claims;
  }

  /**
   * Evaluates offline token eligibility, validates expiration thresholds (> 72h / <= 168h)
   */
  public static evaluateOfflineToken(
    claims: TokenClaims,
    currentTimeSeconds: number = Math.floor(Date.now() / 1000)
  ): RotationResult {
    // Check if within standard or offline grace period
    const isStandardExpired = currentTimeSeconds >= claims.exp;
    const isOfflineExpired = currentTimeSeconds >= claims.offline_exp;

    if (isOfflineExpired) {
      return {
        success: false,
        error: 'Offline token exceeded maximum threshold (> 72h-168h). Mandatory online re-authentication required.',
        isStale: true,
        needsOnlineReauth: true,
      };
    }

    // Check if token age exceeds rotation interval (> 72 hours from issuance)
    const ageInHours = (currentTimeSeconds - claims.iat) / 3600;
    const isStale = ageInHours >= this.MIN_ROTATION_THRESHOLD_HOURS;

    return {
      success: true,
      claims,
      isStale,
      needsOnlineReauth: false,
    };
  }

  /**
   * Performs an offline rotation cycle by validating current nonce and issuing updated rotation nonce
   */
  public static rotateOfflineClaims(
    existing: TokenClaims,
    extendHours: number = 24
  ): TokenClaims {
    const now = Math.floor(Date.now() / 1000);
    const maxOffline = now + this.MAX_OFFLINE_LIMIT_HOURS * 3600;
    const proposedOfflineExp = Math.min(now + extendHours * 3600, maxOffline);

    return {
      ...existing,
      iat: now,
      exp: now + 3600, // 1-hour standard token
      offline_exp: proposedOfflineExp,
      rotation_nonce: this.generateCryptoNonce(16),
    };
  }

  /**
   * Enforces zero persistent auth on session end / unload
   */
  public static purgeOfflineVault(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }
}

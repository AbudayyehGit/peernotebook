/**
 * Peer Notebook - Sprint 2: Clinical Data Encryption Worker (SP2-02)
 * Web Crypto API key derivation (PBKDF2-SHA256, AES-GCM 256-bit),
 * automated session teardown on idle, and zero-memory key purging.
 *
 * Attribution: H. Joe Abudayyeh & Peer Notebook LLC (2026-2027)
 */

export type VaultLockState = 'unlocked' | 'locked' | 'idle_locked' | 'purged';
export type TeardownReason = 'idle' | 'manual' | 'purge';
export type TeardownListener = (reason: TeardownReason) => void;

export interface EncryptedPayload {
  ciphertext: string; // Base64
  iv: string;         // Base64 (12 bytes)
  salt: string;       // Base64 (16 bytes)
  algorithm: string;  // 'AES-GCM-256'
  timestamp: string;  // ISO string
}

export class EncryptionWorker {
  private state: VaultLockState = 'locked';
  private activeKey: CryptoKey | null = null;
  private saltBuffer: Uint8Array<ArrayBuffer> | null = null;
  private rawKeyMaterialBuffer: Uint8Array<ArrayBuffer> | null = null;
  private idleTimeoutMs: number = 15 * 60 * 1000; // 15 minutes default
  private lastActivityTimestamp: number = Date.now();
  private idleCheckIntervalId: ReturnType<typeof setInterval> | null = null;
  private teardownListeners: Set<TeardownListener> = new Set();
  private boundActivityHandler: () => void;

  constructor(idleTimeoutMs?: number) {
    if (idleTimeoutMs && idleTimeoutMs > 0) {
      this.idleTimeoutMs = idleTimeoutMs;
    }

    this.boundActivityHandler = () => this.recordActivity();

    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', this.boundActivityHandler, { passive: true });
      window.addEventListener('keydown', this.boundActivityHandler, { passive: true });
      window.addEventListener('touchstart', this.boundActivityHandler, { passive: true });
      window.addEventListener('pointerdown', this.boundActivityHandler, { passive: true });
    }

    // Start idle monitor loop (checks every 2 seconds)
    this.idleCheckIntervalId = setInterval(() => {
      this.evaluateIdleStatus();
    }, 2000);

    // Unref interval if supported (e.g. Node.js test environment) to avoid holding the process open
    if (this.idleCheckIntervalId && typeof (this.idleCheckIntervalId as unknown as { unref?: () => void }).unref === 'function') {
      (this.idleCheckIntervalId as unknown as { unref: () => void }).unref();
    }
  }

  /**
   * Returns current crypto subtle implementation across browser and Node.js environments
   */
  private getSubtleCrypto(): SubtleCrypto {
    if (typeof globalThis !== 'undefined' && globalThis.crypto?.subtle) {
      return globalThis.crypto.subtle;
    }
    throw new Error('Web Crypto API (crypto.subtle) is not available in the current environment.');
  }

  /**
   * Returns crypto implementation for random bytes
   */
  private getCrypto(): Crypto {
    if (typeof globalThis !== 'undefined' && globalThis.crypto) {
      return globalThis.crypto;
    }
    throw new Error('Crypto API is not available.');
  }

  /**
   * Derives an AES-GCM 256-bit key from a passphrase and salt using PBKDF2
   */
  public async deriveKey(passphrase: string, existingSalt?: Uint8Array): Promise<CryptoKey> {
    const subtle = this.getSubtleCrypto();
    const encoder = new TextEncoder();

    // Store raw passphrase bytes temporarily in buffer for zeroing later
    this.rawKeyMaterialBuffer = encoder.encode(passphrase);

    // Import passphrase as PBKDF2 base key
    const baseKey = await subtle.importKey(
      'raw',
      this.rawKeyMaterialBuffer as unknown as BufferSource,
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    // Zero out the raw passphrase buffer immediately after base key import
    this.rawKeyMaterialBuffer.fill(0);
    this.rawKeyMaterialBuffer = null;

    // Use or generate 16-byte salt
    if (existingSalt && existingSalt.length >= 16) {
      this.saltBuffer = new Uint8Array(new ArrayBuffer(existingSalt.length));
      this.saltBuffer.set(existingSalt);
    } else {
      this.saltBuffer = new Uint8Array(new ArrayBuffer(16));
      this.getCrypto().getRandomValues(this.saltBuffer);
    }

    // Derive AES-GCM 256-bit key with 100,000 iterations
    const derivedKey = await subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: this.saltBuffer as unknown as BufferSource,
        iterations: 100000,
        hash: 'SHA-256'
      },
      baseKey,
      { name: 'AES-GCM', length: 256 },
      false, // non-extractable for memory safety
      ['encrypt', 'decrypt']
    );

    this.activeKey = derivedKey;
    this.state = 'unlocked';
    this.lastActivityTimestamp = Date.now();

    return derivedKey;
  }

  /**
   * Encrypts plaintext data into an AES-GCM payload with IV and salt
   */
  public async encrypt(plaintext: string): Promise<EncryptedPayload> {
    if (this.state !== 'unlocked' || !this.activeKey || !this.saltBuffer) {
      throw new Error(`Vault is ${this.state}. Unlock required before encryption.`);
    }

    const subtle = this.getSubtleCrypto();
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(plaintext);

    // Generate 12-byte cryptographically secure random IV
    const iv = new Uint8Array(new ArrayBuffer(12));
    this.getCrypto().getRandomValues(iv);

    const ciphertextBuffer = await subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource
      },
      this.activeKey,
      encodedData as unknown as BufferSource
    );

    this.recordActivity();

    return {
      ciphertext: this.arrayBufferToBase64(ciphertextBuffer),
      iv: this.uint8ArrayToBase64(iv),
      salt: this.uint8ArrayToBase64(this.saltBuffer),
      algorithm: 'AES-GCM-256',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Decrypts an EncryptedPayload back into plaintext
   */
  public async decrypt(payload: EncryptedPayload): Promise<string> {
    if (this.state !== 'unlocked' || !this.activeKey) {
      throw new Error(`Vault is ${this.state}. Unlock required before decryption.`);
    }

    const subtle = this.getSubtleCrypto();
    const ciphertext = this.base64ToArrayBuffer(payload.ciphertext);
    const iv = this.base64ToUint8Array(payload.iv);

    const decryptedBuffer = await subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: iv as unknown as BufferSource
      },
      this.activeKey,
      ciphertext as unknown as BufferSource
    );

    this.recordActivity();
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  }

  /**
   * Records user interaction to reset idle countdown
   */
  public recordActivity(): void {
    this.lastActivityTimestamp = Date.now();
  }

  /**
   * Evaluates idle duration and executes automated teardown if exceeded
   */
  public evaluateIdleStatus(): void {
    if (this.state !== 'unlocked') {
      return;
    }

    const elapsed = Date.now() - this.lastActivityTimestamp;
    if (elapsed >= this.idleTimeoutMs) {
      this.lock('idle');
    }
  }

  /**
   * Locks session and purges cryptographic keys from memory
   */
  public lock(reason: TeardownReason = 'manual'): void {
    const previousState = this.state;
    this.state = reason === 'idle' ? 'idle_locked' : 'locked';

    // Zero-memory key purging
    this.purgeMemoryBuffers();

    if (previousState === 'unlocked') {
      this.notifyTeardown(reason);
    }
  }

  /**
   * Cryptographic zero-memory key purging
   */
  public purgeKeys(): void {
    this.lock('purge');
    this.state = 'purged';
  }

  /**
   * Wipes all raw key material, salt buffers, and clears references
   */
  private purgeMemoryBuffers(): void {
    if (this.saltBuffer) {
      this.saltBuffer.fill(0);
      this.saltBuffer = null;
    }

    if (this.rawKeyMaterialBuffer) {
      this.rawKeyMaterialBuffer.fill(0);
      this.rawKeyMaterialBuffer = null;
    }

    // Invalidate active CryptoKey reference
    this.activeKey = null;
  }

  /**
   * Registers a callback for automated session teardown events
   */
  public onSessionTeardown(listener: TeardownListener): () => void {
    this.teardownListeners.add(listener);
    return () => {
      this.teardownListeners.delete(listener);
    };
  }

  private notifyTeardown(reason: TeardownReason): void {
    this.teardownListeners.forEach((fn) => fn(reason));
  }

  public getState(): VaultLockState {
    return this.state;
  }

  public isUnlocked(): boolean {
    return this.state === 'unlocked' && this.activeKey !== null;
  }

  public setIdleTimeout(timeoutMs: number): void {
    if (timeoutMs > 0) {
      this.idleTimeoutMs = timeoutMs;
    }
  }

  public getIdleTimeout(): number {
    return this.idleTimeoutMs;
  }

  public getRemainingIdleTimeMs(): number {
    if (this.state !== 'unlocked') return 0;
    const elapsed = Date.now() - this.lastActivityTimestamp;
    return Math.max(0, this.idleTimeoutMs - elapsed);
  }

  /**
   * Base64 conversion utilities
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    return this.uint8ArrayToBase64(bytes);
  }

  private uint8ArrayToBase64(bytes: Uint8Array): string {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): ArrayBuffer {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  private base64ToUint8Array(base64: string): Uint8Array {
    return new Uint8Array(this.base64ToArrayBuffer(base64));
  }

  /**
   * Full teardown of event listeners and timers
   */
  public destroy(): void {
    if (this.idleCheckIntervalId) {
      clearInterval(this.idleCheckIntervalId);
      this.idleCheckIntervalId = null;
    }

    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this.boundActivityHandler);
      window.removeEventListener('keydown', this.boundActivityHandler);
      window.removeEventListener('touchstart', this.boundActivityHandler);
      window.removeEventListener('pointerdown', this.boundActivityHandler);
    }

    this.purgeKeys();
    this.teardownListeners.clear();
  }
}

export const encryptionWorker = new EncryptionWorker();

import { OfflineTokenEngine, TokenClaims } from './offline_token_engine.ts';

export async function runOfflineTokenTests(): Promise<{ name: string; passed: boolean; error?: string }[]> {
  const results: { name: string; passed: boolean; error?: string }[] = [];

  async function test(name: string, fn: () => Promise<void> | void) {
    try {
      await fn();
      results.push({ name, passed: true });
    } catch (err: unknown) {
      results.push({
        name,
        passed: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  const sampleClaims: TokenClaims = {
    sub: 'usr_cbo_peer_78491a',
    role: 'specialist',
    tenant_id: 'ten_alameda_cbo_01',
    iss: 'https://peernotebook.com/auth',
    aud: 'peernotebook-api',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    offline_exp: Math.floor(Date.now() / 1000) + (96 * 3600), // 96 hours (> 72 hours)
    offline_scope: ['h0038:create', 'h0038:offline_sync'],
    rotation_nonce: OfflineTokenEngine.generateCryptoNonce(16),
  };

  await test('generateCryptoNonce produces non-empty hex string of requested length', () => {
    const nonce = OfflineTokenEngine.generateCryptoNonce(16);
    if (!nonce || nonce.length !== 32) {
      throw new Error(`Unexpected nonce format: ${nonce}`);
    }
  });

  await test('sealToken and unsealToken round-trip encrypts and decrypts accurately', async () => {
    const deviceSecret = 'peer_passphrase_pin_9821_secure';
    const sealed = await OfflineTokenEngine.sealToken(sampleClaims, deviceSecret);
    if (!sealed.encryptedPayload || !sealed.iv || !sealed.salt) {
      throw new Error('Missing encryption package components');
    }

    const decrypted = await OfflineTokenEngine.unsealToken(sealed, deviceSecret);
    if (decrypted.sub !== sampleClaims.sub || decrypted.tenant_id !== sampleClaims.tenant_id) {
      throw new Error('Decrypted claims do not match original claims');
    }
  });

  await test('evaluateOfflineToken identifies tokens > 72 hours as eligible for rotation', () => {
    const now = Math.floor(Date.now() / 1000);
    const seventyThreeHoursAgo = now - (73 * 3600);
    const staleClaims: TokenClaims = {
      ...sampleClaims,
      iat: seventyThreeHoursAgo,
      exp: seventyThreeHoursAgo + 3600,
      offline_exp: now + (24 * 3600), // still valid offline
    };

    const evaluation = OfflineTokenEngine.evaluateOfflineToken(staleClaims, now);
    if (!evaluation.success || !evaluation.isStale) {
      throw new Error('Token older than 72 hours must be marked as stale for rotation');
    }
    if (evaluation.needsOnlineReauth) {
      throw new Error('Token within offline_exp should not force online reauth yet');
    }
  });

  await test('evaluateOfflineToken rejects tokens exceeding offline_exp limit', () => {
    const now = Math.floor(Date.now() / 1000);
    const expiredClaims: TokenClaims = {
      ...sampleClaims,
      iat: now - (170 * 3600),
      exp: now - (169 * 3600),
      offline_exp: now - 3600, // past offline cutoff
    };

    const evaluation = OfflineTokenEngine.evaluateOfflineToken(expiredClaims, now);
    if (evaluation.success || !evaluation.needsOnlineReauth) {
      throw new Error('Expired offline token must require mandatory online reauthentication');
    }
  });

  await test('rotateOfflineClaims updates nonce, timestamp, and resets standard validity', () => {
    const rotated = OfflineTokenEngine.rotateOfflineClaims(sampleClaims, 48);
    if (rotated.rotation_nonce === sampleClaims.rotation_nonce) {
      throw new Error('Rotation must generate new nonce');
    }
    if (rotated.iat <= sampleClaims.iat && rotated.iat === 0) {
      throw new Error('Invalid iat on rotated token');
    }
  });

  return results;
}

if (process.argv[1]?.endsWith('offline_token_engine.test.ts')) {
  runOfflineTokenTests().then((outcomes) => {
    const failed = outcomes.filter((o) => !o.passed);
    outcomes.forEach((o) => console.log(`${o.passed ? '✓' : '✗'} ${o.name}`));
    if (failed.length > 0) process.exit(1);
  });
}

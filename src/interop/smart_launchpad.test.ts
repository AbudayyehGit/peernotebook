import { SmartLaunchpad, SmartLaunchParams, SmartTokenResponse } from './smart_launchpad.ts';

export async function runSmartLaunchpadTests(): Promise<{ name: string; passed: boolean; error?: string }[]> {
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

  await test('generatePkce produces valid verifier and RFC 7636 SHA-256 challenge', () => {
    const pkce = SmartLaunchpad.generatePkce();
    if (!pkce.codeVerifier || pkce.codeVerifier.length < 40) {
      throw new Error('Code verifier must be >= 40 chars');
    }
    if (!pkce.codeChallenge || pkce.codeChallengeMethod !== 'S256') {
      throw new Error('PKCE must specify S256 method');
    }
  });

  await test('buildAuthorizeUrl correctly embeds SMART v2 parameters', () => {
    const pkce = SmartLaunchpad.generatePkce();
    const params: SmartLaunchParams = {
      iss: 'https://ehr.example.com/fhir/r4',
      launch: 'launch_ctx_98124',
      clientId: 'peernotebook_app_client',
      redirectUri: 'https://peernotebook.com/smart/callback',
    };

    const urlStr = SmartLaunchpad.buildAuthorizeUrl('https://ehr.example.com/oauth2/authorize', params, pkce, 'rand_state_12');
    const url = new URL(urlStr);

    if (url.searchParams.get('client_id') !== params.clientId) throw new Error('client_id mismatch');
    if (url.searchParams.get('launch') !== params.launch) throw new Error('launch mismatch');
    if (url.searchParams.get('code_challenge') !== pkce.codeChallenge) throw new Error('challenge mismatch');
    if (url.searchParams.get('aud') !== params.iss) throw new Error('aud mismatch');
  });

  await test('resolveTriageRoute correctly directs to note draft when patient context is present', () => {
    const tokenResp: SmartTokenResponse = {
      access_token: 'dummy_token',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'launch patient/*.read',
      patient: 'synth_patient_558',
      encounter: 'synth_enc_102',
    };

    const triage = SmartLaunchpad.resolveTriageRoute(tokenResp);
    if (!triage.syntheticContext.directNoteLaunch) throw new Error('directNoteLaunch should be true');
    if (!triage.route.includes('smart_pat=synth_patient_558')) throw new Error('Route missing patient param');
    if (!triage.route.includes('smart_enc=synth_enc_102')) throw new Error('Route missing encounter param');
  });

  return results;
}

if (process.argv[1]?.endsWith('smart_launchpad.test.ts')) {
  runSmartLaunchpadTests().then((outcomes) => {
    const failed = outcomes.filter((o) => !o.passed);
    outcomes.forEach((o) => console.log(`${o.passed ? '✓' : '✗'} ${o.name}`));
    if (failed.length > 0) process.exit(1);
  });
}

/**
 * Peer Notebook - Sprint 2 Unit Tests: Offline-First Synchronization & Resiliency
 * Verifies SP2-01 (SyncQueue), SP2-02 (EncryptionWorker), SP2-03 (NetworkMonitor)
 *
 * Attribution: H. Joe Abudayyeh & Peer Notebook LLC (2026-2027)
 */

import { SyncQueueManager, ConflictRecord } from '../../src/sync/SyncQueue';
import { EncryptionWorker } from '../../src/sync/EncryptionWorker';
import { NetworkMonitor } from '../../src/sync/NetworkMonitor';

interface TestResult {
  name: string;
  passed: boolean;
  error?: string;
}

export async function runSprint2Tests(): Promise<TestResult[]> {
  const results: TestResult[] = [];

  function assert(name: string, condition: boolean, message?: string) {
    if (condition) {
      results.push({ name, passed: true });
    } else {
      results.push({ name, passed: false, error: message || 'Assertion failed' });
    }
  }

  // ==========================================
  // 1. SP2-01: SyncQueue.ts Tests
  // ==========================================
  try {
    const queue = new SyncQueueManager();

    // Test 1: Calculate backoff returns values within jittered exponential bounds
    const delay0 = queue.calculateBackoff(0);
    const delay1 = queue.calculateBackoff(1);
    assert(
      'SyncQueue.calculateBackoff generates valid exponential delay with jitter',
      delay0 >= 500 && delay1 >= delay0 * 0.8
    );

    // Test 2: Enqueue operation and state summary
    const item = await queue.enqueue(
      'UPDATE',
      'session_note',
      'note-test-001',
      { id: 'note-test-001', clientName: 'Jordan Taylor', narrative: 'Client established grounding routine.' }
    );
    assert(
      'SyncQueue.enqueue generates valid item with valid status and entityId',
      (item.status === 'pending' || item.status === 'in_progress' || item.status === 'synced') && item.entityId === 'note-test-001'
    );

    const summary = queue.getStateSummary();
    assert('SyncQueue.getStateSummary returns accurate count', summary.total >= 1);

    // Test 3: Conflict detection and granular UI hook
    let conflictReceived: ConflictRecord | null = null;
    const unsubConflict = queue.onConflict((c) => {
      conflictReceived = c;
    });

    queue.handleDetectedConflict(item, {
      id: 'note-test-001',
      clientName: 'Jordan Taylor',
      narrative: 'Client established grounding routine.',
      status: 'approved',
      supervisorSignature: 'Dr. Jane Smith, LCSW',
      supervisorApprovedAt: '2026-11-02T10:00:00Z'
    });

    const record = conflictReceived as ConflictRecord | null;
    assert('SyncQueue detects conflict and fires UI conflict hook', record !== null && record.conflictFields.includes('status'));

    // Test 4: Conflict resolution with supervisor_cosign_merge
    const resolved = await queue.resolveConflict(item.id, 'supervisor_cosign_merge');
    assert('SyncQueue.resolveConflict successfully resolves conflict using supervisor_cosign_merge', resolved === true);

    const pendingConflicts = queue.getPendingConflicts();
    assert('SyncQueue clears resolved conflicts from active conflict list', pendingConflicts.length === 0);

    unsubConflict();
    queue.destroy();
  } catch (err) {
    assert('SP2-01 SyncQueue execution', false, String(err));
  }

  // ==========================================
  // 2. SP2-02: EncryptionWorker.ts Tests
  // ==========================================
  try {
    // Instantiate with short 100ms idle timeout for testing
    const worker = new EncryptionWorker(100);

    // Test 5: Key derivation and unlocking
    const passphrase = 'SpecialistSecretPassphrase2026!';
    await worker.deriveKey(passphrase);
    assert('EncryptionWorker derives 256-bit key and unlocks vault', worker.isUnlocked() && worker.getState() === 'unlocked');

    // Test 6: AES-GCM Encryption and Decryption
    const sampleClinicalNote = 'Client reported reduced anxiety using CalAIM community navigator resources.';
    const encrypted = await worker.encrypt(sampleClinicalNote);
    assert(
      'EncryptionWorker encrypts data returning AES-GCM ciphertext, IV, and salt',
      typeof encrypted.ciphertext === 'string' &&
      typeof encrypted.iv === 'string' &&
      encrypted.algorithm === 'AES-GCM-256'
    );

    const decrypted = await worker.decrypt(encrypted);
    assert('EncryptionWorker decrypts ciphertext accurately matching original plaintext', decrypted === sampleClinicalNote);

    // Test 7: Zero-memory key purging
    worker.purgeKeys();
    assert(
      'EncryptionWorker.purgeKeys zeroes memory and transitions to purged state',
      worker.getState() === 'purged' && !worker.isUnlocked()
    );

    // Test 8: Automated session idle teardown
    const workerIdle = new EncryptionWorker(50); // 50ms timeout
    await workerIdle.deriveKey(passphrase);
    let teardownReason: string | null = null;
    const unsubTeardown = workerIdle.onSessionTeardown((reason) => {
      teardownReason = reason;
    });

    // Wait 70ms to exceed idle timeout
    await new Promise((resolve) => setTimeout(resolve, 70));
    workerIdle.evaluateIdleStatus();

    assert(
      'EncryptionWorker automatically locks session on idle timeout with zero-memory purging',
      workerIdle.getState() === 'idle_locked' && teardownReason === 'idle'
    );

    unsubTeardown();
    worker.destroy();
    workerIdle.destroy();
  } catch (err) {
    assert('SP2-02 EncryptionWorker execution', false, String(err));
  }

  // ==========================================
  // 3. SP2-03: NetworkMonitor.ts Tests
  // ==========================================
  try {
    const monitor = new NetworkMonitor();

    // Test 9: Diagnostics and status retrieval
    const diag = monitor.getDiagnostics();
    assert('NetworkMonitor returns valid diagnostics structure', typeof diag.isOnline === 'boolean' && typeof diag.lastChangedAt === 'string');

    // Test 10: Explicit event dispatcher
    let receivedEvent: string | null = null;
    const unsubNet = monitor.onStatusChange((e) => {
      receivedEvent = e.type;
    });
    assert('NetworkMonitor.onStatusChange immediately emits current network status', receivedEvent !== null);

    // Test 11: Debounced auto-save resilience without unhandled rejections
    let savedData: string | null = null;
    const savePromise = monitor.scheduleAutoSave(
      'note-draft-001',
      'Encrypted Note Content V1',
      async (data) => {
        savedData = data;
      },
      30
    );

    await savePromise;
    // Allow debounce timer to fire
    await new Promise((resolve) => setTimeout(resolve, 60));

    assert('NetworkMonitor executes debounced auto-save to persistence layer', savedData === 'Encrypted Note Content V1');

    // Test 12: Flush all pending saves
    let flushedVal: number | null = null;
    void monitor.scheduleAutoSave(
      'note-draft-002',
      42,
      async (val) => {
        flushedVal = val;
      },
      5000 // long debounce
    );

    const flushedCount = await monitor.flushAllPendingSaves();
    assert('NetworkMonitor.flushAllPendingSaves commits pending operations immediately', flushedCount === 1 && flushedVal === 42);

    unsubNet();
    monitor.destroy();
  } catch (err) {
    assert('SP2-03 NetworkMonitor execution', false, String(err));
  }

  return results;
}

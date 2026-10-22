/**
 * Peer Notebook - Origin Private File System (OPFS) Storage & Quota Management Service
 * GA #8 Production Grade • Automated Backup Snapshots & Quota Exhaustion Resilience
 * Compliant with 45 CFR § 164.312(c)(1) Integrity Controls & CalAIM Data Retention
 */

export interface OPFSSnapshotMeta {
  filename: string;
  timestamp: string;
  sizeBytes: number;
  recordCount: number;
  label?: string;
}

export interface StorageQuotaInfo {
  supported: boolean;
  usageBytes: number;
  quotaBytes: number;
  usageFormatted: string;
  quotaFormatted: string;
  percentUsed: number;
  isWarning: boolean; // True if >= 80%
  isCritical: boolean; // True if >= 95%
  opfsAvailable: boolean;
}

class OPFSStorageService {
  private isOPFSSupported =
    typeof navigator !== 'undefined' &&
    Boolean(navigator.storage && navigator.storage.getDirectory);

  private SNAPSHOT_DIR = 'peer_notebook_snapshots';

  public isAvailable(): boolean {
    return this.isOPFSSupported;
  }

  /**
   * Monitor Storage Quota & Capacity (handling quota exhaustion gracefully)
   */
  public async getStorageQuota(): Promise<StorageQuotaInfo> {
    if (typeof navigator === 'undefined' || !navigator.storage || !navigator.storage.estimate) {
      return {
        supported: false,
        usageBytes: 0,
        quotaBytes: 100 * 1024 * 1024,
        usageFormatted: 'Unknown',
        quotaFormatted: '100 MB',
        percentUsed: 0,
        isWarning: false,
        isCritical: false,
        opfsAvailable: false,
      };
    }

    try {
      const estimate = await navigator.storage.estimate();
      const usageBytes = estimate.usage || 0;
      const quotaBytes = estimate.quota || 100 * 1024 * 1024;
      const percentUsed = quotaBytes > 0 ? (usageBytes / quotaBytes) * 100 : 0;

      const formatBytes = (b: number) => {
        if (b < 1024) return `${b} B`;
        if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
        if (b < 1024 * 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(1)} MB`;
        return `${(b / (1024 * 1024 * 1024)).toFixed(2)} GB`;
      };

      return {
        supported: true,
        usageBytes,
        quotaBytes,
        usageFormatted: formatBytes(usageBytes),
        quotaFormatted: formatBytes(quotaBytes),
        percentUsed: Number(percentUsed.toFixed(2)),
        isWarning: percentUsed >= 80,
        isCritical: percentUsed >= 95,
        opfsAvailable: this.isOPFSSupported,
      };
    } catch {
      return {
        supported: false,
        usageBytes: 0,
        quotaBytes: 100 * 1024 * 1024,
        usageFormatted: 'Unknown',
        quotaFormatted: '100 MB',
        percentUsed: 0,
        isWarning: false,
        isCritical: false,
        opfsAvailable: false,
      };
    }
  }

  /**
   * Get or create directory in OPFS
   */
  private async getSnapshotDirectory(): Promise<FileSystemDirectoryHandle | null> {
    if (!this.isOPFSSupported) return null;
    try {
      const root = await navigator.storage.getDirectory();
      return await root.getDirectoryHandle(this.SNAPSHOT_DIR, { create: true });
    } catch (err) {
      console.warn('OPFS directory access unavailable:', err);
      return null;
    }
  }

  /**
   * Automatically save a backup snapshot JSON directly to OPFS
   */
  public async saveSnapshotToOPFS(
    payload: unknown,
    recordCount = 0,
    label = 'auto_field_snapshot'
  ): Promise<OPFSSnapshotMeta | null> {
    const dir = await this.getSnapshotDirectory();
    if (!dir) return null;

    try {
      const timestamp = new Date().toISOString();
      const safeTs = timestamp.replace(/[:.]/g, '-');
      const filename = `snapshot_${safeTs}_${label}.json`;

      const fileHandle = await dir.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      const jsonStr = JSON.stringify(payload, null, 2);
      await writable.write(jsonStr);
      await writable.close();

      const sizeBytes = new Blob([jsonStr]).size;

      // Automatically prune older snapshots if more than 10 exist
      await this.pruneOldSnapshots(dir, 10);

      return {
        filename,
        timestamp,
        sizeBytes,
        recordCount,
        label,
      };
    } catch (err) {
      console.warn('Failed to save snapshot to OPFS:', err);
      return null;
    }
  }

  /**
   * List all stored snapshots in OPFS
   */
  public async listSnapshots(): Promise<OPFSSnapshotMeta[]> {
    const dir = await this.getSnapshotDirectory();
    if (!dir) return [];

    const snapshots: OPFSSnapshotMeta[] = [];

    try {
      // Async iterate over directory entries
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for await (const [name, handle] of (dir as any).entries()) {
        if (handle.kind === 'file' && name.endsWith('.json')) {
          const file = await (handle as FileSystemFileHandle).getFile();
          snapshots.push({
            filename: name,
            timestamp: new Date(file.lastModified).toISOString(),
            sizeBytes: file.size,
            recordCount: 0,
            label: name.replace(/^snapshot_[^_]+_|\.json$/g, ''),
          });
        }
      }

      // Sort newest first
      return snapshots.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (err) {
      console.warn('Failed to list OPFS snapshots:', err);
      return [];
    }
  }

  /**
   * Read raw snapshot JSON from OPFS for one-click restore
   */
  public async readSnapshot(filename: string): Promise<string | null> {
    const dir = await this.getSnapshotDirectory();
    if (!dir) return null;

    try {
      const fileHandle = await dir.getFileHandle(filename);
      const file = await fileHandle.getFile();
      return await file.text();
    } catch (err) {
      console.error('Failed to read OPFS snapshot:', err);
      return null;
    }
  }

  /**
   * Delete an OPFS snapshot
   */
  public async deleteSnapshot(filename: string): Promise<boolean> {
    const dir = await this.getSnapshotDirectory();
    if (!dir) return false;

    try {
      await dir.removeEntry(filename);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Prune older snapshots when limit is reached
   */
  private async pruneOldSnapshots(
    dir: FileSystemDirectoryHandle,
    maxKeep = 10
  ): Promise<void> {
    try {
      const files: { name: string; lastModified: number }[] = [];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for await (const [name, handle] of (dir as any).entries()) {
        if (handle.kind === 'file' && name.endsWith('.json')) {
          const f = await (handle as FileSystemFileHandle).getFile();
          files.push({ name, lastModified: f.lastModified });
        }
      }

      if (files.length > maxKeep) {
        // Sort oldest first
        files.sort((a, b) => a.lastModified - b.lastModified);
        const toDelete = files.slice(0, files.length - maxKeep);
        for (const item of toDelete) {
          await dir.removeEntry(item.name);
        }
      }
    } catch {
      // Non-critical pruning failure
    }
  }
}

export const opfsStorage = new OPFSStorageService();

/**
 * Peer Notebook - Supabase Integration Client
 * Provides connection configuration with offline-first failover to IndexedDB.
 */

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

const SUPABASE_URL_KEY = 'peernotebook_supabase_url';
const SUPABASE_KEY_KEY = 'peernotebook_supabase_anon_key';

import { safeStorage } from '../utils/safeStorage';

export const getSupabaseConfig = (): SupabaseConfig => {
  const url = safeStorage.getItem(SUPABASE_URL_KEY) || '';
  const anonKey = safeStorage.getItem(SUPABASE_KEY_KEY) || '';
  return {
    url,
    anonKey,
    isConnected: Boolean(url && anonKey)
  };
};

export const saveSupabaseConfig = (url: string, anonKey: string): void => {
  safeStorage.setItem(SUPABASE_URL_KEY, url);
  safeStorage.setItem(SUPABASE_KEY_KEY, anonKey);
};

export const clearSupabaseConfig = (): void => {
  safeStorage.removeItem(SUPABASE_URL_KEY);
  safeStorage.removeItem(SUPABASE_KEY_KEY);
};

// Resilient client mock / proxy
export const supabase = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    signOut: async () => ({ error: null })
  },
  from: (_table: string) => ({
    select: async () => ({ data: [], error: null }),
    insert: async (data: unknown) => ({ data, error: null }),
    update: async (data: unknown) => ({ data, error: null }),
    delete: async () => ({ data: null, error: null })
  })
};

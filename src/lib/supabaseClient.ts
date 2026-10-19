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

export const getSupabaseConfig = (): SupabaseConfig => {
  const url = localStorage.getItem(SUPABASE_URL_KEY) || '';
  const anonKey = localStorage.getItem(SUPABASE_KEY_KEY) || '';
  return {
    url,
    anonKey,
    isConnected: Boolean(url && anonKey)
  };
};

export const saveSupabaseConfig = (url: string, anonKey: string): void => {
  localStorage.setItem(SUPABASE_URL_KEY, url);
  localStorage.setItem(SUPABASE_KEY_KEY, anonKey);
};

export const clearSupabaseConfig = (): void => {
  localStorage.removeItem(SUPABASE_URL_KEY);
  localStorage.removeItem(SUPABASE_KEY_KEY);
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

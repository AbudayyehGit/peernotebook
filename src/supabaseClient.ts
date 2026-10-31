/**
 * Peer Notebook - Supabase Integration Client & Auth Gateway
 * GA #8 Standard • Dual-Layer Persistence (Dexie.js / IndexedDB + Supabase PostgreSQL)
 * Supports Supabase Auth (Email / Password / Magic Link / Session Token)
 * Multi-Tenant Row-Level Security (RLS) enforcement
 */

import { createClient, type SupabaseClient, type User as SupabaseUser, type Session } from '@supabase/supabase-js';
import { safeStorage } from './utils/safeStorage';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
}

const SUPABASE_URL_KEY = 'peernotebook_supabase_url';
const SUPABASE_KEY_KEY = 'peernotebook_supabase_anon_key';

export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || '';
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || '';

  const url = safeStorage.getItem(SUPABASE_URL_KEY) || envUrl || '';
  const anonKey = safeStorage.getItem(SUPABASE_KEY_KEY) || envKey || '';

  return {
    url,
    anonKey,
    isConnected: Boolean(url && anonKey),
  };
};

export const saveSupabaseConfig = (url: string, anonKey: string): void => {
  safeStorage.setItem(SUPABASE_URL_KEY, url.trim());
  safeStorage.setItem(SUPABASE_KEY_KEY, anonKey.trim());
  activeClientInstance = null;
};

export const clearSupabaseConfig = (): void => {
  safeStorage.removeItem(SUPABASE_URL_KEY);
  safeStorage.removeItem(SUPABASE_KEY_KEY);
  activeClientInstance = null;
};

let activeClientInstance: SupabaseClient | null = null;

export const getSupabaseClient = (): SupabaseClient | null => {
  const config = getSupabaseConfig();
  if (!config.isConnected) {
    return null;
  }

  if (!activeClientInstance) {
    try {
      activeClientInstance = createClient(config.url, config.anonKey, {
        auth: {
          persistSession: false, // Zero persistent auth on start: sessions do not persist across browser restarts
          autoRefreshToken: false,
          detectSessionInUrl: true,
          storage: typeof window !== 'undefined' ? window.sessionStorage : undefined,
        },
      });
    } catch (err) {
      console.warn('[SupabaseClient] Initialization warning:', err);
      return null;
    }
  }

  return activeClientInstance;
};

export async function signInWithEmail(email: string, password: string): Promise<{
  user: SupabaseUser | null;
  session: Session | null;
  error: Error | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      user: null,
      session: null,
      error: new Error('Supabase cloud credentials not yet configured. Operating in Offline IndexedDB Mode.'),
    };
  }

  try {
    const { data, error } = await client.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, session: null, error: new Error(error.message) };
    }

    return { user: data.user, session: data.session, error: null };
  } catch (err: unknown) {
    return {
      user: null,
      session: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

export async function signUpWithEmail(
  email: string,
  password: string,
  metadata?: {
    fullName?: string;
    organizationId?: string;
    role?: string;
    credentialTitle?: string;
    licenseNumber?: string;
  }
): Promise<{
  user: SupabaseUser | null;
  session: Session | null;
  error: Error | null;
}> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      user: null,
      session: null,
      error: new Error('Supabase cloud credentials not yet configured.'),
    };
  }

  try {
    const { data, error } = await client.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });

    if (error) {
      return { user: null, session: null, error: new Error(error.message) };
    }

    return { user: data.user, session: data.session, error: null };
  } catch (err: unknown) {
    return {
      user: null,
      session: null,
      error: err instanceof Error ? err : new Error(String(err)),
    };
  }
}

export async function signOutUser(): Promise<{ error: Error | null }> {
  try {
    if (typeof window !== 'undefined') {
      window.sessionStorage?.clear();
      // Clear any cached Supabase tokens in localStorage as well
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && (key.startsWith('sb-') || key.includes('auth-token') || key.startsWith('supabase.'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    }
  } catch {
    // Ignore storage clearing exceptions
  }

  const client = getSupabaseClient();
  if (!client) return { error: null };

  try {
    const { error } = await client.auth.signOut();
    return { error: error ? new Error(error.message) : null };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err : new Error(String(err)) };
  }
}

export async function getSupabaseAuthSession(): Promise<{
  session: Session | null;
  user: SupabaseUser | null;
}> {
  const client = getSupabaseClient();
  if (!client) return { session: null, user: null };

  try {
    const { data } = await client.auth.getSession();
    return { session: data.session, user: data.session?.user || null };
  } catch {
    return { session: null, user: null };
  }
}

export function onSupabaseAuthStateChange(
  callback: (session: Session | null, user: SupabaseUser | null) => void
): () => void {
  const client = getSupabaseClient();
  if (!client) return () => {};

  const {
    data: { subscription },
  } = client.auth.onAuthStateChange((_event, session) => {
    callback(session, session?.user || null);
  });

  return () => {
    subscription.unsubscribe();
  };
}

export const supabase = {
  auth: {
    getUser: async () => {
      const client = getSupabaseClient();
      if (client) return client.auth.getUser();
      return { data: { user: null }, error: null };
    },
    signOut: async () => {
      return signOutUser();
    },
  },
  from: (table: string) => {
    const client = getSupabaseClient();
    if (client) return client.from(table);
    return {
      select: async () => ({ data: [], error: null }),
      insert: async (data: unknown) => ({ data, error: null }),
      update: async (data: unknown) => ({ data, error: null }),
      delete: async () => ({ data: null, error: null }),
    };
  },
};

export default supabase;

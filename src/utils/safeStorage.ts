/**
 * Peer Notebook - Safe LocalStorage Adapter
 * Prevents DOMException / SecurityError crashes in sandboxed iframes, private browsing,
 * and environments where third-party storage partitioning or cookies are blocked.
 */

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch (err) {
      console.warn(`[SafeStorage] Access denied for getItem(${key}):`, err);
    }
    return null;
  },

  setItem: (key: string, value: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
      }
    } catch (err) {
      console.warn(`[SafeStorage] Access denied for setItem(${key}):`, err);
    }
  },

  removeItem: (key: string): void => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch (err) {
      console.warn(`[SafeStorage] Access denied for removeItem(${key}):`, err);
    }
  }
};

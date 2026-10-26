/**
 * Peer Notebook - Zero-Trust Field Privacy & Client De-Identification Context
 * GA #8 Standard • California CMIA & HIPAA Safe Harbor De-Identification (45 CFR § 164.514)
 * Dynamically masks client real names into secure pseudonyms (e.g. "Client #A849")
 * across active session notes, client rosters, and export previews when working in public spaces.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { safeStorage } from '../utils/safeStorage';

interface PrivacyModeContextType {
  isPrivacyMode: boolean;
  togglePrivacyMode: () => void;
  setPrivacyMode: (val: boolean) => void;
  maskName: (realName?: string, clientIdentifier?: string, clientId?: string) => string;
}

const PrivacyModeContext = createContext<PrivacyModeContextType | undefined>(undefined);

// Deterministic short hash helper for consistent pseudonyms
function generateDeterministicPseudonym(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash |= 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(4, '0').slice(-4);
  return `Client #${hex}`;
}

export const PrivacyModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPrivacyMode, setIsPrivacyModeState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return safeStorage.getItem('peernotebook_field_privacy_mode') === 'true';
    }
    return false;
  });

  const setPrivacyMode = (val: boolean) => {
    setIsPrivacyModeState(val);
    safeStorage.setItem('peernotebook_field_privacy_mode', val ? 'true' : 'false');
  };

  const togglePrivacyMode = () => {
    setPrivacyMode(!isPrivacyMode);
  };

  const maskName = (realName?: string, clientIdentifier?: string, clientId?: string): string => {
    if (!isPrivacyMode) {
      return realName || 'Peer Client';
    }

    if (clientIdentifier) {
      const clean = clientIdentifier.replace(/^PN-/, '').trim();
      if (clean) return `Client #${clean}`;
      return `Client #${clientIdentifier}`;
    }

    if (clientId) {
      const cleanId = clientId.replace(/[^a-zA-Z0-9]/g, '').slice(-4).toUpperCase();
      return `Client #${cleanId}`;
    }

    if (realName) {
      return generateDeterministicPseudonym(realName);
    }

    return 'Client #A849';
  };

  return (
    <PrivacyModeContext.Provider
      value={{
        isPrivacyMode,
        togglePrivacyMode,
        setPrivacyMode,
        maskName
      }}
    >
      {children}
    </PrivacyModeContext.Provider>
  );
};

export const usePrivacyMode = (): PrivacyModeContextType => {
  const context = useContext(PrivacyModeContext);
  if (!context) {
    throw new Error('usePrivacyMode must be used within a PrivacyModeProvider');
  }
  return context;
};

/**
 * Peer Notebook - Authentication & RBAC Context
 * Manages active user sessions, agency multi-tenancy, and role-based permissions
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { peerNotebookDB, User, Organization, UserRole } from '../db/peerNotebookDatabase';
import { AuditLogger } from '../services/auditLogger';
import { safeStorage } from '../utils/safeStorage';

interface AuthContextType {
  currentUser: User | null;
  currentOrg: Organization | null;
  allUsers: User[];
  allOrgs: Organization[];
  role: UserRole;
  switchUser: (userId: string) => Promise<void>;
  switchOrg: (orgId: string) => Promise<void>;
  canSignNotes: boolean;
  canApproveNotes: boolean;
  canViewAuditLogs: boolean;
  canManageAgency: boolean;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEFAULT_FALLBACK_ORG: Organization = {
  id: 'org-calaim-01',
  name: 'Bay Area Peer Recovery Collaborative (CalAIM)',
  npi: '1982019482',
  medicaidProviderId: 'CA-MC-948102',
  countyCode: '38-San Francisco',
  calaimContractActive: true,
  baaSignedAt: '2026-01-10T08:00:00Z',
  baaVersion: 'v2.4-GA8-CalAIM'
};

export const DEFAULT_FALLBACK_USER: User = {
  id: 'user-cpss-01',
  organizationId: 'org-calaim-01',
  email: 'alex.rivera@alamedapeer.org',
  fullName: 'Alex Rivera, CPSS-CA',
  credentialTitle: 'Certified Peer Support Specialist (CalMHSA / CalAIM)',
  licenseNumber: 'CA-CPSS-2024-9182',
  npi: '1829102938',
  role: 'peer_specialist',
  isActive: true
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(DEFAULT_FALLBACK_USER);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(DEFAULT_FALLBACK_ORG);
  const [allUsers, setAllUsers] = useState<User[]>([DEFAULT_FALLBACK_USER]);
  const [allOrgs, setAllOrgs] = useState<Organization[]>([DEFAULT_FALLBACK_ORG]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const users = await peerNotebookDB.getAllUsers();
        const orgs = await peerNotebookDB.getAllOrganizations();
        if (!mounted) return;
        if (users && users.length > 0) {
          setAllUsers(users);
          const savedUserId = safeStorage.getItem('peernotebook_active_user_id');
          const matchedUser = users.find(u => u.id === savedUserId) || users[0];
          setCurrentUser(matchedUser);

          if (orgs && orgs.length > 0) {
            setAllOrgs(orgs);
            const matchedOrg = orgs.find(o => o.id === matchedUser.organizationId) || orgs[0];
            setCurrentOrg(matchedOrg);
          }
        }
      } catch (err) {
        console.warn('[AuthContext] IndexedDB initial check:', err);
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const switchUser = async (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    setCurrentUser(user);
    safeStorage.setItem('peernotebook_active_user_id', user.id);

    const org = allOrgs.find(o => o.id === user.organizationId) || currentOrg;
    setCurrentOrg(org);

    if (org) {
      await AuditLogger.log({
        organizationId: org.id,
        actorId: user.id,
        actorName: user.fullName,
        actorRole: user.role,
        action: 'VIEW_CLIENT',
        entityType: 'auth',
        entityId: user.id,
        details: { action: 'SWITCH_USER_PROFILE', role: user.role }
      });
    }
  };

  const switchOrg = async (orgId: string) => {
    const org = allOrgs.find(o => o.id === orgId);
    if (!org) return;

    setCurrentOrg(org);
    safeStorage.setItem('peernotebook_active_org_id', org.id);

    // If current user is not in this org, switch to first user of this org
    const userInOrg = allUsers.find(u => u.organizationId === orgId);
    if (userInOrg && currentUser?.organizationId !== orgId) {
      setCurrentUser(userInOrg);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    safeStorage.removeItem('peernotebook_active_user_id');
  };

  const role: UserRole = currentUser?.role || 'peer_specialist';
  const canSignNotes = role === 'peer_specialist' || role === 'supervisor';
  const canApproveNotes = role === 'supervisor' || role === 'admin';
  const canViewAuditLogs = role === 'admin' || role === 'supervisor' || role === 'compliance_officer';
  const canManageAgency = role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentOrg,
        allUsers,
        allOrgs,
        role,
        switchUser,
        switchOrg,
        canSignNotes,
        canApproveNotes,
        canViewAuditLogs,
        canManageAgency,
        logout,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      currentUser: DEFAULT_FALLBACK_USER,
      currentOrg: DEFAULT_FALLBACK_ORG,
      allUsers: [DEFAULT_FALLBACK_USER],
      allOrgs: [DEFAULT_FALLBACK_ORG],
      role: 'peer_specialist',
      switchUser: async () => {},
      switchOrg: async () => {},
      canSignNotes: true,
      canApproveNotes: false,
      canViewAuditLogs: false,
      canManageAgency: false,
      logout: () => {},
      isLoading: false
    };
  }
  return context;
};

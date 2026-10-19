/**
 * Peer Notebook - Authentication & RBAC Context
 * Manages active user sessions, agency multi-tenancy, and role-based permissions
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { peerNotebookDB, User, Organization, UserRole } from '../db/peerNotebookDatabase';
import { AuditLogger } from '../services/auditLogger';

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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allOrgs, setAllOrgs] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const users = await peerNotebookDB.getAllUsers();
        const orgs = await peerNotebookDB.getAllOrganizations();
        setAllUsers(users);
        setAllOrgs(orgs);

        const savedUserId = localStorage.getItem('peernotebook_active_user_id');
        const defaultUser = users.find(u => u.id === savedUserId) || users[0] || null;
        setCurrentUser(defaultUser);

        if (defaultUser) {
          const org = orgs.find(o => o.id === defaultUser.organizationId) || orgs[0] || null;
          setCurrentOrg(org);
        }
      } catch (err) {
        console.error('Failed to init auth context:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const switchUser = async (userId: string) => {
    const user = allUsers.find(u => u.id === userId);
    if (!user) return;

    setCurrentUser(user);
    localStorage.setItem('peernotebook_active_user_id', user.id);

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
    localStorage.setItem('peernotebook_active_org_id', org.id);

    // If current user is not in this org, switch to first user of this org
    const userInOrg = allUsers.find(u => u.organizationId === orgId);
    if (userInOrg && currentUser?.organizationId !== orgId) {
      setCurrentUser(userInOrg);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('peernotebook_active_user_id');
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

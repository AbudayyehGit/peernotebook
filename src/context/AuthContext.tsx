/**
 * Peer Notebook - Authentication & RBAC Context
 * Manages active user sessions, agency multi-tenancy, and role-based permissions
 * Connected to Supabase Auth Gateway & IndexedDB Dexie Store
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { peerNotebookDB, User, Organization, UserRole } from '../db/peerNotebookDatabase';
import { AuditLogger } from '../services/auditLogger';
import { safeStorage } from '../utils/safeStorage';
import {
  signInWithEmail,
  signUpWithEmail,
  signOutUser,
  getSupabaseAuthSession,
  onSupabaseAuthStateChange,
  getSupabaseClient
} from '../lib/supabaseClient';

interface AuthContextType {
  currentUser: User | null;
  currentOrg: Organization | null;
  allUsers: User[];
  allOrgs: Organization[];
  role: UserRole;
  isContractor1099: boolean;
  isRestrictedToOwnData: boolean;
  switchUser: (userId: string) => Promise<void>;
  switchOrg: (orgId: string) => Promise<void>;
  createUser: (userData: Partial<User>) => Promise<User>;
  updateUser: (userData: User) => Promise<User>;
  deleteUser: (userId: string) => Promise<void>;
  createOrg: (orgData: Partial<Organization>) => Promise<Organization>;
  updateOrg: (orgData: Organization) => Promise<Organization>;
  deleteOrg: (orgId: string) => Promise<void>;
  updateContractorSettings: (settings: {
    isContractor1099: boolean;
    contractorTaxId?: string;
    hourlyContractRate?: number;
    mileageReimbursementRate?: number;
    contractAgencyName?: string;
  }) => Promise<void>;
  updateUserBilling: (billing: Partial<Pick<User, 'subscriptionStatus' | 'subscriptionTier' | 'stripeCustomerId' | 'stripeSubscriptionId' | 'stripePriceId' | 'billingInterval' | 'trialEndsAt' | 'currentPeriodEnd' | 'cancelAtPeriodEnd'>>) => Promise<void>;
  hasActiveAccess: boolean;
  isTrialActive: boolean;
  trialDaysRemaining: number;
  loginWithSupabase: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  registerWithSupabase: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ success: boolean; error?: string }>;
  canSignNotes: boolean;
  canApproveNotes: boolean;
  canViewAuditLogs: boolean;
  canManageAgency: boolean;
  canAccessTelemetry: boolean;
  isSuperAdmin: boolean;
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
  baaVersion: 'v2.4-GA8-CalAIM',
  contactEmail: 'compliance@bayareapeer.org',
  contactPhone: '(415) 555-0199',
  contractType: 'CBO Partner',
  allocatedMonthlyUnits: 1200
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
  isActive: true,
  isContractor1099: false,
  contractorTaxId: 'EIN-94-3891029',
  contractAgencyName: 'Bay Area Peer Recovery Collaborative',
  hourlyContractRate: 48,
  mileageReimbursementRate: 0.67,
  trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  subscriptionStatus: 'trialing',
  subscriptionTier: 'founding_specialist',
  billingInterval: 'monthly',
  currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  cancelAtPeriodEnd: false
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Zero Persistent Auth on Start: Always initializes with zero authenticated users (null)
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(DEFAULT_FALLBACK_ORG);
  const [allUsers, setAllUsers] = useState<User[]>([DEFAULT_FALLBACK_USER]);
  const [allOrgs, setAllOrgs] = useState<Organization[]>([DEFAULT_FALLBACK_ORG]);
  const [isLoading, setIsLoading] = useState(false);

  const refreshUsersAndOrgs = useCallback(async () => {
    try {
      const users = await peerNotebookDB.getAllUsers();
      const orgs = await peerNotebookDB.getAllOrganizations();

      if (users && users.length > 0) {
        setAllUsers(users);
      }
      if (orgs && orgs.length > 0) {
        setAllOrgs(orgs);
        setCurrentOrg(orgs[0]);
      }
    } catch (err) {
      console.warn('[AuthContext] refreshUsersAndOrgs:', err);
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // Zero Persistent Auth on Start: enforce clean slate upon app initialization
    signOutUser().catch(() => {});
    safeStorage.removeItem('peernotebook_active_user_id');

    const initializeAuth = async () => {
      await refreshUsersAndOrgs();
    };

    initializeAuth();

    // Auto-Logout on Close / Tab Termination: clear local auth tokens and active session states
    const handleSessionDestruction = () => {
      safeStorage.removeItem('peernotebook_active_user_id');
      signOutUser().catch(() => {});
    };

    window.addEventListener('beforeunload', handleSessionDestruction);
    window.addEventListener('pagehide', handleSessionDestruction);

    // Listen to explicit Supabase Auth state transitions
    const unsubscribeSb = onSupabaseAuthStateChange(async (_session, sbUser) => {
      if (sbUser && mounted) {
        const dbUsers = await peerNotebookDB.getAllUsers();
        const existing = dbUsers.find(u => u.email === sbUser.email);
        if (existing) {
          setCurrentUser(existing);
          safeStorage.setItem('peernotebook_active_user_id', existing.id);
        }
      }
    });

    return () => {
      mounted = false;
      window.removeEventListener('beforeunload', handleSessionDestruction);
      window.removeEventListener('pagehide', handleSessionDestruction);
      unsubscribeSb();
      handleSessionDestruction();
    };
  }, [refreshUsersAndOrgs]);

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

    const userInOrg = allUsers.find(u => u.organizationId === orgId);
    if (userInOrg && currentUser?.organizationId !== orgId) {
      setCurrentUser(userInOrg);
    }
  };

  const createUser = async (userData: Partial<User>): Promise<User> => {
    const newUser: User = {
      id: userData.id || `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      organizationId: userData.organizationId || currentOrg?.id || 'org-calaim-01',
      email: userData.email || '',
      fullName: userData.fullName || 'New Specialist',
      credentialTitle: userData.credentialTitle || 'Certified Peer Support Specialist (CPSS-CA)',
      licenseNumber: userData.licenseNumber || `CA-CPSS-${Date.now().toString().slice(-4)}`,
      npi: userData.npi || '',
      role: userData.role || 'peer_specialist',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      isContractor1099: userData.isContractor1099 || false,
      contractorTaxId: userData.contractorTaxId || '',
      contractAgencyName: userData.contractAgencyName || currentOrg?.name || '',
      hourlyContractRate: userData.hourlyContractRate || 45,
      mileageReimbursementRate: userData.mileageReimbursementRate || 0.67
    };

    await peerNotebookDB.saveUser(newUser);

    await AuditLogger.log({
      organizationId: newUser.organizationId,
      actorId: currentUser?.id || 'admin',
      actorName: currentUser?.fullName || 'Administrator',
      actorRole: currentUser?.role || 'admin',
      action: 'CREATE_CLIENT',
      entityType: 'auth',
      entityId: newUser.id,
      details: { action: 'PROVISION_USER_ACCOUNT', email: newUser.email, role: newUser.role }
    });

    await refreshUsersAndOrgs();
    return newUser;
  };

  const updateUser = async (userData: User): Promise<User> => {
    await peerNotebookDB.saveUser(userData);

    if (currentUser?.id === userData.id) {
      setCurrentUser(userData);
    }

    await AuditLogger.log({
      organizationId: userData.organizationId,
      actorId: currentUser?.id || 'admin',
      actorName: currentUser?.fullName || 'Administrator',
      actorRole: currentUser?.role || 'admin',
      action: 'UPDATE_CLIENT',
      entityType: 'auth',
      entityId: userData.id,
      details: { action: 'UPDATE_USER_ACCOUNT', email: userData.email, role: userData.role }
    });

    await refreshUsersAndOrgs();
    return userData;
  };

  const deleteUser = async (userId: string): Promise<void> => {
    await peerNotebookDB.deleteUser(userId);

    await AuditLogger.log({
      organizationId: currentOrg?.id || 'org-calaim-01',
      actorId: currentUser?.id || 'admin',
      actorName: currentUser?.fullName || 'Administrator',
      actorRole: currentUser?.role || 'admin',
      action: 'PURGE_CACHE',
      entityType: 'auth',
      entityId: userId,
      details: { action: 'DEACTIVATE_USER_ACCOUNT', userId }
    });

    await refreshUsersAndOrgs();
  };

  const createOrg = async (orgData: Partial<Organization>): Promise<Organization> => {
    const newOrg: Organization = {
      id: orgData.id || `org-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: orgData.name || 'New CBO Partner Agency',
      npi: orgData.npi || '1092837465',
      medicaidProviderId: orgData.medicaidProviderId || 'CA-MC-900000',
      countyCode: orgData.countyCode || '01-Alameda',
      calaimContractActive: orgData.calaimContractActive !== undefined ? orgData.calaimContractActive : true,
      baaSignedAt: orgData.baaSignedAt || new Date().toISOString(),
      baaVersion: orgData.baaVersion || 'v2.4-GA8-CalAIM',
      contactEmail: orgData.contactEmail || 'admin@cbopartner.org',
      contactPhone: orgData.contactPhone || '(510) 555-0100',
      contractType: orgData.contractType || 'CBO Partner',
      allocatedMonthlyUnits: orgData.allocatedMonthlyUnits || 1000
    };

    await peerNotebookDB.saveOrganization(newOrg);

    await AuditLogger.log({
      organizationId: newOrg.id,
      actorId: currentUser?.id || 'admin',
      actorName: currentUser?.fullName || 'Administrator',
      actorRole: currentUser?.role || 'admin',
      action: 'CREATE_CLIENT',
      entityType: 'auth',
      entityId: newOrg.id,
      details: { action: 'PROVISION_ORGANIZATION', name: newOrg.name, npi: newOrg.npi }
    });

    await refreshUsersAndOrgs();
    return newOrg;
  };

  const updateOrg = async (orgData: Organization): Promise<Organization> => {
    await peerNotebookDB.saveOrganization(orgData);

    if (currentOrg?.id === orgData.id) {
      setCurrentOrg(orgData);
    }

    await AuditLogger.log({
      organizationId: orgData.id,
      actorId: currentUser?.id || 'admin',
      actorName: currentUser?.fullName || 'Administrator',
      actorRole: currentUser?.role || 'admin',
      action: 'UPDATE_CLIENT',
      entityType: 'auth',
      entityId: orgData.id,
      details: { action: 'UPDATE_ORGANIZATION', name: orgData.name, allocatedMonthlyUnits: orgData.allocatedMonthlyUnits }
    });

    await refreshUsersAndOrgs();
    return orgData;
  };

  const deleteOrg = async (orgId: string): Promise<void> => {
    await peerNotebookDB.deleteOrganization(orgId);

    await AuditLogger.log({
      organizationId: orgId,
      actorId: currentUser?.id || 'admin',
      actorName: currentUser?.fullName || 'Administrator',
      actorRole: currentUser?.role || 'admin',
      action: 'PURGE_CACHE',
      entityType: 'auth',
      entityId: orgId,
      details: { action: 'DEACTIVATE_ORGANIZATION', orgId }
    });

    await refreshUsersAndOrgs();
  };

  const updateContractorSettings = async (settings: {
    isContractor1099: boolean;
    contractorTaxId?: string;
    hourlyContractRate?: number;
    mileageReimbursementRate?: number;
    contractAgencyName?: string;
  }) => {
    if (!currentUser) return;
    const updated: User = {
      ...currentUser,
      isContractor1099: settings.isContractor1099,
      contractorTaxId: settings.contractorTaxId ?? currentUser.contractorTaxId,
      hourlyContractRate: settings.hourlyContractRate ?? currentUser.hourlyContractRate,
      mileageReimbursementRate: settings.mileageReimbursementRate ?? currentUser.mileageReimbursementRate,
      contractAgencyName: settings.contractAgencyName ?? currentUser.contractAgencyName
    };
    await updateUser(updated);

    await AuditLogger.log({
      organizationId: currentUser.organizationId,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'UPDATE_CLIENT',
      entityType: 'auth',
      entityId: currentUser.id,
      details: { action: 'UPDATE_CONTRACTOR_SETTINGS', isContractor1099: settings.isContractor1099, hourlyRate: settings.hourlyContractRate }
    });
  };

  const loginWithSupabase = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { user: sbUser, error } = await signInWithEmail(email, password);
      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }
      if (sbUser) {
        // Sync or retrieve matching user from IndexedDB
        const users = await peerNotebookDB.getAllUsers();
        let matched = users.find(u => u.email === sbUser.email);
        if (!matched) {
          // Provision local record for Supabase authenticated user
          matched = await createUser({
            id: sbUser.id,
            email: sbUser.email || email,
            fullName: (sbUser.user_metadata?.fullName as string) || email.split('@')[0],
            role: (sbUser.user_metadata?.role as UserRole) || 'peer_specialist',
            organizationId: currentOrg?.id || 'org-calaim-01'
          });
        }
        setCurrentUser(matched);
        safeStorage.setItem('peernotebook_active_user_id', matched.id);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, error: 'Authentication failed' };
    } catch (err: unknown) {
      setIsLoading(false);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  };

  const registerWithSupabase = async (
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      const { user: sbUser, error } = await signUpWithEmail(email, password, metadata as never);
      if (error) {
        setIsLoading(false);
        return { success: false, error: error.message };
      }
      if (sbUser) {
        const newUser = await createUser({
          id: sbUser.id,
          email,
          fullName: (metadata?.fullName as string) || email.split('@')[0],
          role: (metadata?.role as UserRole) || 'peer_specialist',
          organizationId: (metadata?.organizationId as string) || currentOrg?.id || 'org-calaim-01'
        });
        setCurrentUser(newUser);
        safeStorage.setItem('peernotebook_active_user_id', newUser.id);
        setIsLoading(false);
        return { success: true };
      }
      setIsLoading(false);
      return { success: false, error: 'Registration failed' };
    } catch (err: unknown) {
      setIsLoading(false);
      return { success: false, error: err instanceof Error ? err.message : String(err) };
    }
  };

  const logout = () => {
    signOutUser();
    setCurrentUser(null);
    safeStorage.removeItem('peernotebook_active_user_id');
  };

  const role: UserRole = currentUser?.role || 'peer_specialist';
  const updateUserBilling = async (
    billing: Partial<Pick<User, 'subscriptionStatus' | 'subscriptionTier' | 'stripeCustomerId' | 'stripeSubscriptionId' | 'stripePriceId' | 'billingInterval' | 'trialEndsAt' | 'currentPeriodEnd' | 'cancelAtPeriodEnd'>>
  ) => {
    if (!currentUser) return;
    const updated = await peerNotebookDB.updateUserBilling(currentUser.id, billing);
    if (updated) {
      setCurrentUser(updated);
      setAllUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
    }

    // Direct Supabase PostgreSQL user_profiles cloud sync
    try {
      const client = getSupabaseClient();
      if (client && currentUser) {
        await client.from('user_profiles').update({
          subscription_status: billing.subscriptionStatus,
          subscription_tier: billing.subscriptionTier,
          stripe_customer_id: billing.stripeCustomerId,
          stripe_subscription_id: billing.stripeSubscriptionId,
          billing_interval: billing.billingInterval,
          trial_ends_at: billing.trialEndsAt,
          current_period_end: billing.currentPeriodEnd,
          cancel_at_period_end: billing.cancelAtPeriodEnd,
          updated_at: new Date().toISOString()
        }).eq('id', currentUser.id);
      }
    } catch (cloudErr) {
      console.warn('[AuthContext] Supabase cloud user_profiles sync deferred:', cloudErr);
    }

    await AuditLogger.log({
      organizationId: currentUser.organizationId,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'UPDATE_CLIENT',
      entityType: 'auth',
      entityId: currentUser.id,
      details: { action: 'UPDATE_BILLING_SUBSCRIPTION', status: billing.subscriptionStatus, tier: billing.subscriptionTier }
    });
  };

  const isSuperAdmin = role === 'super_admin';
  const canSignNotes = role === 'peer_specialist';
  const canApproveNotes = role === 'supervisor' || role === 'super_admin';
  const canViewAuditLogs = role === 'admin' || role === 'supervisor' || role === 'compliance_officer' || role === 'super_admin';
  const canManageAgency = role === 'admin' || role === 'super_admin';
  const canAccessTelemetry = role === 'super_admin';
  const isContractor1099 = Boolean(currentUser?.isContractor1099);
  // Peer Specialists are restricted to their personal clients and notes per HIPAA minimum necessary & RLS
  const isRestrictedToOwnData = role === 'peer_specialist';

  // Stripe Subscription & 30-Day Free Trial Gating Calculations
  const trialEndsTimestamp = currentUser?.trialEndsAt ? new Date(currentUser.trialEndsAt).getTime() : Date.now() + 30 * 24 * 60 * 60 * 1000;
  const nowTimestamp = Date.now();
  const trialDaysRemaining = Math.max(0, Math.ceil((trialEndsTimestamp - nowTimestamp) / (24 * 60 * 60 * 1000)));
  const isTrialActive = (currentUser?.subscriptionStatus === 'trialing' || !currentUser?.subscriptionStatus) && trialDaysRemaining > 0;
  const isSubscriptionActive = currentUser?.subscriptionStatus === 'active' || currentUser?.subscriptionStatus === 'active_subscriber';
  const hasActiveAccess = currentUser ? (isTrialActive || isSubscriptionActive || role === 'admin' || role === 'super_admin') : false;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentOrg,
        allUsers,
        allOrgs,
        role,
        isContractor1099,
        isRestrictedToOwnData,
        switchUser,
        switchOrg,
        createUser,
        updateUser,
        deleteUser,
        createOrg,
        updateOrg,
        deleteOrg,
        updateContractorSettings,
        updateUserBilling,
        hasActiveAccess,
        isTrialActive,
        trialDaysRemaining,
        loginWithSupabase,
        registerWithSupabase,
        canSignNotes,
        canApproveNotes,
        canViewAuditLogs,
        canManageAgency,
        canAccessTelemetry,
        isSuperAdmin,
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
      isContractor1099: false,
      isRestrictedToOwnData: true,
      switchUser: async () => {},
      switchOrg: async () => {},
      createUser: async () => DEFAULT_FALLBACK_USER,
      updateUser: async () => DEFAULT_FALLBACK_USER,
      deleteUser: async () => {},
      createOrg: async () => DEFAULT_FALLBACK_ORG,
      updateOrg: async () => DEFAULT_FALLBACK_ORG,
      deleteOrg: async () => {},
      updateContractorSettings: async () => {},
      updateUserBilling: async () => {},
      hasActiveAccess: true,
      isTrialActive: true,
      trialDaysRemaining: 14,
      loginWithSupabase: async () => ({ success: false }),
      registerWithSupabase: async () => ({ success: false }),
      canSignNotes: true,
      canApproveNotes: false,
      canViewAuditLogs: false,
      canManageAgency: false,
      canAccessTelemetry: false,
      isSuperAdmin: false,
      logout: () => {},
      isLoading: false
    };
  }
  return context;
};

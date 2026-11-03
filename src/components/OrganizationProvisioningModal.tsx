/**
 * Peer Notebook - CBO Organization Provisioning & Tenant Administration Modal
 * Engineering Standard: H. Joe Abudayyeh Systems Production Standards
 * Conforms to: CalAIM Multi-Tenant Isolation, 45 CFR § 164.312 HIPAA Access Controls
 *
 * Exclusively restricted to Super Administrator (`super_admin`) role.
 * Provisions:
 *  1. CBO Organization Tenant Profile (Legal entity, California County, NPI, Medi-Cal ID)
 *  2. CalAIM Capacity Limits (Monthly H0038 unit allocation, staff seats, caseload caps)
 *  3. Initial Tenant Administrator Role Assignment (New administrator account or existing staff assignment)
 *  4. Statutory BAA Execution & Chained SHA-256 Audit Trail
 *
 * Copyright © 2026-2027 H. Joe Abudayyeh & Peer Notebook LLC. All Rights Reserved.
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Organization,
  User,
  UserRole,
  EmploymentType
} from '../db/peerNotebookDatabase';
import { AuditTrail } from '../services/AuditTrail';
import { useFocusTrap, announceToScreenReader, getModalAriaProps } from '../utils/FocusManagement';
import {
  Building2,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserPlus,
  Users,
  CheckCircle2,
  DollarSign,
  AlertTriangle,
  X,
  Sparkles,
  Layers,
  ChevronRight,
  ChevronLeft,
  Key,
  Lock,
  BadgeCheck,
  Briefcase,
  FileCheck2,
  Scale
} from 'lucide-react';

export interface OrganizationProvisioningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newOrg: Organization, adminUser?: User) => void;
}

const CALIFORNIA_COUNTIES = [
  { code: '01-Alameda', name: '01 - Alameda County' },
  { code: '04-Butte', name: '04 - Butte County' },
  { code: '07-Contra Costa', name: '07 - Contra Costa County' },
  { code: '10-Fresno', name: '10 - Fresno County' },
  { code: '12-Humboldt', name: '12 - Humboldt County' },
  { code: '15-Kern', name: '15 - Kern County' },
  { code: '19-Los Angeles', name: '19 - Los Angeles County' },
  { code: '27-Monterey', name: '27 - Monterey County' },
  { code: '30-Orange', name: '30 - Orange County' },
  { code: '33-Riverside', name: '33 - Riverside County' },
  { code: '34-Sacramento', name: '34 - Sacramento County' },
  { code: '36-San Bernardino', name: '36 - San Bernardino County' },
  { code: '37-San Diego', name: '37 - San Diego County' },
  { code: '38-San Francisco', name: '38 - San Francisco County' },
  { code: '39-San Joaquin', name: '39 - San Joaquin County' },
  { code: '41-San Mateo', name: '41 - San Mateo County' },
  { code: '43-Santa Clara', name: '43 - Santa Clara County' },
  { code: '44-Santa Cruz', name: '44 - Santa Cruz County' },
  { code: '48-Solano', name: '48 - Solano County' },
  { code: '49-Sonoma', name: '49 - Sonoma County' },
  { code: '50-Stanislaus', name: '50 - Stanislaus County' },
  { code: '54-Tulare', name: '54 - Tulare County' },
  { code: '56-Ventura', name: '56 - Ventura County' },
  { code: '57-Yolo', name: '57 - Yolo County' }
];

export const OrganizationProvisioningModal: React.FC<OrganizationProvisioningModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser, role, createOrg, createUser, updateUser, allUsers } = useAuth();

  // Wizard Step Navigation
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Organization Profile
  const [orgName, setOrgName] = useState('');
  const [countyCode, setCountyCode] = useState('01-Alameda');
  const [npi, setNpi] = useState('');
  const [medicaidProviderId, setMedicaidProviderId] = useState('');
  const [contractType, setContractType] = useState<Organization['contractType']>('CBO Partner');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  // Step 2: Capacity Limits
  const [allocatedMonthlyUnits, setAllocatedMonthlyUnits] = useState<number>(1200);
  const [maxSpecialistSeats, setMaxSpecialistSeats] = useState<number>(10);
  const [maxActiveClients, setMaxActiveClients] = useState<number>(150);
  const [dailyUnitCapPerSpecialist, setDailyUnitCapPerSpecialist] = useState<number>(24);
  const [calaimContractActive, setCalaimContractActive] = useState<boolean>(true);

  // Step 3: Administrator Assignment
  const [adminMode, setAdminMode] = useState<'create_new' | 'assign_existing'>('create_new');
  // New Admin Fields
  const [adminFullName, setAdminFullName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminRole, setAdminRole] = useState<UserRole>('admin');
  const [adminCredentialTitle, setAdminCredentialTitle] = useState('CPSS-CA Lead Supervisor / Agency Administrator');
  const [adminLicenseNumber, setAdminLicenseNumber] = useState('');
  const [adminNpi, setAdminNpi] = useState('');
  const [adminEmploymentType, setAdminEmploymentType] = useState<EmploymentType>('w2_employee');
  const [tempAccessKey] = useState<string>(() => `PN-CBO-${Math.random().toString(36).substring(2, 8).toUpperCase()}`);
  // Existing Admin Selection
  const [selectedExistingUserId, setSelectedExistingUserId] = useState<string>('');

  // Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Focus trap for modal accessibility
  const modalRef = useFocusTrap(isOpen, onClose);

  // Calculate estimated monthly revenue based on standard $32.50/unit benchmark
  const monthlyRevenueBenchmark = useMemo(() => {
    return (allocatedMonthlyUnits * 32.5).toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    });
  }, [allocatedMonthlyUnits]);

  if (!isOpen) return null;

  // SUPER ADMIN SECURITY GATE
  if (role !== 'super_admin') {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      >
        <div
          ref={modalRef}
          {...getModalAriaProps('org-provision-denied-title', 'org-provision-denied-desc')}
          className="bg-white border-2 border-red-300 rounded-3xl max-w-md w-full p-6 shadow-2xl text-center space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <h3 id="org-provision-denied-title" className="text-lg font-bold text-slate-900">
              Access Restricted: Super Administrator Required
            </h3>
            <p id="org-provision-denied-desc" className="text-xs text-slate-600 mt-1">
              Organization tenant provisioning is restricted to authenticated users holding the{' '}
              <span className="font-mono font-bold text-red-700">super_admin</span> role under CalAIM multi-tenant governance.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-full min-h-[44px] py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
          >
            Close Dialog
          </button>
        </div>
      </div>
    );
  }

  // Step 1 Validation
  const isStep1Valid = () => {
    return (
      orgName.trim().length >= 3 &&
      npi.trim().length === 10 &&
      medicaidProviderId.trim().length >= 4
    );
  };

  // Step 2 Validation
  const isStep2Valid = () => {
    return (
      allocatedMonthlyUnits >= 50 &&
      maxSpecialistSeats >= 1 &&
      maxActiveClients >= 5 &&
      dailyUnitCapPerSpecialist >= 4
    );
  };

  // Step 3 Validation
  const isStep3Valid = () => {
    if (adminMode === 'create_new') {
      return (
        adminFullName.trim().length >= 2 &&
        adminEmail.trim().includes('@') &&
        adminEmail.trim().includes('.')
      );
    }
    return Boolean(selectedExistingUserId);
  };

  // Handler for Final Provisioning Submission
  const handleProvisionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep1Valid() || !isStep2Valid() || !isStep3Valid()) {
      setErrorMessage('Please ensure all required fields are valid before provisioning.');
      announceToScreenReader('Provisioning blocked: Please correct invalid form fields', 'assertive');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    announceToScreenReader('Provisioning CBO tenant and binding administrative role');

    try {
      // 1. Create Organization Record
      const newOrgData: Partial<Organization> = {
        name: orgName.trim(),
        countyCode,
        npi: npi.trim(),
        medicaidProviderId: medicaidProviderId.trim(),
        contractType,
        allocatedMonthlyUnits,
        maxSpecialistSeats,
        maxActiveClients,
        dailyUnitCapPerSpecialist,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
        calaimContractActive,
        baaSignedAt: new Date().toISOString(),
        baaVersion: 'v2.4-GA8-CalAIM'
      };

      const createdOrg = await createOrg(newOrgData);

      // 2. Provision or Assign Tenant Administrator
      let createdOrAssignedAdmin: User | undefined;

      if (adminMode === 'create_new') {
        createdOrAssignedAdmin = await createUser({
          organizationId: createdOrg.id,
          fullName: adminFullName.trim(),
          email: adminEmail.trim().toLowerCase(),
          role: adminRole,
          credentialTitle: adminCredentialTitle.trim(),
          licenseNumber: adminLicenseNumber.trim() || 'NOT_SPECIFIED',
          npi: adminNpi.trim() || createdOrg.npi,
          employmentType: adminEmploymentType,
          isActive: true
        });

        // Record role assignment audit in append-only Dexie chained log
        if (currentUser) {
          await AuditTrail.recordRoleAssignment(
            createdOrAssignedAdmin.id,
            createdOrAssignedAdmin.email,
            'peer_specialist',
            adminRole,
            currentUser
          );
        }
      } else if (selectedExistingUserId) {
        const existing = allUsers.find((u) => u.id === selectedExistingUserId);
        if (existing) {
          const oldRole = existing.role;
          const updatedUser: User = {
            ...existing,
            organizationId: createdOrg.id,
            role: adminRole
          };
          createdOrAssignedAdmin = await updateUser(updatedUser);

          if (currentUser) {
            await AuditTrail.recordRoleAssignment(
              existing.id,
              existing.email,
              oldRole,
              adminRole,
              currentUser
            );
          }
        }
      }

      // 3. Record Immutable Cryptographic Organization Provisioning Audit Block
      if (currentUser) {
        await AuditTrail.recordOrgProvisioned(createdOrg, currentUser);
      }

      announceToScreenReader(`Successfully provisioned organization ${createdOrg.name}`);
      if (onSuccess) {
        onSuccess(createdOrg, createdOrAssignedAdmin);
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to provision organization tenant';
      setErrorMessage(msg);
      announceToScreenReader(`Provisioning error: ${msg}`, 'assertive');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity overflow-y-auto"
      onClick={onClose}
    >
      <div
        ref={modalRef}
        {...getModalAriaProps('org-provision-title', 'org-provision-desc')}
        className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl relative my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header Banner */}
        <div className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-teal-900 text-white p-5 sm:p-6 shrink-0 flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-400 text-teal-950 uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-950" />
                Super Administrator Authority
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-blue-800/80 text-blue-200">
                CalAIM Multi-Tenant Isolation
              </span>
            </div>
            <h2 id="org-provision-title" className="text-lg sm:text-xl font-bold tracking-tight">
              Provision Organization Tenant &amp; Roles
            </h2>
            <p id="org-provision-desc" className="text-xs text-blue-200">
              Establish a new California Community-Based Organization, enforce billing limits, and assign tenant leadership.
            </p>
          </div>

          <button
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-blue-200 hover:text-white transition-colors cursor-pointer"
            aria-label="Close organization provisioning modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Step Indicator */}
        <div className="bg-slate-50 border-b border-slate-200 px-5 sm:px-6 py-2.5 shrink-0 flex items-center justify-between text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
              currentStep === 1 ? 'text-[#1E3A8A] font-bold' : currentStep > 1 ? 'text-teal-700' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 1
                  ? 'bg-[#1E3A8A] text-white'
                  : currentStep > 1
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              1
            </span>
            <span>1. Tenant Entity</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

          <button
            type="button"
            onClick={() => isStep1Valid() && setCurrentStep(2)}
            className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
              currentStep === 2 ? 'text-[#1E3A8A] font-bold' : currentStep > 2 ? 'text-teal-700' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 2
                  ? 'bg-[#1E3A8A] text-white'
                  : currentStep > 2
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              2
            </span>
            <span>2. Capacity Limits</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

          <button
            type="button"
            onClick={() => isStep1Valid() && isStep2Valid() && setCurrentStep(3)}
            className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
              currentStep === 3 ? 'text-[#1E3A8A] font-bold' : currentStep > 3 ? 'text-teal-700' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 3
                  ? 'bg-[#1E3A8A] text-white'
                  : currentStep > 3
                  ? 'bg-teal-600 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              3
            </span>
            <span>3. Administrator Role</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />

          <button
            type="button"
            onClick={() => isStep1Valid() && isStep2Valid() && isStep3Valid() && setCurrentStep(4)}
            className={`flex items-center gap-1.5 cursor-pointer transition-colors ${
              currentStep === 4 ? 'text-[#1E3A8A] font-bold' : 'text-slate-400'
            }`}
          >
            <span
              className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                currentStep === 4 ? 'bg-[#1E3A8A] text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              4
            </span>
            <span>4. Review &amp; Bind</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleProvisionSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: ORGANIZATION PROFILE & MEDI-CAL REGISTRATION */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building2 className="w-4 h-4 text-[#0F766E]" />
                <h3 className="text-sm font-bold text-[#1E3A8A]">
                  Step 1: CBO Organization Legal Identity &amp; Medi-Cal Registration
                </h3>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  CBO Organization Legal Entity Name *
                </label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. East Bay Peer Recovery Collaborative, Inc."
                  className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                />
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  Official name as registered with the California Secretary of State &amp; IRS.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    California County Jurisdiction *
                  </label>
                  <select
                    value={countyCode}
                    onChange={(e) => setCountyCode(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  >
                    {CALIFORNIA_COUNTIES.map((county) => (
                      <option key={county.code} value={county.code}>
                        {county.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Contract / Organization Type
                  </label>
                  <select
                    value={contractType}
                    onChange={(e) => setContractType(e.target.value as Organization['contractType'])}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  >
                    <option value="CBO Partner">CBO Partner (Community-Based Organization)</option>
                    <option value="County Health Department">County Health Department / MHS</option>
                    <option value="Managed Care Plan (MCP)">Managed Care Plan (MCP)</option>
                    <option value="Contracted Provider">Contracted Behavioral Health Provider</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Organization National Provider Identifier (NPI) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={npi}
                    onChange={(e) => setNpi(e.target.value.replace(/\D/g, ''))}
                    placeholder="1982049182"
                    className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Must be exactly 10 digits ({npi.length}/10 digits entered).
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Medi-Cal Provider Identification Number (PIN) *
                  </label>
                  <input
                    type="text"
                    required
                    value={medicaidProviderId}
                    onChange={(e) => setMedicaidProviderId(e.target.value.toUpperCase())}
                    placeholder="CA-MC-984102"
                    className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    DHCS-assigned billing number for CalAIM H0038 claims.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Compliance Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="compliance@cbo-recovery.org"
                    className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Primary Contact Phone
                  </label>
                  <input
                    type="tel"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                    placeholder="(510) 555-0199"
                    className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: CAPACITY LIMITS & CALAIM BILLING BOUNDARIES */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Scale className="w-4 h-4 text-[#0F766E]" />
                <h3 className="text-sm font-bold text-[#1E3A8A]">
                  Step 2: Capacity Limits &amp; CalAIM H0038 Billing Governance
                </h3>
              </div>

              {/* Monthly Volume Allocation Card */}
              <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-[#0F766E] uppercase tracking-wider block">
                      Monthly CalAIM H0038 Volume Capacity
                    </span>
                    <span className="text-xl font-bold text-[#1E3A8A]">
                      {allocatedMonthlyUnits.toLocaleString()} Billing Units / Month
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                      Estimated Reimbursement Benchmark
                    </span>
                    <span className="text-sm font-bold text-[#16A34A] font-mono">
                      {monthlyRevenueBenchmark} @ $32.50/unit
                    </span>
                  </div>
                </div>

                <div>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="50"
                    value={allocatedMonthlyUnits}
                    onChange={(e) => setAllocatedMonthlyUnits(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0F766E]"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>100 units ($3.2k)</span>
                    <span>1,200 units ($39k - Mid CBO)</span>
                    <span>5,000 units ($162k)</span>
                    <span>10,000 units ($325k - County Hub)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Maximum Staff / Specialist Seats *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="500"
                    value={maxSpecialistSeats}
                    onChange={(e) => setMaxSpecialistSeats(Math.max(1, Number(e.target.value)))}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Enforces organization roster limit for active specialists &amp; supervisors.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Maximum Active Client Caseload *
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="5000"
                    step="10"
                    value={maxActiveClients}
                    onChange={(e) => setMaxActiveClients(Math.max(5, Number(e.target.value)))}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Tenant partition boundary for active participant records.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Daily Statutory Unit Cap Per Specialist (H0038)
                  </label>
                  <input
                    type="number"
                    min="4"
                    max="32"
                    step="4"
                    value={dailyUnitCapPerSpecialist}
                    onChange={(e) => setDailyUnitCapPerSpecialist(Number(e.target.value))}
                    className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                  <span className="text-[10px] text-slate-400 mt-0.5 block">
                    Standard: 24 units = 6.0 hours/day (CMS audit recoupment boundary).
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    CalAIM Contract Status
                  </label>
                  <div className="flex items-center gap-3 min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl">
                    <input
                      type="checkbox"
                      id="calaim-active-toggle"
                      checked={calaimContractActive}
                      onChange={(e) => setCalaimContractActive(e.target.checked)}
                      className="w-4 h-4 text-[#1E3A8A] rounded-sm focus:ring-[#1E3A8A]"
                    />
                    <label htmlFor="calaim-active-toggle" className="text-xs text-slate-800 font-semibold cursor-pointer">
                      Contract Active &amp; Verified for Billing
                    </label>
                  </div>
                </div>
              </div>

              {/* BAA Agreement notice */}
              <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#1E3A8A] shrink-0 mt-0.5" />
                <div className="text-xs text-[#1E3A8A] space-y-0.5">
                  <span className="font-bold block">Automatic HIPAA BAA v2.4-GA8-CalAIM Execution</span>
                  <p className="text-blue-900 leading-relaxed text-[11px]">
                    Provisioning this tenant automatically countersigns the statutory Business Associate Agreement binding the CBO to 45 CFR § 164.312 encryption standards and California CMIA data sovereignty.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: INITIAL ADMINISTRATOR PROVISIONING */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <UserCheck className="w-4 h-4 text-[#0F766E]" />
                <h3 className="text-sm font-bold text-[#1E3A8A]">
                  Step 3: Initial Tenant Administrator Role Assignment
                </h3>
              </div>

              {/* Selection Mode: Create New vs Assign Existing */}
              <div className="grid grid-cols-2 gap-2.5 p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setAdminMode('create_new')}
                  className={`min-h-[40px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    adminMode === 'create_new'
                      ? 'bg-white text-[#1E3A8A] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#0F766E]" />
                  <span>Create New Administrator</span>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminMode('assign_existing')}
                  className={`min-h-[40px] py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                    adminMode === 'assign_existing'
                      ? 'bg-white text-[#1E3A8A] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-[#1E3A8A]" />
                  <span>Assign Existing Staff Member</span>
                </button>
              </div>

              {adminMode === 'create_new' ? (
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Administrator Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={adminFullName}
                        onChange={(e) => setAdminFullName(e.target.value)}
                        placeholder="e.g. Maya Chen, LCSW"
                        className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Work Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={adminEmail}
                        onChange={(e) => setAdminEmail(e.target.value)}
                        placeholder="maya.chen@cbo-agency.org"
                        className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Assigned Administrative Role *
                      </label>
                      <select
                        value={adminRole}
                        onChange={(e) => setAdminRole(e.target.value as UserRole)}
                        className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      >
                        <option value="admin">admin — CBO Agency Administrator</option>
                        <option value="supervisor">supervisor — Clinical &amp; Peer Support Supervisor</option>
                        <option value="compliance_officer">compliance_officer — Quality &amp; Compliance Officer</option>
                      </select>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Designates role permissions within the newly provisioned tenant.
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Employment Classification
                      </label>
                      <select
                        value={adminEmploymentType}
                        onChange={(e) => setAdminEmploymentType(e.target.value as EmploymentType)}
                        className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      >
                        <option value="w2_employee">W-2 Permanent Agency Staff</option>
                        <option value="1099_contractor">1099 Independent Contractor</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Professional Credential Title
                      </label>
                      <input
                        type="text"
                        value={adminCredentialTitle}
                        onChange={(e) => setAdminCredentialTitle(e.target.value)}
                        placeholder="Licensed Clinical Social Worker (LCSW) / CPSS-CA Supervisor"
                        className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        License / Cert #
                      </label>
                      <input
                        type="text"
                        value={adminLicenseNumber}
                        onChange={(e) => setAdminLicenseNumber(e.target.value)}
                        placeholder="LCSW-89102"
                        className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                      />
                    </div>
                  </div>

                  {/* Temporary Access Passcode Badge */}
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-700 shrink-0" />
                      <div>
                        <span className="font-bold">Initial Temporary Access Code:</span>
                        <span className="font-mono font-bold text-amber-950 ml-1.5">{tempAccessKey}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md font-semibold">
                      Offline Resilient
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Select Staff Member to Promote as Tenant Administrator *
                    </label>
                    <select
                      value={selectedExistingUserId}
                      onChange={(e) => setSelectedExistingUserId(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    >
                      <option value="">-- Choose an existing staff account --</option>
                      {allUsers.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.fullName} ({u.email}) — Current Role: {u.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Assign Target Role in New Organization
                    </label>
                    <select
                      value={adminRole}
                      onChange={(e) => setAdminRole(e.target.value as UserRole)}
                      className="w-full min-h-[44px] px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    >
                      <option value="admin">admin — CBO Agency Administrator</option>
                      <option value="supervisor">supervisor — Clinical &amp; Peer Support Supervisor</option>
                      <option value="compliance_officer">compliance_officer — Quality &amp; Compliance Officer</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4: REVIEW & CRYPTOGRAPHIC BINDING */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <FileCheck2 className="w-4 h-4 text-[#0F766E]" />
                <h3 className="text-sm font-bold text-[#1E3A8A]">
                  Step 4: Review Organization Tenant &amp; Authorize Provisioning
                </h3>
              </div>

              {/* Comprehensive Summary Preview Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-blue-100 text-[#1E3A8A] px-2 py-0.5 rounded">
                      {countyCode}
                    </span>
                    <h4 className="text-base font-bold text-[#1E3A8A] mt-1">{orgName || 'Unnamed CBO Entity'}</h4>
                    <span className="text-xs text-slate-500 font-mono">
                      NPI: {npi || 'Pending'} · Medi-Cal ID: {medicaidProviderId || 'Pending'}
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-[#16A34A] flex items-center gap-1 sm:justify-end">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      <span>{contractType}</span>
                    </span>
                  </div>
                </div>

                {/* Capacity Limit Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Monthly H0038</span>
                    <span className="font-bold text-[#0F766E]">{allocatedMonthlyUnits} Units</span>
                  </div>

                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Staff Capacity</span>
                    <span className="font-bold text-slate-800">{maxSpecialistSeats} Seats</span>
                  </div>

                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Caseload Limit</span>
                    <span className="font-bold text-slate-800">{maxActiveClients} Clients</span>
                  </div>

                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Daily Cap</span>
                    <span className="font-bold text-slate-800">{dailyUnitCapPerSpecialist} Units/day</span>
                  </div>
                </div>

                {/* Assigned Administrator Profile Preview */}
                <div className="p-3.5 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-[#1E3A8A] font-bold flex items-center justify-center shrink-0">
                      {(adminMode === 'create_new' ? adminFullName : allUsers.find(u => u.id === selectedExistingUserId)?.fullName || 'AD').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Assigned Tenant Administrator ({adminRole})
                      </span>
                      <span className="font-bold text-[#1E3A8A] block">
                        {adminMode === 'create_new' ? adminFullName : allUsers.find(u => u.id === selectedExistingUserId)?.fullName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-mono">
                        {adminMode === 'create_new' ? adminEmail : allUsers.find(u => u.id === selectedExistingUserId)?.email}
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-50 text-[#1E3A8A] border border-blue-200 rounded-lg text-[11px] font-bold uppercase shrink-0">
                    {adminRole}
                  </span>
                </div>
              </div>

              {/* Cryptographic Ledger Assertion Box */}
              <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-950 space-y-1.5">
                <span className="font-bold flex items-center gap-1.5 text-[#1E3A8A]">
                  <ShieldCheck className="w-4 h-4 text-indigo-700" />
                  Append-Only SHA-256 Chained Ledger Binding
                </span>
                <p className="text-[11px] text-indigo-900 leading-relaxed">
                  Upon authorization, this provisioning transaction will append an immutable SHA-256 block anchored to the previous audit hash, linking Super Admin credentials (<span className="font-mono font-bold">{currentUser?.fullName || 'Super Administrator'}</span>) to this new tenant partition.
                </p>
              </div>
            </div>
          )}

          {/* Modal Footer Controls */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
            <div>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => (prev - 1) as any)}
                  className="min-h-[44px] px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              {currentStep < 4 ? (
                <button
                  type="button"
                  disabled={
                    (currentStep === 1 && !isStep1Valid()) ||
                    (currentStep === 2 && !isStep2Valid()) ||
                    (currentStep === 3 && !isStep3Valid())
                  }
                  onClick={() => setCurrentStep((prev) => (prev + 1) as any)}
                  className="min-h-[44px] px-5 py-2.5 bg-[#1E3A8A] hover:bg-blue-900 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-h-[44px] px-6 py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#0F766E] hover:from-blue-900 hover:to-teal-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Provisioning Tenant...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Authorize &amp; Provision Tenant</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

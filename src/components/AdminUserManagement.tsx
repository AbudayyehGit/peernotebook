/**
 * Peer Notebook - Administrative Management View (/admin/users)
 * GA #8 Production Standard • RBAC Multi-Tenant Governance
 * Tasks: Account Provisioning, Role Assignment, CBO Partner Agency CRUD, Contractor 1099 Ledger
 */

import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Organization, UserRole } from '../db/peerNotebookDatabase';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Users,
  Building2,
  Plus,
  Shield,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Briefcase,
  FileText,
  Trash2,
  Edit2,
  X,
  Mail,
  Phone,
  Car,
  Clock,
  Sparkles,
  ExternalLink,
  Lock
} from 'lucide-react';

export const AdminUserManagement: React.FC = () => {
  const {
    currentUser,
    currentOrg,
    allUsers,
    allOrgs,
    role,
    createUser,
    updateUser,
    deleteUser,
    createOrg,
    updateOrg,
    deleteOrg
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'users' | 'orgs' | 'contractors'>('users');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);

  // User Form State
  const [userFullName, setUserFullName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<UserRole>('peer_specialist');
  const [userOrgId, setUserOrgId] = useState(currentOrg?.id || 'org-calaim-01');
  const [userCredential, setUserCredential] = useState('Certified Peer Support Specialist (CPSS-CA)');
  const [userLicense, setUserLicense] = useState('');
  const [userNpi, setUserNpi] = useState('');
  const [isContractor, setIsContractor] = useState(false);
  const [contractorTaxId, setContractorTaxId] = useState('');
  const [hourlyRate, setHourlyRate] = useState<number>(45);
  const [mileageRate, setMileageRate] = useState<number>(0.67);
  const [contractAgency, setContractAgency] = useState('');

  // Org Form State
  const [orgName, setOrgName] = useState('');
  const [orgCounty, setOrgCounty] = useState('01-Alameda');
  const [orgNpi, setOrgNpi] = useState('');
  const [orgMedicaidId, setOrgMedicaidId] = useState('');
  const [orgContractType, setOrgContractType] = useState<Organization['contractType']>('CBO Partner');
  const [orgMonthlyUnits, setOrgMonthlyUnits] = useState<number>(1200);
  const [orgContactEmail, setOrgContactEmail] = useState('');
  const [orgContactPhone, setOrgContactPhone] = useState('');
  const [orgCalaimActive, setOrgCalaimActive] = useState(true);

  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const openCreateUserModal = () => {
    setEditingUser(null);
    setUserFullName('');
    setUserEmail('');
    setUserRole('peer_specialist');
    setUserOrgId(currentOrg?.id || 'org-calaim-01');
    setUserCredential('Certified Peer Support Specialist (CPSS-CA)');
    setUserLicense(`CA-CPSS-${Date.now().toString().slice(-4)}`);
    setUserNpi('');
    setIsContractor(false);
    setContractorTaxId('');
    setHourlyRate(45);
    setMileageRate(0.67);
    setContractAgency(currentOrg?.name || '');
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (user: User) => {
    setEditingUser(user);
    setUserFullName(user.fullName);
    setUserEmail(user.email);
    setUserRole(user.role);
    setUserOrgId(user.organizationId);
    setUserCredential(user.credentialTitle);
    setUserLicense(user.licenseNumber);
    setUserNpi(user.npi || '');
    setIsContractor(Boolean(user.isContractor1099));
    setContractorTaxId(user.contractorTaxId || '');
    setHourlyRate(user.hourlyContractRate || 45);
    setMileageRate(user.mileageReimbursementRate || 0.67);
    setContractAgency(user.contractAgencyName || '');
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userFullName || !userEmail) {
      setStatusMessage({ type: 'error', text: 'Full Name and Email are required.' });
      return;
    }

    try {
      if (editingUser) {
        await updateUser({
          ...editingUser,
          fullName: userFullName,
          email: userEmail,
          role: userRole,
          organizationId: userOrgId,
          credentialTitle: userCredential,
          licenseNumber: userLicense,
          npi: userNpi || undefined,
          isContractor1099: isContractor,
          contractorTaxId: contractorTaxId || undefined,
          hourlyContractRate: hourlyRate,
          mileageReimbursementRate: mileageRate,
          contractAgencyName: contractAgency || undefined
        });
        setStatusMessage({ type: 'success', text: `Updated specialist profile for ${userFullName}.` });
      } else {
        await createUser({
          fullName: userFullName,
          email: userEmail,
          role: userRole,
          organizationId: userOrgId,
          credentialTitle: userCredential,
          licenseNumber: userLicense,
          npi: userNpi || undefined,
          isContractor1099: isContractor,
          contractorTaxId: contractorTaxId || undefined,
          hourlyContractRate: hourlyRate,
          mileageReimbursementRate: mileageRate,
          contractAgencyName: contractAgency || undefined
        });
        setStatusMessage({ type: 'success', text: `Provisioned account for ${userFullName} (${userRole}).` });
      }
      setIsUserModalOpen(false);
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: unknown) {
      setStatusMessage({ type: 'error', text: err instanceof Error ? err.message : String(err) });
    }
  };

  const openCreateOrgModal = () => {
    setEditingOrg(null);
    setOrgName('');
    setOrgCounty('01-Alameda');
    setOrgNpi('1' + Math.floor(100000000 + Math.random() * 900000000));
    setOrgMedicaidId('CA-MC-' + Math.floor(100000 + Math.random() * 900000));
    setOrgContractType('CBO Partner');
    setOrgMonthlyUnits(1200);
    setOrgContactEmail('');
    setOrgContactPhone('');
    setOrgCalaimActive(true);
    setIsOrgModalOpen(true);
  };

  const openEditOrgModal = (org: Organization) => {
    setEditingOrg(org);
    setOrgName(org.name);
    setOrgCounty(org.countyCode);
    setOrgNpi(org.npi);
    setOrgMedicaidId(org.medicaidProviderId);
    setOrgContractType(org.contractType || 'CBO Partner');
    setOrgMonthlyUnits(org.allocatedMonthlyUnits || 1200);
    setOrgContactEmail(org.contactEmail || '');
    setOrgContactPhone(org.contactPhone || '');
    setOrgCalaimActive(org.calaimContractActive);
    setIsOrgModalOpen(true);
  };

  const handleSaveOrg = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName) {
      setStatusMessage({ type: 'error', text: 'Agency Name is required.' });
      return;
    }

    try {
      if (editingOrg) {
        await updateOrg({
          ...editingOrg,
          name: orgName,
          countyCode: orgCounty,
          npi: orgNpi,
          medicaidProviderId: orgMedicaidId,
          contractType: orgContractType,
          allocatedMonthlyUnits: orgMonthlyUnits,
          contactEmail: orgContactEmail || undefined,
          contactPhone: orgContactPhone || undefined,
          calaimContractActive: orgCalaimActive
        });
        setStatusMessage({ type: 'success', text: `Updated organization ${orgName}.` });
      } else {
        await createOrg({
          name: orgName,
          countyCode: orgCounty,
          npi: orgNpi,
          medicaidProviderId: orgMedicaidId,
          contractType: orgContractType,
          allocatedMonthlyUnits: orgMonthlyUnits,
          contactEmail: orgContactEmail || undefined,
          contactPhone: orgContactPhone || undefined,
          calaimContractActive: orgCalaimActive
        });
        setStatusMessage({ type: 'success', text: `Registered partner agency ${orgName}.` });
      }
      setIsOrgModalOpen(false);
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: unknown) {
      setStatusMessage({ type: 'error', text: err instanceof Error ? err.message : String(err) });
    }
  };

  // Contractors list
  const contractors = useMemo(() => allUsers.filter(u => u.isContractor1099), [allUsers]);

  if (role !== 'admin' && role !== 'supervisor' && role !== 'compliance_officer') {
    return (
      <Card className="rounded-xl border border-slate-200/80 shadow-sm">
        <CardContent className="p-8 text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Administrative Permission Required</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-md">
              User and organization provisioning is restricted to authorized Agency Administrators and Compliance Officers.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* View Header with 8pt spacing and 4-level typography */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Agency Governance &amp; User Provisioning
            </h1>
            <Badge variant="default">Admin Portal</Badge>
          </div>
          <p className="text-sm font-normal text-slate-500 mt-1">
            Manage certified specialists, CBO partner agencies, role boundaries, and 1099 contractor billing rates.
          </p>
        </div>

        {/* Action Triggers */}
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={openCreateOrgModal}
            className="gap-2"
          >
            <Building2 className="w-4 h-4 text-teal-700" />
            <span>Add CBO Partner</span>
          </Button>
          <Button
            type="button"
            onClick={openCreateUserModal}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Provision Account</span>
          </Button>
        </div>
      </div>

      {statusMessage && (
        <div
          role="alert"
          className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2 border ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <X className="w-4 h-4 shrink-0" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Segmented Sub-Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'users'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Specialist Accounts ({allUsers.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('orgs')}
          className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'orgs'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>CBO Partner Agencies ({allOrgs.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('contractors')}
          className={`min-h-[44px] px-4 py-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-2 cursor-pointer ${
            activeTab === 'contractors'
              ? 'bg-teal-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>1099 Contractor Ledger ({contractors.length})</span>
        </button>
      </div>

      {/* TAB 1: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <Card className="rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <CardHeader className="p-6 pb-4">
            <CardTitle className="text-lg font-semibold text-slate-900">
              Authorized Specialists &amp; Supervisors Directory
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Multi-tenant user profiles mapped to CalAIM behavioral health credentials and agency scopes.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200/80 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Specialist / Provider</th>
                    <th className="py-3 px-4">Role &amp; Credentials</th>
                    <th className="py-3 px-4">Assigned CBO Agency</th>
                    <th className="py-3 px-4">Tax Classification</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allUsers.map((user) => {
                    const org = allOrgs.find((o) => o.id === user.organizationId);
                    return (
                      <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900">{user.fullName}</div>
                          <div className="text-slate-500 font-mono text-[11px] flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{user.email}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 mb-1">
                            <Badge
                              variant={
                                user.role === 'admin'
                                  ? 'default'
                                  : user.role === 'supervisor'
                                  ? 'success'
                                  : 'secondary'
                              }
                            >
                              {user.role}
                            </Badge>
                            {user.isActive && (
                              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Active" />
                            )}
                          </div>
                          <div className="text-slate-600 text-[11px] truncate max-w-[200px]">
                            {user.credentialTitle}
                          </div>
                          <div className="text-slate-400 font-mono text-[10px]">
                            Lic: {user.licenseNumber}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800">{org?.name || 'Unassigned Agency'}</div>
                          <div className="text-slate-400 text-[11px]">{org?.countyCode || 'County: —'}</div>
                        </td>
                        <td className="py-3 px-4">
                          {user.isContractor1099 ? (
                            <div className="space-y-0.5">
                              <Badge variant="warning">1099 Contractor</Badge>
                              <div className="text-slate-600 font-mono text-[11px]">
                                ${user.hourlyContractRate || 45}/hr · ${user.mileageReimbursementRate || 0.67}/mi
                              </div>
                              {user.contractorTaxId && (
                                <div className="text-slate-400 text-[10px]">
                                  Tax ID: {user.contractorTaxId}
                                </div>
                              )}
                            </div>
                          ) : (
                            <Badge variant="outline">W-2 Agency Employee</Badge>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => openEditUserModal(user)}
                              className="h-8 px-2.5 text-xs"
                              title="Edit user"
                            >
                              <Edit2 className="w-3.5 h-3.5 mr-1" />
                              <span>Edit</span>
                            </Button>
                            {allUsers.length > 1 && user.id !== currentUser?.id && (
                              <Button
                                type="button"
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteUser(user.id)}
                                className="h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                                title="Remove user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TAB 2: CBO ORGANIZATIONS */}
      {activeTab === 'orgs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {allOrgs.map((org) => {
            const orgUserCount = allUsers.filter((u) => u.organizationId === org.id).length;
            const orgContractorCount = allUsers.filter(
              (u) => u.organizationId === org.id && u.isContractor1099
            ).length;

            return (
              <Card key={org.id} className="rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center border border-teal-200/60 shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">{org.name}</h3>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">
                        County: {org.countyCode} · NPI: {org.npi}
                      </div>
                    </div>
                  </div>
                  <Badge variant={org.calaimContractActive ? 'success' : 'secondary'}>
                    {org.calaimContractActive ? 'CalAIM Active' : 'Pending Contract'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-lg border border-slate-200/60">
                  <div>
                    <span className="text-slate-500 block text-[11px]">Provider Code</span>
                    <span className="font-mono font-bold text-slate-800">{org.medicaidProviderId}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Contract Type</span>
                    <span className="font-semibold text-slate-800">{org.contractType || 'CBO Partner'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Assigned Staff</span>
                    <span className="font-bold text-slate-800">
                      {orgUserCount} users ({orgContractorCount} contractors)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[11px]">Monthly Allocated</span>
                    <span className="font-bold text-teal-700">{org.allocatedMonthlyUnits || 1200} units</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div className="text-slate-500 text-[11px]">
                    BAA Version: <strong className="text-slate-700">{org.baaVersion}</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => openEditOrgModal(org)}
                      className="h-8 px-2.5 text-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5 mr-1" />
                      <span>Edit</span>
                    </Button>
                    {allOrgs.length > 1 && org.id !== currentOrg?.id && (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => deleteOrg(org.id)}
                        className="h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* TAB 3: 1099 CONTRACTOR FINANCIAL & BILLABLE LEDGER */}
      {activeTab === 'contractors' && (
        <Card className="rounded-xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                1099 Independent Contractor Billing Ledger
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Calculate Medi-Cal billing unit compensations, hours logged, and IRS-compliant mileage reimbursements.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="warning">IRS W-9 Standard</Badge>
              <Badge variant="outline">2026 Mileage: $0.67/mi</Badge>
            </div>
          </div>

          {contractors.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
              No 1099 independent contractors configured yet. Toggle contractor status when editing specialist accounts.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-y border-slate-200/80 text-slate-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Contractor</th>
                    <th className="py-3 px-4">Tax ID / W-9</th>
                    <th className="py-3 px-4">Hourly Rate</th>
                    <th className="py-3 px-4">Mileage Rate</th>
                    <th className="py-3 px-4">Contracting Agency</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contractors.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{c.fullName}</div>
                        <div className="text-slate-500 text-[11px] font-mono">{c.email}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-700">
                          {c.contractorTaxId || 'W-9 On File'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-teal-800">
                        ${c.hourlyContractRate || 45}.00 / hr
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-700">
                        ${c.mileageReimbursementRate || 0.67} / mile
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {c.contractAgencyName || currentOrg?.name}
                      </td>
                      <td className="py-3 px-4">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => openEditUserModal(c)}
                          className="h-8 px-2.5 text-xs"
                        >
                          <Edit2 className="w-3.5 h-3.5 mr-1" />
                          <span>Rates</span>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      {/* USER PROVISIONING MODAL */}
      {isUserModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setIsUserModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-teal-700" />
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingUser ? 'Edit Specialist Account' : 'Provision Certified Specialist'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Full Name &amp; Title</label>
                  <input
                    type="text"
                    required
                    value={userFullName}
                    onChange={(e) => setUserFullName(e.target.value)}
                    placeholder="e.g. Jordan Reyes, CPSS-CA"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="specialist@bayareapeer.org"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Role &amp; Permissions</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    <option value="peer_specialist">Peer Support Specialist (Own Notes/Clients)</option>
                    <option value="supervisor">Clinical Supervisor (QA Review &amp; Cosign)</option>
                    <option value="admin">Agency Administrator (Full Management)</option>
                    <option value="compliance_officer">Compliance Officer (Audit Review)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assigned Organization</label>
                  <select
                    value={userOrgId}
                    onChange={(e) => setUserOrgId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                  >
                    {allOrgs.map((org) => (
                      <option key={org.id} value={org.id}>
                        {org.name} ({org.countyCode})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Credential Title</label>
                  <input
                    type="text"
                    value={userCredential}
                    onChange={(e) => setUserCredential(e.target.value)}
                    placeholder="Medi-Cal Certified Peer Support Specialist"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">License / Cert #</label>
                  <input
                    type="text"
                    value={userLicense}
                    onChange={(e) => setUserLicense(e.target.value)}
                    placeholder="CA-CPSS-2024-9182"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              {/* 1099 Contractor Section */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-slate-800 text-xs block">Independent Contractor (1099) Status</strong>
                    <span className="text-slate-500 text-[11px]">
                      Enable specific hourly compensation &amp; mileage reimbursement tracking
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isContractor}
                    onChange={(e) => setIsContractor(e.target.checked)}
                    className="h-4 w-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500 cursor-pointer"
                  />
                </div>

                {isContractor && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-200">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Tax ID (EIN / SSN)
                      </label>
                      <input
                        type="text"
                        value={contractorTaxId}
                        onChange={(e) => setContractorTaxId(e.target.value)}
                        placeholder="XX-XXXXXXX"
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Hourly Rate ($)
                      </label>
                      <input
                        type="number"
                        step="1"
                        value={hourlyRate}
                        onChange={(e) => setHourlyRate(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Mileage ($ / mi)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={mileageRate}
                        onChange={(e) => setMileageRate(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 border border-slate-200 rounded-md font-mono text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUserModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingUser ? 'Save Changes' : 'Provision User'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CBO ORG MODAL */}
      {isOrgModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm"
          onClick={() => setIsOrgModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-700" />
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingOrg ? 'Edit Partner Organization' : 'Register CBO Partner Agency'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOrgModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveOrg} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Agency Name</label>
                  <input
                    type="text"
                    required
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Alameda Wellness Collaborative"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">County Code</label>
                  <input
                    type="text"
                    required
                    value={orgCounty}
                    onChange={(e) => setOrgCounty(e.target.value)}
                    placeholder="e.g. 01-Alameda, 38-San Francisco"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NPI</label>
                  <input
                    type="text"
                    required
                    value={orgNpi}
                    onChange={(e) => setOrgNpi(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Medicaid Provider ID</label>
                  <input
                    type="text"
                    required
                    value={orgMedicaidId}
                    onChange={(e) => setOrgMedicaidId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Monthly Units</label>
                  <input
                    type="number"
                    value={orgMonthlyUnits}
                    onChange={(e) => setOrgMonthlyUnits(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md font-mono text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Email</label>
                  <input
                    type="email"
                    value={orgContactEmail}
                    onChange={(e) => setOrgContactEmail(e.target.value)}
                    placeholder="contact@agency.org"
                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contract Type</label>
                  <select
                    value={orgContractType}
                    onChange={(e) => setOrgContractType(e.target.value as Organization['contractType'])}
                    className="w-full px-3 py-2 border border-slate-200 rounded-md text-xs"
                  >
                    <option value="CBO Partner">CBO Partner</option>
                    <option value="County Health Department">County Health Department</option>
                    <option value="Managed Care Plan (MCP)">Managed Care Plan (MCP)</option>
                    <option value="Contracted Provider">Contracted Provider</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="calaim-active-check"
                  checked={orgCalaimActive}
                  onChange={(e) => setOrgCalaimActive(e.target.checked)}
                  className="h-4 w-4 text-teal-600 rounded border-slate-300"
                />
                <label htmlFor="calaim-active-check" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Active CalAIM Contract &amp; Signed BAA (45 CFR § 164.504)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOrgModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingOrg ? 'Save Organization' : 'Create Organization'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

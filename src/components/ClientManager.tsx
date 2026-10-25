/**
 * Peer Notebook - Client & Peer Roster Manager (CalAIM & Medi-Cal Aligned)
 * Palette: Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E), Forest Green (#16A34A)
 * Minimum 44px touch targets & Trauma-Informed Container Cards
 */

import React, { useState, useEffect } from 'react';
import { peerNotebookDB, Client } from '../db/peerNotebookDatabase';
import { useAuth } from '../context/AuthContext';
import { AuditLogger } from '../services/auditLogger';
import { Users, Search, Plus, ShieldCheck, HeartHandshake, Calendar, FileText, X } from 'lucide-react';
import { EmptyState, Button } from './ui';

interface ClientManagerProps {
  onSelectClientForNote?: (client: Client) => void;
}

export const ClientManager: React.FC<ClientManagerProps> = ({ onSelectClientForNote }) => {
  const { currentOrg, currentUser, role } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPathway, setFilterPathway] = useState<string>('ALL');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Client Form State
  const [newClientName, setNewClientName] = useState('');
  const [newCin, setNewCin] = useState('');
  const [newClientDob, setNewClientDob] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newEmergencyContact, setNewEmergencyContact] = useState('');
  const [newPathway, setNewPathway] = useState<Client['calaimPathway']>('Community Supports');
  const [newStatus, setNewStatus] = useState<Client['currentStatus']>('Active Recovery');
  const [newGoalInput, setNewGoalInput] = useState('');
  const [newGoalsList, setNewGoalsList] = useState<string[]>([]);
  const [consentConfirmed, setConsentConfirmed] = useState(true);

  const loadClients = async () => {
    const list = await peerNotebookDB.getAllClients();
    let scoped = list;
    if (currentOrg) {
      scoped = scoped.filter(c => c.organizationId === currentOrg.id);
    }
    if (role === 'peer_specialist' && currentUser) {
      scoped = scoped.filter(c => c.assignedSpecialistId === currentUser.id || !c.assignedSpecialistId);
    }
    setClients(scoped);
  };

  useEffect(() => {
    loadClients();
  }, [currentOrg]);

  const handleSelectClient = async (client: Client) => {
    setSelectedClient(client);

    // HIPAA Audit View Log
    if (currentUser && currentOrg) {
      await AuditLogger.log({
        organizationId: currentOrg.id,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        actorRole: currentUser.role,
        action: 'VIEW_CLIENT',
        entityType: 'client',
        entityId: client.id,
        details: { clientIdentifier: client.clientIdentifier, calaimPathway: client.calaimPathway }
      });
    }
  };

  const handleAddGoal = () => {
    if (newGoalInput.trim()) {
      setNewGoalsList([...newGoalsList, newGoalInput.trim()]);
      setNewGoalInput('');
    }
  };

  const handleRemoveGoal = (index: number) => {
    setNewGoalsList(newGoalsList.filter((_, i) => i !== index));
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg || !currentUser || !newClientName.trim()) return;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newClient: Client = {
      id: `cli-${Date.now()}`,
      organizationId: currentOrg.id,
      clientIdentifier: `PN-${randomSuffix}`,
      mediCalCin: newCin.trim() || `${Math.floor(10000000 + Math.random() * 90000000)}A`,
      preferredName: newClientName.trim(),
      dateOfBirth: newClientDob || undefined,
      phone: newClientPhone || undefined,
      emergencyContact: newEmergencyContact || undefined,
      assignedSpecialistId: currentUser.id,
      recoveryGoals: newGoalsList.length > 0 ? newGoalsList : ['Collaborate with peer specialist on personal wellness plan'],
      currentStatus: newStatus,
      calaimPathway: newPathway,
      consentSigned: consentConfirmed,
      consentDate: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await peerNotebookDB.saveClient(newClient);
    await AuditLogger.log({
      organizationId: currentOrg.id,
      actorId: currentUser.id,
      actorName: currentUser.fullName,
      actorRole: currentUser.role,
      action: 'CREATE_CLIENT',
      entityType: 'client',
      entityId: newClient.id,
      details: { clientIdentifier: newClient.clientIdentifier, calaimPathway: newClient.calaimPathway }
    });

    setIsAddModalOpen(false);
    setNewClientName('');
    setNewCin('');
    setNewClientDob('');
    setNewClientPhone('');
    setNewEmergencyContact('');
    setNewGoalsList([]);
    await loadClients();
    setSelectedClient(newClient);
  };

  const filteredClients = clients.filter(c => {
    const matchesSearch =
      c.preferredName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.clientIdentifier.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.mediCalCin && c.mediCalCin.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesPathway = filterPathway === 'ALL' || c.calaimPathway === filterPathway;
    return matchesSearch && matchesPathway;
  });

  return (
    <div className="space-y-6">
      {/* Top Action Toolbar with 44px min-h touch controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-full sm:max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by peer name, MRN, or Medi-Cal CIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E] shadow-[0_2px_6px_rgba(15,23,42,0.03)]"
          />
        </div>

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2.5 w-full sm:w-auto">
          <select
            value={filterPathway}
            onChange={(e) => setFilterPathway(e.target.value)}
            className="w-full xs:w-auto flex-1 min-h-[44px] px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:outline-hidden shadow-[0_2px_6px_rgba(15,23,42,0.03)] truncate cursor-pointer"
          >
            <option value="ALL">All CalAIM Pathways</option>
            <option value="Community Supports">Community Supports</option>
            <option value="Enhanced Care Management (ECM)">Enhanced Care Management (ECM)</option>
            <option value="SMHS Peer Support">SMHS Peer Support</option>
            <option value="DMC-ODS Recovery Services">DMC-ODS Recovery Services</option>
          </select>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="min-h-[46px] flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-full text-xs font-bold transition-colors shadow-sm shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Peer Intake</span>
          </button>
        </div>
      </div>

      {/* Grid of Clients with Container Cards (Pure White #FFFFFF + soft ambient drop shadows) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const isSelected = selectedClient?.id === client.id;
          return (
            <div
              key={client.id}
              onClick={() => handleSelectClient(client)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white flex flex-col justify-between ${
                isSelected
                  ? 'border-[#0F766E] shadow-[0_6px_16px_rgba(15,118,110,0.12)] ring-2 ring-[#0F766E]/20'
                  : 'border-slate-200/90 hover:border-slate-300 shadow-[0_4px_20px_rgba(15,23,42,0.04)] hover:shadow-[0_6px_16px_rgba(15,23,42,0.08)]'
              }`}
            >
              <div>
                <div className="flex flex-col xs:flex-row xs:items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-[#1E3A8A] text-base">{client.preferredName}</h3>
                      <span className="font-mono text-xs text-[#0F766E] font-semibold">
                        {client.clientIdentifier}
                      </span>
                    </div>
                    {client.mediCalCin && (
                      <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                        CIN: {client.mediCalCin}
                      </span>
                    )}
                    <div className="text-xs text-slate-600 font-medium mt-1 flex items-center gap-1.5">
                      <span className="text-[#1E3A8A] font-semibold">{client.calaimPathway}</span>
                      <span>·</span>
                      <span className="text-slate-500">{client.currentStatus}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-[#16A34A] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 font-semibold shrink-0 self-start xs:self-auto">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Consent Active</span>
                  </div>
                </div>

                {/* Goals Preview */}
                <div className="mt-3.5 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    CalAIM Recovery Goals ({client.recoveryGoals.length})
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {client.recoveryGoals.slice(0, 2).map((goal, idx) => (
                      <li key={idx} className="truncate flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] shrink-0" />
                        <span className="truncate">{goal}</span>
                      </li>
                    ))}
                    {client.recoveryGoals.length > 2 && (
                      <li className="text-[11px] text-slate-400 italic pl-3.5">
                        +{client.recoveryGoals.length - 2} additional recovery goals
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              {/* Action buttons inside card (min 44px tap target height) */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col xs:flex-row items-start xs:items-center justify-between gap-2.5">
                <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {client.lastEncounterDate ? `Last: ${client.lastEncounterDate}` : 'No encounters recorded'}
                </span>

                {onSelectClientForNote && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClientForNote(client);
                    }}
                    className="w-full xs:w-auto min-h-[44px] flex items-center justify-center gap-1.5 px-4 py-2 bg-teal-50 hover:bg-[#0F766E] text-[#0F766E] hover:text-white rounded-full text-xs font-bold border border-teal-200 transition-all shadow-[0_2px_4px_rgba(15,23,42,0.04)] cursor-pointer"
                  >
                    <FileText className="w-4 h-4" />
                    <span>New Encounter Note</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <EmptyState
          icon={<Users className="w-6 h-6 text-slate-500" />}
          title="No peer clients found"
          description="Try refining your search query, adjusting the pathway filter, or create a new peer intake."
          action={
            <Button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>New Peer Intake</span>
            </Button>
          }
        />
      )}

      {/* Intake Modal with 44px tap targets */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity overflow-y-auto">
          <div className="bg-white border border-slate-200/90 rounded-2xl max-w-lg w-full max-w-[calc(100vw-1.5rem)] p-5 sm:p-7 shadow-2xl relative max-h-[90vh] overflow-y-auto my-auto">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-3 bg-teal-50 rounded-xl text-[#0F766E] border border-teal-200/80">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1E3A8A]">New CalAIM Peer Intake</h3>
                <p className="text-xs text-slate-500">Trauma-Informed & Medi-Cal Compliant Profile</p>
              </div>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Peer Preferred Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan R."
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Medi-Cal CIN (Client Index #)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 98471029B"
                    value={newCin}
                    onChange={(e) => setNewCin(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    CalAIM Service Pathway *
                  </label>
                  <select
                    value={newPathway}
                    onChange={(e) => setNewPathway(e.target.value as Client['calaimPathway'])}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors cursor-pointer"
                  >
                    <option value="Community Supports">Community Supports</option>
                    <option value="Enhanced Care Management (ECM)">Enhanced Care Management (ECM)</option>
                    <option value="SMHS Peer Support">SMHS Specialty Mental Health</option>
                    <option value="DMC-ODS Recovery Services">DMC-ODS Substance Use Recovery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Program Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as Client['currentStatus'])}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors cursor-pointer"
                  >
                    <option value="Active Recovery">Active Recovery</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Intensive Support">Intensive Support</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="(415) 000-0000"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    placeholder="Case worker or supportive peer"
                    value={newEmergencyContact}
                    onChange={(e) => setNewEmergencyContact(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {/* Goals Builder */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Individual CalAIM Wellness & Recovery Goals
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add specific recovery goal..."
                    value={newGoalInput}
                    onChange={(e) => setNewGoalInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddGoal();
                      }
                    }}
                    className="flex-1 min-h-[44px] px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={handleAddGoal}
                    className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer border border-slate-200"
                  >
                    Add Goal
                  </button>
                </div>

                {newGoalsList.length > 0 && (
                  <ul className="mt-2.5 space-y-1.5 max-h-32 overflow-y-auto">
                    {newGoalsList.map((g, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded-xl text-xs text-slate-800 border border-slate-200/80">
                        <span className="break-words font-medium">{g}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGoal(idx)}
                          className="text-rose-600 hover:text-rose-800 text-xs ml-2 font-bold shrink-0 p-1"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Consent check */}
              <div className="p-3.5 bg-teal-50/70 rounded-xl border border-teal-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentConfirmed}
                    onChange={(e) => setConsentConfirmed(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[#0F766E] focus:ring-0 shrink-0 border-slate-300"
                  />
                  <span className="text-xs text-slate-700 leading-normal">
                    <strong className="text-slate-900">CalAIM Consent & HIPAA Release:</strong> Peer has agreed to electronic peer encounter documentation and received the Medi-Cal notice of privacy practices.
                  </span>
                </label>
              </div>

              <div className="flex flex-col xs:flex-row justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-full xs:w-auto min-h-[44px] px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!consentConfirmed}
                  className="w-full xs:w-auto min-h-[44px] px-5 py-2.5 bg-[#0F766E] hover:bg-teal-800 disabled:opacity-50 text-white rounded-full text-xs font-bold shadow-sm transition-colors cursor-pointer"
                >
                  Create CalAIM Intake
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

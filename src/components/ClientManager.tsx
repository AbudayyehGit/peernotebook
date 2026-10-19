/**
 * Peer Notebook - Client & Peer Roster Manager (CalAIM & Medi-Cal Aligned)
 * Palette: Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E), Forest Green (#16A34A)
 */

import React, { useState, useEffect } from 'react';
import { peerNotebookDB, Client } from '../db/peerNotebookDatabase';
import { useAuth } from '../context/AuthContext';
import { AuditLogger } from '../services/auditLogger';
import { Users, Search, Plus, ShieldCheck, HeartHandshake, Calendar, Phone, FileText, CheckCircle2 } from 'lucide-react';

interface ClientManagerProps {
  onSelectClientForNote?: (client: Client) => void;
}

export const ClientManager: React.FC<ClientManagerProps> = ({ onSelectClientForNote }) => {
  const { currentOrg, currentUser } = useAuth();
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
    if (currentOrg) {
      setClients(list.filter(c => c.organizationId === currentOrg.id));
    } else {
      setClients(list);
    }
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
      action: 'CREATE_NOTE',
      entityType: 'client',
      entityId: newClient.id,
      details: { clientIdentifier: newClient.clientIdentifier }
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
      {/* Top action toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by peer name, MRN, or Medi-Cal CIN..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E] shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterPathway}
            onChange={(e) => setFilterPathway(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800 focus:outline-hidden shadow-2xs"
          >
            <option value="ALL">All CalAIM Pathways</option>
            <option value="Community Supports">Community Supports</option>
            <option value="Enhanced Care Management (ECM)">Enhanced Care Management (ECM)</option>
            <option value="SMHS Peer Support">SMHS Peer Support</option>
            <option value="DMC-ODS Recovery Services">DMC-ODS Recovery Services</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#0F766E] hover:bg-teal-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>New Peer Intake</span>
          </button>
        </div>
      </div>

      {/* Grid of Clients */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const isSelected = selectedClient?.id === client.id;
          return (
            <div
              key={client.id}
              onClick={() => handleSelectClient(client)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
                isSelected
                  ? 'border-[#0F766E] shadow-md ring-2 ring-[#0F766E]/20'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-[#1E3A8A] text-base">{client.preferredName}</h3>
                    <span className="font-mono text-xs text-[#0F766E] px-2 py-0.5 rounded-md bg-teal-50 border border-teal-200 font-semibold">
                      {client.clientIdentifier}
                    </span>
                  </div>
                  {client.mediCalCin && (
                    <span className="text-[11px] text-slate-500 font-mono mt-0.5 block">
                      CIN: {client.mediCalCin}
                    </span>
                  )}
                  <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-[#1E3A8A] border border-blue-200">
                    {client.calaimPathway}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-[#16A34A] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Consent Active</span>
                </div>
              </div>

              {/* Goals Preview */}
              <div className="mt-3 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  CalAIM Recovery Goals ({client.recoveryGoals.length})
                </span>
                <ul className="space-y-1 text-xs text-slate-700">
                  {client.recoveryGoals.slice(0, 2).map((goal, idx) => (
                    <li key={idx} className="truncate flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] shrink-0" />
                      <span className="truncate">{goal}</span>
                    </li>
                  ))}
                  {client.recoveryGoals.length > 2 && (
                    <li className="text-[11px] text-slate-500 italic pl-3">
                      +{client.recoveryGoals.length - 2} more recovery goals
                    </li>
                  )}
                </ul>
              </div>

              {/* Action buttons inside card */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {client.lastEncounterDate ? `Last: ${client.lastEncounterDate}` : 'No encounters recorded'}
                </span>

                {onSelectClientForNote && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClientForNote(client);
                    }}
                    className="flex items-center gap-1 px-3 py-1 bg-teal-50 hover:bg-[#0F766E] text-[#0F766E] hover:text-white rounded-lg text-xs font-semibold border border-teal-200 transition-all shadow-2xs"
                  >
                    <FileText className="w-3 h-3" />
                    <span>New Encounter Note</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <Users className="w-10 h-10 text-slate-400 mx-auto mb-2" />
          <h4 className="text-[#1E3A8A] font-bold">No peer clients found</h4>
          <p className="text-xs text-slate-500 mt-1">Try refining your search or add a new peer intake.</p>
        </div>
      )}

      {/* Intake Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-teal-50 rounded-xl text-[#0F766E] border border-teal-100">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[#1E3A8A]">New CalAIM Peer Intake</h3>
                <p className="text-xs text-slate-500">Trauma-Informed & Medi-Cal Compliant Profile</p>
              </div>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peer Preferred Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jordan R."
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Medi-Cal CIN (Client Index #)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 98471029B"
                    value={newCin}
                    onChange={(e) => setNewCin(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CalAIM Service Pathway *
                  </label>
                  <select
                    value={newPathway}
                    onChange={(e) => setNewPathway(e.target.value as Client['calaimPathway'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                  >
                    <option value="Community Supports">Community Supports</option>
                    <option value="Enhanced Care Management (ECM)">Enhanced Care Management (ECM)</option>
                    <option value="SMHS Peer Support">SMHS Specialty Mental Health</option>
                    <option value="DMC-ODS Recovery Services">DMC-ODS Substance Use Recovery</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Program Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as Client['currentStatus'])}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 focus:outline-hidden"
                  >
                    <option value="Active Recovery">Active Recovery</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Intensive Support">Intensive Support</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="(415) 000-0000"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    placeholder="Case worker or supportive peer"
                    value={newEmergencyContact}
                    onChange={(e) => setNewEmergencyContact(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Goals Builder */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                    className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddGoal}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </div>

                {newGoalsList.length > 0 && (
                  <ul className="mt-2 space-y-1.5 max-h-28 overflow-y-auto">
                    {newGoalsList.map((g, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-slate-100 px-2.5 py-1.5 rounded-lg text-xs text-slate-800">
                        <span>{g}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGoal(idx)}
                          className="text-rose-600 hover:text-rose-800 text-xs ml-2 font-bold"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Consent check */}
              <div className="p-3 bg-teal-50 rounded-xl border border-teal-200">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentConfirmed}
                    onChange={(e) => setConsentConfirmed(e.target.checked)}
                    className="mt-0.5 rounded text-[#0F766E] focus:ring-0"
                  />
                  <span className="text-xs text-slate-700 leading-normal">
                    <strong className="text-slate-900">CalAIM Consent & HIPAA Release:</strong> Peer has agreed to electronic peer encounter documentation and received the Medi-Cal notice of privacy practices.
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!consentConfirmed}
                  className="px-4 py-2 bg-[#0F766E] hover:bg-teal-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-xs"
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

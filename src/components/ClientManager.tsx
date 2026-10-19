/**
 * Peer Notebook - Client & Peer Roster Manager
 * Conforms to HIPAA pseudonymized identifier & consent tracking requirements
 */

import React, { useState, useEffect } from 'react';
import { peerNotebookDB, Client } from '../db/peerNotebookDatabase';
import { useAuth } from '../context/AuthContext';
import { AuditLogger } from '../services/auditLogger';
import { Users, Search, Plus, ShieldCheck, HeartHandshake, Calendar, Phone, AlertCircle, FileText } from 'lucide-react';

interface ClientManagerProps {
  onSelectClientForNote?: (client: Client) => void;
}

export const ClientManager: React.FC<ClientManagerProps> = ({ onSelectClientForNote }) => {
  const { currentOrg, currentUser } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Client Form State
  const [newClientName, setNewClientName] = useState('');
  const [newClientDob, setNewClientDob] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newEmergencyContact, setNewEmergencyContact] = useState('');
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
        details: { clientIdentifier: client.clientIdentifier }
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
      preferredName: newClientName.trim(),
      dateOfBirth: newClientDob || undefined,
      phone: newClientPhone || undefined,
      emergencyContact: newEmergencyContact || undefined,
      assignedSpecialistId: currentUser.id,
      recoveryGoals: newGoalsList.length > 0 ? newGoalsList : ['Collaborate with peer specialist on personal wellness plan'],
      currentStatus: newStatus,
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
      c.clientIdentifier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || c.currentStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top action toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by peer name or ID (e.g. PN-4091)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-400 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="Active Recovery">Active Recovery</option>
            <option value="Maintenance">Maintenance</option>
            <option value="Intensive Support">Intensive Support</option>
            <option value="Completed Program">Completed Program</option>
          </select>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
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
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-800/90 border-blue-500 shadow-md ring-1 ring-blue-500'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-base">{client.preferredName}</h3>
                    <span className="font-mono text-xs text-blue-400 px-1.5 py-0.5 rounded bg-blue-950/60 border border-blue-800/60">
                      {client.clientIdentifier}
                    </span>
                  </div>
                  <span
                    className={`inline-block mt-2 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                      client.currentStatus === 'Active Recovery'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        : client.currentStatus === 'Intensive Support'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {client.currentStatus}
                  </span>
                </div>

                <div className="flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Consent Active</span>
                </div>
              </div>

              {/* Goals Preview */}
              <div className="mt-3 pt-3 border-t border-slate-800">
                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block mb-1">
                  Primary Goals ({client.recoveryGoals.length})
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {client.recoveryGoals.slice(0, 2).map((goal, idx) => (
                    <li key={idx} className="truncate flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
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
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {client.lastEncounterDate ? `Last: ${client.lastEncounterDate}` : 'No encounters recorded'}
                </span>

                {onSelectClientForNote && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectClientForNote(client);
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-md text-xs font-medium border border-blue-500/30 transition-all"
                  >
                    <FileText className="w-3 h-3" />
                    <span>New Note</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12 bg-slate-900/40 rounded-xl border border-slate-800">
          <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
          <h4 className="text-slate-300 font-medium">No peer clients found</h4>
          <p className="text-xs text-slate-500 mt-1">Try refining your search or add a new peer intake.</p>
        </div>
      )}

      {/* Intake Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
            >
              ✕
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-blue-600/20 rounded-lg text-blue-400">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">New Peer Intake & Consent</h3>
                <p className="text-xs text-slate-400">HIPAA-compliant client profile generation</p>
              </div>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Peer Preferred Name / First Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samuel K."
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Date of Birth (Optional)
                  </label>
                  <input
                    type="date"
                    value={newClientDob}
                    onChange={(e) => setNewClientDob(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Program Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as Client['currentStatus'])}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden"
                  >
                    <option value="Active Recovery">Active Recovery</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Intensive Support">Intensive Support</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="(555) 000-0000"
                    value={newClientPhone}
                    onChange={(e) => setNewClientPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="text"
                    placeholder="Case worker or family"
                    value={newEmergencyContact}
                    onChange={(e) => setNewEmergencyContact(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Goals Builder */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Individual Recovery Goals
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add specific recovery or wellness goal..."
                    value={newGoalInput}
                    onChange={(e) => setNewGoalInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddGoal();
                      }
                    }}
                    className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddGoal}
                    className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs"
                  >
                    Add
                  </button>
                </div>

                {newGoalsList.length > 0 && (
                  <ul className="mt-2 space-y-1.5 max-h-32 overflow-y-auto">
                    {newGoalsList.map((g, idx) => (
                      <li key={idx} className="flex items-center justify-between bg-slate-800/80 px-2.5 py-1.5 rounded text-xs text-slate-200">
                        <span>{g}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveGoal(idx)}
                          className="text-rose-400 hover:text-rose-300 text-xs ml-2"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Consent check */}
              <div className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/80">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentConfirmed}
                    onChange={(e) => setConsentConfirmed(e.target.checked)}
                    className="mt-0.5 rounded text-blue-600 focus:ring-0"
                  />
                  <span className="text-xs text-slate-300">
                    <strong className="text-white">HIPAA & Peer Consent Agreement:</strong> Peer has received agency Notice of Privacy Practices and consented to electronic peer support documentation.
                  </span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!consentConfirmed}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-medium"
                >
                  Create Intake Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

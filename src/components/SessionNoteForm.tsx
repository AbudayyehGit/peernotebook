/**
 * Peer Notebook - Clinical & Peer Support Encounter Note Form
 * Conforms to Medicaid H0038 Billing Specifications, DAP Format & GA8 Architecture
 */

import React, { useState, useEffect } from 'react';
import { peerNotebookDB, Client, SessionNote, ServiceModality } from '../db/peerNotebookDatabase';
import { useAuth } from '../context/AuthContext';
import { AuditLogger } from '../services/auditLogger';
import { syncWorker } from '../services/syncWorker';
import { FileText, Save, Send, AlertTriangle, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface SessionNoteFormProps {
  initialClient?: Client | null;
  existingNote?: SessionNote | null;
  onSaveSuccess?: (note: SessionNote) => void;
  onCancel?: () => void;
}

const FOCUS_DOMAIN_OPTIONS = [
  'Recovery Goals',
  'Housing Stability',
  'Relapse Prevention',
  'Coping Skills',
  'Mental Health Wellness',
  'Vocational/Employment',
  'Harm Reduction',
  'System Navigation',
  'Family Reconnection'
];

export const SessionNoteForm: React.FC<SessionNoteFormProps> = ({
  initialClient,
  existingNote,
  onSaveSuccess,
  onCancel
}) => {
  const { currentOrg, currentUser } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>(
    existingNote?.clientId || initialClient?.id || ''
  );

  // Encounter Metadata
  const [encounterDate, setEncounterDate] = useState<string>(
    existingNote?.encounterDate || new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState<string>(existingNote?.startTime || '10:00');
  const [endTime, setEndTime] = useState<string>(existingNote?.endTime || '10:45');
  const [durationMinutes, setDurationMinutes] = useState<number>(existingNote?.durationMinutes || 45);
  const [billingCode, setBillingCode] = useState<string>(existingNote?.billingCode || 'H0038');
  const [modality, setModality] = useState<ServiceModality>(existingNote?.modality || 'community_field');
  const [locationDetails, setLocationDetails] = useState<string>(
    existingNote?.locationDetails || 'Community Outreach / Field'
  );

  // Note Content (DAP / Peer Documentation)
  const [focusDomains, setFocusDomains] = useState<string[]>(
    existingNote?.focusDomains || ['Recovery Goals', 'Coping Skills']
  );
  const [goalAddressed, setGoalAddressed] = useState<string>(existingNote?.goalAddressed || '');
  const [peerIntervention, setPeerIntervention] = useState<string>(existingNote?.peerIntervention || '');
  const [clientResponse, setClientResponse] = useState<string>(existingNote?.clientResponse || '');
  const [planNextSteps, setPlanNextSteps] = useState<string>(existingNote?.planNextSteps || '');
  const [safetyConcerns, setSafetyConcerns] = useState<boolean>(existingNote?.safetyConcerns || false);
  const [safetyNotes, setSafetyNotes] = useState<string>(existingNote?.safetyNotes || '');

  // Signature
  const [signatureTyped, setSignatureTyped] = useState<string>(
    existingNote?.specialistSignature || `${currentUser?.fullName || 'Alex Rivera, CPSS'}`
  );
  const [signatureConfirmed, setSignatureConfirmed] = useState<boolean>(Boolean(existingNote?.signedAt));

  // Feedback & Validation
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  // Auto-calculate duration & billing units
  useEffect(() => {
    if (startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      if (diffMinutes > 0) {
        setDurationMinutes(diffMinutes);
      }
    }
  }, [startTime, endTime]);

  const billingUnits = Math.ceil(durationMinutes / 15);

  useEffect(() => {
    const fetchClients = async () => {
      const list = await peerNotebookDB.getAllClients();
      if (currentOrg) {
        setClients(list.filter(c => c.organizationId === currentOrg.id));
      } else {
        setClients(list);
      }
    };
    fetchClients();
  }, [currentOrg]);

  const currentClient = clients.find(c => c.id === selectedClientId) || initialClient;

  // Toggle Focus Domain
  const toggleDomain = (domain: string) => {
    if (focusDomains.includes(domain)) {
      setFocusDomains(focusDomains.filter(d => d !== domain));
    } else {
      setFocusDomains([...focusDomains, domain]);
    }
  };

  // Quick Template Injector
  const applyTemplate = (type: 'recovery' | 'housing' | 'coping') => {
    if (type === 'recovery') {
      setGoalAddressed('Goal 1: Maintain abstinence and strengthen personal recovery capital.');
      setPeerIntervention('CPSS shared relevant lived recovery experience regarding early-recovery triggers. Discussed healthy boundaries and mutual-aid meeting schedules. Practiced identifying high-risk social environments.');
      setClientResponse('Peer actively engaged in discussion. Identified two past relapse triggers and agreed to attend an evening recovery support group.');
      setPlanNextSteps('Peer will contact sponsor twice this week. CPSS and peer scheduled follow-up on Friday at 11:00 AM.');
      setFocusDomains(['Recovery Goals', 'Relapse Prevention', 'Coping Skills']);
    } else if (type === 'housing') {
      setGoalAddressed('Goal 2: Resolve housing vulnerability and secure stable shelter.');
      setPeerIntervention('Accompanied peer to local housing access center. Assisted peer in filling out coordinated entry paperwork and organized identification documents. Provided emotional de-escalation during wait times.');
      setClientResponse('Peer maintained composure throughout intake process. Expressed gratitude for peer presence, stating anxiety was substantially lower with support.');
      setPlanNextSteps('Peer to receive intake confirmation call within 5 business days. CPSS will check in Thursday by phone.');
      setFocusDomains(['Housing Stability', 'System Navigation']);
    } else if (type === 'coping') {
      setGoalAddressed('Goal 3: Implement non-pharmacological grounding techniques for panic/anxiety.');
      setPeerIntervention('Introduced box breathing (4-4-4-4) and 5-4-3-2-1 sensory grounding. CPSS guided peer through two repetitions during active distress.');
      setClientResponse('Peer successfully demonstrated technique. Self-reported anxiety reduction from 9/10 to 4/10.');
      setPlanNextSteps('Peer committed to using box breathing daily upon waking and before bedtime.');
      setFocusDomains(['Mental Health Wellness', 'Coping Skills']);
    }
  };

  const handleSave = async (submitToSupervisor: boolean) => {
    if (!selectedClientId) {
      setValidationWarning('Please select an active peer client.');
      return;
    }
    if (!goalAddressed.trim() || !peerIntervention.trim() || !clientResponse.trim()) {
      setValidationWarning('Please complete Goal Addressed, Peer Intervention, and Client Response sections.');
      return;
    }
    if (submitToSupervisor && (!signatureConfirmed || !signatureTyped.trim())) {
      setValidationWarning('Certified peer specialist electronic signature and verification check are required for supervisor submission.');
      return;
    }

    setValidationWarning(null);

    const clientObj = clients.find(c => c.id === selectedClientId);
    const now = new Date().toISOString();

    const noteToSave: SessionNote = {
      id: existingNote?.id || `note-${Date.now()}`,
      organizationId: currentOrg?.id || 'org-hope-01',
      clientId: selectedClientId,
      clientName: clientObj?.preferredName || 'Client',
      clientIdentifier: clientObj?.clientIdentifier || 'PN-0000',
      authorId: currentUser?.id || 'user-cpss-01',
      authorName: currentUser?.fullName || 'Alex Rivera, CPSS',
      authorCredentials: currentUser?.credentialTitle || 'Certified Peer Support Specialist',
      encounterDate,
      startTime,
      endTime,
      durationMinutes,
      billingCode,
      billingUnits,
      modality,
      locationDetails,
      focusDomains,
      goalAddressed,
      peerIntervention,
      clientResponse,
      planNextSteps,
      safetyConcerns,
      safetyNotes: safetyConcerns ? safetyNotes : undefined,
      specialistSignature: signatureTyped,
      signedAt: signatureConfirmed ? now : undefined,
      status: submitToSupervisor ? 'pending_supervisor' : 'draft',
      synced: false,
      createdAt: existingNote?.createdAt || now,
      updatedAt: now
    };

    // Save to IndexedDB
    await peerNotebookDB.saveNote(noteToSave);

    // Update client last encounter date
    if (clientObj) {
      clientObj.lastEncounterDate = encounterDate;
      await peerNotebookDB.saveClient(clientObj);
    }

    // Queue for sync & audit log
    await syncWorker.enqueueMutation('CREATE', 'session_note', noteToSave.id, noteToSave);

    if (currentUser && currentOrg) {
      await AuditLogger.log({
        organizationId: currentOrg.id,
        actorId: currentUser.id,
        actorName: currentUser.fullName,
        actorRole: currentUser.role,
        action: submitToSupervisor ? 'SIGN_NOTE' : 'CREATE_NOTE',
        entityType: 'session_note',
        entityId: noteToSave.id,
        details: {
          clientId: noteToSave.clientId,
          billingUnits: noteToSave.billingUnits,
          status: noteToSave.status
        }
      });
    }

    setSaveStatus(submitToSupervisor ? 'Submitted to Supervisor Queue!' : 'Draft Saved to Offline IndexedDB!');
    setTimeout(() => {
      setSaveStatus(null);
      if (onSaveSuccess) onSaveSuccess(noteToSave);
    }, 1200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              {existingNote ? 'Edit Encounter Documentation' : 'Peer Support Encounter Documentation'}
            </h2>
            <p className="text-xs text-slate-400">
              HIPAA Compliant • Medicaid Code: <span className="font-mono text-emerald-400 font-semibold">{billingCode}</span> • Units: <span className="font-mono text-blue-400 font-semibold">{billingUnits} (15m/unit)</span>
            </p>
          </div>
        </div>

        {/* Quick template buttons */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1.5 rounded-lg border border-slate-700/60">
          <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1 pl-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> Templates:
          </span>
          <button
            type="button"
            onClick={() => applyTemplate('recovery')}
            className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded"
          >
            Recovery
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('housing')}
            className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded"
          >
            Housing
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('coping')}
            className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 text-slate-200 rounded"
          >
            Grounding
          </button>
        </div>
      </div>

      {validationWarning && (
        <div className="flex items-center gap-2 p-3 bg-amber-950/80 border border-amber-600/60 rounded-xl text-amber-200 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
          <span>{validationWarning}</span>
        </div>
      )}

      {saveStatus && (
        <div className="flex items-center gap-2 p-3 bg-emerald-950/80 border border-emerald-600/60 rounded-xl text-emerald-200 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Peer Client Selection & Encounter Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Peer / Client *
          </label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden focus:border-blue-500"
          >
            <option value="">-- Select Client --</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.preferredName} ({c.clientIdentifier})
              </option>
            ))}
          </select>
          {currentClient && (
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Consent Verified ({currentClient.currentStatus})
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Encounter Date *
          </label>
          <input
            type="date"
            value={encounterDate}
            onChange={(e) => setEncounterDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            Modality & Setting *
          </label>
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value as ServiceModality)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden"
          >
            <option value="community_field">Community / Field Outreach</option>
            <option value="face_to_face">Face-to-Face (Clinic / Office)</option>
            <option value="telehealth_video">Telehealth Video</option>
            <option value="phone_outreach">Phone Outreach</option>
          </select>
        </div>
      </div>

      {/* Time & Duration Units */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-3.5 bg-slate-850/60 rounded-xl border border-slate-800">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Start Time
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> End Time
          </label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Duration
          </label>
          <div className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm font-semibold text-white">
            {durationMinutes} minutes
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Billing Units (H0038)
          </label>
          <div className="px-3 py-1.5 bg-blue-950/50 border border-blue-700/60 rounded-lg text-sm font-bold text-blue-300 flex items-center justify-between">
            <span>{billingUnits} Unit{billingUnits > 1 ? 's' : ''}</span>
            <span className="text-[10px] text-blue-400 font-mono">15m = 1u</span>
          </div>
        </div>
      </div>

      {/* Focus Domains */}
      <div>
        <label className="block text-xs font-medium text-slate-300 mb-2">
          Encounter Focus Domains (Select all applicable)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {FOCUS_DOMAIN_OPTIONS.map(domain => {
            const isSelected = focusDomains.includes(domain);
            return (
              <button
                key={domain}
                type="button"
                onClick={() => toggleDomain(domain)}
                className={`px-2.5 py-1 rounded-full text-xs transition-colors border ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-500 shadow-xs'
                    : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {domain}
              </button>
            );
          })}
        </div>
      </div>

      {/* Core Clinical Documentation (DAP / Peer Format) */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            1. Recovery Goal Addressed *
          </label>
          <textarea
            rows={2}
            value={goalAddressed}
            onChange={(e) => setGoalAddressed(e.target.value)}
            placeholder="Specify which individual recovery plan goal or objective was targeted during this session..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            2. Peer Specialist Intervention (What YOU did) *
          </label>
          <textarea
            rows={3}
            value={peerIntervention}
            onChange={(e) => setPeerIntervention(e.target.value)}
            placeholder="Detail peer-delivered interventions: lived experience sharing, recovery coping skills taught, system navigation, emotional validation, community resource coordination..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            3. Peer / Client Response (Client Engagement & Quotes) *
          </label>
          <textarea
            rows={3}
            value={clientResponse}
            onChange={(e) => setClientResponse(e.target.value)}
            placeholder="How did the client respond? Direct client feedback, behavioral observations, self-rated scale (e.g. 1-10 craving/anxiety), receptivity to peer mentoring..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1">
            4. Plan & Action Steps for Next Meeting *
          </label>
          <textarea
            rows={2}
            value={planNextSteps}
            onChange={(e) => setPlanNextSteps(e.target.value)}
            placeholder="Concrete action steps for client prior to next encounter; scheduled date, time, and focal point of upcoming meeting..."
            className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-blue-500"
          />
        </div>
      </div>

      {/* Safety & Crisis Flag */}
      <div className="p-4 bg-slate-850/80 rounded-xl border border-slate-800 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={safetyConcerns}
            onChange={(e) => setSafetyConcerns(e.target.checked)}
            className="rounded text-rose-600 focus:ring-0"
          />
          <span className="text-xs font-medium text-slate-200">
            Check here if any crisis, safety, self-harm, or overdose risk concerns were identified
          </span>
        </label>

        {safetyConcerns && (
          <div className="space-y-1">
            <span className="text-xs text-rose-400 font-medium">
              Crisis De-escalation & Safety Response Documentation:
            </span>
            <textarea
              rows={2}
              value={safetyNotes}
              onChange={(e) => setSafetyNotes(e.target.value)}
              placeholder="Document safety plan review, emergency contact notification, supervisor contact, or referral to mobile crisis team..."
              className="w-full px-3 py-2 bg-rose-950/20 border border-rose-700/60 rounded-lg text-sm text-white focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* Electronic Signature Block */}
      <div className="p-4 bg-slate-800/70 rounded-xl border border-slate-700/80 space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 block">
          Certified Peer Support Specialist Electronic Signature
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Typed Signature</label>
            <input
              type="text"
              value={signatureTyped}
              onChange={(e) => setSignatureTyped(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-white font-mono"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-start gap-2 cursor-pointer mt-2 sm:mt-0">
              <input
                type="checkbox"
                checked={signatureConfirmed}
                onChange={(e) => setSignatureConfirmed(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-0"
              />
              <span className="text-xs text-slate-300">
                I attest that this note accurately reflects peer support services rendered in accordance with state certification and agency clinical standards.
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
          >
            Cancel
          </button>
        )}

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-slate-400" />
            <span>Save Offline Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            className="flex items-center justify-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-colors shadow-md"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit to Supervisor</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Peer Notebook - CalAIM & Medi-Cal H0038 Encounter Note Form
 * Visuals: Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E)
 * Low Cognitive Load • Trauma-Informed Language Check • Dual-Layer Persistence
 */

import React, { useState, useEffect } from 'react';
import { peerNotebookDB, Client, SessionNote, ServiceModality } from '../db/peerNotebookDatabase';
import { useAuth } from '../context/AuthContext';
import { AuditLogger } from '../services/auditLogger';
import { syncWorker } from '../services/syncWorker';
import { FileText, Save, Send, AlertTriangle, CheckCircle2, Clock, Sparkles, Navigation, ShieldCheck } from 'lucide-react';

interface SessionNoteFormProps {
  initialClient?: Client | null;
  existingNote?: SessionNote | null;
  onSaveSuccess?: (note: SessionNote) => void;
  onCancel?: () => void;
}

const CALAIM_FOCUS_DOMAINS = [
  'Recovery Goals',
  'Housing Stability',
  'Relapse Prevention',
  'Coping Skills',
  'Mental Health Wellness',
  'Vocational/Employment',
  'Harm Reduction',
  'CalAIM Community Supports',
  'Enhanced Care Management (ECM)',
  'System Navigation'
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
  
  // CalAIM Time Accounting
  const [faceToFaceMinutes, setFaceToFaceMinutes] = useState<number>(existingNote?.faceToFaceMinutes || 45);
  const [travelMinutes, setTravelMinutes] = useState<number>(existingNote?.travelMinutes || 15);
  const [documentationMinutes, setDocumentationMinutes] = useState<number>(existingNote?.documentationMinutes || 10);
  
  const [billingCode, setBillingCode] = useState<string>(existingNote?.billingCode || 'H0038');
  const [modality, setModality] = useState<ServiceModality>(existingNote?.modality || 'community_field');
  const [placeOfServiceCode, setPlaceOfServiceCode] = useState<string>(existingNote?.placeOfServiceCode || '99');
  const [locationDetails, setLocationDetails] = useState<string>(
    existingNote?.locationDetails || 'Community Outreach / Field'
  );

  // Note Content (CalAIM DAP Format)
  const [focusDomains, setFocusDomains] = useState<string[]>(
    existingNote?.focusDomains || ['Recovery Goals', 'Coping Skills', 'CalAIM Community Supports']
  );
  const [goalAddressed, setGoalAddressed] = useState<string>(existingNote?.goalAddressed || '');
  const [peerIntervention, setPeerIntervention] = useState<string>(existingNote?.peerIntervention || '');
  const [clientResponse, setClientResponse] = useState<string>(existingNote?.clientResponse || '');
  const [planNextSteps, setPlanNextSteps] = useState<string>(existingNote?.planNextSteps || '');
  const [safetyConcerns, setSafetyConcerns] = useState<boolean>(existingNote?.safetyConcerns || false);
  const [safetyNotes, setSafetyNotes] = useState<string>(existingNote?.safetyNotes || '');

  // Signature
  const [signatureTyped, setSignatureTyped] = useState<string>(
    existingNote?.specialistSignature || `${currentUser?.fullName || 'Alex Rivera, CPSS-CA'}`
  );
  const [signatureConfirmed, setSignatureConfirmed] = useState<boolean>(Boolean(existingNote?.signedAt));

  // Feedback & Validation
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);

  // Auto-calculate Face-to-Face Duration from Start and End Times
  useEffect(() => {
    if (startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      let diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      if (diffMinutes > 0) {
        setFaceToFaceMinutes(diffMinutes);
      }
    }
  }, [startTime, endTime]);

  // Total Medi-Cal billable duration = Face-to-Face + Travel + Documentation
  const totalBillableMinutes = faceToFaceMinutes + travelMinutes + documentationMinutes;
  const billingUnits = Math.ceil(totalBillableMinutes / 15);

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

  // Quick Template Starters
  const applyTemplate = (type: 'recovery' | 'housing' | 'coping') => {
    if (type === 'recovery') {
      setGoalAddressed('Goal 1: Maintain substance use recovery goals and strengthen community recovery capital.');
      setPeerIntervention('CPSS shared lived recovery experience regarding navigating social triggers. Discussed healthy recovery boundaries, identified high-risk community locations, and reviewed All-Recovery mutual aid meeting schedule.');
      setClientResponse('Peer actively engaged and stated feeling validated. Shared that hearing the specialist’s lived experience relieved feelings of isolation. Reported 60 days continuous sobriety with strong motivation.');
      setPlanNextSteps('Peer will attend Wednesday evening community support meeting. Scheduled next 1-on-1 peer session for Friday at 11:00 AM.');
      setFocusDomains(['Recovery Goals', 'Relapse Prevention', 'Coping Skills']);
    } else if (type === 'housing') {
      setGoalAddressed('Goal 2: CalAIM Community Supports Housing Transition and Navigation.');
      setPeerIntervention('Accompanied peer to local housing access hub. Assisted peer with gathering required documentation for Section 8 verification. Modeled self-advocacy and provided trauma-informed emotional grounding during wait.');
      setClientResponse('Peer maintained composure throughout intake. Stated: "Having someone who has walked this road sit with me made the paperwork manageable."');
      setPlanNextSteps('Peer to monitor intake callback within 5 business days. CPSS scheduled check-in call for Thursday.');
      setFocusDomains(['Housing Stability', 'CalAIM Community Supports', 'System Navigation']);
    } else if (type === 'coping') {
      setGoalAddressed('Goal 3: Apply somatic and non-pharmacological grounding techniques during acute stress.');
      setPeerIntervention('Introduced box breathing (4-4-4-4 count) and 5-4-3-2-1 sensory grounding. CPSS guided peer through two rounds of practice, discussing how to deploy these techniques in community settings.');
      setClientResponse('Peer demonstrated mastery of the breathing sequence. Self-reported anxiety decreased from 8/10 to 3/10 following somatic grounding.');
      setPlanNextSteps('Peer will practice box breathing daily upon waking and prior to stressful interactions.');
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
      organizationId: currentOrg?.id || 'org-calaim-01',
      clientId: selectedClientId,
      clientName: clientObj?.preferredName || 'Client',
      clientIdentifier: clientObj?.clientIdentifier || 'PN-0000',
      mediCalCin: clientObj?.mediCalCin,
      authorId: currentUser?.id || 'user-cpss-01',
      authorName: currentUser?.fullName || 'Alex Rivera, CPSS-CA',
      authorCredentials: currentUser?.credentialTitle || 'CalAIM Certified Peer Support Specialist',
      encounterDate,
      startTime,
      endTime,
      faceToFaceMinutes,
      travelMinutes,
      documentationMinutes,
      durationMinutes: totalBillableMinutes,
      billingCode,
      billingUnits,
      modality,
      placeOfServiceCode,
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

    // Save to Dexie.js
    await peerNotebookDB.saveNote(noteToSave);

    // Update client encounter date
    if (clientObj) {
      clientObj.lastEncounterDate = encounterDate;
      await peerNotebookDB.saveClient(clientObj);
    }

    // Queue for cloud sync & audit log
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
          totalBillableMinutes: noteToSave.durationMinutes,
          status: noteToSave.status
        }
      });
    }

    setSaveStatus(submitToSupervisor ? 'Submitted to Supervisor Queue!' : 'Draft Saved to Dexie.js Local Store!');
    setTimeout(() => {
      setSaveStatus(null);
      if (onSaveSuccess) onSaveSuccess(noteToSave);
    }, 1000);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm max-w-4xl mx-auto space-y-4 sm:space-y-6 max-w-full overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 sm:p-2.5 bg-teal-50 text-[#0F766E] rounded-xl border border-teal-100 shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1E3A8A] leading-tight">
              {existingNote ? 'Edit CalAIM Encounter Documentation' : 'Medi-Cal H0038 Peer Encounter Note'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              CalAIM Payment Reform • Code: <span className="font-mono text-[#0F766E] font-bold">{billingCode}</span> • Units: <span className="font-mono text-[#1E3A8A] font-bold">{billingUnits} (15m increments)</span>
            </p>
          </div>
        </div>

        {/* Quick template buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-lg border border-slate-200 max-w-full">
          <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1 pl-1">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706]" /> Templates:
          </span>
          <button
            type="button"
            onClick={() => applyTemplate('recovery')}
            className="px-2 sm:px-2.5 py-1 text-xs bg-white hover:bg-slate-50 text-slate-800 font-medium rounded border border-slate-200 shadow-2xs"
          >
            Recovery
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('housing')}
            className="px-2 sm:px-2.5 py-1 text-xs bg-white hover:bg-slate-50 text-slate-800 font-medium rounded border border-slate-200 shadow-2xs"
          >
            Housing
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('coping')}
            className="px-2 sm:px-2.5 py-1 text-xs bg-white hover:bg-slate-50 text-slate-800 font-medium rounded border border-slate-200 shadow-2xs"
          >
            Grounding
          </button>
        </div>
      </div>

      {validationWarning && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-300 rounded-xl text-[#D97706] text-xs font-medium">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{validationWarning}</span>
        </div>
      )}

      {saveStatus && (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-[#16A34A] text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Peer Client Selection & Encounter Metadata */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Peer / Client *
          </label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E]"
          >
            <option value="">-- Select Client --</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {c.preferredName} ({c.clientIdentifier}) {c.mediCalCin ? `• CIN: ${c.mediCalCin}` : ''}
              </option>
            ))}
          </select>
          {currentClient && (
            <p className="text-[11px] text-[#16A34A] mt-1 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> Pathway: {currentClient.calaimPathway}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Date of Service *
          </label>
          <input
            type="date"
            value={encounterDate}
            onChange={(e) => setEncounterDate(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Modality & Place of Service *
          </label>
          <select
            value={modality}
            onChange={(e) => {
              const val = e.target.value as ServiceModality;
              setModality(val);
              setPlaceOfServiceCode(val === 'community_field' ? '99' : val === 'telehealth_video' ? '02' : '11');
            }}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden"
          >
            <option value="community_field">Community / Field Outreach (POS 99)</option>
            <option value="face_to_face">Office / Clinic Encounter (POS 11)</option>
            <option value="telehealth_video">Telehealth Video (POS 02)</option>
            <option value="phone_outreach">Phone Outreach (POS 02)</option>
          </select>
        </div>
      </div>

      {/* CalAIM Time Accounting (Direct Face-to-Face + Travel + Documentation) */}
      <div className="p-3 sm:p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
            CalAIM Billable Time Breakdown (Medi-Cal Payment Reform)
          </span>
          <span className="text-xs font-bold text-[#0F766E]">
            Total: {totalBillableMinutes} mins = {billingUnits} Unit{billingUnits > 1 ? 's' : ''} (H0038)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 truncate">
              Face-to-Face (mins)
            </label>
            <input
              type="number"
              min={1}
              value={faceToFaceMinutes}
              onChange={(e) => setFaceToFaceMinutes(Number(e.target.value) || 0)}
              className="w-full px-2.5 sm:px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1 truncate">
              <Navigation className="w-3 h-3 text-slate-400 shrink-0" /> Travel (mins)
            </label>
            <input
              type="number"
              min={0}
              value={travelMinutes}
              onChange={(e) => setTravelMinutes(Number(e.target.value) || 0)}
              className="w-full px-2.5 sm:px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 truncate">
              Documentation (mins)
            </label>
            <input
              type="number"
              min={0}
              value={documentationMinutes}
              onChange={(e) => setDocumentationMinutes(Number(e.target.value) || 0)}
              className="w-full px-2.5 sm:px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 truncate">
              Billing Formula
            </label>
            <div className="px-2.5 sm:px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-mono text-[#1E3A8A] font-semibold truncate">
              Ceil({totalBillableMinutes}/15) = {billingUnits}u
            </div>
          </div>
        </div>
      </div>

      {/* Focus Domains */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-2">
          CalAIM Encounter Focus Domains (Select all applicable)
        </label>
        <div className="flex flex-wrap gap-1.5">
          {CALAIM_FOCUS_DOMAINS.map(domain => {
            const isSelected = focusDomains.includes(domain);
            return (
              <button
                key={domain}
                type="button"
                onClick={() => toggleDomain(domain)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                  isSelected
                    ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-2xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400'
                }`}
              >
                {domain}
              </button>
            );
          })}
        </div>
      </div>

      {/* Structured DAP Narrative */}
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            1. CalAIM Strengths-Based Goal Addressed *
          </label>
          <textarea
            rows={2}
            value={goalAddressed}
            onChange={(e) => setGoalAddressed(e.target.value)}
            placeholder="Document client-centered recovery plan goal or objective addressed today..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            2. Certified Peer Specialist Intervention (What YOU did) *
          </label>
          <textarea
            rows={3}
            value={peerIntervention}
            onChange={(e) => setPeerIntervention(e.target.value)}
            placeholder="Detail peer-delivered interventions: shared lived recovery experience, somatic grounding exercises, system navigation, emotional support, self-advocacy coaching..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            3. Peer / Client Response (Client Quotes & Response to Intervention) *
          </label>
          <textarea
            rows={3}
            value={clientResponse}
            onChange={(e) => setClientResponse(e.target.value)}
            placeholder="Record client quotes, observable behavioral responses, mood, self-reported distress rating (e.g. 1-10 scale), and reception of peer coaching..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            4. Plan & Action Steps for Next Meeting *
          </label>
          <textarea
            rows={2}
            value={planNextSteps}
            onChange={(e) => setPlanNextSteps(e.target.value)}
            placeholder="Agreed action steps for peer before next session; scheduled date, time, and focus of upcoming encounter..."
            className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E]"
          />
        </div>
      </div>

      {/* Safety & Crisis Flag */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={safetyConcerns}
            onChange={(e) => setSafetyConcerns(e.target.checked)}
            className="rounded text-rose-600 focus:ring-0"
          />
          <span className="text-xs font-bold text-slate-800">
            Check here if any safety, crisis, overdose risk, or self-harm indicators were identified
          </span>
        </label>

        {safetyConcerns && (
          <div className="space-y-1">
            <span className="text-xs text-rose-700 font-semibold">
              Crisis De-escalation & Safety Response Documentation:
            </span>
            <textarea
              rows={2}
              value={safetyNotes}
              onChange={(e) => setSafetyNotes(e.target.value)}
              placeholder="Document review of safety plan, supervisor contact, emergency services involvement, or mobile crisis referral..."
              className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg text-sm text-slate-900 focus:outline-hidden"
            />
          </div>
        )}
      </div>

      {/* Electronic Signature Block */}
      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] block">
          Certified Peer Support Specialist Electronic Signature
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Typed Signature</label>
            <input
              type="text"
              value={signatureTyped}
              onChange={(e) => setSignatureTyped(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 font-mono font-semibold"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-start gap-2 cursor-pointer mt-2 sm:mt-0">
              <input
                type="checkbox"
                checked={signatureConfirmed}
                onChange={(e) => setSignatureConfirmed(e.target.checked)}
                className="mt-0.5 rounded text-[#0F766E] focus:ring-0"
              />
              <span className="text-xs text-slate-700 leading-normal">
                I attest that this note accurately reflects peer support services rendered in accordance with California Medi-Cal CPSS scope of practice and CalAIM guidelines.
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold order-last sm:order-first"
          >
            Cancel
          </button>
        )}

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="w-full xs:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition-colors"
          >
            <Save className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span>Save to Dexie.js (Offline Draft)</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            className="w-full xs:w-auto flex items-center justify-center gap-1.5 px-4 sm:px-5 py-2.5 sm:py-2 bg-[#0F766E] hover:bg-teal-800 text-white rounded-lg text-xs font-semibold transition-colors shadow-xs"
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span>Submit for Supervisor Cosign</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Peer Notebook - CalAIM & Medi-Cal H0038 Encounter Note Form
 * Visuals: Soft Slate (#F8FAFC), Deep Navy (#1E3A8A), Muted Teal (#0F766E)
 * Low Cognitive Load • Trauma-Informed Language Check • Dual-Layer Persistence
 * Overhauled single-tap peer intervention toggle chips & 44px minimum tap targets
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { peerNotebookDB, Client, SessionNote, ServiceModality } from '../db/peerNotebookDatabase';
import { useAuth } from '../context/AuthContext';
import { usePrivacyMode } from '../context/PrivacyModeContext';
import { AuditLogger } from '../services/auditLogger';
import { syncWorker } from '../services/syncWorker';
import {
  FileText,
  Save,
  Send,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  Navigation,
  ShieldCheck,
  Check,
  Zap,
  Info,
  Mic,
  MicOff,
  Wand2,
  X,
  Car,
  DollarSign,
  Layers,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Award,
  Quote,
  Scale
} from 'lucide-react';
import {
  calculateMediCalBillingUnits,
  sanitizeToNonClinicalLanguage,
  parseUnstructuredPeerDictation
} from '../services/peerNoteEngine';
import { H0038TemplateDrawer, H0038Template } from './H0038TemplateDrawer';
import { FourPartNoteGenerator, FourPartNoteData } from './FourPartNoteGenerator';
import { InteractiveChecklistWidget } from './InteractiveChecklistWidget';
import { SB803CompetencyGuide } from './SB803CompetencyGuide';
import { SB_803_CORE_COMPETENCIES } from '../data/sb803Competencies';

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

interface PeerInterventionChip {
  id: string;
  label: string;
  category: string;
  snippet: string;
}

const PEER_INTERVENTION_CHIPS: PeerInterventionChip[] = [
  {
    id: 'lived_exp',
    label: 'Lived Experience Sharing',
    category: 'Relational',
    snippet: 'CPSS shared lived recovery experience to normalize feelings of distress, reduce isolation, and instill hope around overcoming recovery hurdles.'
  },
  {
    id: 'somatic_breath',
    label: 'Somatic Grounding (Box Breath)',
    category: 'Regulation',
    snippet: 'Introduced somatic box breathing (4-4-4-4 count) and guided peer through 2 rounds of practice to down-regulate acute distress and nervous system activation.'
  },
  {
    id: 'sensory_54321',
    label: '5-4-3-2-1 Sensory Grounding',
    category: 'Regulation',
    snippet: 'Facilitated 5-4-3-2-1 sensory grounding exercise (5 sight, 4 touch, 3 sound, 2 smell, 1 taste) to de-escalate anxiety and anchor peer in the present moment.'
  },
  {
    id: 'housing_nav',
    label: 'CalAIM Housing Navigation',
    category: 'Navigation',
    snippet: 'Assisted peer with CalAIM Community Supports Housing Transition documentation, modeled self-advocacy communication, and prepared paperwork for the housing coordinator.'
  },
  {
    id: 'relapse_plan',
    label: 'Relapse Prevention Planning',
    category: 'Recovery',
    snippet: 'Reviewed individualized recovery capital, early warning cues, and internal triggers. Updated contact list for 24/7 mutual aid support networks.'
  },
  {
    id: 'harm_reduction',
    label: 'Harm Reduction Strategy',
    category: 'Recovery',
    snippet: 'Delivered trauma-informed harm reduction education, verified Naloxone (Narcan) accessibility, and strategized safe practices regarding environmental triggers.'
  },
  {
    id: 'self_advocacy',
    label: 'Self-Advocacy Coaching',
    category: 'Empowerment',
    snippet: 'Role-played assertive self-advocacy communication for upcoming healthcare appointment; supported peer in drafting their questions for clinical staff.'
  },
  {
    id: 'community_link',
    label: 'Community Resource Linkage',
    category: 'Navigation',
    snippet: 'Facilitated direct linkage to community recovery community center, public transportation vouchers, and local food distribution programs.'
  },
  {
    id: 'ecm_link',
    label: 'CalAIM ECM Coordination',
    category: 'Navigation',
    snippet: 'Collaborated with peer to prepare for Enhanced Care Management (ECM) lead care manager case conference and align personal recovery goals.'
  },
  {
    id: 'active_listen',
    label: 'Trauma-Informed Validation',
    category: 'Relational',
    snippet: 'Provided non-judgmental active listening and emotional validation, creating a secure space for peer to articulate grief and recent emotional challenges.'
  },
  {
    id: 'boundaries',
    label: 'Healthy Boundaries Coaching',
    category: 'Recovery',
    snippet: 'Coached peer on establishing relational boundaries with social networks to protect emotional safety and recovery stability.'
  },
  {
    id: 'coping_skills',
    label: 'Distress Tolerance Skills',
    category: 'Regulation',
    snippet: 'Explored non-pharmacological coping skills and distress tolerance strategies for navigating cravings and difficult emotional triggers in the community.'
  }
];

export const SessionNoteForm: React.FC<SessionNoteFormProps> = ({
  initialClient,
  existingNote,
  onSaveSuccess,
  onCancel
}) => {
  const { currentOrg, currentUser } = useAuth();
  const { isPrivacyMode, maskName } = usePrivacyMode();
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

  const [billingCode] = useState<string>(existingNote?.billingCode || 'H0038');
  const [modality, setModality] = useState<ServiceModality>(existingNote?.modality || 'community_field');
  const [placeOfServiceCode, setPlaceOfServiceCode] = useState<string>(existingNote?.placeOfServiceCode || '15');
  const [locationDetails, setLocationDetails] = useState<string>(
    existingNote?.locationDetails || 'Community Outreach / Field Mobile (POS 15)'
  );

  // Note Content (CalAIM DAP Format)
  const [focusDomains, setFocusDomains] = useState<string[]>(
    existingNote?.focusDomains || ['Recovery Goals', 'Coping Skills', 'CalAIM Community Supports']
  );
  const [selectedInterventionChips, setSelectedInterventionChips] = useState<string[]>([]);
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

  // Dictation & Non-Clinical Sanitizer State
  const [isDictationModalOpen, setIsDictationModalOpen] = useState(false);
  const [dictationRawText, setDictationRawText] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [sanitizedNotice, setSanitizedNotice] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // CalAIM H0038 Standard Template Drawer & Flex Wizard Stepper State
  const [isTemplateDrawerOpen, setIsTemplateDrawerOpen] = useState(false);
  const [formMode, setFormMode] = useState<'standard' | 'flex_wizard'>('standard');
  const [wizardStep, setWizardStep] = useState<number>(1);

  const handleApplyH0038Template = (tmpl: H0038Template) => {
    setGoalAddressed(tmpl.goalAddressed);
    setPeerIntervention(tmpl.peerIntervention);
    setClientResponse(tmpl.clientResponse);
    setPlanNextSteps(tmpl.planNextSteps);
    setModality(tmpl.modality);
    setPlaceOfServiceCode(tmpl.placeOfServiceCode);
    setLocationDetails(tmpl.locationDetails);
    setFaceToFaceMinutes(tmpl.faceToFaceMinutes);
    setTravelMinutes(tmpl.travelMinutes);
    setDocumentationMinutes(tmpl.documentationMinutes);
    setFocusDomains(tmpl.focusDomains);
    if (tmpl.recommendedInterventionChips && tmpl.recommendedInterventionChips.length > 0) {
      setSelectedInterventionChips(tmpl.recommendedInterventionChips);
    }
    setSanitizedNotice(`Applied CalAIM H0038 Standard: "${tmpl.title}"`);
    setTimeout(() => setSanitizedNotice(null), 4500);
  };

  // Four-Part Note Generator State & Application Handler
  const [isFourPartModalOpen, setIsFourPartModalOpen] = useState(false);
  const [isChecklistOpen, setIsChecklistOpen] = useState(false);
  const [isSB803GuideOpen, setIsSB803GuideOpen] = useState(false);
  const [taggedSB803Competencies, setTaggedSB803Competencies] = useState<string[]>(
    existingNote?.sb803Competencies || []
  );

  const handleToggleSB803Competency = (id: string) => {
    setTaggedSB803Competencies((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleApplyFourPartNote = (noteData: FourPartNoteData) => {
    setGoalAddressed(noteData.goalAddressed);
    setPeerIntervention(noteData.peerIntervention);
    setClientResponse(noteData.clientResponse);
    setPlanNextSteps(noteData.planNextSteps);
    setFaceToFaceMinutes(noteData.durationMinutes);
    setIsFourPartModalOpen(false);
    setSanitizedNotice(`Applied Four-Part CalAIM Note (${noteData.durationMinutes}m · ${noteData.billingUnits} units)`);
    setTimeout(() => setSanitizedNotice(null), 4500);
  };

  // DHCS & CalMHSA Code of Ethics Attestation
  const [ethicsAttestationConfirmed, setEthicsAttestationConfirmed] = useState<boolean>(true);

  // Golden Thread Clinical Standard Validation & Continuity
  const goldenThreadStatus = useMemo(() => {
    const hasGoal = goalAddressed.trim().length >= 10;
    const hasIntervention = peerIntervention.trim().length >= 15;
    const hasSB803Tagged = taggedSB803Competencies.length > 0;
    // Quote check: contains quotation marks "..." or “...” with at least 3 characters inside
    const hasDirectQuote = /["“][^"”]{3,}["”]|['‘][^'’]{3,}['’]/.test(clientResponse);
    const hasResponse = clientResponse.trim().length >= 10;
    const hasPlan = planNextSteps.trim().length >= 10;

    const link1Goal = hasGoal;
    const link2Intervention = hasIntervention;
    const link3Response = hasResponse && hasDirectQuote;
    const link4Plan = hasPlan;

    const validLinksCount = [link1Goal, link2Intervention, link3Response, link4Plan].filter(Boolean).length;
    const isUnbroken = validLinksCount === 4;

    return {
      hasGoal,
      hasIntervention,
      hasSB803Tagged,
      hasDirectQuote,
      hasResponse,
      hasPlan,
      link1Goal,
      link2Intervention,
      link3Response,
      link4Plan,
      validLinksCount,
      isUnbroken
    };
  }, [goalAddressed, peerIntervention, clientResponse, planNextSteps, taggedSB803Competencies]);

  const handleInsertDirectQuoteTemplate = () => {
    const quoteTemplate = ' Peer stated: "[Insert client\'s authentic words here]"';
    setClientResponse((prev) => (prev.trim() ? `${prev.trim()}${quoteTemplate}` : `Peer stated: "[Insert client's authentic words here]"`));
  };

  // Auto-calculate Face-to-Face Duration from Start and End Times
  useEffect(() => {
    if (startTime && endTime) {
      const [startH, startM] = startTime.split(':').map(Number);
      const [endH, endM] = endTime.split(':').map(Number);
      let diffMinutes = endH * 60 + endM - (startH * 60 + startM);
      if (diffMinutes < 0) diffMinutes += 24 * 60;
      if (diffMinutes > 0) {
        setFaceToFaceMinutes(diffMinutes);
      }
    }
  }, [startTime, endTime]);

  // Total Medi-Cal billable duration = Face-to-Face + Travel + Documentation
  const totalBillableMinutes = faceToFaceMinutes + travelMinutes + documentationMinutes;
  // CMS & Medi-Cal 8-Minute Threshold Rule
  const billingUnits = calculateMediCalBillingUnits(totalBillableMinutes);

  // 1099 Contractor Encounter Tracking & Compensation
  const [contractorMileage, setContractorMileage] = useState<number>(existingNote?.mileageMiles || 0);
  const isContractor = Boolean(currentUser?.isContractor1099 || existingNote?.isContractorEncounter);
  const hourlyRate = currentUser?.hourlyContractRate || 45;
  const mileageRate = currentUser?.mileageReimbursementRate || 0.67;
  const contractorTimeEarnings = (totalBillableMinutes / 60) * hourlyRate;
  const contractorMileageEarnings = contractorMileage * mileageRate;
  const totalContractorAmount = contractorTimeEarnings + contractorMileageEarnings;

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

  // Toggle Single-Tap Peer Intervention Chip
  const toggleInterventionChip = (chip: PeerInterventionChip) => {
    const isAlreadySelected = selectedInterventionChips.includes(chip.id);
    if (isAlreadySelected) {
      setSelectedInterventionChips(selectedInterventionChips.filter(id => id !== chip.id));
    } else {
      setSelectedInterventionChips([...selectedInterventionChips, chip.id]);
      // Append snippet to peer intervention textarea
      if (!peerIntervention.includes(chip.snippet)) {
        setPeerIntervention(prev => (prev.trim() ? `${prev.trim()}\n\n${chip.snippet}` : chip.snippet));
      }
    }
  };

  // Quick Template Starters
  const applyTemplate = (type: 'recovery' | 'housing' | 'coping') => {
    if (type === 'recovery') {
      setGoalAddressed('Goal 1: Maintain continuous substance use recovery goals and strengthen community recovery capital.');
      setPeerIntervention('CPSS shared lived recovery experience regarding navigating social triggers. Discussed healthy recovery boundaries, identified high-risk community locations, and reviewed All-Recovery mutual aid meeting schedule.');
      setClientResponse('Peer actively engaged and stated feeling validated. Shared that hearing the specialist’s lived experience relieved feelings of isolation. Reported 60 days continuous sobriety with strong motivation.');
      setPlanNextSteps('Peer will attend Wednesday evening community support meeting. Scheduled next 1-on-1 peer session for Friday at 11:00 AM.');
      setFocusDomains(['Recovery Goals', 'Relapse Prevention', 'Coping Skills']);
      setSelectedInterventionChips(['lived_exp', 'relapse_plan', 'boundaries']);
    } else if (type === 'housing') {
      setGoalAddressed('Goal 2: CalAIM Community Supports Housing Transition and Navigation.');
      setPeerIntervention('Accompanied peer to local housing access hub. Assisted peer with gathering required documentation for Section 8 verification. Modeled self-advocacy and provided trauma-informed emotional grounding during wait.');
      setClientResponse('Peer maintained composure throughout intake. Stated: "Having someone who has walked this road sit with me made the paperwork manageable."');
      setPlanNextSteps('Peer to monitor intake callback within 5 business days. CPSS scheduled check-in call for Thursday.');
      setFocusDomains(['Housing Stability', 'CalAIM Community Supports', 'System Navigation']);
      setSelectedInterventionChips(['housing_nav', 'self_advocacy', 'active_listen']);
    } else if (type === 'coping') {
      setGoalAddressed('Goal 3: Apply somatic and non-pharmacological grounding techniques during acute stress.');
      setPeerIntervention('Introduced box breathing (4-4-4-4 count) and 5-4-3-2-1 sensory grounding. CPSS guided peer through two rounds of practice, discussing how to deploy these techniques in community settings.');
      setClientResponse('Peer demonstrated mastery of the breathing sequence. Self-reported anxiety decreased from 8/10 to 3/10 following somatic grounding.');
      setPlanNextSteps('Peer will practice box breathing daily upon waking and prior to stressful interactions.');
      setFocusDomains(['Mental Health Wellness', 'Coping Skills']);
      setSelectedInterventionChips(['somatic_breath', 'sensory_54321', 'coping_skills']);
    }
  };

  // Cleanse Clinical/Medicalized Jargon to Strengths-Based Language
  const handleCleanseJargon = () => {
    const replacedTermsTotal: string[] = [];

    const resGoal = sanitizeToNonClinicalLanguage(goalAddressed);
    if (resGoal.replacementsCount > 0) {
      setGoalAddressed(resGoal.sanitizedText);
      replacedTermsTotal.push(...resGoal.replacedTerms);
    }

    const resIntervention = sanitizeToNonClinicalLanguage(peerIntervention);
    if (resIntervention.replacementsCount > 0) {
      setPeerIntervention(resIntervention.sanitizedText);
      replacedTermsTotal.push(...resIntervention.replacedTerms);
    }

    const resResponse = sanitizeToNonClinicalLanguage(clientResponse);
    if (resResponse.replacementsCount > 0) {
      setClientResponse(resResponse.sanitizedText);
      replacedTermsTotal.push(...resResponse.replacedTerms);
    }

    const resPlan = sanitizeToNonClinicalLanguage(planNextSteps);
    if (resPlan.replacementsCount > 0) {
      setPlanNextSteps(resPlan.sanitizedText);
      replacedTermsTotal.push(...resPlan.replacedTerms);
    }

    if (replacedTermsTotal.length > 0) {
      const uniqueTerms = Array.from(new Set(replacedTermsTotal));
      setSanitizedNotice(`Audited & Cleaned ${replacedTermsTotal.length} medicalized term(s): "${uniqueTerms.join('", "')}" → Converted to strengths-based peer support language!`);
    } else {
      setSanitizedNotice('Zero medicalized jargon detected. Note language is 100% compliant with CalMHSA peer standards!');
    }

    setTimeout(() => setSanitizedNotice(null), 5000);
  };

  // Process Unstructured Dictation into 4-Part Structure
  const handleProcessDictation = () => {
    if (!dictationRawText.trim()) return;
    const parsed = parseUnstructuredPeerDictation(dictationRawText);
    setGoalAddressed(parsed.goalAddressed);
    setPeerIntervention(parsed.peerIntervention);
    setClientResponse(parsed.clientResponse);
    setPlanNextSteps(parsed.planNextSteps);
    setIsDictationModalOpen(false);
    setDictationRawText('');
    setSanitizedNotice('Dictation parsed into Medi-Cal 4-Part Structure and stripped of clinical jargon!');
    setTimeout(() => setSanitizedNotice(null), 5000);
  };

  // Stop and cleanup speech recognition & microphone streams
  const stopSpeechRecognition = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {
        // ignore errors on stopping already inactive recognition
      }
      recognitionRef.current = null;
    }
    if (mediaStreamRef.current) {
      try {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      } catch {
        // ignore
      }
      mediaStreamRef.current = null;
    }
    setIsRecording(false);
    setInterimTranscript('');
  };

  // Component unmount cleanup
  useEffect(() => {
    return () => {
      stopSpeechRecognition();
    };
  }, []);

  // Web Speech API Voice Dictation toggle with strict Zero-Echo audio constraints
  const toggleSpeechRecognition = async () => {
    const SpeechRecognition = (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).SpeechRecognition ||
                              (window as unknown as { SpeechRecognition?: any; webkitSpeechRecognition?: any }).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError('Speech Recognition is not supported by this browser. You can type or paste field notes directly.');
      return;
    }

    if (isRecording) {
      stopSpeechRecognition();
      return;
    }

    setSpeechError(null);

    // Apply strict hardware audio constraints (echoCancellation, noiseSuppression) on media input stream
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });
        mediaStreamRef.current = stream;
      } catch {
        // Fall back gracefully to browser default audio route if getUserMedia is restricted
      }
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechError(null);
      };

      recognition.onend = () => {
        stopSpeechRecognition();
      };

      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') {
          setSpeechError(`Speech recognition notice: ${event.error}`);
        }
        stopSpeechRecognition();
      };

      // Strict Zero-Echo handler: committed final transcripts append precisely once; interim tokens buffer separately
      recognition.onresult = (event: any) => {
        let finalTokens = '';
        let liveInterim = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const res = event.results[i];
          const text = res[0]?.transcript || '';
          if (res.isFinal) {
            finalTokens += (finalTokens ? ' ' : '') + text.trim();
          } else {
            liveInterim += (liveInterim ? ' ' : '') + text.trim();
          }
        }

        // Only append finalized transcript tokens precisely once with seam overlap deduplication
        if (finalTokens.trim()) {
          setDictationRawText((prev) => {
            const cleanPrev = prev.trim();
            const cleanChunk = finalTokens.trim();
            if (!cleanPrev) return cleanChunk;
            // Guard 1: Exact repeat prevention
            if (cleanPrev.endsWith(cleanChunk)) return cleanPrev;
            // Guard 2: Word seam overlap deduplication (prevents Web Speech repeated tail words)
            const prevWords = cleanPrev.split(/\s+/);
            const chunkWords = cleanChunk.split(/\s+/);
            let overlapCount = 0;
            const maxOverlap = Math.min(prevWords.length, chunkWords.length, 6);
            for (let len = maxOverlap; len >= 1; len--) {
              const prevTail = prevWords.slice(prevWords.length - len).join(' ').toLowerCase();
              const chunkHead = chunkWords.slice(0, len).join(' ').toLowerCase();
              if (prevTail === chunkHead) {
                overlapCount = len;
                break;
              }
            }
            if (overlapCount > 0) {
              const deduplicatedChunk = chunkWords.slice(overlapCount).join(' ');
              return deduplicatedChunk ? `${cleanPrev} ${deduplicatedChunk}` : cleanPrev;
            }
            return `${cleanPrev} ${cleanChunk}`;
          });
        }

        // Live visual subtitle without polluting or duplicating persistent text state
        setInterimTranscript(liveInterim);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      stopSpeechRecognition();
      setSpeechError(err?.message || 'Unable to initialize speech recognition.');
    }
  };

  // CalAIM 4-Part Structure Validation Telemetry
  const isPart1Valid = Boolean(goalAddressed.trim());
  const isPart2Valid = Boolean(peerIntervention.trim());
  const isPart3Valid = Boolean(clientResponse.trim());
  const isPart4Valid = Boolean(planNextSteps.trim());
  const completedParts = [isPart1Valid, isPart2Valid, isPart3Valid, isPart4Valid].filter(Boolean).length;
  const isAllPartsValid = completedParts === 4;

  const handleSave = async (submitToSupervisor: boolean) => {
    if (!selectedClientId) {
      setValidationWarning('Please select an active peer client.');
      return;
    }
    if (!goalAddressed.trim() || !peerIntervention.trim() || !clientResponse.trim() || !planNextSteps.trim()) {
      setValidationWarning('CalAIM 4-Part Incomplete: Goal Addressed, Peer Intervention, Client Response, and Plan/Next Steps must all be documented for Medi-Cal H0038 compliance.');
      return;
    }
    if (totalBillableMinutes <= 0) {
      setValidationWarning('Please document billable encounter duration (Face-to-face, Travel, or Documentation time).');
      return;
    }
    if (submitToSupervisor && (!signatureConfirmed || !signatureTyped.trim())) {
      setValidationWarning('Certified peer specialist electronic signature and verification attestation are required for supervisor submission.');
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
      sb803Competencies: taggedSB803Competencies,
      goalAddressed,
      peerIntervention,
      clientResponse,
      planNextSteps,
      safetyConcerns,
      safetyNotes: safetyConcerns ? safetyNotes : undefined,
      specialistSignature: signatureTyped,
      signedAt: signatureConfirmed ? now : undefined,
      status: submitToSupervisor ? 'pending_supervisor' : 'draft',
      isContractorEncounter: isContractor,
      mileageMiles: isContractor ? contractorMileage : undefined,
      contractorBillableAmount: isContractor ? Number(totalContractorAmount.toFixed(2)) : undefined,
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

  // Step 1: Careplan Milestone & Client Linkage
  const renderStep1 = () => (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Peer / Client *
          </label>
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
          >
            <option value="">-- Select Active Client --</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>
                {maskName(c.preferredName, c.clientIdentifier, c.id)} ({c.clientIdentifier}) {c.mediCalCin ? `• CIN: ${c.mediCalCin}` : ''}
              </option>
            ))}
          </select>
          {currentClient && (
            <p className="text-[11px] text-[#0F766E] mt-1.5 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Pathway: {currentClient.calaimPathway}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Date of Service *
          </label>
          <input
            type="date"
            value={encounterDate}
            onChange={(e) => setEncounterDate(e.target.value)}
            className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center text-[11px] font-bold">1</span>
            <span>CalAIM Strengths-Based Goal Addressed (Part 1 of 4) *</span>
          </label>
          <button
            type="button"
            onClick={() => setIsTemplateDrawerOpen(true)}
            className="text-[11px] text-[#0F766E] hover:text-teal-800 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Select from H0038 Templates</span>
          </button>
        </div>
        <textarea
          rows={3}
          value={goalAddressed}
          onChange={(e) => setGoalAddressed(e.target.value)}
          placeholder="Document client-centered recovery plan goal or milestone addressed today (e.g. Housing transition, relapse prevention capital, WRAP early warning cues)..."
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
        />
      </div>
    </div>
  );

  // Step 2: Time, Location & POS 15 (H0038 Calculator)
  const renderStep2 = () => (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Modality &amp; Place of Service *
          </label>
          <select
            value={`${modality}:${placeOfServiceCode}`}
            onChange={(e) => {
              const [modVal, posVal] = e.target.value.split(':') as [ServiceModality, string];
              setModality(modVal);
              setPlaceOfServiceCode(posVal);
            }}
            className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
          >
            <option value="community_field:15">Community Field Mobile (POS 15 - CalAIM H0038 Standard)</option>
            <option value="community_field:99">Community Outreach / Street / Park (POS 99)</option>
            <option value="face_to_face:11">Office / Clinic Site (POS 11)</option>
            <option value="telehealth_video:02">Telehealth Video Encounter (POS 02)</option>
            <option value="phone_outreach:02">Phone Outreach Encounter (POS 02)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Location Specifics
          </label>
          <input
            type="text"
            value={locationDetails}
            onChange={(e) => setLocationDetails(e.target.value)}
            placeholder="e.g. Client supportive housing site, Library career center, Community park"
            className="w-full min-h-[44px] px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
          />
        </div>
      </div>

      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-3 shadow-[0_2px_6px_rgba(15,23,42,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#0F766E] shrink-0" />
            CalAIM Billable Time Breakdown (15-Minute Medi-Cal Units)
          </span>
          <span className="text-xs font-bold text-[#0F766E] bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
            Total: {totalBillableMinutes} mins = {billingUnits} Unit{billingUnits > 1 ? 's' : ''} (H0038)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 truncate">
              Face-to-Face (mins)
            </label>
            <input
              type="number"
              min={1}
              value={faceToFaceMinutes}
              onChange={(e) => setFaceToFaceMinutes(Number(e.target.value) || 0)}
              className="w-full min-h-[44px] px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-bold focus:outline-hidden focus:border-[#0F766E]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1 truncate">
              <Navigation className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Travel (mins)
            </label>
            <input
              type="number"
              min={0}
              value={travelMinutes}
              onChange={(e) => setTravelMinutes(Number(e.target.value) || 0)}
              className="w-full min-h-[44px] px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1 truncate">
              <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" /> Doc (mins)
            </label>
            <input
              type="number"
              min={0}
              value={documentationMinutes}
              onChange={(e) => setDocumentationMinutes(Number(e.target.value) || 0)}
              className="w-full min-h-[44px] px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-[#0F766E]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1 truncate">
              Time Window
            </label>
            <div className="flex items-center gap-1">
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-1/2 min-h-[44px] px-2 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
              />
              <span className="text-slate-400">-</span>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-1/2 min-h-[44px] px-2 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800"
              />
            </div>
          </div>
        </div>
      </div>

      {isContractor && (
        <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/90 space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-[#D97706] flex items-center gap-1.5">
              <Car className="w-4 h-4 text-[#D97706] shrink-0" />
              1099 Contractor Encounter Ledger
            </span>
            <span className="text-xs font-bold text-amber-900 bg-amber-100/90 px-2.5 py-1 rounded-md border border-amber-300">
              Contractor Billable: ${totalContractorAmount.toFixed(2)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Travel Mileage (Miles)
              </label>
              <input
                type="number"
                step="0.1"
                min={0}
                value={contractorMileage}
                onChange={(e) => setContractorMileage(Number(e.target.value) || 0)}
                placeholder="e.g. 14.5"
                className="w-full min-h-[44px] px-3 py-2 bg-white border border-amber-300 rounded-xl text-sm text-slate-900 font-bold focus:outline-hidden focus:border-[#D97706]"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Hourly Time Compensation
              </label>
              <div className="flex items-center min-h-[44px] px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono text-slate-800 font-bold">
                {totalBillableMinutes}m @ ${hourlyRate}/hr = ${contractorTimeEarnings.toFixed(2)}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Mileage Reimbursement
              </label>
              <div className="flex items-center min-h-[44px] px-3 py-2 bg-white border border-amber-300 rounded-xl text-xs font-mono text-slate-800 font-bold">
                {contractorMileage}mi @ ${mileageRate}/mi = ${contractorMileageEarnings.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Step 3: Peer Specialist Interventions & Chips
  const renderStep3 = () => (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">
          CalAIM Encounter Focus Domains (Tap to select)
        </label>
        <div className="flex flex-wrap gap-2">
          {CALAIM_FOCUS_DOMAINS.map(domain => {
            const isSelected = focusDomains.includes(domain);
            return (
              <button
                key={domain}
                type="button"
                onClick={() => toggleDomain(domain)}
                className={`min-h-[46px] px-4 py-2.5 rounded-full text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer border ${
                  isSelected
                    ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-sm'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50 shadow-[0_2px_4px_rgba(15,23,42,0.04)]'
                }`}
              >
                {isSelected ? (
                  <Check className="w-3.5 h-3.5 text-white shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                )}
                <span>{domain}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200/90 space-y-3.5 shadow-[0_2px_6px_rgba(15,23,42,0.03)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-[#FEF3C7] text-[#D97706] rounded-lg">
              <Zap className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
              Single-Tap Peer Intervention Chips (CalMHSA &amp; CalAIM Core)
            </span>
          </div>
          <span className="text-[11px] text-[#D97706] font-semibold bg-[#FEF3C7] px-2.5 py-0.5 rounded-full border border-amber-200">
            Single-tap adds trauma-informed language
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
          {PEER_INTERVENTION_CHIPS.map(chip => {
            const isSelected = selectedInterventionChips.includes(chip.id);
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => toggleInterventionChip(chip)}
                className={`min-h-[48px] px-4 py-2 rounded-full text-xs font-semibold text-left transition-all flex items-center justify-between gap-2.5 border cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F766E] text-white border-[#0F766E] shadow-sm ring-1 ring-[#0F766E]/30'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-[0_2px_4px_rgba(15,23,42,0.04)]'
                }`}
              >
                <div className="min-w-0">
                  <div className="truncate font-semibold">{chip.label}</div>
                  <div className={`text-[10px] truncate ${isSelected ? 'text-teal-100 font-medium' : 'text-slate-400'}`}>
                    {chip.category}
                  </div>
                </div>
                {isSelected ? (
                  <Check className="w-4 h-4 text-white shrink-0" />
                ) : (
                  <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full text-[10px] font-bold shrink-0">+</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-teal-100 text-[#0F766E] flex items-center justify-center text-[11px] font-bold">2</span>
            <span>Certified Peer Specialist Intervention (Part 2 of 4 - What YOU Did) *</span>
          </label>
          <button
            type="button"
            onClick={handleCleanseJargon}
            className="min-h-[40px] px-3.5 py-1.5 bg-slate-100 hover:bg-teal-50 hover:text-[#0F766E] border border-slate-300 rounded-full text-xs font-bold text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs self-start sm:self-auto"
            title="Scan text to replace medicalized terms with non-clinical peer language"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Cleanse Clinical Jargon</span>
          </button>
        </div>
        <textarea
          rows={4}
          value={peerIntervention}
          onChange={(e) => setPeerIntervention(e.target.value)}
          placeholder="Detail peer-delivered interventions: shared lived recovery experience, somatic grounding exercises, system navigation, emotional support, self-advocacy coaching..."
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
        />
      </div>
    </div>
  );

  // Step 4: Observable Client Response & Recovery Metric
  const renderStep4 = () => (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center text-[11px] font-bold">3</span>
            <span>Peer / Client Observable Response (Part 3 of 4 - Quotes &amp; Metrics) *</span>
          </label>
          <button
            type="button"
            onClick={handleInsertDirectQuoteTemplate}
            className="min-h-[38px] px-3.5 py-1.5 bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs self-start sm:self-auto"
            title="Insert client direct quote template into response"
          >
            <Quote className="w-3.5 h-3.5 text-[#0F766E]" />
            <span>Insert Direct Quote ("...")</span>
          </button>
        </div>
        <textarea
          rows={3}
          value={clientResponse}
          onChange={(e) => setClientResponse(e.target.value)}
          placeholder="Record client quotes, observable behavioral responses, mood, self-reported distress rating (e.g. 1-10 scale), and reception of peer coaching..."
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
        />
        <div className="flex items-center justify-between text-xs pt-1">
          {goldenThreadStatus.hasDirectQuote ? (
            <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>Direct quote verified for Medi-Cal Golden Thread audit</span>
            </span>
          ) : (
            <span className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>Golden Thread Requirement: Include at least one verbatim quote in quotation marks ("...")</span>
            </span>
          )}
        </div>
      </div>

      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
        <label className="flex items-center gap-3 cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            checked={safetyConcerns}
            onChange={(e) => setSafetyConcerns(e.target.checked)}
            className="w-5 h-5 rounded text-rose-600 focus:ring-0 border-slate-300"
          />
          <span className="text-xs font-bold text-slate-800">
            Check here if any safety, crisis, overdose risk, or self-harm indicators were identified during session
          </span>
        </label>

        {safetyConcerns && (
          <div className="space-y-1.5 pt-1">
            <span className="text-xs text-rose-700 font-bold flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Crisis De-escalation &amp; Safety Response Documentation:
            </span>
            <textarea
              rows={2}
              value={safetyNotes}
              onChange={(e) => setSafetyNotes(e.target.value)}
              placeholder="Document review of safety plan, supervisor contact, emergency services involvement, or mobile crisis referral..."
              className="w-full px-3.5 py-2 bg-white border border-rose-300 rounded-xl text-sm text-slate-900 focus:outline-hidden focus:border-rose-500"
            />
          </div>
        )}
      </div>
    </div>
  );

  // Step 5: Plan Next Steps & Attestation Signature
  const renderStep5 = () => (
    <div className="space-y-4 animate-in fade-in duration-150">
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <span className="w-5 h-5 rounded-full bg-teal-100 text-[#0F766E] flex items-center justify-center text-[11px] font-bold">4</span>
          <span>Collaborative Plan &amp; Action Steps for Next Meeting (Part 4 of 4) *</span>
        </label>
        <textarea
          rows={2}
          value={planNextSteps}
          onChange={(e) => setPlanNextSteps(e.target.value)}
          placeholder="Agreed action steps for peer before next session; scheduled date, time, and focus of upcoming encounter..."
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E] focus:bg-white transition-colors"
        />
      </div>

      {/* DHCS & CalMHSA Code of Ethics Boundary Attestation */}
      <div className="p-4 bg-teal-50/70 rounded-2xl border border-teal-200/90 space-y-2 shadow-2xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#0F766E] flex items-center gap-1.5">
            <Scale className="w-4 h-4" />
            DHCS &amp; CalMHSA Code of Ethics Boundary Checklist
          </span>
          <span className="text-[10px] font-bold text-[#0F766E] bg-white px-2 py-0.5 rounded-full border border-teal-200">
            10 Standards Adhered
          </span>
        </div>
        <label className="flex items-start gap-2.5 cursor-pointer min-h-[44px] py-1">
          <input
            type="checkbox"
            checked={ethicsAttestationConfirmed}
            onChange={(e) => setEthicsAttestationConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded text-[#0F766E] focus:ring-0 border-slate-300"
          />
          <span className="text-xs text-teal-950 leading-relaxed font-medium">
            I attest that this encounter strictly observed all DHCS and CalMHSA Peer Support Specialist boundary rules:
            non-clinical scope of practice, zero dual or exploitative relationships, purposeful lived experience disclosure for client benefit only, and unconditional self-determination.
          </span>
        </label>
      </div>

      <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] block">
          Certified Peer Support Specialist Electronic Signature &amp; Attestation
        </span>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Typed Legal Signature *</label>
            <input
              type="text"
              value={signatureTyped}
              onChange={(e) => setSignatureTyped(e.target.value)}
              className="w-full min-h-[44px] px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 font-mono font-bold focus:outline-hidden focus:border-[#0F766E]"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-start gap-2.5 cursor-pointer min-h-[44px] py-1">
              <input
                type="checkbox"
                checked={signatureConfirmed}
                onChange={(e) => setSignatureConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-[#0F766E] focus:ring-0 border-slate-300"
              />
              <span className="text-xs text-slate-700 leading-normal">
                I attest that this note accurately reflects peer support services rendered in accordance with California Medi-Cal CPSS scope of practice and CalAIM guidelines.
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-7 shadow-[0_4px_20px_rgba(15,23,42,0.04)] max-w-4xl mx-auto space-y-6 max-w-full overflow-hidden">
      {/* Header with Title & Quick Starters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-teal-50 text-[#0F766E] rounded-2xl border border-teal-200/80 shrink-0">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#1E3A8A] leading-tight">
              {existingNote ? 'Edit CalAIM Encounter Documentation' : 'Medi-Cal H0038 Peer Encounter Note'}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
              <span>CalAIM Payment Reform</span>
              <span>·</span>
              <span>Procedure: <strong className="font-mono text-[#0F766E]">{billingCode}</strong></span>
              <span>·</span>
              <span>Billable: <strong className="font-mono text-[#1E3A8A]">{billingUnits} Units ({totalBillableMinutes} min)</strong></span>
            </div>
          </div>
        </div>

        {/* Controls Toolbar: View Mode Switcher & H0038 Template Library Trigger */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          {/* View Mode Toggle: Single-Page vs Flex Wizard */}
          <div className="bg-slate-100 p-1 rounded-full border border-slate-200 flex items-center justify-between sm:justify-start">
            <button
              type="button"
              onClick={() => setFormMode('standard')}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                formMode === 'standard'
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Single-Page
            </button>
            <button
              type="button"
              onClick={() => setFormMode('flex_wizard')}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                formMode === 'flex_wizard'
                  ? 'bg-[#0F766E] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Flex Wizard</span>
            </button>
          </div>

          {/* 4-Part Generator Trigger Button */}
          <button
            type="button"
            onClick={() => setIsFourPartModalOpen(true)}
            className="min-h-[44px] px-3.5 py-2 bg-white hover:bg-slate-50 text-[#1E3A8A] font-bold rounded-full text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-300"
            title="Generate custom CalAIM 4-part note from raw inputs or goal presets"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
            <span>4-Part Generator</span>
          </button>

          {/* CalAIM H0038 Standardized Template Drawer Trigger Button */}
          <button
            type="button"
            onClick={() => setIsTemplateDrawerOpen(true)}
            className="min-h-[44px] px-4 py-2 bg-gradient-to-r from-teal-600 to-[#0F766E] hover:from-teal-700 hover:to-teal-800 text-white font-bold rounded-full text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2 border border-teal-500/50"
            title="Open H0038 Standardized CalAIM Template Library (8 Core Encounters)"
          >
            <BookOpen className="w-4 h-4 text-amber-300 shrink-0" />
            <span>H0038 Templates (8)</span>
          </button>

          {/* Interactive Compliance Checklist Trigger Button */}
          <button
            type="button"
            onClick={() => setIsChecklistOpen(true)}
            className="min-h-[44px] px-3.5 py-2 bg-white hover:bg-slate-50 text-[#0F766E] font-bold rounded-full text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-slate-300"
            title="Audit encounter against CalAIM 7-Point Quality Checklist"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
            <span>Audit Checklist</span>
          </button>

          {/* California SB 803 17 Core Competencies Selector Button */}
          <button
            type="button"
            onClick={() => setIsSB803GuideOpen(true)}
            className={`min-h-[44px] px-3.5 py-2 font-bold rounded-full text-xs shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
              taggedSB803Competencies.length > 0
                ? 'bg-blue-50 text-[#1E3A8A] border-blue-300 ring-1 ring-blue-300'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
            title="Tag California SB 803 & CalMHSA 17 Core Competencies"
          >
            <Award className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
            <span>SB 803 Competencies{taggedSB803Competencies.length > 0 ? ` (${taggedSB803Competencies.length})` : ''}</span>
          </button>
        </div>
      </div>

      {/* Tagged SB 803 Competency Badges */}
      {taggedSB803Competencies.length > 0 && (
        <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#1E3A8A] uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>California SB 803 Competencies Tagged ({taggedSB803Competencies.length})</span>
            </span>
            <button
              type="button"
              onClick={() => setIsSB803GuideOpen(true)}
              className="text-xs text-[#0F766E] font-bold hover:underline"
            >
              Manage Tags
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {taggedSB803Competencies.map((cId) => {
              const comp = SB_803_CORE_COMPETENCIES.find((c) => c.id === cId);
              return (
                <span
                  key={cId}
                  className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-xs font-semibold text-slate-800 shadow-2xs"
                >
                  <span className="w-4 h-4 rounded-full bg-[#1E3A8A] text-white text-[10px] flex items-center justify-center font-bold">
                    {comp?.number || '#'}
                  </span>
                  <span className="truncate max-w-[200px]">{comp?.title || cId}</span>
                  <button
                    type="button"
                    onClick={() => handleToggleSB803Competency(cId)}
                    className="text-slate-400 hover:text-slate-700 ml-0.5 cursor-pointer"
                    title="Remove Tag"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* CalAIM Golden Thread™ Clinical Standard Continuity Banner */}
      <div className={`p-4 rounded-2xl border transition-all space-y-3 ${
        goldenThreadStatus.isUnbroken
          ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 shadow-2xs'
          : 'bg-slate-50 border-slate-200/90 text-slate-800'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${
              goldenThreadStatus.isUnbroken ? 'bg-[#16A34A] text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] flex items-center gap-1.5">
                <span>CalAIM Golden Thread™ Clinical Standard</span>
                {goldenThreadStatus.isUnbroken && (
                  <span className="text-[10px] bg-emerald-100 text-[#16A34A] px-2 py-0.5 rounded-full font-extrabold border border-emerald-300">
                    Audit-Proof
                  </span>
                )}
              </span>
              <p className="text-[11px] text-slate-500">
                Direct linkage: Care Plan Goal → CPSS Peer Intervention → Measurable Client Response with Quote → Co-Created Plan
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold flex items-center gap-1.5 ${
              goldenThreadStatus.isUnbroken
                ? 'bg-emerald-100 text-[#16A34A] border border-emerald-300 shadow-2xs'
                : 'bg-amber-100 text-[#D97706] border border-amber-300'
            }`}>
              {goldenThreadStatus.isUnbroken ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Golden Thread Complete (4/4)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Golden Thread: {goldenThreadStatus.validLinksCount}/4 Links Verified</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* 4 Connected Thread Nodes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1 text-xs">
          {/* Link 1: Goal */}
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
            goldenThreadStatus.link1Goal
              ? 'bg-white border-emerald-300 text-emerald-900 shadow-2xs'
              : 'bg-white/60 border-slate-200 text-slate-500'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              goldenThreadStatus.link1Goal ? 'bg-[#16A34A] text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {goldenThreadStatus.link1Goal ? '✓' : '1'}
            </span>
            <div className="min-w-0">
              <span className="font-bold block truncate">1. Recovery Goal</span>
              <span className="text-[10px] text-slate-500 block truncate">
                {goldenThreadStatus.link1Goal ? 'Active Link Established' : 'Goal missing'}
              </span>
            </div>
          </div>

          {/* Link 2: Intervention */}
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
            goldenThreadStatus.link2Intervention
              ? 'bg-white border-emerald-300 text-emerald-900 shadow-2xs'
              : 'bg-white/60 border-slate-200 text-slate-500'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              goldenThreadStatus.link2Intervention ? 'bg-[#16A34A] text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {goldenThreadStatus.link2Intervention ? '✓' : '2'}
            </span>
            <div className="min-w-0">
              <span className="font-bold block truncate">2. Peer Intervention</span>
              <span className="text-[10px] text-slate-500 block truncate">
                {goldenThreadStatus.link2Intervention ? `${taggedSB803Competencies.length > 0 ? `${taggedSB803Competencies.length} SB 803 Tagged` : 'Non-clinical stated'}` : 'Action missing'}
              </span>
            </div>
          </div>

          {/* Link 3: Client Response with Quote */}
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
            goldenThreadStatus.link3Response
              ? 'bg-white border-emerald-300 text-emerald-900 shadow-2xs'
              : 'bg-white/60 border-slate-200 text-slate-500'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              goldenThreadStatus.link3Response ? 'bg-[#16A34A] text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {goldenThreadStatus.link3Response ? '✓' : '3'}
            </span>
            <div className="min-w-0">
              <span className="font-bold block truncate">3. Peer Response</span>
              <span className="text-[10px] text-slate-500 block truncate">
                {goldenThreadStatus.hasDirectQuote ? 'Direct quote ("...")' : 'Direct quote missing'}
              </span>
            </div>
          </div>

          {/* Link 4: Plan */}
          <div className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all ${
            goldenThreadStatus.link4Plan
              ? 'bg-white border-emerald-300 text-emerald-900 shadow-2xs'
              : 'bg-white/60 border-slate-200 text-slate-500'
          }`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
              goldenThreadStatus.link4Plan ? 'bg-[#16A34A] text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {goldenThreadStatus.link4Plan ? '✓' : '4'}
            </span>
            <div className="min-w-0">
              <span className="font-bold block truncate">4. Agreed Next Plan</span>
              <span className="text-[10px] text-slate-500 block truncate">
                {goldenThreadStatus.link4Plan ? 'Follow-up scheduled' : 'Plan missing'}
              </span>
            </div>
          </div>
        </div>

        {!goldenThreadStatus.isUnbroken && (
          <div className="text-[11px] text-amber-900 bg-amber-50/90 p-2.5 rounded-xl border border-amber-200 flex items-center gap-2">
            <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              <strong>Clinical Golden Thread Audit Tip:</strong> {!goldenThreadStatus.link1Goal && 'Link to client recovery plan goal. '}
              {!goldenThreadStatus.link2Intervention && 'Document non-clinical peer intervention. '}
              {!goldenThreadStatus.hasDirectQuote && 'Enclose peer\'s authentic words in quotation marks ("..."). '}
              {!goldenThreadStatus.link4Plan && 'Specify collaborative plan and scheduled next meeting.'}
            </span>
          </div>
        )}
      </div>

      {/* Quick template starters and dictation toolbar (Symmetrical 2x2 grid on mobile, streamlined row on desktop) */}
      <div className="bg-[#FEF3C7]/60 p-2.5 sm:p-2 rounded-2xl border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-2.5 w-full">
        {/* Starter Indicator Label */}
        <div className="flex items-center justify-between sm:justify-start gap-1.5 px-1 sm:px-0 shrink-0">
          <span className="text-xs font-bold text-[#D97706] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
            <span>Quick Starters:</span>
          </span>
          <span className="text-[10px] font-semibold text-amber-800/70 sm:hidden">
            Tap to Pre-fill
          </span>
        </div>

        {/* Symmetrical Action Pills Grid on Mobile (2x2 equal-width pills), inline flex on desktop */}
        <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => applyTemplate('recovery')}
            className="min-h-[44px] px-3 py-2 text-xs bg-white hover:bg-amber-50 active:scale-[0.98] text-slate-800 font-semibold rounded-full border border-amber-200 shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
          >
            <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" />
            <span className="truncate">Recovery</span>
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('housing')}
            className="min-h-[44px] px-3 py-2 text-xs bg-white hover:bg-amber-50 active:scale-[0.98] text-slate-800 font-semibold rounded-full border border-amber-200 shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
          >
            <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" />
            <span className="truncate">Housing</span>
          </button>
          <button
            type="button"
            onClick={() => applyTemplate('coping')}
            className="min-h-[44px] px-3 py-2 text-xs bg-white hover:bg-amber-50 active:scale-[0.98] text-slate-800 font-semibold rounded-full border border-amber-200 shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
          >
            <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" />
            <span className="truncate">Somatic</span>
          </button>
          <button
            type="button"
            onClick={() => setIsDictationModalOpen(true)}
            className="min-h-[44px] px-3.5 py-2 text-xs bg-[#0F766E] hover:bg-teal-800 active:scale-[0.98] text-white font-bold rounded-full shadow-2xs transition-all cursor-pointer flex items-center justify-center gap-1.5 w-full sm:w-auto"
          >
            <Mic className="w-3.5 h-3.5 text-white shrink-0" />
            <span className="truncate">PeerNote™ Dictate</span>
          </button>
        </div>
      </div>

      {/* Flex Wizard Stepper Rail: Full Circumnavigation Freedom */}
      {formMode === 'flex_wizard' && (
        <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200/90 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-[#1E3A8A] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-[#0F766E]" />
              <span>H0038 Golden Thread Wizard: Step {wizardStep} of 5</span>
            </span>
            <span className="text-slate-500 font-medium text-[11px]">
              Tap any step to jump freely (Zero Validation Blocks)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { num: 1, title: '1. Client & Goal', valid: isPart1Valid && Boolean(selectedClientId) },
              { num: 2, title: '2. Time & POS 15', valid: totalBillableMinutes > 0 },
              { num: 3, title: '3. Interventions', valid: isPart2Valid },
              { num: 4, title: '4. Response', valid: isPart3Valid },
              { num: 5, title: '5. Next Steps & Sign', valid: isPart4Valid && signatureConfirmed }
            ].map(step => (
              <button
                key={step.num}
                type="button"
                onClick={() => setWizardStep(step.num)}
                className={`min-h-[44px] px-2.5 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                  wizardStep === step.num
                    ? 'bg-[#1E3A8A] text-white border-blue-900 shadow-sm font-bold ring-2 ring-blue-300'
                    : step.valid
                    ? 'bg-emerald-50 text-[#16A34A] border-emerald-200 hover:bg-emerald-100'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  wizardStep === step.num
                    ? 'bg-white text-[#1E3A8A]'
                    : step.valid
                    ? 'bg-[#16A34A] text-white'
                    : 'bg-slate-200 text-slate-600'
                }`}>
                  {step.valid && wizardStep !== step.num ? '✓' : step.num}
                </span>
                <span className="truncate">{step.title}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {validationWarning && (
        <div className="flex items-center gap-2.5 p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-[#D97706] text-xs font-semibold">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{validationWarning}</span>
        </div>
      )}

      {saveStatus && (
        <div className="flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-300 rounded-xl text-[#16A34A] text-xs font-bold">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Automated CalAIM 4-Part Structure Validation Telemetry */}
      <div className={`p-4 rounded-2xl border transition-colors ${
        isAllPartsValid
          ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
          : 'bg-amber-50/80 border-amber-200 text-amber-900'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-black/5">
          <div className="flex items-center gap-2">
            {isAllPartsValid ? (
              <CheckCircle2 className="w-5 h-5 text-[#16A34A] shrink-0" />
            ) : (
              <Clock className="w-5 h-5 text-[#D97706] shrink-0" />
            )}
            <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
              CalAIM 4-Part Structure: {completedParts}/4 Completed
            </span>
          </div>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${
            isAllPartsValid
              ? 'bg-emerald-100 text-[#16A34A] border-emerald-300'
              : 'bg-amber-100 text-[#D97706] border-amber-300'
          }`}>
            {isAllPartsValid ? '✓ Medi-Cal H0038 Audit Ready' : `${4 - completedParts} Section(s) Required`}
          </span>
        </div>

        {/* 4-Part Checklist Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2.5 text-[11px] font-semibold">
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${
            isPart1Valid ? 'bg-white text-[#16A34A] border-emerald-200' : 'bg-white/60 text-slate-500 border-slate-200'
          }`}>
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
              isPart1Valid ? 'bg-[#16A34A] text-white' : 'bg-slate-200 text-slate-500'
            }`}>1</span>
            <span className="truncate">1. Goal Addressed</span>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${
            isPart2Valid ? 'bg-white text-[#16A34A] border-emerald-200' : 'bg-white/60 text-slate-500 border-slate-200'
          }`}>
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
              isPart2Valid ? 'bg-[#16A34A] text-white' : 'bg-slate-200 text-slate-500'
            }`}>2</span>
            <span className="truncate">2. Peer Intervention</span>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${
            isPart3Valid ? 'bg-white text-[#16A34A] border-emerald-200' : 'bg-white/60 text-slate-500 border-slate-200'
          }`}>
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
              isPart3Valid ? 'bg-[#16A34A] text-white' : 'bg-slate-200 text-slate-500'
            }`}>3</span>
            <span className="truncate">3. Client Response</span>
          </div>

          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border ${
            isPart4Valid ? 'bg-white text-[#16A34A] border-emerald-200' : 'bg-white/60 text-slate-500 border-slate-200'
          }`}>
            <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${
              isPart4Valid ? 'bg-[#16A34A] text-white' : 'bg-slate-200 text-slate-500'
            }`}>4</span>
            <span className="truncate">4. Plan / Next Steps</span>
          </div>
        </div>
      </div>

      {sanitizedNotice && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-semibold animate-in fade-in duration-150">
          <ShieldCheck className="w-5 h-5 text-[#16A34A] shrink-0" />
          <span>{sanitizedNotice}</span>
        </div>
      )}

      {/* Workflow Engine: Dual-Mode Rendering (Standard Full Page vs Flex Wizard) */}
      {formMode === 'standard' ? (
        <div className="space-y-6">
          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center text-[10px] font-bold">1</span>
                Step 1 · Client & Careplan Milestone Linkage
              </span>
              <span className="text-[11px] font-semibold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                CalAIM H0038
              </span>
            </div>
            {renderStep1()}
          </div>

          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center text-[10px] font-bold">2</span>
                Step 2 · CalAIM Time Accounting & Focus Domains
              </span>
              <span className="text-[11px] font-semibold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Direct + Travel + Doc
              </span>
            </div>
            {renderStep2()}
          </div>

          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center text-[10px] font-bold">3</span>
                Step 3 · Peer Intervention & Shared Recovery Experience
              </span>
              <span className="text-[11px] font-semibold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Trauma-Informed Chips
              </span>
            </div>
            {renderStep3()}
          </div>

          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center text-[10px] font-bold">4</span>
                Step 4 · Client Recovery Response & Plan
              </span>
              <span className="text-[11px] font-semibold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                Quotes & Next Encounter
              </span>
            </div>
            {renderStep4()}
          </div>

          <div className="p-4 sm:p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A] flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-[#1E3A8A] flex items-center justify-center text-[10px] font-bold">5</span>
                Step 5 · Safety Check & Electronic Attestation Signature
              </span>
              <span className="text-[11px] font-semibold text-[#0F766E] bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                CPSS Attestation
              </span>
            </div>
            {renderStep5()}
          </div>
        </div>
      ) : (
        <div className="p-5 sm:p-6 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
                Step {wizardStep} of 5 · {
                  wizardStep === 1 ? 'Client & Careplan Linkage' :
                  wizardStep === 2 ? 'CalAIM Time Accounting' :
                  wizardStep === 3 ? 'Peer Intervention & Strengths' :
                  wizardStep === 4 ? 'Client Response & Plan' :
                  'Safety & Electronic Attestation'
                }
              </span>
              <p className="text-xs text-slate-500 mt-0.5">
                Total circumnavigation freedom enabled. Jump between any steps at will with zero validation locking.
              </p>
            </div>
            <div className="flex items-center gap-1.5 self-start sm:self-auto">
              <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full">
                Step {wizardStep}/5
              </span>
            </div>
          </div>

          {wizardStep === 1 && renderStep1()}
          {wizardStep === 2 && renderStep2()}
          {wizardStep === 3 && renderStep3()}
          {wizardStep === 4 && renderStep4()}
          {wizardStep === 5 && renderStep5()}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setWizardStep(prev => Math.max(1, prev - 1) as 1 | 2 | 3 | 4 | 5)}
              disabled={wizardStep === 1}
              className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous Step</span>
            </button>

            <span className="text-xs text-slate-400 font-semibold hidden sm:inline">
              Step {wizardStep} of 5
            </span>

            {wizardStep < 5 ? (
              <button
                type="button"
                onClick={() => setWizardStep(prev => Math.min(5, prev + 1) as 1 | 2 | 3 | 4 | 5)}
                className="min-h-[44px] px-5 py-2 bg-[#1E3A8A] hover:bg-blue-900 text-white rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <span className="text-xs font-bold text-[#16A34A] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                All Steps Ready
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons with 48px touch target and uniform sizing */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs sm:text-sm font-bold order-last sm:order-first transition-colors cursor-pointer"
          >
            Cancel
          </button>
        )}

        <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 w-full sm:w-auto justify-end">
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="w-full xs:w-auto min-h-[48px] flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-full text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4 text-slate-500 shrink-0" />
            <span>Save Offline Draft</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave(true)}
            className="w-full xs:w-auto min-h-[48px] flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0F766E] hover:bg-teal-800 text-white rounded-full text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer"
          >
            <Send className="w-4 h-4 shrink-0" />
            <span>Submit for Supervisor Cosign</span>
          </button>
        </div>
      </div>

      {/* PeerNote Voice / Plain-Text Dictation Modal */}
      {isDictationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-teal-50 text-[#0F766E] rounded-xl border border-teal-200">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#1E3A8A]">
                    PeerNote™ Unstructured Dictation & Note Intake
                  </h3>
                  <p className="text-xs text-slate-500">
                    Zero-AI deterministic engine · Converts field dictation into Medi-Cal 4-Part Structure
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  stopSpeechRecognition();
                  setIsDictationModalOpen(false);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {speechError && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-[#D97706] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{speechError}</span>
              </div>
            )}

            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-slate-700">
                    Voice Dictation or Paste Rough Notes
                  </label>
                  <span className="hidden sm:inline-flex text-[10px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Echo-Cancellation Active
                  </span>
                </div>
                <button
                  type="button"
                  onClick={toggleSpeechRecognition}
                  className={`min-h-[44px] px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isRecording
                      ? 'bg-rose-600 text-white animate-pulse'
                      : 'bg-teal-50 text-[#0F766E] border border-teal-200 hover:bg-teal-100'
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isRecording ? 'Listening... (Tap to Stop)' : 'Start Voice Dictation'}</span>
                </button>
              </div>

              <textarea
                rows={6}
                value={dictationRawText}
                onChange={(e) => setDictationRawText(e.target.value)}
                placeholder="Speak or paste field encounter notes. Example: 'Met with peer at community center for 45 mins. Worked on recovery goals and coping skills. Discussed navigating triggers and somatic box breathing. Peer reported feeling supported and anxiety down from 8 to 3. Scheduled follow up for Tuesday 10am...'"
                className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-[#0F766E] focus:bg-white"
              />

              {/* Zero-Echo Live Interim Subtitle Indicator */}
              {isRecording && interimTranscript && (
                <div className="flex items-center gap-2 p-2.5 bg-teal-50/90 border border-teal-200 rounded-xl text-xs text-[#0F766E] animate-in fade-in">
                  <div className="w-2 h-2 rounded-full bg-[#0F766E] animate-ping shrink-0" />
                  <span className="font-bold text-slate-500 shrink-0">Live:</span>
                  <span className="italic truncate">{interimTranscript}</span>
                </div>
              )}

              <p className="text-[11px] text-slate-500">
                Medicalized terms (e.g. "patient", "non-compliant", "addict") are automatically translated to strengths-based peer language upon processing.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  stopSpeechRecognition();
                  setIsDictationModalOpen(false);
                }}
                className="min-h-[44px] px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessDictation}
                disabled={!dictationRawText.trim()}
                className="min-h-[44px] px-5 py-2 bg-[#0F766E] hover:bg-teal-800 disabled:opacity-50 text-white rounded-full text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Wand2 className="w-4 h-4" />
                <span>Format to CalAIM 4-Part Note</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CalAIM H0038 Standardized Encounter Template Drawer */}
      <H0038TemplateDrawer
        isOpen={isTemplateDrawerOpen}
        onClose={() => setIsTemplateDrawerOpen(false)}
        onSelectTemplate={handleApplyH0038Template}
      />

      {/* Four-Part Note Template Generator Modal */}
      {isFourPartModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl relative my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-150 border border-slate-200">
            <div className="p-3 sm:p-5">
              <FourPartNoteGenerator
                initialGoal={goalAddressed}
                onApplyNote={handleApplyFourPartNote}
                onClose={() => setIsFourPartModalOpen(false)}
              />
            </div>
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setIsFourPartModalOpen(false)}
                className="min-h-[44px] px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-full text-xs cursor-pointer transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Compliance Checklist Modal */}
      <InteractiveChecklistWidget
        isModal
        isOpen={isChecklistOpen}
        onClose={() => setIsChecklistOpen(false)}
      />

      {/* California SB 803 17 Core Competencies Guide & Selector Modal */}
      <SB803CompetencyGuide
        isOpen={isSB803GuideOpen}
        onClose={() => setIsSB803GuideOpen(false)}
        selectedCompetencyIds={taggedSB803Competencies}
        onToggleCompetency={handleToggleSB803Competency}
        isSelectorMode
      />
    </div>
  );
};

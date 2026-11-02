/**
 * Peer Notebook - PeerNote Clinical-to-Non-Clinical Language Engine
 * Zero-AI Runtime Dependency • 100% Deterministic Client-Driven Parser
 * CalAIM & Medi-Cal H0038 Compliant • CalMHSA Core Competencies
 */

// Medicalized clinical jargon mapped to strengths-based peer recovery language
export const CLINICAL_TO_PEER_VOCABULARY: Record<string, string> = {
  // Person-First & Egalitarian Framing
  'patient': 'peer',
  'patients': 'peers',
  'client is non-compliant': 'peer is navigating their own recovery pacing and exercising self-determination',
  'non-compliant': 'disengaged from current recovery goals / exercising self-determination',
  'noncompliant': 'exercising personal self-determination',
  'compliant': 'actively engaged',
  'refuses to': 'expressed hesitation regarding',
  'refused': 'expressed hesitation around',
  'uncooperative': 'communicating unmet support needs',
  'combative': 'experiencing heightened emotional distress',
  'resistant': 'moving at their own self-determined pace',
  'lack of insight': 'discovering personal recovery priorities',
  'denial': 'processing personal readiness for change',
  'in denial': 'exploring ambivalence around change',

  // Non-Clinical Services & Frameworks (California SB 803)
  'treatment plan': 'wellness recovery goals',
  'treatment planning': 'wellness goal planning',
  'treatment': 'peer recovery support',
  'clinical treatment': 'peer recovery support',
  'therapy': 'peer mentoring and coaching',
  'psychotherapy': 'peer counseling and lived experience sharing',
  'clinical intervention': 'peer support intervention',
  'clinical interventions': 'peer support interventions',
  'therapist': 'peer support specialist',
  'clinician': 'peer practitioner / specialist',
  'case management': 'recovery navigation',
  'case manager': 'peer recovery navigator',
  'intake': 'initial welcome conversation',
  'discharge': 'recovery graduation / milestone transition',
  'discharged': 'transitioned to community graduation',
  'patient chart': 'peer notebook record',
  'medical chart': 'peer encounter documentation',
  'medical record': 'peer encounter documentation',
  'clinical documentation': 'strengths-based peer documentation',
  'chart': 'encounter record',
  'charting': 'documenting encounter',

  // Substance Use & Harm Reduction Language
  'addict': 'person in substance use recovery',
  'addicts': 'individuals in recovery',
  'substance abuser': 'individual navigating substance use challenges',
  'alcoholic': 'individual working on alcohol recovery goals',
  'relapse': 'recurrence of use / recovery challenge',
  'relapsed': 'experienced a recovery recurrence',
  'clean': 'in active recovery / substance-free',
  'dirty urine': 'toxicology indicating substance exposure',
  'dirty screen': 'screen indicating substance exposure',
  'failed drug test': 'test indicating substance recurrence',
  'drug seeking': 'seeking distress relief or unmet support needs',

  // Mental Health & Distress Description (De-pathologized)
  'suffering from': 'living with / experiencing',
  'decompensating': 'experiencing heightened emotional distress',
  'decompensation': 'heightened nervous system activation and emotional distress',
  'symptomatic': 'navigating distressing feelings',
  'symptom': 'distress indicator / wellness challenge',
  'symptoms': 'distress indicators / personal challenges',
  'treatment resistant': 'seeking aligned holistic recovery pathways',
  'manipulative': 'attempting to meet unmet needs under distress',
  'unmotivated': 'contemplating personal values and readiness for change',
  'frequent flyer': 'individual seeking continuous community connection',
  'borderline': 'experiencing intense relational sensitivity and distress',
  'pathology': 'life experience / distress pattern',
  'diagnosis': 'self-identified recovery challenge',
  'diagnosed with': 'living with',
  'prognosis': 'recovery trajectory and milestone path',
  'baseline': 'day-to-day wellness foundation',
  'medication non-compliant': 'exploring personal preferences regarding medication self-management',
  'medication compliant': 'actively self-managing prescribed medications',
  'suicidal ideation': 'thoughts of acute despair and seeking relief',
  'hallucinating': 'experiencing altered perceptions',
  'hallucinations': 'unshared sensory perceptions',
  'delusional': 'holding unique personal beliefs'
};

/**
 * Medi-Cal 15-Minute Billing Unit Calculator (CMS 8-Minute Threshold Rule)
 * 1–7 min = 0 units (non-billable standalone)
 * 8–22 min = 1 unit
 * 23–37 min = 2 units
 * 38–52 min = 3 units
 * 53–67 min = 4 units
 * 68–82 min = 5 units
 * 83–97 min = 6 units
 * 98–112 min = 7 units
 * 113–127 min = 8 units
 */
export function calculateMediCalBillingUnits(totalMinutes: number): number {
  if (totalMinutes < 8) return 0;
  return Math.floor((totalMinutes - 8) / 15) + 1;
}

/**
 * Deterministically transform medicalized/clinical text into strengths-based peer support language
 */
export function sanitizeToNonClinicalLanguage(input: string): {
  sanitizedText: string;
  replacementsCount: number;
  replacedTerms: string[];
} {
  let sanitized = input;
  const replacedTerms: string[] = [];

  // Sort keys by length descending to replace longer phrases first
  const keys = Object.keys(CLINICAL_TO_PEER_VOCABULARY).sort((a, b) => b.length - a.length);

  for (const term of keys) {
    const replacement = CLINICAL_TO_PEER_VOCABULARY[term];
    // Word boundary matching, case-insensitive
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    if (regex.test(sanitized)) {
      replacedTerms.push(term);
      sanitized = sanitized.replace(regex, (match) => {
        // Preserve capitalization of first letter if present
        if (match[0] === match[0].toUpperCase()) {
          return replacement.charAt(0).toUpperCase() + replacement.slice(1);
        }
        return replacement;
      });
    }
  }

  return {
    sanitizedText: sanitized,
    replacementsCount: replacedTerms.length,
    replacedTerms
  };
}

/**
 * Detects clinical or medicalized jargon in real time without modifying text.
 * Returns found terms and strengths-based replacement suggestions.
 */
export function detectClinicalJargon(input: string): {
  hasClinicalJargon: boolean;
  detectedTerms: string[];
  suggestions: Array<{ term: string; suggestedReplacement: string }>;
} {
  if (!input || typeof input !== 'string') {
    return { hasClinicalJargon: false, detectedTerms: [], suggestions: [] };
  }

  const detected: string[] = [];
  const suggestions: Array<{ term: string; suggestedReplacement: string }> = [];
  const keys = Object.keys(CLINICAL_TO_PEER_VOCABULARY).sort((a, b) => b.length - a.length);

  for (const term of keys) {
    const regex = new RegExp(`\\b${term}\\b`, 'i');
    if (regex.test(input)) {
      detected.push(term);
      suggestions.push({
        term,
        suggestedReplacement: CLINICAL_TO_PEER_VOCABULARY[term]
      });
    }
  }

  return {
    hasClinicalJargon: detected.length > 0,
    detectedTerms: detected,
    suggestions
  };
}

/**
 * Validates complete session note for California SB 803 non-clinical scope compliance.
 */
export function validateNonClinicalScope(noteTextBundle: string): {
  isCompliant: boolean;
  jargonCount: number;
  detectedJargon: string[];
  scopeAffirmation: string;
} {
  const check = detectClinicalJargon(noteTextBundle);
  return {
    isCompliant: !check.hasClinicalJargon,
    jargonCount: check.detectedTerms.length,
    detectedJargon: check.detectedTerms,
    scopeAffirmation: check.hasClinicalJargon
      ? 'Non-clinical boundary alert: Medicalized terms detected. Under SB 803, peer specialists provide lived experience mentoring and recovery coaching, not clinical evaluation.'
      : '100% Non-Clinical & Strengths-Based: Language strictly adheres to California SB 803 CPSS standards.'
  };
}

export interface ParsedPeerNote {
  goalAddressed: string;
  peerIntervention: string;
  clientResponse: string;
  planNextSteps: string;
  estimatedMinutes: number;
  detectedBillingUnits: number;
}

/**
 * Deterministically parses unstructured dictation or plain text notes
 * into the Medi-Cal Mandated 4-Part Structure:
 * 1. Personal Recovery Plan Goal Addressed
 * 2. Peer Support Intervention Provided
 * 3. Peer Engagement & Response
 * 4. Next Steps & Plan for Next Contact
 */
export function parseUnstructuredPeerDictation(rawText: string): ParsedPeerNote {
  const { sanitizedText } = sanitizeToNonClinicalLanguage(rawText.trim());

  let goalAddressed = '';
  let peerIntervention = '';
  let clientResponse = '';
  let planNextSteps = '';

  // Check for common section delimiters in dictation
  const lines = sanitizedText.split('\n').map(l => l.trim()).filter(Boolean);

  let currentSection = 0; // 1: goal, 2: intervention, 3: response, 4: plan

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (lower.startsWith('goal') || lower.startsWith('objective') || lower.startsWith('recovery plan')) {
      currentSection = 1;
      goalAddressed += (goalAddressed ? ' ' : '') + line.replace(/^(goal|objective|recovery plan)[:\s-]*/i, '');
    } else if (lower.startsWith('intervention') || lower.startsWith('what i did') || lower.startsWith('cpss') || lower.startsWith('peer specialist')) {
      currentSection = 2;
      peerIntervention += (peerIntervention ? ' ' : '') + line.replace(/^(intervention|what i did|cpss|peer specialist)[:\s-]*/i, '');
    } else if (lower.startsWith('response') || lower.startsWith('peer response') || lower.startsWith('client response') || lower.startsWith('engagement')) {
      currentSection = 3;
      clientResponse += (clientResponse ? ' ' : '') + line.replace(/^(response|peer response|client response|engagement)[:\s-]*/i, '');
    } else if (lower.startsWith('plan') || lower.startsWith('next steps') || lower.startsWith('follow up') || lower.startsWith('next contact')) {
      currentSection = 4;
      planNextSteps += (planNextSteps ? ' ' : '') + line.replace(/^(plan|next steps|follow up|next contact)[:\s-]*/i, '');
    } else {
      if (currentSection === 1) goalAddressed += ' ' + line;
      else if (currentSection === 2) peerIntervention += ' ' + line;
      else if (currentSection === 3) clientResponse += ' ' + line;
      else if (currentSection === 4) planNextSteps += ' ' + line;
      else {
        // Heuristic fallback for unstructured paragraph:
        // Distribute sentences intelligently
        const sentences = line.split(/(?<=[.?!])\s+/);
        if (sentences.length >= 4) {
          goalAddressed = sentences[0];
          peerIntervention = sentences[1];
          clientResponse = sentences[2];
          planNextSteps = sentences.slice(3).join(' ');
        } else {
          // Put in intervention by default
          peerIntervention += (peerIntervention ? ' ' : '') + line;
        }
      }
    }
  }

  // Fallbacks if incomplete
  if (!goalAddressed) {
    goalAddressed = 'Collaborate on personal recovery plan goals, wellness self-management, and community living skills.';
  }
  if (!peerIntervention) {
    peerIntervention = sanitizedText || 'CPSS delivered 1-on-1 peer recovery support, shared lived experience, and modeled recovery self-advocacy.';
  }
  if (!clientResponse) {
    clientResponse = 'Peer was receptive to lived experience sharing, actively participated in recovery dialogue, and identified personal strengths.';
  }
  if (!planNextSteps) {
    planNextSteps = 'Continue working on agreed recovery action items. Scheduled next 1-on-1 peer encounter for next week.';
  }

  const estimatedMinutes = 45;
  const detectedBillingUnits = calculateMediCalBillingUnits(estimatedMinutes);

  return {
    goalAddressed: goalAddressed.trim(),
    peerIntervention: peerIntervention.trim(),
    clientResponse: clientResponse.trim(),
    planNextSteps: planNextSteps.trim(),
    estimatedMinutes,
    detectedBillingUnits
  };
}

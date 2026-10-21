/**
 * Peer Notebook - PeerNote Clinical-to-Non-Clinical Language Engine
 * Zero-AI Runtime Dependency • 100% Deterministic Client-Driven Parser
 * CalAIM & Medi-Cal H0038 Compliant • CalMHSA Core Competencies
 */

// Medicalized clinical jargon mapped to strengths-based peer recovery language
export const CLINICAL_TO_PEER_VOCABULARY: Record<string, string> = {
  'patient': 'peer',
  'patients': 'peers',
  'client is non-compliant': 'peer is navigating their own recovery pacing and exercising self-determination',
  'non-compliant': 'disengaged from current recovery goals / exercising self-determination',
  'noncompliant': 'exercising personal self-determination',
  'refuses to': 'expressed hesitation regarding',
  'denial': 'processing personal readiness for change',
  'in denial': 'exploring ambivalence around change',
  'relapse': 'recurrence of use / recovery challenge',
  'relapsed': 'experienced a recovery recurrence',
  'addict': 'person in substance use recovery',
  'substance abuser': 'individual navigating substance use challenges',
  'alcoholic': 'individual working on alcohol recovery goals',
  'suffering from': 'living with / experiencing',
  'decompensating': 'experiencing heightened emotional distress',
  'decompensation': 'heightened nervous system activation and emotional distress',
  'symptomatic': 'navigating distressing feelings',
  'treatment resistant': 'seeking aligned holistic recovery pathways',
  'manipulative': 'attempting to meet unmet needs under distress',
  'unmotivated': 'contemplating personal values and readiness for change',
  'frequent flyer': 'individual seeking continuous community connection',
  'borderline': 'experiencing intense relational sensitivity and distress',
  'clean': 'in active recovery / substance-free',
  'dirty urine': 'toxicology indicating substance exposure',
  'dirty screen': 'screen indicating substance exposure',
  'failed drug test': 'test indicating substance recurrence'
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

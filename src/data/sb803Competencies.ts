/**
 * California SB 803 & CalMHSA 17 Core Competencies for Medi-Cal Certified Peer Support Specialists (CPSS-CA)
 * Standard: Senate Bill 803 (Chapter 150, Statutes of 2020) & DHCS CalAIM Behavioral Health Initiative
 * 
 * Each competency is explicitly mapped to DHCS CalAIM H0038 billable peer support guidelines,
 * trauma-informed practice, and strengths-based recovery principles.
 */

export interface SB803Competency {
  id: string; // e.g. 'SB803-01'
  number: number;
  title: string;
  category: 'Foundation' | 'Practice' | 'Navigation' | 'Ethics & Wellness';
  plainEnglishDescription: string;
  documentationPrompt: string; // Plain-English prompt for H0038 documentation
  calaimRelevance: string;
}

export const SB_803_CORE_COMPETENCIES: SB803Competency[] = [
  {
    id: 'SB803-01',
    number: 1,
    title: 'The Recovery Model & Philosophy',
    category: 'Foundation',
    plainEnglishDescription: 'Promotes hope, personal empowerment, self-determination, and the belief that recovery is individual and real.',
    documentationPrompt: 'How did this encounter reinforce the peer’s hope, self-direction, or unique recovery vision?',
    calaimRelevance: 'Directly informs the CalAIM Recovery Goal and strengths-based intervention.'
  },
  {
    id: 'SB803-02',
    number: 2,
    title: 'Peer Support Role & Code of Ethics',
    category: 'Ethics & Wellness',
    plainEnglishDescription: 'Maintains clear peer boundaries, voluntary mutual aid, confidentiality, and California Peer Code of Ethics.',
    documentationPrompt: 'How did the specialist model appropriate peer boundaries and voluntary partnership during the session?',
    calaimRelevance: 'Ensures services qualify as non-clinical peer support under H0038 billing.'
  },
  {
    id: 'SB803-03',
    number: 3,
    title: 'Trauma-Informed Care Practices',
    category: 'Practice',
    plainEnglishDescription: 'Creates safety, trust, peer agency, and avoids re-traumatizing individuals through respectful engagement.',
    documentationPrompt: 'What steps ensured the peer felt physically, emotionally, and culturally safe during the encounter?',
    calaimRelevance: 'Reduces crisis escalation and aligns with DHCS trauma-informed care standards.'
  },
  {
    id: 'SB803-04',
    number: 4,
    title: 'Cultural Humility & Responsiveness',
    category: 'Practice',
    plainEnglishDescription: 'Honors intersecting cultural, linguistic, gender, and lived backgrounds with humility and active listening.',
    documentationPrompt: 'How were the peer’s cultural background, values, and community connections incorporated into their recovery journey?',
    calaimRelevance: 'Fulfills CalAIM health equity and Medi-Cal culturally congruent service mandates.'
  },
  {
    id: 'SB803-05',
    number: 5,
    title: 'Communication Skills & Active Listening',
    category: 'Practice',
    plainEnglishDescription: 'Uses open-ended reflection, validation, shared dialogue, and non-judgmental feedback to build connection.',
    documentationPrompt: 'What specific active listening or motivational reflections supported the peer’s self-expression?',
    calaimRelevance: 'Reflected in the Client Response segment of the 4-part note.'
  },
  {
    id: 'SB803-06',
    number: 6,
    title: 'Collaboration and Teamwork',
    category: 'Practice',
    plainEnglishDescription: 'Partners with behavioral health teams, care coordinators, and natural support networks with peer consent.',
    documentationPrompt: 'How did the specialist coordinate with the peer’s broader care circle while protecting peer voice?',
    calaimRelevance: 'Supports CalAIM Enhanced Care Management (ECM) and Community Supports coordination.'
  },
  {
    id: 'SB803-07',
    number: 7,
    title: 'Conflict Resolution & De-escalation',
    category: 'Practice',
    plainEnglishDescription: 'Applies calm presence, voluntary space, validating language, and non-coercive methods during tension.',
    documentationPrompt: 'What de-escalation strategies or collaborative problem-solving techniques were utilized?',
    calaimRelevance: 'Prevents emergency department visits and psychiatric holds.'
  },
  {
    id: 'SB803-08',
    number: 8,
    title: 'Wellness & Recovery Action Planning (WRAP)',
    category: 'Navigation',
    plainEnglishDescription: 'Facilitates self-directed wellness tools, daily maintenance routines, early warning sign awareness, and crisis planning.',
    documentationPrompt: 'Which wellness tools or recovery action plan components did the peer develop or review?',
    calaimRelevance: 'Measurable recovery capital milestone recognized across California counties.'
  },
  {
    id: 'SB803-09',
    number: 9,
    title: 'Navigating Community Systems & CalAIM Supports',
    category: 'Navigation',
    plainEnglishDescription: 'Guides access to housing deposits, food programs, transit, Medi-Cal benefits, and community resources.',
    documentationPrompt: 'What community resources or CalAIM In Lieu of Services / Community Supports were explored?',
    calaimRelevance: 'Directly billable under H0038 community field navigation (POS 15).'
  },
  {
    id: 'SB803-10',
    number: 10,
    title: 'Goal Setting & Action Planning',
    category: 'Foundation',
    plainEnglishDescription: 'Assists the peer in defining SMART, self-directed goals broken into achievable, celebrated milestones.',
    documentationPrompt: 'What specific, peer-identified step or target was formulated for the coming week?',
    calaimRelevance: 'Direct link to Golden Thread audit requirement in CalAIM documentation.'
  },
  {
    id: 'SB803-11',
    number: 11,
    title: 'Facilitating Peer Support Groups',
    category: 'Practice',
    plainEnglishDescription: 'Guides mutual aid recovery circles, ensures inclusive shared time, and protects group safety norms.',
    documentationPrompt: 'How was mutual participation and peer-led wisdom fostered during the group encounter?',
    calaimRelevance: 'Mandatory documentation foundation for billing H0038-HQ (Group Peer Support).'
  },
  {
    id: 'SB803-12',
    number: 12,
    title: 'Advocacy in Mental Health & Substance Use',
    category: 'Navigation',
    plainEnglishDescription: 'Empowers peers to advocate for their own needs, rights, choices, and dignity across medical and legal systems.',
    documentationPrompt: 'How was the peer supported in self-advocating with providers, family, or institutions?',
    calaimRelevance: 'Reinforces patient rights under California Welfare and Institutions Code.'
  },
  {
    id: 'SB803-13',
    number: 13,
    title: 'Digital Literacy & Electronic Documentation',
    category: 'Ethics & Wellness',
    plainEnglishDescription: 'Uses secure, compliant electronic tools to record timely, accurate, trauma-informed H0038 progress notes.',
    documentationPrompt: 'How did timely documentation preserve confidentiality and accurately convey the peer’s progress?',
    calaimRelevance: 'Ensures compliance with DHCS 14-day documentation turnaround standards.'
  },
  {
    id: 'SB803-14',
    number: 14,
    title: 'Behavioral Health System Navigation & Rights',
    category: 'Navigation',
    plainEnglishDescription: 'Explains grievance processes, advance directives, voluntary treatment rights, and county mental health plans.',
    documentationPrompt: 'What rights or system options were clarified to help the peer make informed treatment decisions?',
    calaimRelevance: 'Protects client choice under California mental health parity laws.'
  },
  {
    id: 'SB803-15',
    number: 15,
    title: 'Harm Reduction & Overdose Prevention',
    category: 'Practice',
    plainEnglishDescription: 'Offers non-judgmental safety strategies, naloxone education, safer use resources, and relapse support.',
    documentationPrompt: 'What harm reduction strategies, safer-use planning, or overdose awareness were discussed?',
    calaimRelevance: 'Aligns with California DHCS Overdose Prevention Initiative and DMC-ODS peer benefit.'
  },
  {
    id: 'SB803-16',
    number: 16,
    title: 'Crisis Prevention & Zero-Coercion Intervention',
    category: 'Practice',
    plainEnglishDescription: 'Identifies distress early, creates calm spaces, connects to peer respites or warm lines, and minimizes police involvement.',
    documentationPrompt: 'What preventive or low-barrier crisis alternatives were agreed upon to preserve safety and autonomy?',
    calaimRelevance: 'Documents alternatives to 5150 involuntary holds.'
  },
  {
    id: 'SB803-17',
    number: 17,
    title: 'Self-Care, Professional Boundaries & Burnout Prevention',
    category: 'Ethics & Wellness',
    plainEnglishDescription: 'Practices personal wellness routines, seeks supervision, monitors secondary trauma, and sustains long-term resilience.',
    documentationPrompt: 'How did the specialist maintain personal equilibrium, consultation, and sustainability in their service role?',
    calaimRelevance: 'Maintains CalMHSA credential renewal and ethical practice requirements.'
  }
];

export function getSB803CompetencyById(id: string): SB803Competency | undefined {
  return SB_803_CORE_COMPETENCIES.find(c => c.id === id);
}

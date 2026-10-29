/**
 * Peer Notebook - California SB 803 & CalMHSA Curriculum & STAR Interview Dataset
 * Standards:
 * 1. California Senate Bill 803 (SB 803) & CalMHSA 80-Hour Core Curriculum
 * 2. 40-Hour Specialized Tracks (Crisis Respite, Forensic Reentry, Street Medicine, ECM)
 * 3. STAR (Situation, Task, Action, Result) Behavioral Interview Scenarios for CPSS-CA
 * 4. DHCS / CalMHSA Code of Ethics Standards
 */

export interface CurriculumModule {
  id: string;
  moduleNumber: number;
  track: '80hr_core' | '40hr_specialized';
  title: string;
  hours: number;
  sb803CompetencyId: string;
  competencyTitle: string;
  category: 'Foundation' | 'Practice' | 'Navigation' | 'Ethics & Wellness' | 'Specialized';
  description: string;
  learningObjectives: string[];
  keyTopics: string[];
  dhcsRegulations: string[];
  practicalApplicationPrompt: string;
}

export interface STARInterviewScenario {
  id: string;
  title: string;
  category: 'Crisis De-escalation' | 'Lived Experience Disclosure' | 'Ethics & Boundaries' | 'Advocacy & Dignity' | 'CalAIM Navigation' | 'Multi-Disciplinary Team';
  competencyId: string;
  competencyName: string;
  promptQuestion: string;
  contextBackground: string;
  starBreakdown: {
    situation: string;
    task: string;
    action: string;
    result: string;
  };
  modelResponse: string;
  clinicalPitfallsToAvoid: string[];
  calmhsaKeyRule: string;
}

export interface TrainingTrack {
  id: '80hr_core' | '40hr_specialized';
  name: string;
  totalHours: number;
  targetAudience: string;
  accreditationBody: string;
  summary: string;
  prerequisites: string[];
}

export const TRAINING_TRACKS: TrainingTrack[] = [
  {
    id: '80hr_core',
    name: '80-Hour California CalMHSA Peer Specialist Certification Track',
    totalHours: 80,
    targetAudience: 'Individuals with lived experience seeking California CPSS-CA certification under SB 803',
    accreditationBody: 'California Mental Health Services Authority (CalMHSA) & DHCS',
    summary: 'Comprehensive statewide curriculum covering all 17 core competencies mandated by SB 803 for Medi-Cal H0038 billing eligibility.',
    prerequisites: [
      'Self-identified lived experience of behavioral health recovery (mental health and/or substance use)',
      'High school diploma or GED equivalent',
      'Commitment to ethical peer support boundaries and non-clinical practice'
    ]
  },
  {
    id: '40hr_specialized',
    name: '40-Hour Specialized & Advanced Practice Track',
    totalHours: 40,
    targetAudience: 'Certified Peer Support Specialists (CPSS-CA) pursuing recertification or specialized roles',
    accreditationBody: 'CalMHSA Continuing Education & DHCS CalAIM Specialty Mental Health / DMC-ODS',
    summary: 'Advanced modules in CalAIM Enhanced Care Management (ECM), Street Medicine, Forensic Reentry, and Peer Respite Crisis Residential services.',
    prerequisites: [
      'Active California Peer Support Specialist Certification (CPSS-CA) or completion of 80-hour foundational track',
      'Affiliation with a Medi-Cal enrolled CBO, county behavioral health agency, or tribal program'
    ]
  }
];

export const CALMHSA_80HR_MODULES: CurriculumModule[] = [
  {
    id: 'mod_cpss_01',
    moduleNumber: 1,
    track: '80hr_core',
    title: 'Foundations of Peer Support & The Recovery Model',
    hours: 5,
    sb803CompetencyId: 'comp_01',
    competencyTitle: 'The Recovery Model',
    category: 'Foundation',
    description: 'Explore the historical roots of the peer movement, consumer/survivor activism, and the 10 guiding principles of recovery established by SAMHSA.',
    learningObjectives: [
      'Differentiate between medical, rehabilitative, and peer recovery paradigms.',
      'Apply SAMHSA 10 Guiding Principles of Recovery (hope, person-driven, many pathways, holistic, peer support, relational, culture, addresses trauma, strengths/responsibility, respect).',
      'Identify personal recovery milestones and articulate how recovery is a reality for everyone.'
    ],
    keyTopics: ['Civil Rights & Psychiatric Survivor History', 'SAMHSA 10 Principles', 'Strengths-Based Philosophy', 'Hope as an Agent of Change'],
    dhcsRegulations: ['Welf. & Inst. Code § 14045.12(b)(1)', 'CalMHSA CPSS Standard 1.1'],
    practicalApplicationPrompt: 'How does viewing a peer through a strengths lens rather than a diagnostic pathology lens alter your initial 15-minute encounter?'
  },
  {
    id: 'mod_cpss_02',
    moduleNumber: 2,
    track: '80hr_core',
    title: 'Trauma-Informed Practice & Healing-Centered Engagement',
    hours: 6,
    sb803CompetencyId: 'comp_04',
    competencyTitle: 'Trauma-Informed Care',
    category: 'Foundation',
    description: 'Understand the neurobiology of trauma, Adverse Childhood Experiences (ACEs), institutional retraumatization, and somatic regulation strategies.',
    learningObjectives: [
      'Shift the internal frame from "What is wrong with you?" to "What happened to you and what are your strengths?"',
      'Implement trauma-informed safety principles: physical, emotional, and psychological safety in field settings.',
      'Demonstrate somatic grounding techniques (box breathing, 5-4-3-2-1 sensory grounding) to assist peers in down-regulating acute distress.'
    ],
    keyTopics: ['ACEs & Neurobiology of Toxic Stress', 'Secondary Traumatic Stress & Vicarious Resiliency', 'Universal Trauma Precautions', 'Physical & Relational Safety'],
    dhcsRegulations: ['California CalAIM ECM Core Standards', 'SAMHSA TIC Framework (TIP 57)'],
    practicalApplicationPrompt: 'A peer experiences sudden panic in a crowded waiting room. Describe three concrete grounding actions you take that preserve dignity.'
  },
  {
    id: 'mod_cpss_03',
    moduleNumber: 3,
    track: '80hr_core',
    title: 'Purposeful Sharing of Lived Recovery Experience',
    hours: 6,
    sb803CompetencyId: 'comp_02',
    competencyTitle: 'Shared Lived Experience & Storytelling',
    category: 'Practice',
    description: 'Master the art of sharing personal recovery stories intentionally and ethically to inspire hope without burdening the peer or centering oneself.',
    learningObjectives: [
      'Evaluate whether sharing a specific personal story serves the peer’s immediate recovery goal.',
      'Structure lived experience sharing into: (1) what it was like, (2) what happened/pivot, (3) what life is like now, emphasizing actionable recovery tools.',
      'Recognize disclosure risks, including trauma dumping, vulnerability hangovers, and violating personal privacy boundaries.'
    ],
    keyTopics: ['Strategic Storytelling', 'Self-Check: Who Does This Story Benefit?', 'Vulnerability without Overexposure', 'Instilling Hope vs. Giving Advice'],
    dhcsRegulations: ['CalMHSA CPSS Code of Ethics § 3.2', 'SB 803 Sec. 2(c)'],
    practicalApplicationPrompt: 'Draft a 2-minute purposeful lived experience vignette to share with a peer who feels hopeless about obtaining permanent housing.'
  },
  {
    id: 'mod_cpss_04',
    moduleNumber: 4,
    track: '80hr_core',
    title: 'Active Listening, Motivational Interviewing & Peer Dialogue',
    hours: 6,
    sb803CompetencyId: 'comp_06',
    competencyTitle: 'Communication Skills',
    category: 'Practice',
    description: 'Learn open-ended questioning, reflective listening, summarizing, and validation skills (OARS) adapted specifically for egalitarian peer partnerships.',
    learningObjectives: [
      'Practice OARS (Open-ended questions, Affirmations, Reflective listening, Summaries) in non-clinical peer support.',
      'Avoid the "Righting Reflex"—the impulse to fix or give advice rather than empowering the peer to find their own solutions.',
      'Reflect underlying feelings and ambivalence to support peer autonomous decision-making.'
    ],
    keyTopics: ['OARS Framework for Peers', 'The Righting Reflex Trap', 'Reflecting Emotion vs. Paraphrasing Content', 'Trauma-Informed Silence'],
    dhcsRegulations: ['CalMHSA Core Practice Standard 2.2'],
    practicalApplicationPrompt: 'Convert three clinical/advisory questions (e.g. "Why don’t you take your meds?") into peer-centered, empowering reflections.'
  },
  {
    id: 'mod_cpss_05',
    moduleNumber: 5,
    track: '80hr_core',
    title: 'Cultural Humility, Equity & Anti-Oppressive Peer Practice',
    hours: 5,
    sb803CompetencyId: 'comp_05',
    competencyTitle: 'Cultural Competence',
    category: 'Foundation',
    description: 'Examine cultural humility, implicit bias, systemic barriers to care in California, and affirming LGBTQIA+, BIPOC, and immigrant communities.',
    learningObjectives: [
      'Distinguish cultural humility as an ongoing lifelong practice from cultural competence as an endpoint.',
      'Analyze how racism, poverty, and structural inequity impact behavioral health outcomes across California counties.',
      'Incorporate traditional, spiritual, and community healing practices into peer wellness plans when requested by the peer.'
    ],
    keyTopics: ['Cultural Humility vs. Competence', 'Addressing Health Disparities in Medi-Cal', 'Affirming Diverse Pathways', 'Intersectionality in Recovery'],
    dhcsRegulations: ['CalMHSA Standard 1.4', 'DHCS Cultural Competence Plan Requirements (CCPR)'],
    practicalApplicationPrompt: 'How do you respond when a peer describes using traditional indigenous or spiritual healing alongside or instead of western psychiatric care?'
  },
  {
    id: 'mod_cpss_06',
    moduleNumber: 6,
    track: '80hr_core',
    title: 'CalAIM & Medi-Cal H0038 Documentation & The Golden Thread',
    hours: 6,
    sb803CompetencyId: 'comp_10',
    competencyTitle: 'Documentation & Service Delivery',
    category: 'Practice',
    description: 'Structure Medi-Cal encounter notes under HCPCS H0038, master the 4-part note standard, apply the CMS 8-minute rule, and build the unbroken Golden Thread.',
    learningObjectives: [
      'Demonstrate the 4-Part Note Structure: (1) Goal Linkage, (2) CPSS Intervention, (3) Client Response with direct quote, (4) Collaborative Plan.',
      'Calculate 15-minute billing units accurately using California DHCS rules (8-22 min = 1 unit; 23-37 min = 2 units; etc.).',
      'Audit notes to eliminate clinical/diagnostic jargon (e.g., replace "patient was non-compliant" with "peer chose not to attend appointment").'
    ],
    keyTopics: ['HCPCS H0038 & Place of Service 15', 'The 4-Part Medi-Cal Note Structure', 'CMS 8-Minute Rounding Math', 'Direct Quotation Standard'],
    dhcsRegulations: ['DHCS Behavioral Health Information Notice (BHIN) 22-065', 'Medi-Cal Payment Reform W&I Code § 14184.400'],
    practicalApplicationPrompt: 'Draft an audit-proof Medi-Cal H0038 note for a 45-minute housing navigation session, verifying all four Golden Thread elements.'
  },
  {
    id: 'mod_cpss_07',
    moduleNumber: 7,
    track: '80hr_core',
    title: 'DHCS & CalMHSA Code of Ethics, Professional Boundaries & Law',
    hours: 6,
    sb803CompetencyId: 'comp_03',
    competencyTitle: 'Code of Ethics & Boundaries',
    category: 'Ethics & Wellness',
    description: 'Deep dive into the 10 core ethical principles of the CPSS-CA credential, non-dual relationships, mandatory reporting vs peer confidentiality, and gifts.',
    learningObjectives: [
      'Identify and manage dual relationships and conflicts of interest in community and mutual-aid settings.',
      'Clarify legal exceptions to peer confidentiality: child abuse (CANRA), elder abuse, and Tarasoff imminent physical harm to self/others.',
      'Establish personal boundaries regarding after-hours communication, financial transactions, and social media contact.'
    ],
    keyTopics: ['CalMHSA CPSS Code of Ethics', 'Dual Relationships & Mutual Aid Fellowship Boundaries', 'Mandatory Reporting under California Law', 'HIPAA & 42 CFR Part 2'],
    dhcsRegulations: ['CalMHSA CPSS Code of Ethics § 1.1-1.10', 'Cal. Penal Code § 11166 (CANRA)', 'Cal. Welf. & Inst. Code § 15630'],
    practicalApplicationPrompt: 'A peer you work with invites you to their home for a family barbecue celebration and offers you a $50 gift card. How do you respond ethically?'
  },
  {
    id: 'mod_cpss_08',
    moduleNumber: 8,
    track: '80hr_core',
    title: 'Crisis Intervention, Suicide Prevention & De-Escalation',
    hours: 6,
    sb803CompetencyId: 'comp_09',
    competencyTitle: 'Crisis Planning & De-escalation',
    category: 'Practice',
    description: 'Learn non-coercive de-escalation, suicide risk recognition, safety planning (Stanley-Brown), navigating 988 Suicide & Crisis Lifeline, and mobile crisis teams.',
    learningObjectives: [
      'Recognize early warning signs of escalating behavioral health crises and distress.',
      'Co-create an individualized Safety Plan (Stanley-Brown model) identifying internal warning signs, coping mechanisms, and trusted contacts.',
      'Collaborate with 988 and county mobile crisis teams (AB 988 / Miles Hall Lifeline) while advocating against unnecessary involuntary holds (5150).'
    ],
    keyTopics: ['Verbal De-escalation Strategies', 'Stanley-Brown Safety Planning', 'AB 988 Mobile Crisis & Alternatives to 5150', 'Lethal Means Safety'],
    dhcsRegulations: ['California AB 988 (Miles Hall Lifeline Act)', 'CalMHSA Crisis Guidelines'],
    practicalApplicationPrompt: 'A peer discloses passive thoughts of suicide. Walk through the collaborative, non-punitive steps you take to evaluate safety and mobilize support.'
  },
  {
    id: 'mod_cpss_09',
    moduleNumber: 9,
    track: '80hr_core',
    title: 'Harm Reduction & Substance Use Recovery Navigation',
    hours: 5,
    sb803CompetencyId: 'comp_14',
    competencyTitle: 'Harm Reduction Approaches',
    category: 'Practice',
    description: 'Examine harm reduction as a compassionate, evidence-based paradigm, overdose prevention, Naloxone (Narcan) administration, and fentanyl test strip education.',
    learningObjectives: [
      'Demonstrate Naloxone (Narcan) nasal spray administration and rescue breathing techniques.',
      'Facilitate open, non-judgmental dialogue about safer substance use practices and risk reduction.',
      'Support peers who choose abstinence, medication-assisted recovery (MAT/MOUD), or moderation without imposing personal recovery dogma.'
    ],
    keyTopics: ['Harm Reduction Philosophy & Ethics', 'Opioid Overdose Reversal with Naloxone', 'Medications for Addiction Treatment (MAT/MOUD)', 'Fentanyl Test Strip Education'],
    dhcsRegulations: ['California Statewide Standing Order for Naloxone', 'DMC-ODS Peer Support Regulations'],
    practicalApplicationPrompt: 'A peer in a housing program is worried about relapsing on opioids. How do you discuss overdose safety planning without jeopardizing their housing?'
  },
  {
    id: 'mod_cpss_10',
    moduleNumber: 10,
    track: '80hr_core',
    title: 'Self-Advocacy Coaching & Rights Protection',
    hours: 4,
    sb803CompetencyId: 'comp_07',
    competencyTitle: 'Self-Advocacy & Peer Rights',
    category: 'Practice',
    description: 'Empower peers to assert their rights with healthcare providers, landlords, social service agencies, and county clinics through role-play and preparation.',
    learningObjectives: [
      'Distinguish peer advocacy (standing beside and coaching) from representative advocacy (speaking on behalf of).',
      'Coach peers on preparing agenda questions and communication strategies for doctor appointments and case conferences.',
      'Inform peers of mental health patients’ rights under California law and how to access County Patients’ Rights Advocates.'
    ],
    keyTopics: ['Coaching vs. Speaking For', 'California Patients’ Rights Advocates (PRA)', 'Assertive Communication Role-Play', 'Overcoming Institutional Disempowerment'],
    dhcsRegulations: ['Cal. Welf. & Inst. Code § 5325 (Patients’ Rights)', 'CalMHSA Practice Standard 2.4'],
    practicalApplicationPrompt: 'Help a peer prepare for an appointment with a psychiatrist where they wish to discuss medication side effects they dislike.'
  },
  {
    id: 'mod_cpss_11',
    moduleNumber: 11,
    track: '80hr_core',
    title: 'Goal Setting, WRAP® & Wellness Recovery Action Plans',
    hours: 5,
    sb803CompetencyId: 'comp_08',
    competencyTitle: 'Goal Setting & Recovery Planning',
    category: 'Practice',
    description: 'Learn the Wellness Recovery Action Plan (WRAP®) evidence-based model: daily maintenance plan, triggers, early warning signs, and crisis/post-crisis planning.',
    learningObjectives: [
      'Guide a peer through building an individualized Daily Maintenance Plan.',
      'Identify personal internal triggers and external stressors with corresponding action plans.',
      'Formulate post-crisis reintegration plans that preserve autonomy and recovery gains.'
    ],
    keyTopics: ['WRAP® 5 Key Concepts', 'Daily Maintenance List', 'Triggers & Action Plans', 'Early Warning Signs', 'Crisis & Post-Crisis Planning'],
    dhcsRegulations: ['SAMHSA Evidence-Based Practice Toolkit for Illness Management and Recovery (IMR)'],
    practicalApplicationPrompt: 'Assist a peer in identifying three subtle early warning signs that tell them their wellness is slipping, and what specific action to take.'
  },
  {
    id: 'mod_cpss_12',
    moduleNumber: 12,
    track: '80hr_core',
    title: 'System Navigation & CalAIM Community Supports',
    hours: 5,
    sb803CompetencyId: 'comp_11',
    competencyTitle: 'System Navigation & Linkage',
    category: 'Navigation',
    description: 'Navigate California CalAIM Community Supports (Housing Transition, Housing Tenancy, Recuperative Care, Medically Tailored Meals) and community resources.',
    learningObjectives: [
      'Map the 14 CalAIM Community Supports and identify eligibility criteria for enrolled Medi-Cal beneficiaries.',
      'Coordinate warm handoffs to community food pantries, housing navigators, legal aid, and DMV ID voucher programs.',
      'Maintain an updated community resource directory with contact names and real accessibility barriers.'
    ],
    keyTopics: ['CalAIM 14 Community Supports', 'Coordinated Entry System (CES) for Housing', 'Warm Handoffs vs. Cold Referrals', 'Navigating Social Security (SSI/SSDI)'],
    dhcsRegulations: ['DHCS CalAIM Community Supports (In-Lieu-of Services) Policy Guide'],
    practicalApplicationPrompt: 'Detail the steps to perform a warm handoff for an unhoused peer seeking CalAIM Housing Transition Navigation services.'
  },
  {
    id: 'mod_cpss_13',
    moduleNumber: 13,
    track: '80hr_core',
    title: 'Digital Health Literacy & Secure Field Tools',
    hours: 4,
    sb803CompetencyId: 'comp_12',
    competencyTitle: 'Digital Health & Health Literacy',
    category: 'Navigation',
    description: 'Empower peers to access patient portals, telehealth platforms, Lifeline (Obama Phone) programs, and utilize secure, offline field note tools like Peer Notebook.',
    learningObjectives: [
      'Guide peers on setting up and utilizing Medi-Cal managed care health plan smartphone applications.',
      'Address the digital divide by assisting peers with California Lifeline wireless device enrollment.',
      'Demonstrate HIPAA-compliant offline-first documentation practices using encrypted local vaults.'
    ],
    keyTopics: ['California Lifeline Program', 'Patient Portal Navigation', 'Telehealth Readiness Coaching', 'Digital Security & Confidentiality in Public Spaces'],
    dhcsRegulations: ['HIPAA Security Rule 45 CFR § 164.312', 'DHCS Telehealth Policy Guidance'],
    practicalApplicationPrompt: 'How do you coach a peer with low tech literacy to attend their first video telehealth psychiatry appointment without doing it all for them?'
  },
  {
    id: 'mod_cpss_14',
    moduleNumber: 14,
    track: '80hr_core',
    title: 'Community Integration, Mutual Aid & Social Connection',
    hours: 4,
    sb803CompetencyId: 'comp_13',
    competencyTitle: 'Community Integration & Connection',
    category: 'Navigation',
    description: 'Support peers in connecting with community groups, recovery community organizations (RCOs), 12-Step, SMART Recovery, Refuge Recovery, and wellness centers.',
    learningObjectives: [
      'Introduce peers to varied mutual aid recovery frameworks (12-step, secular, Buddhist-inspired, peer-led).',
      'Accompany peers to their first community meeting or peer respite drop-in center when requested.',
      'Strategize overcoming social isolation and building sustainable recovery capital in the neighborhood.'
    ],
    keyTopics: ['Spectrum of Mutual Aid Fellowships', 'Recovery Community Centers (RCCs)', 'Building Non-Clinical Social Networks', 'Combating Loneliness'],
    dhcsRegulations: ['CalMHSA Competency Standard 3.1'],
    practicalApplicationPrompt: 'A peer is hesitant to attend mutual aid meetings because they dislike traditional 12-step wording. What secular or alternative options do you present?'
  },
  {
    id: 'mod_cpss_15',
    moduleNumber: 15,
    track: '80hr_core',
    title: 'Multi-Disciplinary Team Collaboration & Scope Protection',
    hours: 4,
    sb803CompetencyId: 'comp_15',
    competencyTitle: 'Multi-Disciplinary Collaboration',
    category: 'Practice',
    description: 'Work effectively inside clinical teams (psychiatrists, LCSWs, nurses, probation officers) while firmly maintaining non-clinical peer role clarity.',
    learningObjectives: [
      'Communicate peer insights effectively during multi-disciplinary team (MDT) case conferences.',
      'Advocate against punitive clinical attitudes or diagnostic labeling of peers in team meetings.',
      'Protect peer scope: reject clinical tasks such as administering drug tests, taking vitals, or acting as security.'
    ],
    keyTopics: ['MDT Case Conferences', 'Educating Colleagues on Peer Role', 'Boundary Defense: What Peers Do NOT Do', 'Bridge-Building between Peer and Clinic'],
    dhcsRegulations: ['CalMHSA CPSS Scope of Practice Guidelines'],
    practicalApplicationPrompt: 'A clinical case manager asks you to search a client’s backpack for contraband before a group meeting. How do you decline while maintaining teamwork?'
  },
  {
    id: 'mod_cpss_16',
    moduleNumber: 16,
    track: '80hr_core',
    title: 'Peer Specialist Self-Care, Burnout & Recovery Maintenance',
    hours: 4,
    sb803CompetencyId: 'comp_16',
    competencyTitle: 'Self-Care & Burnout Prevention',
    category: 'Ethics & Wellness',
    description: 'Prioritize ongoing personal recovery, recognize compassion fatigue and vicarious trauma, and implement structured supervisory debriefing routines.',
    learningObjectives: [
      'Construct a Personal Wellness Recovery Plan tailored to professional peer support challenges.',
      'Identify early symptoms of secondary traumatic stress, emotional exhaustion, and burnout.',
      'Utilize reflective peer supervision effectively to process difficult field encounters.'
    ],
    keyTopics: ['Vicarious Resiliency vs. Compassion Fatigue', 'Professional Isolation', 'Peer-to-Peer Debriefing', 'Sustainable Boundary Rituals'],
    dhcsRegulations: ['CalMHSA Code of Ethics Principle 7 (Self-Care)'],
    practicalApplicationPrompt: 'Describe your personal transition ritual at the end of a shift to disconnect from the emotional weight of peer challenges.'
  },
  {
    id: 'mod_cpss_17',
    moduleNumber: 17,
    track: '80hr_core',
    title: 'Supervisory Engagement & Continuous Professional Growth',
    hours: 4,
    sb803CompetencyId: 'comp_17',
    competencyTitle: 'Supervision & Continuous Learning',
    category: 'Ethics & Wellness',
    description: 'Engage actively in California CPSS supervision, prepare for annual recertification (20 CEUs), and explore peer career advancement pathways.',
    learningObjectives: [
      'Prepare an agenda for weekly or bi-weekly 1-on-1 supervision sessions with your clinical or peer supervisor.',
      'Document and track the 20 hours of approved continuing education needed every two years for CPSS-CA recertification.',
      'Navigate ethical dilemmas through structured consultation models.'
    ],
    keyTopics: ['Reflective Supervision Models', 'CalMHSA Recertification Requirements', 'Career Ladders in Peer Support', 'Ethical Decision-Making Matrix'],
    dhcsRegulations: ['CalMHSA Recertification Guidelines (20 CEUs / 2 years)', 'DHCS Supervision Standards'],
    practicalApplicationPrompt: 'Outline three specific boundary or documentation questions you plan to bring to your next supervision meeting.'
  }
];

export const CALMHSA_40HR_SPECIALIZED_MODULES: CurriculumModule[] = [
  {
    id: 'mod_spec_01',
    moduleNumber: 1,
    track: '40hr_specialized',
    title: 'CalAIM Enhanced Care Management (ECM) & Community Supports Specialist',
    hours: 10,
    sb803CompetencyId: 'comp_11',
    competencyTitle: 'System Navigation & Linkage',
    category: 'Specialized',
    description: 'Advanced field navigation for Medi-Cal beneficiaries experiencing high utilization, complex chronic physical and behavioral health conditions, and severe housing instability.',
    learningObjectives: [
      'Master the 7 CalAIM ECM Populations of Focus (individuals experiencing homelessness, high utilizers, adults with SMI/SUD, justice-involved, transition-age youth, nursing facility transitions).',
      'Conduct Lead Care Manager outreach, locate hard-to-find members in field settings, and co-create Comprehensive Care Management Plans.',
      'Document billable ECM encounters and coordinate directly with managed care health plan care managers.'
    ],
    keyTopics: ['7 Populations of Focus', 'Field-Based Locating Strategies', 'Comprehensive Care Plans (CCPs)', 'Community Supports Authorization Workflows'],
    dhcsRegulations: ['DHCS CalAIM ECM Standard Terms and Conditions', 'Medi-Cal Managed Care Rule 22-031'],
    practicalApplicationPrompt: 'You are assigned to engage an unsheltered peer who has been unenrolled from three clinics due to missed appointments. Outline your outreach approach.'
  },
  {
    id: 'mod_spec_02',
    moduleNumber: 2,
    track: '40hr_specialized',
    title: 'Forensic & Justice-Involved Peer Support (CalAIM Justice Mandate)',
    hours: 10,
    sb803CompetencyId: 'comp_07',
    competencyTitle: 'Self-Advocacy & Peer Rights',
    category: 'Specialized',
    description: 'Provide pre-release and post-release reentry peer coaching for individuals transitioning from California county jails and state prisons under the CalAIM Justice-Involved Initiative.',
    learningObjectives: [
      'Understand the 90-day pre-release Medi-Cal enrollment and service planning process under California’s 1115 demonstration waiver.',
      'Address the unique stigma, institutionalization trauma, and employment barriers faced by justice-involved peers.',
      'Support probation/parole compliance through voluntary goal alignment without acting as an arm of law enforcement.'
    ],
    keyTopics: ['California 1115 Justice-Involved Reentry Initiative', 'Pre-Release 90-Day Transition Window', 'Expungement & Clean Slate Resources', 'Trauma of Incarceration'],
    dhcsRegulations: ['California 1115 CalAIM Waiver Reentry Demonstration', 'AB 133 Justice Mandates'],
    practicalApplicationPrompt: 'A peer on active probation discloses anxiety about their upcoming probation officer check-in. How do you support them while respecting legal boundaries?'
  },
  {
    id: 'mod_spec_03',
    moduleNumber: 3,
    track: '40hr_specialized',
    title: 'Street Medicine & Unsheltered Encampment Peer Outreach',
    hours: 10,
    sb803CompetencyId: 'comp_14',
    competencyTitle: 'Harm Reduction Approaches',
    category: 'Specialized',
    description: 'Field-based harm reduction and health engagement for peers residing in encampments, vehicles, and underpasses, partnering with street medicine clinicians.',
    learningObjectives: [
      'Navigate encampment protocols: respecting personal property, territory, and safety assessments.',
      'Facilitate street-based wound care triage, hydration, weather exposure protection, and hygiene kit distribution.',
      'Build persistent rapport over multiple field visits without pushing premature clinical or housing demands.'
    ],
    keyTopics: ['Street Medicine Guidelines', 'Encampment Cultural Etiquette', 'Overdose Prevention in Remote Settings', 'Vector-Borne & Environmental Illness Awareness'],
    dhcsRegulations: ['DHCS Street Medicine Place of Service 27 Guidelines', 'CalAIM Street Medicine Policy Memo'],
    practicalApplicationPrompt: 'Describe how you introduce yourself to a resident in a remote riverbed encampment, ensuring respect for their sovereign personal space.'
  },
  {
    id: 'mod_spec_04',
    moduleNumber: 4,
    track: '40hr_specialized',
    title: 'Peer Respite & Crisis Residential Alternatives to Hospitalization',
    hours: 10,
    sb803CompetencyId: 'comp_09',
    competencyTitle: 'Crisis Planning & De-escalation',
    category: 'Specialized',
    description: 'Staffing voluntary peer-run respites, implementing 24/7 relational support, non-restraint environments, and supporting guests navigating intense emotional distress.',
    learningObjectives: [
      'Operate within the Intentional Peer Support (IPS) framework used in California Peer Respites.',
      'Hold space for acute emotional distress, altered states, and intense grief without triggering emergency medical or police calls.',
      'Facilitate peaceful community living, shared meals, and voluntary conflict resolution among respite guests.'
    ],
    keyTopics: ['Intentional Peer Support (IPS) Framework', 'Voluntary Peer Respite Principles', 'De-escalation in Residential Settings', 'Moving from Crisis to Connection'],
    dhcsRegulations: ['California Mental Health Services Act (MHSA) Innovation Guidelines', 'CalMHSA Peer Respite Standards'],
    practicalApplicationPrompt: 'A peer respite guest is having intense auditory distress at 2:00 AM and is pacing the hallway. How do you support them in that moment?'
  }
];

export const STAR_INTERVIEW_SCENARIOS: STARInterviewScenario[] = [
  {
    id: 'star_01',
    title: 'De-escalating Agitation in a Busy County Clinic Waiting Area',
    category: 'Crisis De-escalation',
    competencyId: 'comp_09',
    competencyName: 'Crisis Planning & De-escalation',
    promptQuestion: 'Tell me about a time when a peer you were working with became extremely frustrated, raised their voice, and threatened to walk out of an agency before getting needed services. How did you handle the situation?',
    contextBackground: 'A peer with a history of trauma experiences sensory overload and feeling ignored after waiting two hours past their appointment time.',
    starBreakdown: {
      situation: 'In my role as a peer navigator at an urban behavioral health center, a client who had been waiting 90 minutes for a housing coordinator stood up, slammed their folder on the desk, shouted that the agency did not care about poor people, and headed toward the exit.',
      task: 'My responsibility was not to act as security or force the peer to stay, but to offer immediate, voluntary relational de-escalation, validate their justifiable frustration, and preserve their connection to needed housing support.',
      action: 'I immediately stepped into the hallway beside them—leaving ample physical space so they did not feel cornered. Using a calm, lowered vocal tone, I said: "I hear how infuriating it is to sit in that chair for an hour and a half feeling forgotten. You have every right to be frustrated. May I walk outside to the patio with you to get some fresh air?" Once outside, I offered them a cold bottle of water and practiced quiet presence. I validated that their time is just as valuable as any provider’s. After their breathing slowed, I asked if they wanted me to step back in and advocate with the front desk on their behalf, while they rested on the bench.',
      result: 'The peer chose to take a 10-minute break outside rather than walking away. Because they felt respected and heard, they returned with me to the office. I advocated with the clinic manager, secured an immediate 20-minute meeting with the housing case manager, and the peer submitted their CalAIM housing transition voucher before the deadline.'
    },
    modelResponse: '"When someone is expressing anger in our systems, it is usually a rational response to feeling dismissed or retraumatized. Rather than treating anger as a symptom to be controlled, I validate the real grievance, give physical space, regulate my own nervous system first, and partner with the peer to regain control of their own outcome."',
    clinicalPitfallsToAvoid: [
      'Do not call security or 911 unless there is imminent physical violence.',
      'Do not tell the person to "calm down" or "be quiet"—this escalates distress.',
      'Do not take their frustration personally or defend the agency bureaucracy over the peer.'
    ],
    calmhsaKeyRule: 'CalMHSA Ethics § 4.1: Peer Support Specialists prioritize dignity, de-escalation, and voluntary partnership over coercion or institutional convenience.'
  },
  {
    id: 'star_02',
    title: 'Purposeful Lived Experience Disclosure with a Depressed Peer',
    category: 'Lived Experience Disclosure',
    competencyId: 'comp_02',
    competencyName: 'Shared Lived Experience & Storytelling',
    promptQuestion: 'How do you decide when and how much of your own recovery journey to share with a peer? Can you share an example of when your personal story helped a client make progress?',
    contextBackground: 'A peer recently discharged from a psychiatric facility believes that having a mental health diagnosis means their career and independence are over.',
    starBreakdown: {
      situation: 'I was assigned to support a 24-year-old peer who had recently experienced their first psychiatric hospitalization and was placed on antipsychotic medication. They were sitting with their head down, saying: "My life is ruined. Nobody with this diagnosis ever gets a real job or lives on their own."',
      task: 'My goal was to instill authentic hope without minimizing their grief or turning the conversation into a monologue about my own history.',
      action: 'I paused and checked my motivation: Was sharing my story going to help this peer, or was it just me wanting to talk? Recognizing it directly addressed their hopelessness, I said: "Hearing you say that brings back an exact memory of sitting in my own hospital room ten years ago feeling completely broken. Can I share a brief piece of what helped me take my first steps forward?" With their permission, I shared that I too had felt my future was erased, but that recovery happened in tiny 1% increments—starting with one daily walk and finding a peer community that saw me as a person, not a diagnosis. I kept my story to under two minutes and immediately pivoted back to them: "What is one small thing that gave you peace before this hospital stay?"',
      result: 'The peer looked up, made eye contact for the first time, and said: "You really get it because you were there." They agreed to explore joining a weekly young adult peer recovery group and identified listening to music as their grounding tool for the week.'
    },
    modelResponse: '"In peer support, my story is a precision tool, not a public speech. I always ask: Is this story for their healing or my ego? If it serves their goal, I keep it brief, focus on the tools and hope rather than war stories, and immediately pivot the spotlight back onto their resilience."',
    clinicalPitfallsToAvoid: [
      'Do not dominate the session with long, detailed accounts of your past trauma or symptoms.',
      'Do not share raw, unhealed challenges that you have not yet resolved.',
      'Do not claim "If I could do it, you have no excuse"—recovery is unique to each individual.'
    ],
    calmhsaKeyRule: 'CalMHSA Ethics § 3.2: Lived experience is shared strictly for the benefit and empowerment of the peer, never to satisfy the specialist’s emotional needs.'
  },
  {
    id: 'star_03',
    title: 'Navigating a Boundary Challenge: Gift and Personal Phone Number',
    category: 'Ethics & Boundaries',
    competencyId: 'comp_03',
    competencyName: 'Code of Ethics & Boundaries',
    promptQuestion: 'Peer relationships are built on warmth and trust, which can sometimes blur boundaries. Tell me about a time a client wanted a personal friendship outside of work, offered you a gift, or asked for your personal cell number. How did you manage it?',
    contextBackground: 'A peer who successfully obtained housing wants to express gratitude during the holidays by giving the CPSS an expensive espresso maker and asking for their personal phone number to "hang out as friends."',
    starBreakdown: {
      situation: 'Around the winter holidays, a peer I had supported through a six-month housing stabilization process arrived with a wrapped $150 espresso machine and said: "You saved my life. I want you to have this, and here is my personal phone number so we can grab drinks this weekend like real friends."',
      task: 'My task was to uphold the CalMHSA Code of Ethics regarding non-dual relationships and gift acceptance while honoring the peer’s genuine gratitude and preserving their dignity.',
      action: 'I received their words with heartfelt appreciation: "I am so deeply moved by your kind words and seeing you in your own apartment with your keys. That is the greatest reward I could ever hope for." I then gently explained the agency and certification boundary: "Because our relationship is protected by California certification standards and agency policy, I cannot accept gifts of monetary value, nor am I permitted to socialize outside our professional peer role or share personal phone numbers. We do this to protect your privacy and ensure this space remains 100% focused on your safety and recovery goals." I invited them to write a note or card instead, which I proudly displayed in our community workspace.',
      result: 'The peer felt validated rather than rejected. They took the espresso maker back to the store and brought a handwritten thank-you card the following week. Our professional alliance remained strong, and they transitioned smoothly toward community mutual aid groups for independent social friendship.'
    },
    modelResponse: '"Boundaries in peer support are not walls that keep people out; they are the guardrails that make the bridge safe to walk across. I protect peers by setting kind, clear boundaries early and explaining that boundaries exist to safeguard their space, not to reject them as human beings."',
    clinicalPitfallsToAvoid: [
      'Do not accept expensive gifts or cash under any circumstances.',
      'Do not give out personal cell numbers, social media handles, or home addresses.',
      'Do not harshly scold the peer; explain the boundary from a place of care and professional ethics.'
    ],
    calmhsaKeyRule: 'CalMHSA Ethics § 1.3: Specialists do not engage in dual relationships, business transactions, or accept personal gifts exceeding nominal value.'
  },
  {
    id: 'star_04',
    title: 'Advocating for Peer Dignity in a Clinical Case Conference',
    category: 'Advocacy & Dignity',
    competencyId: 'comp_15',
    competencyName: 'Multi-Disciplinary Collaboration',
    promptQuestion: 'Peer specialists often work in multi-disciplinary teams alongside clinicians, nurses, and psychiatrists. Describe a situation where you had to advocate for a peer’s autonomy when the clinical team held a different, more restrictive view.',
    contextBackground: 'A clinical case conference plans to recommend conservatorship or mandatory residential placement because an unhoused peer missed two clinic appointments.',
    starBreakdown: {
      situation: 'In a weekly multi-disciplinary team meeting, a clinical case manager labeled a 52-year-old unhoused peer as "chronically non-compliant and incapable of living independently" because they had missed two laboratory appointments, recommending we initiate conservatorship proceedings.',
      task: 'My role was to represent the peer’s perspective, counter dehumanizing clinical labeling, and advocate for their self-determination and reasonable accommodation.',
      action: 'I spoke up respectfully: "I hear the concern for their medical health, but I want to provide critical field context that isn’t in the electronic health record. The client’s encampment was swept by the city last Tuesday; they lost their backpack with their phone and appointment calendar. When I met with them in the park yesterday, they expressed deep distress over missing the appointment and asked me to help them re-engage." I proposed that instead of escalating to coercive measures, I would meet them in the field on Monday morning, provide transit passes, and accompany them directly to the laboratory.',
      result: 'The psychiatrist agreed with my proposed non-coercive plan. On Monday, the peer and I met as planned, completed the laboratory draw, and co-created a pocket-sized visual appointment card. The clinical team gained increased appreciation for field-based peer insights, and the peer’s autonomy was preserved.'
    },
    modelResponse: '"Peers are not non-compliant; they are often navigate overwhelming structural obstacles. In clinical team meetings, I serve as a bridge of understanding, translating what clinicians see as defiance into what is actually an unmet need or systemic barrier, while keeping the client’s self-determination at the center."',
    clinicalPitfallsToAvoid: [
      'Do not attack or antagonize clinical teammates; use factual field observations and strengths.',
      'Do not remain silent when a peer is being mischaracterized or stripped of rights.',
      'Do not agree to non-peer clinical duties like drug screening or forced transport.'
    ],
    calmhsaKeyRule: 'CalMHSA Competency 15: Peer specialists operate as equal partners on multi-disciplinary teams, defending recovery philosophy and human rights.'
  },
  {
    id: 'star_05',
    title: 'Harm Reduction & Overdose Safety Planning with an Active Substance User',
    category: 'CalAIM Navigation',
    competencyId: 'comp_14',
    competencyName: 'Harm Reduction Approaches',
    promptQuestion: 'How do you work with a client who is actively using substances and states they have no desire to stop? Give an example of how you apply harm reduction principles in your day-to-day work.',
    contextBackground: 'A peer in a supportive housing program admits they are using street fentanyl and are terrified of losing their apartment if anyone finds out.',
    starBreakdown: {
      situation: 'During a field visit in a permanent supportive housing site, a peer broke down in tears and disclosed: "I’m using fentanyl again every night. I know I’m supposed to be clean to stay here. If you tell my housing manager, I’ll be back on the sidewalk, so I’d rather die than tell anyone."',
      task: 'My priority was immediate life safety, preventing fatal overdose, affirming that my role as a peer specialist is non-punitive, and meeting them where they are without judgment.',
      action: 'I first reassured them: "I am your peer specialist, not a probation officer or building inspector. My only priority is that you stay alive and safe in your home." I asked permission to talk about harm reduction tools. With their consent, we reviewed three life-saving strategies: never using alone, testing with fentanyl test strips, and having Naloxone (Narcan) easily visible and accessible. I gave them two boxes of Narcan, demonstrated proper administration, and shared information on the "Never Use Alone" toll-free hotline (800-484-3731). We also explored whether they wanted to learn about buprenorphine (MAT/MOUD) from a harm-reduction physician without any pressure.',
      result: 'The peer kept their Narcan by their nightstand and registered with the Never Use Alone service. Two weeks later, having experienced unconditional support without eviction threats, the peer voluntarily asked me to accompany them to an outpatient MAT clinic to start buprenorphine.'
    },
    modelResponse: '"Harm reduction means meeting people where they are, but never leaving them there alone. By replacing punishment and moral judgment with tangible safety tools and radical compassion, we keep people alive until they are ready to make changes on their own timeline."',
    clinicalPitfallsToAvoid: [
      'Do not threaten eviction or report substance use to landlords or authorities unless required by acute danger.',
      'Do not lecture the person on abstinence or moral failure.',
      'Do not withhold resources or empathy because someone is actively using drugs.'
    ],
    calmhsaKeyRule: 'CalMHSA Competency 14: Specialists embrace harm reduction as a legitimate, life-affirming pathway that respects client bodily autonomy.'
  }
];

export const CALMHSA_ETHICS_CHECKLIST_DATA = [
  {
    id: 'eth_01',
    ruleNumber: 1,
    title: 'Self-Determination & Voluntary Engagement',
    shortLabel: 'Client Self-Determination',
    description: 'I honor the peer’s right to make their own choices, direct their recovery path, and decline services without coercion, threat, or paternalistic pressure.',
    practiceStandard: 'Peers define what recovery means for themselves. We walk beside them, never pushing our personal agenda.'
  },
  {
    id: 'eth_02',
    ruleNumber: 2,
    title: 'Non-Clinical Scope of Practice',
    shortLabel: 'Scope Integrity',
    description: 'I deliver non-clinical peer support and strictly avoid giving psychiatric diagnoses, modifying prescriptions, performing psychotherapy, or administering drug tests.',
    practiceStandard: 'Our credibility comes from shared humanity and lived experience, not clinical authority.'
  },
  {
    id: 'eth_03',
    ruleNumber: 3,
    title: 'Dual & Exploitative Relationships Prohibition',
    shortLabel: 'Zero Dual Relationships',
    description: 'I maintain unambiguous professional boundaries: no romantic, sexual, financial, or business relationships with peers currently or historically served.',
    practiceStandard: 'Protecting the vulnerability of the peer requires an absolute firewall against exploitation.'
  },
  {
    id: 'eth_04',
    ruleNumber: 4,
    title: 'Purposeful & Ethical Lived Experience Sharing',
    shortLabel: 'Ethical Storytelling',
    description: 'I share my personal recovery history solely to inspire hope and model problem-solving for the benefit of the peer, never to vent, seek comfort, or burden them.',
    practiceStandard: 'Always ask: "Who is this story helping right now?"'
  },
  {
    id: 'eth_05',
    ruleNumber: 5,
    title: 'Confidentiality & Legal Limits (HIPAA / CANRA)',
    shortLabel: 'Confidentiality Limits',
    description: 'I protect peer privacy under HIPAA and 42 CFR Part 2 while clearly communicating mandatory reporting duties: imminent self-harm, harm to others, child/elder abuse.',
    practiceStandard: 'Informed consent is continuous; peers must always know the boundaries of privacy upfront.'
  },
  {
    id: 'eth_06',
    ruleNumber: 6,
    title: 'Financial & Gift Boundaries',
    shortLabel: 'Gift & Money Integrity',
    description: 'I do not loan or borrow money, buy personal property from peers, or accept gifts of monetary value that could compromise professional objectivity.',
    practiceStandard: 'Accepting tokens of nominal value (e.g., a card or drawing) is acceptable; cash or high-value items are declined with warmth.'
  },
  {
    id: 'eth_07',
    ruleNumber: 7,
    title: 'Cultural Humility & Non-Discrimination',
    shortLabel: 'Cultural Humility',
    description: 'I practice active cultural humility, continually confronting implicit bias, and affirming diverse races, sexual orientations, gender identities, and recovery pathways.',
    practiceStandard: 'Honor traditional indigenous, religious, spiritual, and secular healing practices chosen by the peer.'
  },
  {
    id: 'eth_08',
    ruleNumber: 8,
    title: 'Harm Reduction & Non-Judgmental Stance',
    shortLabel: 'Harm Reduction Affirmation',
    description: 'I support individuals at all points of the recovery continuum, including active substance use, through evidence-based harm reduction and compassionate presence.',
    practiceStandard: 'Zero punitive or shaming attitudes toward substance use, relapse, or differing recovery speeds.'
  },
  {
    id: 'eth_09',
    ruleNumber: 9,
    title: 'Duty to Consult & Supervisory Transparency',
    shortLabel: 'Supervisory Debriefing',
    description: 'I proactively bring boundary challenges, secondary trauma, and ethical grey areas to my supervisor for open, transparent guidance.',
    practiceStandard: 'Supervision is a safety container for the specialist, safeguarding both the worker and the peer.'
  },
  {
    id: 'eth_10',
    ruleNumber: 10,
    title: 'Personal Wellness & Secondary Trauma Management',
    shortLabel: 'Specialist Self-Care',
    description: 'I actively monitor my own recovery foundation, recognize burnout and compassion fatigue, and take concrete steps to maintain personal wellness.',
    practiceStandard: 'You cannot pour from an empty cup; protecting your recovery is an ethical requirement for serving others.'
  }
];

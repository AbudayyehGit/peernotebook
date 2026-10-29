# California Senate Bill 803 (SB 803) & CalMHSA 17 Core Competencies

**Standard:** California Senate Bill 803 (Chapter 150, Statutes of 2020) • Welfare and Institutions Code §§ 14045.10–14045.21  
**Credential:** Medi-Cal Certified Peer Support Specialist (CPSS-CA)  
**Regulatory Authorities:** California Department of Health Care Services (DHCS) & California Mental Health Services Authority (CalMHSA)  
**System Status:** Full In-App Alignment (`src/data/sb803Competencies.ts`, `src/components/SB803CompetencyGuide.tsx`)

---

## 1. Regulatory Context & Scope of Practice

Under California SB 803, peer support specialists are legally recognized as specialized Medi-Cal behavioral health providers. Services provided by Certified Peer Support Specialists (CPSS-CA) are billable under HCPCS Code **H0038** (Self-help / Peer support services) across California's 58 county mental health and substance use disorder delivery systems.

To maintain audit defense and CMS reimbursement validity, documentation must demonstrate that the peer support specialist operated within their non-clinical scope of practice while actively applying one or more of the **17 CalMHSA Core Competencies**.

---

## 2. The 17 Core Competencies & CalAIM Documentation Matrix

| # | Competency Title | Domain | Plain-English Summary | CalAIM H0038 Documentation Prompt |
|---|---|---|---|---|
| 01 | **The Recovery Model & Philosophy** | Foundation | Fosters hope, self-determination, and personal empowerment. | *How did this encounter reinforce the peer’s hope, self-direction, or unique recovery vision?* |
| 02 | **Peer Support Specialist Role & Ethics** | Ethics & Wellness | Maintains peer boundaries, voluntary mutual aid, and confidentiality. | *How did the specialist model appropriate peer boundaries and voluntary partnership during the session?* |
| 03 | **Trauma-Informed Care Practices** | Practice | Creates emotional and cultural safety, avoiding re-traumatization. | *What steps ensured the peer felt physically, emotionally, and culturally safe during the encounter?* |
| 04 | **Cultural Humility & Responsiveness** | Practice | Honors diverse lived backgrounds, cultural ties, and language needs. | *How were the peer’s cultural background, values, and community connections incorporated into their recovery journey?* |
| 05 | **Communication & Active Listening** | Practice | Utilizes reflective listening, open questions, and non-judgmental dialogue. | *What specific active listening or motivational reflections supported the peer’s self-expression?* |
| 06 | **Collaboration and Teamwork** | Practice | Coordinates with behavioral health and community care circles with peer consent. | *How did the specialist coordinate with the peer’s broader care circle while protecting peer voice?* |
| 07 | **Conflict Resolution & De-escalation** | Practice | Employs calm presence, voluntary space, and zero-coercion interventions. | *What de-escalation strategies or collaborative problem-solving techniques were utilized?* |
| 08 | **Wellness & Recovery Action Planning (WRAP)** | Navigation | Builds individualized self-care tools, daily routines, and crisis triggers. | *Which wellness tools or recovery action plan components did the peer develop or review?* |
| 09 | **Navigating Community Systems & CalAIM** | Navigation | Connects peers to housing deposits, food access, transit, and Community Supports. | *What community resources or CalAIM In Lieu of Services / Community Supports were explored?* |
| 10 | **Goal Setting & Action Planning** | Foundation | Translates client vision into manageable, celebrated recovery milestones. | *What specific, peer-identified step or target was formulated for the coming week?* |
| 11 | **Facilitating Peer Support Groups** | Practice | Cultivates inclusive mutual aid circles under H0038-HQ billing rules. | *How was mutual participation and peer-led wisdom fostered during the group encounter?* |
| 12 | **Advocacy in Mental Health & Substance Use** | Navigation | Empowers peers to self-advocate for rights, choices, and dignified care. | *How was the peer supported in self-advocating with providers, family, or institutions?* |
| 13 | **Digital Literacy & Electronic Documentation** | Ethics & Wellness | Timely, HIPAA/CMIA compliant electronic progress notes in Peer Notebook. | *How did timely documentation preserve confidentiality and accurately convey the peer’s progress?* |
| 14 | **System Navigation & Rights** | Navigation | Informs peers regarding grievance procedures, advance directives, and county plans. | *What rights or system options were clarified to help the peer make informed treatment decisions?* |
| 15 | **Harm Reduction & Overdose Prevention** | Practice | Offers non-judgmental safer-use education, naloxone, and trigger safety. | *What harm reduction strategies, safer-use planning, or overdose awareness were discussed?* |
| 16 | **Crisis Prevention & Zero-Coercion** | Practice | Detects distress early, coordinates warm lines, and avoids involuntary holds. | *What preventive or low-barrier crisis alternatives were agreed upon to preserve safety and autonomy?* |
| 17 | **Self-Care & Burnout Prevention** | Ethics & Wellness | Monitors secondary trauma, attends supervision, and sustains wellness. | *How did the specialist maintain personal equilibrium, consultation, and sustainability in their service role?* |

---

## 3. Peer Notebook System Integration

1. **Tagging Engine:** Specialist selects one or more competencies during note formulation in `SessionNoteForm.tsx`.
2. **Encrypted Storage:** Tagged identifiers (`sb803Competencies: string[]`) are indexed locally in Dexie.js and synced to Supabase under PostgreSQL RLS.
3. **Audit Evidence:** Exported charts (`ExportSessionPDF.tsx`) and FHIR R4 interoperability payloads bundle SB 803 tags for county billing audits.
4. **Interactive Guide:** The in-app guide (`SB803CompetencyGuide.tsx`) provides plain-English prompts with zero clinical jargon.

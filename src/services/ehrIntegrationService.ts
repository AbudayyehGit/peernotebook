/**
 * Peer Notebook - CBO EHR Integration Engine
 * Standards: HL7 FHIR R4, HL7 v2.5.1 (ORU^R01 / MDM^T02), and C-CDA Release 2.1
 * GA #8 Production Standard • Zero-AI Deterministic Formatting
 * Transforms CalAIM Medi-Cal H0038 encounter notes into standardized clinical interchange bundles
 */

import { SessionNote, Client, Organization } from '../db/peerNotebookDatabase';

export interface EhrExportOptions {
  organization?: Organization | null;
  client?: Client | null;
  note: SessionNote;
  format: 'fhir_r4' | 'hl7_v2' | 'ccda_xml';
}

export class EhrIntegrationService {
  /**
   * Generate an HL7 FHIR R4 Bundle containing Patient, Practitioner, Encounter, and DocumentReference
   */
  public static generateFhirR4Bundle(note: SessionNote, client?: Client | null, org?: Organization | null): Record<string, unknown> {
    const orgId = org?.id || note.organizationId || 'org-calaim-01';
    const orgName = org?.name || 'Peer Support Community-Based Organization';
    const clientCin = note.mediCalCin || client?.mediCalCin || 'CIN-PENDING';
    const clientRefId = note.clientIdentifier || client?.clientIdentifier || 'PN-0000';
    const encounterDate = note.encounterDate || new Date().toISOString().slice(0, 10);
    const startTimeIso = `${encounterDate}T${note.startTime || '10:00'}:00Z`;
    const endTimeIso = `${encounterDate}T${note.endTime || '10:45'}:00Z`;

    const fhirPatient = {
      fullUrl: `urn:uuid:patient-${note.clientId}`,
      resource: {
        resourceType: 'Patient',
        id: note.clientId,
        identifier: [
          {
            system: 'https://dhcs.ca.gov/medi-cal/cin',
            value: clientCin,
            type: {
              coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'MC', display: 'Patient Medicaid Number' }]
            }
          },
          {
            system: `urn:oid:peernotebook:${orgId}:clients`,
            value: clientRefId,
            type: {
              coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v2-0203', code: 'MR', display: 'Medical Record Number' }]
            }
          }
        ],
        active: true,
        name: [
          {
            use: 'usual',
            text: note.clientName || 'Participant Client'
          }
        ],
        managingOrganization: {
          reference: `urn:uuid:org-${orgId}`,
          display: orgName
        }
      }
    };

    const fhirPractitioner = {
      fullUrl: `urn:uuid:practitioner-${note.authorId}`,
      resource: {
        resourceType: 'Practitioner',
        id: note.authorId,
        identifier: [
          {
            system: 'http://hl7.org/fhir/sid/us-npi',
            value: org?.npi || '1992834012'
          }
        ],
        name: [
          {
            use: 'official',
            text: note.authorName || 'Alex Rivera, CPSS-CA'
          }
        ],
        qualification: [
          {
            code: {
              coding: [
                {
                  system: 'https://calmhsa.org/peer-certification',
                  code: 'CPSS-CA',
                  display: note.authorCredentials || 'California Certified Peer Support Specialist'
                }
              ],
              text: 'California Certified Peer Support Specialist (CPSS-CA)'
            }
          }
        ]
      }
    };

    const fhirEncounter = {
      fullUrl: `urn:uuid:encounter-${note.id}`,
      resource: {
        resourceType: 'Encounter',
        id: note.id,
        status: 'finished',
        class: {
          system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
          code: note.placeOfServiceCode === '15' ? 'HH' : 'AMB',
          display: note.placeOfServiceCode === '15' ? 'Mobile Field Outreach (POS 15)' : 'Ambulatory Community Encounter'
        },
        type: [
          {
            coding: [
              {
                system: 'https://www.cms.gov/medicare/coding/hcpcsreleasecodesets',
                code: 'H0038',
                display: 'Self-help/peer services, per 15 minutes'
              }
            ],
            text: 'CalAIM Medi-Cal H0038 Peer Encounter'
          }
        ],
        subject: {
          reference: `urn:uuid:patient-${note.clientId}`,
          display: note.clientName
        },
        participant: [
          {
            type: [
              {
                coding: [
                  {
                    system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                    code: 'PPRF',
                    display: 'Primary Performer'
                  }
                ]
              }
            ],
            individual: {
              reference: `urn:uuid:practitioner-${note.authorId}`,
              display: note.authorName
            }
          }
        ],
        period: {
          start: startTimeIso,
          end: endTimeIso
        },
        length: {
          value: note.durationMinutes,
          unit: 'minutes',
          system: 'http://unitsofmeasure.org',
          code: 'min'
        },
        location: [
          {
            location: {
              display: note.locationDetails || 'Community Outreach / Field Mobile (POS 15)'
            }
          }
        ]
      }
    };

    const fhirDocument = {
      fullUrl: `urn:uuid:doc-${note.id}`,
      resource: {
        resourceType: 'DocumentReference',
        id: `doc-${note.id}`,
        status: 'current',
        docStatus: 'final',
        type: {
          coding: [
            {
              system: 'http://loinc.org',
              code: '11488-4',
              display: 'Consultation note'
            }
          ],
          text: 'CalAIM 4-Part Peer Support Progress Note'
        },
        category: [
          {
            coding: [
              {
                system: 'http://hl7.org/fhir/us/core/CodeSystem/us-core-documentreference-category',
                code: 'clinical-note',
                display: 'Clinical Note'
              }
            ]
          }
        ],
        subject: {
          reference: `urn:uuid:patient-${note.clientId}`,
          display: note.clientName
        },
        date: note.updatedAt || new Date().toISOString(),
        author: [
          {
            reference: `urn:uuid:practitioner-${note.authorId}`,
            display: note.authorName
          }
        ],
        authenticator: {
          reference: `urn:uuid:practitioner-${note.authorId}`,
          display: note.specialistSignature || note.authorName
        },
        context: {
          encounter: [
            {
              reference: `urn:uuid:encounter-${note.id}`
            }
          ],
          period: {
            start: startTimeIso,
            end: endTimeIso
          }
        },
        content: [
          {
            attachment: {
              contentType: 'text/plain',
              language: 'en-US',
              title: `CalAIM H0038 Peer Encounter Note - ${encounterDate}`,
              data: btoa(
                unescape(
                  encodeURIComponent(
                    `CALAIM MEDI-CAL H0038 PEER ENCOUNTER NOTE\n` +
                    `==========================================\n` +
                    `Date: ${note.encounterDate} (${note.startTime} - ${note.endTime})\n` +
                    `Duration: ${note.durationMinutes} min (${note.billingUnits} units of H0038)\n` +
                    `Place of Service: POS ${note.placeOfServiceCode} - ${note.locationDetails}\n` +
                    `Specialist: ${note.authorName} (${note.authorCredentials})\n` +
                    `Focus Domains: ${note.focusDomains.join(', ')}\n\n` +
                    `PART 1 - CALAIM GOAL ADDRESSED:\n${note.goalAddressed}\n\n` +
                    `PART 2 - PEER SPECIALIST INTERVENTION:\n${note.peerIntervention}\n\n` +
                    `PART 3 - CLIENT OBSERVABLE RESPONSE:\n${note.clientResponse}\n\n` +
                    `PART 4 - COLLABORATIVE PLAN & NEXT STEPS:\n${note.planNextSteps}\n\n` +
                    (note.safetyConcerns ? `SAFETY RISK NOTATION:\n${note.safetyNotes}\n\n` : '') +
                    `ELECTRONIC SIGNATURE:\n${note.specialistSignature} (Signed: ${note.signedAt || note.createdAt})`
                  )
                )
              )
            }
          }
        ]
      }
    };

    return {
      resourceType: 'Bundle',
      id: `bundle-calaim-${note.id}`,
      type: 'collection',
      timestamp: new Date().toISOString(),
      entry: [fhirPatient, fhirPractitioner, fhirEncounter, fhirDocument]
    };
  }

  /**
   * Generate an HL7 v2.5.1 clinical documentation message (ORU^R01 / MDM^T02)
   */
  public static generateHl7V2Message(note: SessionNote, client?: Client | null, org?: Organization | null): string {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const msgControlId = `PN${Date.now().toString().slice(-8)}`;
    const orgId = org?.id || note.organizationId || 'PEER_NOTEBOOK_CBO';
    const orgName = (org?.name || 'Peer Support Services').replace(/\|/g, '');
    const clientCin = (note.mediCalCin || client?.mediCalCin || 'CIN999999').replace(/\|/g, '');
    const clientIdentifier = (note.clientIdentifier || client?.clientIdentifier || 'PN0000').replace(/\|/g, '');
    const clientName = (note.clientName || 'Client^Participant').replace(/\|/g, '');
    const authorName = (note.authorName || 'Rivera^Alex').replace(/\|/g, '');
    const encounterDateStr = (note.encounterDate || '').replace(/-/g, '');
    const startTimeStr = (note.startTime || '10:00').replace(':', '') + '00';
    const endTimeStr = (note.endTime || '10:45').replace(':', '') + '00';

    const clean = (text: string) => text.replace(/[\r\n]+/g, ' ').replace(/\|/g, '/');

    const lines = [
      `MSH|^~\\&|PEER_NOTEBOOK|${orgId}|EHR_RECIPIENT|COUNTY_BH|${timestamp}||ORU^R01^ORU_R01|${msgControlId}|P|2.5.1|||AL|NE||ASCII|||`,
      `PID|1||${clientCin}^^^CA_DHCS~${clientIdentifier}^^^PEER_NOTEBOOK||${clientName}|||||||||||||||||||||||||`,
      `PV1|1|O|POS${note.placeOfServiceCode}^COMMUNITY_OUTREACH^PEER_NOTEBOOK||||${note.authorId}^${authorName}|||BH||||||||${note.id}|MEDICAID|||||||||||||||||||||||||${encounterDateStr}${startTimeStr}|${encounterDateStr}${endTimeStr}|`,
      `OBR|1|${note.id}|${msgControlId}|H0038^CalAIM Peer Support Encounter^HCPCS|||${encounterDateStr}${startTimeStr}|${encounterDateStr}${endTimeStr}||||||||${note.authorId}^${authorName}||||||${timestamp}|||F||||||||||`,
      `OBX|1|TX|H0038-GOAL^Goal Addressed (Part 1)^LN||${clean(note.goalAddressed)}||||||F`,
      `OBX|2|TX|H0038-INT^Peer Specialist Intervention (Part 2)^LN||${clean(note.peerIntervention)}||||||F`,
      `OBX|3|TX|H0038-RESP^Client Observable Response (Part 3)^LN||${clean(note.clientResponse)}||||||F`,
      `OBX|4|TX|H0038-PLAN^Collaborative Plan and Next Steps (Part 4)^LN||${clean(note.planNextSteps)}||||||F`,
      `OBX|5|NM|H0038-UNITS^Medi-Cal Billing Units^LN||${note.billingUnits}|{units}^Units^UCUM|||||F`,
      `OBX|6|NM|H0038-DUR^Total Encounter Duration Minutes^LN||${note.durationMinutes}|min^Minutes^UCUM|||||F`,
      `OBX|7|ST|H0038-POS^Place of Service Code^LN||${note.placeOfServiceCode}||||||F`,
      `OBX|8|TX|H0038-SIG^Specialist Electronic Signature^LN||${clean(note.specialistSignature || note.authorName)} (Signed: ${note.signedAt || note.createdAt})||||||F`
    ];

    if (note.safetyConcerns && note.safetyNotes) {
      lines.push(`OBX|9|TX|H0038-SAFETY^Crisis and Safety Alert^LN||${clean(note.safetyNotes)}||||||F`);
    }

    return lines.join('\r\n');
  }

  /**
   * Generate a Consolidated CDA (C-CDA R2.1) Progress Note XML document
   */
  public static generateCcdaXml(note: SessionNote, client?: Client | null, org?: Organization | null): string {
    const orgId = org?.id || note.organizationId || 'org-calaim-01';
    const orgName = org?.name || 'Peer Support Community-Based Organization';
    const orgNpi = org?.npi || '1992834012';
    const clientCin = note.mediCalCin || client?.mediCalCin || 'CIN99999999';
    const clientRefId = note.clientIdentifier || client?.clientIdentifier || 'PN-0000';
    const encounterDate = note.encounterDate || new Date().toISOString().slice(0, 10);
    const dateFormatted = encounterDate.replace(/-/g, '');
    const nowIso = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);

    const escapeXml = (unsafe: string) => {
      return (unsafe || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    return `<?xml version="1.0" encoding="UTF-8"?>
<ClinicalDocument xmlns="urn:hl7-org:v3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="urn:hl7-org:v3 CDA.xsd">
  <realmCode code="US"/>
  <typeId root="2.16.840.1.113883.1.3" extension="POCD_HD000040"/>
  <!-- US Realm Progress Note Template ID -->
  <templateId root="2.16.840.1.113883.10.20.22.1.9" extension="2015-08-01"/>
  <id root="2.16.840.1.113883.19" extension="${escapeXml(note.id)}"/>
  <code code="11488-4" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" displayName="Consultation Note"/>
  <title>Peer Notebook - CalAIM Medi-Cal H0038 Peer Progress Note</title>
  <effectiveTime value="${nowIso}"/>
  <confidentialityCode code="N" codeSystem="2.16.840.1.113883.5.25" displayName="Normal"/>
  <languageCode code="en-US"/>

  <recordTarget>
    <patientRole>
      <id root="2.16.840.1.113883.4.3" extension="${escapeXml(clientCin)}"/>
      <id root="urn:oid:peernotebook:${escapeXml(orgId)}:clients" extension="${escapeXml(clientRefId)}"/>
      <patient>
        <name>
          <given>${escapeXml(note.clientName)}</given>
        </name>
        <administrativeGenderCode code="UN" codeSystem="2.16.840.1.113883.5.1" displayName="Undifferentiated"/>
      </patient>
      <providerOrganization>
        <id root="2.16.840.1.113883.4.6" extension="${escapeXml(orgNpi)}"/>
        <name>${escapeXml(orgName)}</name>
      </providerOrganization>
    </patientRole>
  </recordTarget>

  <author>
    <time value="${dateFormatted}"/>
    <assignedAuthor>
      <id root="2.16.840.1.113883.4.6" extension="${escapeXml(orgNpi)}"/>
      <assignedPerson>
        <name>
          <given>${escapeXml(note.authorName)}</given>
          <suffix>${escapeXml(note.authorCredentials || 'CPSS-CA')}</suffix>
        </name>
      </assignedPerson>
      <representedOrganization>
        <name>${escapeXml(orgName)}</name>
      </representedOrganization>
    </assignedAuthor>
  </author>

  <custodian>
    <assignedCustodian>
      <representedCustodianOrganization>
        <id root="2.16.840.1.113883.4.6" extension="${escapeXml(orgNpi)}"/>
        <name>${escapeXml(orgName)}</name>
      </representedCustodianOrganization>
    </assignedCustodian>
  </custodian>

  <component>
    <structuredBody>
      <!-- Section 1: CalAIM Recovery Goals (LOINC 29299-5) -->
      <component>
        <section>
          <templateId root="2.16.840.1.113883.10.20.22.2.10"/>
          <code code="29299-5" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" displayName="Reason for Visit / Care Plan Goals"/>
          <title>CalAIM Recovery Goal Addressed (Part 1 of 4)</title>
          <text>
            <paragraph>${escapeXml(note.goalAddressed)}</paragraph>
            <list>
              <item>Focus Domains: ${escapeXml(note.focusDomains.join(', '))}</item>
              <item>Place of Service: POS ${escapeXml(note.placeOfServiceCode)} (${escapeXml(note.locationDetails)})</item>
            </list>
          </text>
        </section>
      </component>

      <!-- Section 2: Peer Specialist Intervention (LOINC 29554-3) -->
      <component>
        <section>
          <code code="29554-3" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" displayName="Procedure / Intervention Narrative"/>
          <title>Peer Support Specialist Intervention (Part 2 of 4)</title>
          <text>
            <paragraph>${escapeXml(note.peerIntervention)}</paragraph>
            <paragraph>Service Code: HCPCS H0038 (${note.billingUnits} units · ${note.durationMinutes} billable minutes: ${note.faceToFaceMinutes}m face-to-face, ${note.travelMinutes}m travel, ${note.documentationMinutes}m documentation)</paragraph>
          </text>
        </section>
      </component>

      <!-- Section 3: Client Observable Response (LOINC 51848-0) -->
      <component>
        <section>
          <code code="51848-0" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" displayName="Evaluation &amp; Response"/>
          <title>Participant Observable Response (Part 3 of 4)</title>
          <text>
            <paragraph>${escapeXml(note.clientResponse)}</paragraph>
            ${note.safetyConcerns ? `<paragraph styleCode="Bold">Safety &amp; Crisis Notation: ${escapeXml(note.safetyNotes || 'Safety evaluated.')}</paragraph>` : ''}
          </text>
        </section>
      </component>

      <!-- Section 4: Collaborative Plan of Care (LOINC 18776-5) -->
      <component>
        <section>
          <code code="18776-5" codeSystem="2.16.840.1.113883.6.1" codeSystemName="LOINC" displayName="Plan of Care"/>
          <title>Collaborative Action Plan &amp; Next Steps (Part 4 of 4)</title>
          <text>
            <paragraph>${escapeXml(note.planNextSteps)}</paragraph>
            <paragraph>Electronic Attestation Signature: ${escapeXml(note.specialistSignature || note.authorName)} (Attested: ${escapeXml(note.signedAt || note.createdAt)})</paragraph>
          </text>
        </section>
      </component>
    </structuredBody>
  </component>
</ClinicalDocument>`.trim();
  }

  /**
   * Browser file download helper
   */
  public static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  public static exportNoteAsFhir(note: SessionNote, client?: Client | null, org?: Organization | null): void {
    const fhir = this.generateFhirR4Bundle(note, client, org);
    const jsonStr = JSON.stringify(fhir, null, 2);
    const date = note.encounterDate || 'encounter';
    this.downloadFile(jsonStr, `fhir_r4_bundle_${note.id}_${date}.json`, 'application/fhir+json;charset=utf-8');
  }

  public static exportNoteAsHl7(note: SessionNote, client?: Client | null, org?: Organization | null): void {
    const hl7 = this.generateHl7V2Message(note, client, org);
    const date = note.encounterDate || 'encounter';
    this.downloadFile(hl7, `hl7_v2_message_${note.id}_${date}.hl7`, 'text/plain;charset=utf-8');
  }

  public static exportNoteAsCcda(note: SessionNote, client?: Client | null, org?: Organization | null): void {
    const ccda = this.generateCcdaXml(note, client, org);
    const date = note.encounterDate || 'encounter';
    this.downloadFile(ccda, `ccda_progress_note_${note.id}_${date}.xml`, 'application/xml;charset=utf-8');
  }
}

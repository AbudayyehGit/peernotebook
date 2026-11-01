/**
 * PEER NOTEBOOK - BI-DIRECTIONAL HL7 FHIR R4 CLIENT
 * CalAIM Medi-Cal H0038 Compliant EHR Interoperability Gateway
 * Author: H. Joe Abudayyeh <joe@peernotebook.com>
 * Copyright (c) 2024-2026 Peer Notebook LLC. All rights reserved.
 */

export interface FhirEncounterPayload {
  encounterId: string;
  syntheticPatientId: string;
  specialistNpi: string;
  specialistName: string;
  organizationId: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  durationMinutes: number;
  h0038Units: number;
  serviceLocationCode: '15' | '02' | '11'; // 15=Mobile Unit, 02=Telehealth, 11=Office
  carePlanGoalId?: string;
  peerInterventions: string[];
  clientResponse: string;
}

export interface FhirResourceHeader {
  resourceType: string;
  id?: string;
  meta?: {
    profile?: string[];
    lastUpdated?: string;
  };
}

export interface FhirOperationOutcome {
  resourceType: 'OperationOutcome';
  issue: Array<{
    severity: 'fatal' | 'error' | 'warning' | 'information';
    code: string;
    diagnostics?: string;
  }>;
}

export class FhirR4Client {
  private baseUrl: string;
  private bearerToken: string;

  constructor(baseUrl: string = 'https://fhir.peernotebook.com/r4', bearerToken: string = '') {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.bearerToken = bearerToken;
  }

  /**
   * Transforms a CalAIM peer field encounter into a compliant HL7 FHIR R4 Encounter resource
   */
  public buildEncounterResource(payload: FhirEncounterPayload): Record<string, unknown> {
    return {
      resourceType: 'Encounter',
      id: payload.encounterId,
      status: 'finished',
      class: {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: payload.serviceLocationCode === '02' ? 'VR' : 'AMB',
        display: payload.serviceLocationCode === '02' ? 'virtual' : 'ambulatory',
      },
      type: [
        {
          coding: [
            {
              system: 'https://www.cms.gov/medicare/coding/hcpcsreleasecodesets',
              code: 'H0038',
              display: 'Self-help/peer services, per 15 minutes',
            },
          ],
          text: `CalAIM Peer Support Encounter (${payload.h0038Units} units / ${payload.durationMinutes} mins)`,
        },
      ],
      subject: {
        reference: `Patient/${payload.syntheticPatientId}`,
        display: `Synthetic Client ${payload.syntheticPatientId.slice(0, 8)}`,
      },
      participant: [
        {
          type: [
            {
              coding: [
                {
                  system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType',
                  code: 'PPRF',
                  display: 'primary performer',
                },
              ],
            },
          ],
          individual: {
            identifier: {
              system: 'http://hl7.org/fhir/sid/us-npi',
              value: payload.specialistNpi,
            },
            display: payload.specialistName,
          },
        },
      ],
      period: {
        start: payload.startTime,
        end: payload.endTime,
      },
      serviceProvider: {
        reference: `Organization/${payload.organizationId}`,
      },
    };
  }

  /**
   * Transforms peer interventions and client response into a FHIR R4 Observation resource
   */
  public buildObservationResource(payload: FhirEncounterPayload): Record<string, unknown> {
    return {
      resourceType: 'Observation',
      id: `obs-${payload.encounterId}`,
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'social-history',
              display: 'Social History',
            },
          ],
        },
      ],
      code: {
        coding: [
          {
            system: 'https://peernotebook.com/fhir/codes',
            code: 'calaim-peer-progress',
            display: 'CalAIM Strengths-Based Peer Support Progress',
          },
        ],
        text: 'Peer Support Interventions & Individual Response',
      },
      subject: {
        reference: `Patient/${payload.syntheticPatientId}`,
      },
      encounter: {
        reference: `Encounter/${payload.encounterId}`,
      },
      effectiveDateTime: payload.endTime,
      note: [
        {
          text: `Interventions: ${payload.peerInterventions.join('; ')}`,
        },
        {
          text: `Individual Response & Next Steps: ${payload.clientResponse}`,
        },
      ],
      extension: payload.carePlanGoalId
        ? [
            {
              url: 'https://peernotebook.com/fhir/StructureDefinition/careplan-goal-ref',
              valueReference: {
                reference: `Goal/${payload.carePlanGoalId}`,
              },
            },
          ]
        : [],
    };
  }

  /**
   * Dispatches a single resource to the EHR FHIR R4 REST endpoint
   */
  public async writeBackResource(
    resourceType: 'Encounter' | 'Observation' | 'DocumentReference',
    resourceData: Record<string, unknown>
  ): Promise<{ success: boolean; status: number; resource?: Record<string, unknown>; error?: string }> {
    const id = resourceData.id as string | undefined;
    const url = id ? `${this.baseUrl}/${resourceType}/${id}` : `${this.baseUrl}/${resourceType}`;
    const method = id ? 'PUT' : 'POST';

    const headers: Record<string, string> = {
      'Content-Type': 'application/fhir+json',
      Accept: 'application/fhir+json',
    };

    if (this.bearerToken) {
      headers.Authorization = `Bearer ${this.bearerToken}`;
    }

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(resourceData),
      });

      if (!res.ok) {
        let errText = await res.text();
        try {
          const outcome = JSON.parse(errText) as FhirOperationOutcome;
          if (outcome.issue?.[0]?.diagnostics) {
            errText = outcome.issue[0].diagnostics;
          }
        } catch {
          // preserve raw errText
        }
        return { success: false, status: res.status, error: errText };
      }

      const json = await res.json();
      return { success: true, status: res.status, resource: json };
    } catch (err: unknown) {
      return {
        success: false,
        status: 0,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  }

  /**
   * Queries active CarePlan goals for an individual from EHR
   */
  public async queryActiveGoals(
    syntheticPatientId: string
  ): Promise<{ goalId: string; description: string }[]> {
    const url = `${this.baseUrl}/Goal?patient=${encodeURIComponent(syntheticPatientId)}&lifecycle-status=active`;
    const headers: Record<string, string> = {
      Accept: 'application/fhir+json',
    };
    if (this.bearerToken) {
      headers.Authorization = `Bearer ${this.bearerToken}`;
    }

    try {
      const res = await fetch(url, { headers });
      if (!res.ok) return [];
      const bundle = await res.json();
      if (!bundle.entry || !Array.isArray(bundle.entry)) return [];

      return bundle.entry.map((e: { resource: { id: string; description?: { text?: string } } }) => ({
        goalId: e.resource.id,
        description: e.resource.description?.text || 'Care plan objective',
      }));
    } catch {
      return [];
    }
  }
}

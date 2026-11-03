import './ehrIntegrationCompatibility';

export interface FhirEncounterPayload {
  encounterId: string;
  syntheticPatientId: string;
  specialistNpi: string;
  specialistName: string;
  organizationId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  h0038Units: number;
  serviceLocationCode: '15' | '02' | '11';
  carePlanGoalId?: string;
  peerInterventions: string[];
  clientResponse: string;
}

export interface FhirResourceHeader {
  resourceType: string;
  id?: string;
  meta?: { profile?: string[]; lastUpdated?: string };
}

export interface FhirOperationOutcome {
  resourceType: 'OperationOutcome';
  issue: Array<{ severity: 'fatal' | 'error' | 'warning' | 'information'; code: string; diagnostics?: string }>;
}

export class FhirR4Client {
  private baseUrl: string;
  private bearerToken: string;

  constructor(baseUrl = 'https://fhir.peernotebook.com/r4', bearerToken = '') {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.bearerToken = bearerToken;
  }

  private getHeaders(contentType?: string): Record<string, string> {
    const headers: Record<string, string> = { Accept: 'application/fhir+json' };
    if (contentType) headers['Content-Type'] = contentType;
    if (this.bearerToken) headers.Authorization = `Bearer ${this.bearerToken}`;
    return headers;
  }

  public buildEncounterResource(payload: FhirEncounterPayload): Record<string, unknown> {
    return {
      resourceType: 'Encounter', id: payload.encounterId, status: 'finished',
      class: { system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode', code: payload.serviceLocationCode === '02' ? 'VR' : 'AMB', display: payload.serviceLocationCode === '02' ? 'virtual' : 'ambulatory' },
      type: [{ coding: [{ system: 'https://www.cms.gov/medicare/coding/hcpcsreleasecodesets', code: 'H0038', display: 'Self-help/peer services, per 15 minutes' }], text: `CalAIM Peer Support Encounter (${payload.h0038Units} units / ${payload.durationMinutes} mins)` }],
      subject: { reference: `Patient/${payload.syntheticPatientId}`, display: `Synthetic Client ${payload.syntheticPatientId.slice(0, 8)}` },
      participant: [{ type: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/v3-ParticipationType', code: 'PPRF', display: 'primary performer' }] }], individual: { identifier: { system: 'http://hl7.org/fhir/sid/us-npi', value: payload.specialistNpi }, display: payload.specialistName } }],
      period: { start: payload.startTime, end: payload.endTime }, serviceProvider: { reference: `Organization/${payload.organizationId}` }
    };
  }

  public buildObservationResource(payload: FhirEncounterPayload): Record<string, unknown> {
    return {
      resourceType: 'Observation', id: `obs-${payload.encounterId}`, status: 'final',
      category: [{ coding: [{ system: 'http://terminology.hl7.org/CodeSystem/observation-category', code: 'social-history', display: 'Social History' }] }],
      code: { coding: [{ system: 'https://peernotebook.com/fhir/codes', code: 'calaim-peer-progress', display: 'CalAIM Strengths-Based Peer Support Progress' }], text: 'Peer Support Interventions & Individual Response' },
      subject: { reference: `Patient/${payload.syntheticPatientId}` }, encounter: { reference: `Encounter/${payload.encounterId}` }, effectiveDateTime: payload.endTime,
      note: [{ text: `Interventions: ${payload.peerInterventions.join('; ')}` }, { text: `Individual Response & Next Steps: ${payload.clientResponse}` }],
      extension: payload.carePlanGoalId ? [{ url: 'https://peernotebook.com/fhir/StructureDefinition/careplan-goal-ref', valueReference: { reference: `Goal/${payload.carePlanGoalId}` } }] : []
    };
  }

  public async testConnection(): Promise<{ connected: boolean; systemName?: string; error?: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/metadata`, { headers: this.getHeaders() });
      if (!response.ok) return { connected: false, error: `FHIR metadata request failed with HTTP ${response.status}` };
      const capability = await response.json() as { software?: { name?: string }; implementation?: { description?: string } };
      return { connected: true, systemName: capability.software?.name || capability.implementation?.description };
    } catch (error: unknown) {
      return { connected: false, error: error instanceof Error ? error.message : String(error) };
    }
  }

  public async writeBackResource(resourceType: 'Encounter' | 'Observation' | 'DocumentReference', resourceData: Record<string, unknown>): Promise<{ success: boolean; status: number; resource?: Record<string, unknown>; error?: string }> {
    const id = typeof resourceData.id === 'string' ? resourceData.id : undefined;
    const url = id ? `${this.baseUrl}/${resourceType}/${encodeURIComponent(id)}` : `${this.baseUrl}/${resourceType}`;
    try {
      const response = await fetch(url, { method: id ? 'PUT' : 'POST', headers: this.getHeaders('application/fhir+json'), body: JSON.stringify(resourceData) });
      if (!response.ok) {
        let errorText = await response.text();
        try { const outcome = JSON.parse(errorText) as FhirOperationOutcome; errorText = outcome.issue?.[0]?.diagnostics || errorText; } catch { /* retain response text */ }
        return { success: false, status: response.status, error: errorText || `FHIR request failed with HTTP ${response.status}` };
      }
      const responseText = await response.text();
      let resource: Record<string, unknown> | undefined;
      if (responseText) { try { resource = JSON.parse(responseText) as Record<string, unknown>; } catch { /* successful empty/non-JSON response */ } }
      return { success: true, status: response.status, resource };
    } catch (error: unknown) {
      return { success: false, status: 0, error: error instanceof Error ? error.message : String(error) };
    }
  }

  public async writeBackEncounter(payload: FhirEncounterPayload): Promise<{ success: boolean; encounterId: string; error?: string }> {
    const encounter = await this.writeBackResource('Encounter', this.buildEncounterResource(payload));
    if (!encounter.success) return { success: false, encounterId: payload.encounterId, error: encounter.error };
    const observation = await this.writeBackResource('Observation', this.buildObservationResource(payload));
    if (!observation.success) return { success: false, encounterId: payload.encounterId, error: `Encounter was accepted, but Observation write-back failed: ${observation.error || 'unknown error'}` };
    return { success: true, encounterId: payload.encounterId };
  }

  public async queryActiveGoals(syntheticPatientId: string): Promise<{ goalId: string; description: string }[]> {
    try {
      const response = await fetch(`${this.baseUrl}/Goal?patient=${encodeURIComponent(syntheticPatientId)}&lifecycle-status=active`, { headers: this.getHeaders() });
      if (!response.ok) return [];
      const bundle = await response.json() as { entry?: Array<{ resource?: { id?: string; description?: { text?: string } } }> };
      return (bundle.entry || []).flatMap((entry) => entry.resource?.id ? [{ goalId: entry.resource.id, description: entry.resource.description?.text || 'Care plan objective' }] : []);
    } catch { return []; }
  }
}

export function buildEncounterResource(payload: any): Record<string, unknown> {
  const client = new FhirR4Client();
  const durationMinutes = payload.durationMinutes || (payload.units ? payload.units * 15 : 15);
  return client.buildEncounterResource({
    encounterId: payload.encounterId || payload.id || 'enc_default', syntheticPatientId: payload.syntheticPatientId || payload.patientSyntheticId || 'pat_synth_00',
    specialistNpi: payload.specialistNpi || '1999888777', specialistName: payload.specialistName || 'Certified Peer Specialist', organizationId: payload.organizationId || payload.organizationNpi || 'org_01',
    startTime: payload.startTime || payload.date || new Date().toISOString(), endTime: payload.endTime || new Date(Date.now() + durationMinutes * 60000).toISOString(), durationMinutes,
    h0038Units: payload.h0038Units || payload.units || 1, serviceLocationCode: payload.serviceLocationCode || (String(payload.serviceLocation || '').includes('15') ? '15' : '11'),
    carePlanGoalId: payload.carePlanGoalId || payload.goalAddressed, peerInterventions: payload.peerInterventions || [payload.goalAddressed || 'CalAIM Peer Support Interaction'], clientResponse: payload.clientResponse || 'Client engaged and reviewed goal progress.'
  });
}

export function buildObservationResource(payload: any): Record<string, unknown> {
  const client = new FhirR4Client();
  return client.buildObservationResource({
    encounterId: payload.encounterId || payload.id || 'enc_default', syntheticPatientId: payload.syntheticPatientId || payload.patientSyntheticId || 'pat_synth_00',
    specialistNpi: payload.specialistNpi || '1999888777', specialistName: payload.specialistName || 'Certified Peer Specialist', organizationId: payload.organizationId || payload.organizationNpi || 'org_01',
    startTime: payload.startTime || payload.date || new Date().toISOString(), endTime: payload.endTime || new Date().toISOString(), durationMinutes: payload.durationMinutes || 15,
    h0038Units: payload.h0038Units || 1, serviceLocationCode: payload.serviceLocationCode || '15', carePlanGoalId: payload.carePlanGoalId || payload.goalAddressed,
    peerInterventions: payload.peerInterventions || ['CalAIM Peer Support Interaction'], clientResponse: payload.clientResponse || 'Client engaged.'
  });
}

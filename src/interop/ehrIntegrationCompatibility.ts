import { EhrIntegrationService } from '../services/ehrIntegrationService';
import type { Client, Organization, SessionNote } from '../db/peerNotebookDatabase';

export function generateHl7V2Mdm(note: SessionNote, client?: Client | null, org?: Organization | null): string {
  return EhrIntegrationService.generateHl7V2Message(note, client, org);
}

declare module '../services/ehrIntegrationService' {
  namespace EhrIntegrationService {
    function generateHl7V2Mdm(note: SessionNote, client?: Client | null, org?: Organization | null): string;
  }
}

Object.assign(EhrIntegrationService, { generateHl7V2Mdm });

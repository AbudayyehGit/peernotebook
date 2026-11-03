import { SessionNote, Client, Organization } from '../db/peerNotebookDatabase';

export interface EdiBillingProvider {
  organizationName: string;
  npi: string;
  taxId: string;
  addressLine: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface EdiPayerInfo {
  payerName: string;
  payerId: string;
}

export interface Edi837BatchInput {
  billingProvider: EdiBillingProvider;
  payer: EdiPayerInfo;
  notes: SessionNote[];
  clientMap: Record<string, Client>;
  interchangeControlNumber?: string;
  groupControlNumber?: string;
}

export interface Edi837ClaimInput {
  note: SessionNote;
  client?: Client;
  organization?: Organization;
  specialistName: string;
  specialistNpi: string;
}

export class Edi837PGenerator {
  private static readonly ELEMENT_SEP = '*';
  private static readonly SEGMENT_TERM = '~';

  private static formatDate(date: Date, includeCentury = false): string {
    const yyyy = date.getFullYear().toString();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return includeCentury ? `${yyyy}${mm}${dd}` : `${yyyy.slice(2)}${mm}${dd}`;
  }

  private static formatTime(date: Date): string {
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    return `${hh}${mm}`;
  }

  /**
   * Generates one claim using the batch serializer. Verify provider, payer,
   * diagnosis, and contracted reimbursement details before submitting claims.
   */
  public static generate837PClaim(input: Edi837ClaimInput): string {
    const { note, client, organization, specialistNpi } = input;
    return this.generate837PBatch({
      billingProvider: {
        organizationName: organization?.name || 'Peer Support Services CBO',
        npi: organization?.npi || specialistNpi || '1992834012',
        taxId: '94-3829104',
        addressLine: '100 California Street, Suite 400',
        city: 'San Francisco',
        state: 'CA',
        zipCode: '94111'
      },
      payer: {
        payerName: 'California Department of Health Care Services (DHCS) / Medi-Cal',
        payerId: 'CA-DHS-MEDICAL'
      },
      notes: [note],
      clientMap: client ? { [client.id]: client } : {}
    });
  }

  public static generate837PBatch(input: Edi837BatchInput): string {
    const {
      billingProvider,
      payer,
      notes,
      clientMap,
      interchangeControlNumber = '000000001',
      groupControlNumber = '1'
    } = input;
    const now = new Date();
    const isaDate = this.formatDate(now);
    const ccyymmdd = this.formatDate(now, true);
    const hhmm = this.formatTime(now);
    const segments: string[] = [];

    segments.push(['ISA', '00', '          ', '00', '          ', 'ZZ', billingProvider.npi.padEnd(15, ' '), 'ZZ', payer.payerId.padEnd(15, ' '), isaDate, hhmm, '^', '00501', interchangeControlNumber.padStart(9, '0'), '0', 'P', ':'].join(this.ELEMENT_SEP));
    segments.push(['GS', 'HC', billingProvider.npi, payer.payerId, ccyymmdd, hhmm, groupControlNumber, 'X', '005010X222A1'].join(this.ELEMENT_SEP));
    segments.push(['ST', '837', '0001', '005010X222A1'].join(this.ELEMENT_SEP));
    segments.push(['BHT', '0019', '00', `BATCH${ccyymmdd}`, ccyymmdd, hhmm, 'CH'].join(this.ELEMENT_SEP));
    segments.push(['NM1', '41', '2', billingProvider.organizationName, '', '', '', '', '46', billingProvider.npi].join(this.ELEMENT_SEP));
    segments.push(['PER', 'IC', 'EDI SUBMITTER', 'TE', '8005550199', 'EM', 'edi@peernotebook.com'].join(this.ELEMENT_SEP));
    segments.push(['NM1', '40', '2', payer.payerName, '', '', '', '', '46', payer.payerId].join(this.ELEMENT_SEP));
    segments.push(['HL', '1', '', '20', '1'].join(this.ELEMENT_SEP));
    segments.push(['PRV', 'BI', 'PXC', '175T00000X'].join(this.ELEMENT_SEP));
    segments.push(['NM1', '85', '2', billingProvider.organizationName, '', '', '', '', 'XX', billingProvider.npi].join(this.ELEMENT_SEP));
    segments.push(['N3', billingProvider.addressLine].join(this.ELEMENT_SEP));
    segments.push(['N4', billingProvider.city, billingProvider.state, billingProvider.zipCode].join(this.ELEMENT_SEP));
    segments.push(['REF', 'EI', billingProvider.taxId.replace(/\D/g, '')].join(this.ELEMENT_SEP));

    let hlIndex = 2;
    for (const note of notes) {
      const client = clientMap[note.clientId];
      const clientMedicaidId = client?.mediCalCin || note.mediCalCin || note.clientIdentifier || '999999999';
      const clientDob = client?.dateOfBirth ? client.dateOfBirth.replace(/-/g, '') : '19850101';
      const gender = client?.gender?.toLowerCase() === 'female' ? 'F' : 'M';
      const nameParts = (client?.preferredName || note.clientName || 'CLIENT').trim().split(/\s+/);
      const lastName = nameParts.length > 1 ? nameParts.pop()! : 'CLIENT';
      const firstName = nameParts.join(' ') || 'PEER';
      segments.push(['HL', hlIndex.toString(), '1', '22', '0'].join(this.ELEMENT_SEP));
      segments.push(['SBR', 'P', '18', '', '', '', '', '', '', 'MC'].join(this.ELEMENT_SEP));
      segments.push(['NM1', 'IL', '1', lastName, firstName, '', '', '', 'MI', clientMedicaidId].join(this.ELEMENT_SEP));
      segments.push(['DMG', 'D8', clientDob, gender].join(this.ELEMENT_SEP));
      segments.push(['NM1', 'PR', '2', payer.payerName, '', '', '', '', 'PI', payer.payerId].join(this.ELEMENT_SEP));
      const encounterDate = note.encounterDate ? note.encounterDate.replace(/-/g, '') : ccyymmdd;
      const units = note.billingUnits || 1;
      const totalCharge = (units * 24.5).toFixed(2);
      segments.push(['CLM', note.id.slice(0, 20), totalCharge, '', '', `${note.placeOfServiceCode || '15'}:B:1`, 'Y', 'A', 'Y', 'Y'].join(this.ELEMENT_SEP));
      segments.push(['HI', 'ABK:F33.1'].join(this.ELEMENT_SEP));
      segments.push(['SV1', 'HC:H0038', totalCharge, 'UN', units.toString(), '', '', '1'].join(this.ELEMENT_SEP));
      segments.push(['DTP', '472', 'D8', encounterDate].join(this.ELEMENT_SEP));
      hlIndex++;
    }

    const stIndex = segments.findIndex((segment) => segment.startsWith('ST*'));
    segments.push(['SE', (segments.length - stIndex + 1).toString(), '0001'].join(this.ELEMENT_SEP));
    segments.push(['GE', '1', groupControlNumber].join(this.ELEMENT_SEP));
    segments.push(['IEA', '1', interchangeControlNumber.padStart(9, '0')].join(this.ELEMENT_SEP));
    return segments.join(`${this.SEGMENT_TERM}\n`) + this.SEGMENT_TERM;
  }
}

export { Edi837PGenerator as Edi837pService };

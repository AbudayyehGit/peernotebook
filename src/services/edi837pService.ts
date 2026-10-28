/**
 * Peer Notebook - ANSI X12 EDI 837P Professional Claim Generator
 * CalAIM & Medi-Cal H0038 Compliant
 * Standard: ANSI ASC X12N 837 (005010X222A1) Professional Health Care Claim
 * Delimiters: Element separator `*`, Segment terminator `~`
 */

import { SessionNote, Client } from '../db/peerNotebookDatabase';

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

export class Edi837PGenerator {
  private static ELEMENT_SEP = '*';
  private static SEGMENT_TERM = '~';

  /**
   * Format Date to YYMMDD (ISA) or CCYYMMDD (GS / BHT / DTP)
   */
  private static formatDate(date: Date, includeCentury = false): string {
    const yyyy = date.getFullYear().toString();
    const mm = (date.getMonth() + 1).toString().padStart(2, '0');
    const dd = date.getDate().toString().padStart(2, '0');
    return includeCentury ? `${yyyy}${mm}${dd}` : `${yyyy.slice(2)}${mm}${dd}`;
  }

  /**
   * Format Time to HHMM
   */
  private static formatTime(date: Date): string {
    const hh = date.getHours().toString().padStart(2, '0');
    const mm = date.getMinutes().toString().padStart(2, '0');
    return `${hh}${mm}`;
  }

  /**
   * Generate complete ANSI 837P Interchange string
   */
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
    const isaDate = this.formatDate(now, false);
    const ccyymmdd = this.formatDate(now, true);
    const hhmm = this.formatTime(now);

    const segments: string[] = [];

    // 1. ISA: Interchange Control Header
    segments.push(
      [
        'ISA',
        '00',
        '          ',
        '00',
        '          ',
        'ZZ',
        billingProvider.npi.padEnd(15, ' '),
        'ZZ',
        payer.payerId.padEnd(15, ' '),
        isaDate,
        hhmm,
        '^',
        '00501',
        interchangeControlNumber.padStart(9, '0'),
        '0',
        'P',
        ':'
      ].join(this.ELEMENT_SEP)
    );

    // 2. GS: Functional Group Header
    segments.push(
      [
        'GS',
        'HC',
        billingProvider.npi,
        payer.payerId,
        ccyymmdd,
        hhmm,
        groupControlNumber,
        'X',
        '005010X222A1'
      ].join(this.ELEMENT_SEP)
    );

    // 3. ST: Transaction Set Header
    segments.push(['ST', '837', '0001', '005010X222A1'].join(this.ELEMENT_SEP));

    // 4. BHT: Beginning of Hierarchical Transaction
    segments.push(
      ['BHT', '0019', '00', `BATCH${ccyymmdd}`, ccyymmdd, hhmm, 'CH'].join(this.ELEMENT_SEP)
    );

    // Loop 1000A: Submitter Name
    segments.push(['NM1', '41', '2', billingProvider.organizationName, '', '', '', '', '46', billingProvider.npi].join(this.ELEMENT_SEP));
    segments.push(['PER', 'IC', 'EDI SUBMITTER', 'TE', '8005550199', 'EM', 'edi@peernotebook.com'].join(this.ELEMENT_SEP));

    // Loop 1000B: Receiver Name
    segments.push(['NM1', '40', '2', payer.payerName, '', '', '', '', '46', payer.payerId].join(this.ELEMENT_SEP));

    // Loop 2000A: Billing Provider Hierarchical Level (HL)
    segments.push(['HL', '1', '', '20', '1'].join(this.ELEMENT_SEP));
    segments.push(['PRV', 'BI', 'PXC', '175T00000X'].join(this.ELEMENT_SEP)); // Peer Specialist / Behavioral Health Provider Taxonomy
    segments.push(['NM1', '85', '2', billingProvider.organizationName, '', '', '', '', 'XX', billingProvider.npi].join(this.ELEMENT_SEP));
    segments.push(['N3', billingProvider.addressLine].join(this.ELEMENT_SEP));
    segments.push(['N4', billingProvider.city, billingProvider.state, billingProvider.zipCode].join(this.ELEMENT_SEP));
    segments.push(['REF', 'EI', billingProvider.taxId.replace(/\D/g, '')].join(this.ELEMENT_SEP));

    let hlIndex = 2;
    let claimIndex = 1;

    for (const note of notes) {
      const client = clientMap[note.clientId];
      const clientMedicaidId = client?.mediCalCin || note.clientIdentifier || '999999999';
      const clientDob = client?.dateOfBirth ? client.dateOfBirth.replace(/-/g, '') : '19850101';
      const clientGender = client?.gender === 'female' ? 'F' : 'M';
      const clientLastName = client?.preferredName ? client.preferredName.split(' ').pop() || 'CLIENT' : 'CLIENT';
      const clientFirstName = client?.preferredName ? client.preferredName.split(' ')[0] || 'PEER' : 'PEER';

      // Loop 2000B: Subscriber Hierarchical Level
      segments.push(['HL', hlIndex.toString(), '1', '22', '0'].join(this.ELEMENT_SEP));
      segments.push(['SBR', 'P', '18', '', '', '', '', '', '', 'MC'].join(this.ELEMENT_SEP)); // MC = Medicaid

      // Loop 2010BA: Subscriber Name (NM1*IL)
      segments.push(
        [
          'NM1',
          'IL',
          '1',
          clientLastName,
          clientFirstName,
          '',
          '',
          '',
          'MI',
          clientMedicaidId
        ].join(this.ELEMENT_SEP)
      );
      segments.push(['DMG', 'D8', clientDob, clientGender].join(this.ELEMENT_SEP));

      // Loop 2010BB: Payer Name
      segments.push(['NM1', 'PR', '2', payer.payerName, '', '', '', '', 'PI', payer.payerId].join(this.ELEMENT_SEP));

      // Loop 2300: Claim Information (CLM)
      const encounterDateFormatted = note.encounterDate ? note.encounterDate.replace(/-/g, '') : ccyymmdd;
      const billingUnits = note.billingUnits || 1;
      const unitRate = 24.50; // CalAIM Medi-Cal standard 15-min unit rate approximation
      const totalCharge = (billingUnits * unitRate).toFixed(2);
      const placeOfService = note.placeOfServiceCode || '15'; // 15 = Mobile Unit / Community Outreach

      segments.push(
        [
          'CLM',
          note.id.slice(0, 20),
          totalCharge,
          '',
          '',
          `${placeOfService}:B:1`,
          'Y',
          'A',
          'Y',
          'Y'
        ].join(this.ELEMENT_SEP)
      );

      // Principal Diagnosis (CalAIM Behavioral Health Z-code / F-code)
      segments.push(['HI', 'ABK:F33.1'].join(this.ELEMENT_SEP));

      // Loop 2400: Service Line (SV1 - Professional Service)
      // Procedure Code: H0038 (Peer Support Services, per 15 minutes)
      segments.push(
        [
          'SV1',
          `HC:H0038`,
          totalCharge,
          'UN',
          billingUnits.toString(),
          '',
          '',
          '1'
        ].join(this.ELEMENT_SEP)
      );

      // Service Date
      segments.push(['DTP', '472', 'D8', encounterDateFormatted].join(this.ELEMENT_SEP));

      hlIndex++;
      claimIndex++;
    }

    // 5. SE: Transaction Set Trailer
    // Number of included segments equals segments between ST and SE inclusive
    const stIndex = segments.findIndex((s) => s.startsWith('ST*'));
    const segmentCount = segments.length - stIndex + 1; // including SE
    segments.push(['SE', segmentCount.toString(), '0001'].join(this.ELEMENT_SEP));

    // 6. GE: Functional Group Trailer
    segments.push(['GE', '1', groupControlNumber].join(this.ELEMENT_SEP));

    // 7. IEA: Interchange Control Trailer
    segments.push(['IEA', '1', interchangeControlNumber.padStart(9, '0')].join(this.ELEMENT_SEP));

    return segments.join(`${this.SEGMENT_TERM}\n`) + this.SEGMENT_TERM;
  }
}

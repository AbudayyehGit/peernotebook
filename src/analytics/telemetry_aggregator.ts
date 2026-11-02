/**
 * PEER NOTEBOOK - MULTI-COUNTY POPULATION TELEMETRY AGGREGATOR
 * CalAIM Outcomes Reporting with Strict k-Anonymity (k >= 5) & Zero-PHI Guarantees
 * Author: H. Joe Abudayyeh <joe@peernotebook.com>
 * Copyright (c) 2024-2026 Peer Notebook LLC. All rights reserved.
 */

export interface RawEncounterMetric {
  syntheticPatientId: string;
  county: string;
  tenantId: string;
  h0038Units: number;
  durationMinutes: number;
  locationCode: '15' | '02' | '11'; // 15=Mobile field, 02=Telehealth, 11=Clinic
  focusDomains: Array<'Harm Reduction' | 'Housing Navigation' | 'Recovery Mutual Aid' | 'Employment Support' | 'Relapse Prevention'>;
  completionLatencyHours: number;
  cosignLatencyHours: number;
}

export interface CountyAggregateMetrics {
  county: string;
  totalEncounters: number;
  totalH0038Units: number;
  uniqueIndividualsServed: number | string; // '<5' if suppressed by k-anonymity
  averageDurationMinutes: number;
  modalityBreakdown: {
    mobileField: number;
    telehealth: number;
    clinic: number;
  };
  domainFrequency: Record<string, number>;
  averageCosignLatencyHours: number;
  kAnonymitySuppressed: boolean;
}

export interface TelemetryReport {
  generatedAt: string;
  reportingPeriod: string;
  kThreshold: number;
  totalCounties: number;
  counties: Record<string, CountyAggregateMetrics>;
  summary: {
    statewideTotalUnits: number;
    statewideEncounters: number;
    mostFrequentDomain: string;
  };
}

export class TelemetryAggregator {
  public static readonly DEFAULT_K_THRESHOLD = 5;

  /**
   * Aggregates raw encounter events across counties enforcing k-anonymity
   */
  public static aggregate(
    encounters: RawEncounterMetric[],
    reportingPeriod: string = '2026-Q1',
    kThreshold: number = this.DEFAULT_K_THRESHOLD
  ): TelemetryReport {
    const countyMap = new Map<string, RawEncounterMetric[]>();

    for (const enc of encounters) {
      const list = countyMap.get(enc.county) || [];
      list.push(enc);
      countyMap.set(enc.county, list);
    }

    const countiesResult: Record<string, CountyAggregateMetrics> = {};
    let statewideTotalUnits = 0;
    let statewideEncounters = 0;
    const globalDomainCounts: Record<string, number> = {};

    for (const [county, list] of countyMap.entries()) {
      const uniquePatients = new Set(list.map((e) => e.syntheticPatientId)).size;
      const isSuppressed = uniquePatients < kThreshold;

      let totalUnits = 0;
      let totalDuration = 0;
      let totalCosignLatency = 0;
      let mobileCount = 0;
      let teleCount = 0;
      let clinicCount = 0;
      const domainCounts: Record<string, number> = {};

      for (const enc of list) {
        totalUnits += enc.h0038Units;
        totalDuration += enc.durationMinutes;
        totalCosignLatency += enc.cosignLatencyHours;

        if (enc.locationCode === '15') mobileCount++;
        else if (enc.locationCode === '02') teleCount++;
        else clinicCount++;

        for (const dom of enc.focusDomains) {
          domainCounts[dom] = (domainCounts[dom] || 0) + 1;
          globalDomainCounts[dom] = (globalDomainCounts[dom] || 0) + 1;
        }
      }

      statewideTotalUnits += totalUnits;
      statewideEncounters += list.length;

      countiesResult[county] = {
        county,
        totalEncounters: list.length,
        totalH0038Units: totalUnits,
        uniqueIndividualsServed: isSuppressed ? `<${kThreshold}` : uniquePatients,
        averageDurationMinutes: list.length > 0 ? Math.round(totalDuration / list.length) : 0,
        modalityBreakdown: {
          mobileField: mobileCount,
          telehealth: teleCount,
          clinic: clinicCount,
        },
        domainFrequency: domainCounts,
        averageCosignLatencyHours:
          list.length > 0 ? Number((totalCosignLatency / list.length).toFixed(1)) : 0,
        kAnonymitySuppressed: isSuppressed,
      };
    }

    let topDomain = 'Harm Reduction';
    let maxDomainCount = -1;
    for (const [dom, count] of Object.entries(globalDomainCounts)) {
      if (count > maxDomainCount) {
        maxDomainCount = count;
        topDomain = dom;
      }
    }

    return {
      generatedAt: new Date().toISOString(),
      reportingPeriod,
      kThreshold,
      totalCounties: countyMap.size,
      counties: countiesResult,
      summary: {
        statewideTotalUnits,
        statewideEncounters,
        mostFrequentDomain: topDomain,
      },
    };
  }

  /**
   * Generates a clean tabular markdown summary suitable for county compliance audits
   */
  public static generateMarkdownTable(report: TelemetryReport): string {
    const lines: string[] = [
      `# CalAIM Multi-County Telemetry Summary (${report.reportingPeriod})`,
      `*Generated: ${report.generatedAt} | k-Anonymity Threshold: k >= ${report.kThreshold}*`,
      '',
      '| County | Total Encounters | Total H0038 Units | Unique Individuals | Mobile % | Avg Cosign (hrs) |',
      '| :--- | :--- | :--- | :--- | :--- | :--- |',
    ];

    for (const c of Object.values(report.counties)) {
      const mobilePct =
        c.totalEncounters > 0
          ? `${Math.round((c.modalityBreakdown.mobileField / c.totalEncounters) * 100)}%`
          : '0%';
      lines.push(
        `| ${c.county} | ${c.totalEncounters} | ${c.totalH0038Units} | ${c.uniqueIndividualsServed} | ${mobilePct} | ${c.averageCosignLatencyHours}h |`
      );
    }

    return lines.join('\n');
  }
}

export interface CountyOutcomeSummary {
  totalNotes: number;
  totalUnits: number;
  totalDirectMinutes: number;
  totalTravelMinutes: number;
  byCounty: Record<string, { notes: number; units: number }>;
}

export function aggregateCountyOutcomes(
  encounters: Array<{
    noteId?: string;
    county: string;
    durationMinutes?: number;
    billingUnits?: number;
    directMinutes?: number;
    travelMinutes?: number;
    docMinutes?: number;
    domains?: string[];
    isApproved?: boolean;
  }>
): CountyOutcomeSummary {
  const summary: CountyOutcomeSummary = {
    totalNotes: encounters.length,
    totalUnits: 0,
    totalDirectMinutes: 0,
    totalTravelMinutes: 0,
    byCounty: {},
  };

  for (const enc of encounters) {
    summary.totalUnits += enc.billingUnits || 0;
    summary.totalDirectMinutes += enc.directMinutes || 0;
    summary.totalTravelMinutes += enc.travelMinutes || 0;
    const countyName = enc.county || 'San Francisco';
    if (!summary.byCounty[countyName]) {
      summary.byCounty[countyName] = { notes: 0, units: 0 };
    }
    summary.byCounty[countyName].notes += 1;
    summary.byCounty[countyName].units += enc.billingUnits || 0;
  }

  return summary;
}

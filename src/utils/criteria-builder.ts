import type { ProgramConfig, CampaignConfig } from 'src/config/telcos';

import type { CriteriaNode } from 'src/types/lead-criteria';

// ----------------------------------------------------------------------

/**
 * Per-day volume for one batch: the batch total spread evenly over the
 * campaign window, rounded down so the window is never overrun.
 */
export function perDayTotal(batchQuantity: number, numberOfDays: number): number {
  if (!Number.isFinite(batchQuantity) || !Number.isFinite(numberOfDays)) return 0;
  if (batchQuantity <= 0 || numberOfDays <= 0) return 0;

  return Math.floor(batchQuantity / numberOfDays);
}

/**
 * A campaign's slice of a batch's daily volume. Thresholds are fractions
 * (1 = 100%); rounded down for the same reason as above.
 */
export function campaignTotal(batchPerDay: number, threshold: number): number {
  if (!Number.isFinite(threshold) || threshold <= 0) return 0;

  return Math.floor(batchPerDay * threshold);
}

// ----------------------------------------------------------------------

/** `vib_cc_rand_v2.3` → `vib_cc_rand`. Version suffixes look like `_v2`, `_v2.3`, `_v2.3.1`. */
const VERSION_SUFFIX = /_v\d+(?:\.\d+)*$/;

export function stripVersion(batchName: string): string {
  return batchName.replace(VERSION_SUFFIX, '');
}

/**
 * The batch id used inside the query keeps the version and stays lowercase:
 * `vib_cc_rand_v2.3` + `20260913` → `vib_cc_rand_v2.3_20260913`.
 */
export function buildBatchId(batchName: string, batchDate: string): string {
  return `${batchName}_${batchDate}`;
}

/**
 * The criteria name drops the version and is upper-cased:
 * `vib_cc_rand_v2.3` + `20260913` → `VIB_CC_RAND_20260913`.
 */
export function buildCriteriaName(batchName: string, batchDate: string): string {
  return `${stripVersion(batchName)}_${batchDate}`.toUpperCase();
}

export function buildQuery(
  batchName: string,
  batchDate: string,
  creditScore: { min: number; max: number }
): string {
  return `batch_id = '${buildBatchId(batchName, batchDate)}' and credit_score between ${creditScore.min} and ${creditScore.max}`;
}

// ----------------------------------------------------------------------

/**
 * The portal rejects a query *containing* any of these — the check is on the
 * raw substring, so `deleted_leads` trips the `delete` rule too. Mirroring
 * that here lets the UI warn before the call instead of surfacing a raw API
 * error, and it is deliberately a warning: if the server's rule turns out to
 * be narrower, a false positive must not block the operator.
 */
const BLACKLISTED_SQL = ['select', 'insert', 'update', 'delete', 'drop', 'truncate', 'alter'];

export function findBlacklistedTerm(query: string): string | undefined {
  const lowered = query.toLowerCase();

  return BLACKLISTED_SQL.find((term) => lowered.includes(term));
}

// ----------------------------------------------------------------------

export type BatchRowInput = {
  batchName: string;
  campaign: CampaignConfig;
  total: number;
};

/**
 * One node per row, mirroring the portal's own shape: each node carries a
 * single campaign so totals can differ per campaign on the same batch.
 */
export function buildNodes(
  rows: BatchRowInput[],
  program: ProgramConfig,
  batchDate: string
): CriteriaNode[] {
  return rows.map((row) => ({
    query: buildQuery(row.batchName, batchDate, program.creditScore),
    crits: [
      {
        id: row.campaign.id,
        total: row.total,
        bank_sms_id: program.bankSmsId,
        expect: null,
      },
    ],
  }));
}

import type { ProgramConfig, CampaignConfig } from 'src/config/telcos';

import {
  buildNodes,
  perDayTotal,
  campaignTotal,
  buildCriteriaName,
  findBlacklistedTerm,
} from 'src/utils/criteria-builder';

import type { CriteriaNode } from 'src/types/lead-criteria';

// ----------------------------------------------------------------------

/** What the operator types on the screen. */
export type CampaignConfigInput = {
  batchDate: string;
  numberOfDays: number;
  /** Batch name → total leads in the batch */
  quantities: Record<string, number>;
  /** Campaign id → share of the daily volume, as a fraction (1 = 100%) */
  thresholds: Record<number, number>;
};

export type PlanRow = {
  batchName: string;
  campaign: CampaignConfig;
  /** num_sms_per_day for this batch × campaign pair */
  total: number;
};

export type BatchPlan = {
  batchName: string;
  /** The criteria this batch's nodes will be written to */
  criteriaName: string;
  /** Daily volume for the whole batch, before thresholds */
  perDay: number;
  rows: PlanRow[];
  nodes: CriteriaNode[];
  /** Set when a query would be rejected by the server's SQL blacklist */
  blacklistedTerm?: string;
};

export type ConfigPlan = {
  batches: BatchPlan[];
  /** Sum of every row — the daily send volume across the program */
  totalPerDay: number;
};

// ----------------------------------------------------------------------

/**
 * Turns the table into one plan per batch. Each batch maps to its own
 * criteria, so `Update Portal` performs one update per batch rather than one
 * for the whole program.
 */
export function buildPlan(program: ProgramConfig, input: CampaignConfigInput): ConfigPlan {
  const batches = program.batches.map((batch) => {
    const perDay = perDayTotal(input.quantities[batch.name] ?? 0, input.numberOfDays);

    const rows: PlanRow[] = program.campaigns.map((campaign) => ({
      batchName: batch.name,
      campaign,
      total: campaignTotal(perDay, input.thresholds[campaign.id] ?? 0),
    }));

    const nodes = buildNodes(rows, program, input.batchDate);

    return {
      batchName: batch.name,
      criteriaName: buildCriteriaName(batch.name, input.batchDate),
      perDay,
      rows,
      nodes,
      blacklistedTerm: nodes.map((node) => findBlacklistedTerm(node.query)).find(Boolean),
    };
  });

  const totalPerDay = batches.reduce(
    (sum, batch) => sum + batch.rows.reduce((rowSum, row) => rowSum + row.total, 0),
    0
  );

  return { batches, totalPerDay };
}

// ----------------------------------------------------------------------

/** Sum of the thresholds, so the UI can warn when they do not add to 100%. */
export function thresholdTotal(thresholds: Record<number, number>): number {
  return Object.values(thresholds).reduce((sum, value) => sum + (value || 0), 0);
}

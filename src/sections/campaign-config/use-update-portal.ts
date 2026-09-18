import type { BatchPlan } from './build-plan';

import { useMutation } from '@tanstack/react-query';

import criteriaApi from 'src/api/criteriaApi';
import { isApiError } from 'src/api/baseApiRequest';

import type { LeadCriteria } from 'src/types/lead-criteria';

// ----------------------------------------------------------------------

export type BatchResult = {
  batchName: string;
  criteriaName: string;
  status: 'updated' | 'not-found' | 'failed';
  message?: string;
};

export type UpdatePortalResult = {
  results: BatchResult[];
  updated: number;
  missing: string[];
};

// ----------------------------------------------------------------------

/**
 * `update` replaces the whole criteria, so each one is read first and only
 * `criteria.nodes` is swapped — priority, avai_days, status and the exclusion
 * rules stay exactly as the portal has them.
 */
function withNewNodes(existing: LeadCriteria, plan: BatchPlan): LeadCriteria {
  return { ...existing, criteria: { ...existing.criteria, nodes: plan.nodes } };
}

function failureMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.isPermissionDenied
      ? 'Permission denied — this account needs the editor role.'
      : error.message;
  }
  return error instanceof Error ? error.message : 'Unknown error.';
}

async function updateBatches(telco: string, plans: BatchPlan[]): Promise<UpdatePortalResult> {
  // One listing for the whole run: `view` has no name filter, and the set of
  // criteria will not change between batches.
  const existing = await criteriaApi.viewAll(telco);
  const byName = new Map(existing.map((criteria) => [criteria.name.toUpperCase(), criteria]));

  const results: BatchResult[] = [];

  for (const plan of plans) {
    const match = byName.get(plan.criteriaName.toUpperCase());

    if (!match) {
      results.push({
        batchName: plan.batchName,
        criteriaName: plan.criteriaName,
        status: 'not-found',
      });
      continue;
    }

    try {
      // Sequential on purpose: the portal syncs each update through to the
      // engine, and a burst of parallel writes is not worth the risk here.
       
      await criteriaApi.update(telco, withNewNodes(match, plan));
      results.push({
        batchName: plan.batchName,
        criteriaName: plan.criteriaName,
        status: 'updated',
      });
    } catch (error) {
      results.push({
        batchName: plan.batchName,
        criteriaName: plan.criteriaName,
        status: 'failed',
        message: failureMessage(error),
      });
    }
  }

  return {
    results,
    updated: results.filter((result) => result.status === 'updated').length,
    missing: results.filter((result) => result.status === 'not-found').map((r) => r.criteriaName),
  };
}

export function useUpdatePortal(telco: string) {
  return useMutation({
    mutationFn: (plans: BatchPlan[]) => updateBatches(telco, plans),
  });
}

export const __testing = { withNewNodes, updateBatches };

import type { BatchPlan } from './build-plan';

import { it, vi, expect, describe, beforeEach } from 'vitest';

import criteriaApi from 'src/api/criteriaApi';
import { ApiError } from 'src/api/baseApiRequest';

import type { LeadCriteria } from 'src/types/lead-criteria';

import { __testing } from './use-update-portal';

// ----------------------------------------------------------------------

const { updateBatches, withNewNodes } = __testing;

function criteria(name: string, overrides: Partial<LeadCriteria> = {}): LeadCriteria {
  return {
    id: `id-${name}`,
    name,
    batch_id: 'old_batch',
    product_type: 1,
    client_code: 'VIB',
    priority: 7,
    excl_condition: { rule7_sent_days: 14, rule8_sent_days: 30 },
    criteria: { nodes: [{ query: 'old query', crits: [] }] },
    avai_days: { days: [1, 2, 3] },
    status: 1,
    in_process: false,
    ...overrides,
  };
}

function plan(batchName: string, criteriaName: string): BatchPlan {
  return {
    batchName,
    criteriaName,
    perDay: 2409,
    rows: [],
    nodes: [
      {
        query: `batch_id = '${batchName}_20260913' and credit_score between 650 and 850`,
        crits: [{ id: 7004, total: 2409, bank_sms_id: '0', expect: null }],
      },
    ],
  };
}

describe('withNewNodes', () => {
  it('swaps only the nodes and leaves the rest of the criteria untouched', () => {
    const existing = criteria('VIB_CC_RAND_20260913');
    const merged = withNewNodes(existing, plan('vib_cc_rand_v2.3', 'VIB_CC_RAND_20260913'));

    expect(merged.criteria.nodes).toHaveLength(1);
    expect(merged.criteria.nodes[0].query).toContain('vib_cc_rand_v2.3_20260913');

    expect(merged.id).toBe(existing.id);
    expect(merged.batch_id).toBe('old_batch');
    expect(merged.priority).toBe(7);
    expect(merged.status).toBe(1);
    expect(merged.avai_days).toEqual({ days: [1, 2, 3] });
    expect(merged.excl_condition).toEqual(existing.excl_condition);
  });
});

describe('updateBatches', () => {
  beforeEach(() => vi.restoreAllMocks());

  it('updates every batch whose criteria exists', async () => {
    vi.spyOn(criteriaApi, 'viewAll').mockResolvedValue([
      criteria('VIB_CC_RAND_20260913'),
      criteria('VIB_CC_TOP25_20260913'),
    ]);
    const update = vi.spyOn(criteriaApi, 'update').mockResolvedValue(null);

    const result = await updateBatches('vinaphone', [
      plan('vib_cc_rand_v2.3', 'VIB_CC_RAND_20260913'),
      plan('vib_cc_top25_v2.3', 'VIB_CC_TOP25_20260913'),
    ]);

    expect(result.updated).toBe(2);
    expect(result.missing).toEqual([]);
    expect(update).toHaveBeenCalledTimes(2);
  });

  it('lists the criteria it could not find instead of failing the run', async () => {
    vi.spyOn(criteriaApi, 'viewAll').mockResolvedValue([criteria('VIB_CC_RAND_20260913')]);
    const update = vi.spyOn(criteriaApi, 'update').mockResolvedValue(null);

    const result = await updateBatches('vinaphone', [
      plan('vib_cc_rand_v2.3', 'VIB_CC_RAND_20260913'),
      plan('vib_cc_top25_v2.3', 'VIB_CC_TOP25_20260913'),
    ]);

    expect(result.updated).toBe(1);
    expect(result.missing).toEqual(['VIB_CC_TOP25_20260913']);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('matches the criteria name case-insensitively', async () => {
    vi.spyOn(criteriaApi, 'viewAll').mockResolvedValue([criteria('vib_cc_rand_20260913')]);
    vi.spyOn(criteriaApi, 'update').mockResolvedValue(null);

    const result = await updateBatches('vinaphone', [
      plan('vib_cc_rand_v2.3', 'VIB_CC_RAND_20260913'),
    ]);

    expect(result.updated).toBe(1);
  });

  it('keeps going after one batch fails and explains a permission error', async () => {
    vi.spyOn(criteriaApi, 'viewAll').mockResolvedValue([
      criteria('VIB_CC_RAND_20260913'),
      criteria('VIB_CC_TOP25_20260913'),
    ]);
    vi.spyOn(criteriaApi, 'update')
      .mockRejectedValueOnce(new ApiError(1, 'permission denied'))
      .mockResolvedValueOnce(null);

    const result = await updateBatches('vinaphone', [
      plan('vib_cc_rand_v2.3', 'VIB_CC_RAND_20260913'),
      plan('vib_cc_top25_v2.3', 'VIB_CC_TOP25_20260913'),
    ]);

    expect(result.updated).toBe(1);
    expect(result.results[0].status).toBe('failed');
    expect(result.results[0].message).toMatch(/editor role/);
  });
});

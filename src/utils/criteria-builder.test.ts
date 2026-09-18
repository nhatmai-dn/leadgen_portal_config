import { it, expect, describe } from 'vitest';

import { PRODUCT_TYPE, type ProgramConfig } from 'src/config/telcos';

import {
  buildNodes,
  buildQuery,
  perDayTotal,
  buildBatchId,
  stripVersion,
  campaignTotal,
  buildCriteriaName,
  findBlacklistedTerm,
} from './criteria-builder';

// ----------------------------------------------------------------------

const program: ProgramConfig = {
  key: 'vib_cc',
  label: 'VIB_CC',
  productType: PRODUCT_TYPE.creditCard,
  creditScore: { min: 650, max: 850 },
  bankSmsId: '0',
  batches: [
    { name: 'vib_cc_rand_v2.3', label: 'rand' },
    { name: 'vib_cc_top25_v2.3', label: 'top25' },
  ],
  campaigns: [
    { id: 7001, label: '7001' },
    { id: 7004, label: '7004' },
    { id: 7006, label: '7006' },
  ],
};

describe('perDayTotal', () => {
  it('matches the worked example from the spreadsheet', () => {
    expect(perDayTotal(12_046, 5)).toBe(2409);
    expect(perDayTotal(93_996, 5)).toBe(18_799);
  });

  it('rounds down so the campaign window is never overrun', () => {
    expect(perDayTotal(10, 3)).toBe(3);
  });

  it('returns 0 rather than Infinity or NaN for unusable input', () => {
    expect(perDayTotal(1000, 0)).toBe(0);
    expect(perDayTotal(0, 5)).toBe(0);
    expect(perDayTotal(-5, 5)).toBe(0);
    expect(perDayTotal(Number.NaN, 5)).toBe(0);
  });
});

describe('campaignTotal', () => {
  it('gives the whole daily volume to a 100% campaign', () => {
    expect(campaignTotal(2409, 1)).toBe(2409);
  });

  it('gives nothing to a 0% campaign', () => {
    expect(campaignTotal(2409, 0)).toBe(0);
  });

  it('rounds a partial threshold down', () => {
    expect(campaignTotal(2409, 0.5)).toBe(1204);
  });
});

describe('name and query derivation', () => {
  it('keeps the version and case in the batch id', () => {
    expect(buildBatchId('vib_cc_rand_v2.3', '20260913')).toBe('vib_cc_rand_v2.3_20260913');
  });

  it('drops the version and upper-cases the criteria name', () => {
    expect(buildCriteriaName('vib_cc_rand_v2.3', '20260913')).toBe('VIB_CC_RAND_20260913');
  });

  it.each([
    ['vib_cc_rand_v2', 'vib_cc_rand'],
    ['vib_cc_rand_v2.3', 'vib_cc_rand'],
    ['vib_cc_rand_v2.3.1', 'vib_cc_rand'],
    ['vib_cc_rand', 'vib_cc_rand'],
  ])('strips %s to %s', (input, expected) => {
    expect(stripVersion(input)).toBe(expected);
  });

  it('does not mistake a mid-name v-number for a version suffix', () => {
    expect(stripVersion('vib_v2_cc_rand_v1.0')).toBe('vib_v2_cc_rand');
  });

  it('builds the query exactly as the portal expects', () => {
    expect(buildQuery('vib_cc_rand_v2.3', '20260913', { min: 650, max: 850 })).toBe(
      "batch_id = 'vib_cc_rand_v2.3_20260913' and credit_score between 650 and 850"
    );
  });
});

describe('findBlacklistedTerm', () => {
  it('passes a normal batch query', () => {
    expect(findBlacklistedTerm(buildQuery('vib_cc_rand_v2.3', '20260913', program.creditScore)))
      .toBeUndefined();
  });

  it('flags a dangerous keyword before the server does', () => {
    expect(findBlacklistedTerm("batch_id = 'x' and select 1")).toBe('select');
  });

  it('flags a keyword embedded in a longer word, as the server does', () => {
    // The portal's check is a substring match, so `deleted_leads` trips it.
    expect(findBlacklistedTerm("batch_id = 'deleted_leads_v1_20260913'")).toBe('delete');
  });
});

describe('buildNodes', () => {
  it('produces the payload from the worked example', () => {
    const nodes = buildNodes(
      [
        { batchName: 'vib_cc_rand_v2.3', campaign: { id: 7001, label: '7001' }, total: 0 },
        { batchName: 'vib_cc_rand_v2.3', campaign: { id: 7004, label: '7004' }, total: 2409 },
        { batchName: 'vib_cc_rand_v2.3', campaign: { id: 7006, label: '7006' }, total: 0 },
      ],
      program,
      '20260913'
    );

    expect(nodes).toEqual([
      {
        query: "batch_id = 'vib_cc_rand_v2.3_20260913' and credit_score between 650 and 850",
        crits: [{ id: 7001, total: 0, bank_sms_id: '0', expect: null }],
      },
      {
        query: "batch_id = 'vib_cc_rand_v2.3_20260913' and credit_score between 650 and 850",
        crits: [{ id: 7004, total: 2409, bank_sms_id: '0', expect: null }],
      },
      {
        query: "batch_id = 'vib_cc_rand_v2.3_20260913' and credit_score between 650 and 850",
        crits: [{ id: 7006, total: 0, bank_sms_id: '0', expect: null }],
      },
    ]);
  });

  it('gives every node exactly one campaign', () => {
    const nodes = buildNodes(
      program.campaigns.map((campaign) => ({
        batchName: 'vib_cc_top25_v2.3',
        campaign,
        total: 1,
      })),
      program,
      '20260913'
    );

    expect(nodes).toHaveLength(3);
    expect(nodes.every((node) => node.crits.length === 1)).toBe(true);
  });
});

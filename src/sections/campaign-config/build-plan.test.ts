import { it, expect, describe } from 'vitest';

import { PRODUCT_TYPE, type ProgramConfig } from 'src/config/telcos';

import { buildPlan, thresholdTotal } from './build-plan';

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

/** The exact scenario from the spreadsheet screenshot. */
const input = {
  batchDate: '20260913',
  numberOfDays: 5,
  quantities: { 'vib_cc_rand_v2.3': 12_046, 'vib_cc_top25_v2.3': 93_996 },
  thresholds: { 7001: 0, 7004: 1, 7006: 0 },
};

describe('buildPlan', () => {
  it('reproduces the spreadsheet numbers', () => {
    const plan = buildPlan(program, input);

    const [rand, top25] = plan.batches;
    expect(rand.perDay).toBe(2409);
    expect(top25.perDay).toBe(18_799);
    expect(rand.rows.map((row) => row.total)).toEqual([0, 2409, 0]);
    expect(top25.rows.map((row) => row.total)).toEqual([0, 18_799, 0]);
    expect(plan.totalPerDay).toBe(21_208);
  });

  it('maps each batch to its own criteria name', () => {
    const plan = buildPlan(program, input);

    expect(plan.batches.map((batch) => batch.criteriaName)).toEqual([
      'VIB_CC_RAND_20260913',
      'VIB_CC_TOP25_20260913',
    ]);
  });

  it('emits the nodes payload for the rand batch', () => {
    const plan = buildPlan(program, input);

    expect(plan.batches[0].nodes).toEqual([
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

  it('splits the daily volume when thresholds are shared', () => {
    const plan = buildPlan(program, {
      ...input,
      thresholds: { 7001: 0.5, 7004: 0.3, 7006: 0.2 },
    });

    // 2409 × 0.5 / 0.3 / 0.2, each rounded down
    expect(plan.batches[0].rows.map((row) => row.total)).toEqual([1204, 722, 481]);
  });

  it('yields zeros rather than NaN when nothing has been entered yet', () => {
    const plan = buildPlan(program, {
      batchDate: '20260913',
      numberOfDays: 0,
      quantities: {},
      thresholds: {},
    });

    expect(plan.totalPerDay).toBe(0);
    expect(plan.batches.every((batch) => batch.rows.every((row) => row.total === 0))).toBe(true);
  });

  it('reports a batch whose query would be rejected by the server', () => {
    const risky: ProgramConfig = {
      ...program,
      batches: [{ name: 'vib_cc_drop_v1', label: 'drop' }],
    };

    expect(buildPlan(risky, input).batches[0].blacklistedTerm).toBe('drop');
  });
});

describe('thresholdTotal', () => {
  it('adds the thresholds up', () => {
    expect(thresholdTotal({ 7001: 0.5, 7004: 0.3, 7006: 0.2 })).toBeCloseTo(1);
    expect(thresholdTotal({})).toBe(0);
  });
});

/**
 * Wire models for the portal service (`/r/scheduler/criterias/*`).
 *
 * Two things about this API drive the shapes below:
 *  - every endpoint answers HTTP 200, success or not; the real status is
 *    `Error.Code` inside the envelope;
 *  - the envelope uses capitalised keys (`Data`, `Error`) while the payload
 *    models use snake_case.
 */

// ----------------------------------------------------------------------

export type ApiEnvelope<T> = {
  Data: T;
  Error: {
    Code: number;
    Message: string;
  };
};

/** `Error.Code` values the portal returns. */
export const API_CODE = {
  ok: 200,
  badRequest: 400,
  unauthorized: 401,
  serverError: 500,
  permissionDenied: 1,
} as const;

// ----------------------------------------------------------------------

export type SubCriteria = {
  /** Campaign id. Its product_type must match the criteria's. */
  id: number;
  total: number;
  bank_sms_id: string;
  expect: number[] | null;
};

export type CriteriaNode = {
  /** SQL-like filter. The server rejects blacklisted keywords. */
  query: string;
  crits: SubCriteria[];
};

export type Criteria = {
  nodes: CriteriaNode[];
};

export type ExcludeCondition = {
  rule7_sent_days: number;
  rule8_sent_days: number;
};

/** 0 = Sunday … 6 = Saturday */
export type DaysInWeek = {
  days: number[];
};

export const CRITERIA_STATUS = {
  available: 1,
  unavailable: 2,
  deleted: 3,
} as const;

export type LeadCriteria = {
  id: string;
  name: string;
  batch_id: string;
  product_type: number;
  client_code: string;
  priority: number;
  excl_condition?: ExcludeCondition;
  criteria: Criteria;
  avai_days: DaysInWeek;
  status: number;
  created_at?: string;
  updated_at?: string;
  in_process: boolean;
};

// ----------------------------------------------------------------------

export type ViewCriteriasBody = {
  offset: number;
  limit: number;
  telco: string;
};

export type UpsertCriteriaBody = {
  lead_criteria: LeadCriteria;
  telco: string;
};

export type CriteriaIdBody = {
  id: string;
  telco: string;
};

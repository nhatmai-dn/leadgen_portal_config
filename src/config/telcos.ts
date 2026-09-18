/**
 * Static structure of the SMS programs this portal configures:
 * telco → client → program, where a program owns the batches and campaigns
 * that appear as one tab in the old spreadsheet (VIB_CC, VIB_UPL, …).
 *
 * Only the structure lives here. The daily numbers an operator types
 * (no_day, batch quantities, thresholds) are runtime state, not config.
 */

// ----------------------------------------------------------------------

export type CampaignConfig = {
  /** Campaign id sent as SubCriteria.id */
  id: number;
  label: string;
};

export type BatchConfig = {
  /** Batch name without the date suffix, e.g. `vib_cc_rand_v2.3` */
  name: string;
  label: string;
};

export type CreditScoreRange = {
  min: number;
  max: number;
};

export type ProgramConfig = {
  /** Stable key used in URLs and stored state */
  key: string;
  label: string;
  /** Must match LeadCriteria.product_type of the target criteria */
  productType: number;
  creditScore: CreditScoreRange;
  /** Sent as SubCriteria.bank_sms_id for every row in this program */
  bankSmsId: string;
  batches: BatchConfig[];
  campaigns: CampaignConfig[];
};

export type ClientConfig = {
  /** LeadCriteria.client_code */
  code: string;
  label: string;
  programs: ProgramConfig[];
};

export type TelcoConfig = {
  /** Sent as the `telco` field on every request */
  code: string;
  label: string;
  clients: ClientConfig[];
};

// ----------------------------------------------------------------------

export const PRODUCT_TYPE = {
  cashLoan: 0,
  creditCard: 1,
} as const;

export const TELCOS: TelcoConfig[] = [
  {
    code: 'viettel',
    label: 'VT / Viettel',
    clients: [
      {
        code: 'VIB',
        label: 'VIB',
        programs: [
          {
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
          },
        ],
      },
    ],
  },
  // Structure is in place for the other two telcos; fill in their clients and
  // programs the same way once the batch names and campaign ids are confirmed.
  { code: 'mobifone', label: 'MBF / MobiFone', clients: [] },
  { code: 'vinaphone', label: 'VNPT / VinaPhone', clients: [] },
];

// ----------------------------------------------------------------------

export function findTelco(code: string): TelcoConfig | undefined {
  return TELCOS.find((telco) => telco.code === code);
}

export function findProgram(
  telcoCode: string,
  clientCode: string,
  programKey: string
): { telco: TelcoConfig; client: ClientConfig; program: ProgramConfig } | undefined {
  const telco = findTelco(telcoCode);
  const client = telco?.clients.find((item) => item.code === clientCode);
  const program = client?.programs.find((item) => item.key === programKey);

  return telco && client && program ? { telco, client, program } : undefined;
}

export type ProgramRef = {
  telco: TelcoConfig;
  client: ClientConfig;
  program: ProgramConfig;
};

/** Every program across every telco, flattened for pickers and tabs. */
export function listPrograms(telcoCode?: string): ProgramRef[] {
  return TELCOS.filter((telco) => !telcoCode || telco.code === telcoCode).flatMap((telco) =>
    telco.clients.flatMap((client) =>
      client.programs.map((program) => ({ telco, client, program }))
    )
  );
}

/** Telcos that actually have something to configure. */
export function listConfiguredTelcos(): TelcoConfig[] {
  return TELCOS.filter((telco) => telco.clients.some((client) => client.programs.length > 0));
}

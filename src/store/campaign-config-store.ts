import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { defaultBatchDate } from 'src/utils/batch-date';

import type { CampaignConfigInput } from 'src/sections/campaign-config/build-plan';

// ----------------------------------------------------------------------

/**
 * What the operator typed, kept per program so switching tabs does not lose
 * work, and persisted so a reload does not either. Server data never lands
 * here — that belongs to TanStack Query.
 */
type ProgramState = Omit<CampaignConfigInput, 'batchDate'> & { batchDate: string };

type ConfigState = {
  byProgram: Record<string, ProgramState>;
  setBatchDate: (key: string, batchDate: string) => void;
  setNumberOfDays: (key: string, numberOfDays: number) => void;
  setQuantity: (key: string, batchName: string, quantity: number) => void;
  setThreshold: (key: string, campaignId: number, threshold: number) => void;
  reset: (key: string) => void;
};

export function emptyProgramState(): ProgramState {
  return {
    batchDate: defaultBatchDate(),
    numberOfDays: 1,
    quantities: {},
    thresholds: {},
  };
}

/** Reads are always defined, so views never branch on "not configured yet". */
function withProgram(
  state: ConfigState,
  key: string,
  change: (program: ProgramState) => ProgramState
) {
  const current = state.byProgram[key] ?? emptyProgramState();

  return { byProgram: { ...state.byProgram, [key]: change(current) } };
}

export const useCampaignConfigStore = create<ConfigState>()(
  persist(
    (set) => ({
      byProgram: {},

      setBatchDate: (key, batchDate) =>
        set((state) => withProgram(state, key, (program) => ({ ...program, batchDate }))),

      setNumberOfDays: (key, numberOfDays) =>
        set((state) => withProgram(state, key, (program) => ({ ...program, numberOfDays }))),

      setQuantity: (key, batchName, quantity) =>
        set((state) =>
          withProgram(state, key, (program) => ({
            ...program,
            quantities: { ...program.quantities, [batchName]: quantity },
          }))
        ),

      setThreshold: (key, campaignId, threshold) =>
        set((state) =>
          withProgram(state, key, (program) => ({
            ...program,
            thresholds: { ...program.thresholds, [campaignId]: threshold },
          }))
        ),

      reset: (key) =>
        set((state) => ({ byProgram: { ...state.byProgram, [key]: emptyProgramState() } })),
    }),
    { name: 'leadgen-campaign-config' }
  )
);

export function useProgramState(key: string): ProgramState {
  return useCampaignConfigStore((state) => state.byProgram[key]) ?? emptyProgramState();
}

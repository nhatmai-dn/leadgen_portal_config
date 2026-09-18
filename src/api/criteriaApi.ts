import type {
  LeadCriteria,
  CriteriaIdBody,
  ViewCriteriasBody,
  UpsertCriteriaBody,
} from 'src/types/lead-criteria';

import { post } from './baseApiRequest';

// ----------------------------------------------------------------------

const BASE = '/r/scheduler/criterias';

/**
 * `view` has no name filter, so the client pages through and matches locally.
 * A telco holds a few dozen criteria, so one page is normally enough; the
 * loop is here so growth does not silently truncate the list.
 */
const PAGE_SIZE = 200;
const MAX_PAGES = 25;

const criteriaApi = {
  async view(telco: string, body: Partial<ViewCriteriasBody> = {}): Promise<LeadCriteria[]> {
    const data = await post<LeadCriteria[] | null>(`${BASE}/view`, {
      offset: body.offset ?? 0,
      limit: body.limit ?? PAGE_SIZE,
      telco,
    });

    return data ?? [];
  },

  /** Every criteria for the telco, paged until the portal stops filling a page. */
  async viewAll(telco: string): Promise<LeadCriteria[]> {
    const all: LeadCriteria[] = [];

    for (let page = 0; page < MAX_PAGES; page += 1) {
      // Sequential by necessity: the next offset depends on this page's size.
       
      const batch = await criteriaApi.view(telco, { offset: page * PAGE_SIZE, limit: PAGE_SIZE });

      all.push(...batch);

      if (batch.length < PAGE_SIZE) break;
    }

    return all;
  },

  update(telco: string, leadCriteria: LeadCriteria): Promise<null> {
    const body: UpsertCriteriaBody = { lead_criteria: leadCriteria, telco };

    return post<null>(`${BASE}/update`, body);
  },

  selectLead(telco: string, id: string): Promise<null> {
    const body: CriteriaIdBody = { id, telco };

    return post<null>(`${BASE}/selectlead`, body);
  },
};

export default criteriaApi;

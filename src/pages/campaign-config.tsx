import { CONFIG } from 'src/config-global';

import { CampaignConfigView } from 'src/sections/campaign-config/view';

// ----------------------------------------------------------------------

export default function Page() {
  return (
    <>
      <title>{`Campaign Config - ${CONFIG.appName}`}</title>

      <CampaignConfigView />
    </>
  );
}

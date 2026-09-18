import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { useAuthStore } from 'src/store/auth-store';
import { DashboardContent } from 'src/layouts/dashboard';

import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsWebsiteVisits } from '../analytics-website-visits';
import { AnalyticsConversionRates } from '../analytics-conversion-rates';

// ----------------------------------------------------------------------

/**
 * Placeholder figures. Replace each block with a `useQuery` against the
 * LeadGen API — the chart components below take plain props, no store.
 */
export function OverviewAnalyticsView() {
  const user = useAuthStore((state) => state.user);

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        {user?.displayName ? `Hi, ${user.displayName}` : 'Dashboard'}
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Leads delivered"
            percent={0}
            total={0}
            icon={<img alt="" src="/assets/icons/glass/ic-glass-users.svg" />}
            chart={{ categories: [], series: [] }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="SMS sent"
            percent={0}
            total={0}
            color="secondary"
            icon={<img alt="" src="/assets/icons/glass/ic-glass-message.svg" />}
            chart={{ categories: [], series: [] }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Replies"
            percent={0}
            total={0}
            color="warning"
            icon={<img alt="" src="/assets/icons/glass/ic-glass-buy.svg" />}
            chart={{ categories: [], series: [] }}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <AnalyticsWidgetSummary
            title="Active campaigns"
            percent={0}
            total={0}
            color="error"
            icon={<img alt="" src="/assets/icons/glass/ic-glass-bag.svg" />}
            chart={{ categories: [], series: [] }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 8 }}>
          <AnalyticsWebsiteVisits
            title="Delivery volume"
            subheader="Last 30 days"
            chart={{ categories: [], series: [] }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6, lg: 4 }}>
          <AnalyticsCurrentVisits title="Leads by client" chart={{ series: [] }} />
        </Grid>

        <Grid size={12}>
          <AnalyticsConversionRates
            title="Reply rate by campaign"
            chart={{ categories: [], series: [] }}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}

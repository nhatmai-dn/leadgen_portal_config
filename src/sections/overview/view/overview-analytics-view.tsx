import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

import { useAuthStore } from 'src/store/auth-store';

import { DashboardContent } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

/**
 * Placeholder until the reporting API lands.
 *
 * Deliberately chart-free: mounting ApexCharts costs a ~940 kB chunk and
 * ~140 ms of render for figures that are all zero, which made switching to
 * this tab feel slow. The chart components in `src/sections/overview/` are
 * still here — wire them up once there is data worth drawing.
 */
const METRICS = [
  { label: 'Leads delivered', hint: 'per day' },
  { label: 'SMS sent', hint: 'per day' },
  { label: 'Replies', hint: 'per day' },
  { label: 'Active campaigns', hint: 'now' },
];

export function OverviewAnalyticsView() {
  const user = useAuthStore((state) => state.user);

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        {user?.displayName ? `Hi, ${user.displayName}` : 'Dashboard'}
      </Typography>

      <Grid container spacing={3}>
        {METRICS.map((metric) => (
          <Grid key={metric.label} size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ p: 3 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                {metric.label}
              </Typography>
              <Typography variant="h3" sx={{ my: 1, color: 'text.disabled' }}>
                —
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {metric.hint}
              </Typography>
            </Card>
          </Grid>
        ))}

        <Grid size={12}>
          <Alert severity="info">
            Reporting is not wired up yet. Campaign configuration lives under Campaign config.
          </Alert>
        </Grid>

        <Grid size={12}>
          <Box sx={{ height: 240 }} />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}

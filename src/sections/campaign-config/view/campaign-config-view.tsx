import { useMemo, useState } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { useProgramState, useCampaignConfigStore } from 'src/store/campaign-config-store';

import { DashboardContent } from 'src/layouts/dashboard';
import { listPrograms, listConfiguredTelcos } from 'src/config/telcos';

import { Iconify } from 'src/components/iconify';

import { buildPlan } from '../build-plan';
import { PlanTable } from '../components/plan-table';
import { useUpdatePortal } from '../use-update-portal';
import { ConfigInputs } from '../components/config-inputs';
import { ThresholdCard } from '../components/threshold-card';
import { UpdatePortalDialog } from '../components/update-portal-dialog';

// ----------------------------------------------------------------------

export function CampaignConfigView() {
  const telcos = useMemo(() => listConfiguredTelcos(), []);

  const [telcoCode, setTelcoCode] = useState(telcos[0]?.code ?? '');
  const [tab, setTab] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);

  const programs = useMemo(() => listPrograms(telcoCode), [telcoCode]);
  const selected = programs[Math.min(tab, programs.length - 1)];

  // Client code is part of the key so two clients sharing a program key keep
  // their own numbers.
  const storeKey = selected
    ? `${selected.telco.code}:${selected.client.code}:${selected.program.key}`
    : '';

  const state = useProgramState(storeKey);
  const setBatchDate = useCampaignConfigStore((store) => store.setBatchDate);
  const setNumberOfDays = useCampaignConfigStore((store) => store.setNumberOfDays);
  const setQuantity = useCampaignConfigStore((store) => store.setQuantity);
  const setThreshold = useCampaignConfigStore((store) => store.setThreshold);

  const updatePortal = useUpdatePortal(selected?.telco.code ?? '');

  const plan = useMemo(
    () => (selected ? buildPlan(selected.program, state) : undefined),
    [selected, state]
  );

  const telcoPicker = (
    <TextField
      select
      size="small"
      label="Telco"
      value={telcoCode}
      onChange={(event) => {
        setTelcoCode(event.target.value);
        setTab(0);
      }}
      sx={{ minWidth: 200 }}
    >
      {telcos.map((telco) => (
        <MenuItem key={telco.code} value={telco.code}>
          {telco.label}
        </MenuItem>
      ))}
    </TextField>
  );

  if (!selected || !plan) {
    return (
      <DashboardContent maxWidth="xl">
        <Typography variant="h4" sx={{ mb: 3 }}>
          Campaign config
        </Typography>
        <Alert severity="info">
          No programs are configured yet. Add clients and programs in
          <code> src/config/telcos.ts</code>.
        </Alert>
      </DashboardContent>
    );
  }

  const handleOpen = () => {
    updatePortal.reset();
    setDialogOpen(true);
  };

  return (
    <DashboardContent maxWidth="xl">
      <Box
        sx={{
          mb: 3,
          gap: 2,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h4">Campaign config</Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {`${selected.telco.label} · ${selected.client.label}`}
          </Typography>
        </Box>

        <Box sx={{ gap: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
          {telcos.length > 1 && telcoPicker}

          <Button
            variant="contained"
            color="inherit"
            onClick={handleOpen}
            startIcon={<Iconify icon="solar:upload-bold-duotone" />}
          >
            Update Portal
          </Button>
        </Box>
      </Box>

      {programs.length > 1 && (
        <Tabs
          value={Math.min(tab, programs.length - 1)}
          onChange={(_, value) => setTab(value)}
          sx={{ mb: 3 }}
        >
          {programs.map((item) => (
            <Tab
              key={`${item.client.code}:${item.program.key}`}
              label={`${item.client.label} · ${item.program.label}`}
            />
          ))}
        </Tabs>
      )}

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <ConfigInputs
            program={selected.program}
            input={state}
            plan={plan}
            onBatchDateChange={(value) => setBatchDate(storeKey, value)}
            onNumberOfDaysChange={(value) => setNumberOfDays(storeKey, value)}
            onQuantityChange={(batchName, value) => setQuantity(storeKey, batchName, value)}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <ThresholdCard
            program={selected.program}
            thresholds={state.thresholds}
            onChange={(campaignId, value) => setThreshold(storeKey, campaignId, value)}
          />
        </Grid>

        <Grid size={12}>
          <PlanTable program={selected.program} plan={plan} batchDate={state.batchDate} />
        </Grid>
      </Grid>

      <UpdatePortalDialog
        open={dialogOpen}
        telcoLabel={selected.telco.label}
        plans={plan.batches}
        isPending={updatePortal.isPending}
        result={updatePortal.data}
        error={updatePortal.error}
        onConfirm={() => updatePortal.mutate(plan.batches)}
        onClose={() => setDialogOpen(false)}
      />
    </DashboardContent>
  );
}

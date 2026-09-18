import type { BatchPlan } from '../build-plan';
import type { UpdatePortalResult } from '../use-update-portal';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  telcoLabel: string;
  plans: BatchPlan[];
  isPending: boolean;
  result?: UpdatePortalResult;
  error?: Error | null;
  onConfirm: () => void;
  onClose: () => void;
};

/**
 * Confirmation step: the operator sees the exact JSON that will be written
 * and which criteria it targets before anything is sent.
 */
export function UpdatePortalDialog({
  open,
  telcoLabel,
  plans,
  isPending,
  result,
  error,
  onConfirm,
  onClose,
}: Props) {
  const [tab, setTab] = useState(0);
  const active = plans[Math.min(tab, plans.length - 1)];

  return (
    <Dialog open={open} onClose={isPending ? undefined : onClose} fullWidth maxWidth="md">
      <DialogTitle>Update Portal</DialogTitle>

      <DialogContent dividers>
        {!result && (
          <>
            <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
              {`Writing to ${telcoLabel}. Each batch goes to its own criteria, and only
                criteria.nodes is replaced — priority, available days and status stay as the
                portal has them.`}
            </Typography>

            <Tabs value={Math.min(tab, plans.length - 1)} onChange={(_, value) => setTab(value)}>
              {plans.map((plan) => (
                <Tab key={plan.batchName} label={plan.criteriaName} />
              ))}
            </Tabs>

            <Divider sx={{ mb: 2 }} />

            {active && (
              <Scrollbar sx={{ maxHeight: 360 }}>
                <Box
                  component="pre"
                  sx={{
                    m: 0,
                    p: 2,
                    fontSize: 12,
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
                  }}
                >
                  {JSON.stringify({ nodes: active.nodes }, null, 2)}
                </Box>
              </Scrollbar>
            )}
          </>
        )}

        {result && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {result.results.map((item) => (
              <Box
                key={item.criteriaName}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}
              >
                <Label
                  color={
                    item.status === 'updated'
                      ? 'success'
                      : item.status === 'not-found'
                        ? 'warning'
                        : 'error'
                  }
                >
                  {item.status}
                </Label>
                <Typography variant="subtitle2">{item.criteriaName}</Typography>
                {item.message && (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {item.message}
                  </Typography>
                )}
              </Box>
            ))}

            {result.missing.length > 0 && (
              <Alert severity="warning">
                {`No criteria found for: ${result.missing.join(', ')}. Check the batch date, or
                  create the criteria in the portal first.`}
              </Alert>
            )}
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error.message}
          </Alert>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={isPending} color="inherit">
          {result ? 'Close' : 'Cancel'}
        </Button>
        {!result && (
          <Button onClick={onConfirm} loading={isPending} variant="contained" color="inherit">
            {`Update ${plans.length} criteria`}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

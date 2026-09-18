import type { ConfigPlan } from '../build-plan';
import type { ProgramConfig } from 'src/config/telcos';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { fNumber } from 'src/utils/format-number';

import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type Props = {
  program: ProgramConfig;
  plan: ConfigPlan;
  batchDate: string;
};

/**
 * The derived table. Nothing here is editable — every number comes from the
 * inputs, which is the point: the old spreadsheet let people edit cells that
 * were supposed to be formulas.
 */
export function PlanTable({ program, plan, batchDate }: Props) {
  return (
    <Card>
      <CardHeader
        title="Generated rows"
        subheader="One row per batch × campaign, written as one criteria per batch"
      />

      <Scrollbar>
        <Table size="small" sx={{ minWidth: 720 }}>
          <TableHead>
            <TableRow>
              <TableCell>Batch</TableCell>
              <TableCell>Criteria</TableCell>
              <TableCell>Credit score</TableCell>
              <TableCell align="right">Campaign</TableCell>
              <TableCell align="right">num_sms_per_day</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {plan.batches.map((batch) =>
              batch.rows.map((row, index) => (
                <TableRow key={`${batch.batchName}-${row.campaign.id}`} hover>
                  {index === 0 && (
                    <>
                      <TableCell rowSpan={batch.rows.length}>
                        <Typography variant="subtitle2" noWrap>
                          {batch.batchName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {`${batch.batchName}_${batchDate}`}
                        </Typography>
                      </TableCell>

                      <TableCell rowSpan={batch.rows.length}>
                        <Label color={batch.blacklistedTerm ? 'error' : 'default'}>
                          {batch.criteriaName}
                        </Label>
                      </TableCell>

                      <TableCell rowSpan={batch.rows.length}>
                        {`${program.creditScore.min} – ${program.creditScore.max}`}
                      </TableCell>
                    </>
                  )}

                  <TableCell align="right">{row.campaign.label}</TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: row.total > 0 ? 'fontWeightSemiBold' : undefined,
                        color: row.total > 0 ? 'text.primary' : 'text.disabled',
                      }}
                    >
                      {fNumber(row.total)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}

            <TableRow>
              <TableCell colSpan={4} align="right">
                <Typography variant="subtitle2">Total per day</Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle1">{fNumber(plan.totalPerDay)}</Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Scrollbar>

      {plan.batches
        .filter((batch) => batch.blacklistedTerm)
        .map((batch) => (
          <Box key={batch.batchName} sx={{ px: 3, pb: 3 }}>
            <Alert severity="warning">
              {`"${batch.batchName}" contains "${batch.blacklistedTerm}", which the portal's SQL
                blacklist may reject. Update will still be attempted.`}
            </Alert>
          </Box>
        ))}
    </Card>
  );
}

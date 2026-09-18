import type { ProgramConfig } from 'src/config/telcos';
import type { ConfigPlan, CampaignConfigInput } from '../build-plan';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import FormHelperText from '@mui/material/FormHelperText';

import { fNumber } from 'src/utils/format-number';
import { isValidBatchDate } from 'src/utils/batch-date';

import { NumberField } from './number-field';

// ----------------------------------------------------------------------

type Props = {
  program: ProgramConfig;
  input: CampaignConfigInput;
  plan: ConfigPlan;
  onBatchDateChange: (value: string) => void;
  onNumberOfDaysChange: (value: number) => void;
  onQuantityChange: (batchName: string, value: number) => void;
};

export function ConfigInputs({
  program,
  input,
  plan,
  onBatchDateChange,
  onNumberOfDaysChange,
  onQuantityChange,
}: Props) {
  const batchDateError = !isValidBatchDate(input.batchDate);

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader
        title="Input"
        subheader="Batch date defaults to the most recent Sunday"
        sx={{ pb: 2 }}
      />

      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={2.5}>
          <TextField
            size="small"
            label="Batch date"
            value={input.batchDate}
            error={batchDateError}
            helperText={batchDateError ? 'Expected YYYYMMDD' : ' '}
            onChange={(event) => onBatchDateChange(event.target.value.trim())}
            slotProps={{ htmlInput: { inputMode: 'numeric', maxLength: 8 } }}
          />

          <NumberField
            label="No. of days"
            min={1}
            value={input.numberOfDays}
            onChange={onNumberOfDaysChange}
          />

          <Divider sx={{ borderStyle: 'dashed' }} />

          {program.batches.map((batch) => (
            <NumberField
              key={batch.name}
              label={`${batch.label} — total leads`}
              value={input.quantities[batch.name] ?? 0}
              onChange={(value) => onQuantityChange(batch.name, value)}
            />
          ))}

          <Divider sx={{ borderStyle: 'dashed' }} />

          <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'baseline' }}>
            <Typography variant="subtitle2">SMS per day</Typography>
            <Typography variant="h5">{fNumber(plan.totalPerDay)}</Typography>
          </Stack>
          <FormHelperText sx={{ mt: -1.5 }}>
            Sum of every batch × campaign row below
          </FormHelperText>
        </Stack>
      </CardContent>
    </Card>
  );
}

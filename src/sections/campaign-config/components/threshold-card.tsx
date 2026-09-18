import type { ProgramConfig } from 'src/config/telcos';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import { NumberField } from './number-field';
import { thresholdTotal } from '../build-plan';

// ----------------------------------------------------------------------

type Props = {
  program: ProgramConfig;
  thresholds: Record<number, number>;
  onChange: (campaignId: number, threshold: number) => void;
};

/**
 * Thresholds are stored as fractions but shown as percentages — operators
 * think in "100% goes to 7004", not "1".
 */
export function ThresholdCard({ program, thresholds, onChange }: Props) {
  const total = thresholdTotal(thresholds);
  const isOffTarget = Math.abs(total - 1) > 0.0001;

  return (
    <Card sx={{ height: 1 }}>
      <CardHeader title="Campaign split" subheader="Share of each batch's daily volume" />

      <CardContent sx={{ pt: 1 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Campaign</TableCell>
              <TableCell align="right">Threshold</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {program.campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>{campaign.label}</TableCell>
                <TableCell align="right">
                  <NumberField
                    width={110}
                    suffix="%"
                    value={Math.round((thresholds[campaign.id] ?? 0) * 100)}
                    onChange={(value) => onChange(campaign.id, value / 100)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {isOffTarget && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            {`Thresholds add up to ${Math.round(total * 100)}%, not 100%.`}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

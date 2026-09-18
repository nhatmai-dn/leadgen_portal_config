import { useState } from 'react';

import TextField from '@mui/material/TextField';

// ----------------------------------------------------------------------

type Props = {
  label?: string;
  value: number;
  min?: number;
  onChange: (value: number) => void;
  suffix?: string;
  width?: number;
  disabled?: boolean;
};

/**
 * A numeric input that stays editable while it is being typed.
 *
 * Coercing on every keystroke looks tidy but breaks the field: clearing it
 * snaps the value back to `min`, and the next digit lands *after* that — you
 * clear "1", type "5", and end up with "15".
 *
 * So the raw text is kept alongside the number it produced. While the parent
 * still holds that number the text is shown as typed (including an empty
 * box); as soon as the value changes from anywhere else — a reset, a program
 * switch — the draft no longer matches and the canonical number wins. No
 * effect required.
 */
export function NumberField({ label, value, min = 0, onChange, suffix, width, disabled }: Props) {
  const [draft, setDraft] = useState<{ base: number; text: string } | null>(null);

  const shown = draft && draft.base === value ? draft.text : String(value);

  const handleChange = (raw: string) => {
    // Drop non-digits, and a leading zero so typing into a field showing "0"
    // reads "5" rather than "05".
    const cleaned = raw.replace(/[^\d]/g, '').replace(/^0+(?=\d)/, '');
    const parsed = cleaned === '' ? min : Math.max(min, Number(cleaned));

    setDraft({ base: parsed, text: cleaned });
    onChange(parsed);
  };

  return (
    <TextField
      size="small"
      label={label}
      disabled={disabled}
      value={shown}
      onChange={(event) => handleChange(event.target.value)}
      onBlur={() => setDraft(null)}
      slotProps={{
        input: { endAdornment: suffix },
        htmlInput: { inputMode: 'numeric', style: { textAlign: 'right' } },
      }}
      sx={{ width }}
    />
  );
}

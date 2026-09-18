import { useState } from 'react';
import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, render } from '@testing-library/react';

import { NumberField } from './number-field';

// ----------------------------------------------------------------------

function Harness({ min = 1, initial = 1 }: { min?: number; initial?: number }) {
  const [value, setValue] = useState(initial);

  return (
    <>
      <NumberField label="Days" min={min} value={value} onChange={setValue} />
      <output data-testid="value">{value}</output>
      {/* Stands in for a reset or a program switch changing the value. */}
      <button type="button" onClick={() => setValue(9)}>
        set externally
      </button>
    </>
  );
}

describe('NumberField', () => {
  it('lets a value be cleared and retyped without the old digits sticking', async () => {
    render(<Harness min={1} initial={1} />);

    const field = screen.getByLabelText('Days');
    await userEvent.clear(field);
    await userEvent.type(field, '5');

    expect(field).toHaveValue('5');
    expect(screen.getByTestId('value')).toHaveTextContent('5');
  });

  it('accepts a multi-digit value typed from empty', async () => {
    render(<Harness min={0} initial={0} />);

    const field = screen.getByLabelText('Days');
    await userEvent.clear(field);
    await userEvent.type(field, '12046');

    expect(screen.getByTestId('value')).toHaveTextContent('12046');
  });

  it('falls back to min when the field is left empty', async () => {
    render(<Harness min={1} initial={7} />);

    const field = screen.getByLabelText('Days');
    await userEvent.clear(field);
    await userEvent.tab();

    expect(screen.getByTestId('value')).toHaveTextContent('1');
  });

  it('ignores non-numeric characters', async () => {
    render(<Harness min={0} initial={0} />);

    await userEvent.type(screen.getByLabelText('Days'), 'a1b2');

    expect(screen.getByLabelText('Days')).toHaveValue('12');
    expect(screen.getByTestId('value')).toHaveTextContent('12');
  });

  it('shows the canonical value again once it changes from elsewhere', async () => {
    render(<Harness min={0} initial={5} />);

    const field = screen.getByLabelText('Days');
    await userEvent.clear(field);
    expect(field).toHaveValue('');

    await userEvent.click(screen.getByRole('button', { name: 'set externally' }));
    expect(field).toHaveValue('9');
  });
});

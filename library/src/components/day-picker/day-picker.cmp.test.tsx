import { render, h, describe, it, expect } from '@stencil/vitest';
import type { DayOption } from '../../utils/types';

const days: DayOption[] = [
  { day: 'mon', label: 'Monday', occupied: false },
  { day: 'tue', label: 'Tuesday', occupied: true },
  { day: 'wed', label: 'Wednesday', occupied: false },
  { day: 'thu', label: 'Thursday', occupied: false },
  { day: 'fri', label: 'Friday', occupied: false },
  { day: 'sat', label: 'Saturday', occupied: false },
  { day: 'sun', label: 'Sunday', occupied: false },
];

describe('day-picker', () => {
  it('renders the trigger label', async () => {
    const { root } = await render(<day-picker recipeId="52772" days={days} label="Add to plan"></day-picker>);
    expect(root.shadowRoot?.querySelector('.trigger span')?.textContent).toBe('Add to plan');
    expect(root.shadowRoot?.querySelector('.trigger')?.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens the panel on trigger click and marks occupied days aria-disabled', async () => {
    const { root, waitForChanges } = await render(
      <day-picker recipeId="52772" days={days} label="Add to plan"></day-picker>,
    );
    root.shadowRoot?.querySelector<HTMLButtonElement>('.trigger')?.click();
    await waitForChanges();
    expect(root.shadowRoot?.querySelector('.trigger')?.getAttribute('aria-expanded')).toBe('true');
    const dayButtons = root.shadowRoot?.querySelectorAll('.day');
    expect(dayButtons?.[1].getAttribute('aria-disabled')).toBe('true');
    expect(dayButtons?.[1].textContent).toContain('Already added');
    expect(dayButtons?.[0].getAttribute('aria-disabled')).toBe('false');
  });

  it('emits planassign for an unoccupied day and pickerclose after selection', async () => {
    const { root, waitForChanges } = await render(
      <day-picker recipeId="52772" days={days} label="Add to plan"></day-picker>,
    );
    const assigns: unknown[] = [];
    const closes: unknown[] = [];
    root.addEventListener('planassign', (event: Event) => assigns.push((event as CustomEvent).detail));
    root.addEventListener('pickerclose', (event: Event) => closes.push((event as CustomEvent).detail));

    root.shadowRoot?.querySelector<HTMLButtonElement>('.trigger')?.click();
    await waitForChanges();
    root.shadowRoot?.querySelectorAll<HTMLButtonElement>('.day')[0].click();
    await waitForChanges();

    expect(assigns).toEqual([{ recipeId: '52772', day: 'mon' }]);
    expect(closes).toEqual([{}]);
  });

  it('does not assign when an occupied day is clicked', async () => {
    const { root, waitForChanges } = await render(
      <day-picker recipeId="52772" days={days} label="Add to plan"></day-picker>,
    );
    const assigns: unknown[] = [];
    root.addEventListener('planassign', (event: Event) => assigns.push((event as CustomEvent).detail));

    root.shadowRoot?.querySelector<HTMLButtonElement>('.trigger')?.click();
    await waitForChanges();
    root.shadowRoot?.querySelectorAll<HTMLButtonElement>('.day')[1].click();
    await waitForChanges();

    expect(assigns).toEqual([]);
  });
});

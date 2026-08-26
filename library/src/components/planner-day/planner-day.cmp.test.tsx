import { render, h, describe, it, expect } from '@stencil/vitest';
import type { PlannerEntry } from '../../utils/types';

const entries: PlannerEntry[] = [
  { recipeId: '52772', name: 'Teriyaki Chicken', thumbnail: 'https://example.com/thumb.jpg', resolved: true },
  { recipeId: 'usr_1', name: 'Broken entry', thumbnail: null, resolved: false },
];

describe('planner-day', () => {
  it('owns its accessible name from dayLabel', async () => {
    const { root } = await render(<planner-day day="mon" dayLabel="Monday" entries={[]}></planner-day>);
    expect(root.shadowRoot?.querySelector('[role="region"]')?.getAttribute('aria-label')).toBe('Monday');
  });

  it('renders every entry with a working remove button, even when unresolved', async () => {
    const { root } = await render(<planner-day day="mon" dayLabel="Monday" entries={entries}></planner-day>);
    const rows = root.shadowRoot?.querySelectorAll('.entry');
    expect(rows?.length).toBe(2);
    expect(rows?.[1].querySelector('.name')?.textContent).toBe('Broken entry');
    expect(rows?.[1].querySelectorAll('.icon-button').length).toBe(2);
  });

  it('renders a typographic tile in place of a thumbnail when there is none', async () => {
    const { root } = await render(<planner-day day="mon" dayLabel="Monday" entries={entries}></planner-day>);
    const rows = root.shadowRoot?.querySelectorAll('.entry');
    expect(rows?.[0].querySelector('img.thumb')).not.toBeNull();
    const tile = rows?.[1].querySelector('.thumb.tile');
    expect(tile).not.toBeNull();
    expect(tile?.textContent).toBe('B');
  });

  it('emits entryremove with the recipeId and this day', async () => {
    const { root, waitForChanges } = await render(<planner-day day="tue" dayLabel="Tuesday" entries={entries}></planner-day>);
    const removed: unknown[] = [];
    root.addEventListener('entryremove', (event: Event) => removed.push((event as CustomEvent).detail));
    root.shadowRoot?.querySelectorAll<HTMLButtonElement>('.entry .icon-button')[1].click();
    await waitForChanges();
    expect(removed).toEqual([{ recipeId: '52772', day: 'tue' }]);
  });

  it('emits recipeselect with the recipeId when the entry name is activated', async () => {
    const { root, waitForChanges } = await render(<planner-day day="mon" dayLabel="Monday" entries={entries}></planner-day>);
    const selected: unknown[] = [];
    root.addEventListener('recipeselect', (event: Event) => selected.push((event as CustomEvent).detail));
    root.shadowRoot?.querySelectorAll<HTMLButtonElement>('.entry .name')[0].click();
    await waitForChanges();
    expect(selected).toEqual([{ recipeId: '52772' }]);
  });

  it('emits entrymoverequest with only fromDay, never a target day', async () => {
    const { root, waitForChanges } = await render(<planner-day day="wed" dayLabel="Wednesday" entries={entries}></planner-day>);
    const moves: unknown[] = [];
    root.addEventListener('entrymoverequest', (event: Event) => moves.push((event as CustomEvent).detail));
    root.shadowRoot?.querySelectorAll<HTMLButtonElement>('.entry .icon-button')[0].click();
    await waitForChanges();
    expect(moves).toEqual([{ recipeId: '52772', fromDay: 'wed' }]);
  });

  it('emits daytoggle with the inverted collapsed state', async () => {
    const { root, waitForChanges } = await render(
      <planner-day day="thu" dayLabel="Thursday" entries={entries} collapsed={false}></planner-day>,
    );
    const toggles: unknown[] = [];
    root.addEventListener('daytoggle', (event: Event) => toggles.push((event as CustomEvent).detail));
    root.shadowRoot?.querySelector<HTMLButtonElement>('.toggle')?.click();
    await waitForChanges();
    expect(toggles).toEqual([{ day: 'thu', collapsed: true }]);
  });

  it('projects the empty slot when there are no entries', async () => {
    const { root } = await render(
      <planner-day day="fri" dayLabel="Friday" entries={[]}>
        <p slot="empty">Nothing planned</p>
      </planner-day>,
    );
    expect(root.querySelector('[slot="empty"]')?.textContent).toBe('Nothing planned');
  });

  it('renders as empty rather than throwing when entries has not arrived as an array yet', async () => {
    // Regression: a custom element upgraded from server-rendered HTML sees
    // the attribute form of an array prop (its string coercion) before
    // Svelte assigns the real property.
    const { root } = await render(
      <planner-day day="mon" dayLabel="Monday" entries={'[object Object]' as unknown as never}></planner-day>,
    );
    expect(root.shadowRoot?.querySelector('.entries')).toBeNull();
    expect(root.shadowRoot?.querySelector('.count')?.textContent).toBe('0');
  });

  it('hides entries while collapsed but keeps the header', async () => {
    const { root } = await render(
      <planner-day day="sat" dayLabel="Saturday" entries={entries} collapsed={true}></planner-day>,
    );
    expect(root.shadowRoot?.querySelector('.entries')).toBeNull();
    expect(root.shadowRoot?.querySelector('.day-name')?.textContent).toBe('Saturday');
  });
});

/// <reference types="mocha" />
import { html } from 'lit';
import { fixtureSync, expect } from '@open-wc/testing';
import {
  CommandPalette,
  matchesShortcut,
  type Command,
} from '../src/command-palette/index.js';

if (!customElements.get('wc-command-palette')) {
  customElements.define('wc-command-palette', CommandPalette);
}

const COMMANDS: Command[] = [
  { id: 'new-issue', label: 'New issue', group: 'Issues', shortcut: 'C' },
  {
    id: 'close-issue',
    label: 'Close issue',
    group: 'Issues',
    keywords: ['resolve'],
  },
  {
    id: 'settings',
    label: 'Open settings',
    group: 'Navigation',
    description: 'Account and workspace preferences',
  },
  {
    id: 'archived',
    label: 'Archived issues',
    group: 'Navigation',
    disabled: true,
  },
  { id: 'theme', label: 'Toggle theme' },
];

async function openPalette(props: Partial<CommandPalette> = {}) {
  const el = fixtureSync<CommandPalette>(
    html`<wc-command-palette></wc-command-palette>`,
  );
  Object.assign(el, { commands: COMMANDS, ...props });
  el.show();
  await el.updateComplete;
  return el;
}

function input(el: CommandPalette): HTMLInputElement {
  const found = el.shadowRoot?.querySelector<HTMLInputElement>('input');
  if (!found) throw new Error('no input');
  return found;
}

function options(el: CommandPalette): HTMLElement[] {
  return Array.from(
    el.shadowRoot?.querySelectorAll<HTMLElement>('[role="option"]') ?? [],
  );
}

function labels(el: CommandPalette): string[] {
  return options(el).map(
    option => option.querySelector('.option-label')?.textContent?.trim() ?? '',
  );
}

function activeLabel(el: CommandPalette): string {
  const id = input(el).getAttribute('aria-activedescendant');
  const option = id ? el.shadowRoot?.getElementById(id) : null;
  return option?.querySelector('.option-label')?.textContent?.trim() ?? '';
}

async function type(el: CommandPalette, text: string) {
  const field = input(el);
  field.value = text;
  field.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
  await el.updateComplete;
}

async function key(el: CommandPalette, name: string) {
  input(el).dispatchEvent(
    new KeyboardEvent('keydown', {
      key: name,
      bubbles: true,
      composed: true,
      cancelable: true,
    }),
  );
  await el.updateComplete;
}

describe('CommandPalette', () => {
  it('wires the combobox to the listbox', async () => {
    const el = await openPalette();
    const field = input(el);
    expect(field.getAttribute('role')).to.equal('combobox');
    const listbox = el.shadowRoot?.getElementById(
      field.getAttribute('aria-controls') ?? '',
    );
    expect(listbox?.getAttribute('role')).to.equal('listbox');
    expect(field.getAttribute('aria-activedescendant')).to.equal('option-0');
    expect(options(el)[0].getAttribute('aria-selected')).to.equal('true');
    expect(field.getAttribute('aria-label')).to.equal('Command palette');
  });

  it('groups commands under their headings, in first-appearance order', async () => {
    const el = await openPalette();
    const headings = Array.from(
      el.shadowRoot?.querySelectorAll('.group-heading') ?? [],
    ).map(heading => heading.textContent?.trim());
    expect(headings).to.deep.equal(['Issues', 'Navigation']);
    const group = el.shadowRoot?.querySelector('[role="group"]');
    expect(group?.getAttribute('aria-labelledby')).to.equal('group-0');
  });

  it('lists recent commands first while the query is empty', async () => {
    const el = await openPalette({ recent: ['settings', 'missing'] });
    expect(labels(el)[0]).to.equal('Open settings');
    const headings = Array.from(
      el.shadowRoot?.querySelectorAll('.group-heading') ?? [],
    ).map(heading => heading.textContent?.trim());
    expect(headings[0]).to.equal('Recent');
    expect(
      labels(el).filter(label => label === 'Open settings'),
    ).to.have.length(1);
  });

  it('filters by label, keywords and description and marks the match', async () => {
    const el = await openPalette();
    await type(el, 'issue');
    expect(labels(el)).to.deep.equal([
      'New issue',
      'Close issue',
      'Archived issues',
    ]);
    const mark = options(el)[0].querySelector('mark');
    expect(mark?.textContent).to.equal('issue');

    await type(el, 'resolve');
    expect(labels(el)).to.deep.equal(['Close issue']);

    await type(el, 'preferences');
    expect(labels(el)).to.deep.equal(['Open settings']);
  });

  it('ranks labels that start with the query first', async () => {
    const el = await openPalette();
    await type(el, 'close');
    expect(labels(el)[0]).to.equal('Close issue');
    await type(el, 'theme toggle');
    expect(labels(el)).to.deep.equal(['Toggle theme']);
  });

  it('shows the empty state for a query without results', async () => {
    const el = await openPalette();
    await type(el, 'zzz');
    expect(options(el)).to.have.length(0);
    expect(el.shadowRoot?.querySelector('.empty')?.textContent).to.contain(
      'No results for "zzz"',
    );
    expect(input(el).hasAttribute('aria-activedescendant')).to.be.false;
  });

  it('moves the highlight with the arrow keys, skipping disabled commands and wrapping', async () => {
    const el = await openPalette();
    expect(activeLabel(el)).to.equal('New issue');
    await key(el, 'ArrowDown');
    expect(activeLabel(el)).to.equal('Close issue');
    await key(el, 'ArrowDown');
    await key(el, 'ArrowDown');
    // "Archived issues" is disabled.
    expect(activeLabel(el)).to.equal('Toggle theme');
    await key(el, 'ArrowDown');
    expect(activeLabel(el)).to.equal('New issue');
    await key(el, 'ArrowUp');
    expect(activeLabel(el)).to.equal('Toggle theme');
    await key(el, 'Home');
    expect(activeLabel(el)).to.equal('New issue');
    await key(el, 'End');
    expect(activeLabel(el)).to.equal('Toggle theme');
    await key(el, 'PageUp');
    expect(activeLabel(el)).to.equal('New issue');
    await key(el, 'PageDown');
    expect(activeLabel(el)).to.equal('Toggle theme');
  });

  it('runs the highlighted command on Enter and closes with reason action', async () => {
    const el = await openPalette();
    const events: string[] = [];
    let selected: Command | undefined;
    let reason = '';
    el.addEventListener('select', event => {
      events.push('select');
      selected = (event as CustomEvent).detail.command;
    });
    el.addEventListener('close', event => {
      events.push('close');
      reason = (event as CustomEvent).detail.reason;
    });
    await key(el, 'ArrowDown');
    await key(el, 'Enter');
    expect(selected?.id).to.equal('close-issue');
    expect(events).to.deep.equal(['select', 'close']);
    expect(reason).to.equal('action');
    expect(el.open).to.be.false;
  });

  it('stays open when select is prevented', async () => {
    const el = await openPalette();
    el.addEventListener('select', event => event.preventDefault());
    await key(el, 'Enter');
    expect(el.open).to.be.true;
  });

  it('runs a command on click, but not a disabled one', async () => {
    const el = await openPalette();
    const ids: string[] = [];
    el.addEventListener('select', event => {
      event.preventDefault();
      ids.push((event as CustomEvent).detail.command.id);
    });
    options(el)[3].click();
    options(el)[2].click();
    expect(ids).to.deep.equal(['settings']);
  });

  it('clears the query on the first Escape and closes on the second', async () => {
    const el = await openPalette();
    let reason = '';
    el.addEventListener('close', event => {
      reason = (event as CustomEvent).detail.reason;
    });
    await type(el, 'issue');
    expect(input(el).hasAttribute('data-handles-escape')).to.be.true;
    await key(el, 'Escape');
    expect(input(el).value).to.equal('');
    expect(el.open).to.be.true;
    expect(input(el).hasAttribute('data-handles-escape')).to.be.false;
    await key(el, 'Escape');
    expect(el.open).to.be.false;
    expect(reason).to.equal('escape');
  });

  it('fires open, and close with reason api on hide() and open = false', async () => {
    const el = fixtureSync<CommandPalette>(
      html`<wc-command-palette></wc-command-palette>`,
    );
    const reasons: string[] = [];
    let opened = 0;
    el.addEventListener('open', () => {
      opened += 1;
    });
    el.addEventListener('close', event =>
      reasons.push((event as CustomEvent).detail.reason),
    );
    el.show();
    await el.updateComplete;
    el.hide();
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;
    el.open = false;
    await el.updateComplete;
    expect(opened).to.equal(2);
    expect(reasons).to.deep.equal(['api', 'api']);
  });

  it('starts with an empty query each time it opens', async () => {
    const el = await openPalette();
    await type(el, 'issue');
    el.hide();
    await el.updateComplete;
    el.show();
    await el.updateComplete;
    expect(input(el).value).to.equal('');
    expect(options(el)).to.have.length(COMMANDS.length);
  });

  it('fires search and leaves filtering to the app with search="managed"', async () => {
    const el = await openPalette({ search: 'managed' });
    const queries: string[] = [];
    el.addEventListener('search', event =>
      queries.push((event as CustomEvent).detail.value),
    );
    await type(el, 'zzz');
    expect(queries).to.deep.equal(['zzz']);
    expect(options(el)).to.have.length(COMMANDS.length);
    el.loading = true;
    el.commands = [];
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.loading-row')).to.exist;
    expect(el.shadowRoot?.querySelector('.empty')).to.not.exist;
    expect(
      el.shadowRoot
        ?.querySelector('[role="listbox"]')
        ?.getAttribute('aria-busy'),
    ).to.equal('true');
  });

  it('announces the result count', async () => {
    const el = await openPalette();
    await type(el, 'issue');
    expect(
      el.shadowRoot?.querySelector('[role="status"]')?.textContent?.trim(),
    ).to.equal('3 results');
  });

  it('opens and closes with its shortcut, but not while typing in another field', async () => {
    const el = fixtureSync<CommandPalette>(
      html`<wc-command-palette shortcut="ctrl+k"></wc-command-palette>`,
    );
    await el.updateComplete;
    const other = document.createElement('input');
    document.body.append(other);
    try {
      other.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'k',
          ctrlKey: true,
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      );
      await el.updateComplete;
      expect(el.open).to.be.false;

      const press = new KeyboardEvent('keydown', {
        key: 'k',
        ctrlKey: true,
        bubbles: true,
        composed: true,
        cancelable: true,
      });
      document.body.dispatchEvent(press);
      await el.updateComplete;
      expect(el.open).to.be.true;
      expect(press.defaultPrevented).to.be.true;

      // In the palette's own field, the shortcut closes it.
      await key(el, 'x');
      input(el).dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'k',
          ctrlKey: true,
          bubbles: true,
          composed: true,
          cancelable: true,
        }),
      );
      await el.updateComplete;
      expect(el.open).to.be.false;
    } finally {
      other.remove();
    }
  });

  it('matches shortcuts with mod as Command on Apple platforms and Ctrl elsewhere', () => {
    const ctrlK = new KeyboardEvent('keydown', { key: 'k', ctrlKey: true });
    const metaK = new KeyboardEvent('keydown', { key: 'k', metaKey: true });
    const ctrlShiftP = new KeyboardEvent('keydown', {
      key: 'P',
      ctrlKey: true,
      shiftKey: true,
    });
    expect(matchesShortcut(ctrlK, 'mod+k', false)).to.be.true;
    expect(matchesShortcut(metaK, 'mod+k', false)).to.be.false;
    expect(matchesShortcut(metaK, 'mod+k', true)).to.be.true;
    expect(matchesShortcut(ctrlK, 'mod+k', true)).to.be.false;
    expect(matchesShortcut(ctrlShiftP, 'ctrl+shift+p')).to.be.true;
    expect(matchesShortcut(ctrlShiftP, 'ctrl+p')).to.be.false;
    expect(matchesShortcut(ctrlK, 'hyper+k')).to.be.false;
  });
});

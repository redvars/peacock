/// <reference types="mocha" />
import { html } from 'lit';
import { fixtureSync, expect, waitUntil } from '@open-wc/testing';
import {
  Tree,
  TreeItem,
  type TreeChangeDetail,
  type TreeItemEventDetail,
} from '../src/tree/index.js';

if (!customElements.get('wc-tree')) customElements.define('wc-tree', Tree);
if (!customElements.get('wc-tree-item')) {
  customElements.define('wc-tree-item', TreeItem);
}

function press(
  target: Element,
  key: string,
  init: { shiftKey?: boolean } = {},
) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    composed: true,
    cancelable: true,
    ...init,
  });
  target.dispatchEvent(event);
  return event;
}

/** Lets the tree's mutation observer run, then waits for every pending update. */
async function settle(el: Tree) {
  for (let round = 0; round < 3; round += 1) {
    // eslint-disable-next-line no-await-in-loop
    await Promise.resolve();
    // eslint-disable-next-line no-await-in-loop
    await el.updateComplete;
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(el.items.map(item => item.updateComplete));
  }
}

async function mount(template: ReturnType<typeof html>) {
  const el = fixtureSync<Tree>(template);
  await settle(el);
  const get = (value: string) =>
    el.querySelector<TreeItem>(`wc-tree-item[value="${value}"]`) as TreeItem;
  return { el, get };
}

function files(selection = 'none', value = '') {
  return mount(html`
    <wc-tree label="Files" selection=${selection} value=${value}>
      <wc-tree-item value="src" label="src">
        <wc-tree-item value="app" label="app.ts"></wc-tree-item>
        <wc-tree-item value="lib" label="lib">
          <wc-tree-item value="util" label="util.ts"></wc-tree-item>
        </wc-tree-item>
        <wc-tree-item value="avatar" label="avatar.ts"></wc-tree-item>
      </wc-tree-item>
      <wc-tree-item value="docs" label="docs">
        <wc-tree-item value="guide" label="guide.md"></wc-tree-item>
      </wc-tree-item>
      <wc-tree-item value="readme" label="README.md"></wc-tree-item>
      <wc-tree-item value="locked" label="locked.txt" disabled></wc-tree-item>
    </wc-tree>
  `);
}

function events<T>(el: Element, type: string) {
  const seen: CustomEvent<T>[] = [];
  el.addEventListener(type, e => seen.push(e as CustomEvent<T>));
  return seen;
}

function focusin(item: TreeItem) {
  item.focus();
  item.dispatchEvent(
    new FocusEvent('focusin', { bubbles: true, composed: true }),
  );
}

function row(item: TreeItem) {
  return item.shadowRoot?.querySelector('.row') as HTMLElement;
}

function expander(item: TreeItem) {
  return item.shadowRoot?.querySelector('.expander') as HTMLElement;
}

describe('wc-tree', () => {
  describe('ARIA', () => {
    it('sets tree, treeitem, level, size, position and expanded', async () => {
      const { el, get } = await files();
      expect(el.getAttribute('role')).to.equal('tree');
      expect(el.getAttribute('aria-label')).to.equal('Files');
      expect(el.hasAttribute('aria-multiselectable')).to.equal(false);

      const src = get('src');
      expect(src.getAttribute('role')).to.equal('treeitem');
      expect(src.getAttribute('aria-level')).to.equal('1');
      expect(src.getAttribute('aria-setsize')).to.equal('4');
      expect(src.getAttribute('aria-posinset')).to.equal('1');
      expect(src.getAttribute('aria-expanded')).to.equal('false');

      const util = get('util');
      expect(util.getAttribute('aria-level')).to.equal('3');
      expect(util.getAttribute('aria-setsize')).to.equal('1');
      expect(get('lib').getAttribute('aria-posinset')).to.equal('2');
      expect(get('readme').hasAttribute('aria-expanded')).to.equal(false);
      expect(get('locked').getAttribute('aria-disabled')).to.equal('true');

      const group = src.shadowRoot?.querySelector('[role="group"]');
      expect(group).to.exist;
      expect(group?.hasAttribute('hidden')).to.equal(true);
      // No selection state in "none".
      expect(src.hasAttribute('aria-selected')).to.equal(false);
      expect(src.hasAttribute('aria-checked')).to.equal(false);
    });

    it('indents by level through a custom property', async () => {
      const { get } = await files();
      expect(
        row(get('util')).style.getPropertyValue('--_level').trim(),
      ).to.equal('3');
    });

    it('has one tab stop', async () => {
      const { el, get } = await files();
      const stops = el.items.filter(item => item.tabIndex === 0);
      expect(stops).to.deep.equal([get('src')]);
    });
  });

  describe('keyboard', () => {
    it('moves with Up, Down, Home and End over visible items', async () => {
      const { el, get } = await files();
      const src = get('src');
      focusin(src);
      press(src, 'ArrowDown');
      expect(document.activeElement).to.equal(get('docs'));
      press(get('docs'), 'ArrowDown');
      expect(document.activeElement).to.equal(get('readme'));
      // The disabled item is skipped, and moving does not wrap.
      press(get('readme'), 'ArrowDown');
      expect(document.activeElement).to.equal(get('readme'));
      press(get('readme'), 'Home');
      expect(document.activeElement).to.equal(src);
      press(src, 'End');
      expect(document.activeElement).to.equal(get('readme'));
      press(get('readme'), 'ArrowUp');
      expect(document.activeElement).to.equal(get('docs'));
      expect(el.items.filter(item => item.tabIndex === 0)).to.deep.equal([
        get('docs'),
      ]);
    });

    it('Right expands, then moves to the first child; Left collapses, then moves to the parent', async () => {
      const { el, get } = await files();
      const src = get('src');
      const expanded = events<TreeItemEventDetail>(el, 'expand');
      const collapsed = events<TreeItemEventDetail>(el, 'collapse');
      focusin(src);

      press(src, 'ArrowRight');
      await settle(el);
      expect(src.expanded).to.equal(true);
      expect(src.getAttribute('aria-expanded')).to.equal('true');
      expect(document.activeElement).to.equal(src);
      expect(expanded).to.have.length(1);
      expect(expanded[0].detail.value).to.equal('src');
      expect(expanded[0].detail.item).to.equal(src);
      expect(expanded[0].target).to.equal(src);

      press(src, 'ArrowRight');
      expect(document.activeElement).to.equal(get('app'));
      // Right on a leaf does nothing.
      press(get('app'), 'ArrowRight');
      expect(document.activeElement).to.equal(get('app'));

      press(get('app'), 'ArrowLeft');
      expect(document.activeElement).to.equal(src);
      press(src, 'ArrowLeft');
      await settle(el);
      expect(src.expanded).to.equal(false);
      expect(collapsed).to.have.length(1);
      expect(collapsed[0].detail.value).to.equal('src');
    });

    it('Down walks into expanded items', async () => {
      const { el, get } = await files();
      get('src').expanded = true;
      await settle(el);
      focusin(get('src'));
      press(get('src'), 'ArrowDown');
      expect(document.activeElement).to.equal(get('app'));
      press(get('app'), 'ArrowDown');
      press(get('lib'), 'ArrowDown');
      expect(document.activeElement).to.equal(get('avatar'));
      press(get('avatar'), 'ArrowDown');
      expect(document.activeElement).to.equal(get('docs'));
    });

    it('collapsing moves focus from a descendant to the collapsed item', async () => {
      const { el, get } = await files();
      get('src').expanded = true;
      await settle(el);
      focusin(get('app'));
      expect(get('app').tabIndex).to.equal(0);
      press(get('app'), 'ArrowLeft');
      press(get('src'), 'ArrowLeft');
      await settle(el);
      expect(get('src').tabIndex).to.equal(0);
      expect(get('app').tabIndex).to.equal(-1);
    });

    it('mirrors Left and Right in right-to-left', async () => {
      const { el, get } = await files();
      el.setAttribute('dir', 'rtl');
      const src = get('src');
      focusin(src);
      press(src, 'ArrowRight');
      expect(src.expanded).to.equal(false);
      press(src, 'ArrowLeft');
      await settle(el);
      expect(src.expanded).to.equal(true);
      press(src, 'ArrowLeft');
      expect(document.activeElement).to.equal(get('app'));
      press(get('app'), 'ArrowRight');
      expect(document.activeElement).to.equal(src);
    });

    it('* expands every sibling', async () => {
      const { el, get } = await files();
      const expanded = events<TreeItemEventDetail>(el, 'expand');
      focusin(get('readme'));
      press(get('readme'), '*', { shiftKey: true });
      await settle(el);
      expect(get('src').expanded).to.equal(true);
      expect(get('docs').expanded).to.equal(true);
      expect(get('lib').expanded).to.equal(false);
      expect(expanded.map(e => e.detail.value)).to.deep.equal(['src', 'docs']);
      expect(document.activeElement).to.equal(get('readme'));
    });

    it('typeahead moves to the next item whose label starts with the letter', async () => {
      const { el, get } = await files();
      get('src').expanded = true;
      await settle(el);
      focusin(get('src'));
      press(get('src'), 'a');
      expect(document.activeElement).to.equal(get('app'));
      press(get('app'), 'a');
      expect(document.activeElement).to.equal(get('avatar'));
      press(get('avatar'), 'r');
      // "aar" matches nothing, so focus stays; the buffer resets after 500 ms.
      expect(document.activeElement).to.equal(get('avatar'));
    });

    it('Enter fires activate, which toggles an item with children unless canceled', async () => {
      const { el, get } = await files();
      const activated = events<TreeItemEventDetail>(el, 'activate');
      focusin(get('readme'));
      press(get('readme'), 'Enter');
      expect(activated.map(e => e.detail.value)).to.deep.equal(['readme']);

      const src = get('src');
      press(src, 'Enter');
      await settle(el);
      expect(src.expanded).to.equal(true);

      el.addEventListener('activate', e => e.preventDefault(), { once: true });
      press(src, 'Enter');
      await settle(el);
      expect(src.expanded).to.equal(true);
      expect(activated).to.have.length(3);
    });

    it('double-click activates', async () => {
      const { el, get } = await files();
      const activated = events<TreeItemEventDetail>(el, 'activate');
      row(get('readme')).dispatchEvent(
        new MouseEvent('dblclick', { bubbles: true, composed: true }),
      );
      expect(activated.map(e => e.detail.value)).to.deep.equal(['readme']);
    });

    it('ignores keys from slotted actions', async () => {
      const { el } = await mount(html`
        <wc-tree label="Files">
          <wc-tree-item value="a" label="a"
            ><button slot="end">Delete</button></wc-tree-item
          >
        </wc-tree>
      `);
      const activated = events<TreeItemEventDetail>(el, 'activate');
      const button = el.querySelector('button') as HTMLButtonElement;
      press(button, 'Enter');
      button.click();
      expect(activated).to.have.length(0);
    });
  });

  describe('selection="single"', () => {
    it('selects on click and follows focus', async () => {
      const { el, get } = await files('single');
      const changes = events<TreeChangeDetail>(el, 'change');
      expect(get('src').getAttribute('aria-selected')).to.equal('false');

      row(get('docs')).click();
      await settle(el);
      expect(el.value).to.equal('docs');
      expect(el.values).to.deep.equal(['docs']);
      expect(get('docs').selected).to.equal(true);
      expect(get('docs').getAttribute('aria-selected')).to.equal('true');
      expect(changes.map(e => e.detail)).to.deep.equal([{ value: 'docs' }]);

      press(get('docs'), 'ArrowDown');
      await settle(el);
      expect(el.value).to.equal('readme');
      expect(get('docs').selected).to.equal(false);
      expect(changes).to.have.length(2);

      // Space keeps the selection: no change event.
      press(get('readme'), ' ');
      expect(changes).to.have.length(2);
    });

    it('reflects an outside value and moves the tab stop to it', async () => {
      const { el, get } = await files('single', 'readme');
      expect(get('readme').selected).to.equal(true);
      expect(get('readme').tabIndex).to.equal(0);
      el.value = 'docs';
      await settle(el);
      expect(get('docs').selected).to.equal(true);
      expect(get('readme').selected).to.equal(false);
      expect(get('docs').tabIndex).to.equal(0);
    });

    it('clicking the expander toggles without selecting', async () => {
      const { el, get } = await files('single');
      expander(get('src')).click();
      await settle(el);
      expect(get('src').expanded).to.equal(true);
      expect(el.value).to.equal('');
      expander(get('src')).click();
      await settle(el);
      expect(get('src').expanded).to.equal(false);
    });

    it('ignores disabled items', async () => {
      const { el, get } = await files('single');
      row(get('locked')).click();
      await settle(el);
      expect(el.value).to.equal('');
    });
  });

  describe('selection="multiple"', () => {
    function permissions(value = '') {
      return mount(html`
        <wc-tree label="Permissions" selection="multiple" value=${value}>
          <wc-tree-item value="users" label="Users" expanded>
            <wc-tree-item value="users.read" label="Read"></wc-tree-item>
            <wc-tree-item value="users.write" label="Write"></wc-tree-item>
          </wc-tree-item>
          <wc-tree-item value="billing" label="Billing" expanded>
            <wc-tree-item value="billing.read" label="Read"></wc-tree-item>
            <wc-tree-item
              value="billing.admin"
              label="Admin"
              disabled
            ></wc-tree-item>
          </wc-tree-item>
        </wc-tree>
      `);
    }

    it('marks the tree multiselectable and items with aria-checked', async () => {
      const { el, get } = await permissions();
      expect(el.getAttribute('aria-multiselectable')).to.equal('true');
      expect(get('users').getAttribute('aria-checked')).to.equal('false');
      expect(get('users').hasAttribute('aria-selected')).to.equal(false);
      const checkbox = get('users').shadowRoot?.querySelector('.checkbox');
      expect(checkbox?.getAttribute('name')).to.equal(
        'check_box_outline_blank',
      );
    });

    it('checking a parent checks its descendants', async () => {
      const { el, get } = await permissions();
      const changes = events<TreeChangeDetail>(el, 'change');
      row(get('users')).click();
      await settle(el);
      expect(el.values).to.deep.equal(['users', 'users.read', 'users.write']);
      expect(el.value).to.equal('users,users.read,users.write');
      expect(get('users.read').getAttribute('aria-checked')).to.equal('true');
      expect(changes[0].detail).to.deep.equal({
        value: 'users,users.read,users.write',
        values: ['users', 'users.read', 'users.write'],
      });

      row(get('users')).click();
      await settle(el);
      expect(el.values).to.deep.equal([]);
      expect(changes).to.have.length(2);
    });

    it('a parent is indeterminate when some children are checked, checked when all are', async () => {
      const { el, get } = await permissions();
      const users = get('users');
      focusin(get('users.read'));
      press(get('users.read'), ' ');
      await settle(el);
      expect(el.values).to.deep.equal(['users.read']);
      expect(users.getAttribute('aria-checked')).to.equal('mixed');
      expect(
        users.shadowRoot?.querySelector('.checkbox')?.getAttribute('name'),
      ).to.equal('indeterminate_check_box');

      press(get('users.read'), 'ArrowDown');
      // Focus does not change the selection in a multi-select tree.
      expect(el.values).to.deep.equal(['users.read']);
      press(get('users.write'), ' ');
      await settle(el);
      expect(el.values).to.deep.equal(['users', 'users.read', 'users.write']);
      expect(users.getAttribute('aria-checked')).to.equal('true');

      // Unchecking a child unchecks its ancestors.
      press(get('users.write'), ' ');
      await settle(el);
      expect(el.values).to.deep.equal(['users.read']);
      expect(users.getAttribute('aria-checked')).to.equal('mixed');
    });

    it('a mixed parent becomes checked when toggled', async () => {
      const { el, get } = await permissions('users.read');
      expect(get('users').getAttribute('aria-checked')).to.equal('mixed');
      row(get('users')).click();
      await settle(el);
      expect(el.values).to.deep.equal(['users', 'users.read', 'users.write']);
    });

    it('normalizes an outside value: a listed parent checks its children', async () => {
      const { el, get } = await permissions('users');
      expect(el.values).to.deep.equal(['users', 'users.read', 'users.write']);
      expect(get('users.write').selected).to.equal(true);
      el.values = ['users.read', 'users.write'];
      await settle(el);
      expect(el.values).to.deep.equal(['users', 'users.read', 'users.write']);
    });

    it('skips disabled children in the cascade and the parent state', async () => {
      const { el, get } = await permissions();
      row(get('billing')).click();
      await settle(el);
      expect(el.values).to.deep.equal(['billing', 'billing.read']);
      expect(get('billing.admin').selected).to.equal(false);
      expect(get('billing').getAttribute('aria-checked')).to.equal('true');
    });

    it('keeps values of items that are not loaded yet', async () => {
      const { el } = await permissions('later');
      expect(el.values).to.deep.equal(['later']);
    });
  });

  describe('lazy loading', () => {
    it('shows an expander, fires expand and shows loading until children arrive', async () => {
      const { el, get } = await mount(html`
        <wc-tree label="Files">
          <wc-tree-item
            value="remote"
            label="remote"
            has-children
          ></wc-tree-item>
        </wc-tree>
      `);
      const remote = get('remote');
      expect(remote.getAttribute('aria-expanded')).to.equal('false');
      expect(expander(remote).hasAttribute('data-leaf')).to.equal(false);

      const expanded = events<TreeItemEventDetail>(el, 'expand');
      focusin(remote);
      press(remote, 'ArrowRight');
      await settle(el);
      expect(expanded).to.have.length(1);
      expect(remote.loading).to.equal(true);
      expect(remote.getAttribute('aria-busy')).to.equal('true');
      expect(
        remote.shadowRoot?.querySelector('.loading')?.textContent?.trim(),
      ).to.equal('Loading…');
      // Right while loading has no child to move to.
      press(remote, 'ArrowRight');
      expect(document.activeElement).to.equal(remote);

      const child = document.createElement('wc-tree-item') as TreeItem;
      child.value = 'remote/a';
      child.label = 'a.ts';
      remote.append(child);
      await waitUntil(() => !remote.loading, 'loading cleared');
      await settle(el);
      expect(remote.hasAttribute('aria-busy')).to.equal(false);
      expect(child.getAttribute('aria-level')).to.equal('2');
      press(remote, 'ArrowRight');
      expect(document.activeElement).to.equal(child);
    });
  });

  describe('dynamic items', () => {
    it('updates levels, positions and the tab stop when items are added or removed', async () => {
      const { el, get } = await files();
      const extra = document.createElement('wc-tree-item') as TreeItem;
      extra.value = 'extra';
      extra.label = 'extra';
      el.append(extra);
      await waitUntil(
        () => extra.getAttribute('aria-posinset') === '5',
        'new item positioned',
      );
      expect(get('src').getAttribute('aria-setsize')).to.equal('5');

      get('src').remove();
      await waitUntil(
        () => get('docs').getAttribute('aria-setsize') === '4',
        'set size updated',
      );
      expect(get('docs').getAttribute('aria-posinset')).to.equal('1');
      expect(get('docs').tabIndex).to.equal(0);
    });

    it('gives an item an expander once children are added', async () => {
      const { el, get } = await files();
      const readme = get('readme');
      expect(expander(readme).hasAttribute('data-leaf')).to.equal(true);
      const child = document.createElement('wc-tree-item') as TreeItem;
      child.label = 'section';
      readme.append(child);
      await waitUntil(
        () => readme.getAttribute('aria-expanded') === 'false',
        'became a branch',
      );
      await settle(el);
      expect(expander(readme).hasAttribute('data-leaf')).to.equal(false);
      // Without a value, the label is the value.
      expect(child.itemValue).to.equal('section');
    });

    it('leaves out hidden items', async () => {
      const { el, get } = await files();
      get('docs').hidden = true;
      await waitUntil(
        () => get('readme').getAttribute('aria-posinset') === '2',
        'positions updated',
      );
      expect(el.visibleItems).to.not.include(get('docs'));
    });
  });
});

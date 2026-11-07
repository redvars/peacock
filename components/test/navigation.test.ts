/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import {
  NavigationBar,
  NavigationBarItem,
} from '../src/navigation-bar/index.js';
import {
  NavigationDrawer,
  NavigationDrawerGroup,
  NavigationDrawerItem,
} from '../src/navigation-drawer/index.js';
import {
  NavigationRail,
  NavigationRailItem,
} from '../src/navigation-rail/index.js';

for (const [tag, element] of [
  ['wc-navigation-bar', NavigationBar],
  ['wc-navigation-bar-item', NavigationBarItem],
  ['wc-navigation-drawer', NavigationDrawer],
  ['wc-navigation-drawer-item', NavigationDrawerItem],
  ['wc-navigation-drawer-group', NavigationDrawerGroup],
  ['wc-navigation-rail', NavigationRail],
  ['wc-navigation-rail-item', NavigationRailItem],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

type ChangeEvent = CustomEvent<{
  value: string | undefined;
  index: number;
  item: HTMLElement;
}>;

function innerItem(item: HTMLElement) {
  return item.shadowRoot!.querySelector('#item') as HTMLElement;
}

/** A container with a current item `a` and an item `b`. */
function buildContainer(container: string, itemTag: string) {
  const host = document.createElement(container);
  host.toggleAttribute('open', true);
  for (const value of ['a', 'b']) {
    const item = document.createElement(itemTag);
    item.setAttribute('value', value);
    item.toggleAttribute('current', value === 'a');
    item.textContent = value.toUpperCase();
    host.append(item);
  }
  return host;
}

describe('Navigation containers', () => {
  for (const [container, itemTag] of [
    ['wc-navigation-bar', 'wc-navigation-bar-item'],
    ['wc-navigation-rail', 'wc-navigation-rail-item'],
    ['wc-navigation-drawer', 'wc-navigation-drawer-item'],
  ] as const) {
    it(`${container} fires change with { value, index, item } and moves aria-current`, async () => {
      const host = await fixture<HTMLElement>(
        html`<div>${buildContainer(container, itemTag)}</div>`,
      ).then(wrapper => wrapper.firstElementChild as HTMLElement);
      const [a, b] = Array.from(
        host.querySelectorAll<NavigationBarItem | NavigationDrawerItem>(
          itemTag,
        ),
      );
      await a.updateComplete;
      expect(innerItem(a).getAttribute('aria-current')).to.equal('page');
      expect(innerItem(b).hasAttribute('aria-current')).to.be.false;

      setTimeout(() => b.click());
      const event = (await oneEvent(host, 'change')) as ChangeEvent;
      expect(event.detail.value).to.equal('b');
      expect(event.detail.index).to.equal(1);
      expect(event.detail.item).to.equal(b);
      expect(event.bubbles && event.composed).to.be.true;

      await b.updateComplete;
      expect(b.current).to.be.true;
      expect(a.current).to.be.false;
      expect(innerItem(b).getAttribute('aria-current')).to.equal('page');
      expect(innerItem(a).hasAttribute('aria-current')).to.be.false;
    });
  }
});

describe('NavigationBar', () => {
  it('is a navigation landmark and ignores disabled items', async () => {
    const el = await fixture<NavigationBar>(html`
      <wc-navigation-bar>
        <wc-navigation-bar-item value="home" current
          >Home</wc-navigation-bar-item
        >
        <wc-navigation-bar-item value="off" disabled
          >Off</wc-navigation-bar-item
        >
      </wc-navigation-bar>
    `);
    expect(el.getAttribute('role')).to.equal('navigation');
    const off = el.querySelector<NavigationBarItem>('[value="off"]')!;
    off.click();
    expect(off.current).to.be.false;
  });

  it('bar items have no rail-only collapsed property', async () => {
    const item = await fixture<NavigationBarItem>(
      html`<wc-navigation-bar-item>Home</wc-navigation-bar-item>`,
    );
    expect('collapsed' in item).to.be.false;
  });

  it('shows the badge on the icon', async () => {
    const item = await fixture<NavigationBarItem>(
      html`<wc-navigation-bar-item badge="3">Mail</wc-navigation-bar-item>`,
    );
    const badge = item.shadowRoot!.querySelector<HTMLElement>('.badge')!;
    expect(badge.hidden).to.be.false;
    expect(badge.textContent).to.contain('3');
  });
});

describe('NavigationRail', () => {
  it('no longer fires the removed nav-change', async () => {
    const el = await fixture<NavigationRail>(html`
      <wc-navigation-rail>
        <wc-navigation-rail-item value="a">A</wc-navigation-rail-item>
        <wc-navigation-rail-item value="b">B</wc-navigation-rail-item>
      </wc-navigation-rail>
    `);
    let navChanges = 0;
    el.addEventListener('nav-change', () => {
      navChanges += 1;
    });
    const b = el.querySelector<NavigationRailItem>('[value="b"]')!;
    setTimeout(() => b.click());
    const event = (await oneEvent(el, 'change')) as ChangeEvent;
    expect(event.detail).to.include({ value: 'b', index: 1, item: b });
    expect(navChanges).to.equal(0);
  });

  it('collapses item labels in collapsed mode', async () => {
    const el = await fixture<NavigationRail>(html`
      <wc-navigation-rail mode="collapsed">
        <wc-navigation-rail-item>A</wc-navigation-rail-item>
      </wc-navigation-rail>
    `);
    const item = el.querySelector<NavigationRailItem>(
      'wc-navigation-rail-item',
    )!;
    await item.updateComplete;
    expect(item.collapsed).to.be.true;
    expect(
      item.shadowRoot!.querySelector('.label')!.classList.contains('hidden'),
    ).to.be.true;
  });

  it('links the disabled reason with aria-describedby', async () => {
    const item = await fixture<NavigationRailItem>(
      html`<wc-navigation-rail-item disabled disabled-reason="No access"
        >A</wc-navigation-rail-item
      >`,
    );
    const button = innerItem(item);
    const id = button.getAttribute('aria-describedby')!;
    expect(item.shadowRoot!.getElementById(id)?.textContent).to.contain(
      'No access',
    );
  });
});

describe('NavigationDrawer', () => {
  it('shows a standard drawer only while open', async () => {
    const el = await fixture<NavigationDrawer>(html`
      <wc-navigation-drawer headline="Mail">
        <wc-navigation-drawer-item>Inbox</wc-navigation-drawer-item>
      </wc-navigation-drawer>
    `);
    expect(getComputedStyle(el).display).to.equal('none');

    el.open = true;
    await el.updateComplete;
    expect(getComputedStyle(el).display).to.equal('block');
    expect(el.shadowRoot!.querySelector('.headline')?.textContent).to.equal(
      'Mail',
    );
  });

  it('opens a modal drawer as a dialog and closes it after a choice', async () => {
    const el = await fixture<NavigationDrawer>(html`
      <wc-navigation-drawer variant="modal">
        <wc-navigation-drawer-item value="inbox"
          >Inbox</wc-navigation-drawer-item
        >
      </wc-navigation-drawer>
    `);
    const dialog = el.shadowRoot!.querySelector('dialog')!;
    expect(dialog.open).to.be.false;

    setTimeout(() => el.show());
    await oneEvent(el, 'open');
    expect(dialog.open).to.be.true;

    setTimeout(() =>
      el
        .querySelector<NavigationDrawerItem>('wc-navigation-drawer-item')!
        .click(),
    );
    await oneEvent(el, 'close');
    expect(el.open).to.be.false;
    expect(dialog.open).to.be.false;
  });

  it('renders items as links when href is set', async () => {
    const item = await fixture<NavigationDrawerItem>(html`
      <wc-navigation-drawer-item href="/inbox" badge="3"
        >Inbox</wc-navigation-drawer-item
      >
    `);
    const link = item.shadowRoot!.querySelector('a');
    expect(link?.getAttribute('href')).to.equal('/inbox');
    expect(item.shadowRoot!.querySelector('.badge')?.textContent).to.contain(
      '3',
    );
  });

  it('renders a disabled item with href as a disabled button', async () => {
    const item = await fixture<NavigationDrawerItem>(html`
      <wc-navigation-drawer-item href="/inbox" disabled
        >Inbox</wc-navigation-drawer-item
      >
    `);
    expect(item.shadowRoot!.querySelector('a')).to.be.null;
    expect(item.shadowRoot!.querySelector('button')!.disabled).to.be.true;
  });
});

describe('NavigationDrawerGroup', () => {
  async function drawerWithGroup() {
    const el = await fixture<NavigationDrawer>(html`
      <wc-navigation-drawer open>
        <wc-navigation-drawer-item value="home">Home</wc-navigation-drawer-item>
        <wc-navigation-drawer-group>
          <span slot="label">Analytics</span>
          <wc-navigation-drawer-item value="overview"
            >Overview</wc-navigation-drawer-item
          >
          <wc-navigation-drawer-item value="reports"
            >Reports</wc-navigation-drawer-item
          >
        </wc-navigation-drawer-group>
      </wc-navigation-drawer>
    `);
    const group = el.querySelector<NavigationDrawerGroup>(
      'wc-navigation-drawer-group',
    )!;
    await group.updateComplete;
    return { el, group };
  }

  it('is a disclosure: a button with aria-expanded and aria-controls', async () => {
    const { group } = await drawerWithGroup();
    const header = group.shadowRoot!.querySelector('#header')!;
    const items = group.shadowRoot!.querySelector<HTMLElement>('#items')!;

    expect(header.tagName).to.equal('BUTTON');
    expect(header.getAttribute('aria-expanded')).to.equal('false');
    expect(header.getAttribute('aria-controls')).to.equal('items');
    expect(items.hidden).to.be.true;

    (header as HTMLButtonElement).click();
    await group.updateComplete;
    expect(group.expanded).to.be.true;
    expect(header.getAttribute('aria-expanded')).to.equal('true');
    expect(items.hidden).to.be.false;
  });

  it('fires non-bubbling open and close, which the drawer does not re-fire', async () => {
    const { el, group } = await drawerWithGroup();
    const header =
      group.shadowRoot!.querySelector<HTMLButtonElement>('#header')!;
    let drawerEvents = 0;
    el.addEventListener('close', () => {
      drawerEvents += 1;
    });
    el.addEventListener('open', () => {
      drawerEvents += 1;
    });

    setTimeout(() => header.click());
    await oneEvent(group, 'open');
    setTimeout(() => header.click());
    const close = (await oneEvent(group, 'close')) as CustomEvent<{
      reason: string;
    }>;
    expect(close.detail.reason).to.equal('action');
    expect(drawerEvents).to.equal(0);
    expect(el.open).to.be.true;
  });

  it('makes a grouped item current and counts it in the drawer index', async () => {
    const { el, group } = await drawerWithGroup();
    group.expanded = true;
    await group.updateComplete;
    const reports =
      el.querySelector<NavigationDrawerItem>('[value="reports"]')!;

    setTimeout(() => reports.click());
    const event = (await oneEvent(el, 'change')) as ChangeEvent;
    expect(event.detail).to.include({ value: 'reports', index: 2 });
    await reports.updateComplete;
    expect(innerItem(reports).getAttribute('aria-current')).to.equal('page');
  });

  it('does not change the current item when the header is clicked', async () => {
    const { el, group } = await drawerWithGroup();
    let changes = 0;
    el.addEventListener('change', () => {
      changes += 1;
    });
    group.shadowRoot!.querySelector<HTMLButtonElement>('#header')!.click();
    expect(changes).to.equal(0);
  });

  it('expands when it holds the current item', async () => {
    const el = await fixture<NavigationDrawerGroup>(html`
      <wc-navigation-drawer-group>
        <span slot="label">Analytics</span>
        <wc-navigation-drawer-item current>Overview</wc-navigation-drawer-item>
      </wc-navigation-drawer-group>
    `);
    await el.updateComplete;
    expect(el.expanded).to.be.true;
  });

  it('does not toggle while disabled', async () => {
    const el = await fixture<NavigationDrawerGroup>(html`
      <wc-navigation-drawer-group disabled>
        <span slot="label">Analytics</span>
        <wc-navigation-drawer-item>Overview</wc-navigation-drawer-item>
      </wc-navigation-drawer-group>
    `);
    el.shadowRoot!.querySelector<HTMLButtonElement>('#header')!.click();
    await el.updateComplete;
    expect(el.expanded).to.be.false;
  });
});

/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import {
  NavigationBar,
  NavigationBarItem,
} from '../src/navigation-bar/index.js';
import {
  NavigationDrawer,
  NavigationDrawerItem,
} from '../src/navigation-drawer/index.js';

for (const [tag, element] of [
  ['wc-navigation-bar', NavigationBar],
  ['wc-navigation-bar-item', NavigationBarItem],
  ['wc-navigation-drawer', NavigationDrawer],
  ['wc-navigation-drawer-item', NavigationDrawerItem],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

describe('NavigationBar', () => {
  it('activates the clicked item and fires change', async () => {
    const el = await fixture<NavigationBar>(html`
      <wc-navigation-bar>
        <wc-navigation-bar-item value="home" active
          >Home</wc-navigation-bar-item
        >
        <wc-navigation-bar-item value="search">Search</wc-navigation-bar-item>
      </wc-navigation-bar>
    `);
    const [home, search] = Array.from(
      el.querySelectorAll<NavigationBarItem>('wc-navigation-bar-item'),
    );

    expect(el.getAttribute('role')).to.equal('navigation');

    setTimeout(() => search.click());
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
      index: number;
    }>;

    expect(event.detail).to.include({ value: 'search', index: 1 });
    expect(search.active).to.be.true;
    expect(home.active).to.be.false;
  });

  it('ignores disabled items', async () => {
    const el = await fixture<NavigationBar>(html`
      <wc-navigation-bar>
        <wc-navigation-bar-item value="home" active
          >Home</wc-navigation-bar-item
        >
        <wc-navigation-bar-item value="off" disabled
          >Off</wc-navigation-bar-item
        >
      </wc-navigation-bar>
    `);
    const off = el.querySelector<NavigationBarItem>('[value="off"]')!;
    off.click();
    expect(off.active).to.be.false;
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

  it('activates the clicked item and fires change', async () => {
    const el = await fixture<NavigationDrawer>(html`
      <wc-navigation-drawer open>
        <wc-navigation-drawer-item value="inbox" active
          >Inbox</wc-navigation-drawer-item
        >
        <wc-navigation-drawer-item value="sent">Sent</wc-navigation-drawer-item>
      </wc-navigation-drawer>
    `);
    const sent = el.querySelector<NavigationDrawerItem>('[value="sent"]')!;

    setTimeout(() => sent.click());
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;

    expect(event.detail.value).to.equal('sent');
    expect(sent.active).to.be.true;
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
});

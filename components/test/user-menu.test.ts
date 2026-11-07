/// <reference types="mocha" />
import { html } from 'lit';
import { fixtureSync, expect } from '@open-wc/testing';
import { Item } from '../src/item/index.js';
import { Menu, MenuItem } from '../src/menu/index.js';
import { UserMenu } from '../src/user-menu/index.js';

const DEFINITIONS: [string, typeof HTMLElement][] = [
  ['wc-item', Item],
  ['wc-menu', Menu],
  ['wc-menu-item', MenuItem],
  ['wc-user-menu', UserMenu],
];
for (const [tag, ctor] of DEFINITIONS) {
  if (!customElements.get(tag)) customElements.define(tag, ctor);
}

function trigger(el: UserMenu): HTMLButtonElement {
  const found = el.shadowRoot?.querySelector<HTMLButtonElement>('.trigger');
  if (!found) throw new Error('no trigger');
  return found;
}

function menu(el: UserMenu): Menu {
  const found = el.shadowRoot?.querySelector<Menu>('wc-menu');
  if (!found) throw new Error('no menu');
  return found;
}

function themeItems(el: UserMenu): MenuItem[] {
  return Array.from(
    el.shadowRoot?.querySelectorAll<MenuItem>('wc-menu-item.theme-item') ?? [],
  );
}

async function settle(el: UserMenu) {
  await el.updateComplete;
  await menu(el).updateComplete;
  await el.updateComplete;
}

async function create(template: ReturnType<typeof html>) {
  const el = fixtureSync<UserMenu>(template);
  await settle(el);
  return el;
}

describe('UserMenu', () => {
  it('names the avatar button after the person', async () => {
    const el = await create(
      html`<wc-user-menu name="Ada Lovelace"></wc-user-menu>`,
    );
    const button = trigger(el);
    expect(button.getAttribute('aria-label')).to.equal(
      'Account menu for Ada Lovelace',
    );
    expect(button.getAttribute('aria-haspopup')).to.equal('menu');
    expect(button.getAttribute('aria-controls')).to.equal(menu(el).id);
    expect(button.querySelector('wc-avatar')?.getAttribute('name')).to.equal(
      'Ada Lovelace',
    );
  });

  it('falls back to "Account menu" without a name', async () => {
    const el = await create(html`<wc-user-menu></wc-user-menu>`);
    expect(trigger(el).getAttribute('aria-label')).to.equal('Account menu');
  });

  it('shows name, email and status in the header', async () => {
    const el = await create(
      html`<wc-user-menu
        name="Ada Lovelace"
        email="ada@example.com"
        status="away"
      ></wc-user-menu>`,
    );
    const header = el.shadowRoot?.querySelector('.header');
    expect(header?.querySelector('.name')?.textContent).to.equal(
      'Ada Lovelace',
    );
    expect(header?.querySelector('.email')?.textContent).to.equal(
      'ada@example.com',
    );
    // A presence dot on the avatar, and the status written out under the email.
    const presence = header?.querySelector('wc-presence-indicator');
    expect(presence?.getAttribute('status')).to.equal('away');
    expect(presence?.querySelector('wc-avatar')).to.exist;
    expect(header?.querySelector('.status')?.textContent).to.equal('Away');
  });

  it('lists slotted items and footer items in the menu', async () => {
    const el = await create(
      html`<wc-user-menu name="Ada" theme="light">
        <wc-menu-item>Profile</wc-menu-item>
        <wc-menu-item>Settings</wc-menu-item>
        <wc-menu-item slot="footer">Sign out</wc-menu-item>
      </wc-user-menu>`,
    );
    const labels = menu(el).items.map(item => item.typeaheadText);
    expect(labels).to.deep.equal([
      'profile',
      'settings',
      'light',
      'dark',
      'system',
      'sign out',
    ]);
  });

  it('opens and closes from the avatar button and reports open and close', async () => {
    const el = await create(
      html`<wc-user-menu name="Ada">
        <wc-menu-item>Profile</wc-menu-item>
      </wc-user-menu>`,
    );
    const events: string[] = [];
    el.addEventListener('open', event => {
      if (event.target === el) events.push('open');
    });
    el.addEventListener('close', event => {
      if (event.target === el)
        events.push(`close:${(event as CustomEvent).detail.reason}`);
    });
    trigger(el).click();
    await settle(el);
    expect(menu(el).open).to.be.true;
    expect(trigger(el).getAttribute('aria-expanded')).to.equal('true');
    el.hide();
    await settle(el);
    expect(menu(el).open).to.be.false;
    expect(events).to.deep.equal(['open', 'close:api']);
  });

  it('lets consumer item activations through and closes on them', async () => {
    const el = await create(
      html`<wc-user-menu name="Ada">
        <wc-menu-item>Profile</wc-menu-item>
      </wc-user-menu>`,
    );
    let activated = 0;
    el.addEventListener('menu-item-activate', () => {
      activated += 1;
    });
    el.show();
    await settle(el);
    el.querySelector<MenuItem>('wc-menu-item')?.click();
    await settle(el);
    expect(activated).to.equal(1);
    expect(menu(el).open).to.be.false;
  });

  it('has no theme section without theme', async () => {
    const el = await create(html`<wc-user-menu name="Ada"></wc-user-menu>`);
    expect(themeItems(el)).to.have.length(0);
    expect(el.shadowRoot?.querySelector('.section-heading')).to.be.null;
  });

  it('checks the current theme and fires theme-change on a pick', async () => {
    const el = await create(
      html`<wc-user-menu name="Ada" theme="system"></wc-user-menu>`,
    );
    const before = document.documentElement.dataset.theme;
    expect(themeItems(el).map(item => item.selected)).to.deep.equal([
      false,
      false,
      true,
    ]);
    expect(themeItems(el).every(item => item.type === 'radio')).to.be.true;
    let value = '';
    let leaked = 0;
    el.addEventListener('theme-change', event => {
      value = (event as CustomEvent).detail.value;
    });
    el.addEventListener('menu-item-activate', () => {
      leaked += 1;
    });
    el.show();
    await settle(el);
    themeItems(el)[1].click();
    await settle(el);
    expect(value).to.equal('dark');
    expect(el.theme).to.equal('dark');
    expect(leaked).to.equal(0);
    expect(themeItems(el).map(item => item.selected)).to.deep.equal([
      false,
      true,
      false,
    ]);
    // The component leaves the page theme to the app.
    expect(document.documentElement.dataset.theme).to.equal(before);
  });

  it('separates the footer from the theme section only when there is a footer', async () => {
    const withFooter = await create(
      html`<wc-user-menu theme="light">
        <wc-menu-item slot="footer">Sign out</wc-menu-item>
      </wc-user-menu>`,
    );
    const without = await create(
      html`<wc-user-menu theme="light"></wc-user-menu>`,
    );
    const dividers = (el: UserMenu) =>
      el.shadowRoot?.querySelectorAll('wc-divider').length;
    expect(dividers(withFooter)).to.equal(3);
    expect(dividers(without)).to.equal(2);
  });
});

/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixture, fixtureSync, waitUntil } from '@open-wc/testing';
import {
  SiteHeader,
  SiteNavGroup,
  SiteNavLink,
  SiteNavMenu,
} from '../src/site-header/index.js';
import type {
  SiteHeaderCloseDetail,
  SiteNavMenuCloseDetail,
} from '../src/site-header/index.js';

const elements: [string, typeof HTMLElement][] = [
  ['wc-site-header', SiteHeader],
  ['wc-site-nav-menu', SiteNavMenu],
  ['wc-site-nav-group', SiteNavGroup],
  ['wc-site-nav-link', SiteNavLink],
];
for (const [tag, element] of elements) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function part<T extends HTMLElement = HTMLElement>(
  el: HTMLElement,
  selector: string,
) {
  return el.shadowRoot!.querySelector<T>(selector);
}

const nav = html`
  <a slot="brand" href="/">Redvars</a>
  <wc-site-nav-menu id="product" label="Product" layout="columns">
    <wc-site-nav-group label="Build">
      <wc-site-nav-link id="tables" href="#tables" description="Screens"
        >Tables</wc-site-nav-link
      >
      <wc-site-nav-link id="rules" href="#rules">Rules</wc-site-nav-link>
    </wc-site-nav-group>
    <div slot="feature">News</div>
  </wc-site-nav-menu>
  <wc-site-nav-menu id="solutions" label="Solutions">
    <wc-site-nav-link id="itsm" href="#itsm">ITSM</wc-site-nav-link>
    <wc-site-nav-link id="hr" href="#hr" current>HR</wc-site-nav-link>
  </wc-site-nav-menu>
  <wc-site-nav-link id="docs" href="#docs">Docs</wc-site-nav-link>
  <button slot="actions" id="sign-in">Sign in</button>
  <button slot="end" id="account">Account</button>
`;

/** Waits for the resize observer to measure the header. */
async function header(width: number) {
  const el = fixtureSync<SiteHeader>(
    html`<wc-site-header style="width: ${width}px">${nav}</wc-site-header>`,
  );
  await el.updateComplete;
  await waitUntil(
    () => el.collapsed === width < el.collapseAt,
    'header did not measure its width',
  );
  await el.updateComplete;
  return el;
}

function menu(el: SiteHeader, id: string) {
  return el.querySelector<SiteNavMenu>(`#${id}`)!;
}

function trigger(m: SiteNavMenu) {
  return part<HTMLButtonElement>(m, '#trigger')!;
}

async function openMenu(m: SiteNavMenu) {
  trigger(m).click();
  await m.updateComplete;
}

function closeReasons(m: SiteNavMenu) {
  const reasons: string[] = [];
  m.addEventListener('close', event => {
    reasons.push((event as CustomEvent<SiteNavMenuCloseDetail>).detail.reason);
  });
  return reasons;
}

describe('SiteHeader', () => {
  describe('bar', () => {
    it('renders a banner with a named navigation landmark', async () => {
      const el = await header(1200);
      expect(part(el, 'header')).to.exist;
      expect(part(el, 'nav')!.getAttribute('aria-label')).to.equal(
        'Main navigation',
      );
      el.label = 'Site';
      await el.updateComplete;
      expect(part(el, 'nav')!.getAttribute('aria-label')).to.equal('Site');
    });

    it('shows the actions and end slots and no menu button', async () => {
      const el = await header(1200);
      expect(part(el, '.actions')!.hidden).to.be.false;
      expect(part(el, '.end')!.hidden).to.be.false;
      expect(part(el, '.menu-button')).to.be.null;
      expect(part(el, '.drawer')).to.be.null;
    });

    it('hides the end slot while it is empty', async () => {
      const el = await fixture<SiteHeader>(
        html`<wc-site-header style="width: 1200px">
          <wc-site-nav-link href="#a">A</wc-site-nav-link>
        </wc-site-header>`,
      );
      expect(part(el, '.end')!.hidden).to.be.true;
      expect(part(el, '.actions')!.hidden).to.be.true;
    });

    it('moves focus to the skip target', async () => {
      const main = document.createElement('main');
      main.id = 'main';
      document.body.append(main);
      const el = await header(1200);
      part<HTMLAnchorElement>(el, '.skip-link')!.click();
      expect(document.activeElement).to.equal(main);
      expect(main.getAttribute('tabindex')).to.equal('-1');
      main.remove();
    });

    it('finds the skip target beside it in a shadow root', async () => {
      const app = document.createElement('div');
      document.body.append(app);
      const shadow = app.attachShadow({ mode: 'open' });
      shadow.innerHTML =
        '<wc-site-header style="width: 1200px"></wc-site-header><main id="main">Content</main>';
      const el = shadow.querySelector('wc-site-header') as SiteHeader;
      await el.updateComplete;
      part<HTMLAnchorElement>(el, '.skip-link')!.click();
      expect(shadow.activeElement).to.equal(shadow.querySelector('main'));
      app.remove();
    });
  });

  describe('links', () => {
    it('marks the current page', async () => {
      const el = await header(1200);
      const hr = el.querySelector<SiteNavLink>('#hr')!;
      await hr.updateComplete;
      expect(part(hr, 'a')!.getAttribute('aria-current')).to.equal('page');
      const docs = el.querySelector<SiteNavLink>('#docs')!;
      expect(part(docs, 'a')!.hasAttribute('aria-current')).to.be.false;
    });

    it('knows whether it sits in a menu', async () => {
      const el = await header(1200);
      expect(el.querySelector('#tables')!.hasAttribute('data-in-menu')).to.be
        .true;
      expect(el.querySelector('#docs')!.hasAttribute('data-in-menu')).to.be
        .false;
    });

    it('shows a description', async () => {
      const el = await header(1200);
      const tables = el.querySelector<SiteNavLink>('#tables')!;
      expect(part(tables, '.description')!.textContent).to.equal('Screens');
    });
  });

  describe('menus', () => {
    it('opens and closes its panel from the button', async () => {
      const el = await header(1200);
      const product = menu(el, 'product');
      const panel = part(product, '.panel')!;
      expect(panel.hidden).to.be.true;
      expect(trigger(product).getAttribute('aria-expanded')).to.equal('false');
      await openMenu(product);
      expect(product.open).to.be.true;
      expect(panel.hidden).to.be.false;
      expect(trigger(product).getAttribute('aria-expanded')).to.equal('true');
      const reasons = closeReasons(product);
      await openMenu(product);
      expect(product.open).to.be.false;
      expect(reasons).to.deep.equal(['action']);
    });

    it('fires open when the person opens it', async () => {
      const el = await header(1200);
      const product = menu(el, 'product');
      let opened = 0;
      product.addEventListener('open', () => {
        opened += 1;
      });
      await openMenu(product);
      expect(opened).to.equal(1);
    });

    it('keeps one panel open at a time', async () => {
      const el = await header(1200);
      const product = menu(el, 'product');
      const solutions = menu(el, 'solutions');
      await openMenu(product);
      const reasons = closeReasons(product);
      await openMenu(solutions);
      expect(product.open).to.be.false;
      expect(solutions.open).to.be.true;
      expect(reasons).to.deep.equal(['light-dismiss']);
    });

    it('closes on Escape and gives focus back to the button', async () => {
      const el = await header(1200);
      const product = menu(el, 'product');
      await openMenu(product);
      const reasons = closeReasons(product);
      const tables = el.querySelector<SiteNavLink>('#tables')!;
      tables.focus();
      part(tables, 'a')!.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          composed: true,
        }),
      );
      await product.updateComplete;
      expect(product.open).to.be.false;
      expect(reasons).to.deep.equal(['escape']);
      expect(product.shadowRoot!.activeElement).to.equal(trigger(product));
    });

    it('closes on a press outside', async () => {
      const el = await header(1200);
      const product = menu(el, 'product');
      await openMenu(product);
      const reasons = closeReasons(product);
      document.body.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, composed: true }),
      );
      await product.updateComplete;
      expect(product.open).to.be.false;
      expect(reasons).to.deep.equal(['light-dismiss']);
    });

    it('stays open on a press inside its panel', async () => {
      const el = await header(1200);
      const product = menu(el, 'product');
      await openMenu(product);
      el.querySelector('#rules')!.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, composed: true }),
      );
      await product.updateComplete;
      expect(product.open).to.be.true;
    });

    it('opens at its first link on Arrow Down and moves with the arrows', async () => {
      const el = await header(1200);
      const product = menu(el, 'product');
      trigger(product).focus();
      trigger(product).dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          composed: true,
        }),
      );
      await product.updateComplete;
      await waitUntil(
        () => document.activeElement?.id === 'tables',
        'first link not focused',
      );
      const tables = el.querySelector<SiteNavLink>('#tables')!;
      part(tables, 'a')!.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          composed: true,
        }),
      );
      expect(document.activeElement?.id).to.equal('rules');
      const rules = el.querySelector<SiteNavLink>('#rules')!;
      part(rules, 'a')!.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          bubbles: true,
          composed: true,
        }),
      );
      expect(document.activeElement?.id).to.equal('tables');
    });

    it('shows as current when it holds the current page', async () => {
      const el = await header(1200);
      expect(
        part(menu(el, 'solutions'), '.menu')!.classList.contains('current'),
      ).to.be.true;
      expect(part(menu(el, 'product'), '.menu')!.classList.contains('current'))
        .to.be.false;
      const tables = el.querySelector<SiteNavLink>('#tables')!;
      tables.current = true;
      await tables.updateComplete;
      await menu(el, 'product').updateComplete;
      expect(part(menu(el, 'product'), '.menu')!.classList.contains('current'))
        .to.be.true;
    });

    it('shows the feature slot only when it has content', async () => {
      const el = await header(1200);
      await openMenu(menu(el, 'product'));
      expect(part(menu(el, 'product'), '.feature')!.hidden).to.be.false;
      expect(part(menu(el, 'solutions'), '.feature')!.hidden).to.be.true;
    });

    it('close() shuts every panel', async () => {
      const el = await header(1200);
      await openMenu(menu(el, 'product'));
      el.close();
      await menu(el, 'product').updateComplete;
      expect(menu(el, 'product').open).to.be.false;
    });
  });

  describe('collapsed', () => {
    it('moves the navigation into a drawer behind a menu button', async () => {
      const el = await header(400);
      expect(el.collapsed).to.be.true;
      expect(part(el, '.bar nav')).to.be.null;
      expect(part(el, '.bar .actions')).to.be.null;
      expect(part(el, '.end')!.hidden).to.be.false;
      const button = part(el, '.menu-button')!;
      expect(button.getAttribute('aria-expanded')).to.equal('false');
      expect(part(el, '.drawer nav')).to.exist;
      expect(part(el, '.drawer-actions')!.hidden).to.be.false;
    });

    it('marks the navigation parts as collapsed', async () => {
      const el = await header(400);
      for (const id of ['product', 'solutions', 'docs', 'tables']) {
        expect(el.querySelector(`#${id}`)!.hasAttribute('data-collapsed')).to.be
          .true;
      }
    });

    it('expands the menu that holds the current page', async () => {
      const el = await header(400);
      expect(menu(el, 'solutions').open).to.be.true;
      expect(menu(el, 'product').open).to.be.false;
    });

    it('opens the drawer and closes it when a link is chosen', async () => {
      const el = await header(400);
      let opened = 0;
      const reasons: string[] = [];
      el.addEventListener('open', () => {
        opened += 1;
      });
      el.addEventListener('close', event => {
        if (event.target !== el) return;
        reasons.push(
          (event as CustomEvent<SiteHeaderCloseDetail>).detail.reason,
        );
      });
      part(el, '.menu-button')!.click();
      await el.updateComplete;
      const dialog = part<HTMLDialogElement>(el, '.drawer')!;
      expect(el.drawerOpen).to.be.true;
      expect(dialog.open).to.be.true;
      expect(opened).to.equal(1);
      const docs = el.querySelector<SiteNavLink>('#docs')!;
      part(docs, 'a')!.addEventListener('click', event =>
        event.preventDefault(),
      );
      part(docs, 'a')!.click();
      await el.updateComplete;
      expect(el.drawerOpen).to.be.false;
      expect(dialog.open).to.be.false;
      expect(reasons).to.deep.equal(['action']);
    });

    it('closes the drawer from its close button', async () => {
      const el = await header(400);
      el.showDrawer();
      await el.updateComplete;
      part(el, '.close-button')!.click();
      await el.updateComplete;
      expect(el.drawerOpen).to.be.false;
    });

    it('closes the drawer when widened past collapse-at', async () => {
      const el = await header(400);
      el.showDrawer();
      await el.updateComplete;
      el.style.width = '1200px';
      await waitUntil(() => !el.collapsed, 'header did not widen');
      await el.updateComplete;
      expect(el.drawerOpen).to.be.false;
      expect(part(el, '.drawer')).to.be.null;
      expect(menu(el, 'solutions').open).to.be.false;
      expect(el.querySelector('#docs')!.hasAttribute('data-collapsed')).to.be
        .false;
    });

    it('does not close a drawer menu on Escape', async () => {
      const el = await header(400);
      const solutions = menu(el, 'solutions');
      trigger(solutions).dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          composed: true,
        }),
      );
      await solutions.updateComplete;
      expect(solutions.open).to.be.true;
    });

    it('collapses when the bar does not fit, whatever collapse-at says', async function collapsesWhenCrowded() {
      // Two resizes and their measurements; slow when the runner throttles a background page.
      this.timeout(6000);
      const el = fixtureSync<SiteHeader>(
        html`<wc-site-header collapse-at="0" style="width: 480px">
          <a slot="brand" href="/">A very long site name</a>
          <wc-site-nav-link href="#1">Products and services</wc-site-nav-link>
          <wc-site-nav-link href="#2">Solutions for teams</wc-site-nav-link>
          <wc-site-nav-link href="#3">Documentation</wc-site-nav-link>
          <button slot="actions">Join the waitlist now</button>
        </wc-site-header>`,
      );
      await waitUntil(() => el.collapsed, 'header did not collapse');
      expect(part(el, '.menu-button')).to.exist;
      el.style.width = '1600px';
      await waitUntil(() => !el.collapsed, 'header did not widen', {
        timeout: 4000,
      });
      expect(part(el, '.bar nav')).to.exist;
    });

    it('adopts the collapsed state for parts added later', async () => {
      const el = await header(400);
      const link = document.createElement('wc-site-nav-link');
      el.append(link);
      expect(link.hasAttribute('data-collapsed')).to.be.true;
    });
  });

  describe('hide on scroll', () => {
    it('only slides away when sticky', async () => {
      const el = await header(1200);
      el.hideOnScroll = true;
      await el.updateComplete;
      expect(el.hasAttribute('data-scrolled-away')).to.be.false;
    });
  });
});

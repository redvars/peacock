/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync, waitUntil } from '@open-wc/testing';
import { AppShell } from '../src/app-shell/index.js';
import type { AppShellCloseDetail } from '../src/app-shell/index.js';

if (!customElements.get('wc-app-shell')) {
  customElements.define('wc-app-shell', AppShell);
}

function part<T extends HTMLElement = HTMLElement>(
  el: AppShell,
  selector: string,
) {
  return el.shadowRoot!.querySelector<T>(selector);
}

/** Waits for the resize observer to measure the shell. */
async function shell(template: ReturnType<typeof html>, compact: boolean) {
  const el = fixtureSync<AppShell>(template);
  await el.updateComplete;
  await waitUntil(
    () => !!part(el, '.shell')?.classList.contains('compact') === compact,
    'shell did not measure its width',
  );
  await el.updateComplete;
  return el;
}

function wide(content = html``) {
  return shell(
    html`<wc-app-shell style="width: 1200px">
      <div slot="header">App bar</div>
      ${content}
      <p>Main content</p>
    </wc-app-shell>`,
    false,
  );
}

function narrow() {
  return shell(
    html`<wc-app-shell style="width: 600px">
      <div slot="header">App bar</div>
      <ul slot="navigation">
        <li><a href="#inbox" current>Inbox</a></li>
        <li><a href="#sent">Sent</a></li>
      </ul>
      <p>Main content</p>
    </wc-app-shell>`,
    true,
  );
}

function closeReasons(el: AppShell) {
  const reasons: string[] = [];
  el.addEventListener('close', event => {
    if (event.target !== el) return;
    reasons.push((event as CustomEvent<AppShellCloseDetail>).detail.reason);
  });
  return reasons;
}

describe('AppShell', () => {
  describe('landmarks', () => {
    it('renders header and main landmarks', async () => {
      const el = await wide();
      expect(part(el, 'header')).to.exist;
      const main = part(el, 'main')!;
      expect(main.id).to.equal('main');
      expect(main.tabIndex).to.equal(-1);
    });

    it('hides the aside and footer while empty', async () => {
      const el = await wide();
      expect(part(el, 'aside')!.hidden).to.be.true;
      expect(part(el, 'footer')!.hidden).to.be.true;
    });

    it('shows the aside and footer when filled', async () => {
      const el = await wide(html`
        <div slot="aside">Details</div>
        <div slot="footer">Status</div>
      `);
      expect(part(el, 'aside')!.hidden).to.be.false;
      expect(part(el, 'footer')!.hidden).to.be.false;
    });

    it('marks plain navigation content as a navigation landmark', async () => {
      const el = await wide(
        html`<ul slot="navigation">
          <li><a href="#a">A</a></li>
        </ul>`,
      );
      const region = part(el, '.navigation')!;
      expect(region.getAttribute('role')).to.equal('navigation');
      expect(region.getAttribute('aria-label')).to.equal('Main navigation');
    });

    it('does not add a second landmark around a navigation drawer', async () => {
      const el = await wide(
        html`<wc-navigation-drawer slot="navigation"></wc-navigation-drawer>`,
      );
      expect(part(el, '.navigation')!.hasAttribute('role')).to.be.false;
    });

    it('does not add a second landmark around a <nav>', async () => {
      const el = await wide(
        html`<nav slot="navigation"><a href="#a">A</a></nav>`,
      );
      expect(part(el, '.navigation')!.hasAttribute('role')).to.be.false;
    });

    it('notices navigation added later', async () => {
      const el = await wide();
      expect(part(el, '.navigation')).to.be.null;
      const nav = document.createElement('nav');
      nav.slot = 'navigation';
      el.append(nav);
      await waitUntil(() => !!part(el, '.navigation'));
    });
  });

  describe('skip link', () => {
    it('is the first focusable element and focuses main', async () => {
      const el = await wide();
      const link = el.shadowRoot!.firstElementChild as HTMLAnchorElement;
      expect(link.classList.contains('skip-link')).to.be.true;
      expect(link.textContent!.trim()).to.equal('Skip to main content');
      link.click();
      expect(el.shadowRoot!.activeElement).to.equal(part(el, 'main'));
    });
  });

  describe('wide screens', () => {
    it('renders no menu button and no modal drawer', async () => {
      const el = await wide(html`<nav slot="navigation"></nav>`);
      expect(part(el, '.menu-button')).to.be.null;
      expect(part(el, '.modal-navigation')).to.be.null;
    });

    it('clips the drawer to rail width when collapsed without a rail', async () => {
      const el = await wide(
        html`<nav slot="navigation" style="width: 360px">Long navigation</nav>`,
      );
      el.navigationCollapsed = true;
      await el.updateComplete;
      const region = part(el, '.navigation')!;
      expect(region.classList.contains('clipped')).to.be.true;
      expect(region.getBoundingClientRect().width).to.be.below(360);
    });

    it('shows the rail instead of the drawer when collapsed', async () => {
      const el = await wide(html`
        <nav slot="navigation">Drawer</nav>
        <nav slot="rail">Rail</nav>
      `);
      expect(part(el, '.drawer-slot')!.hidden).to.be.false;
      expect(part(el, '.rail-slot')!.hidden).to.be.true;
      el.toggleNavigation();
      await el.updateComplete;
      expect(el.navigationCollapsed).to.be.true;
      expect(el.hasAttribute('navigation-collapsed')).to.be.true;
      expect(part(el, '.drawer-slot')!.hidden).to.be.true;
      expect(part(el, '.rail-slot')!.hidden).to.be.false;
    });

    it('lets only the main region scroll', async () => {
      const el = await wide(html`<div style="height: 3000px"></div>`);
      expect(getComputedStyle(part(el, 'main')!).overflowY).to.equal('auto');
      expect(el.getBoundingClientRect().height).to.equal(window.innerHeight);
    });
  });

  describe('narrow screens', () => {
    it('renders a menu button that opens the modal drawer', async () => {
      const el = await narrow();
      let opened = 0;
      el.addEventListener('open', () => {
        opened += 1;
      });
      const button = part(el, '.menu-button')!;
      expect(button.getAttribute('aria-label')).to.equal('Open navigation');
      expect(button.getAttribute('aria-expanded')).to.equal('false');
      button.click();
      await el.updateComplete;
      expect(el.navigationOpen).to.be.true;
      expect(el.hasAttribute('navigation-open')).to.be.true;
      expect(part<HTMLDialogElement>(el, '.modal-navigation')!.open).to.be.true;
      expect(button.getAttribute('aria-expanded')).to.equal('true');
      expect(opened).to.equal(1);
      el.hideNavigation();
      await el.updateComplete;
    });

    it('moves the navigation into the modal drawer', async () => {
      const el = await narrow();
      expect(part(el, '.navigation')).to.be.null;
      const slot = part<HTMLSlotElement>(
        el,
        '.modal-navigation slot[name="navigation"]',
      )!;
      expect(slot.assignedElements()).to.have.length(1);
      expect(part(el, '.modal-content')!.getAttribute('role')).to.equal(
        'navigation',
      );
    });

    it('hides the menu button with hide-menu-button', async () => {
      const el = await narrow();
      el.hideMenuButton = true;
      await el.updateComplete;
      expect(part(el, '.menu-button')).to.be.null;
    });

    it('closes on Escape with reason "escape"', async () => {
      const el = await narrow();
      const reasons = closeReasons(el);
      el.showNavigation();
      await el.updateComplete;
      document.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        }),
      );
      await el.updateComplete;
      expect(el.navigationOpen).to.be.false;
      expect(reasons).to.deep.equal(['escape']);
    });

    it('closes with reason "action" when a destination is chosen', async () => {
      const el = await narrow();
      const reasons = closeReasons(el);
      el.toggleNavigation();
      await el.updateComplete;
      el.querySelector('ul')!.dispatchEvent(
        new CustomEvent('change', { bubbles: true, composed: true }),
      );
      await el.updateComplete;
      expect(el.navigationOpen).to.be.false;
      expect(reasons).to.deep.equal(['action']);
    });

    it('closes with reason "api" from hideNavigation()', async () => {
      const el = await narrow();
      const reasons = closeReasons(el);
      el.showNavigation();
      await el.updateComplete;
      el.toggleNavigation();
      await el.updateComplete;
      expect(part<HTMLDialogElement>(el, '.modal-navigation')!.open).to.be
        .false;
      expect(reasons).to.deep.equal(['api']);
    });

    it('closes when widened past the breakpoint', async () => {
      const el = await narrow();
      const reasons = closeReasons(el);
      el.showNavigation();
      await el.updateComplete;
      el.style.width = '1000px';
      // Background test pages may deliver no resize observations; re-measuring is what the
      // observer would trigger.
      el.requestUpdate('breakpoint', 0);
      await waitUntil(() => !part(el, '.shell')!.classList.contains('compact'));
      await el.updateComplete;
      expect(el.navigationOpen).to.be.false;
      expect(reasons).to.deep.equal(['api']);
      expect(part(el, '.navigation')).to.exist;
    });

    it('follows the breakpoint property', async () => {
      const el = await narrow();
      el.breakpoint = 500;
      await el.updateComplete;
      await el.updateComplete;
      expect(part(el, '.shell')!.classList.contains('compact')).to.be.false;
    });
  });
});

/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Snackbar } from '../src/snackbar/snackbar.js';
import { resetDeprecationWarnings } from '../src/__internal/utils/deprecate.js';

if (!customElements.get('wc-snackbar')) {
  customElements.define('wc-snackbar', Snackbar);
}

function layer(el: Snackbar): HTMLElement {
  const found = el.shadowRoot?.querySelector<HTMLElement>('.layer');
  if (!found) throw new Error('wc-snackbar renders no .layer');
  return found;
}

function surfaceOf(el: Snackbar): HTMLElement {
  const found = el.shadowRoot?.querySelector<HTMLElement>('.snackbar');
  if (!found) throw new Error('wc-snackbar renders no .snackbar');
  return found;
}

function delay(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

/** Resolves once `condition` holds, polling, or rejects after `timeout` ms. */
async function waitFor(condition: () => boolean, timeout: number) {
  const start = performance.now();
  while (!condition()) {
    if (performance.now() - start > timeout) {
      throw new Error(`Condition not met within ${timeout} ms`);
    }
    // eslint-disable-next-line no-await-in-loop
    await delay(20);
  }
}

describe('Snackbar', () => {
  function finishDismissAnimation(el: Snackbar) {
    const snackbar = el.shadowRoot?.querySelector('.snackbar');
    snackbar?.dispatchEvent(
      new AnimationEvent('animationend', { animationName: 'snackbar-exit' }),
    );
  }

  it('renders message and optional action', async () => {
    const el = await fixture<Snackbar>(html`
      <wc-snackbar
        open
        message="File deleted"
        action-label="Undo"
      ></wc-snackbar>
    `);
    await el.updateComplete;

    const label = el.shadowRoot?.querySelector('.label')?.textContent ?? '';
    const action = el.shadowRoot?.querySelector('.action')?.textContent ?? '';
    expect(label.trim()).to.equal('File deleted');
    expect(action.trim()).to.equal('Undo');
  });

  it('emits action and close events on action click', async () => {
    const el = await fixture<Snackbar>(html`
      <wc-snackbar open action-label="Undo"></wc-snackbar>
    `);
    await el.updateComplete;

    let actionEventCount = 0;
    let closeReason = '';
    el.addEventListener('snackbar-action', () => {
      actionEventCount += 1;
    });
    el.addEventListener('snackbar-close', (event: Event) => {
      closeReason = (event as CustomEvent<{ reason: string }>).detail.reason;
    });

    (el.shadowRoot?.querySelector('.action') as HTMLButtonElement).click();
    await el.updateComplete;

    finishDismissAnimation(el);
    await el.updateComplete;

    expect(actionEventCount).to.equal(1);
    expect(closeReason).to.equal('action');
    expect(el.open).to.equal(false);
  });

  it('auto closes after duration', async () => {
    const el = await fixture<Snackbar>(html`
      <wc-snackbar open message="Saved" .duration=${50}></wc-snackbar>
    `);
    await el.updateComplete;

    let closeReason = '';
    let legacyReason = '';
    el.addEventListener('close', (event: Event) => {
      closeReason = (event as CustomEvent<{ reason: string }>).detail.reason;
    });
    el.addEventListener('snackbar-close', (event: Event) => {
      legacyReason = (event as CustomEvent<{ reason: string }>).detail.reason;
    });

    // Wait for the timer and the exit animation, with a generous margin for slow runners.
    await waitFor(() => !el.open, 3000);

    expect(closeReason).to.equal('timeout');
    expect(legacyReason).to.equal('timeout');
    expect(el.open).to.equal(false);
  });

  it('fires open when it opens', async () => {
    const el = await fixture<Snackbar>(html`
      <wc-snackbar message="Saved" .duration=${0}></wc-snackbar>
    `);
    let opened = 0;
    el.addEventListener('open', () => {
      opened += 1;
    });
    el.show();
    await el.updateComplete;
    expect(opened).to.equal(1);
  });

  describe('auto-hide', () => {
    it('pauses while hovered and restarts when the pointer leaves', async () => {
      const el = await fixture<Snackbar>(html`
        <wc-snackbar open message="Saved" .duration=${80}></wc-snackbar>
      `);
      surfaceOf(el).dispatchEvent(new MouseEvent('mouseenter'));

      await delay(300);
      expect(el.open).to.equal(true);

      surfaceOf(el).dispatchEvent(new MouseEvent('mouseleave'));
      await waitFor(() => !el.open, 3000);
      expect(el.open).to.equal(false);
    });

    it('pauses while focus is inside', async () => {
      const el = await fixture<Snackbar>(html`
        <wc-snackbar open message="Saved" .duration=${80}></wc-snackbar>
      `);
      surfaceOf(el).dispatchEvent(new FocusEvent('focusin', { bubbles: true }));

      await delay(300);
      expect(el.open).to.equal(true);

      surfaceOf(el).dispatchEvent(
        new FocusEvent('focusout', { bubbles: true, relatedTarget: null }),
      );
      await waitFor(() => !el.open, 3000);
      expect(el.open).to.equal(false);
    });

    it('does not hide by itself while it has an action', async () => {
      const el = await fixture<Snackbar>(html`
        <wc-snackbar
          open
          message="Deleted"
          action-label="Undo"
          .duration=${50}
        ></wc-snackbar>
      `);
      await delay(300);
      expect(el.open).to.equal(true);
    });
  });

  describe('roles', () => {
    it('is a polite status without aria-live by default', async () => {
      const el = await fixture<Snackbar>(html`
        <wc-snackbar open message="Saved" .duration=${0}></wc-snackbar>
      `);
      expect(surfaceOf(el).getAttribute('role')).to.equal('status');
      expect(surfaceOf(el).hasAttribute('aria-live')).to.equal(false);
    });

    it('stays a status with an action and a close button', async () => {
      const el = await fixture<Snackbar>(html`
        <wc-snackbar open dismissible action-label="Undo"></wc-snackbar>
      `);
      expect(surfaceOf(el).getAttribute('role')).to.equal('status');
    });

    it('is an alert for intent danger, with an icon and a hidden label', async () => {
      const el = await fixture<Snackbar>(html`
        <wc-snackbar
          open
          intent="danger"
          message="Failed"
          .duration=${0}
        ></wc-snackbar>
      `);
      expect(surfaceOf(el).getAttribute('role')).to.equal('alert');
      expect(surfaceOf(el).hasAttribute('aria-live')).to.equal(false);
      expect(
        el.shadowRoot?.querySelector('.intent-icon')?.getAttribute('name'),
      ).to.equal('error');
      expect(
        el.shadowRoot?.querySelector('.sr-only')?.textContent?.trim(),
      ).to.equal('Error:');
    });
  });

  describe('close reasons', () => {
    function record(el: Snackbar) {
      const reasons: string[] = [];
      const legacy: string[] = [];
      el.addEventListener('close', event => {
        reasons.push((event as CustomEvent<{ reason: string }>).detail.reason);
      });
      el.addEventListener('snackbar-close', event => {
        legacy.push((event as CustomEvent<{ reason: string }>).detail.reason);
      });
      return { reasons, legacy };
    }

    it('close button: action (legacy dismiss)', async () => {
      const el = await fixture<Snackbar>(html`
        <wc-snackbar open dismissible .duration=${0}></wc-snackbar>
      `);
      const { reasons, legacy } = record(el);
      el.shadowRoot?.querySelector<HTMLElement>('.close')?.click();
      expect(reasons).to.deep.equal(['action']);
      expect(legacy).to.deep.equal(['dismiss']);
    });

    it('action button: action event, then close action', async () => {
      const el = await fixture<Snackbar>(html`
        <wc-snackbar open action-label="Undo"></wc-snackbar>
      `);
      const { reasons } = record(el);
      let actions = 0;
      el.addEventListener('action', () => {
        actions += 1;
      });
      el.shadowRoot?.querySelector<HTMLElement>('.action')?.click();
      expect(actions).to.equal(1);
      expect(reasons).to.deep.equal(['action']);
    });

    it('hide(): api (legacy programmatic)', async () => {
      const el = await fixture<Snackbar>(html`
        <wc-snackbar open .duration=${0}></wc-snackbar>
      `);
      const { reasons, legacy } = record(el);
      el.hide();
      expect(reasons).to.deep.equal(['api']);
      expect(legacy).to.deep.equal(['programmatic']);
    });

    it('open = false: api, fired once', async () => {
      const el = await fixture<Snackbar>(html`
        <wc-snackbar open .duration=${0}></wc-snackbar>
      `);
      const { reasons } = record(el);
      el.open = false;
      await el.updateComplete;
      expect(reasons).to.deep.equal(['api']);
    });

    it('Escape closes a dismissible snackbar only while focus is inside it', async () => {
      const el = await fixture<Snackbar>(html`
        <wc-snackbar open dismissible .duration=${0}></wc-snackbar>
      `);
      const { reasons } = record(el);
      const escape = () =>
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          composed: true,
          cancelable: true,
        });

      document.body.dispatchEvent(escape());
      expect(reasons).to.deep.equal([]);

      const close = el.shadowRoot?.querySelector<HTMLElement>('.close');
      close?.dispatchEvent(escape());
      expect(reasons).to.deep.equal(['escape']);
    });

    it('Escape does nothing when the snackbar is not dismissible', async () => {
      const el = await fixture<Snackbar>(html`
        <wc-snackbar open action-label="Undo"></wc-snackbar>
      `);
      const { reasons } = record(el);
      el.shadowRoot
        ?.querySelector('.action')
        ?.dispatchEvent(
          new KeyboardEvent('keydown', {
            key: 'Escape',
            bubbles: true,
            composed: true,
          }),
        );
      expect(reasons).to.deep.equal([]);
    });
  });

  describe('dismissible', () => {
    let warn: typeof console.warn;
    let warnings: string[];

    beforeEach(() => {
      resetDeprecationWarnings();
      warnings = [];
      warn = console.warn;
      console.warn = (message: string) => {
        warnings.push(message);
      };
    });

    afterEach(() => {
      console.warn = warn;
    });

    it('shows a close button', async () => {
      const el = await fixture<Snackbar>(html`
        <wc-snackbar open dismissible .duration=${0}></wc-snackbar>
      `);
      expect(el.shadowRoot?.querySelector('.close')).to.not.equal(null);
      expect(warnings).to.have.length(0);
    });

    it('keeps the deprecated show-close-icon working and warns', async () => {
      const el = await fixture<Snackbar>(html`
        <wc-snackbar open show-close-icon .duration=${0}></wc-snackbar>
      `);
      expect(el.shadowRoot?.querySelector('.close')).to.not.equal(null);
      expect(warnings).to.have.length(1);
      expect(warnings[0]).to.contain('`dismissible`');
    });
  });

  it('closes previous snackbar when another one opens', async () => {
    const first = await fixture<Snackbar>(html`
      <wc-snackbar open message="First"></wc-snackbar>
    `);
    await first.updateComplete;

    let firstCloseReason = '';
    first.addEventListener('snackbar-close', (event: Event) => {
      firstCloseReason = (event as CustomEvent<{ reason: string }>).detail
        .reason;
    });

    const second = await fixture<Snackbar>(html`
      <wc-snackbar message="Second"></wc-snackbar>
    `);
    await second.updateComplete;

    second.show();
    await second.updateComplete;
    await first.updateComplete;

    expect(firstCloseReason).to.equal('programmatic');
    expect(first.open).to.equal(true);

    finishDismissAnimation(first);
    await first.updateComplete;

    expect(first.open).to.equal(false);
    expect(second.open).to.equal(true);
  });

  it('is fixed to the viewport bottom', async () => {
    const el = await fixture<Snackbar>(html`
      <wc-snackbar open message="Saved"></wc-snackbar>
    `);
    await el.updateComplete;

    const layerStyles = getComputedStyle(layer(el));
    expect(layerStyles.position).to.equal('fixed');
    const rect = layer(el).getBoundingClientRect();
    expect(rect.bottom).to.be.closeTo(window.innerHeight - 16, 1);
    expect(rect.top).to.be.greaterThan(window.innerHeight / 2);
  });

  it('shows in the top layer only while open', async () => {
    const el = await fixture<Snackbar>(html`
      <wc-snackbar message="Saved" .duration=${0}></wc-snackbar>
    `);
    await el.updateComplete;
    expect(layer(el).matches(':popover-open')).to.equal(false);

    el.show();
    await el.updateComplete;
    expect(layer(el).matches(':popover-open')).to.equal(true);

    el.hide();
    await el.updateComplete;
    finishDismissAnimation(el);
    await el.updateComplete;
    expect(layer(el).matches(':popover-open')).to.equal(false);
  });

  it('draws above an element with a high z-index', async () => {
    const wrapper = await fixture<HTMLElement>(html`
      <div>
        <div
          id="cover"
          style="position: fixed; inset: 0; z-index: 2147483647; background: white;"
        ></div>
        <wc-snackbar open message="Saved" .duration=${0}></wc-snackbar>
      </div>
    `);
    const el = wrapper.querySelector('wc-snackbar') as Snackbar;
    await el.updateComplete;

    const surface = el.shadowRoot?.querySelector('.snackbar') as HTMLElement;
    const rect = surface.getBoundingClientRect();
    const hit = el.shadowRoot?.elementFromPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
    );
    expect(hit && surface.contains(hit)).to.equal(true);
  });

  it('does not use the top layer in preview', async () => {
    const el = await fixture<Snackbar>(html`
      <wc-snackbar preview message="Saved"></wc-snackbar>
    `);
    await el.updateComplete;

    expect(layer(el).hasAttribute('popover')).to.equal(false);
    expect(getComputedStyle(layer(el)).position).to.equal('relative');
  });

  it('leaves the top layer when removed', async () => {
    const el = await fixture<Snackbar>(html`
      <wc-snackbar open message="Saved" .duration=${0}></wc-snackbar>
    `);
    await el.updateComplete;
    const popover = layer(el);
    expect(popover.matches(':popover-open')).to.equal(true);

    el.remove();
    expect(popover.matches(':popover-open')).to.equal(false);
  });
});

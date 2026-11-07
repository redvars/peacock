/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { NotificationManager } from '../src/notification-manager/notification-manager.js';
import { Snackbar } from '../src/snackbar/snackbar.js';

if (!customElements.get('wc-notification-manager')) {
  customElements.define('wc-notification-manager', NotificationManager);
}
if (!customElements.get('wc-snackbar')) {
  customElements.define('wc-snackbar', Snackbar);
}

function delay(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

/** Resolves once `condition` holds, polling, or rejects after `timeout` ms. */
async function waitFor(condition: () => boolean, timeout = 3000) {
  const start = performance.now();
  while (!condition()) {
    if (performance.now() - start > timeout) {
      throw new Error(`Condition not met within ${timeout} ms`);
    }
    // eslint-disable-next-line no-await-in-loop
    await delay(20);
  }
}

function region(el: NotificationManager): HTMLElement {
  const found = el.shadowRoot?.querySelector<HTMLElement>('.region');
  if (!found) throw new Error('wc-notification-manager renders no .region');
  return found;
}

function snackbars(el: NotificationManager): Snackbar[] {
  return [...(el.shadowRoot?.querySelectorAll<Snackbar>('wc-snackbar') ?? [])];
}

async function settle(el: NotificationManager) {
  await el.updateComplete;
  await Promise.all(snackbars(el).map(snackbar => snackbar.updateComplete));
}

describe('NotificationManager', () => {
  it('queues toasts as snackbars in a top-layer region', async () => {
    const el = await fixture<NotificationManager>(html`
      <wc-notification-manager></wc-notification-manager>
    `);
    expect(region(el).matches(':popover-open')).to.equal(false);

    el.show({ title: 'First', duration: 0 });
    el.show({ title: 'Second', intent: 'success', duration: 0 });
    await settle(el);

    const items = snackbars(el);
    expect(items).to.have.length(2);
    expect(items.every(item => item.managed && item.open)).to.equal(true);
    expect(items[1].intent).to.equal('success');
    expect(items[0].textContent?.trim()).to.equal('First');
    expect(region(el).matches(':popover-open')).to.equal(true);
    // Managed snackbars use the manager's region, not popovers of their own.
    expect(
      items[0].shadowRoot?.querySelector('.layer')?.hasAttribute('popover'),
    ).to.equal(false);
  });

  it('shows toasts from the peacock-toast window event, routed by target', async () => {
    const wrapper = await fixture<HTMLElement>(html`
      <div>
        <wc-notification-manager></wc-notification-manager>
        <wc-notification-manager name="side"></wc-notification-manager>
      </div>
    `);
    const [global, side] = [
      ...wrapper.querySelectorAll<NotificationManager>(
        'wc-notification-manager',
      ),
    ];
    let id = '';
    window.dispatchEvent(
      new CustomEvent('peacock-toast', {
        detail: {
          target: 'side',
          title: 'Saved',
          duration: 0,
          callback: (toastId: string) => {
            id = toastId;
          },
        },
      }),
    );
    await settle(side);
    await settle(global);

    expect(snackbars(side)).to.have.length(1);
    expect(snackbars(global)).to.have.length(0);
    expect(id).to.equal(snackbars(side)[0].id);
  });

  it('removes a toast after its exit animation', async () => {
    const el = await fixture<NotificationManager>(html`
      <wc-notification-manager></wc-notification-manager>
    `);
    const id = el.show({ title: 'Bye', duration: 0 });
    await settle(el);
    expect(snackbars(el)).to.have.length(1);

    el.hide(id);
    await waitFor(() => snackbars(el).length === 0);
    await el.updateComplete;
    expect(region(el).matches(':popover-open')).to.equal(false);
  });

  it('auto-hides and removes toasts, dismissible or not, unless they have an action', async () => {
    const el = await fixture<NotificationManager>(html`
      <wc-notification-manager></wc-notification-manager>
    `);
    el.show({ title: 'Plain', duration: 60 });
    el.show({ title: 'Dismissible', dismissible: true, duration: 60 });
    el.show({ title: 'With action', action: 'Undo', duration: 60 });
    await settle(el);

    await waitFor(() => snackbars(el).length === 1);
    await delay(200);
    const [left] = snackbars(el);
    expect(snackbars(el)).to.have.length(1);
    expect(left.actionLabel).to.equal('Undo');
  });

  it('hides toasts from the peacock-toast-dismiss window event', async () => {
    const el = await fixture<NotificationManager>(html`
      <wc-notification-manager></wc-notification-manager>
    `);
    const id = el.show({ title: 'Bye', duration: 0 });
    await settle(el);

    window.dispatchEvent(
      new CustomEvent('peacock-toast-dismiss', {
        detail: { notifications: [id] },
      }),
    );
    await waitFor(() => snackbars(el).length === 0);
  });

  it('ignores the removed notification window events', async () => {
    const el = await fixture<NotificationManager>(html`
      <wc-notification-manager></wc-notification-manager>
    `);
    window.dispatchEvent(
      new CustomEvent('notification', {
        detail: { title: 'Old', duration: 0 },
      }),
    );
    await settle(el);
    expect(snackbars(el)).to.have.length(0);
  });

  it('fires close with the toast id', async () => {
    const el = await fixture<NotificationManager>(html`
      <wc-notification-manager></wc-notification-manager>
    `);
    const id = el.show({ title: 'Closable', dismissible: true, duration: 0 });
    await settle(el);

    const closes: { id: string; reason: string }[] = [];
    el.addEventListener('close', event => {
      closes.push(
        (event as CustomEvent<{ id: string; reason: string }>).detail,
      );
    });

    snackbars(el)[0].shadowRoot?.querySelector<HTMLElement>('.close')?.click();
    expect(closes).to.deep.equal([{ id, reason: 'action' }]);
  });

  it('fires action with the toast id', async () => {
    const el = await fixture<NotificationManager>(html`
      <wc-notification-manager></wc-notification-manager>
    `);
    const id = el.show({ title: 'Deleted', action: 'Undo' });
    await settle(el);

    const actions: string[] = [];
    el.addEventListener('action', event => {
      actions.push((event as CustomEvent<{ id: string }>).detail.id);
    });

    snackbars(el)[0].shadowRoot?.querySelector<HTMLElement>('.action')?.click();
    expect(actions).to.deep.equal([id]);
  });

  describe('placement', () => {
    it('defaults to bottom-end, placed with logical insets', async () => {
      const el = await fixture<NotificationManager>(html`
        <wc-notification-manager></wc-notification-manager>
      `);
      el.show({ title: 'Here', duration: 0 });
      await settle(el);

      expect(region(el).classList.contains('placement-bottom-end')).to.equal(
        true,
      );
      const rect = region(el).getBoundingClientRect();
      expect(rect.bottom).to.be.closeTo(window.innerHeight - 16, 2);
      expect(rect.right).to.be.closeTo(
        document.documentElement.clientWidth - 16,
        2,
      );
    });

    it('places top-start at the top inline-start corner', async () => {
      const el = await fixture<NotificationManager>(html`
        <wc-notification-manager
          placement="top-start"
        ></wc-notification-manager>
      `);
      el.show({ title: 'Here', duration: 0 });
      await settle(el);

      const rect = region(el).getBoundingClientRect();
      expect(rect.top).to.be.closeTo(16, 2);
      expect(rect.left).to.be.closeTo(16, 2);
    });
  });
});

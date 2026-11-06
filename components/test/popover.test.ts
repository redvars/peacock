/// <reference types="mocha" />
import { html, LitElement } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Popover, PopoverContent } from '../src/popover/index.js';
import { FloatingController } from '../src/__internal/controllers/floating-controller.js';

for (const [tag, element] of [
  ['wc-popover', Popover],
  ['wc-popover-content', PopoverContent],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

class FloatingHost extends LitElement {}
if (!customElements.get('test-floating-host')) {
  customElements.define('test-floating-host', FloatingHost);
}

/** Counts click listeners that are still attached to an element. */
function trackClickListeners(element: HTMLElement) {
  let count = 0;
  const add = element.addEventListener.bind(element);
  const remove = element.removeEventListener.bind(element);
  Object.assign(element, {
    addEventListener: (type: string, ...rest: unknown[]) => {
      if (type === 'click') count += 1;
      return (add as (...a: unknown[]) => void)(type, ...rest);
    },
    removeEventListener: (type: string, ...rest: unknown[]) => {
      if (type === 'click') count -= 1;
      return (remove as (...a: unknown[]) => void)(type, ...rest);
    },
  });
  return () => count;
}

describe('FloatingController', () => {
  it('stops reacting to its trigger after dispose()', async () => {
    const host = await fixture<FloatingHost>(
      html`<test-floating-host></test-floating-host>`,
    );
    const reference = document.createElement('button');
    const floating = document.createElement('div');
    host.append(reference, floating);

    let changes = 0;
    const controller = new FloatingController(host, {
      trigger: 'click',
      onOpenChange: () => {
        changes += 1;
      },
    });
    controller.setElements(reference, floating);
    controller.dispose();

    reference.click();
    expect(changes).to.equal(0);
  });
});

describe('Popover', () => {
  it('keeps one click listener on its trigger when re-configured', async () => {
    const el = await fixture<Popover>(html`
      <wc-popover>
        <button>Open</button>
        <wc-popover-content>Content</wc-popover-content>
      </wc-popover>
    `);
    await el.updateComplete;
    const trigger = el.querySelector('button')!;
    const listeners = trackClickListeners(trigger);

    for (const placement of ['top', 'bottom', 'right'] as const) {
      el.placement = placement;
      // eslint-disable-next-line no-await-in-loop
      await el.updateComplete;
    }

    // Each re-setup removes the old listener and adds one new one.
    expect(listeners()).to.equal(0);

    trigger.click();
    await el.updateComplete;
    expect(el.open).to.be.true;
  });
});

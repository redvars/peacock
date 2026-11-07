/// <reference types="mocha" />
import { html, LitElement } from 'lit';
import { fixture, expect, oneEvent, waitUntil } from '@open-wc/testing';
import { Popover, PopoverContent } from '../src/popover/index.js';
import { Modal } from '../src/modal/index.js';
import { FloatingController } from '../src/__internal/controllers/floating-controller.js';

for (const [tag, element] of [
  ['wc-popover', Popover],
  ['wc-popover-content', PopoverContent],
  ['wc-modal', Modal],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

async function basic() {
  const el = await fixture<Popover>(html`
    <wc-popover>
      <button>Open</button>
      <wc-popover-content><p>Content</p></wc-popover-content>
    </wc-popover>
  `);
  await el.updateComplete;
  return el;
}

function pointerdown(target: Element) {
  target.dispatchEvent(
    new PointerEvent('pointerdown', { bubbles: true, composed: true }),
  );
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

    for (const placement of ['top', 'bottom', 'end'] as const) {
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

  it('shows the content in the top layer while open', async () => {
    const el = await basic();
    const content = el.querySelector<PopoverContent>('wc-popover-content')!;
    expect(content.getAttribute('popover')).to.equal('manual');
    expect(content.matches(':popover-open')).to.be.false;

    el.show();
    await el.updateComplete;
    expect(content.matches(':popover-open')).to.be.true;
    expect(content.open).to.be.true;

    el.hide();
    await el.updateComplete;
    expect(content.matches(':popover-open')).to.be.false;
  });

  it('closes on Escape with reason escape', async () => {
    const el = await basic();
    el.show();
    await el.updateComplete;

    setTimeout(() =>
      document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
      ),
    );
    const event = (await oneEvent(el, 'close')) as CustomEvent<{
      reason: string;
    }>;
    expect(event.detail.reason).to.equal('escape');
    expect(el.open).to.be.false;
  });

  it('closes on a press outside, not on the trigger or the content', async () => {
    const el = await basic();
    el.show();
    await el.updateComplete;

    pointerdown(el.querySelector('button')!);
    pointerdown(el.querySelector('p')!);
    await el.updateComplete;
    expect(el.open).to.be.true;

    setTimeout(() => pointerdown(document.body));
    const event = (await oneEvent(el, 'close')) as CustomEvent<{
      reason: string;
    }>;
    expect(event.detail.reason).to.equal('light-dismiss');
    expect(el.open).to.be.false;
  });

  it('stays open on a press outside with no-light-dismiss', async () => {
    const el = await basic();
    el.noLightDismiss = true;
    el.show();
    await el.updateComplete;

    pointerdown(document.body);
    await el.updateComplete;
    expect(el.open).to.be.true;
  });

  it('closes with reason action when the trigger is clicked again', async () => {
    const el = await basic();
    const trigger = el.querySelector('button')!;
    trigger.click();
    await el.updateComplete;
    expect(el.open).to.be.true;

    setTimeout(() => trigger.click());
    const event = (await oneEvent(el, 'close')) as CustomEvent<{
      reason: string;
    }>;
    expect(event.detail.reason).to.equal('action');
  });

  it('fires open and close', async () => {
    const el = await basic();
    const seen: string[] = [];
    for (const type of ['open', 'close']) {
      el.addEventListener(type, event => {
        const { detail } = event as CustomEvent<{ reason?: string } | null>;
        seen.push(detail?.reason ? `${type}:${detail.reason}` : type);
      });
    }

    el.show();
    await el.updateComplete;
    el.hide();
    await el.updateComplete;
    el.open = true;
    await el.updateComplete;
    el.open = false;
    await el.updateComplete;

    expect(seen).to.deep.equal(['open', 'close:api', 'open', 'close:api']);
  });

  it('links the trigger to the content', async () => {
    const el = await basic();
    const trigger = el.querySelector('button')!;
    const content = el.querySelector<PopoverContent>('wc-popover-content')!;

    expect(content.id).to.match(/^wc-popover-content-/);
    expect(trigger.getAttribute('aria-haspopup')).to.equal('dialog');
    expect(trigger.getAttribute('aria-controls')).to.equal(content.id);
    expect(trigger.getAttribute('aria-expanded')).to.equal('false');

    el.show();
    await el.updateComplete;
    expect(trigger.getAttribute('aria-expanded')).to.equal('true');

    el.remove();
    expect(trigger.hasAttribute('aria-expanded')).to.be.false;
    expect(trigger.hasAttribute('aria-controls')).to.be.false;
    expect(trigger.hasAttribute('aria-haspopup')).to.be.false;
  });

  it('leaves the trigger ARIA to the consumer with trigger="manual"', async () => {
    const el = await fixture<Popover>(html`
      <wc-popover trigger="manual">
        <button>Open</button>
        <wc-popover-content>Content</wc-popover-content>
      </wc-popover>
    `);
    await el.updateComplete;
    expect(el.querySelector('button')!.hasAttribute('aria-expanded')).to.be
      .false;
  });

  it('names the dialog from label, else from the heading slot', async () => {
    const el = await fixture<Popover>(html`
      <wc-popover>
        <button>Open</button>
        <wc-popover-content>
          <h3 slot="heading">Filters</h3>
          <p>Body</p>
        </wc-popover-content>
      </wc-popover>
    `);
    await el.updateComplete;
    const content = el.querySelector<PopoverContent>('wc-popover-content')!;
    const heading = el.querySelector('h3')!;

    expect(content.getAttribute('role')).to.equal('dialog');
    expect(content.getAttribute('aria-labelledby')).to.equal(heading.id);
    expect(content.hasAttribute('aria-label')).to.be.false;

    el.label = 'Filter options';
    await el.updateComplete;
    expect(content.getAttribute('aria-label')).to.equal('Filter options');
    expect(content.hasAttribute('aria-labelledby')).to.be.false;
  });

  it('keeps a consumer aria-label on the content', async () => {
    const el = await fixture<Popover>(html`
      <wc-popover>
        <button>Open</button>
        <wc-popover-content aria-label="Pick a date">Body</wc-popover-content>
      </wc-popover>
    `);
    await el.updateComplete;
    const content = el.querySelector<PopoverContent>('wc-popover-content')!;
    expect(content.getAttribute('aria-label')).to.equal('Pick a date');
  });

  it('positions the arrow with floating-ui', async () => {
    const el = await fixture<Popover>(html`
      <wc-popover arrow placement="bottom">
        <button>Open</button>
        <wc-popover-content>Content</wc-popover-content>
      </wc-popover>
    `);
    await el.updateComplete;
    el.show();
    await el.updateComplete;
    const content = el.querySelector<PopoverContent>('wc-popover-content')!;
    const arrow = content.shadowRoot!.querySelector<HTMLElement>('.arrow')!;
    await waitUntil(() => arrow.style.top !== '', 'arrow positioned');
    expect(getComputedStyle(arrow).display).to.equal('block');
    // Below the trigger, the arrow sits on the panel's top edge.
    expect(arrow.style.top).to.equal('-4px');
  });

  it('maps the logical start placement to the side the text starts on', async () => {
    const el = await fixture<Popover>(html`
      <wc-popover placement="start" dir="rtl">
        <button>Open</button>
        <wc-popover-content>Content</wc-popover-content>
      </wc-popover>
    `);
    await el.updateComplete;
    el.show();
    await el.updateComplete;
    const trigger = el.querySelector('button')!;
    const content = el.querySelector<PopoverContent>('wc-popover-content')!;
    await waitUntil(
      () =>
        content.getBoundingClientRect().left >=
        trigger.getBoundingClientRect().right,
      'panel on the right of the trigger',
    );
  });
});

describe('Popover in a modal', () => {
  it('shows above the modal and Escape closes only the popover', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <wc-modal open heading="Settings">
          <wc-popover>
            <button>Open</button>
            <wc-popover-content>Content</wc-popover-content>
          </wc-popover>
        </wc-modal>
      </div>
    `);
    const modal = wrapper.querySelector<Modal>('wc-modal')!;
    const el = wrapper.querySelector<Popover>('wc-popover')!;
    await modal.updateComplete;
    el.show();
    await el.updateComplete;
    const content = el.querySelector<PopoverContent>('wc-popover-content')!;
    expect(content.matches(':popover-open')).to.be.true;

    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await el.updateComplete;
    expect(el.open).to.be.false;
    expect(modal.open).to.be.true;
    modal.open = false;
    await modal.updateComplete;
  });
});

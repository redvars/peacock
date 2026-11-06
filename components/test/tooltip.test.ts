/// <reference types="mocha" />
import { html, LitElement } from 'lit';
import { fixture, expect, waitUntil } from '@open-wc/testing';
import { Tooltip } from '../src/tooltip/tooltip.js';
import { Modal } from '../src/modal/index.js';

for (const [tag, element] of [
  ['wc-tooltip', Tooltip],
  ['wc-modal', Modal],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

/** A host whose shadow root holds the tooltip's target. */
class ShadowTarget extends LitElement {
  render() {
    return html`<button id="inner">Inner</button>`;
  }
}
if (!customElements.get('test-shadow-target')) {
  customElements.define('test-shadow-target', ShadowTarget);
}

async function withTarget() {
  const wrapper = await fixture<HTMLDivElement>(html`
    <div>
      <button id="tooltip-target" aria-describedby="hint">Save</button>
      <span id="hint">Hint</span>
      <wc-tooltip for="tooltip-target">Saves the file</wc-tooltip>
    </div>
  `);
  const el = wrapper.querySelector<Tooltip>('wc-tooltip')!;
  await el.updateComplete;
  return { wrapper, el, target: wrapper.querySelector('button')! };
}

function escape() {
  document.body.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      composed: true,
    }),
  );
}

describe('Tooltip', () => {
  it('describes its target and unlinks on removal', async () => {
    const { el, target } = await withTarget();
    expect(el.id).to.match(/^wc-tooltip-/);
    expect(el.getAttribute('role')).to.equal('tooltip');
    expect(target.getAttribute('aria-describedby')).to.equal(`hint ${el.id}`);

    el.remove();
    expect(target.getAttribute('aria-describedby')).to.equal('hint');
  });

  it('describes a target inside a shadow root by id', async () => {
    const host = await fixture<ShadowTarget>(
      html`<test-shadow-target></test-shadow-target>`,
    );
    const inner = host.shadowRoot!.querySelector<HTMLButtonElement>('#inner')!;
    const el = document.createElement('wc-tooltip') as Tooltip;
    el.setAttribute('for', 'inner');
    el.textContent = 'Tip';
    host.shadowRoot!.append(el);
    await el.updateComplete;
    expect(inner.getAttribute('aria-describedby')).to.equal(el.id);
  });

  it('defaults to its parent element as the target', async () => {
    const button = await fixture<HTMLButtonElement>(
      html`<button>Save<wc-tooltip>Tip</wc-tooltip></button>`,
    );
    const el = button.querySelector<Tooltip>('wc-tooltip')!;
    await el.updateComplete;
    expect(button.getAttribute('aria-describedby')).to.equal(el.id);
  });

  it('shows in the top layer while open', async () => {
    const { el } = await withTarget();
    expect(el.getAttribute('popover')).to.equal('manual');
    expect(el.matches(':popover-open')).to.be.false;

    el.open = true;
    await el.updateComplete;
    expect(el.matches(':popover-open')).to.be.true;

    el.open = false;
    await el.updateComplete;
    expect(el.matches(':popover-open')).to.be.false;
  });

  it('opens on focus of the target', async () => {
    const { el, target } = await withTarget();
    target.focus();
    await el.updateComplete;
    expect(el.open).to.be.true;
    expect(el.matches(':popover-open')).to.be.true;
  });

  it('hides on Escape without closing an enclosing modal', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <wc-modal open heading="Settings">
          <button id="modal-target">Save</button>
          <wc-tooltip for="modal-target">Saves the file</wc-tooltip>
        </wc-modal>
      </div>
    `);
    const modal = wrapper.querySelector<Modal>('wc-modal')!;
    const el = wrapper.querySelector<Tooltip>('wc-tooltip')!;
    await modal.updateComplete;
    el.open = true;
    await el.updateComplete;

    escape();
    await el.updateComplete;
    expect(el.open).to.be.false;
    expect(modal.open).to.be.true;

    // The next Escape reaches the modal.
    escape();
    await modal.updateComplete;
    expect(modal.open).to.be.false;
  });

  it('places itself on the requested side', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div style="padding: 100px">
        <button id="placed-target">Save</button>
        <wc-tooltip for="placed-target" placement="bottom">Tip</wc-tooltip>
      </div>
    `);
    const el = wrapper.querySelector<Tooltip>('wc-tooltip')!;
    const target = wrapper.querySelector('button')!;
    el.open = true;
    await el.updateComplete;
    await waitUntil(
      () =>
        el.getBoundingClientRect().top >=
        target.getBoundingClientRect().bottom - 1,
      'tooltip below the target',
    );

    el.placement = 'top';
    await el.updateComplete;
    await waitUntil(
      () =>
        el.getBoundingClientRect().bottom <=
        target.getBoundingClientRect().top + 1,
      'tooltip above the target',
    );
  });

  it('renders in place without a popover in preview', async () => {
    const el = await fixture<Tooltip>(
      html`<wc-tooltip preview>Tooltip</wc-tooltip>`,
    );
    expect(el.hasAttribute('popover')).to.be.false;
  });
});

/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, waitUntil } from '@open-wc/testing';
import { EmptyState } from '../src/empty-state/index.js';

if (!customElements.get('wc-empty-state')) {
  customElements.define('wc-empty-state', EmptyState);
}

function direction(el: EmptyState) {
  const container = el.shadowRoot?.querySelector(
    '.empty-state-container',
  ) as Element;
  return getComputedStyle(container).flexDirection;
}

describe('EmptyState', () => {
  it('stacks in a narrow container and sits side by side in a wide one', async () => {
    const wrapper = await fixture<HTMLDivElement>(
      html`<div style="inline-size: 400px">
        <wc-empty-state headline="Nothing here"></wc-empty-state>
      </div>`,
    );
    const el = wrapper.querySelector('wc-empty-state') as EmptyState;
    await el.updateComplete;
    expect(direction(el)).to.equal('column');

    wrapper.style.inlineSize = '1000px';
    await waitUntil(() => direction(el) === 'row', 'did not switch to row');

    wrapper.style.inlineSize = '400px';
    await waitUntil(() => direction(el) === 'column', 'did not stack again');
  });

  it('follows its container, not the window', async () => {
    // The window is wider than 672px in the test browser; a narrow parent still stacks it.
    const wrapper = await fixture<HTMLDivElement>(
      html`<div style="inline-size: 300px">
        <wc-empty-state headline="Nothing here"></wc-empty-state>
      </div>`,
    );
    const el = wrapper.querySelector('wc-empty-state') as EmptyState;
    await el.updateComplete;
    expect(direction(el)).to.equal('column');
  });

  it('renders the headline and description', async () => {
    const el = await fixture<EmptyState>(
      html`<wc-empty-state
        headline="No items"
        description="Add one to get started"
      ></wc-empty-state>`,
    );
    expect(
      el.shadowRoot?.querySelector('.headline')?.textContent?.trim(),
    ).to.equal('No items');
    expect(
      el.shadowRoot?.querySelector('.description')?.textContent?.trim(),
    ).to.equal('Add one to get started');
  });
});

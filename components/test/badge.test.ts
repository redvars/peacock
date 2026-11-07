/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Badge } from '../src/badge/badge.js';

if (!customElements.get('wc-badge')) {
  customElements.define('wc-badge', Badge);
}

function inner(el: Badge) {
  return el.shadowRoot!.querySelector('.badge')!;
}

describe('Badge', () => {
  it('shows its value', async () => {
    const el = await fixture<Badge>(html`<wc-badge value="7"></wc-badge>`);
    expect(inner(el).textContent!.trim()).to.equal('7');
    expect(inner(el).classList.contains('has-value')).to.be.true;
    expect(inner(el).hasAttribute('aria-hidden')).to.be.false;
  });

  it('caps a number above max', async () => {
    const el = await fixture<Badge>(html`<wc-badge value="120"></wc-badge>`);
    expect(inner(el).textContent!.trim()).to.equal('99+');

    el.max = 9;
    el.value = '10';
    await el.updateComplete;
    expect(inner(el).textContent!.trim()).to.equal('9+');

    el.value = 'new';
    await el.updateComplete;
    expect(inner(el).textContent!.trim()).to.equal('new');
  });

  it('shows a decorative dot, hidden from assistive technology', async () => {
    const el = await fixture<Badge>(html`<wc-badge dot value="4"></wc-badge>`);
    expect(inner(el).textContent!.trim()).to.equal('');
    expect(inner(el).classList.contains('has-value')).to.be.false;
    expect(inner(el).getAttribute('aria-hidden')).to.equal('true');
  });

  it('names itself with label', async () => {
    const el = await fixture<Badge>(
      html`<wc-badge value="3" label="3 unread messages"></wc-badge>`,
    );
    expect(inner(el).getAttribute('role')).to.equal('img');
    expect(inner(el).getAttribute('aria-label')).to.equal('3 unread messages');

    const dot = await fixture<Badge>(
      html`<wc-badge dot label="New activity"></wc-badge>`,
    );
    expect(inner(dot).hasAttribute('aria-hidden')).to.be.false;
  });

  it('reflects intent', async () => {
    const el = await fixture<Badge>(
      html`<wc-badge
        intent="success"
        value="1"
        style="--color-success: rgb(1, 2, 3)"
      ></wc-badge>`,
    );
    expect(el.getAttribute('intent')).to.equal('success');
    expect(getComputedStyle(inner(el)).backgroundColor).to.equal(
      'rgb(1, 2, 3)',
    );
  });
});

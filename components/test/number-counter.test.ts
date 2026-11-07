/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { NumberCounter } from '../src/number-counter/index.js';

if (!customElements.get('wc-number-counter')) {
  customElements.define('wc-number-counter', NumberCounter);
}

function hiddenText(el: NumberCounter) {
  return el.shadowRoot?.querySelector('.visually-hidden')?.textContent ?? '';
}

describe('NumberCounter', () => {
  it('hides the rolling digits from assistive technology', async () => {
    const el = await fixture<NumberCounter>(
      html`<wc-number-counter value="1234" locale="en-US"></wc-number-counter>`,
    );
    const digits = el.shadowRoot?.querySelector('.number-counter');
    expect(digits?.getAttribute('aria-hidden')).to.equal('true');
  });

  it('exposes the formatted value in a visually hidden element that is still rendered', async () => {
    const el = await fixture<NumberCounter>(
      html`<wc-number-counter value="1234" locale="en-US"></wc-number-counter>`,
    );
    expect(hiddenText(el)).to.equal('1,234');
    const hidden = el.shadowRoot?.querySelector('.visually-hidden');
    expect(hidden).to.exist;
    expect(getComputedStyle(hidden as Element).display).not.to.equal('none');
  });

  it('formats with the nearest lang when no locale is set', async () => {
    const wrapper = await fixture<HTMLDivElement>(
      html`<div lang="de-DE">
        <wc-number-counter value="1234567"></wc-number-counter>
      </div>`,
    );
    const el = wrapper.querySelector('wc-number-counter') as NumberCounter;
    await el.updateComplete;
    expect(hiddenText(el)).to.equal(
      new Intl.NumberFormat('de-DE').format(1234567),
    );
  });

  it('updates when the value changes', async () => {
    const el = await fixture<NumberCounter>(
      html`<wc-number-counter value="5" locale="en-US"></wc-number-counter>`,
    );
    el.value = 9876;
    await el.updateComplete;
    expect(hiddenText(el)).to.equal('9,876');
    expect(el.shadowRoot?.querySelectorAll('.digit')).to.have.length(4);
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<NumberCounter>(
      html`<wc-number-counter value="42"></wc-number-counter>`,
    );
    await expect(el).shadowDom.to.be.accessible();
  });
});

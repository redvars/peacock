/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Accordion, AccordionItem } from '../src/accordion/index.js';

if (!customElements.get('wc-accordion')) {
  customElements.define('wc-accordion', Accordion);
}
if (!customElements.get('wc-accordion-item')) {
  customElements.define('wc-accordion-item', AccordionItem);
}

describe('AccordionItem', () => {
  it('renders header actions outside the header button', async () => {
    const el = await fixture<AccordionItem>(html`
      <wc-accordion-item>
        <span slot="heading">Billing</span>
        <button slot="header-actions">Edit</button>
      </wc-accordion-item>
    `);
    const slot = el.shadowRoot!.querySelector<HTMLSlotElement>(
      'slot[name="header-actions"]',
    )!;
    expect(slot.closest('button')).to.be.null;
  });

  it('toggles from the header button', async () => {
    const el = await fixture<AccordionItem>(html`
      <wc-accordion-item
        ><span slot="heading">Billing</span>Body</wc-accordion-item
      >
    `);
    const button =
      el.shadowRoot!.querySelector<HTMLButtonElement>('.header-button')!;

    button.click();
    await el.updateComplete;

    expect(el.open).to.be.true;
    expect(button.getAttribute('aria-expanded')).to.equal('true');
  });

  it('does not toggle when a header action is clicked', async () => {
    const el = await fixture<AccordionItem>(html`
      <wc-accordion-item>
        <span slot="heading">Billing</span>
        <button slot="header-actions">Edit</button>
      </wc-accordion-item>
    `);
    el.querySelector<HTMLButtonElement>('[slot="header-actions"]')!.click();
    await el.updateComplete;
    expect(el.open).to.be.false;
  });
});

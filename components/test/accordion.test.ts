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

  it('renders the header button with aria-expanded and aria-controls', async () => {
    const el = await fixture<AccordionItem>(html`
      <wc-accordion-item open
        ><span slot="heading">Billing</span>Body</wc-accordion-item
      >
    `);
    const button = el.headerButton!;
    const region = el.shadowRoot!.querySelector('[role="region"]')!;
    expect(button.getAttribute('aria-expanded')).to.equal('true');
    expect(button.getAttribute('aria-controls')).to.equal(region.id);
    expect(region.getAttribute('aria-labelledby')).to.equal(button.id);
  });

  it('fires open and close with the reason, and the deprecated toggle event', async () => {
    const el = await fixture<AccordionItem>(html`
      <wc-accordion-item
        ><span slot="heading">Billing</span>Body</wc-accordion-item
      >
    `);
    const events: string[] = [];
    for (const type of ['open', 'close', 'accordion-item-toggle']) {
      el.addEventListener(type, event => {
        const { detail } = event as CustomEvent;
        events.push(`${type}:${detail.reason ?? detail.open}`);
      });
    }

    el.headerButton!.click();
    await el.updateComplete;
    el.open = false;
    await el.updateComplete;
    el.show();
    await el.updateComplete;

    expect(events).to.deep.equal([
      'accordion-item-toggle:true',
      'open:action',
      'close:api',
      'open:api',
    ]);
  });

  it('does not fire open for an item that starts open', async () => {
    let opened = false;
    const el = document.createElement('wc-accordion-item') as AccordionItem;
    el.open = true;
    el.addEventListener('open', () => {
      opened = true;
    });
    document.body.append(el);
    await el.updateComplete;
    el.remove();
    expect(opened).to.be.false;
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

function press(target: Element, key: string) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    composed: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

async function accordion(multiple = false) {
  const el = await fixture<Accordion>(html`
    <wc-accordion ?multiple=${multiple}>
      <wc-accordion-item><span slot="heading">One</span>1</wc-accordion-item>
      <wc-accordion-item disabled
        ><span slot="heading">Two</span>2</wc-accordion-item
      >
      <wc-accordion-item><span slot="heading">Three</span>3</wc-accordion-item>
      <wc-accordion-item><span slot="heading">Four</span>4</wc-accordion-item>
    </wc-accordion>
  `);
  await Promise.all(el.items.map(item => item.updateComplete));
  await new Promise(resolve => {
    setTimeout(resolve);
  });
  const buttons = el.items.map(item => item.headerButton as HTMLElement);
  return { el, buttons };
}

describe('Accordion', () => {
  it('keeps every header in the Tab order, as in the WAI-ARIA accordion pattern', async () => {
    const { buttons } = await accordion();
    expect(buttons.map(button => button.tabIndex)).to.deep.equal([
      0, 0, 0, 0,
    ]);
  });

  it('moves focus between headers with Up, Down, Home and End', async () => {
    const { el, buttons } = await accordion();
    const [one, , three, four] = buttons;
    const focused = () =>
      el.items.find(item => item.shadowRoot?.activeElement)?.headerButton;

    one.focus();
    press(one, 'ArrowDown');
    expect(focused()).to.equal(three);
    expect(three.tabIndex).to.equal(0);

    press(three, 'ArrowUp');
    expect(focused()).to.equal(one);

    // Wraps around.
    press(one, 'ArrowUp');
    expect(focused()).to.equal(four);

    press(four, 'Home');
    expect(focused()).to.equal(one);

    press(one, 'End');
    expect(focused()).to.equal(four);

    // Left and Right do nothing in a vertical list, in either direction.
    expect(press(four, 'ArrowRight').defaultPrevented).to.be.false;
  });

  it('closes the other panels when one opens', async () => {
    const { el } = await accordion();
    const [one, , three] = el.items;
    one.headerButton!.click();
    await one.updateComplete;
    three.open = true;
    await three.updateComplete;
    await one.updateComplete;
    expect(one.open).to.be.false;
    expect(three.open).to.be.true;
  });

  it('keeps several panels open with multiple', async () => {
    const { el } = await accordion(true);
    const [one, , three] = el.items;
    one.headerButton!.click();
    three.headerButton!.click();
    await one.updateComplete;
    await three.updateComplete;
    expect(one.open).to.be.true;
    expect(three.open).to.be.true;
  });
});

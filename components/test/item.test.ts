/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Item } from '../src/item/index.js';
import { ListItem } from '../src/list/index.js';

if (!customElements.get('wc-item')) {
  customElements.define('wc-item', Item);
}

if (!customElements.get('wc-list-item')) {
  customElements.define('wc-list-item', ListItem);
}

/** Text of the first element assigned to a named slot, following nested slots. */
function slotText(root: ShadowRoot | null | undefined, name: string) {
  const slot = root?.querySelector<HTMLSlotElement>(`slot[name="${name}"]`);
  return slot?.assignedElements({ flatten: true })[0]?.textContent?.trim();
}

describe('Item', () => {
  it('renders the named-slot API', async () => {
    const el = await fixture<Item>(html`
      <wc-item>
        <span slot="overline">Overline</span>
        <span slot="headline">Headline</span>
        <span slot="supporting-text">Supporting text</span>
        <span slot="trailing-supporting-text">Trailing</span>
      </wc-item>
    `);

    await el.updateComplete;

    const shadowRoot = el.shadowRoot;
    expect(slotText(shadowRoot, 'overline')).to.equal('Overline');
    expect(slotText(shadowRoot, 'headline')).to.equal('Headline');
    expect(slotText(shadowRoot, 'supporting-text')).to.equal('Supporting text');
    expect(slotText(shadowRoot, 'trailing-supporting-text')).to.equal(
      'Trailing',
    );
    // The trailing supporting text sits beside the text column, not inside it.
    expect(
      shadowRoot?.querySelector('.text slot[name="trailing-supporting-text"]'),
    ).to.equal(null);
  });

  it('uses start and end slots', async () => {
    const el = await fixture<Item>(html`
      <wc-item>
        <span slot="start">Start</span>
        <span slot="headline">Headline</span>
        <span slot="end">End</span>
      </wc-item>
    `);

    await el.updateComplete;

    const startSlot = el.shadowRoot?.querySelector(
      'slot[name="start"]',
    ) as HTMLSlotElement | null;
    const endSlot = el.shadowRoot?.querySelector(
      'slot[name="end"]',
    ) as HTMLSlotElement | null;

    expect(startSlot?.assignedElements()[0].textContent?.trim()).to.equal(
      'Start',
    );
    expect(endSlot?.assignedElements()[0].textContent?.trim()).to.equal('End');
  });

  it('passes the list-item start, default and end content through', async () => {
    const el = await fixture<ListItem>(html`
      <wc-list-item>
        <span slot="start">Start</span>
        Profile
        <span slot="end">End</span>
      </wc-list-item>
    `);

    await el.updateComplete;

    const startSlot = el.shadowRoot?.querySelector(
      'slot[name="start"]',
    ) as HTMLSlotElement | null;
    const endSlot = el.shadowRoot?.querySelector(
      'slot[name="end"]',
    ) as HTMLSlotElement | null;

    expect(startSlot?.assignedElements()[0].textContent?.trim()).to.equal(
      'Start',
    );
    const defaultSlot = el.shadowRoot?.querySelector<HTMLSlotElement>(
      'wc-item > slot:not([name])',
    );
    expect(
      defaultSlot
        ?.assignedNodes()
        .map(node => node.textContent)
        .join(''),
    ).to.contain('Profile');
    expect(endSlot?.assignedElements()[0].textContent?.trim()).to.equal('End');
  });
});

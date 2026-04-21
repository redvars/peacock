/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Item, ListItem } from '../src/index.js';

if (!customElements.get('wc-item')) {
  customElements.define('wc-item', Item);
}

if (!customElements.get('wc-list-item')) {
  customElements.define('wc-list-item', ListItem);
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
    expect(shadowRoot?.querySelector('.overline')?.textContent?.trim()).to.equal(
      'Overline',
    );
    expect(shadowRoot?.querySelector('.headline')?.textContent?.trim()).to.equal(
      'Headline',
    );
    expect(
      shadowRoot?.querySelector('.supporting-text')?.textContent?.trim(),
    ).to.equal('Supporting text');
    expect(
      shadowRoot
        ?.querySelector('.trailing-supporting-text')
        ?.textContent?.trim(),
    ).to.equal('Trailing');
    expect(
      shadowRoot?.querySelector('.content .trailing-supporting-text'),
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

    expect(startSlot?.assignedElements()[0].textContent?.trim()).to.equal('Start');
    expect(endSlot?.assignedElements()[0].textContent?.trim()).to.equal('End');
  });

  it('does not change the legacy list-item API', async () => {
    const el = await fixture<ListItem>(html`
      <wc-list-item>
        <span slot="leading">Leading</span>
        Profile
        <span slot="trailing">Trailing</span>
      </wc-list-item>
    `);

    await el.updateComplete;

    const leadingSlot = el.shadowRoot?.querySelector(
      'slot[name="leading"]',
    ) as HTMLSlotElement | null;
    const trailingSlot = el.shadowRoot?.querySelector(
      'slot[name="trailing"]',
    ) as HTMLSlotElement | null;

    expect(leadingSlot?.assignedElements()[0].textContent?.trim()).to.equal(
      'Leading',
    );
    expect(el.shadowRoot?.querySelector('.content')?.textContent).to.contain(
      'Profile',
    );
    expect(trailingSlot?.assignedElements()[0].textContent?.trim()).to.equal(
      'Trailing',
    );
  });
});
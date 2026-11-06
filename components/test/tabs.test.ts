/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Tab, TabGroup, TabPanel, Tabs } from '../src/tabs/index.js';

for (const [tag, element] of [
  ['wc-tab', Tab],
  ['wc-tabs', Tabs],
  ['wc-tab-panel', TabPanel],
  ['wc-tab-group', TabGroup],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

describe('Tab', () => {
  it('renders the disabled reason text, not the template source', async () => {
    const el = await fixture<Tab>(
      html`<wc-tab disabled disabledReason="No access">Billing</wc-tab>`,
    );
    const reason = el.shadowRoot!.querySelector('.screen-reader-only')!;
    const button = el.shadowRoot!.querySelector('#button')!;

    expect(reason.textContent?.trim()).to.equal('No access');
    expect(button.getAttribute('aria-describedby')).to.equal(reason.id);
  });

  it('renders no disabled reason and no aria-describedby without one', async () => {
    const el = await fixture<Tab>(html`<wc-tab>Billing</wc-tab>`);
    expect(el.shadowRoot!.querySelector('.screen-reader-only')).to.not.exist;
    expect(
      el.shadowRoot!.querySelector('#button')!.hasAttribute('aria-describedby'),
    ).to.be.false;
  });
});

describe('TabGroup', () => {
  it('links tabs to panels by value', async () => {
    const el = await fixture<TabGroup>(html`
      <wc-tab-group>
        <wc-tabs>
          <wc-tab value="one">One</wc-tab>
          <wc-tab value="two" active>Two</wc-tab>
        </wc-tabs>
        <wc-tab-panel value="one">Panel 1</wc-tab-panel>
        <wc-tab-panel value="two">Panel 2</wc-tab-panel>
      </wc-tab-group>
    `);
    const [one, two] = Array.from(
      el.querySelectorAll<TabPanel>('wc-tab-panel'),
    );
    expect(one.active).to.be.false;
    expect(two.active).to.be.true;
  });

  it('does not treat a link tab target as a panel key', async () => {
    const el = await fixture<TabGroup>(html`
      <wc-tab-group>
        <wc-tabs>
          <wc-tab>One</wc-tab>
          <wc-tab href="https://example.com" target="_blank">Docs</wc-tab>
        </wc-tabs>
        <wc-tab-panel>Panel 1</wc-tab-panel>
      </wc-tab-group>
    `);
    expect(el.querySelector<TabPanel>('wc-tab-panel')!.active).to.be.true;
  });
});

/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixture } from '@open-wc/testing';
import { NavigationRail } from '../src/navigation-rail/index.js';

if (!customElements.get('wc-navigation-rail')) {
  customElements.define('wc-navigation-rail', NavigationRail);
}

describe('NavigationRail', () => {
  it('paints its container color down to the bottom edge', async () => {
    const wrapper = await fixture<HTMLDivElement>(
      html`<div style="height: 400px">
        <wc-navigation-rail></wc-navigation-rail>
      </div>`,
    );
    const el = wrapper.firstElementChild as NavigationRail;
    await el.updateComplete;
    const rail = el.shadowRoot?.querySelector<HTMLElement>('.rail');
    expect(rail).to.exist;
    const host = el.getBoundingClientRect();
    const box = rail?.getBoundingClientRect();
    expect(box?.top ?? -1).to.be.closeTo(host.top, 1);
    expect(box?.bottom ?? -1).to.be.closeTo(host.bottom, 1);
    // The 24dp inset is padding inside the container, not a gap around it.
    expect(
      parseFloat(rail ? getComputedStyle(rail).paddingTop : '0'),
    ).to.be.greaterThan(0);
  });
});

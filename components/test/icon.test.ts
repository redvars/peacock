/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Icon } from '../src/icon/index.js';

if (!customElements.get('wc-icon')) {
  customElements.define('wc-icon', Icon);
}

describe('Icon', () => {
  it('reflects its name', async () => {
    const el = await fixture<Icon>(html`<wc-icon name="home"></wc-icon>`);
    expect(el.name).to.equal('home');
    expect(el.getAttribute('name')).to.equal('home');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<Icon>(html`<wc-icon name="home"></wc-icon>`);
    await expect(el).shadowDom.to.be.accessible();
  });
});

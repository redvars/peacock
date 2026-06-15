/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Elevation } from '../src/elevation/elevation.js';

if (!customElements.get('wc-elevation')) {
  customElements.define('wc-elevation', Elevation);
}

describe('Elevation', () => {
  it('instantiates and renders shadow span', async () => {
    const el = await fixture<Elevation>(html`<wc-elevation></wc-elevation>`);
    const shadowSpan = el.shadowRoot?.querySelector('.shadow');
    expect(shadowSpan).to.exist;
  });
});

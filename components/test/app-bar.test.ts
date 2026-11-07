/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { AppBar } from '../src/app-bar/index.js';

if (!customElements.get('wc-app-bar')) {
  customElements.define('wc-app-bar', AppBar);
}

describe('AppBar', () => {
  for (const variant of ['small', 'medium'] as const) {
    it(`is not a banner landmark (${variant})`, async () => {
      const el = await fixture<AppBar>(
        html`<wc-app-bar variant=${variant}>Title</wc-app-bar>`,
      );
      expect(el.hasAttribute('role')).to.be.false;
      expect(el.shadowRoot!.querySelector('[role="banner"]')).to.be.null;
      expect(el.shadowRoot!.querySelector('header')).to.be.null;
    });
  }

  it('places start and end slot content', async () => {
    const el = await fixture<AppBar>(html`
      <wc-app-bar>
        <button slot="start">Menu</button>
        Title
        <button slot="end">Search</button>
      </wc-app-bar>
    `);
    const start = el.shadowRoot!.querySelector<HTMLSlotElement>(
      '.start slot[name="start"]',
    )!;
    const end = el.shadowRoot!.querySelector<HTMLSlotElement>(
      '.end slot[name="end"]',
    )!;
    expect(start.assignedElements()).to.have.length(1);
    expect(end.assignedElements()).to.have.length(1);
  });

  it('has no leading or trailing slots', async () => {
    const el = await fixture<AppBar>(html`<wc-app-bar>Title</wc-app-bar>`);
    expect(el.shadowRoot!.querySelector('slot[name="leading"]')).to.be.null;
    expect(el.shadowRoot!.querySelector('slot[name="trailing"]')).to.be.null;
  });
});

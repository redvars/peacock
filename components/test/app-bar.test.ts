/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { AppBar } from '../src/app-bar/index.js';
import { resetDeprecationWarnings } from '../src/__internal/utils/deprecate.js';

if (!customElements.get('wc-app-bar')) {
  customElements.define('wc-app-bar', AppBar);
}

describe('AppBar', () => {
  let warnings: string[];
  let original: typeof console.warn;

  beforeEach(() => {
    resetDeprecationWarnings();
    warnings = [];
    original = console.warn;
    console.warn = (message: string) => {
      warnings.push(message);
    };
  });

  afterEach(() => {
    console.warn = original;
  });

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

  it('places start and end slot content without warnings', async () => {
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
    expect(warnings).to.have.length(0);
  });

  it('keeps the deprecated leading and trailing slots working, with a warning', async () => {
    const el = await fixture<AppBar>(html`
      <wc-app-bar>
        <button slot="leading">Menu</button>
        Title
        <button slot="trailing">Search</button>
      </wc-app-bar>
    `);
    // slotchange fires asynchronously.
    await new Promise(resolve => {
      setTimeout(resolve);
    });
    const leading = el.shadowRoot!.querySelector<HTMLSlotElement>(
      '.start slot[name="leading"]',
    )!;
    const trailing = el.shadowRoot!.querySelector<HTMLSlotElement>(
      '.end slot[name="trailing"]',
    )!;
    expect(leading.assignedElements()).to.have.length(1);
    expect(trailing.assignedElements()).to.have.length(1);
    expect(warnings).to.have.length(2);
    expect(warnings[0]).to.contain('slot="leading"');
    expect(warnings[0]).to.contain('slot="start"');
    expect(warnings[1]).to.contain('slot="end"');
  });
});

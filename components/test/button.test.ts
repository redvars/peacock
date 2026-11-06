/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Button, IconButton } from '../src/button/index.js';

if (!customElements.get('wc-button')) {
  customElements.define('wc-button', Button);
}

if (!customElements.get('wc-icon-button')) {
  customElements.define('wc-icon-button', IconButton);
}

describe('Button', () => {
  it('reflects its default size, variant and color', async () => {
    const el = await fixture<Button>(html`<wc-button>Save</wc-button>`);

    expect(el.getAttribute('size')).to.equal('sm');
    expect(el.getAttribute('variant')).to.equal('filled');
    expect(el.getAttribute('color')).to.equal('primary');
  });

  it('renders a native button, or a link when href is set', async () => {
    const button = await fixture<Button>(html`<wc-button>Save</wc-button>`);
    expect(button.shadowRoot!.querySelector('#button')?.tagName).to.equal(
      'BUTTON',
    );

    const link = await fixture<Button>(
      html`<wc-button href="/docs">Docs</wc-button>`,
    );
    const anchor = link.shadowRoot!.querySelector('#link');
    expect(anchor?.tagName).to.equal('A');
    expect(anchor?.getAttribute('href')).to.equal('/docs');
  });

  it('renders the tooltip once', async () => {
    const button = await fixture<Button>(
      html`<wc-button tooltip="Save the file">Save</wc-button>`,
    );
    expect(button.shadowRoot!.querySelectorAll('wc-tooltip')).to.have.length(1);

    const link = await fixture<Button>(
      html`<wc-button href="/docs" tooltip="Open docs">Docs</wc-button>`,
    );
    expect(link.shadowRoot!.querySelectorAll('wc-tooltip')).to.have.length(1);
  });

  it('renders no tooltip without the tooltip property', async () => {
    const el = await fixture<Button>(html`<wc-button>Save</wc-button>`);
    expect(el.shadowRoot!.querySelector('wc-tooltip')).to.not.exist;
  });

  it('maps level presets onto color and variant', async () => {
    const el = await fixture<Button>(
      html`<wc-button level="danger">Delete</wc-button>`,
    );
    await el.updateComplete;

    expect(el.color).to.equal('danger');
    expect(el.variant).to.equal('filled');
  });

  it('accepts the secondary, tertiary and warning colors', async () => {
    for (const color of ['secondary', 'tertiary', 'warning'] as const) {
      // eslint-disable-next-line no-await-in-loop
      const el = await fixture<Button>(
        html`<wc-button color=${color}>Go</wc-button>`,
      );
      expect(el.color).to.equal(color);
      expect(el.getAttribute('color')).to.equal(color);
    }
  });

  it('disables the native button', async () => {
    const el = await fixture<Button>(
      html`<wc-button disabled>Save</wc-button>`,
    );
    const native = el.shadowRoot!.querySelector<HTMLButtonElement>('#button');
    expect(native?.disabled).to.be.true;
  });

  it('passes rel and download to its link', async () => {
    const el = await fixture<Button>(
      html`<wc-button href="/report.csv" rel="noopener" download="report.csv"
        >Get</wc-button
      >`,
    );
    const link = el.shadowRoot!.querySelector('#link')!;
    expect(link.getAttribute('rel')).to.equal('noopener');
    expect(link.getAttribute('download')).to.equal('report.csv');
  });

  it('sets aria-disabled="true" when soft-disabled, and omits it otherwise', async () => {
    const el = await fixture<Button>(
      html`<wc-button soft-disabled>Save</wc-button>`,
    );
    const native = el.shadowRoot!.querySelector('#button')!;
    expect(native.getAttribute('aria-disabled')).to.equal('true');

    el.softDisabled = false;
    await el.updateComplete;
    expect(native.hasAttribute('aria-disabled')).to.be.false;
  });

  it('reads throttle-delay as a number', async () => {
    const el = await fixture<Button>(
      html`<wc-button throttle-delay="300">Save</wc-button>`,
    );
    expect(el.throttleDelay).to.equal(300);
  });
});

describe('IconButton', () => {
  it('maps level presets onto color and variant', async () => {
    const el = await fixture<IconButton>(
      html`<wc-icon-button level="tertiary"></wc-icon-button>`,
    );
    await el.updateComplete;

    expect(el.color).to.equal('primary');
    expect(el.variant).to.equal('text');
  });

  it('points its ripple at the link in link mode', async () => {
    const el = await fixture<IconButton>(
      html`<wc-icon-button href="/home"></wc-icon-button>`,
    );
    expect(
      el.shadowRoot!.querySelector('wc-ripple')!.getAttribute('for'),
    ).to.equal('link');
  });
});

/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Field } from '../src/field/index.js';

if (!customElements.get('wc-field')) {
  customElements.define('wc-field', Field);
}

describe('Field', () => {
  it('renders the label and a required marker', async () => {
    const el = await fixture<Field>(
      html`<wc-field label="Name" required><input /></wc-field>`,
    );

    const label = el.shadowRoot!.querySelector('.label');
    expect(label?.textContent).to.contain('Name');
    expect(el.shadowRoot!.querySelector('.required')).to.exist;
  });

  it('applies a class for each variant', async () => {
    for (const variant of ['default', 'outlined', 'filled'] as const) {
      // eslint-disable-next-line no-await-in-loop
      const el = await fixture<Field>(
        html`<wc-field variant=${variant}><input /></wc-field>`,
      );
      expect(el.shadowRoot!.querySelector(`.field.variant-${variant}`)).to
        .exist;
    }
  });

  it('shows helper text, replaced by the error text on error', async () => {
    const el = await fixture<Field>(
      html`<wc-field helper-text="We never share it" error-text="Required"
        ><input
      /></wc-field>`,
    );
    expect(el.shadowRoot!.querySelector('.helper')?.textContent).to.equal(
      'We never share it',
    );

    el.error = true;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.field.has-error')).to.exist;
    expect(el.shadowRoot!.querySelector('.helper')?.textContent).to.equal(
      'Required',
    );
  });

  it('renders the text count', async () => {
    const el = await fixture<Field>(
      html`<wc-field text-count="3 / 10"><input /></wc-field>`,
    );
    expect(el.shadowRoot!.querySelector('.text-count')?.textContent).to.equal(
      '3 / 10',
    );
  });

  it('tracks content in the start and end slots', async () => {
    const el = await fixture<Field>(html`
      <wc-field>
        <span slot="field-start">$</span>
        <input />
      </wc-field>
    `);
    await el.updateComplete;

    expect(el.slotStartHasContent).to.be.true;
    expect(el.slotEndHasContent).to.be.false;
  });

  it('focuses its host when the body is clicked', async () => {
    let focused = false;
    const host = document.createElement('div');
    host.focus = () => {
      focused = true;
    };
    const el = await fixture<Field>(
      html`<wc-field .host=${host}><span>value</span></wc-field>`,
    );

    el.shadowRoot!.querySelector<HTMLElement>('.field-body')!.click();
    expect(focused).to.be.true;
  });
});

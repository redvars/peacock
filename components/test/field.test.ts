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

  describe('read-only', () => {
    /** The tokens the states draw with, which the tests do not otherwise load. */
    const tokens =
      '--color-on-surface: rgb(1, 2, 3); --color-on-surface-variant: rgb(4, 5, 6)';

    async function field(attributes: 'readonly' | 'disabled' | '') {
      const wrapper = await fixture<HTMLElement>(
        html`<div style=${tokens}>
          <wc-field
            ?readonly=${attributes === 'readonly'}
            ?disabled=${attributes === 'disabled'}
            helper-text="Help"
            ><input
          /></wc-field>
        </div>`,
      );
      const el = wrapper.querySelector('wc-field') as Field;
      await el.updateComplete;
      return el;
    }

    function style(el: Field, selector: string) {
      return getComputedStyle(el.shadowRoot!.querySelector(selector)!);
    }

    /** How much ink the container puts down: its opacity times its color's alpha. */
    function containerInk(el: Field) {
      const background = style(el, '.background');
      const alpha = background.backgroundColor.match(
        /(?:rgba\(.*,|\/)\s*([\d.]+)\)$/,
      );
      return Number(background.opacity) * (alpha ? Number(alpha[1]) : 1);
    }

    it('draws a lighter container than a disabled field', async () => {
      const readonly = await field('readonly');
      const disabled = await field('disabled');

      expect(containerInk(readonly)).to.be.greaterThan(0);
      expect(containerInk(readonly)).to.be.lessThan(containerInk(disabled));
      expect(containerInk(readonly)).to.be.closeTo(0.04, 0.01);
    });

    it('keeps the value and helper text at full contrast', async () => {
      const readonly = await field('readonly');
      const editable = await field('');

      expect(style(readonly, '.helper').opacity).to.equal('1');
      const input = (el: Field) =>
        getComputedStyle(el.querySelector('input') as HTMLInputElement).color;
      expect(input(readonly)).to.equal(input(editable));
      expect(input(readonly)).to.equal('rgb(1, 2, 3)');
    });

    it('lightens its outline until focused', async () => {
      const readonly = await field('readonly');
      expect(style(readonly, '.outline').opacity).to.equal('0.38');

      readonly.focused = true;
      await readonly.updateComplete;
      expect(style(readonly, '.outline').opacity).to.equal('1');
    });
  });
});

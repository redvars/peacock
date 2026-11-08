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

  /** The tokens the states draw with, which the tests do not otherwise load. */
  const tokens =
    '--color-on-surface: rgb(1, 2, 3); --color-on-surface-variant: rgb(4, 5, 6); --color-surface-container-lowest: rgb(7, 8, 9); --color-outline: rgb(10, 11, 12); --color-primary: rgb(13, 14, 15)';

  async function field(
    state: 'readonly' | 'disabled' | '',
    variant: 'default' | 'outlined' | 'filled' = 'default',
  ) {
    const wrapper = await fixture<HTMLElement>(
      html`<div style=${tokens}>
        <wc-field
          variant=${variant}
          label="Name"
          ?readonly=${state === 'readonly'}
          ?disabled=${state === 'disabled'}
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

  /** The alpha of a computed color: `rgba(…, a)`, `color(… / a)`, or 1. */
  function alphaOf(color: string) {
    const alpha = color.match(/(?:rgba\(.*,|\/)\s*([\d.]+)\)$/);
    return alpha ? Number(alpha[1]) : 1;
  }

  /** How much ink the container puts down: its opacity times its color's alpha. */
  function containerInk(el: Field) {
    const background = style(el, '.background');
    return Number(background.opacity) * alphaOf(background.backgroundColor);
  }

  function inputColor(el: Field) {
    return getComputedStyle(el.querySelector('input') as HTMLInputElement).color;
  }

  describe('container', () => {
    it('fills the default field with surface-container-lowest', async () => {
      const el = await field('');
      expect(style(el, '.background').backgroundColor).to.equal('rgb(7, 8, 9)');
      expect(containerInk(el)).to.equal(1);
    });

    it('leaves the outlined field without a container', async () => {
      const el = await field('', 'outlined');
      expect(containerInk(el)).to.equal(0);
    });
  });

  describe('disabled', () => {
    it('draws the M3 disabled field: 38% text, 12% outline, 4% container', async () => {
      const el = await field('disabled');

      expect(alphaOf(inputColor(el))).to.be.closeTo(0.38, 0.01);
      expect(style(el, '.label').opacity).to.equal('0.38');
      expect(style(el, '.helper').opacity).to.equal('0.38');
      expect(style(el, '.outline').opacity).to.equal('0.12');
      expect(containerInk(el)).to.be.closeTo(0.04, 0.01);
    });

    it('keeps the filled bottom line at 38% and the outlined field unfilled', async () => {
      expect(style(await field('disabled', 'filled'), '.outline').opacity).to.equal('0.38');
      expect(containerInk(await field('disabled', 'outlined'))).to.equal(0);
    });
  });

  describe('outlined', () => {
    const part = (el: Field, selector: string) =>
      el.shadowRoot!.querySelector<HTMLElement>(selector);

    it('builds the outline from a start, a notch sized by the label and an end', async () => {
      const el = await field('', 'outlined');

      expect(part(el, '.outline .outline-start')).to.exist;
      expect(part(el, '.outline .outline-notch')).to.exist;
      expect(part(el, '.outline .outline-end')).to.exist;
      expect(part(el, '.outline-notch-label')?.textContent?.trim()).to.equal('Name');
      expect(style(el, '.outline-notch').borderTopStyle).to.equal('none');
      expect(style(el, '.outline').borderTopStyle).to.equal('none');
    });

    it('keeps the label inside the outline, with no header above it', async () => {
      const el = await field('', 'outlined');

      expect(part(el, '.field-header')).to.not.exist;
      expect(part(el, '.field-body .outlined-label')?.textContent).to.contain('Name');
    });

    it('rests the label until focused or populated, then floats it into the notch', async () => {
      const el = await field('', 'outlined');
      const fieldEl = part(el, '.field')!;
      expect(fieldEl.classList.contains('label-floating')).to.be.false;

      el.focused = true;
      await el.updateComplete;
      expect(fieldEl.classList.contains('label-floating')).to.be.true;

      el.focused = false;
      el.populated = true;
      await el.updateComplete;
      expect(fieldEl.classList.contains('label-floating')).to.be.true;
    });

    it('draws a 1px outline, 2px while focused', async () => {
      const el = await field('', 'outlined');
      expect(style(el, '.outline-start').borderTopWidth).to.equal('1px');
      expect(style(el, '.outline-end').borderBottomWidth).to.equal('1px');

      el.focused = true;
      await el.updateComplete;
      expect(style(el, '.outline-start').borderTopWidth).to.equal('2px');
      expect(style(el, '.outline-notch').borderBottomWidth).to.equal('2px');
    });

    it('opens no notch without a label', async () => {
      const el = await fixture<Field>(
        html`<wc-field variant="outlined" focused><input /></wc-field>`,
      );
      expect(part(el, '.outline-notch-label')).to.not.exist;
      expect(part(el, '.outlined-label')).to.not.exist;
    });

    it('keeps the label in the same place for the required mark', async () => {
      const el = await fixture<Field>(
        html`<wc-field variant="outlined" label="Name" required><input /></wc-field>`,
      );
      expect(part(el, '.outlined-label .required')).to.exist;
      expect(part(el, '.outline-notch-label .required')).to.exist;
    });
  });

  describe('read-only', () => {
    it('stands apart from disabled by its value and outline, not its container', async () => {
      const readonly = await field('readonly');
      const disabled = await field('disabled');

      expect(containerInk(readonly)).to.be.closeTo(0.04, 0.01);
      expect(alphaOf(inputColor(readonly))).to.equal(1);
      expect(alphaOf(inputColor(disabled))).to.be.lessThan(1);
      expect(Number(style(readonly, '.outline').opacity)).to.be.greaterThan(
        Number(style(disabled, '.outline').opacity),
      );
    });

    it('keeps the value and helper text at full contrast', async () => {
      const readonly = await field('readonly');
      const editable = await field('');

      expect(style(readonly, '.helper').opacity).to.equal('1');
      expect(inputColor(readonly)).to.equal(inputColor(editable));
      expect(inputColor(readonly)).to.equal('rgb(1, 2, 3)');
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

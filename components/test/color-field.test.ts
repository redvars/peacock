/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { ColorField } from '../src/color-field/index.js';
import { ColorPicker } from '../src/color-picker/index.js';
import { Field } from '../src/field/index.js';
import { Popover, PopoverContent } from '../src/popover/index.js';

for (const [tag, element] of [
  ['wc-field', Field],
  ['wc-popover', Popover],
  ['wc-popover-content', PopoverContent],
  ['wc-color-picker', ColorPicker],
  ['wc-color-field', ColorField],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function textInput(el: ColorField) {
  return el.shadowRoot!.querySelector<HTMLInputElement>('.input')!;
}

describe('ColorField', () => {
  it('shows the value as text and as the swatch color', async () => {
    const el = await fixture<ColorField>(
      html`<wc-color-field value="#336699"></wc-color-field>`,
    );
    const swatch = el.shadowRoot!.querySelector<HTMLElement>('.swatch')!;

    expect(textInput(el).value).to.equal('#336699');
    expect(swatch.style.getPropertyValue('--_swatch-color')).to.equal(
      '#336699',
    );
  });

  it('commits a typed hex value on change', async () => {
    const el = await fixture<ColorField>(
      html`<wc-color-field></wc-color-field>`,
    );
    const input = textInput(el);
    input.value = 'ABC';
    input.dispatchEvent(new InputEvent('input'));

    setTimeout(() => input.dispatchEvent(new Event('change')));
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;

    expect(event.detail.value).to.equal('#aabbcc');
    expect(el.value).to.equal('#aabbcc');
  });

  it('flags text that is not a hex color', async () => {
    const el = await fixture<ColorField>(
      html`<wc-color-field value="#000000"></wc-color-field>`,
    );
    const input = textInput(el);
    input.value = 'purple';
    input.dispatchEvent(new InputEvent('input'));
    input.dispatchEvent(new Event('change'));
    await el.updateComplete;

    expect(el.value).to.equal('#000000');
    expect(el.shadowRoot!.querySelector<Field>('wc-field')!.error).to.be.true;
  });

  it('opens the picker from the swatch and takes its color', async () => {
    const el = await fixture<ColorField>(
      html`<wc-color-field value="#000000"></wc-color-field>`,
    );
    const popover = el.shadowRoot!.querySelector<Popover>('wc-popover')!;
    await popover.updateComplete;

    el.shadowRoot!.querySelector<HTMLButtonElement>('.swatch')!.click();
    await el.updateComplete;
    expect(popover.open).to.be.true;

    const picker =
      el.shadowRoot!.querySelector<ColorPicker>('wc-color-picker')!;
    setTimeout(() =>
      picker.dispatchEvent(
        new CustomEvent('change', {
          detail: { value: '#ff0000', alpha: 1 },
          bubbles: true,
          composed: true,
        }),
      ),
    );
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;

    expect(event.detail.value).to.equal('#ff0000');
    expect(el.value).to.equal('#ff0000');
  });

  it('submits its value with a form', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <wc-color-field name="brand" value="#7c5df0"></wc-color-field>
      </form>
    `);
    expect(new FormData(form).get('brand')).to.equal('#7c5df0');
  });
});

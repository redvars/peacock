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

  it('does not reflect value to an attribute', async () => {
    const el = await fixture<ColorField>(
      html`<wc-color-field></wc-color-field>`,
    );
    el.value = '#112233';
    await el.updateComplete;
    expect(el.hasAttribute('value')).to.be.false;
  });

  it('fires CustomEvents with the value, and no native events', async () => {
    const wrapper = await fixture<HTMLDivElement>(
      html`<div><wc-color-field value="#000000"></wc-color-field></div>`,
    );
    const el = wrapper.querySelector<ColorField>('wc-color-field')!;
    const events: Event[] = [];
    wrapper.addEventListener('input', e => events.push(e));
    wrapper.addEventListener('change', e => events.push(e));

    const input = textInput(el);
    input.value = '#123456';
    input.dispatchEvent(
      new InputEvent('input', { bubbles: true, composed: true }),
    );
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(events.map(e => e.type)).to.deep.equal(['change']);
    expect(events.every(e => e instanceof CustomEvent)).to.be.true;
    expect((events[0] as CustomEvent).detail.value).to.equal('#123456');
  });

  it('names the text input from its label, or a default name', async () => {
    const labelled = await fixture<ColorField>(
      html`<wc-color-field label="Brand"></wc-color-field>`,
    );
    expect(textInput(labelled).getAttribute('aria-label')).to.equal('Brand');

    const unlabelled = await fixture<ColorField>(
      html`<wc-color-field></wc-color-field>`,
    );
    expect(textInput(unlabelled).getAttribute('aria-label')).to.equal(
      'Hex color',
    );
  });

  it('defaults to the sm size', async () => {
    const el = await fixture<ColorField>(
      html`<wc-color-field></wc-color-field>`,
    );
    expect(el.size).to.equal('sm');
    expect(el.shadowRoot!.querySelector<Field>('wc-field')!.size).to.equal(
      'sm',
    );
  });

  it('clears the value with the clear button', async () => {
    const el = await fixture<ColorField>(
      html`<wc-color-field clearable></wc-color-field>`,
    );
    const changes: string[] = [];
    el.addEventListener('change', e =>
      changes.push((e as CustomEvent).detail.value),
    );

    el.shadowRoot!.querySelector<HTMLElement>('.clear-button')!.click();
    await el.updateComplete;

    expect(el.value).to.equal('');
    expect(changes).to.deep.equal(['']);
  });

  it('blocks form submission while required and empty', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><wc-color-field name="c" required value=""></wc-color-field></form>
    `);
    const el = form.querySelector<ColorField>('wc-color-field')!;
    await el.updateComplete;

    expect(form.checkValidity()).to.be.false;
    expect(el.validity.valueMissing).to.be.true;
    expect(el.matches(':invalid')).to.be.true;

    el.value = '#ffffff';
    await el.updateComplete;
    expect(form.checkValidity()).to.be.true;
  });

  it('shows the message under the field after reportValidity()', async () => {
    const el = await fixture<ColorField>(
      html`<wc-color-field label="Brand" required value=""></wc-color-field>`,
    );
    const field = el.shadowRoot!.querySelector<Field>('wc-field')!;
    expect(field.error).to.be.false;

    el.reportValidity();
    await el.updateComplete;

    expect(field.error).to.be.true;
    expect(field.errorText).to.equal(el.validationMessage);
    expect(textInput(el).getAttribute('aria-invalid')).to.equal('true');
  });

  it('is badInput while the typed text is not a hex color', async () => {
    const el = await fixture<ColorField>(
      html`<wc-color-field value="#000000"></wc-color-field>`,
    );
    const input = textInput(el);
    input.value = 'purple';
    input.dispatchEvent(new InputEvent('input'));
    input.dispatchEvent(new Event('change'));
    await el.updateComplete;

    expect(el.validity.badInput).to.be.true;
    expect(el.validationMessage).to.equal(
      el.shadowRoot!.querySelector<Field>('wc-field')!.errorText,
    );
  });

  it('keeps its value while typing in the picker hex box', async () => {
    const el = await fixture<ColorField>(
      html`<wc-color-field value="#336699"></wc-color-field>`,
    );
    const picker =
      el.shadowRoot!.querySelector<ColorPicker>('wc-color-picker')!;
    await picker.updateComplete;
    const hex =
      picker.shadowRoot!.querySelector<HTMLInputElement>('.hex-input')!;

    // An incomplete hex value: the picker emits nothing, and its native `input` must not reach
    // the field (it used to wipe the value).
    hex.value = '12';
    hex.dispatchEvent(
      new InputEvent('input', { bubbles: true, composed: true }),
    );
    await el.updateComplete;

    expect(el.value).to.equal('#336699');
  });
});

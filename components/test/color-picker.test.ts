/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { ColorPicker } from '../src/color-picker/color-picker.js';

if (!customElements.get('wc-color-picker')) {
  customElements.define('wc-color-picker', ColorPicker);
}

function hexInput(el: ColorPicker) {
  return el.shadowRoot!.querySelector<HTMLInputElement>('.hex-input')!;
}

describe('ColorPicker', () => {
  it('shows the value in the hex input', async () => {
    const el = await fixture<ColorPicker>(
      html`<wc-color-picker value="#ff5733"></wc-color-picker>`,
    );
    expect(hexInput(el).value).to.equal('FF5733');
  });

  it('follows value changes made from outside', async () => {
    const el = await fixture<ColorPicker>(
      html`<wc-color-picker value="#ff5733"></wc-color-picker>`,
    );
    el.value = '#00ff00';
    await el.updateComplete;
    expect(hexInput(el).value).to.equal('00FF00');
  });

  it('fires input and updates value when a valid hex is typed', async () => {
    const el = await fixture<ColorPicker>(
      html`<wc-color-picker value="#000000"></wc-color-picker>`,
    );
    const input = hexInput(el);
    input.value = '336699';

    setTimeout(() =>
      input.dispatchEvent(new InputEvent('input', { bubbles: true })),
    );
    const event = (await oneEvent(el, 'input')) as CustomEvent<{
      value: string;
    }>;

    expect(event.detail.value).to.equal('#336699');
    expect(el.value).to.equal('#336699');
  });

  it('reverts the hex input on change when the text is not a color', async () => {
    const el = await fixture<ColorPicker>(
      html`<wc-color-picker value="#123456"></wc-color-picker>`,
    );
    const input = hexInput(el);
    input.value = 'XYZ';
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));
    await el.updateComplete;
    input.dispatchEvent(new Event('change'));
    await el.updateComplete;

    expect(el.value).to.equal('#123456');
    expect(input.value).to.equal('123456');
  });

  it('moves the hue with the arrow keys and commits the change', async () => {
    const el = await fixture<ColorPicker>(
      html`<wc-color-picker value="#ff0000"></wc-color-picker>`,
    );
    const hueThumb = el.shadowRoot!.querySelector<HTMLElement>(
      '.hue-track .slider-thumb',
    )!;

    setTimeout(() =>
      hueThumb.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowRight',
          shiftKey: true,
          bubbles: true,
        }),
      ),
    );
    await oneEvent(el, 'change');
    await el.updateComplete;

    expect(el.value).to.not.equal('#ff0000');
    expect(hueThumb.getAttribute('aria-valuenow')).to.equal('10');
  });

  it('does not reflect value to an attribute', async () => {
    const el = await fixture<ColorPicker>(
      html`<wc-color-picker></wc-color-picker>`,
    );
    el.value = '#00ff00';
    await el.updateComplete;
    expect(el.hasAttribute('value')).to.be.false;
  });

  it('shows the alpha controls only with alpha', async () => {
    const plain = await fixture<ColorPicker>(
      html`<wc-color-picker></wc-color-picker>`,
    );
    expect(plain.shadowRoot!.querySelector('.alpha-track')).to.not.exist;

    const withAlpha = await fixture<ColorPicker>(
      html`<wc-color-picker alpha></wc-color-picker>`,
    );
    expect(withAlpha.shadowRoot!.querySelector('.alpha-track')).to.exist;
  });

  it('ignores keys while disabled', async () => {
    const el = await fixture<ColorPicker>(
      html`<wc-color-picker value="#ff0000" disabled></wc-color-picker>`,
    );
    el.shadowRoot!.querySelector<HTMLElement>(
      '.hue-track .slider-thumb',
    )!.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );
    await el.updateComplete;
    expect(el.value).to.equal('#ff0000');
  });

  it('reads the opacity from an 8-digit value', async () => {
    const el = await fixture<ColorPicker>(
      html`<wc-color-picker alpha value="#ff000080"></wc-color-picker>`,
    );
    expect(hexInput(el).value).to.equal('FF0000');
    const alphaInput =
      el.shadowRoot!.querySelector<HTMLInputElement>('.alpha-input')!;
    expect(alphaInput.value).to.equal('50');
  });

  it('puts the opacity in the value with alpha, and keeps detail.alpha', async () => {
    const el = await fixture<ColorPicker>(
      html`<wc-color-picker alpha value="#ff0000"></wc-color-picker>`,
    );
    const alphaThumb = el.shadowRoot!.querySelector<HTMLElement>(
      '.alpha-track .slider-thumb',
    )!;
    setTimeout(() =>
      alphaThumb.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'ArrowLeft',
          shiftKey: true,
          bubbles: true,
        }),
      ),
    );
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
      alpha: number;
    }>;
    expect(event.detail.value).to.equal('#ff0000e6');
    expect(event.detail.alpha).to.be.closeTo(0.9, 0.001);
    expect(el.value).to.equal('#ff0000e6');
  });

  it('keeps a 6-digit value without alpha', async () => {
    const el = await fixture<ColorPicker>(
      html`<wc-color-picker value="#ff000080"></wc-color-picker>`,
    );
    const hueThumb = el.shadowRoot!.querySelector<HTMLElement>(
      '.hue-track .slider-thumb',
    )!;
    setTimeout(() =>
      hueThumb.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
      ),
    );
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;
    expect(event.detail.value).to.match(/^#[0-9a-f]{6}$/);
  });

  it('takes a typed 8-digit hex with alpha', async () => {
    const el = await fixture<ColorPicker>(
      html`<wc-color-picker alpha value="#000000"></wc-color-picker>`,
    );
    const input = hexInput(el);
    expect(input.maxLength).to.equal(8);
    input.value = '33669980';
    setTimeout(() =>
      input.dispatchEvent(new InputEvent('input', { bubbles: true })),
    );
    const event = (await oneEvent(el, 'input')) as CustomEvent<{
      value: string;
    }>;
    expect(event.detail.value).to.equal('#33669980');
  });

  it('changes nothing by keyboard or typing while readonly', async () => {
    const el = await fixture<ColorPicker>(
      html`<wc-color-picker
        alpha
        readonly
        value="#ff0000ff"
      ></wc-color-picker>`,
    );
    const events: Event[] = [];
    el.addEventListener('input', e => events.push(e));
    el.addEventListener('change', e => events.push(e));
    for (const selector of [
      '.sv-cursor',
      '.hue-track .slider-thumb',
      '.alpha-track .slider-thumb',
    ]) {
      const thumb = el.shadowRoot!.querySelector<HTMLElement>(selector)!;
      expect(thumb.getAttribute('aria-readonly')).to.equal('true');
      thumb.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
      );
    }
    const input = hexInput(el);
    expect(input.readOnly).to.be.true;
    input.value = '00FF00';
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));
    el.shadowRoot!.querySelector<HTMLElement>('.sv-panel')!.dispatchEvent(
      new PointerEvent('pointerdown', { clientX: 1, clientY: 1 }),
    );
    await el.updateComplete;
    expect(events).to.be.empty;
    expect(el.value).to.equal('#ff0000ff');
  });
});

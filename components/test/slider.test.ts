/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { Slider } from '../src/slider/slider.js';

if (!customElements.get('wc-slider')) {
  customElements.define('wc-slider', Slider);
}

function thumb(el: Slider) {
  return el.shadowRoot!.querySelector<HTMLElement>('.thumb')!;
}

function press(el: Slider, key: string, shiftKey = false) {
  thumb(el).dispatchEvent(
    new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }),
  );
}

describe('Slider', () => {
  it('exposes its range to assistive technology', async () => {
    const el = await fixture<Slider>(
      html`<wc-slider min="10" max="90" value="40"></wc-slider>`,
    );
    const handle = thumb(el);

    expect(handle.getAttribute('role')).to.equal('slider');
    expect(handle.getAttribute('aria-valuemin')).to.equal('10');
    expect(handle.getAttribute('aria-valuemax')).to.equal('90');
    expect(handle.getAttribute('aria-valuenow')).to.equal('40');
  });

  it('steps with the arrow keys and fires input and change', async () => {
    const el = await fixture<Slider>(
      html`<wc-slider value="50" step="5"></wc-slider>`,
    );

    let inputs = 0;
    el.addEventListener('input', () => {
      inputs += 1;
    });
    setTimeout(() => press(el, 'ArrowRight'));
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: number;
    }>;

    expect(event.detail.value).to.equal(55);
    expect(el.value).to.equal(55);
    expect(inputs).to.equal(1);

    press(el, 'ArrowLeft', true);
    expect(el.value).to.equal(5);
  });

  it('jumps to the ends with Home and End', async () => {
    const el = await fixture<Slider>(
      html`<wc-slider min="0" max="20" value="7"></wc-slider>`,
    );

    press(el, 'End');
    expect(el.value).to.equal(20);
    press(el, 'ArrowRight');
    expect(el.value).to.equal(20);

    press(el, 'Home');
    expect(el.value).to.equal(0);
  });

  it('ignores keys while disabled', async () => {
    const el = await fixture<Slider>(
      html`<wc-slider value="50" disabled></wc-slider>`,
    );
    press(el, 'ArrowRight');
    expect(el.value).to.equal(50);
    expect(thumb(el).getAttribute('tabindex')).to.equal('-1');
  });

  it('shows the value beside the track with show-value', async () => {
    const el = await fixture<Slider>(
      html`<wc-slider value="30" show-value></wc-slider>`,
    );
    expect(
      el.shadowRoot!.querySelector('.value-display')?.textContent,
    ).to.equal('30');
  });

  it('submits with a form and restores its value on reset', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><wc-slider name="volume" value="30"></wc-slider></form>
    `);
    const el = form.querySelector<Slider>('wc-slider')!;

    expect(new FormData(form).get('volume')).to.equal('30');

    press(el, 'End');
    expect(new FormData(form).get('volume')).to.equal('100');

    form.reset();
    expect(el.value).to.equal(30);
  });
});

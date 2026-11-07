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

  it('shows the value beside the track with value-label="end"', async () => {
    const el = await fixture<Slider>(
      html`<wc-slider value="30" value-label="end"></wc-slider>`,
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

  it('snaps pointer input to steps counted from min', async () => {
    const el = await fixture<Slider>(
      html`<wc-slider
        min="1"
        max="21"
        step="5"
        value="1"
        style="width: 200px"
      ></wc-slider>`,
    );
    const track =
      el.shadowRoot!.querySelector<HTMLElement>('.slider-container')!;
    const rect = track.getBoundingClientRect();

    // 40% of the range is 9; the nearest step from min is 11 (1, 6, 11, ...), not 10.
    track.dispatchEvent(
      new MouseEvent('mousedown', {
        clientX: rect.left + rect.width * 0.4,
        bubbles: true,
        composed: true,
      }),
    );
    window.dispatchEvent(new MouseEvent('mouseup'));

    expect([1, 6, 11, 16, 21]).to.include(el.value);
    expect(el.value).to.equal(11);
  });

  it('does not reflect value to an attribute', async () => {
    const el = await fixture<Slider>(html`<wc-slider></wc-slider>`);
    el.value = 30;
    await el.updateComplete;
    expect(el.hasAttribute('value')).to.be.false;
  });

  it('starts at the middle of the range without a value', async () => {
    const el = await fixture<Slider>(
      html`<wc-slider min="10" max="20"></wc-slider>`,
    );
    expect(el.value).to.equal(15);
    el.max = 30;
    await el.updateComplete;
    expect(el.value).to.equal(20);
    expect(thumb(el).getAttribute('aria-valuenow')).to.equal('20');
  });

  it('shows a label that names the thumb, else falls back to "Slider"', async () => {
    const el = await fixture<Slider>(
      html`<wc-slider label="Volume"></wc-slider>`,
    );
    const id = thumb(el).getAttribute('aria-labelledby')!;
    expect(el.shadowRoot!.getElementById(id)?.textContent).to.equal('Volume');
    expect(thumb(el).hasAttribute('aria-label')).to.be.false;

    el.label = '';
    await el.updateComplete;
    expect(thumb(el).getAttribute('aria-label')).to.equal('Slider');
  });

  it('formats aria-valuetext and the shown value with valueText', async () => {
    const el = await fixture<Slider>(
      html`<wc-slider
        value="40"
        value-label="end"
        .valueText=${(v: number) => `${v}%`}
      ></wc-slider>`,
    );
    expect(thumb(el).getAttribute('aria-valuetext')).to.equal('40%');
    expect(
      el.shadowRoot!.querySelector('.value-display')?.textContent,
    ).to.equal('40%');
    expect(el.shadowRoot!.querySelector('.value-label')).to.be.null;
  });

  it('moves ten steps with Page Up and Page Down', async () => {
    const el = await fixture<Slider>(
      html`<wc-slider value="50" step="2"></wc-slider>`,
    );
    press(el, 'PageUp');
    expect(el.value).to.equal(70);
    press(el, 'PageDown');
    press(el, 'PageDown');
    expect(el.value).to.equal(30);
  });

  it('ignores keys while readonly but stays focusable', async () => {
    const el = await fixture<Slider>(
      html`<wc-slider value="50" readonly></wc-slider>`,
    );
    press(el, 'ArrowRight');
    expect(el.value).to.equal(50);
    expect(thumb(el).getAttribute('tabindex')).to.equal('0');
    expect(thumb(el).getAttribute('aria-readonly')).to.equal('true');
  });

  it('shows helper text, and error-text while error is set', async () => {
    const el = await fixture<Slider>(
      html`<wc-slider helper-text="Pick a level"></wc-slider>`,
    );
    const helper = () =>
      el.shadowRoot!.querySelector('.helper')?.textContent?.trim();
    expect(helper()).to.equal('Pick a level');
    expect(thumb(el).getAttribute('aria-describedby')).to.exist;

    el.error = true;
    el.errorText = 'Too loud';
    await el.updateComplete;
    expect(helper()).to.equal('Too loud');
    expect(thumb(el).getAttribute('aria-invalid')).to.equal('true');
  });

  it('reflects size', async () => {
    const el = await fixture<Slider>(html`<wc-slider size="lg"></wc-slider>`);
    expect(el.getAttribute('size')).to.equal('lg');
  });

  it('shows no value with value-label="none"', async () => {
    const el = await fixture<Slider>(
      html`<wc-slider value-label="none"></wc-slider>`,
    );
    expect(el.shadowRoot!.querySelector('.value-label')).to.be.null;
    expect(el.shadowRoot!.querySelector('.value-display')).to.be.null;
  });
});

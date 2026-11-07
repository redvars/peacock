/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Clock } from '../src/clock/index.js';

if (!customElements.get('wc-clock')) {
  customElements.define('wc-clock', Clock);
}

function text(el: Clock) {
  return el.shadowRoot?.querySelector('.current-time')?.textContent?.trim();
}

describe('Clock', () => {
  it('ticks once a second', async () => {
    const el = await fixture<Clock>(html`<wc-clock></wc-clock>`);
    expect(el.clockController.period).to.equal(1000);
  });

  it('schedules each tick for the next second boundary', async () => {
    const el = await fixture<Clock>(html`<wc-clock></wc-clock>`);
    const controller = el.clockController;
    expect(controller.delayUntilNextTick(10_000)).to.equal(1000);
    expect(controller.delayUntilNextTick(10_001)).to.equal(999);
    expect(controller.delayUntilNextTick(10_750)).to.equal(250);
    expect(controller.delayUntilNextTick(10_999)).to.equal(1);
  });

  it('re-renders with the new time on each tick', async () => {
    const el = await fixture<Clock>(
      html`<wc-clock locale="en-US" timezone="UTC"></wc-clock>`,
    );
    const before = el.clockController.value;
    el.clockController.tick();
    expect(el.clockController.value).not.to.equal(before);
    await el.updateComplete;
    const expected = el.clockController.value.toLocaleTimeString('en-US', {
      timeZone: 'UTC',
    });
    expect(text(el)).to.equal(expected);
  });

  it('formats with the locale property', async () => {
    const el = await fixture<Clock>(
      html`<wc-clock locale="de-DE" timezone="UTC"></wc-clock>`,
    );
    const expected = el.clockController.value.toLocaleTimeString('de-DE', {
      timeZone: 'UTC',
    });
    expect(text(el)).to.equal(expected);
  });

  it('defaults the locale to the nearest lang', async () => {
    const wrapper = await fixture<HTMLDivElement>(
      html`<div lang="de-DE"><wc-clock timezone="UTC"></wc-clock></div>`,
    );
    const el = wrapper.querySelector('wc-clock') as Clock;
    await el.updateComplete;
    const expected = el.clockController.value.toLocaleTimeString('de-DE', {
      timeZone: 'UTC',
    });
    expect(text(el)).to.equal(expected);
  });
});

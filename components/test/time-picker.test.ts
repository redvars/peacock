/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { TimePicker } from '../src/time-picker/index.js';

if (!customElements.get('wc-time-picker')) {
  customElements.define('wc-time-picker', TimePicker);
}

const column = (el: TimePicker, name: string) =>
  el.shadowRoot!.querySelector<HTMLElement>(`[data-column="${name}"]`)!;

const option = (el: TimePicker, name: string, label: string) =>
  Array.from(
    column(el, name).querySelectorAll<HTMLElement>('[role="option"]'),
  ).find(o => o.textContent!.trim() === label)!;

describe('TimePicker', () => {
  it('shows 24-hour columns and selects the value', async () => {
    const el = await fixture<TimePicker>(
      html`<wc-time-picker
        value="09:30"
        hour-cycle="h23"
        step="15"
      ></wc-time-picker>`,
    );
    expect(column(el, 'period')).to.be.null;
    expect(
      column(el, 'minute').querySelectorAll('[role="option"]'),
    ).to.have.length(4);
    expect(option(el, 'hour', '09').getAttribute('aria-selected')).to.equal(
      'true',
    );
    expect(option(el, 'minute', '30').getAttribute('aria-selected')).to.equal(
      'true',
    );
  });

  it('maps 12-hour picks to a 24-hour value', async () => {
    const el = await fixture<TimePicker>(
      html`<wc-time-picker
        value="09:30"
        hour-cycle="h12"
        locale="en-US"
      ></wc-time-picker>`,
    );
    setTimeout(() => option(el, 'period', 'PM').click());
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;
    expect(event.detail.value).to.equal('21:30');
  });

  it('fires input for an hour and change for the last column', async () => {
    const el = await fixture<TimePicker>(
      html`<wc-time-picker value="09:30" hour-cycle="h23"></wc-time-picker>`,
    );
    setTimeout(() => option(el, 'hour', '14').click());
    const input = (await oneEvent(el, 'input')) as CustomEvent<{
      value: string;
    }>;
    expect(input.detail.value).to.equal('14:30');
    await el.updateComplete;

    setTimeout(() => option(el, 'minute', '45').click());
    const change = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;
    expect(change.detail.value).to.equal('14:45');
  });

  it('steps with the arrow keys and skips times outside min and max', async () => {
    const el = await fixture<TimePicker>(
      html`<wc-time-picker
        value="09:00"
        hour-cycle="h23"
        min="08:00"
        max="10:59"
      ></wc-time-picker>`,
    );
    expect(option(el, 'hour', '07').getAttribute('aria-disabled')).to.equal(
      'true',
    );
    const hours = column(el, 'hour');
    hours.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await el.updateComplete;
    expect(el.value).to.equal('10:00');
    hours.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await el.updateComplete;
    expect(el.value).to.equal('08:00');
  });

  it('does not reflect value to an attribute', async () => {
    const el = await fixture<TimePicker>(
      html`<wc-time-picker></wc-time-picker>`,
    );
    el.value = '09:30';
    await el.updateComplete;
    expect(el.hasAttribute('value')).to.be.false;
  });
});

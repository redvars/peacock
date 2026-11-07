/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { DateRangeField } from '../src/date-range-field/index.js';
import { DatePicker } from '../src/date-picker/index.js';
import { Field } from '../src/field/index.js';
import { Popover, PopoverContent } from '../src/popover/index.js';
import { IconButton } from '../src/button/index.js';

for (const [tag, element] of [
  ['wc-field', Field],
  ['wc-popover', Popover],
  ['wc-popover-content', PopoverContent],
  ['wc-icon-button', IconButton],
  ['wc-date-picker', DatePicker],
  ['wc-date-range-field', DateRangeField],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

const textInput = (el: DateRangeField) =>
  el.shadowRoot!.querySelector<HTMLInputElement>('.input')!;

async function type(el: DateRangeField, text: string) {
  const input = textInput(el);
  input.value = text;
  input.dispatchEvent(new InputEvent('input'));
  input.dispatchEvent(new Event('change'));
  await el.updateComplete;
}

async function openPicker(el: DateRangeField) {
  const popover = el.shadowRoot!.querySelector<Popover>('wc-popover')!;
  await popover.updateComplete;
  el.showPicker();
  await el.updateComplete;
  const picker = el.shadowRoot!.querySelector<DatePicker>('wc-date-picker')!;
  await picker.updateComplete;
  return { popover, picker };
}

const dayButton = (picker: DatePicker, iso: string) =>
  picker.shadowRoot!.querySelector<HTMLButtonElement>(`[data-date="${iso}"]`)!;

const presetButtons = (el: DateRangeField) =>
  Array.from(el.shadowRoot!.querySelectorAll<HTMLButtonElement>('.preset'));

describe('DateRangeField', () => {
  it('shows and parses a range', async () => {
    const el = await fixture<DateRangeField>(
      html`<wc-date-range-field
        locale="en-US"
        value="2026-11-03/2026-11-09"
      ></wc-date-range-field>`,
    );
    expect(textInput(el).value).to.equal('11/03/2026 – 11/09/2026');
    expect(textInput(el).placeholder).to.equal('MM/DD/YYYY – MM/DD/YYYY');
    setTimeout(() => type(el, '12/1/2026 - 12/5/2026'));
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;
    expect(event.detail.value).to.equal('2026-12-01/2026-12-05');
  });

  it('orders a typed range that ends before it starts', async () => {
    const el = await fixture<DateRangeField>(
      html`<wc-date-range-field locale="en-US"></wc-date-range-field>`,
    );
    await type(el, '12/5/2026 - 12/1/2026');
    expect(el.value).to.equal('2026-12-01/2026-12-05');
  });

  it('flags text that is not a range and keeps the value', async () => {
    const el = await fixture<DateRangeField>(
      html`<wc-date-range-field
        locale="en-US"
        value="2026-11-03/2026-11-09"
      ></wc-date-range-field>`,
    );
    await type(el, '12/1/2026');
    const field = el.shadowRoot!.querySelector<Field>('wc-field')!;
    expect(el.value).to.equal('2026-11-03/2026-11-09');
    expect(el.validity.badInput).to.be.true;
    expect(field.errorText).to.equal('Enter MM/DD/YYYY – MM/DD/YYYY');
  });

  it('flags a range outside min and max', async () => {
    const el = await fixture<DateRangeField>(
      html`<wc-date-range-field
        locale="en-US"
        min="2026-11-01"
        max="2026-11-30"
      ></wc-date-range-field>`,
    );
    await type(el, '10/30/2026 - 11/5/2026');
    expect(el.validity.rangeUnderflow).to.be.true;
    await type(el, '11/25/2026 - 12/2/2026');
    expect(el.validity.rangeOverflow).to.be.true;
    await type(el, '11/2/2026 - 11/5/2026');
    expect(el.validity.valid).to.be.true;
    expect(el.value).to.equal('2026-11-02/2026-11-05');
  });

  it('shows two months by default', async () => {
    const el = await fixture<DateRangeField>(
      html`<wc-date-range-field></wc-date-range-field>`,
    );
    const picker = el.shadowRoot!.querySelector<DatePicker>('wc-date-picker')!;
    expect(el.months).to.equal(2);
    expect(picker.months).to.equal(2);
    expect(picker.range).to.be.true;
  });

  it('fires input when the start is picked and change when the end is', async () => {
    const el = await fixture<DateRangeField>(
      html`<wc-date-range-field
        value="2026-11-03/2026-11-09"
      ></wc-date-range-field>`,
    );
    const { popover, picker } = await openPicker(el);

    setTimeout(() => dayButton(picker, '2026-11-10').click());
    const input = (await oneEvent(el, 'input')) as CustomEvent<{
      value: string;
    }>;
    expect(input.detail.value).to.equal('2026-11-10/');
    await el.updateComplete;
    expect(popover.open).to.be.true;

    await picker.updateComplete;
    setTimeout(() => dayButton(picker, '2026-11-14').click());
    const change = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;
    expect(change.detail.value).to.equal('2026-11-10/2026-11-14');
    await el.updateComplete;
    expect(popover.open).to.be.false;
  });

  it('commits a preset and closes the calendar', async () => {
    const el = await fixture<DateRangeField>(
      html`<wc-date-range-field
        .presets=${[
          { label: 'First week', start: '2026-11-01', end: '2026-11-07' },
          { label: 'Second week', start: '2026-11-08', end: '2026-11-14' },
        ]}
      ></wc-date-range-field>`,
    );
    const { popover } = await openPicker(el);
    const buttons = presetButtons(el);
    expect(buttons.map(b => b.textContent?.trim())).to.deep.equal([
      'First week',
      'Second week',
    ]);

    const events: string[] = [];
    el.addEventListener('input', e =>
      events.push(`input:${(e as CustomEvent).detail.value}`),
    );
    setTimeout(() => buttons[1].click());
    const change = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;
    expect(change.detail.value).to.equal('2026-11-08/2026-11-14');
    expect(events).to.deep.equal(['input:2026-11-08/2026-11-14']);
    await el.updateComplete;
    expect(popover.open).to.be.false;
    expect(presetButtons(el)[1].getAttribute('aria-pressed')).to.equal('true');
  });

  it('reads presets from a JSON attribute and disables those outside min and max', async () => {
    const el = await fixture<DateRangeField>(
      html`<wc-date-range-field
        min="2026-11-01"
        presets='[{"label":"October","start":"2026-10-01","end":"2026-10-31"},{"label":"November","start":"2026-11-01","end":"2026-11-30"}]'
      ></wc-date-range-field>`,
    );
    const buttons = presetButtons(el);
    expect(buttons).to.have.length(2);
    expect(buttons[0].disabled).to.be.true;
    expect(buttons[1].disabled).to.be.false;
  });

  it('renders no preset list without presets', async () => {
    const el = await fixture<DateRangeField>(
      html`<wc-date-range-field></wc-date-range-field>`,
    );
    expect(el.shadowRoot!.querySelector('.presets')).to.not.exist;
  });

  it('blocks form submission while required and empty, and submits its value', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <wc-date-range-field name="trip" required></wc-date-range-field>
      </form>
    `);
    const el = form.querySelector<DateRangeField>('wc-date-range-field')!;
    await el.updateComplete;
    expect(form.checkValidity()).to.be.false;
    expect(el.validity.valueMissing).to.be.true;

    el.value = '2026-11-03/2026-11-09';
    await el.updateComplete;
    expect(form.checkValidity()).to.be.true;
    expect(new FormData(form).get('trip')).to.equal('2026-11-03/2026-11-09');
  });

  it('clears the value with the clear button', async () => {
    const el = await fixture<DateRangeField>(
      html`<wc-date-range-field
        clearable
        value="2026-11-03/2026-11-09"
      ></wc-date-range-field>`,
    );
    setTimeout(() =>
      el.shadowRoot!.querySelector<HTMLElement>('.clear-button')!.click(),
    );
    const change = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;
    expect(change.detail.value).to.equal('');
    expect(el.value).to.equal('');
  });
});

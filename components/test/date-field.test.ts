/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { DateField } from '../src/date-field/index.js';
import { TimeField } from '../src/time-field/index.js';
import { DatetimeField } from '../src/datetime-field/index.js';
import { DatePicker } from '../src/date-picker/index.js';
import { TimePicker } from '../src/time-picker/index.js';
import { Field } from '../src/field/index.js';
import { Popover, PopoverContent } from '../src/popover/index.js';
import { IconButton } from '../src/button/index.js';

for (const [tag, element] of [
  ['wc-field', Field],
  ['wc-popover', Popover],
  ['wc-popover-content', PopoverContent],
  ['wc-icon-button', IconButton],
  ['wc-date-picker', DatePicker],
  ['wc-time-picker', TimePicker],
  ['wc-date-field', DateField],
  ['wc-time-field', TimeField],
  ['wc-datetime-field', DatetimeField],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

type AnyField = DateField | TimeField | DatetimeField;

const textInput = (el: AnyField) =>
  el.shadowRoot!.querySelector<HTMLInputElement>('.input')!;

async function type(el: AnyField, text: string) {
  const input = textInput(el);
  input.value = text;
  input.dispatchEvent(new InputEvent('input'));
  input.dispatchEvent(new Event('change'));
  await el.updateComplete;
}

describe('DateField', () => {
  it('shows the value in the locale format', async () => {
    const el = await fixture<DateField>(
      html`<wc-date-field value="2026-11-06" locale="en-GB"></wc-date-field>`,
    );
    expect(textInput(el).value).to.equal('06/11/2026');
    expect(textInput(el).placeholder).to.equal('DD/MM/YYYY');
  });

  it('commits a typed date', async () => {
    const el = await fixture<DateField>(
      html`<wc-date-field locale="en-US"></wc-date-field>`,
    );
    setTimeout(() => type(el, '11/6/26'));
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;
    expect(event.detail.value).to.equal('2026-11-06');
    await el.updateComplete;
    expect(textInput(el).value).to.equal('11/06/2026');
  });

  it('flags text that is not a date and keeps the value', async () => {
    const el = await fixture<DateField>(
      html`<wc-date-field value="2026-11-06" locale="en-US"></wc-date-field>`,
    );
    await type(el, 'someday');
    const field = el.shadowRoot!.querySelector<Field>('wc-field')!;
    expect(el.value).to.equal('2026-11-06');
    expect(field.error).to.be.true;
    expect(field.errorText).to.equal('Enter MM/DD/YYYY');
  });

  it('flags a date outside min and max', async () => {
    const el = await fixture<DateField>(
      html`<wc-date-field locale="en-US" min="2026-11-01"></wc-date-field>`,
    );
    await type(el, '10/31/2026');
    const field = el.shadowRoot!.querySelector<Field>('wc-field')!;
    expect(el.value).to.equal('');
    expect(field.errorText).to.equal('Pick a date on or after 11/01/2026');
  });

  it('clears the value when the text is emptied', async () => {
    const el = await fixture<DateField>(
      html`<wc-date-field value="2026-11-06"></wc-date-field>`,
    );
    setTimeout(() => type(el, ''));
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;
    expect(event.detail.value).to.equal('');
  });

  it('opens the calendar and closes it after a pick', async () => {
    const el = await fixture<DateField>(
      html`<wc-date-field value="2026-11-06"></wc-date-field>`,
    );
    const popover = el.shadowRoot!.querySelector<Popover>('wc-popover')!;
    await popover.updateComplete;
    el.showPicker();
    await el.updateComplete;
    expect(popover.open).to.be.true;

    const picker = el.shadowRoot!.querySelector<DatePicker>('wc-date-picker')!;
    await picker.updateComplete;
    setTimeout(() =>
      picker
        .shadowRoot!.querySelector<HTMLButtonElement>(
          '[data-date="2026-11-20"]',
        )!
        .click(),
    );
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;
    expect(event.detail.value).to.equal('2026-11-20');
    await el.updateComplete;
    expect(popover.open).to.be.false;
  });

  it('shows and parses a range', async () => {
    const el = await fixture<DateField>(
      html`<wc-date-field
        range
        locale="en-US"
        value="2026-11-03/2026-11-09"
      ></wc-date-field>`,
    );
    expect(textInput(el).value).to.equal('11/03/2026 – 11/09/2026');
    setTimeout(() => type(el, '12/1/2026 - 12/5/2026'));
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;
    expect(event.detail.value).to.equal('2026-12-01/2026-12-05');
  });

  it('submits and resets with a form', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <wc-date-field name="start" value="2026-11-06"></wc-date-field>
      </form>
    `);
    const el = form.querySelector<DateField>('wc-date-field')!;
    expect(new FormData(form).get('start')).to.equal('2026-11-06');
    el.value = '2026-12-01';
    await el.updateComplete;
    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal('2026-11-06');
  });
});

describe('TimeField', () => {
  it('shows and parses times', async () => {
    const el = await fixture<TimeField>(
      html`<wc-time-field
        value="21:30"
        locale="en-US"
        hour-cycle="h12"
      ></wc-time-field>`,
    );
    expect(textInput(el).value).to.equal('9:30 PM');
    setTimeout(() => type(el, '7:05 am'));
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;
    expect(event.detail.value).to.equal('07:05');
  });

  it('flags a time outside min', async () => {
    const el = await fixture<TimeField>(
      html`<wc-time-field
        locale="en-US"
        hour-cycle="h23"
        min="08:00"
      ></wc-time-field>`,
    );
    await type(el, '7:00');
    const field = el.shadowRoot!.querySelector<Field>('wc-field')!;
    expect(el.value).to.equal('');
    expect(field.errorText).to.equal('Pick a time at or after 08:00');
  });
});

describe('DatetimeField', () => {
  it('shows and parses a date and time', async () => {
    const el = await fixture<DatetimeField>(
      html`<wc-datetime-field
        value="2026-11-06T09:30"
        locale="en-US"
        hour-cycle="h12"
      ></wc-datetime-field>`,
    );
    expect(textInput(el).value).to.equal('11/06/2026, 9:30 AM');
    setTimeout(() => type(el, '12/1/2026 4:15 pm'));
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;
    expect(event.detail.value).to.equal('2026-12-01T16:15');
  });

  it('keeps the time when a date is picked and commits on close', async () => {
    const el = await fixture<DatetimeField>(
      html`<wc-datetime-field value="2026-11-06T09:30"></wc-datetime-field>`,
    );
    const popover = el.shadowRoot!.querySelector<Popover>('wc-popover')!;
    await popover.updateComplete;
    el.showPicker();
    await el.updateComplete;

    const picker = el.shadowRoot!.querySelector<DatePicker>('wc-date-picker')!;
    await picker.updateComplete;
    setTimeout(() =>
      picker
        .shadowRoot!.querySelector<HTMLButtonElement>(
          '[data-date="2026-11-20"]',
        )!
        .click(),
    );
    const input = (await oneEvent(el, 'input')) as CustomEvent<{
      value: string;
    }>;
    expect(input.detail.value).to.equal('2026-11-20T09:30');
    expect(popover.open).to.be.true;

    setTimeout(() => el.hidePicker());
    const change = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;
    expect(change.detail.value).to.equal('2026-11-20T09:30');
  });
});

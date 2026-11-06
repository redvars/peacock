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
import { resetDeprecationWarnings } from '../src/__internal/utils/deprecate.js';

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

describe('Time and date-time fields: minute-step, seconds, actions', () => {
  let warn: typeof console.warn;
  const warnings: string[] = [];

  beforeEach(() => {
    resetDeprecationWarnings();
    warnings.length = 0;
    warn = console.warn;
    console.warn = (message: string) => warnings.push(message);
  });

  afterEach(() => {
    console.warn = warn;
  });

  const timePicker = (el: AnyField) =>
    el.shadowRoot!.querySelector<TimePicker>('wc-time-picker')!;

  for (const tag of ['wc-time-field', 'wc-datetime-field'] as const) {
    it(`${tag} passes minute-step to the picker`, async () => {
      const el = document.createElement(tag) as TimeField | DatetimeField;
      el.setAttribute('minute-step', '15');
      await fixture(el);
      expect(timePicker(el).minuteStep).to.equal(15);
      expect(warnings).to.be.empty;
    });

    it(`${tag} still takes the deprecated step, with a warning`, async () => {
      const el = document.createElement(tag) as TimeField | DatetimeField;
      el.setAttribute('step', '30');
      await fixture(el);
      expect(el.minuteStep).to.equal(30);
      expect(timePicker(el).minuteStep).to.equal(30);
      expect(warnings.some(w => w.includes(`${tag}: \`step\``))).to.be.true;
    });
  }

  it('formats and parses seconds in a date-time field', async () => {
    const el = await fixture<DatetimeField>(
      html`<wc-datetime-field
        value="2026-11-06T09:30:15"
        locale="en-US"
        hour-cycle="h23"
        seconds
      ></wc-datetime-field>`,
    );
    expect(textInput(el).value).to.equal('11/06/2026, 09:30:15');
    expect(textInput(el).placeholder).to.equal('MM/DD/YYYY, hh:mm:ss');
    expect(timePicker(el).seconds).to.be.true;
    setTimeout(() => type(el, '12/1/2026 16:15:05'));
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;
    expect(event.detail.value).to.equal('2026-12-01T16:15:05');
  });

  it('rejects a typed date that isDateDisabled rules out in a date-time field', async () => {
    const el = await fixture<DatetimeField>(
      html`<wc-datetime-field
        locale="en-US"
        hour-cycle="h23"
        .isDateDisabled=${(iso: string) => iso === '2026-12-25'}
      ></wc-datetime-field>`,
    );
    await type(el, '12/25/2026 10:00');
    expect(el.value).to.equal('');
    expect(el.validity.badInput).to.be.true;
    const datePicker =
      el.shadowRoot!.querySelector<DatePicker>('wc-date-picker')!;
    expect(datePicker.isDateDisabled?.('2026-12-25')).to.be.true;
  });

  it('shows the calendar actions in a date-time field and clears from them', async () => {
    const el = await fixture<DatetimeField>(
      html`<wc-datetime-field
        value="2026-11-06T09:30"
        show-actions
      ></wc-datetime-field>`,
    );
    const datePicker =
      el.shadowRoot!.querySelector<DatePicker>('wc-date-picker')!;
    await datePicker.updateComplete;
    expect(datePicker.showActions).to.be.true;
    setTimeout(() =>
      datePicker
        .shadowRoot!.querySelector<HTMLElement>('.clear-button')!
        .click(),
    );
    const event = (await oneEvent(el, 'input')) as CustomEvent<{
      value: string;
    }>;
    expect(event.detail.value).to.equal('');
  });
});

for (const tag of [
  'wc-date-field',
  'wc-time-field',
  'wc-datetime-field',
] as const) {
  const create = (attrs: Record<string, string | boolean>): AnyField => {
    const el = document.createElement(tag) as AnyField;
    for (const [name, value] of Object.entries(attrs)) {
      if (value === true) el.setAttribute(name, '');
      else if (value !== false) el.setAttribute(name, value);
    }
    return el;
  };

  describe(`${tag} as a field`, () => {
    it('blocks form submission while required and empty', async () => {
      const form = await fixture<HTMLFormElement>(html`<form></form>`);
      const el = create({ name: 'when', required: true });
      form.appendChild(el);
      await el.updateComplete;

      expect(form.checkValidity()).to.be.false;
      expect(el.validity.valueMissing).to.be.true;
      expect(el.matches(':invalid')).to.be.true;
    });

    it('shows the required message in the field after reportValidity()', async () => {
      const el = await fixture<AnyField>(create({ required: true }));
      const field = el.shadowRoot!.querySelector<Field>('wc-field')!;
      expect(field.error).to.be.false;

      el.reportValidity();
      await el.updateComplete;

      expect(field.error).to.be.true;
      expect(field.errorText).to.equal(el.validationMessage);
      expect(field.errorText).to.not.equal('');
      expect(textInput(el).getAttribute('aria-invalid')).to.equal('true');
    });

    it('makes typed text that does not parse a bad input', async () => {
      const el = await fixture<AnyField>(create({ locale: 'en-US' }));
      await type(el, 'nonsense');

      expect(el.validity.badInput).to.be.true;
      expect(el.checkValidity()).to.be.false;
      const field = el.shadowRoot!.querySelector<Field>('wc-field')!;
      expect(field.errorText).to.equal(el.validationMessage);
      expect(field.errorText).to.match(/^Enter /);
    });

    it('names the text input from its label', async () => {
      const el = await fixture<AnyField>(create({ label: 'When' }));
      expect(textInput(el).getAttribute('aria-label')).to.equal('When');
      expect(textInput(el).hasAttribute('name')).to.be.false;
    });

    it('lets no native input event out, only its own events', async () => {
      const wrapper = await fixture<HTMLDivElement>(html`<div></div>`);
      const el = create({ locale: 'en-US' });
      wrapper.appendChild(el);
      await el.updateComplete;
      const events: Event[] = [];
      wrapper.addEventListener('input', e => events.push(e));

      const input = textInput(el);
      input.value = '1';
      input.dispatchEvent(
        new InputEvent('input', { bubbles: true, composed: true }),
      );
      expect(events).to.have.length(0);
    });

    it('defaults to the sm size and does not reflect value', async () => {
      const el = await fixture<AnyField>(create({}));
      expect(el.size).to.equal('sm');
      expect(el.shadowRoot!.querySelector<Field>('wc-field')!.size).to.equal(
        'sm',
      );
      el.value = tag === 'wc-time-field' ? '09:30' : '2026-11-06';
      await el.updateComplete;
      expect(el.hasAttribute('value')).to.be.false;
    });
  });
}

describe('DateField deprecations', () => {
  let warnings: string[];
  let original: typeof console.warn;

  beforeEach(() => {
    resetDeprecationWarnings();
    warnings = [];
    original = console.warn;
    console.warn = (message: string) => {
      warnings.push(message);
    };
  });

  afterEach(() => {
    console.warn = original;
  });

  it('warns that range and months are deprecated for wc-date-range-field', async () => {
    await fixture<DateField>(
      html`<wc-date-field range months="2"></wc-date-field>`,
    );
    expect(warnings).to.have.length(2);
    expect(warnings[0]).to.contain('`range`');
    expect(warnings[1]).to.contain('`months`');
    expect(warnings.every(w => w.includes('wc-date-range-field'))).to.be.true;
  });

  it('does not warn for a single date', async () => {
    await fixture<DateField>(
      html`<wc-date-field value="2026-11-06"></wc-date-field>`,
    );
    expect(warnings).to.have.length(0);
  });
});

describe('PickerField range validity', () => {
  it('reports rangeUnderflow and rangeOverflow for typed dates', async () => {
    const el = await fixture<DateField>(
      html`<wc-date-field
        locale="en-US"
        min="2026-11-01"
        max="2026-11-30"
      ></wc-date-field>`,
    );
    await type(el, '10/31/2026');
    expect(el.validity.rangeUnderflow).to.be.true;
    await type(el, '12/01/2026');
    expect(el.validity.rangeOverflow).to.be.true;
    await type(el, '11/15/2026');
    expect(el.validity.valid).to.be.true;
  });
});

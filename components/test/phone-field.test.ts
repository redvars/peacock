/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Field } from '../src/field/index.js';
import { IconButton } from '../src/button/index.js';
import { PhoneField } from '../src/phone-field/index.js';
import {
  countryForCode,
  matchCallingCode,
  nationalNumber,
} from '../src/phone-field/countries.js';

for (const [tag, element] of [
  ['wc-field', Field],
  ['wc-icon-button', IconButton],
  ['wc-phone-field', PhoneField],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function nativeInput(el: PhoneField) {
  return el.shadowRoot!.querySelector<HTMLInputElement>('.input-element')!;
}

function countrySelect(el: PhoneField) {
  return el.shadowRoot!.querySelector<HTMLSelectElement>('.country-select')!;
}

async function type(el: PhoneField, text: string) {
  const input = nativeInput(el);
  input.value = text;
  input.dispatchEvent(
    new InputEvent('input', { bubbles: true, composed: true }),
  );
  await el.updateComplete;
}

describe('phone-field country table', () => {
  it('matches calling codes by prefix', () => {
    expect(matchCallingCode('442079460958')).to.equal('44');
    expect(matchCallingCode('14155550100')).to.equal('1');
    expect(matchCallingCode('351912345678')).to.equal('351');
    expect(matchCallingCode('999')).to.equal('');
  });

  it('keeps the current country when it shares the code', () => {
    expect(countryForCode('1', 'CA')).to.equal('CA');
    expect(countryForCode('1', 'GB')).to.equal('US');
    expect(countryForCode('44', 'US', ['JE', 'GB'])).to.equal('JE');
  });

  it('drops trunk prefixes, except where the 0 belongs to the number', () => {
    expect(nationalNumber('02079460958', 'GB')).to.equal('2079460958');
    expect(nationalNumber('0612345678', 'IT')).to.equal('0612345678');
    expect(nationalNumber('14155550100', 'US')).to.equal('4155550100');
    expect(nationalNumber('89161234567', 'RU')).to.equal('9161234567');
  });
});

describe('PhoneField', () => {
  it('builds an E.164 value from the country and the national number', async () => {
    const el = await fixture<PhoneField>(
      html`<wc-phone-field country="GB"></wc-phone-field>`,
    );
    await type(el, '020 7946 0958');
    expect(el.value).to.equal('+442079460958');
    expect(nativeInput(el).value).to.equal('020 7946 0958');
  });

  it('sets the native input up for phone autofill', async () => {
    const el = await fixture<PhoneField>(
      html`<wc-phone-field></wc-phone-field>`,
    );
    const input = nativeInput(el);
    expect(input.type).to.equal('tel');
    expect(input.getAttribute('autocomplete')).to.equal('tel-national');
    expect(countrySelect(el).getAttribute('autocomplete')).to.equal(
      'tel-country-code',
    );
    expect(countrySelect(el).getAttribute('aria-label')).to.equal('Country');
  });

  it('defaults the country from the locale region, else US', async () => {
    const gb = await fixture<HTMLDivElement>(
      html`<div lang="en-GB"><wc-phone-field></wc-phone-field></div>`,
    );
    expect(gb.querySelector<PhoneField>('wc-phone-field')!.country).to.equal(
      'GB',
    );
    const de = await fixture<HTMLDivElement>(
      html`<div lang="de"><wc-phone-field></wc-phone-field></div>`,
    );
    expect(de.querySelector<PhoneField>('wc-phone-field')!.country).to.equal(
      'DE',
    );
    const unknown = await fixture<HTMLDivElement>(
      html`<div lang="en-001"><wc-phone-field></wc-phone-field></div>`,
    );
    expect(
      unknown.querySelector<PhoneField>('wc-phone-field')!.country,
    ).to.equal('US');
  });

  it('selects the country of a pasted international number', async () => {
    const el = await fixture<PhoneField>(
      html`<wc-phone-field country="US"></wc-phone-field>`,
    );
    await type(el, '+44 20 7946 0958');
    expect(el.country).to.equal('GB');
    expect(el.value).to.equal('+442079460958');
    expect(nativeInput(el).value).to.equal('20 7946 0958');
    expect(countrySelect(el).value).to.equal('GB');
  });

  it('keeps a +1 country selected for +1 numbers', async () => {
    const el = await fixture<PhoneField>(
      html`<wc-phone-field country="CA"></wc-phone-field>`,
    );
    await type(el, '+1 416 555 0100');
    expect(el.country).to.equal('CA');
    expect(el.value).to.equal('+14165550100');
  });

  it('shows a consumer value and selects its country', async () => {
    const el = await fixture<PhoneField>(
      html`<wc-phone-field country="US" value="+33123456789"></wc-phone-field>`,
    );
    expect(el.country).to.equal('FR');
    expect(nativeInput(el).value).to.equal('123456789');

    el.value = '+4915112345678';
    await el.updateComplete;
    expect(el.country).to.equal('DE');
    expect(nativeInput(el).value).to.equal('15112345678');
  });

  it('changes the calling code when another country is picked', async () => {
    const wrapper = await fixture<HTMLDivElement>(
      html`<div><wc-phone-field country="GB"></wc-phone-field></div>`,
    );
    const el = wrapper.querySelector<PhoneField>('wc-phone-field')!;
    await type(el, '20 7946 0958');
    const changes: { value: string; country: string }[] = [];
    wrapper.addEventListener('change', e =>
      changes.push((e as CustomEvent).detail),
    );

    const select = countrySelect(el);
    select.value = 'IE';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await el.updateComplete;

    expect(el.country).to.equal('IE');
    expect(el.value).to.equal('+3532079460958');
    expect(changes).to.deep.equal([{ value: '+3532079460958', country: 'IE' }]);
  });

  it('fires input and change with value and country, and no native events', async () => {
    const wrapper = await fixture<HTMLDivElement>(
      html`<div><wc-phone-field country="GB"></wc-phone-field></div>`,
    );
    const el = wrapper.querySelector<PhoneField>('wc-phone-field')!;
    const events: Event[] = [];
    wrapper.addEventListener('input', e => events.push(e));
    wrapper.addEventListener('change', e => events.push(e));

    await type(el, '7700 900123');
    nativeInput(el).dispatchEvent(new Event('change', { bubbles: true }));

    expect(events.map(e => e.type)).to.deep.equal(['input', 'change']);
    expect(events.every(e => e instanceof CustomEvent)).to.be.true;
    expect((events[1] as CustomEvent).detail).to.deep.equal({
      value: '+447700900123',
      country: 'GB',
    });
  });

  it('limits, orders and pins the country list', async () => {
    const el = await fixture<PhoneField>(
      html`<wc-phone-field
        lang="en"
        .countries=${['fr', 'DE', 'GB', 'XX']}
        .preferredCountries=${['GB']}
      ></wc-phone-field>`,
    );
    const values = [...countrySelect(el).options].map(option => option.value);
    expect(values).to.deep.equal(['GB', 'FR', 'DE']);
    expect(el.country).to.equal('FR');
    expect(countrySelect(el).options[1].textContent?.trim()).to.equal(
      'France (+33)',
    );
  });

  it('lists every country, sorted by name, when countries is not set', async () => {
    const el = await fixture<PhoneField>(
      html`<wc-phone-field lang="en"></wc-phone-field>`,
    );
    const names = [...countrySelect(el).options].map(
      option => option.textContent?.trim() ?? '',
    );
    expect(names.length).to.be.greaterThan(230);
    expect(names[0].startsWith('Afghanistan')).to.be.true;
  });

  it('clears the value with the clear button', async () => {
    const el = await fixture<PhoneField>(
      html`<wc-phone-field clearable value="+442079460958"></wc-phone-field>`,
    );
    el.shadowRoot!.querySelector<HTMLElement>('.clear-button')!.click();
    await el.updateComplete;
    expect(el.value).to.equal('');
    expect(nativeInput(el).value).to.equal('');
  });

  it('submits the E.164 value with a form and restores it on reset', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <wc-phone-field name="phone" value="+442079460958"></wc-phone-field>
      </form>
    `);
    const el = form.querySelector<PhoneField>('wc-phone-field')!;
    expect(new FormData(form).get('phone')).to.equal('+442079460958');

    await type(el, '+33 1 23 45 67 89');
    expect(new FormData(form).get('phone')).to.equal('+33123456789');

    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal('+442079460958');
    expect(el.country).to.equal('GB');
    expect(nativeInput(el).value).to.equal('2079460958');
  });

  it('names the native input from its label', async () => {
    const el = await fixture<PhoneField>(
      html`<wc-phone-field label="Phone"></wc-phone-field>`,
    );
    expect(nativeInput(el).getAttribute('aria-label')).to.equal('Phone');
  });

  it('disables the country selector while disabled or read-only', async () => {
    const el = await fixture<PhoneField>(
      html`<wc-phone-field readonly></wc-phone-field>`,
    );
    expect(countrySelect(el).disabled).to.be.true;
  });
});

describe('PhoneField validation', () => {
  it('blocks form submission while required and empty', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><wc-phone-field name="phone" required></wc-phone-field></form>
    `);
    const el = form.querySelector<PhoneField>('wc-phone-field')!;
    await el.updateComplete;
    expect(form.checkValidity()).to.be.false;
    expect(el.validity.valueMissing).to.be.true;

    await type(el, '2079460958');
    expect(form.checkValidity()).to.be.true;
  });

  for (const text of ['020 79x6', '1', '1234567890123456', '+999 1234']) {
    it(`reports "${text}" as a type mismatch with an empty value`, async () => {
      const el = await fixture<PhoneField>(
        html`<wc-phone-field country="GB"></wc-phone-field>`,
      );
      await type(el, text);
      expect(el.value).to.equal('');
      expect(el.validity.typeMismatch).to.be.true;
      expect(el.validationMessage).to.equal('Enter a valid phone number');
    });
  }

  it('allows spaces, dashes and brackets between the digits', async () => {
    const el = await fixture<PhoneField>(
      html`<wc-phone-field country="US"></wc-phone-field>`,
    );
    await type(el, '(415) 555-0100');
    expect(el.value).to.equal('+14155550100');
    expect(el.validity.valid).to.be.true;
  });

  it('shows the message under the field after a commit', async () => {
    const el = await fixture<PhoneField>(
      html`<wc-phone-field country="GB"></wc-phone-field>`,
    );
    await type(el, 'abc');
    nativeInput(el).dispatchEvent(new Event('change'));
    await el.updateComplete;
    const field = el.shadowRoot!.querySelector<Field>('wc-field')!;
    expect(field.error).to.be.true;
    expect(field.errorText).to.equal('Enter a valid phone number');
    expect(nativeInput(el).getAttribute('aria-invalid')).to.equal('true');
  });
});

/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Field } from '../src/field/index.js';
import { IconButton } from '../src/button/index.js';
import { CurrencyField } from '../src/currency-field/index.js';
import {
  compareAmounts,
  currencyInfo,
  formatAmount,
  normalizeAmount,
  parseAmount,
} from '../src/currency-field/amount.js';

for (const [tag, element] of [
  ['wc-field', Field],
  ['wc-icon-button', IconButton],
  ['wc-currency-field', CurrencyField],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function nativeInput(el: CurrencyField) {
  return el.shadowRoot!.querySelector<HTMLInputElement>('.input-element')!;
}

function symbol(el: CurrencyField) {
  return el.shadowRoot!.querySelector<HTMLElement>('.symbol');
}

async function type(el: CurrencyField, text: string) {
  const input = nativeInput(el);
  input.value = text;
  input.dispatchEvent(
    new InputEvent('input', { bubbles: true, composed: true }),
  );
  await el.updateComplete;
}

async function focusInput(el: CurrencyField, kind: 'focus' | 'blur') {
  nativeInput(el).dispatchEvent(new FocusEvent(kind));
  await el.updateComplete;
}

function parse(text: string, locale = 'en-US', currency = 'USD', digits = 2) {
  return parseAmount(text, locale, currency, digits);
}

describe('currency-field amounts', () => {
  it('takes the decimals from the currency', () => {
    expect(currencyInfo('en-US', 'JPY').digits).to.equal(0);
    expect(currencyInfo('en-US', 'USD').digits).to.equal(2);
    expect(currencyInfo('en-US', 'KWD').digits).to.equal(3);
    expect(currencyInfo('en-US', 'nope').known).to.be.false;
  });

  it('places the symbol as the locale does', () => {
    expect(currencyInfo('en-US', 'EUR')).to.include({
      symbol: '€',
      placement: 'start',
    });
    expect(currencyInfo('de-DE', 'EUR')).to.include({
      symbol: '€',
      placement: 'end',
    });
  });

  it('normalizes decimals and rejects extra ones', () => {
    expect(normalizeAmount('1234.5', 2)).to.equal('1234.50');
    expect(normalizeAmount('1.250', 2)).to.equal('1.25');
    expect(normalizeAmount('1.255', 2)).to.be.undefined;
    expect(normalizeAmount('007', 0)).to.equal('7');
    expect(normalizeAmount('-0.00', 2)).to.equal('0.00');
    expect(normalizeAmount('abc', 2)).to.be.undefined;
  });

  it('compares decimal strings exactly', () => {
    expect(compareAmounts('0.10', '0.1')).to.equal(0);
    expect(
      compareAmounts('9007199254740993.01', '9007199254740993.00'),
    ).to.equal(1);
    expect(compareAmounts('-5', '3')).to.equal(-1);
    expect(compareAmounts('-5', '-30')).to.equal(1);
    expect(compareAmounts('100', '99.99')).to.equal(1);
  });

  it('reads typed and pasted amounts', () => {
    expect(parse('1234.5')).to.deep.equal({ status: 'ok', value: '1234.50' });
    expect(parse('€1,234.50', 'en-US', 'EUR')).to.deep.equal({
      status: 'ok',
      value: '1234.50',
    });
    expect(parse('€1,234.50', 'de-DE', 'EUR')).to.deep.equal({
      status: 'ok',
      value: '1234.50',
    });
    expect(parse('1.234,50 €', 'de-DE', 'EUR')).to.deep.equal({
      status: 'ok',
      value: '1234.50',
    });
    expect(parse('12,5', 'de-DE', 'EUR')).to.deep.equal({
      status: 'ok',
      value: '12.50',
    });
    expect(parse('12.5', 'fr-FR', 'EUR')).to.deep.equal({
      status: 'ok',
      value: '12.50',
    });
    expect(parse('USD 1,000')).to.deep.equal({
      status: 'ok',
      value: '1000.00',
    });
    expect(parse('(12.00)')).to.deep.equal({ status: 'ok', value: '-12.00' });
    expect(parse('-3')).to.deep.equal({ status: 'ok', value: '-3.00' });
    expect(parse('')).to.deep.equal({ status: 'empty' });
    expect(parse('12abc')).to.deep.equal({ status: 'invalid' });
    expect(parse('1,5')).to.deep.equal({ status: 'invalid' });
    expect(parse('1.2.3')).to.deep.equal({ status: 'invalid' });
    expect(parse('1.255')).to.deep.equal({ status: 'decimals' });
    expect(parse('1.5', 'en-US', 'JPY', 0)).to.deep.equal({
      status: 'decimals',
    });
  });

  it('reads the locale digits', () => {
    expect(parse('١٢٣٫٥٠', 'ar-EG', 'EGP')).to.deep.equal({
      status: 'ok',
      value: '123.50',
    });
  });

  it('formats exactly, without the symbol', () => {
    expect(formatAmount('1234.50', 'en-US', 'USD', 2)).to.equal('1,234.50');
    expect(formatAmount('1234.50', 'de-DE', 'EUR', 2)).to.equal('1.234,50');
    expect(formatAmount('9007199254740993.01', 'en-US', 'USD', 2)).to.equal(
      '9,007,199,254,740,993.01',
    );
  });
});

describe('CurrencyField', () => {
  it('shows a consumer value grouped, and plain while editing', async () => {
    const el = await fixture<CurrencyField>(
      html`<wc-currency-field
        lang="en-US"
        currency="USD"
        value="1234.5"
      ></wc-currency-field>`,
    );
    expect(el.value).to.equal('1234.50');
    expect(nativeInput(el).value).to.equal('1,234.50');
    expect(symbol(el)?.textContent?.trim()).to.equal('$');
    expect(symbol(el)?.slot).to.equal('field-start');

    await focusInput(el, 'focus');
    expect(nativeInput(el).value).to.equal('1234.50');
    await focusInput(el, 'blur');
    expect(nativeInput(el).value).to.equal('1,234.50');
  });

  it('puts the symbol at the end where the locale does', async () => {
    const el = await fixture<CurrencyField>(
      html`<wc-currency-field
        lang="de-DE"
        currency="EUR"
        value="1234.5"
      ></wc-currency-field>`,
    );
    expect(symbol(el)?.slot).to.equal('field-end');
    expect(nativeInput(el).value).to.equal('1.234,50');
  });

  it('follows the currency decimals', async () => {
    const el = await fixture<CurrencyField>(
      html`<wc-currency-field lang="en-US" currency="JPY"></wc-currency-field>`,
    );
    await type(el, '1,500');
    expect(el.value).to.equal('1500');

    el.currency = 'KWD';
    await el.updateComplete;
    expect(el.value).to.equal('1500.000');
  });

  it('rejects more decimals than the currency has', async () => {
    const el = await fixture<CurrencyField>(
      html`<wc-currency-field lang="en-US" currency="USD"></wc-currency-field>`,
    );
    await type(el, '1.255');
    expect(el.value).to.equal('');
    expect(el.validity.stepMismatch).to.be.true;
    expect(el.validationMessage).to.equal(
      'Enter an amount with at most 2 decimal places',
    );
  });

  it('reports text that is not an amount', async () => {
    const el = await fixture<CurrencyField>(
      html`<wc-currency-field lang="en-US" currency="USD"></wc-currency-field>`,
    );
    await type(el, 'twelve');
    expect(el.value).to.equal('');
    expect(el.validity.badInput).to.be.true;
    expect(el.validationMessage).to.equal('Enter a valid amount');

    nativeInput(el).dispatchEvent(new Event('change'));
    await el.updateComplete;
    const field = el.shadowRoot!.querySelector<Field>('wc-field')!;
    expect(field.errorText).to.equal('Enter a valid amount');
  });

  it('checks min and max exactly', async () => {
    const el = await fixture<CurrencyField>(
      html`<wc-currency-field
        lang="en-US"
        currency="USD"
        min="0.01"
        max="100"
      ></wc-currency-field>`,
    );
    await type(el, '0');
    expect(el.validity.rangeUnderflow).to.be.true;
    expect(el.validationMessage).to.equal('Enter $0.01 or more');
    await type(el, '100.01');
    expect(el.validity.rangeOverflow).to.be.true;
    expect(el.validationMessage).to.equal('Enter $100.00 or less');
    await type(el, '100');
    expect(el.validity.valid).to.be.true;
  });

  it('fires input and change with value and currency, and no native events', async () => {
    const wrapper = await fixture<HTMLDivElement>(
      html`<div lang="en-US">
        <wc-currency-field currency="EUR"></wc-currency-field>
      </div>`,
    );
    const el = wrapper.querySelector<CurrencyField>('wc-currency-field')!;
    const events: Event[] = [];
    wrapper.addEventListener('input', e => events.push(e));
    wrapper.addEventListener('change', e => events.push(e));

    await type(el, '€12.5');
    nativeInput(el).dispatchEvent(new Event('change', { bubbles: true }));

    expect(events.map(e => e.type)).to.deep.equal(['input', 'change']);
    expect(events.every(e => e instanceof CustomEvent)).to.be.true;
    expect((events[1] as CustomEvent).detail).to.deep.equal({
      value: '12.50',
      currency: 'EUR',
    });
  });

  it('turns the symbol into a currency selector with currencies', async () => {
    const wrapper = await fixture<HTMLDivElement>(
      html`<div lang="en-US">
        <wc-currency-field
          currency="USD"
          value="10"
          .currencies=${['USD', 'EUR', 'JPY']}
        ></wc-currency-field>
      </div>`,
    );
    const el = wrapper.querySelector<CurrencyField>('wc-currency-field')!;
    const select =
      el.shadowRoot!.querySelector<HTMLSelectElement>('.currency-select')!;
    expect(select.getAttribute('aria-label')).to.equal('Currency');
    expect([...select.options].map(option => option.value)).to.deep.equal([
      'USD',
      'EUR',
      'JPY',
    ]);
    expect(select.options[1].textContent?.trim()).to.equal('Euro (EUR)');

    const changes: unknown[] = [];
    wrapper.addEventListener('change', e =>
      changes.push((e as CustomEvent).detail),
    );
    select.value = 'EUR';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    await el.updateComplete;

    expect(el.currency).to.equal('EUR');
    expect(el.value).to.equal('10.00');
    expect(changes).to.deep.equal([{ value: '10.00', currency: 'EUR' }]);
  });

  it('describes the input with the currency name', async () => {
    const el = await fixture<CurrencyField>(
      html`<wc-currency-field
        lang="en-US"
        label="Price"
        currency="EUR"
        helper-text="Before tax"
      ></wc-currency-field>`,
    );
    const input = nativeInput(el);
    expect(input.getAttribute('aria-label')).to.equal('Price');
    const ids = input.getAttribute('aria-describedby')!.split(' ');
    const texts = ids.map(id =>
      el.shadowRoot!.getElementById(id)?.textContent?.trim(),
    );
    expect(texts).to.deep.equal(['Before tax', 'Euro']);
  });

  it('submits the decimal string with a form and restores it on reset', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form lang="en-US">
        <wc-currency-field
          name="amount"
          currency="USD"
          value="5"
        ></wc-currency-field>
      </form>
    `);
    const el = form.querySelector<CurrencyField>('wc-currency-field')!;
    await el.updateComplete;
    expect(new FormData(form).get('amount')).to.equal('5.00');

    await type(el, '7.25');
    expect(new FormData(form).get('amount')).to.equal('7.25');

    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal('5.00');
    expect(nativeInput(el).value).to.equal('5.00');
  });

  it('blocks form submission while required and empty', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form lang="en-US">
        <wc-currency-field
          name="amount"
          currency="USD"
          required
        ></wc-currency-field>
      </form>
    `);
    const el = form.querySelector<CurrencyField>('wc-currency-field')!;
    await el.updateComplete;
    expect(form.checkValidity()).to.be.false;
    expect(el.validity.valueMissing).to.be.true;
    await type(el, '1');
    expect(form.checkValidity()).to.be.true;
  });

  it('clears the value with the clear button', async () => {
    const el = await fixture<CurrencyField>(
      html`<wc-currency-field
        clearable
        currency="USD"
        value="3"
      ></wc-currency-field>`,
    );
    el.shadowRoot!.querySelector<HTMLElement>('.clear-button')!.click();
    await el.updateComplete;
    expect(el.value).to.equal('');
    expect(nativeInput(el).value).to.equal('');
  });
});

/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { Field } from '../src/field/field.js';
import { NumberField } from '../src/number-field/number-field.js';

for (const [tag, element] of [
  ['wc-field', Field],
  ['wc-number-field', NumberField],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function input(el: NumberField) {
  return el.shadowRoot!.querySelector<HTMLInputElement>('.input-element')!;
}

function steppers(el: NumberField) {
  return Array.from(
    el.shadowRoot!.querySelectorAll<HTMLElement>('wc-icon-button.stepper'),
  );
}

describe('NumberField', () => {
  it('steps the value with the stepper buttons and fires input and change', async () => {
    const el = await fixture<NumberField>(
      html`<wc-number-field value="6" step="2" stepper></wc-number-field>`,
    );
    const [down, up] = steppers(el);

    let inputs = 0;
    el.addEventListener('input', () => {
      inputs += 1;
    });

    setTimeout(() => up.click());
    await oneEvent(el, 'change');
    expect(el.value).to.equal(8);
    expect(inputs).to.equal(1);

    down.click();
    down.click();
    expect(el.value).to.equal(4);
  });

  it('emits CustomEvents with the value from the stepper buttons', async () => {
    const wrapper = await fixture<HTMLDivElement>(
      html`<div><wc-number-field value="1" stepper></wc-number-field></div>`,
    );
    const el = wrapper.querySelector<NumberField>('wc-number-field')!;
    const events: Event[] = [];
    wrapper.addEventListener('input', e => events.push(e));
    wrapper.addEventListener('change', e => events.push(e));

    steppers(el)[1].click();

    expect(events.map(e => e.type)).to.deep.equal(['input', 'change']);
    expect(events.every(e => e instanceof CustomEvent)).to.be.true;
    expect((events[1] as CustomEvent).detail.value).to.equal(2);
  });

  it('labels the stepper buttons', async () => {
    const el = await fixture<NumberField>(
      html`<wc-number-field stepper></wc-number-field>`,
    );
    expect(steppers(el).map(b => b.getAttribute('aria-label'))).to.deep.equal([
      'Decrease',
      'Increase',
    ]);
  });

  it('hides the stepper buttons while readonly or disabled', async () => {
    const readonly = await fixture<NumberField>(
      html`<wc-number-field value="5" stepper readonly></wc-number-field>`,
    );
    expect(steppers(readonly)).to.have.length(0);

    const disabled = await fixture<NumberField>(
      html`<wc-number-field value="5" stepper disabled></wc-number-field>`,
    );
    expect(steppers(disabled)).to.have.length(0);
  });

  it('stores undefined, not 0, when the field is cleared', async () => {
    const el = await fixture<NumberField>(
      html`<wc-number-field value="5"></wc-number-field>`,
    );
    const field = input(el);
    field.value = '';
    field.dispatchEvent(new InputEvent('input'));

    expect(el.value).to.be.undefined;
  });

  it('fires input and change with the value in detail, and no native events', async () => {
    const wrapper = await fixture<HTMLDivElement>(
      html`<div><wc-number-field></wc-number-field></div>`,
    );
    const el = wrapper.querySelector<NumberField>('wc-number-field')!;
    const events: Event[] = [];
    wrapper.addEventListener('input', e => events.push(e));
    wrapper.addEventListener('change', e => events.push(e));

    const native = input(el);
    native.value = '42';
    native.dispatchEvent(
      new InputEvent('input', { bubbles: true, composed: true }),
    );
    native.dispatchEvent(new Event('change', { bubbles: true }));

    expect(events.map(e => e.type)).to.deep.equal(['input', 'change']);
    expect(events.every(e => e instanceof CustomEvent)).to.be.true;
    expect((events[0] as CustomEvent).detail.value).to.equal(42);
  });

  it('keeps the tabindex value on the inner input', async () => {
    const el = await fixture<NumberField>(
      html`<wc-number-field tabindex="-1"></wc-number-field>`,
    );
    expect(input(el).getAttribute('tabindex')).to.equal('-1');
  });

  it('names the native input from its label', async () => {
    const el = await fixture<NumberField>(
      html`<wc-number-field label="Age"></wc-number-field>`,
    );
    expect(input(el).getAttribute('aria-label')).to.equal('Age');
  });

  it('defaults to the sm size', async () => {
    const el = await fixture<NumberField>(
      html`<wc-number-field></wc-number-field>`,
    );
    expect(el.size).to.equal('sm');
    expect(el.shadowRoot!.querySelector<Field>('wc-field')!.size).to.equal(
      'sm',
    );
  });

  it('clears to undefined with the clear button', async () => {
    const el = await fixture<NumberField>(
      html`<wc-number-field clearable value="7"></wc-number-field>`,
    );
    const changes: unknown[] = [];
    el.addEventListener('change', e =>
      changes.push((e as CustomEvent).detail.value),
    );

    el.shadowRoot!.querySelector<HTMLElement>('.clear-button')!.click();
    await el.updateComplete;

    expect(el.value).to.be.undefined;
    expect(changes).to.deep.equal([undefined]);
    expect(input(el).value).to.equal('');
  });

  it('submits its value with a form and restores it on reset', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><wc-number-field name="qty" value="3"></wc-number-field></form>
    `);
    const el = form.querySelector<NumberField>('wc-number-field')!;
    expect(new FormData(form).get('qty')).to.equal('3');

    el.value = 9;
    form.reset();
    expect(el.value).to.equal(3);
  });
});

describe('NumberField validation', () => {
  it('blocks form submission while required and empty', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><wc-number-field name="qty" required></wc-number-field></form>
    `);
    const el = form.querySelector<NumberField>('wc-number-field')!;
    await el.updateComplete;

    expect(form.checkValidity()).to.be.false;
    expect(el.validity.valueMissing).to.be.true;
    expect(el.matches(':invalid')).to.be.true;

    el.value = 2;
    await el.updateComplete;
    expect(form.checkValidity()).to.be.true;
  });

  it('shows the message under the field after reportValidity()', async () => {
    const el = await fixture<NumberField>(
      html`<wc-number-field label="Qty" required></wc-number-field>`,
    );
    const field = el.shadowRoot!.querySelector<Field>('wc-field')!;
    expect(field.error).to.be.false;

    el.reportValidity();
    await el.updateComplete;

    expect(field.error).to.be.true;
    expect(field.errorText).to.equal(el.validationMessage);
    expect(input(el).getAttribute('aria-invalid')).to.equal('true');
  });

  it('reports rangeOverflow above max', async () => {
    const el = await fixture<NumberField>(
      html`<wc-number-field max="10" value="11"></wc-number-field>`,
    );
    expect(el.validity.rangeOverflow).to.be.true;
    expect(el.checkValidity()).to.be.false;

    el.value = 10;
    await el.updateComplete;
    expect(el.checkValidity()).to.be.true;
  });
});

describe('NumberField format', () => {
  const formatted = (el: NumberField) =>
    el.shadowRoot!.querySelector<HTMLElement>('.formatted');

  it('shows the formatted value while not focused, and the number while focused', async () => {
    const el = await fixture<NumberField>(
      html`<div lang="en-US">
        <wc-number-field
          value="1234.5"
          .format=${{ style: 'currency', currency: 'USD' }}
        ></wc-number-field>
      </div>`,
    ).then(div => div.querySelector<NumberField>('wc-number-field')!);
    expect(formatted(el)!.textContent!.trim()).to.equal('$1,234.50');
    expect(formatted(el)!.getAttribute('aria-hidden')).to.equal('true');
    expect(input(el).value).to.equal('1234.5');
    expect(input(el).classList.contains('show-formatted')).to.be.true;

    input(el).dispatchEvent(new FocusEvent('focus'));
    await el.updateComplete;
    expect(formatted(el)).to.be.null;
    expect(input(el).classList.contains('show-formatted')).to.be.false;

    input(el).value = '99';
    input(el).dispatchEvent(new InputEvent('input'));
    input(el).dispatchEvent(new FocusEvent('blur'));
    await el.updateComplete;
    expect(el.value).to.equal(99);
    expect(formatted(el)!.textContent!.trim()).to.equal('$99.00');
  });

  it('formats in the locale of the nearest lang', async () => {
    const div = await fixture<HTMLDivElement>(
      html`<div lang="de-DE">
        <wc-number-field
          value="1234.5"
          .format=${{ minimumFractionDigits: 2 }}
        ></wc-number-field>
      </div>`,
    );
    const el = div.querySelector<NumberField>('wc-number-field')!;
    await el.updateComplete;
    expect(formatted(el)!.textContent!.trim()).to.equal('1.234,50');
  });

  it('takes format as a JSON attribute and keeps value numeric', async () => {
    const el = await fixture<NumberField>(
      html`<wc-number-field
        lang="en-US"
        value="0.25"
        format='{"style":"percent"}'
      ></wc-number-field>`,
    );
    expect(formatted(el)!.textContent!.trim()).to.equal('25%');
    expect(el.value).to.equal(0.25);
  });

  it('shows nothing formatted while empty', async () => {
    const el = await fixture<NumberField>(
      html`<wc-number-field .format=${{ style: 'percent' }}></wc-number-field>`,
    );
    expect(formatted(el)).to.be.null;
  });
});

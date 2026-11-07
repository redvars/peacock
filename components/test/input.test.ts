/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Field } from '../src/field/index.js';
import { Input } from '../src/input/index.js';

for (const [tag, element] of [
  ['wc-field', Field],
  ['wc-input', Input],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function nativeInput(el: Input) {
  return el.shadowRoot!.querySelector<HTMLInputElement>('.input-element')!;
}

describe('Input', () => {
  it('passes its properties to the native input', async () => {
    const el = await fixture<Input>(
      html`<wc-input
        name="email"
        type="email"
        placeholder="you@example.com"
        value="a@b.c"
      ></wc-input>`,
    );
    const input = nativeInput(el);

    expect(input.type).to.equal('email');
    expect(input.placeholder).to.equal('you@example.com');
    expect(input.value).to.equal('a@b.c');
  });

  it('updates value as the user types', async () => {
    const el = await fixture<Input>(html`<wc-input></wc-input>`);
    const input = nativeInput(el);

    input.value = 'hello';
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));

    expect(el.value).to.equal('hello');
  });

  it('marks the field populated once it has a value', async () => {
    const el = await fixture<Input>(html`<wc-input label="Name"></wc-input>`);
    const field = el.shadowRoot!.querySelector<Field>('wc-field')!;
    expect(field.populated).to.be.false;

    el.value = 'Ada';
    await el.updateComplete;
    expect(field.populated).to.be.true;
  });

  it('submits its value with a form and restores it on reset', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><wc-input name="city" value="Oslo"></wc-input></form>
    `);
    const el = form.querySelector<Input>('wc-input')!;

    expect(new FormData(form).get('city')).to.equal('Oslo');

    el.value = 'Bergen';
    expect(new FormData(form).get('city')).to.equal('Bergen');

    form.reset();
    expect(el.value).to.equal('Oslo');
  });

  it('is disabled by a disabled fieldset', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <fieldset disabled><wc-input name="city"></wc-input></fieldset>
      </form>
    `);
    const el = form.querySelector<Input>('wc-input')!;
    await el.updateComplete;

    expect(el.disabled).to.be.true;
    expect(nativeInput(el).disabled).to.be.true;
  });

  it('fires input and change with the value in detail, and no native events', async () => {
    const wrapper = await fixture<HTMLDivElement>(
      html`<div><wc-input></wc-input></div>`,
    );
    const el = wrapper.querySelector<Input>('wc-input')!;
    const events: Event[] = [];
    wrapper.addEventListener('input', e => events.push(e));
    wrapper.addEventListener('change', e => events.push(e));

    const input = nativeInput(el);
    input.value = 'hi';
    input.dispatchEvent(
      new InputEvent('input', { bubbles: true, composed: true }),
    );
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(events.map(e => e.type)).to.deep.equal(['input', 'change']);
    expect(events.every(e => e instanceof CustomEvent)).to.be.true;
    expect((events[0] as CustomEvent).detail.value).to.equal('hi');
  });

  it('names the native input from its label and describes it with the helper text', async () => {
    const el = await fixture<Input>(
      html`<wc-input label="Email" helper-text="Work address"></wc-input>`,
    );
    const input = nativeInput(el);
    const describedBy = input.getAttribute('aria-describedby')!;

    expect(input.getAttribute('aria-label')).to.equal('Email');
    expect(el.shadowRoot!.getElementById(describedBy)?.textContent).to.equal(
      'Work address',
    );
  });

  it('keeps an aria-label set on the host', async () => {
    const el = await fixture<Input>(
      html`<wc-input label="Email" aria-label="Work email"></wc-input>`,
    );
    expect(nativeInput(el).getAttribute('aria-label')).to.equal('Work email');
    expect(el.hasAttribute('aria-label')).to.be.false;
  });

  it('defaults to the sm size', async () => {
    const el = await fixture<Input>(html`<wc-input></wc-input>`);
    expect(el.size).to.equal('sm');
    expect(el.shadowRoot!.querySelector<Field>('wc-field')!.size).to.equal(
      'sm',
    );
  });

  it('clears the value with the clear button', async () => {
    const el = await fixture<Input>(
      html`<wc-input clearable value="abc"></wc-input>`,
    );
    const changes: string[] = [];
    el.addEventListener('change', e =>
      changes.push((e as CustomEvent).detail.value),
    );

    el.shadowRoot!.querySelector<HTMLElement>('.clear-button')!.click();
    await el.updateComplete;

    expect(el.value).to.equal('');
    expect(changes).to.deep.equal(['']);
    expect(el.shadowRoot!.querySelector('.clear-button')).to.not.exist;
  });
});

describe('Input native attributes', () => {
  it('renders no autocomplete attribute by default', async () => {
    const el = await fixture<Input>(html`<wc-input></wc-input>`);
    const input = nativeInput(el);
    expect(input.hasAttribute('autocomplete')).to.be.false;
    for (const name of [
      'minlength',
      'maxlength',
      'pattern',
      'inputmode',
      'spellcheck',
    ]) {
      expect(input.hasAttribute(name), name).to.be.false;
    }
  });

  it('passes any autocomplete token and the text constraints to the native input', async () => {
    const el = await fixture<Input>(
      html`<wc-input
        autocomplete="one-time-code"
        minlength="2"
        maxlength="6"
        pattern="[0-9]+"
        inputmode="numeric"
        spellcheck="false"
      ></wc-input>`,
    );
    const input = nativeInput(el);
    expect(input.getAttribute('autocomplete')).to.equal('one-time-code');
    expect(input.minLength).to.equal(2);
    expect(input.maxLength).to.equal(6);
    expect(input.pattern).to.equal('[0-9]+');
    expect(input.getAttribute('inputmode')).to.equal('numeric');
    expect(input.getAttribute('spellcheck')).to.equal('false');
  });

  it('follows the inputMode and spellcheck properties set on the host', async () => {
    const el = await fixture<Input>(html`<wc-input></wc-input>`);
    el.inputMode = 'email';
    el.spellcheck = true;
    await el.updateComplete;
    expect(nativeInput(el).getAttribute('inputmode')).to.equal('email');
    expect(nativeInput(el).getAttribute('spellcheck')).to.equal('true');
  });

  it('shows a character counter with maxlength', async () => {
    const el = await fixture<Input>(
      html`<wc-input maxlength="10" value="abc"></wc-input>`,
    );
    const field = el.shadowRoot!.querySelector<Field>('wc-field')!;
    expect(field.textCount).to.equal('3/10');

    const input = nativeInput(el);
    input.value = 'abcde';
    input.dispatchEvent(new InputEvent('input'));
    await el.updateComplete;
    expect(field.textCount).to.equal('5/10');
  });

  it('shows no counter without maxlength', async () => {
    const el = await fixture<Input>(html`<wc-input value="abc"></wc-input>`);
    expect(el.shadowRoot!.querySelector<Field>('wc-field')!.textCount).to.equal(
      '',
    );
  });

  it('reports a pattern mismatch', async () => {
    const el = await fixture<Input>(
      html`<wc-input pattern="[0-9]+" value="abc"></wc-input>`,
    );
    expect(el.validity.patternMismatch).to.be.true;
    el.value = '123';
    await el.updateComplete;
    expect(el.validity.valid).to.be.true;
  });
});

describe('Input validation', () => {
  it('blocks form submission while required and empty', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><wc-input name="city" required></wc-input></form>
    `);
    const el = form.querySelector<Input>('wc-input')!;
    await el.updateComplete;

    expect(form.checkValidity()).to.be.false;
    expect(el.validity.valueMissing).to.be.true;
    expect(el.matches(':invalid')).to.be.true;

    el.value = 'Oslo';
    await el.updateComplete;
    expect(form.checkValidity()).to.be.true;
  });

  it('shows the message under the field after a failed check, and marks the input invalid', async () => {
    const el = await fixture<Input>(
      html`<wc-input label="City" required></wc-input>`,
    );
    const field = el.shadowRoot!.querySelector<Field>('wc-field')!;
    expect(field.error).to.be.false;

    el.reportValidity();
    await el.updateComplete;

    expect(field.error).to.be.true;
    expect(field.errorText).to.equal(el.validationMessage);
    expect(nativeInput(el).getAttribute('aria-invalid')).to.equal('true');
  });

  it('reports a bad email after the value is committed', async () => {
    const el = await fixture<Input>(html`<wc-input type="email"></wc-input>`);
    const input = nativeInput(el);
    input.value = 'not-an-email';
    input.dispatchEvent(new InputEvent('input'));
    input.dispatchEvent(new Event('change'));
    await el.updateComplete;

    expect(el.validity.typeMismatch).to.be.true;
    expect(
      el.shadowRoot!.querySelector<Field>('wc-field')!.errorText,
    ).to.not.equal('');
  });

  it('supports setCustomValidity', async () => {
    const el = await fixture<Input>(html`<wc-input value="taken"></wc-input>`);
    el.setCustomValidity('That name is taken');
    expect(el.checkValidity()).to.be.false;
    expect(el.validationMessage).to.equal('That name is taken');

    el.setCustomValidity('');
    expect(el.checkValidity()).to.be.true;
  });

  it('hides the message again on form reset', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><wc-input name="city" required></wc-input></form>
    `);
    const el = form.querySelector<Input>('wc-input')!;
    el.reportValidity();
    await el.updateComplete;

    form.reset();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector<Field>('wc-field')!.error).to.be.false;
  });
});

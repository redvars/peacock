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

  it('toggles password visibility', async () => {
    const el = await fixture<Input>(
      html`<wc-input type="password" value="secret"></wc-input>`,
    );
    expect(nativeInput(el).type).to.equal('password');

    el.shadowRoot!.querySelector<HTMLElement>('.password-toggle')!.click();
    await el.updateComplete;
    expect(nativeInput(el).type).to.equal('text');
  });
});

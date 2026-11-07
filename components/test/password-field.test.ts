/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Field } from '../src/field/index.js';
import { PasswordField } from '../src/password-field/index.js';
import { IconButton } from '../src/button/index.js';

for (const [tag, element] of [
  ['wc-field', Field],
  ['wc-icon-button', IconButton],
  ['wc-password-field', PasswordField],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function nativeInput(el: PasswordField) {
  return el.shadowRoot!.querySelector<HTMLInputElement>('.input-element')!;
}

function toggle(el: PasswordField) {
  return el.shadowRoot!.querySelector<IconButton>('.password-toggle')!;
}

describe('PasswordField', () => {
  it('hides the text and passes its properties to the native input', async () => {
    const el = await fixture<PasswordField>(
      html`<wc-password-field
        value="secret"
        placeholder="Password"
        minlength="8"
        maxlength="64"
        pattern="[a-z]+"
      ></wc-password-field>`,
    );
    const input = nativeInput(el);

    expect(input.type).to.equal('password');
    expect(input.value).to.equal('secret');
    expect(input.placeholder).to.equal('Password');
    expect(input.minLength).to.equal(8);
    expect(input.maxLength).to.equal(64);
    expect(input.pattern).to.equal('[a-z]+');
    expect(input.getAttribute('autocomplete')).to.equal('current-password');
  });

  it('leaves out length and pattern attributes that are not set', async () => {
    const el = await fixture<PasswordField>(
      html`<wc-password-field></wc-password-field>`,
    );
    const input = nativeInput(el);
    expect(input.hasAttribute('minlength')).to.be.false;
    expect(input.hasAttribute('maxlength')).to.be.false;
    expect(input.hasAttribute('pattern')).to.be.false;
  });

  it('takes autocomplete="new-password"', async () => {
    const el = await fixture<PasswordField>(
      html`<wc-password-field autocomplete="new-password"></wc-password-field>`,
    );
    expect(nativeInput(el).getAttribute('autocomplete')).to.equal(
      'new-password',
    );
  });

  it('shows and hides the text with the toggle', async () => {
    const el = await fixture<PasswordField>(
      html`<wc-password-field value="secret"></wc-password-field>`,
    );
    expect(toggle(el).getAttribute('aria-label')).to.equal('Show password');
    expect(toggle(el).getAttribute('aria-pressed')).to.equal('false');

    toggle(el).click();
    await el.updateComplete;
    expect(nativeInput(el).type).to.equal('text');
    expect(toggle(el).getAttribute('aria-label')).to.equal('Hide password');
    expect(toggle(el).getAttribute('aria-pressed')).to.equal('true');

    toggle(el).click();
    await el.updateComplete;
    expect(nativeInput(el).type).to.equal('password');
  });

  it('fires input and change with the value in detail, and no native events', async () => {
    const wrapper = await fixture<HTMLDivElement>(
      html`<div><wc-password-field></wc-password-field></div>`,
    );
    const el = wrapper.querySelector<PasswordField>('wc-password-field')!;
    const events: Event[] = [];
    wrapper.addEventListener('input', e => events.push(e));
    wrapper.addEventListener('change', e => events.push(e));

    const input = nativeInput(el);
    input.value = 'hunter2';
    input.dispatchEvent(
      new InputEvent('input', { bubbles: true, composed: true }),
    );
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(events.map(e => e.type)).to.deep.equal(['input', 'change']);
    expect(events.every(e => e instanceof CustomEvent)).to.be.true;
    expect((events[0] as CustomEvent).detail.value).to.equal('hunter2');
    expect(el.value).to.equal('hunter2');
  });

  it('clears the value with the clear button', async () => {
    const el = await fixture<PasswordField>(
      html`<wc-password-field clearable value="abc"></wc-password-field>`,
    );
    const changes: string[] = [];
    el.addEventListener('change', e =>
      changes.push((e as CustomEvent).detail.value),
    );

    el.shadowRoot!.querySelector<HTMLElement>('.clear-button')!.click();
    await el.updateComplete;

    expect(el.value).to.equal('');
    expect(changes).to.deep.equal(['']);
  });

  it('names the native input from its label', async () => {
    const el = await fixture<PasswordField>(
      html`<wc-password-field label="Password"></wc-password-field>`,
    );
    expect(nativeInput(el).getAttribute('aria-label')).to.equal('Password');
  });

  it('submits its value with a form and restores it on reset', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <wc-password-field name="pw" value="first"></wc-password-field>
      </form>
    `);
    const el = form.querySelector<PasswordField>('wc-password-field')!;
    expect(new FormData(form).get('pw')).to.equal('first');

    el.value = 'second';
    form.reset();
    expect(el.value).to.equal('first');
  });
});

describe('PasswordField validation', () => {
  it('blocks form submission while required and empty', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><wc-password-field name="pw" required></wc-password-field></form>
    `);
    const el = form.querySelector<PasswordField>('wc-password-field')!;
    await el.updateComplete;

    expect(form.checkValidity()).to.be.false;
    expect(el.validity.valueMissing).to.be.true;

    el.value = 'secret';
    await el.updateComplete;
    expect(form.checkValidity()).to.be.true;
  });

  it('reports a pattern mismatch and shows it after a commit', async () => {
    const el = await fixture<PasswordField>(
      html`<wc-password-field pattern="[a-z]+"></wc-password-field>`,
    );
    const input = nativeInput(el);
    input.value = 'ABC123';
    input.dispatchEvent(new InputEvent('input'));
    input.dispatchEvent(new Event('change'));
    await el.updateComplete;

    expect(el.validity.patternMismatch).to.be.true;
    const field = el.shadowRoot!.querySelector<Field>('wc-field')!;
    expect(field.error).to.be.true;
    expect(field.errorText).to.equal(el.validationMessage);
    expect(input.getAttribute('aria-invalid')).to.equal('true');
  });
});

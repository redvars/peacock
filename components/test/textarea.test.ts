/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Field } from '../src/field/field.js';
import { Textarea } from '../src/textarea/textarea.js';

for (const [tag, element] of [
  ['wc-field', Field],
  ['wc-textarea', Textarea],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function nativeTextarea(el: Textarea) {
  return el.shadowRoot!.querySelector<HTMLTextAreaElement>('.input-element')!;
}

describe('Textarea', () => {
  it('passes its properties to the native textarea', async () => {
    const el = await fixture<Textarea>(
      html`<wc-textarea
        placeholder="Describe it"
        rows="5"
        value="Hello"
      ></wc-textarea>`,
    );
    const textarea = nativeTextarea(el);

    expect(textarea.placeholder).to.equal('Describe it');
    expect(textarea.rows).to.equal(5);
    expect(textarea.value).to.equal('Hello');
  });

  it('fires input and change with the value in detail, and no native events', async () => {
    const wrapper = await fixture<HTMLDivElement>(
      html`<div><wc-textarea></wc-textarea></div>`,
    );
    const el = wrapper.querySelector<Textarea>('wc-textarea')!;
    const events: Event[] = [];
    wrapper.addEventListener('input', e => events.push(e));
    wrapper.addEventListener('change', e => events.push(e));

    const textarea = nativeTextarea(el);
    textarea.value = 'hi';
    textarea.dispatchEvent(
      new InputEvent('input', { bubbles: true, composed: true }),
    );
    textarea.dispatchEvent(new Event('change', { bubbles: true }));

    expect(events.map(e => e.type)).to.deep.equal(['input', 'change']);
    expect(events.every(e => e instanceof CustomEvent)).to.be.true;
    expect((events[0] as CustomEvent).detail.value).to.equal('hi');
    expect(el.value).to.equal('hi');
  });

  it('names the native textarea from its label', async () => {
    const el = await fixture<Textarea>(
      html`<wc-textarea label="Notes"></wc-textarea>`,
    );
    expect(nativeTextarea(el).getAttribute('aria-label')).to.equal('Notes');
  });

  it('moves aria attributes and tabindex from the host to the textarea', async () => {
    const el = await fixture<Textarea>(
      html`<wc-textarea aria-label="Comments" tabindex="-1"></wc-textarea>`,
    );
    expect(nativeTextarea(el).getAttribute('aria-label')).to.equal('Comments');
    expect(nativeTextarea(el).getAttribute('tabindex')).to.equal('-1');
    expect(el.hasAttribute('aria-label')).to.be.false;
  });

  it('defaults to the sm size', async () => {
    const el = await fixture<Textarea>(html`<wc-textarea></wc-textarea>`);
    expect(el.size).to.equal('sm');
    expect(el.shadowRoot!.querySelector<Field>('wc-field')!.size).to.equal(
      'sm',
    );
  });

  it('clears the value with the clear button', async () => {
    const el = await fixture<Textarea>(
      html`<wc-textarea clearable value="abc"></wc-textarea>`,
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

  it('submits its value with a form and restores it on reset', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><wc-textarea name="notes" value="First"></wc-textarea></form>
    `);
    const el = form.querySelector<Textarea>('wc-textarea')!;
    expect(new FormData(form).get('notes')).to.equal('First');

    el.value = 'Second';
    form.reset();
    expect(el.value).to.equal('First');
  });
});

describe('Textarea validation', () => {
  it('blocks form submission while required and empty', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><wc-textarea name="notes" required></wc-textarea></form>
    `);
    const el = form.querySelector<Textarea>('wc-textarea')!;
    await el.updateComplete;

    expect(form.checkValidity()).to.be.false;
    expect(el.validity.valueMissing).to.be.true;
    expect(el.matches(':invalid')).to.be.true;

    el.value = 'Something';
    await el.updateComplete;
    expect(form.checkValidity()).to.be.true;
  });

  it('shows the message under the field after reportValidity()', async () => {
    const el = await fixture<Textarea>(
      html`<wc-textarea label="Notes" required></wc-textarea>`,
    );
    const field = el.shadowRoot!.querySelector<Field>('wc-field')!;
    expect(field.error).to.be.false;

    el.reportValidity();
    await el.updateComplete;

    expect(field.error).to.be.true;
    expect(field.errorText).to.equal(el.validationMessage);
    expect(nativeTextarea(el).getAttribute('aria-invalid')).to.equal('true');
  });
});

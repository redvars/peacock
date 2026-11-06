/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { Field } from '../src/field/field.js';
import { UrlField } from '../src/url-field/url-field.js';

for (const [tag, element] of [
  ['wc-field', Field],
  ['wc-url-field', UrlField],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function urlInput(el: UrlField) {
  return el.shadowRoot!.querySelector<HTMLInputElement>('.url-input');
}

describe('UrlField', () => {
  it('shows the value as a link while not editing', async () => {
    const el = await fixture<UrlField>(
      html`<wc-url-field value="https://example.com"></wc-url-field>`,
    );
    const link = el.shadowRoot!.querySelector<HTMLAnchorElement>('.url-link')!;
    expect(link.getAttribute('href')).to.equal('https://example.com');
    expect(urlInput(el)).to.not.exist;
  });

  it('fires input and change with the value in detail, and no native events', async () => {
    const wrapper = await fixture<HTMLDivElement>(
      html`<div><wc-url-field editing></wc-url-field></div>`,
    );
    const el = wrapper.querySelector<UrlField>('wc-url-field')!;
    const events: Event[] = [];
    wrapper.addEventListener('input', e => events.push(e));
    wrapper.addEventListener('change', e => events.push(e));

    const input = urlInput(el)!;
    input.value = 'https://a.b';
    input.dispatchEvent(
      new InputEvent('input', { bubbles: true, composed: true }),
    );
    input.dispatchEvent(new Event('change', { bubbles: true }));

    expect(events.map(e => e.type)).to.deep.equal(['input', 'change']);
    expect(events.every(e => e instanceof CustomEvent)).to.be.true;
    expect((events[0] as CustomEvent).detail.value).to.equal('https://a.b');
    expect(el.value).to.equal('https://a.b');
  });

  it('still fires the deprecated value-change event', async () => {
    const el = await fixture<UrlField>(
      html`<wc-url-field editing debounce="0"></wc-url-field>`,
    );
    const input = urlInput(el)!;
    input.value = 'https://a.b';
    setTimeout(() => input.dispatchEvent(new InputEvent('input')));

    const event = (await oneEvent(el, 'value-change')) as CustomEvent<string>;
    expect(event.detail).to.equal('https://a.b');
  });

  it('names the native input from its label', async () => {
    const el = await fixture<UrlField>(
      html`<wc-url-field editing label="Website"></wc-url-field>`,
    );
    expect(urlInput(el)!.getAttribute('aria-label')).to.equal('Website');
  });

  it('defaults to the sm size', async () => {
    const el = await fixture<UrlField>(html`<wc-url-field></wc-url-field>`);
    expect(el.size).to.equal('sm');
    expect(el.shadowRoot!.querySelector<Field>('wc-field')!.size).to.equal(
      'sm',
    );
  });

  it('clears the value with the clear button', async () => {
    const el = await fixture<UrlField>(
      html`<wc-url-field clearable value="https://a.b"></wc-url-field>`,
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
});

describe('UrlField validation', () => {
  it('blocks form submission while required and empty', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><wc-url-field name="site" required></wc-url-field></form>
    `);
    const el = form.querySelector<UrlField>('wc-url-field')!;
    await el.updateComplete;

    expect(form.checkValidity()).to.be.false;
    expect(el.validity.valueMissing).to.be.true;
    expect(el.matches(':invalid')).to.be.true;

    el.value = 'https://example.com';
    await el.updateComplete;
    expect(form.checkValidity()).to.be.true;
  });

  it('shows the message under the field after reportValidity()', async () => {
    const el = await fixture<UrlField>(
      html`<wc-url-field label="Website" required editing></wc-url-field>`,
    );
    const field = el.shadowRoot!.querySelector<Field>('wc-field')!;
    expect(field.error).to.be.false;

    el.reportValidity();
    await el.updateComplete;

    expect(field.error).to.be.true;
    expect(field.errorText).to.equal(el.validationMessage);
    expect(urlInput(el)!.getAttribute('aria-invalid')).to.equal('true');
  });

  it('reports a malformed URL while editing', async () => {
    const el = await fixture<UrlField>(
      html`<wc-url-field editing value="not a url"></wc-url-field>`,
    );
    expect(el.validity.typeMismatch).to.be.true;
  });
});

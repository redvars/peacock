/// <reference types="mocha" />
import { html, type TemplateResult } from 'lit';
import { fixture, fixtureSync, expect } from '@open-wc/testing';
import { Field } from '../src/field/field.js';
import { UrlField } from '../src/url-field/url-field.js';
import { setPeacockStrings } from '../src/__internal/i18n/strings.js';

for (const [tag, element] of [
  ['wc-field', Field],
  ['wc-url-field', UrlField],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function urlInput(el: UrlField) {
  return el.shadowRoot!.querySelector<HTMLInputElement>('.url-input');
}

/** Renders a URL field and starts editing, the way focusing it does. */
async function editingField(template: TemplateResult) {
  const el = await fixture<UrlField>(template);
  el.focus();
  await el.updateComplete;
  return el;
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
    const wrapper = fixtureSync<HTMLDivElement>(
      html`<div><wc-url-field></wc-url-field></div>`,
    );
    const el = wrapper.querySelector<UrlField>('wc-url-field')!;
    await el.updateComplete;
    el.focus();
    await el.updateComplete;
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

  it('names the native input from its label', async () => {
    const el = await editingField(
      html`<wc-url-field label="Website"></wc-url-field>`,
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
    const form = fixtureSync<HTMLFormElement>(html`
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
    const el = await editingField(
      html`<wc-url-field label="Website" required></wc-url-field>`,
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
    const el = await editingField(
      html`<wc-url-field value="not a url"></wc-url-field>`,
    );
    expect(el.validity.typeMismatch).to.be.true;
  });

  it("uses Peacock's message for a malformed URL", async () => {
    setPeacockStrings({ invalidUrl: 'Adresse invalide' });
    try {
      const el = await editingField(
        html`<wc-url-field value="not a url"></wc-url-field>`,
      );
      expect(el.validationMessage).to.equal('Adresse invalide');
    } finally {
      setPeacockStrings({});
    }
  });
});

describe('UrlField editing', () => {
  it('starts editing on focus and focuses the input once rendered', async () => {
    const el = await fixture<UrlField>(
      html`<wc-url-field value="https://a.b"></wc-url-field>`,
    );
    el.focus();
    await el.updateComplete;
    const input = urlInput(el)!;
    expect(input).to.exist;
    expect(el.shadowRoot!.activeElement).to.equal(input);
  });

  it('starts editing from the edit button, which has a label', async () => {
    const el = await fixture<UrlField>(
      html`<wc-url-field value="https://a.b"></wc-url-field>`,
    );
    const button = el.shadowRoot!.querySelector<HTMLElement>('.edit-button')!;
    expect(button.getAttribute('aria-label')).to.equal('Edit URL');
    button.click();
    await el.updateComplete;
    expect(urlInput(el)).to.exist;
  });

  it('cancels editing with Escape and restores the value', async () => {
    const el = await fixture<UrlField>(
      html`<wc-url-field value="https://a.b"></wc-url-field>`,
    );
    el.focus();
    await el.updateComplete;
    const input = urlInput(el)!;
    input.value = 'not a url';
    input.dispatchEvent(new InputEvent('input'));
    expect(el.value).to.equal('not a url');

    const changes: string[] = [];
    el.addEventListener('change', e =>
      changes.push((e as CustomEvent).detail.value),
    );
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await el.updateComplete;

    expect(el.value).to.equal('https://a.b');
    expect(changes).to.deep.equal(['https://a.b']);
    expect(urlInput(el)).to.not.exist;
    expect(el.shadowRoot!.querySelector('.url-link')).to.exist;
    expect(el.validity.valid).to.be.true;
  });

  it('shows the start and end slots while viewing and editing', async () => {
    const el = await fixture<UrlField>(
      html`<wc-url-field value="https://a.b"
        ><span slot="start">S</span><span slot="end">E</span></wc-url-field
      >`,
    );
    const assigned = () =>
      ['start', 'end'].map(
        name =>
          el
            .shadowRoot!.querySelector<HTMLSlotElement>(`slot[name="${name}"]`)
            ?.assignedElements().length,
      );
    expect(assigned()).to.deep.equal([1, 1]);
    el.focus();
    await el.updateComplete;
    expect(urlInput(el)).to.exist;
    expect(assigned()).to.deep.equal([1, 1]);
  });
});

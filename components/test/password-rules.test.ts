/// <reference types="mocha" />
import { html, type TemplateResult } from 'lit';
import { expect, fixtureSync, waitUntil } from '@open-wc/testing';
import {
  PasswordRules,
  testPasswordRule,
  type PasswordRulesChangeDetail,
} from '../src/password-rules/index.js';
import { PasswordField } from '../src/password-field/index.js';

for (const [tag, element] of [
  ['wc-password-field', PasswordField],
  ['wc-password-rules', PasswordRules],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function items(el: PasswordRules) {
  return Array.from(el.shadowRoot!.querySelectorAll('.rule')).map(item => ({
    label: item.querySelector('.rule-label')?.textContent?.trim(),
    status: item.querySelector('.screen-reader-only')?.textContent?.trim(),
    met: item.classList.contains('met'),
    icon: item.querySelector('wc-icon')?.getAttribute('name'),
  }));
}

async function create(template: TemplateResult) {
  const el = fixtureSync(template) as PasswordRules;
  await el.updateComplete;
  return el;
}

async function typeInto(field: PasswordField, value: string) {
  await field.updateComplete;
  const input = field.shadowRoot!.querySelector('input')!;
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
}

describe('PasswordRules', () => {
  it('lists the built-in rules in order with translated labels', async () => {
    const el = await create(
      html`<wc-password-rules
        minlength="12"
        require-uppercase
        require-lowercase
        require-number
        require-symbol
      ></wc-password-rules>`,
    );
    expect(items(el).map(item => item.label)).to.deep.equal([
      'At least 12 characters',
      'One uppercase letter',
      'One lowercase letter',
      'One number',
      'One symbol',
    ]);
    const list = el.shadowRoot!.querySelector('ul')!;
    expect(list.getAttribute('aria-label')).to.equal('Password requirements');
  });

  it('marks each rule met or not met with an icon and text', async () => {
    const el = await create(
      html`<wc-password-rules
        minlength="4"
        require-number
        value="abcd"
      ></wc-password-rules>`,
    );
    expect(items(el)).to.deep.equal([
      {
        label: 'At least 4 characters',
        status: 'met',
        met: true,
        icon: 'check_circle',
      },
      {
        label: 'One number',
        status: 'not met',
        met: false,
        icon: 'radio_button_unchecked',
      },
    ]);
    expect(el.valid).to.be.false;
    el.value = 'abc1';
    await el.updateComplete;
    expect(items(el).every(item => item.met)).to.be.true;
    expect(el.valid).to.be.true;
  });

  it('counts characters by code point and treats Unicode letters', async () => {
    const el = await create(
      html`<wc-password-rules
        minlength="3"
        require-uppercase
        require-symbol
      ></wc-password-rules>`,
    );
    el.value = 'Ä😀';
    await el.updateComplete;
    expect(items(el).map(item => item.met)).to.deep.equal([false, true, true]);
  });

  it('adds custom rules after the built-in ones', async () => {
    const el = await create(
      html`<wc-password-rules require-number></wc-password-rules>`,
    );
    el.rules = [
      { id: 'no-spaces', label: 'No spaces', test: value => !/\s/.test(value) },
      { id: 'two-a', label: 'Two letters a', test: /a.*a/g },
    ];
    el.value = 'aa1';
    await el.updateComplete;
    expect(items(el).map(item => [item.label, item.met])).to.deep.equal([
      ['One number', true],
      ['No spaces', true],
      ['Two letters a', true],
    ]);
  });

  it('tests a global pattern the same way every time', () => {
    const rule = { id: 'x', label: 'x', test: /a/g };
    expect(testPasswordRule(rule, 'a')).to.be.true;
    expect(testPasswordRule(rule, 'a')).to.be.true;
  });

  it('fires change only when the result flips', async () => {
    const el = await create(
      html`<wc-password-rules
        minlength="3"
        require-number
      ></wc-password-rules>`,
    );
    const events: PasswordRulesChangeDetail[] = [];
    el.addEventListener('change', event =>
      events.push((event as CustomEvent<PasswordRulesChangeDetail>).detail),
    );
    el.value = 'ab';
    await el.updateComplete;
    expect(events).to.have.length(0);
    el.value = 'abc1';
    await el.updateComplete;
    el.value = 'abcd1';
    await el.updateComplete;
    el.value = 'abcd';
    await el.updateComplete;
    expect(events).to.deep.equal([
      { valid: true, failed: [] },
      { valid: false, failed: ['number'] },
    ]);
  });

  it('follows the field named by for and blocks its form', async () => {
    const form = fixtureSync(
      html`<form>
        <wc-password-field
          id="pw"
          name="pw"
          label="New password"
        ></wc-password-field>
        <wc-password-rules
          for="pw"
          minlength="8"
          require-number
        ></wc-password-rules>
      </form>`,
    ) as HTMLFormElement;
    const field = form.querySelector('wc-password-field') as PasswordField;
    const rules = form.querySelector('wc-password-rules') as PasswordRules;
    await rules.updateComplete;
    await field.updateComplete;

    // An empty field is left to `required`.
    expect(field.checkValidity()).to.be.true;

    await typeInto(field, 'short');
    await rules.updateComplete;
    expect(rules.value).to.equal('short');
    expect(field.checkValidity()).to.be.false;
    expect(field.validationMessage).to.equal(
      'Password does not meet the requirements.',
    );
    expect(form.checkValidity()).to.be.false;

    await typeInto(field, 'long enough 1');
    await rules.updateComplete;
    expect(field.checkValidity()).to.be.true;
    expect(form.checkValidity()).to.be.true;
  });

  it('reads the field value it starts with', async () => {
    const wrapper = fixtureSync(
      html`<div>
        <wc-password-field id="pw2" value="abc"></wc-password-field>
        <wc-password-rules for="pw2" minlength="2"></wc-password-rules>
      </div>`,
    );
    const rules = wrapper.querySelector('wc-password-rules') as PasswordRules;
    await rules.updateComplete;
    expect(rules.value).to.equal('abc');
  });

  it('clears the custom validity when disconnected', async () => {
    const wrapper = fixtureSync(
      html`<div>
        <wc-password-field id="pw3"></wc-password-field>
        <wc-password-rules for="pw3" minlength="8"></wc-password-rules>
      </div>`,
    );
    const field = wrapper.querySelector('wc-password-field') as PasswordField;
    const rules = wrapper.querySelector('wc-password-rules') as PasswordRules;
    await rules.updateComplete;
    await typeInto(field, 'abc');
    await rules.updateComplete;
    expect(field.checkValidity()).to.be.false;
    rules.remove();
    expect(field.checkValidity()).to.be.true;
  });

  it('ignores input from other elements', async () => {
    const wrapper = fixtureSync(
      html`<div>
        <wc-password-field id="pw4"></wc-password-field>
        <wc-password-field id="other"></wc-password-field>
        <wc-password-rules for="pw4" minlength="8"></wc-password-rules>
      </div>`,
    );
    const other = wrapper.querySelector('#other') as PasswordField;
    const rules = wrapper.querySelector('wc-password-rules') as PasswordRules;
    await rules.updateComplete;
    await typeInto(other, 'abc');
    await rules.updateComplete;
    expect(rules.value).to.equal('');
  });

  it('announces flipped rules once typing pauses', async function announces() {
    this.timeout(8000);
    const el = await create(
      html`<wc-password-rules
        minlength="3"
        require-number
      ></wc-password-rules>`,
    );
    const region = el.shadowRoot!.querySelector('[role="status"]')!;
    el.value = 'a';
    await el.updateComplete;
    el.value = 'abc';
    await el.updateComplete;
    expect(region.textContent?.trim()).to.equal('');
    await waitUntil(
      () => region.textContent?.trim() === 'At least 3 characters: met',
      'announces the flip',
      { timeout: 3000 },
    );
    el.value = 'abc1';
    await el.updateComplete;
    await waitUntil(
      () => region.textContent?.trim() === 'All password requirements met',
      'announces that all are met',
      { timeout: 3000 },
    );
  });
});

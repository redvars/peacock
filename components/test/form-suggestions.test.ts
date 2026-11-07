/// <reference types="mocha" />
import { html, type TemplateResult } from 'lit';
import { expect, fixtureSync, oneEvent, waitUntil } from '@open-wc/testing';
import { setPeacockAi } from '../src/__internal/ai/config.js';
import type { SuggestionAcceptDetail } from '../src/__internal/ai/suggestion-controller.js';
import { AiBadge } from '../src/ai-badge/index.js';
import { Alert } from '../src/alert/index.js';
import { Button } from '../src/button/index.js';
import { Field } from '../src/field/index.js';
import { Form, type FormSubmitDetail } from '../src/form/index.js';
import { Input } from '../src/input/index.js';
import { Radio, RadioGroup } from '../src/radio/index.js';

for (const [tag, element] of [
  ['wc-ai-badge', AiBadge],
  ['wc-alert', Alert],
  ['wc-button', Button],
  ['wc-field', Field],
  ['wc-input', Input],
  ['wc-radio', Radio],
  ['wc-radio-group', RadioGroup],
  ['wc-form', Form],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

async function setup(template: TemplateResult) {
  const el = fixtureSync<Form>(template);
  await el.updateComplete;
  const form = el.querySelector('form') as HTMLFormElement;
  await Promise.all(
    Array.from(form.elements).map(
      control => (control as Partial<Input>).updateComplete,
    ),
  );
  return { el, form };
}

const incident = html`<wc-form>
  <form>
    <wc-input name="title" label="Short description"></wc-input>
    <wc-input name="asset" label="Asset" value="LT-0001"></wc-input>
    <wc-input name="salary" label="Salary" sensitive></wc-input>
    <wc-radio-group name="urgency" label="Urgency" value="2">
      <wc-radio value="2" label="Medium-high"></wc-radio>
      <wc-radio value="3" label="Medium"></wc-radio>
    </wc-radio-group>
    <button type="submit">Raise incident</button>
  </form>
</wc-form>`;

const banner = (el: Form) => el.shadowRoot!.querySelector('.draft-banner');

describe('Form suggestions', () => {
  afterEach(() => setPeacockAi({}));

  it('fills named fields and radio groups, skipping sensitive and unknown names', async () => {
    const { el } = await setup(incident);
    const applied = await el.suggest({
      title: { value: 'Cracked screen on LT-0412' },
      asset: { value: 'LT-0412', reason: 'Assigned to you.' },
      urgency: { value: '3', reason: "You didn't say you can't work." },
      salary: { value: '9000' },
      nope: { value: 'x' },
    });
    expect(applied).to.deep.equal(['title', 'asset', 'urgency']);
    const title = el.querySelector('[name="title"]') as Input;
    const salary = el.querySelector('[name="salary"]') as Input;
    const group = el.querySelector('wc-radio-group') as RadioGroup;
    expect(title.value).to.equal('Cracked screen on LT-0412');
    expect(salary.value).to.equal('');
    expect(group.value).to.equal('3');
    expect(el.value.urgency).to.equal('3');
  });

  it('shows the draft banner while any field holds a suggestion', async () => {
    const { el } = await setup(incident);
    expect(banner(el)).to.equal(null);
    await el.suggest({ asset: { value: 'LT-0412' } });
    await el.updateComplete;
    expect(banner(el)?.getAttribute('role')).to.equal('status');
    expect(banner(el)?.textContent).to.contain('Drafted by the assistant.');

    (el.querySelector('[name="asset"]') as Input).acceptSuggestion();
    await el.updateComplete;
    expect(banner(el)).to.equal(null);
  });

  it('clears every suggestion with Clear all', async () => {
    const { el } = await setup(incident);
    await el.suggest({
      asset: { value: 'LT-0412' },
      urgency: { value: '3' },
    });
    await el.updateComplete;
    (banner(el)!.querySelector('wc-button') as HTMLElement).click();
    await el.updateComplete;
    expect((el.querySelector('[name="asset"]') as Input).value).to.equal(
      'LT-0001',
    );
    expect((el.querySelector('wc-radio-group') as RadioGroup).value).to.equal(
      '2',
    );
    expect(banner(el)).to.equal(null);
  });

  it('lists still-suggested fields on submit and accepts them', async () => {
    const { el, form } = await setup(incident);
    await el.suggest({
      title: { value: 'Cracked screen' },
      asset: { value: 'LT-0412' },
      urgency: { value: '3' },
    });
    // The person edits the title, which accepts that one suggestion.
    const title = el.querySelector('[name="title"]') as Input;
    title.dispatchEvent(
      new CustomEvent('input', { bubbles: true, composed: true }),
    );
    const accepts: Array<[string, string]> = [];
    el.addEventListener('accept', event => {
      const target = event.target as Input;
      accepts.push([
        target.name ?? '',
        (event as CustomEvent<SuggestionAcceptDetail>).detail.cause,
      ]);
    });
    el.addEventListener('submit', event => event.preventDefault());
    setTimeout(() => form.requestSubmit());
    const event = (await oneEvent(
      el,
      'submit',
    )) as CustomEvent<FormSubmitDetail>;
    expect(event.detail.suggested).to.deep.equal(['asset', 'urgency']);
    await waitUntil(() => accepts.length === 2);
    expect(accepts).to.deep.equal([
      ['asset', 'submit'],
      ['urgency', 'submit'],
    ]);
    await el.updateComplete;
    expect(banner(el)).to.equal(null);
  });

  it('counts a drafted form as dirty', async () => {
    const { el } = await setup(incident);
    expect(el.dirty).to.equal(false);
    await el.suggest({ asset: { value: 'LT-0412' } });
    expect(el.dirty).to.equal(true);
  });

  it('hides the banner with hide-draft-banner, and does nothing while AI is off', async () => {
    const { el } = await setup(
      html`<wc-form hide-draft-banner>
        <form><wc-input name="asset" label="Asset"></wc-input></form>
      </wc-form>`,
    );
    await el.suggest({ asset: { value: 'LT-0412' } });
    await el.updateComplete;
    expect(banner(el)).to.equal(null);

    setPeacockAi({ enabled: false });
    const { el: off } = await setup(incident);
    const applied = await off.suggest({ asset: { value: 'LT-0412' } });
    await off.updateComplete;
    expect(applied).to.deep.equal([]);
    expect((off.querySelector('[name="asset"]') as Input).value).to.equal(
      'LT-0001',
    );
    expect(banner(off)).to.equal(null);
  });
});

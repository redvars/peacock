/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixture, oneEvent } from '@open-wc/testing';
import { setPeacockAi } from '../src/__internal/ai/config.js';
import type {
  SuggestionAcceptDetail,
  SuggestionDismissDetail,
} from '../src/__internal/ai/suggestion-controller.js';
import { AiBadge } from '../src/ai-badge/index.js';
import { Checkbox } from '../src/checkbox/index.js';
import { CheckboxGroup } from '../src/checkbox-group/index.js';
import { Field } from '../src/field/index.js';
import { Input } from '../src/input/index.js';
import { Item } from '../src/item/index.js';
import { Menu, MenuItem } from '../src/menu/index.js';
import { PasswordField } from '../src/password-field/index.js';
import { Radio, RadioGroup } from '../src/radio/index.js';
import { Rating } from '../src/rating/index.js';
import { Select, SelectOptionElement } from '../src/select/index.js';
import { Slider } from '../src/slider/index.js';
import { Switch } from '../src/switch/index.js';
import { Tooltip } from '../src/tooltip/tooltip.js';

for (const [tag, element] of [
  ['wc-ai-badge', AiBadge],
  ['wc-checkbox', Checkbox],
  ['wc-checkbox-group', CheckboxGroup],
  ['wc-field', Field],
  ['wc-input', Input],
  ['wc-item', Item],
  ['wc-menu', Menu],
  ['wc-menu-item', MenuItem],
  ['wc-option', SelectOptionElement],
  ['wc-password-field', PasswordField],
  ['wc-radio', Radio],
  ['wc-radio-group', RadioGroup],
  ['wc-rating', Rating],
  ['wc-select', Select],
  ['wc-slider', Slider],
  ['wc-switch', Switch],
  ['wc-tooltip', Tooltip],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

const badge = (el: Element) =>
  el.shadowRoot!.querySelector('.suggestion-badge') as AiBadge | null;

/** Presses the clear button inside a field's Suggested badge. */
async function pressClear(el: Element) {
  const marker = badge(el);
  expect(marker, 'a Suggested badge').to.not.equal(null);
  await (marker as AiBadge).updateComplete;
  (
    (marker as AiBadge).shadowRoot!.querySelector(
      '.dismiss',
    ) as HTMLButtonElement
  ).click();
}

const fieldHelper = (el: Input) =>
  el.shadowRoot!.querySelector('wc-field')!.getAttribute('helper-text');

describe('Field suggestions', () => {
  afterEach(() => setPeacockAi({}));

  it('fills the field, marks it and shows the reason as help', async () => {
    const el = await fixture<Input>(
      html`<wc-input
        label="Asset"
        value="LT-0001"
        helper-text="Tag on the base"
      ></wc-input>`,
    );
    el.suggestion = { value: 'LT-0412', reason: 'Assigned to you.' };
    await el.updateComplete;
    expect(el.value).to.equal('LT-0412');
    expect(el.suggested).to.equal(true);
    expect(badge(el)?.getAttribute('slot')).to.equal('field-end');
    expect(fieldHelper(el)).to.equal('Assigned to you.');
    const description = el.shadowRoot!.querySelector('[hidden][id]');
    expect(description?.textContent).to.equal(
      'Suggested by the assistant. Assigned to you.',
    );
  });

  it('accepts the suggestion when the person edits the value', async () => {
    const el = await fixture<Input>(html`<wc-input label="Asset"></wc-input>`);
    el.suggestion = { value: 'LT-0412' };
    await el.updateComplete;
    setTimeout(() =>
      el.dispatchEvent(
        new CustomEvent('input', {
          detail: { value: 'LT-0413' },
          bubbles: true,
          composed: true,
        }),
      ),
    );
    const event = (await oneEvent(
      el,
      'accept',
    )) as CustomEvent<SuggestionAcceptDetail>;
    expect(event.detail.cause).to.equal('edit');
    await el.updateComplete;
    expect(el.suggested).to.equal(false);
    expect(badge(el)).to.equal(null);
  });

  it('clears to the previous value, with dismiss before input and change', async () => {
    const el = await fixture<Input>(
      html`<wc-input label="Due" value="Monday"></wc-input>`,
    );
    el.suggestion = { value: 'Friday', reason: 'Your leave starts Friday.' };
    await el.updateComplete;
    const order: string[] = [];
    let dismissed: SuggestionDismissDetail | undefined;
    el.addEventListener('dismiss', event => {
      order.push('dismiss');
      dismissed = (event as CustomEvent<SuggestionDismissDetail>).detail;
    });
    el.addEventListener('input', () => order.push('input'));
    el.addEventListener('change', () => order.push('change'));
    let accepted = false;
    el.addEventListener('accept', () => {
      accepted = true;
    });
    await pressClear(el);
    await el.updateComplete;
    expect(el.value).to.equal('Monday');
    expect(order).to.deep.equal(['dismiss', 'input', 'change']);
    expect(dismissed).to.deep.equal({ value: 'Friday' });
    // Restoring the value is not the person editing it.
    expect(accepted).to.equal(false);
    expect(el.suggested).to.equal(false);
    expect(fieldHelper(el)).to.equal('');
  });

  it('keeps the first previous value when a suggestion replaces another', async () => {
    const el = await fixture<Input>(
      html`<wc-input label="Due" value="Monday"></wc-input>`,
    );
    el.suggestion = { value: 'Friday' };
    el.suggestion = { value: 'Thursday' };
    await el.updateComplete;
    expect(el.value).to.equal('Thursday');
    el.dismissSuggestion();
    expect(el.value).to.equal('Monday');
  });

  it('accepts from code, and drops the marker on null', async () => {
    const el = await fixture<Input>(html`<wc-input label="Asset"></wc-input>`);
    el.suggestion = { value: 'LT-0412' };
    setTimeout(() => el.acceptSuggestion());
    const event = (await oneEvent(
      el,
      'accept',
    )) as CustomEvent<SuggestionAcceptDetail>;
    expect(event.detail).to.deep.equal({ value: 'LT-0412', cause: 'action' });

    el.suggestion = { value: 'LT-0500' };
    el.suggestion = null;
    await el.updateComplete;
    expect(el.value).to.equal('LT-0500');
    expect(el.suggested).to.equal(false);
  });

  it('ignores suggestions while AI is off, on sensitive fields and on passwords', async () => {
    setPeacockAi({ enabled: false });
    const off = await fixture<Input>(
      html`<wc-input label="Asset" value="LT-0001"></wc-input>`,
    );
    off.suggestion = { value: 'LT-0412' };
    await off.updateComplete;
    expect(off.value).to.equal('LT-0001');
    expect(badge(off)).to.equal(null);
    setPeacockAi({});

    const sensitive = await fixture<Input>(
      html`<wc-input label="Salary" value="1000" sensitive></wc-input>`,
    );
    sensitive.suggestion = { value: '2000' };
    expect(sensitive.value).to.equal('1000');

    const password = await fixture<PasswordField>(
      html`<wc-password-field label="Password"></wc-password-field>`,
    );
    password.suggestion = { value: 'hunter2' };
    await password.updateComplete;
    expect(password.value).to.not.equal('hunter2');
    expect(badge(password)).to.equal(null);
  });

  it('hides the marker when AI turns off and shows it again when it turns on', async () => {
    const el = await fixture<Input>(html`<wc-input label="Asset"></wc-input>`);
    el.suggestion = { value: 'LT-0412', reason: 'Assigned to you.' };
    await el.updateComplete;
    setPeacockAi({ enabled: false });
    await el.updateComplete;
    expect(badge(el)).to.equal(null);
    expect(fieldHelper(el)).to.equal('');
    expect(el.value).to.equal('LT-0412');
    setPeacockAi({});
    await el.updateComplete;
    expect(badge(el)).to.not.equal(null);
  });
});

describe('Suggestions in other controls', () => {
  afterEach(() => setPeacockAi({}));

  it('marks the suggested option of a select', async () => {
    const el = await fixture<Select>(
      html`<wc-select label="Group">
        <wc-option value="net">Network operations</wc-option>
        <wc-option value="desk">Desk support · Pune</wc-option>
      </wc-select>`,
    );
    el.suggestion = { value: 'desk', reason: 'Hardware in Pune.' };
    await el.updateComplete;
    const options = Array.from(
      el.querySelectorAll('wc-option'),
    ) as SelectOptionElement[];
    await Promise.all(options.map(option => option.updateComplete));
    expect(el.value).to.equal('desk');
    expect(options.map(option => option.suggested)).to.deep.equal([
      false,
      true,
    ]);
    expect(
      options[1].shadowRoot!.querySelector('wc-ai-badge.suggested-badge'),
    ).to.not.equal(null);

    el.acceptSuggestion();
    await el.updateComplete;
    expect(options[1].suggested).to.equal(false);
  });

  it('takes an array for a multi-select', async () => {
    const el = await fixture<Select>(
      html`<wc-select label="Tags" multiple>
        <wc-option value="a">A</wc-option>
        <wc-option value="b">B</wc-option>
      </wc-select>`,
    );
    el.suggestion = { value: ['a', 'b'] };
    await el.updateComplete;
    expect(el.value).to.equal('a,b');
  });

  it('suggests a toggle state, with the reason in the badge tooltip', async () => {
    const el = await fixture<Switch>(
      html`<wc-switch label="Notify my manager"></wc-switch>`,
    );
    el.suggestion = { value: true, reason: 'Your manager approves leave.' };
    await el.updateComplete;
    expect(el.checked).to.equal(true);
    expect(badge(el)?.getAttribute('reason')).to.equal(
      'Your manager approves leave.',
    );
    setTimeout(() => el.dismissSuggestion());
    const change = await oneEvent(el, 'change');
    expect((change as CustomEvent).detail.checked).to.equal(false);
    expect(el.checked).to.equal(false);
  });

  it('suggests values for a checkbox group, beside its label', async () => {
    const el = await fixture<CheckboxGroup>(
      html`<wc-checkbox-group label="Equipment">
        <wc-checkbox value="laptop" label="Laptop"></wc-checkbox>
        <wc-checkbox value="phone" label="Phone"></wc-checkbox>
      </wc-checkbox-group>`,
    );
    el.suggestion = { value: ['laptop'], reason: 'Every starter gets one.' };
    await el.updateComplete;
    expect(el.values).to.deep.equal(['laptop']);
    const row = el.shadowRoot!.querySelector('.label-row');
    expect(row?.querySelector('.label')).to.not.equal(null);
    expect(row?.querySelector('.suggestion-badge')).to.not.equal(null);
    expect(
      el.shadowRoot!.querySelector('.helper')?.textContent?.trim(),
    ).to.equal('Every starter gets one.');
  });

  it('checks the suggested radio, and accepts when the person picks one', async () => {
    const el = await fixture<RadioGroup>(
      html`<wc-radio-group label="Urgency" value="2">
        <wc-radio value="1" label="High"></wc-radio>
        <wc-radio value="2" label="Medium"></wc-radio>
        <wc-radio value="3" label="Low"></wc-radio>
      </wc-radio-group>`,
    );
    el.suggestion = { value: '3', reason: 'Nothing is blocked.' };
    await el.updateComplete;
    const radios = Array.from(el.querySelectorAll('wc-radio')) as Radio[];
    expect(radios.map(radio => radio.checked)).to.deep.equal([
      false,
      false,
      true,
    ]);
    expect(
      el.shadowRoot!.querySelector('.label-row .suggestion-badge'),
    ).to.not.equal(null);

    setTimeout(() =>
      radios[0].dispatchEvent(
        new CustomEvent('change', { bubbles: true, composed: true }),
      ),
    );
    const event = (await oneEvent(
      el,
      'accept',
    )) as CustomEvent<SuggestionAcceptDetail>;
    expect(event.detail).to.deep.equal({ value: '1', cause: 'edit' });
    expect(el.suggested).to.equal(false);
  });

  it('restores the previous radio when cleared', async () => {
    const el = await fixture<RadioGroup>(
      html`<wc-radio-group label="Urgency" value="2">
        <wc-radio value="2" label="Medium"></wc-radio>
        <wc-radio value="3" label="Low"></wc-radio>
      </wc-radio-group>`,
    );
    el.suggestion = { value: '3' };
    await el.updateComplete;
    el.dismissSuggestion();
    await el.updateComplete;
    expect(el.value).to.equal('2');
  });

  it('takes numbers for sliders and ratings', async () => {
    const slider = await fixture<Slider>(
      html`<wc-slider label="Budget" min="0" max="10"></wc-slider>`,
    );
    slider.suggestion = { value: '7' };
    expect(slider.value).to.equal(7);

    const rating = await fixture<Rating>(
      html`<wc-rating label="Satisfaction"></wc-rating>`,
    );
    rating.suggestion = { value: 4 };
    await rating.updateComplete;
    expect(rating.value).to.equal(4);
    expect(badge(rating)).to.not.equal(null);
  });
});

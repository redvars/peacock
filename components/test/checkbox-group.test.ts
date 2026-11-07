/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, fixtureSync, expect, waitUntil } from '@open-wc/testing';
import { Checkbox } from '../src/checkbox/index.js';
import { CheckboxGroup } from '../src/checkbox-group/index.js';
import { peacockString } from '../src/__internal/i18n/strings.js';

for (const [tag, element] of [
  ['wc-checkbox', Checkbox],
  ['wc-checkbox-group', CheckboxGroup],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function boxes(el: CheckboxGroup) {
  return Array.from(el.querySelectorAll<Checkbox>('wc-checkbox'));
}

function click(checkbox: Checkbox) {
  checkbox
    .shadowRoot!.querySelector<HTMLInputElement>('.input-native')!
    .click();
}

function selectAll(el: CheckboxGroup) {
  return el.shadowRoot!.querySelector<Checkbox>('.select-all')!;
}

async function settle(el: CheckboxGroup) {
  await el.updateComplete;
  await Promise.all(boxes(el).map(box => box.updateComplete));
  await el.updateComplete;
}

describe('CheckboxGroup', () => {
  it('checks the checkboxes matching value and exposes values', async () => {
    const el = await fixture<CheckboxGroup>(html`
      <wc-checkbox-group value="a,c">
        <wc-checkbox value="a"></wc-checkbox>
        <wc-checkbox value="b"></wc-checkbox>
        <wc-checkbox value="c"></wc-checkbox>
      </wc-checkbox-group>
    `);
    await settle(el);
    expect(boxes(el).map(box => box.checked)).to.deep.equal([
      true,
      false,
      true,
    ]);
    expect(el.values).to.deep.equal(['a', 'c']);

    el.values = ['b'];
    await settle(el);
    expect(el.value).to.equal('b');
    expect(boxes(el).map(box => box.checked)).to.deep.equal([
      false,
      true,
      false,
    ]);
  });

  it('adopts the checkboxes checked in markup', async () => {
    const el = await fixture<CheckboxGroup>(html`
      <wc-checkbox-group>
        <wc-checkbox value="a" checked></wc-checkbox>
        <wc-checkbox value="b"></wc-checkbox>
        <wc-checkbox value="c" checked></wc-checkbox>
      </wc-checkbox-group>
    `);
    await settle(el);
    expect(el.value).to.equal('a,c');
  });

  it('fires one change from the group with value and values', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <wc-checkbox-group value="a">
          <wc-checkbox value="a"></wc-checkbox>
          <wc-checkbox value="b"></wc-checkbox>
        </wc-checkbox-group>
      </div>
    `);
    const el = wrapper.querySelector<CheckboxGroup>('wc-checkbox-group')!;
    await settle(el);
    const events: CustomEvent[] = [];
    wrapper.addEventListener('change', event =>
      events.push(event as CustomEvent),
    );

    click(boxes(el)[1]);
    expect(events).to.have.length(1);
    expect(events[0].target).to.equal(el);
    expect(events[0].detail).to.deep.equal({
      value: 'a,b',
      values: ['a', 'b'],
    });
    expect(el.value).to.equal('a,b');

    click(boxes(el)[0]);
    expect(events).to.have.length(2);
    expect(events[1].detail.values).to.deep.equal(['b']);
  });

  it('submits one entry per checked value; the checkboxes do not submit themselves', async () => {
    const form = fixtureSync<HTMLFormElement>(html`
      <form>
        <wc-checkbox-group name="toppings" value="cheese,olives">
          <wc-checkbox name="own" value="cheese"></wc-checkbox>
          <wc-checkbox value="olives"></wc-checkbox>
          <wc-checkbox value="peppers"></wc-checkbox>
        </wc-checkbox-group>
      </form>
    `);
    const el = form.querySelector<CheckboxGroup>('wc-checkbox-group')!;
    await settle(el);

    const data = new FormData(form);
    expect(data.getAll('toppings')).to.deep.equal(['cheese', 'olives']);
    expect(data.has('own')).to.be.false;
    expect(boxes(el)[0].hasAttribute('name')).to.be.false;
  });

  it('gives a checkbox its name back when it leaves the group', async () => {
    const el = await fixture<CheckboxGroup>(html`
      <wc-checkbox-group name="g">
        <wc-checkbox name="own" value="a"></wc-checkbox>
      </wc-checkbox-group>
    `);
    await settle(el);
    const [box] = boxes(el);
    expect(box.hasAttribute('name')).to.be.false;

    el.after(box);
    await waitUntil(() => box.getAttribute('name') === 'own');
    box.remove();
  });

  it('requires at least one checked checkbox', async () => {
    const form = fixtureSync<HTMLFormElement>(html`
      <form>
        <wc-checkbox-group name="g" required label="Pick">
          <wc-checkbox value="a"></wc-checkbox>
          <wc-checkbox value="b"></wc-checkbox>
        </wc-checkbox-group>
      </form>
    `);
    const el = form.querySelector<CheckboxGroup>('wc-checkbox-group')!;
    await settle(el);

    expect(form.checkValidity()).to.be.false;
    expect(el.validity.valueMissing).to.be.true;
    expect(el.validationMessage).to.equal(
      peacockString('valueMissingCheckboxGroup'),
    );

    el.reportValidity();
    await el.updateComplete;
    const helper = el.shadowRoot!.querySelector('.helper')!;
    expect(helper.textContent!.trim()).to.equal(
      peacockString('valueMissingCheckboxGroup'),
    );

    click(boxes(el)[1]);
    await settle(el);
    expect(form.checkValidity()).to.be.true;
    expect(el.shadowRoot!.querySelector('.helper')).to.be.null;
  });

  it('is a group named by its label and described by its helper text', async () => {
    const el = await fixture<CheckboxGroup>(html`
      <wc-checkbox-group label="Toppings" helper-text="Pick any">
        <wc-checkbox value="a"></wc-checkbox>
      </wc-checkbox-group>
    `);
    const group = el.shadowRoot!.querySelector('[role="group"]')!;
    const label = el.shadowRoot!.getElementById(
      group.getAttribute('aria-labelledby')!,
    )!;
    const helper = el.shadowRoot!.getElementById(
      group.getAttribute('aria-describedby')!,
    )!;
    expect(label.textContent!.trim()).to.equal('Toppings');
    expect(helper.textContent!.trim()).to.equal('Pick any');
  });

  it('disables and re-enables its checkboxes, leaving one disabled on its own', async () => {
    const el = await fixture<CheckboxGroup>(html`
      <wc-checkbox-group disabled>
        <wc-checkbox value="a"></wc-checkbox>
        <wc-checkbox value="b" disabled></wc-checkbox>
      </wc-checkbox-group>
    `);
    await settle(el);
    expect(boxes(el).map(box => box.disabled)).to.deep.equal([true, true]);

    el.disabled = false;
    await settle(el);
    expect(boxes(el).map(box => box.disabled)).to.deep.equal([false, true]);
  });

  it('passes readonly to its checkboxes', async () => {
    const el = await fixture<CheckboxGroup>(html`
      <wc-checkbox-group readonly value="a">
        <wc-checkbox value="a"></wc-checkbox>
      </wc-checkbox-group>
    `);
    await settle(el);
    const [box] = boxes(el);
    expect(box.readonly).to.be.true;
    click(box);
    await settle(el);
    expect(el.value).to.equal('a');
  });

  it('is disabled by a disabled native fieldset', async () => {
    const form = fixtureSync<HTMLFormElement>(html`
      <form>
        <fieldset disabled>
          <wc-checkbox-group name="g" value="a">
            <wc-checkbox value="a"></wc-checkbox>
          </wc-checkbox-group>
        </fieldset>
      </form>
    `);
    const el = form.querySelector<CheckboxGroup>('wc-checkbox-group')!;
    await settle(el);
    expect(el.disabled).to.be.true;
    expect(boxes(el)[0].disabled).to.be.true;
    expect(new FormData(form).has('g')).to.be.false;
  });

  it('select all checks every enabled checkbox and shows the mixed state', async () => {
    const el = await fixture<CheckboxGroup>(html`
      <wc-checkbox-group select-all value="a">
        <wc-checkbox value="a"></wc-checkbox>
        <wc-checkbox value="b"></wc-checkbox>
        <wc-checkbox value="c" disabled></wc-checkbox>
      </wc-checkbox-group>
    `);
    await settle(el);
    const parent = selectAll(el);
    await parent.updateComplete;
    expect(parent.label).to.equal(peacockString('checkboxGroupSelectAll'));
    expect(parent.checked).to.be.false;
    expect(parent.indeterminate).to.be.true;

    const events: CustomEvent[] = [];
    el.addEventListener('change', event => events.push(event as CustomEvent));
    click(parent);
    await settle(el);
    expect(el.values).to.deep.equal(['a', 'b']);
    expect(events).to.have.length(1);
    expect(events[0].detail.values).to.deep.equal(['a', 'b']);
    expect(parent.checked).to.be.true;
    expect(parent.indeterminate).to.be.false;

    click(parent);
    await settle(el);
    expect(el.value).to.equal('');
    expect(parent.checked).to.be.false;
    expect(parent.indeterminate).to.be.false;

    click(boxes(el)[1]);
    await settle(el);
    expect(selectAll(el).indeterminate).to.be.true;
  });

  it('form reset returns to the first value, or to the checkboxes checked in markup', async () => {
    const form = fixtureSync<HTMLFormElement>(html`
      <form>
        <wc-checkbox-group id="by-value" name="v" value="a">
          <wc-checkbox value="a"></wc-checkbox>
          <wc-checkbox value="b"></wc-checkbox>
        </wc-checkbox-group>
        <wc-checkbox-group id="by-markup" name="m">
          <wc-checkbox value="a"></wc-checkbox>
          <wc-checkbox value="b" checked></wc-checkbox>
        </wc-checkbox-group>
      </form>
    `);
    const byValue = form.querySelector<CheckboxGroup>('#by-value')!;
    const byMarkup = form.querySelector<CheckboxGroup>('#by-markup')!;
    await settle(byValue);
    await settle(byMarkup);
    expect(byMarkup.value).to.equal('b');

    click(boxes(byValue)[1]);
    click(boxes(byMarkup)[0]);
    click(boxes(byMarkup)[1]);
    await settle(byValue);
    await settle(byMarkup);
    expect(byValue.value).to.equal('a,b');
    expect(byMarkup.value).to.equal('a');

    form.reset();
    await settle(byValue);
    await settle(byMarkup);
    expect(byValue.value).to.equal('a');
    expect(boxes(byValue).map(box => box.checked)).to.deep.equal([true, false]);
    expect(byMarkup.value).to.equal('b');
    expect(boxes(byMarkup).map(box => box.checked)).to.deep.equal([
      false,
      true,
    ]);
  });
});

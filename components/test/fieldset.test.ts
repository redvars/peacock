/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, fixtureSync, expect, waitUntil } from '@open-wc/testing';
import { Fieldset } from '../src/fieldset/index.js';
import { Input } from '../src/input/input.js';
import { Checkbox } from '../src/checkbox/index.js';
import { Radio, RadioGroup } from '../src/radio/index.js';

for (const [tag, element] of [
  ['wc-fieldset', Fieldset],
  ['wc-input', Input],
  ['wc-checkbox', Checkbox],
  ['wc-radio', Radio],
  ['wc-radio-group', RadioGroup],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

describe('Fieldset', () => {
  it('renders a native fieldset named by its legend and described by its supporting text', async () => {
    const el = await fixture<Fieldset>(html`
      <wc-fieldset headline="Address" supporting-text="Where we ship">
        <wc-input label="City"></wc-input>
      </wc-fieldset>
    `);
    const fieldset = el.shadowRoot!.querySelector('fieldset')!;
    expect(fieldset.firstElementChild!.localName).to.equal('legend');
    expect(fieldset.firstElementChild!.textContent!.trim()).to.equal('Address');
    const description = el.shadowRoot!.getElementById(
      fieldset.getAttribute('aria-describedby')!,
    )!;
    expect(description.textContent!.trim()).to.equal('Where we ship');
  });

  it('renders no legend or description when they are empty', async () => {
    const el = await fixture<Fieldset>(html`<wc-fieldset></wc-fieldset>`);
    const fieldset = el.shadowRoot!.querySelector('fieldset')!;
    expect(fieldset.querySelector('legend')).to.be.null;
    expect(fieldset.hasAttribute('aria-describedby')).to.be.false;
  });

  it('disables every form control inside and leaves them out of the form', async () => {
    const form = fixtureSync<HTMLFormElement>(html`
      <form>
        <wc-fieldset disabled>
          <wc-input name="city" value="Pune"></wc-input>
          <div><input name="zip" value="411001" /></div>
          <wc-checkbox name="gift" checked></wc-checkbox>
        </wc-fieldset>
        <input name="outside" value="x" />
      </form>
    `);
    const el = form.querySelector<Fieldset>('wc-fieldset')!;
    await el.updateComplete;
    const input = form.querySelector<Input>('wc-input')!;
    await input.updateComplete;

    expect(input.disabled).to.be.true;
    expect(form.querySelector<HTMLInputElement>('input[name="zip"]')!.disabled)
      .to.be.true;
    expect(form.querySelector<Checkbox>('wc-checkbox')!.disabled).to.be.true;
    const data = new FormData(form);
    expect([...data.keys()]).to.deep.equal(['outside']);
  });

  it('re-enables only the controls it disabled', async () => {
    const el = await fixture<Fieldset>(html`
      <wc-fieldset disabled>
        <input id="a" />
        <input id="b" disabled />
      </wc-fieldset>
    `);
    const a = el.querySelector<HTMLInputElement>('#a')!;
    const b = el.querySelector<HTMLInputElement>('#b')!;
    expect(a.disabled).to.be.true;

    el.disabled = false;
    await el.updateComplete;
    expect(a.disabled).to.be.false;
    expect(b.disabled).to.be.true;
  });

  it('disables controls added while it is disabled, and re-enables ones that leave', async () => {
    const el = await fixture<Fieldset>(
      html`<wc-fieldset disabled></wc-fieldset>`,
    );
    const input = document.createElement('input');
    el.append(input);
    await waitUntil(() => input.disabled);

    el.after(input);
    await waitUntil(() => !input.disabled);
    input.remove();
  });

  it('disables a nested fieldset, which handles its own controls', async () => {
    const el = await fixture<Fieldset>(html`
      <wc-fieldset>
        <wc-fieldset id="inner">
          <input id="deep" />
        </wc-fieldset>
      </wc-fieldset>
    `);
    const inner = el.querySelector<Fieldset>('#inner')!;
    const deep = el.querySelector<HTMLInputElement>('#deep')!;

    el.disabled = true;
    await el.updateComplete;
    await inner.updateComplete;
    expect(inner.disabled).to.be.true;
    expect(deep.disabled).to.be.true;

    el.disabled = false;
    await el.updateComplete;
    await inner.updateComplete;
    expect(inner.disabled).to.be.false;
    expect(deep.disabled).to.be.false;
  });

  it('disables a radio group as a whole, which disables its radios', async () => {
    const el = await fixture<Fieldset>(html`
      <wc-fieldset>
        <wc-radio-group label="Plan" name="plan">
          <wc-radio value="free">Free</wc-radio>
          <wc-radio value="pro">Pro</wc-radio>
        </wc-radio-group>
      </wc-fieldset>
    `);
    const group = el.querySelector<RadioGroup>('wc-radio-group')!;
    const radios = [...el.querySelectorAll<Radio>('wc-radio')];

    el.disabled = true;
    await el.updateComplete;
    await group.updateComplete;
    expect(group.disabled).to.be.true;
    expect(radios.every(radio => radio.disabled)).to.be.true;

    el.disabled = false;
    await el.updateComplete;
    await group.updateComplete;
    expect(group.disabled).to.be.false;
    expect(radios.every(radio => !radio.disabled)).to.be.true;
  });
});

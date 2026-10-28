/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { Checkbox } from '../src/checkbox/checkbox.js';
import { Switch } from '../src/switch/switch.js';
import { Radio } from '../src/radio/radio.js';
import { RadioGroup } from '../src/radio/radio-group.js';

for (const [tag, element] of [
  ['wc-checkbox', Checkbox],
  ['wc-switch', Switch],
  ['wc-radio', Radio],
  ['wc-radio-group', RadioGroup],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

describe('Checkbox', () => {
  it('uses checked, with value as a deprecated alias', async () => {
    const el = await fixture<Checkbox>(
      html`<wc-checkbox checked></wc-checkbox>`,
    );
    expect(el.checked).to.be.true;
    expect(el.value).to.be.true;

    const legacy = await fixture<Checkbox>(
      html`<wc-checkbox value></wc-checkbox>`,
    );
    expect(legacy.checked).to.be.true;

    legacy.value = false;
    expect(legacy.checked).to.be.false;
  });

  it('toggles on click and fires change with checked', async () => {
    const el = await fixture<Checkbox>(html`<wc-checkbox></wc-checkbox>`);
    const container =
      el.shadowRoot!.querySelector<HTMLElement>('.input-native')!;

    setTimeout(() => container.click());
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      checked: boolean;
    }>;

    expect(event.detail.checked).to.be.true;
    expect(el.checked).to.be.true;
    expect(el.hasAttribute('checked')).to.be.true;
  });

  it('submits "on" only while checked, and resets', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><wc-checkbox name="terms"></wc-checkbox></form>
    `);
    const el = form.querySelector<Checkbox>('wc-checkbox')!;
    expect(new FormData(form).has('terms')).to.be.false;

    el.checked = true;
    expect(new FormData(form).get('terms')).to.equal('on');

    form.reset();
    expect(el.checked).to.be.false;
  });
});

describe('Switch', () => {
  it('uses checked, with value as a deprecated alias', async () => {
    const el = await fixture<Switch>(html`<wc-switch value></wc-switch>`);
    expect(el.checked).to.be.true;

    el.checked = false;
    expect(el.value).to.be.false;
  });

  it('exposes role switch and submits with a form', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><wc-switch name="wifi" checked></wc-switch></form>
    `);
    const el = form.querySelector<Switch>('wc-switch')!;

    expect(el.shadowRoot!.querySelector('[role="switch"]')).to.exist;
    expect(new FormData(form).get('wifi')).to.equal('on');

    el.checked = false;
    expect(new FormData(form).has('wifi')).to.be.false;

    form.reset();
    expect(el.checked).to.be.true;
  });
});

describe('Radio', () => {
  it('submits the value of the checked radio', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <wc-radio name="size" value="sm"></wc-radio>
        <wc-radio name="size" value="lg" checked></wc-radio>
      </form>
    `);
    expect(new FormData(form).getAll('size')).to.deep.equal(['lg']);
  });
});

describe('RadioGroup', () => {
  it('names its radios and checks the one matching value', async () => {
    const el = await fixture<RadioGroup>(html`
      <wc-radio-group value="b">
        <wc-radio value="a"></wc-radio>
        <wc-radio value="b"></wc-radio>
      </wc-radio-group>
    `);
    await el.updateComplete;
    const [a, b] = Array.from(el.querySelectorAll<Radio>('wc-radio'));

    expect(a.name).to.equal(b.name);
    expect(a.name).to.not.equal('');
    expect(b.checked).to.be.true;
    expect(a.checked).to.be.false;
  });

  it('adopts the value of a radio checked in markup', async () => {
    const el = await fixture<RadioGroup>(html`
      <wc-radio-group name="plan">
        <wc-radio value="free"></wc-radio>
        <wc-radio value="pro" checked></wc-radio>
      </wc-radio-group>
    `);
    await el.updateComplete;
    expect(el.value).to.equal('pro');
  });

  it('fires one change for the group when a radio is chosen', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <wc-radio-group name="plan" value="free">
          <wc-radio value="free"></wc-radio>
          <wc-radio value="pro"></wc-radio>
        </wc-radio-group>
      </div>
    `);
    const group = wrapper.querySelector<RadioGroup>('wc-radio-group')!;
    await group.updateComplete;

    const events: CustomEvent[] = [];
    wrapper.addEventListener('change', event =>
      events.push(event as CustomEvent),
    );
    const pro = group.querySelector<Radio>('wc-radio[value="pro"]')!;
    pro.shadowRoot!.querySelector<HTMLElement>('.container')!.click();

    expect(events).to.have.length(1);
    expect(events[0].target).to.equal(group);
    expect(events[0].detail.value).to.equal('pro');
    expect(group.value).to.equal('pro');
    expect(group.querySelector<Radio>('wc-radio[value="free"]')!.checked).to.be
      .false;
  });

  it('disables every radio', async () => {
    const el = await fixture<RadioGroup>(html`
      <wc-radio-group disabled>
        <wc-radio value="a"></wc-radio>
      </wc-radio-group>
    `);
    await el.updateComplete;
    expect(el.querySelector<Radio>('wc-radio')!.disabled).to.be.true;
  });
});

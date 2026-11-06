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

function silenceWarnings() {
  const original = console.warn;
  console.warn = () => {};
  return () => {
    console.warn = original;
  };
}

describe('Checkbox', () => {
  it('has a string value, "on" by default, submitted while checked', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <wc-checkbox name="a" checked></wc-checkbox>
        <wc-checkbox name="b" value="yes" checked></wc-checkbox>
      </form>
    `);
    const [a, b] = Array.from(form.querySelectorAll<Checkbox>('wc-checkbox'));
    expect(a.value).to.equal('on');
    expect(b.value).to.equal('yes');
    expect(new FormData(form).get('b')).to.equal('yes');
  });

  it('still sets checked when value is set to a boolean (deprecated)', async () => {
    const restore = silenceWarnings();
    try {
      const el = await fixture<Checkbox>(html`<wc-checkbox></wc-checkbox>`);
      (el as unknown as { value: boolean }).value = true;
      expect(el.checked).to.be.true;
      expect(el.value).to.equal('on');
    } finally {
      restore();
    }
  });

  it('blocks form submission while required and unchecked', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><wc-checkbox name="terms" required></wc-checkbox></form>
    `);
    const el = form.querySelector<Checkbox>('wc-checkbox')!;
    await el.updateComplete;
    expect(form.checkValidity()).to.be.false;
    expect(el.validity.valueMissing).to.be.true;

    el.checked = true;
    await el.updateComplete;
    expect(form.checkValidity()).to.be.true;
  });

  it('is named by its label and marked invalid after a failed check', async () => {
    const el = await fixture<Checkbox>(
      html`<wc-checkbox label="Accept terms" required></wc-checkbox>`,
    );
    const control = el.shadowRoot!.querySelector('[role="checkbox"]')!;
    const labelId = control.getAttribute('aria-labelledby')!;
    expect(el.shadowRoot!.getElementById(labelId)?.textContent).to.equal(
      'Accept terms',
    );

    el.reportValidity();
    await el.updateComplete;
    expect(control.getAttribute('aria-invalid')).to.equal('true');
    expect(control.getAttribute('aria-required')).to.equal('true');
  });

  it('does not toggle on Enter, like a native checkbox', async () => {
    const el = await fixture<Checkbox>(html`<wc-checkbox></wc-checkbox>`);
    const control = el.shadowRoot!.querySelector<HTMLElement>('.container')!;
    control.dispatchEvent(
      new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }),
    );
    control.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    expect(el.checked).to.be.false;
  });

  it('fires no custom focus event of its own', async () => {
    const el = await fixture<Checkbox>(html`<wc-checkbox></wc-checkbox>`);
    const events: Event[] = [];
    el.addEventListener('focus', e => events.push(e));
    el.focus();
    expect(events.every(e => !(e instanceof CustomEvent))).to.be.true;
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
  it('has a string value and fires change with checked and value', async () => {
    const el = await fixture<Switch>(
      html`<wc-switch value="wifi-on"></wc-switch>`,
    );
    const control = el.shadowRoot!.querySelector<HTMLElement>('.container')!;

    setTimeout(() =>
      control.dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', bubbles: true }),
      ),
    );
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      checked: boolean;
      value: string;
    }>;

    expect(event.detail.checked).to.be.true;
    expect(event.detail.value).to.equal('wifi-on');
  });

  it('blocks form submission while required and off', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><wc-switch name="wifi" required></wc-switch></form>
    `);
    await form.querySelector<Switch>('wc-switch')!.updateComplete;
    expect(form.checkValidity()).to.be.false;
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

  it('makes the whole group invalid while one radio is required and none is checked', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <wc-radio name="size" value="sm" required></wc-radio>
        <wc-radio name="size" value="lg"></wc-radio>
      </form>
    `);
    const [sm, lg] = Array.from(form.querySelectorAll<Radio>('wc-radio'));
    await sm.updateComplete;
    await lg.updateComplete;
    expect(form.checkValidity()).to.be.false;
    expect(lg.validity.valueMissing).to.be.true;

    lg.checked = true;
    await lg.updateComplete;
    await sm.updateComplete;
    expect(form.checkValidity()).to.be.true;
    expect(sm.validity.valid).to.be.true;
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

  it('re-enables its radios when disabled is turned off, but not a radio disabled on its own', async () => {
    const el = await fixture<RadioGroup>(html`
      <wc-radio-group disabled>
        <wc-radio value="a"></wc-radio>
        <wc-radio value="b" disabled></wc-radio>
      </wc-radio-group>
    `);
    await el.updateComplete;
    const [a, b] = Array.from(el.querySelectorAll<Radio>('wc-radio'));
    expect(a.disabled).to.be.true;

    el.disabled = false;
    await el.updateComplete;

    expect(a.disabled).to.be.false;
    expect(b.disabled).to.be.true;
  });

  it('clears the selection when value is set to an empty string', async () => {
    const el = await fixture<RadioGroup>(html`
      <wc-radio-group value="a">
        <wc-radio value="a"></wc-radio>
        <wc-radio value="b"></wc-radio>
      </wc-radio-group>
    `);
    await el.updateComplete;

    el.value = '';
    await el.updateComplete;

    expect(el.value).to.equal('');
    expect(
      Array.from(el.querySelectorAll<Radio>('wc-radio')).some(r => r.checked),
    ).to.be.false;
  });

  it('passes required and readonly to its radios, which validate as a group', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <wc-radio-group name="plan" required readonly>
          <wc-radio value="a"></wc-radio>
          <wc-radio value="b"></wc-radio>
        </wc-radio-group>
      </form>
    `);
    const group = form.querySelector<RadioGroup>('wc-radio-group')!;
    await group.updateComplete;
    const [a, b] = Array.from(group.querySelectorAll<Radio>('wc-radio'));
    expect(a.required && b.required).to.be.true;
    expect(a.readonly && b.readonly).to.be.true;

    // Read-only controls are barred from validation, as natively.
    group.readonly = false;
    await group.updateComplete;
    expect(a.readonly).to.be.false;
    expect(form.checkValidity()).to.be.false;

    group.value = 'b';
    await group.updateComplete;
    expect(form.checkValidity()).to.be.true;
  });

  it('names the radiogroup by its visible label and describes it with helper text', async () => {
    const el = await fixture<RadioGroup>(html`
      <wc-radio-group label="Plan" helper-text="Billed monthly">
        <wc-radio value="a"></wc-radio>
      </wc-radio-group>
    `);
    const group = el.shadowRoot!.querySelector('[role="radiogroup"]')!;
    const label = el.shadowRoot!.getElementById(
      group.getAttribute('aria-labelledby')!,
    )!;
    expect(label.textContent?.trim()).to.equal('Plan');
    expect(label.hasAttribute('aria-hidden')).to.be.false;
    expect(group.hasAttribute('aria-label')).to.be.false;
    const description = el.shadowRoot!.getElementById(
      group.getAttribute('aria-describedby')!,
    )!;
    expect(description.textContent?.trim()).to.equal('Billed monthly');
  });

  it('shows error-text while error is set', async () => {
    const el = await fixture<RadioGroup>(html`
      <wc-radio-group error error-text="Pick a plan" helper-text="Help">
        <wc-radio value="a"></wc-radio>
      </wc-radio-group>
    `);
    expect(
      el.shadowRoot!.querySelector('.helper')?.textContent?.trim(),
    ).to.equal('Pick a plan');
    expect(
      el
        .shadowRoot!.querySelector('[role="radiogroup"]')!
        .getAttribute('aria-invalid'),
    ).to.equal('true');
  });

  it('shows the validation message after a failed check, until a radio is checked', async () => {
    const el = await fixture<RadioGroup>(html`
      <wc-radio-group required>
        <wc-radio value="a"></wc-radio>
        <wc-radio value="b"></wc-radio>
      </wc-radio-group>
    `);
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.error-text')).to.be.null;

    const [a] = Array.from(el.querySelectorAll<Radio>('wc-radio'));
    expect(a.reportValidity()).to.be.false;
    await el.updateComplete;
    expect(
      el.shadowRoot!.querySelector('.error-text')?.textContent?.trim(),
    ).to.equal('Please select one of these options.');

    a.shadowRoot!.querySelector<HTMLElement>('.container')!.click();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.error-text')).to.be.null;
  });
});

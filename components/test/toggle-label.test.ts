/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
// Ships with @web/test-runner, which registers these commands by default.
// eslint-disable-next-line import/no-extraneous-dependencies
import { sendKeys, sendMouse, resetMouse } from '@web/test-runner-commands';
import { Checkbox } from '../src/checkbox/index.js';
import { Radio } from '../src/radio/radio.js';
import { RadioGroup } from '../src/radio/radio-group.js';

for (const [tag, element] of [
  ['wc-checkbox', Checkbox],
  ['wc-radio', Radio],
  ['wc-radio-group', RadioGroup],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

/** Clicks the middle of `target` with the real mouse. */
async function clickOn(target: Element | Range) {
  const rect = target.getBoundingClientRect();
  await sendMouse({
    type: 'click',
    position: [
      Math.round(rect.left + rect.width / 2),
      Math.round(rect.top + rect.height / 2),
    ],
  });
}

function ownLabel(el: Checkbox | Radio) {
  return el.shadowRoot!.querySelector('.label')!;
}

function control(el: Checkbox | Radio) {
  return el.shadowRoot!.querySelector<HTMLElement>('.container')!;
}

async function settle(...els: (Checkbox | Radio)[]) {
  await Promise.all(els.map(el => el.updateComplete));
}

afterEach(async () => {
  await resetMouse();
});

describe('Toggle label clicks', () => {
  describe('wc-checkbox', () => {
    it('toggles when its label attribute text is clicked', async () => {
      const el = await fixture<Checkbox>(
        html`<wc-checkbox label="Accept terms"></wc-checkbox>`,
      );
      let changes = 0;
      el.addEventListener('change', () => {
        changes += 1;
      });

      await clickOn(ownLabel(el));
      await settle(el);
      expect(el.checked).to.be.true;

      await clickOn(ownLabel(el));
      await settle(el);
      expect(el.checked).to.be.false;
      expect(changes).to.equal(2);
    });

    it('toggles when its slotted label is clicked', async () => {
      const el = await fixture<Checkbox>(
        html`<wc-checkbox><span>Accept terms</span></wc-checkbox>`,
      );
      await clickOn(el.querySelector('span')!);
      await settle(el);
      expect(el.checked).to.be.true;
    });

    it('toggles once when its plain-text slotted label is clicked', async () => {
      const el = await fixture<Checkbox>(
        html`<wc-checkbox>Accept terms</wc-checkbox>`,
      );
      let changes = 0;
      el.addEventListener('change', () => {
        changes += 1;
      });
      const text = document.createRange();
      text.selectNodeContents(el);
      await clickOn(text);
      await settle(el);
      expect(el.checked).to.be.true;
      expect(changes).to.equal(1);
    });

    it('toggles once when the control itself is clicked', async () => {
      const el = await fixture<Checkbox>(
        html`<wc-checkbox label="Accept terms"></wc-checkbox>`,
      );
      let changes = 0;
      el.addEventListener('change', () => {
        changes += 1;
      });
      await clickOn(control(el));
      await settle(el);
      expect(el.checked).to.be.true;
      expect(changes).to.equal(1);
    });

    it('toggles when an external label[for] is clicked', async () => {
      const root = await fixture<HTMLDivElement>(html`
        <div>
          <label for="cb">External label</label>
          <wc-checkbox id="cb"></wc-checkbox>
        </div>
      `);
      const el = root.querySelector<Checkbox>('wc-checkbox')!;
      let changes = 0;
      el.addEventListener('change', () => {
        changes += 1;
      });

      await clickOn(root.querySelector('label')!);
      await settle(el);
      expect(el.checked).to.be.true;
      expect(changes).to.equal(1);
    });

    it('toggles once when a wrapping label is clicked, on its text or on the control', async () => {
      const root = await fixture<HTMLLabelElement>(html`
        <label><wc-checkbox></wc-checkbox><span>Wrapped label</span></label>
      `);
      const el = root.querySelector<Checkbox>('wc-checkbox')!;
      let changes = 0;
      el.addEventListener('change', () => {
        changes += 1;
      });

      await clickOn(root.querySelector('span')!);
      await settle(el);
      expect(el.checked).to.be.true;
      expect(changes).to.equal(1);

      await clickOn(control(el));
      await settle(el);
      expect(el.checked).to.be.false;
      expect(changes).to.equal(2);
    });

    it('ignores label clicks while disabled', async () => {
      const root = await fixture<HTMLDivElement>(html`
        <div>
          <label for="cb-disabled">External label</label>
          <wc-checkbox
            id="cb-disabled"
            label="Own label"
            disabled
          ></wc-checkbox>
        </div>
      `);
      const el = root.querySelector<Checkbox>('wc-checkbox')!;
      await clickOn(ownLabel(el));
      await clickOn(root.querySelector('label')!);
      await settle(el);
      expect(el.checked).to.be.false;
    });

    it('still toggles with Space', async () => {
      const el = await fixture<Checkbox>(
        html`<wc-checkbox label="Accept terms"></wc-checkbox>`,
      );
      el.focus();
      await sendKeys({ press: 'Space' });
      await settle(el);
      expect(el.checked).to.be.true;
    });
  });

  describe('wc-radio', () => {
    it('selects when its label attribute text is clicked', async () => {
      const el = await fixture<Radio>(
        html`<wc-radio name="solo" value="a" label="Apple"></wc-radio>`,
      );
      let changes = 0;
      el.addEventListener('change', () => {
        changes += 1;
      });
      await clickOn(ownLabel(el));
      await settle(el);
      expect(el.checked).to.be.true;
      expect(changes).to.equal(1);
    });

    it('selects when its slotted label is clicked', async () => {
      const el = await fixture<Radio>(
        html`<wc-radio name="solo2" value="a"><span>Apple</span></wc-radio>`,
      );
      await clickOn(el.querySelector('span')!);
      await settle(el);
      expect(el.checked).to.be.true;
    });

    it('selects once when the control itself is clicked', async () => {
      const el = await fixture<Radio>(
        html`<wc-radio name="solo3" value="a" label="Apple"></wc-radio>`,
      );
      let changes = 0;
      el.addEventListener('change', () => {
        changes += 1;
      });
      await clickOn(control(el));
      await settle(el);
      expect(el.checked).to.be.true;
      expect(changes).to.equal(1);
    });

    it('selects when an external label[for] or a wrapping label is clicked', async () => {
      const root = await fixture<HTMLDivElement>(html`
        <div>
          <label for="r-a">Apple</label>
          <wc-radio id="r-a" name="ext" value="a"></wc-radio>
          <label
            ><wc-radio name="ext" value="b"></wc-radio
            ><span>Banana</span></label
          >
        </div>
      `);
      const [a, b] = Array.from(root.querySelectorAll<Radio>('wc-radio'));

      await clickOn(root.querySelector('label[for]')!);
      await settle(a, b);
      expect(a.checked).to.be.true;

      await clickOn(root.querySelector('span')!);
      await settle(a, b);
      expect(b.checked).to.be.true;
      expect(a.checked).to.be.false;
    });

    it('selects by label inside wc-radio-group and unchecks the others', async () => {
      const group = await fixture<RadioGroup>(html`
        <wc-radio-group label="Fruit" name="fruit">
          <wc-radio name="fruit" value="a" label="Apple" checked></wc-radio>
          <wc-radio name="fruit" value="b" label="Banana"></wc-radio>
        </wc-radio-group>
      `);
      const [a, b] = Array.from(group.querySelectorAll<Radio>('wc-radio'));
      await settle(a, b);

      await clickOn(ownLabel(b));
      await settle(a, b);
      expect(b.checked).to.be.true;
      expect(a.checked).to.be.false;
    });

    it('ignores label clicks while disabled', async () => {
      const root = await fixture<HTMLDivElement>(html`
        <div>
          <label for="r-disabled">External label</label>
          <wc-radio
            id="r-disabled"
            name="dis"
            value="a"
            label="Own"
            disabled
          ></wc-radio>
        </div>
      `);
      const el = root.querySelector<Radio>('wc-radio')!;
      await clickOn(ownLabel(el));
      await clickOn(root.querySelector('label')!);
      await settle(el);
      expect(el.checked).to.be.false;
    });

    it('still selects with Space and arrow keys', async () => {
      const group = await fixture<RadioGroup>(html`
        <wc-radio-group label="Fruit" name="keys">
          <wc-radio name="keys" value="a" label="Apple"></wc-radio>
          <wc-radio name="keys" value="b" label="Banana"></wc-radio>
        </wc-radio-group>
      `);
      const [a, b] = Array.from(group.querySelectorAll<Radio>('wc-radio'));
      await settle(a, b);
      a.focus();
      await sendKeys({ press: 'Space' });
      await settle(a, b);
      expect(a.checked).to.be.true;

      await sendKeys({ press: 'ArrowDown' });
      await settle(a, b);
      expect(b.checked).to.be.true;
      expect(a.checked).to.be.false;
    });
  });
});

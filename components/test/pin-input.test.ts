/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, fixtureSync, expect, oneEvent } from '@open-wc/testing';
import { Field } from '../src/field/index.js';
import { IconButton } from '../src/button/index.js';
import { PinInput } from '../src/pin-input/index.js';
import { setPeacockStrings } from '../src/__internal/i18n/strings.js';

for (const [tag, element] of [
  ['wc-field', Field],
  ['wc-icon-button', IconButton],
  ['wc-pin-input', PinInput],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function cells(el: PinInput) {
  return Array.from(el.shadowRoot!.querySelectorAll<HTMLInputElement>('.cell'));
}

function group(el: PinInput) {
  return el.shadowRoot!.querySelector<HTMLElement>('[role="group"]')!;
}

function focused(el: PinInput) {
  return el.shadowRoot!.activeElement as HTMLInputElement | null;
}

function key(el: PinInput, name: string) {
  const target = focused(el) ?? cells(el)[0];
  const event = new KeyboardEvent('keydown', {
    key: name,
    bubbles: true,
    composed: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

async function type(el: PinInput, text: string) {
  for (const char of text) {
    key(el, char);
    // eslint-disable-next-line no-await-in-loop
    await el.updateComplete;
  }
}

function paste(target: HTMLInputElement, text: string) {
  const data = new DataTransfer();
  data.setData('text/plain', text);
  const event = new ClipboardEvent('paste', {
    clipboardData: data,
    bubbles: true,
    composed: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

describe('PinInput', () => {
  it('renders length cells and shows the value one character per cell', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input length="4" value="12"></wc-pin-input>`,
    );
    const list = cells(el);
    expect(list).to.have.length(4);
    expect(list.map(cell => cell.value)).to.deep.equal(['1', '2', '', '']);
  });

  it('defaults to six numeric cells; the first takes one-time-code autofill', async () => {
    const el = await fixture<PinInput>(html`<wc-pin-input></wc-pin-input>`);
    const list = cells(el);
    expect(list).to.have.length(6);
    expect(el.size).to.equal('sm');
    expect(list[0].getAttribute('autocomplete')).to.equal('one-time-code');
    expect(list[1].getAttribute('autocomplete')).to.equal('off');
    expect(list.every(cell => cell.inputMode === 'numeric')).to.be.true;
    expect(list.every(cell => cell.type === 'text')).to.be.true;
  });

  it('hides the characters when masked', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input masked value="12"></wc-pin-input>`,
    );
    expect(cells(el).every(cell => cell.type === 'password')).to.be.true;
  });

  it('keeps only digits in a numeric value', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input value="12-3a 45678"></wc-pin-input>`,
    );
    expect(el.value).to.equal('123456');
  });

  it('keeps letters and digits, uppercased, in an alphanumeric value', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input type="alphanumeric" value="ab-12"></wc-pin-input>`,
    );
    expect(el.value).to.equal('AB12');
    expect(cells(el)[0].inputMode).to.equal('text');
    expect(cells(el)[0].getAttribute('aria-label')).to.equal(
      'Character 1 of 6',
    );
  });
});

describe('PinInput keyboard', () => {
  it('moves to the next cell as the person types and rejects other characters', async () => {
    const el = await fixture<PinInput>(html`<wc-pin-input></wc-pin-input>`);
    el.focus();
    expect(focused(el)).to.equal(cells(el)[0]);

    await type(el, '1a2');
    expect(el.value).to.equal('12');
    expect(focused(el)).to.equal(cells(el)[2]);
  });

  it('replaces a filled cell when typing over it', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input value="1234"></wc-pin-input>`,
    );
    cells(el)[1].focus();
    await type(el, '9');
    expect(el.value).to.equal('1934');
    expect(focused(el)).to.equal(cells(el)[2]);
  });

  it('Backspace clears the cell, or the one before in an empty cell', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input value="123"></wc-pin-input>`,
    );
    el.focus();
    expect(focused(el)).to.equal(cells(el)[3]);

    key(el, 'Backspace');
    await el.updateComplete;
    expect(el.value).to.equal('12');
    expect(focused(el)).to.equal(cells(el)[2]);

    // In the empty cell: clears the one before and moves to it.
    key(el, 'Backspace');
    await el.updateComplete;
    expect(el.value).to.equal('1');
    expect(focused(el)).to.equal(cells(el)[1]);

    // In a filled cell: clears it; the characters after it move up.
    el.value = '123';
    await el.updateComplete;
    cells(el)[0].focus();
    key(el, 'Backspace');
    await el.updateComplete;
    expect(el.value).to.equal('23');
    expect(focused(el)).to.equal(cells(el)[0]);
  });

  it('Delete clears the focused cell', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input value="123"></wc-pin-input>`,
    );
    cells(el)[0].focus();
    key(el, 'Delete');
    await el.updateComplete;
    expect(el.value).to.equal('23');
  });

  it('moves with Left, Right, Home and End, never past the first empty cell', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input value="123"></wc-pin-input>`,
    );
    cells(el)[0].focus();
    key(el, 'ArrowRight');
    expect(focused(el)).to.equal(cells(el)[1]);
    key(el, 'End');
    expect(focused(el)).to.equal(cells(el)[3]);
    key(el, 'ArrowRight');
    expect(focused(el)).to.equal(cells(el)[3]);
    key(el, 'ArrowLeft');
    expect(focused(el)).to.equal(cells(el)[2]);
    key(el, 'Home');
    expect(focused(el)).to.equal(cells(el)[0]);
  });

  it('sends focus on a cell after the first empty one back to it', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input value="1"></wc-pin-input>`,
    );
    cells(el)[4].focus();
    expect(focused(el)).to.equal(cells(el)[1]);
  });

  it('has one tab stop: the first empty cell', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input value="12"></wc-pin-input>`,
    );
    expect(cells(el).map(cell => cell.tabIndex)).to.deep.equal([
      -1, -1, 0, -1, -1, -1,
    ]);
  });

  it('takes no typing when readonly but still moves', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input readonly value="12"></wc-pin-input>`,
    );
    cells(el)[0].focus();
    await type(el, '9');
    key(el, 'Backspace');
    expect(el.value).to.equal('12');
    key(el, 'ArrowRight');
    expect(focused(el)).to.equal(cells(el)[1]);
  });
});

describe('PinInput paste and autofill', () => {
  it('fills every cell from the pasted cell on, ignoring separators', async () => {
    const el = await fixture<PinInput>(html`<wc-pin-input></wc-pin-input>`);
    el.focus();
    const event = paste(cells(el)[0], '123 - 456');
    await el.updateComplete;
    expect(event.defaultPrevented).to.be.true;
    expect(el.value).to.equal('123456');
    expect(
      cells(el)
        .map(cell => cell.value)
        .join(''),
    ).to.equal('123456');
  });

  it('fills from the cell the paste lands in', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input value="12"></wc-pin-input>`,
    );
    cells(el)[1].focus();
    paste(cells(el)[1], '9999999');
    await el.updateComplete;
    expect(el.value).to.equal('199999');
  });

  it('spreads an autofilled code from the first cell', async () => {
    const el = await fixture<PinInput>(html`<wc-pin-input></wc-pin-input>`);
    const first = cells(el)[0];
    first.focus();
    first.value = '654321';
    first.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.value).to.equal('654321');
    expect(first.value).to.equal('6');
  });

  it('puts back a cell whose input was rejected', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input value="1"></wc-pin-input>`,
    );
    const first = cells(el)[0];
    first.value = 'x';
    first.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.value).to.equal('1');
    expect(first.value).to.equal('1');
  });
});

describe('PinInput events', () => {
  it('fires input on each change, then change and complete when the code is filled', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input length="3"></wc-pin-input>`,
    );
    const log: string[] = [];
    for (const name of ['input', 'change', 'complete']) {
      el.addEventListener(name, event => {
        const { value } = (event as CustomEvent<{ value: string }>).detail;
        log.push(`${name}:${value}`);
      });
    }
    el.focus();
    await type(el, '123');
    expect(log).to.deep.equal([
      'input:1',
      'input:12',
      'input:123',
      'change:123',
      'complete:123',
    ]);
  });

  it('fires change when focus leaves after a change', async () => {
    const el = await fixture<PinInput>(html`<wc-pin-input></wc-pin-input>`);
    el.focus();
    await type(el, '12');
    const changed = oneEvent(el, 'change');
    cells(el)[2].blur();
    const event = (await changed) as CustomEvent<{ value: string }>;
    expect(event.detail.value).to.equal('12');
    expect(event.bubbles && event.composed).to.be.true;
  });

  it('keeps native input events inside', async () => {
    const el = await fixture<PinInput>(html`<wc-pin-input></wc-pin-input>`);
    let plain = 0;
    el.addEventListener('input', event => {
      if (!(event instanceof CustomEvent)) plain += 1;
    });
    const first = cells(el)[0];
    first.value = '5';
    first.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    expect(plain).to.equal(0);
    expect(el.value).to.equal('5');
  });

  it('fires nothing for value, clear() and focus()', async () => {
    const el = await fixture<PinInput>(html`<wc-pin-input></wc-pin-input>`);
    const fired: string[] = [];
    const record = (event: Event) => fired.push(event.type);
    for (const name of ['input', 'change', 'complete']) {
      el.addEventListener(name, record);
    }
    el.focus();
    el.value = '123456';
    await el.updateComplete;
    el.clear();
    await el.updateComplete;
    expect(el.value).to.equal('');
    expect(cells(el).every(cell => cell.value === '')).to.be.true;
    expect(fired).to.deep.equal([]);
  });
});

describe('PinInput forms and validation', () => {
  it('submits the code under its name and restores it on reset', async () => {
    const form = fixtureSync<HTMLFormElement>(html`
      <form><wc-pin-input name="code" value="111"></wc-pin-input></form>
    `);
    const el = form.querySelector<PinInput>('wc-pin-input')!;
    await el.updateComplete;
    el.value = '123456';
    await el.updateComplete;
    expect(new FormData(form).get('code')).to.equal('123456');

    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal('111');
    expect(new FormData(form).get('code')).to.equal('111');
  });

  it('is valueMissing while required and empty', async () => {
    const form = fixtureSync<HTMLFormElement>(html`
      <form><wc-pin-input name="code" required></wc-pin-input></form>
    `);
    const el = form.querySelector<PinInput>('wc-pin-input')!;
    await el.updateComplete;
    expect(form.checkValidity()).to.be.false;
    expect(el.validity.valueMissing).to.be.true;
    expect(el.matches(':invalid')).to.be.true;

    el.value = '123456';
    await el.updateComplete;
    expect(form.checkValidity()).to.be.true;
  });

  it('is tooShort while the code is incomplete, required or not', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input length="4" value="12"></wc-pin-input>`,
    );
    expect(el.validity.tooShort).to.be.true;
    expect(el.validationMessage).to.equal('Enter all 4 characters.');

    el.value = '';
    await el.updateComplete;
    expect(el.checkValidity()).to.be.true;
  });

  it('is valid when disabled', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input required disabled></wc-pin-input>`,
    );
    expect(el.checkValidity()).to.be.true;
    expect(cells(el).every(cell => cell.disabled)).to.be.true;
  });

  it('shows the message and links it to the cells after reportValidity()', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input label="Code" required></wc-pin-input>`,
    );
    const field = el.shadowRoot!.querySelector<Field>('wc-field')!;
    expect(field.error).to.be.false;

    el.reportValidity();
    await el.updateComplete;

    expect(field.error).to.be.true;
    expect(field.errorText).to.equal(el.validationMessage);
    const first = cells(el)[0];
    expect(first.getAttribute('aria-invalid')).to.equal('true');
    const describedBy = first.getAttribute('aria-describedby')!;
    const description = el.shadowRoot!.getElementById(describedBy)!;
    expect(description.textContent).to.equal(el.validationMessage);
  });

  it('links helper text by aria-describedby', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input helper-text="Sent to your phone"></wc-pin-input>`,
    );
    const id = cells(el)[2].getAttribute('aria-describedby')!;
    expect(el.shadowRoot!.getElementById(id)!.textContent).to.equal(
      'Sent to your phone',
    );
  });
});

describe('PinInput accessibility', () => {
  it('is a group named by the label, with cells named by position', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input label="Verification code" length="4"></wc-pin-input>`,
    );
    expect(group(el).getAttribute('aria-label')).to.equal('Verification code');
    expect(
      cells(el).map(cell => cell.getAttribute('aria-label')),
    ).to.deep.equal([
      'Digit 1 of 4',
      'Digit 2 of 4',
      'Digit 3 of 4',
      'Digit 4 of 4',
    ]);
  });

  it('moves aria-labelledby from the host to the group', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input aria-labelledby="heading"></wc-pin-input>`,
    );
    expect(el.hasAttribute('aria-labelledby')).to.be.false;
    expect(group(el).getAttribute('aria-labelledby')).to.equal('heading');
  });

  it("uses Peacock's strings for the cell names", async () => {
    setPeacockStrings({ pinInputDigit: (n, total) => `Chiffre ${n}/${total}` });
    try {
      const el = await fixture<PinInput>(
        html`<wc-pin-input length="2"></wc-pin-input>`,
      );
      expect(cells(el)[1].getAttribute('aria-label')).to.equal('Chiffre 2/2');
    } finally {
      setPeacockStrings({});
    }
  });

  it('passes accessibility audit', async () => {
    const el = await fixture<PinInput>(
      html`<wc-pin-input label="Code" helper-text="Six digits"></wc-pin-input>`,
    );
    await expect(el).to.be.accessible();
  });
});

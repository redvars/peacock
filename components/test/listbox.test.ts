/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import {
  Listbox,
  ListboxOption,
  type ListboxChangeDetail,
} from '../src/listbox/index.js';

if (!customElements.get('wc-listbox')) {
  customElements.define('wc-listbox', Listbox);
}
if (!customElements.get('wc-listbox-option')) {
  customElements.define('wc-listbox-option', ListboxOption);
}

function press(
  target: Element,
  key: string,
  init: { ctrlKey?: boolean; metaKey?: boolean } = {},
) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    composed: true,
    cancelable: true,
    ...init,
  });
  target.dispatchEvent(event);
  return event;
}

async function settle(el: Listbox) {
  await el.updateComplete;
  await Promise.all(el.options.map(option => option.updateComplete));
}

async function listbox(
  template = html`
    <wc-listbox label="Fruit" name="fruit">
      <wc-listbox-option value="apple">Apple</wc-listbox-option>
      <wc-listbox-option value="banana">Banana</wc-listbox-option>
      <wc-listbox-option value="cherry" disabled>Cherry</wc-listbox-option>
      <wc-listbox-option value="blueberry">Blueberry</wc-listbox-option>
    </wc-listbox>
  `,
) {
  const el = await fixture<Listbox>(template);
  await settle(el);
  return { el, options: el.options };
}

function multiple() {
  return listbox(html`
    <wc-listbox label="Toppings" name="toppings" multiple value="olives">
      <wc-listbox-option value="cheese">Cheese</wc-listbox-option>
      <wc-listbox-option value="olives">Olives</wc-listbox-option>
      <wc-listbox-option value="peppers">Peppers</wc-listbox-option>
      <wc-listbox-option value="onion" disabled>Onion</wc-listbox-option>
    </wc-listbox>
  `);
}

describe('Listbox', () => {
  it('has the listbox and option roles and states', async () => {
    const { el, options } = await listbox();
    expect(el.getAttribute('role')).to.equal('listbox');
    expect(el.getAttribute('aria-label')).to.equal('Fruit');
    expect(el.getAttribute('aria-multiselectable')).to.equal('false');
    expect(options.map(o => o.getAttribute('role'))).to.deep.equal([
      'option',
      'option',
      'option',
      'option',
    ]);
    expect(options[0].getAttribute('aria-selected')).to.equal('false');
    expect(options[2].getAttribute('aria-disabled')).to.equal('true');
  });

  it('has one tab stop, on the selected option', async () => {
    const { options } = await listbox(html`
      <wc-listbox value="banana">
        <wc-listbox-option value="apple">Apple</wc-listbox-option>
        <wc-listbox-option value="banana">Banana</wc-listbox-option>
      </wc-listbox>
    `);
    expect(options.map(o => o.tabIndex)).to.deep.equal([-1, 0]);
    expect(options[1].selected).to.be.true;
    expect(options[1].getAttribute('aria-selected')).to.equal('true');
  });

  it('selects as focus moves in a single listbox, skipping disabled options', async () => {
    const { el, options } = await listbox();
    const [apple, banana, , blueberry] = options;
    const values: string[] = [];
    el.addEventListener('change', event => {
      values.push((event as CustomEvent<ListboxChangeDetail>).detail.value);
    });

    press(apple, 'ArrowDown');
    expect(el.value).to.equal('banana');
    press(banana, 'ArrowDown');
    expect(el.value).to.equal('blueberry');
    press(blueberry, 'Home');
    expect(el.value).to.equal('apple');
    press(apple, 'End');
    expect(el.value).to.equal('blueberry');
    await settle(el);
    expect(blueberry.selected).to.be.true;
    expect(apple.selected).to.be.false;
    expect(values).to.deep.equal(['banana', 'blueberry', 'apple', 'blueberry']);
  });

  it('moves with typeahead', async () => {
    const { el, options } = await listbox();
    press(options[0], 'b');
    expect(el.value).to.equal('banana');
    // After a pause the same letter goes to the next option starting with it (Cherry is disabled).
    await new Promise(resolve => {
      setTimeout(resolve, 600);
    });
    press(options[1], 'b');
    expect(el.value).to.equal('blueberry');
  });

  it('ignores Left and Right, also in right-to-left layouts', async () => {
    const { el, options } = await listbox(html`
      <wc-listbox dir="rtl">
        <wc-listbox-option value="apple">Apple</wc-listbox-option>
        <wc-listbox-option value="banana">Banana</wc-listbox-option>
      </wc-listbox>
    `);
    press(options[0], 'ArrowLeft');
    press(options[0], 'ArrowRight');
    expect(el.value).to.equal('');
    press(options[0], 'ArrowDown');
    expect(el.value).to.equal('banana');
  });

  it('selects on click and fires change with the value', async () => {
    const { el, options } = await listbox();
    setTimeout(() => options[1].click());
    const event = (await oneEvent(
      el,
      'change',
    )) as CustomEvent<ListboxChangeDetail>;
    expect(event.detail).to.deep.equal({ value: 'banana' });
    expect(event.bubbles).to.be.true;
    expect(event.composed).to.be.true;

    let changes = 0;
    el.addEventListener('change', () => {
      changes += 1;
    });
    options[2].click();
    options[1].click();
    expect(changes).to.equal(0);
    expect(el.value).to.equal('banana');
  });

  it('toggles options with Space and click in a multiple listbox', async () => {
    const { el, options } = await multiple();
    const [cheese, olives, peppers] = options;
    expect(el.getAttribute('aria-multiselectable')).to.equal('true');
    expect(olives.selected).to.be.true;

    // Moving does not select.
    press(olives, 'ArrowDown');
    expect(el.values).to.deep.equal(['olives']);

    setTimeout(() => press(peppers, ' '));
    const event = (await oneEvent(
      el,
      'change',
    )) as CustomEvent<ListboxChangeDetail>;
    expect(event.detail).to.deep.equal({
      value: 'olives,peppers',
      values: ['olives', 'peppers'],
    });

    cheese.click();
    expect(el.values).to.deep.equal(['cheese', 'olives', 'peppers']);
    olives.click();
    expect(el.values).to.deep.equal(['cheese', 'peppers']);
  });

  it('selects and clears all enabled options with Ctrl+A', async () => {
    const { el, options } = await multiple();
    press(options[0], 'a', { ctrlKey: true });
    expect(el.values).to.deep.equal(['cheese', 'olives', 'peppers']);
    press(options[0], 'a', { ctrlKey: true });
    expect(el.values).to.deep.equal([]);
  });

  it('does not change the selection when disabled or readonly', async () => {
    const { el, options } = await listbox();
    el.readonly = true;
    await settle(el);
    expect(el.getAttribute('aria-readonly')).to.equal('true');
    options[1].click();
    press(options[0], 'ArrowDown');
    expect(el.value).to.equal('');

    el.readonly = false;
    el.disabled = true;
    await settle(el);
    expect(el.getAttribute('aria-disabled')).to.equal('true');
    expect(options.map(o => o.tabIndex)).to.deep.equal([-1, -1, -1, -1]);
    options[1].click();
    expect(el.value).to.equal('');
  });

  it('uses the option text when it has no value', async () => {
    const { el, options } = await listbox(html`
      <wc-listbox>
        <wc-listbox-option>Apple</wc-listbox-option>
        <wc-listbox-option>Banana</wc-listbox-option>
      </wc-listbox>
    `);
    options[1].click();
    expect(el.value).to.equal('Banana');
  });

  it('picks up options added later', async () => {
    const { el } = await listbox();
    const option = document.createElement('wc-listbox-option') as ListboxOption;
    option.value = 'date';
    option.textContent = 'Date';
    el.append(option);
    el.value = 'date';
    await settle(el);
    expect(option.selected).to.be.true;
    expect(option.getAttribute('role')).to.equal('option');
  });

  it('is required and submits its values with the form', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <wc-listbox name="fruit" required>
          <wc-listbox-option value="apple">Apple</wc-listbox-option>
          <wc-listbox-option value="banana">Banana</wc-listbox-option>
        </wc-listbox>
        <wc-listbox name="toppings" multiple value="cheese,olives">
          <wc-listbox-option value="cheese">Cheese</wc-listbox-option>
          <wc-listbox-option value="olives">Olives</wc-listbox-option>
        </wc-listbox>
      </form>
    `);
    const [single, many] = Array.from(
      form.querySelectorAll<Listbox>('wc-listbox'),
    );
    await settle(single);
    await settle(many);

    expect(single.checkValidity()).to.be.false;
    expect(single.validity.valueMissing).to.be.true;

    single.value = 'banana';
    await settle(single);
    expect(single.checkValidity()).to.be.true;

    const data = new FormData(form);
    expect(data.get('fruit')).to.equal('banana');
    expect(data.getAll('toppings')).to.deep.equal(['cheese', 'olives']);
  });

  it('restores the starting value on form reset', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <wc-listbox name="fruit" value="apple">
          <wc-listbox-option value="apple">Apple</wc-listbox-option>
          <wc-listbox-option value="banana">Banana</wc-listbox-option>
        </wc-listbox>
      </form>
    `);
    const el = form.querySelector<Listbox>('wc-listbox')!;
    await settle(el);
    el.options[1].click();
    form.reset();
    await settle(el);
    expect(el.value).to.equal('apple');
    expect(el.options[0].selected).to.be.true;
  });
});

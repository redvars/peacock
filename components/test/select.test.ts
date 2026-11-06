/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { Field } from '../src/field/index.js';
import { Item } from '../src/item/index.js';
import { Menu, MenuItem } from '../src/menu/index.js';
import { Select, SelectOptionElement } from '../src/select/index.js';

if (!customElements.get('wc-item')) {
  customElements.define('wc-item', Item);
}

if (!customElements.get('wc-menu')) {
  customElements.define('wc-menu', Menu);
}

if (!customElements.get('wc-menu-item')) {
  customElements.define('wc-menu-item', MenuItem);
}

if (!customElements.get('wc-field')) {
  customElements.define('wc-field', Field);
}

if (!customElements.get('wc-option')) {
  customElements.define('wc-option', SelectOptionElement);
}

if (!customElements.get('wc-select')) {
  customElements.define('wc-select', Select);
}

describe('Select', () => {
  it('anchors the menu to the field border and uses the field width as minimum', async () => {
    const el = await fixture<Select>(html`
      <wc-select label="Fruit" style="display: block; width: 320px">
        <wc-option value="apple">Apple</wc-option>
        <wc-option value="banana">Banana</wc-option>
      </wc-select>
    `);

    const field = el.shadowRoot!.querySelector<Field>('wc-field')!;
    const menu = el.shadowRoot!.querySelector<Menu>('wc-menu')!;
    await field.updateComplete;

    el.shadowRoot!.querySelector<HTMLElement>('.select-trigger')!.click();
    await el.updateComplete;
    await menu.updateComplete;

    const fieldBody = field.fieldBodyElement!;
    expect(menu.open).to.be.true;
    expect(menu.anchorElement).to.equal(fieldBody);
    expect(menu.style.getPropertyValue('--menu-min-width')).to.equal(
      `${Math.ceil(fieldBody.getBoundingClientRect().width)}px`,
    );
  });

  /** Picks an option the way wc-menu reports it. */
  function activate(el: Select, value: string) {
    el.shadowRoot!.querySelector('wc-menu')!.dispatchEvent(
      new CustomEvent('menu-item-activate', { detail: { item: { value } } }),
    );
  }

  it('shows the label of the selected value', async () => {
    const el = await fixture<Select>(html`
      <wc-select value="banana">
        <wc-option value="apple">Apple</wc-option>
        <wc-option value="banana">Banana</wc-option>
      </wc-select>
    `);

    expect(
      el.shadowRoot!.querySelector('.display-value')?.textContent,
    ).to.equal('Banana');
    const banana = el.querySelector<SelectOptionElement>(
      'wc-option[value="banana"]',
    )!;
    expect(banana.selected).to.be.true;
  });

  it('updates value and fires change when an option is picked', async () => {
    const el = await fixture<Select>(html`
      <wc-select>
        <wc-option value="apple">Apple</wc-option>
        <wc-option value="banana">Banana</wc-option>
      </wc-select>
    `);

    setTimeout(() => activate(el, 'apple'));
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;

    expect(event.detail.value).to.equal('apple');
    expect(el.value).to.equal('apple');
  });

  it('builds options from the options property', async () => {
    const el = await fixture<Select>(html`<wc-select></wc-select>`);
    el.options = [
      { label: 'Red', value: 'red' },
      { label: 'Green', value: 'green' },
    ];
    await el.updateComplete;

    const generated = el.querySelectorAll('wc-option[data-generated]');
    expect(generated).to.have.length(2);
    expect(generated[1].textContent).to.equal('Green');
  });

  it('toggles values in multiple mode', async () => {
    const el = await fixture<Select>(html`
      <wc-select multiple>
        <wc-option value="a">A</wc-option>
        <wc-option value="b">B</wc-option>
      </wc-select>
    `);

    activate(el, 'a');
    activate(el, 'b');
    expect(el.value).to.equal('a,b');

    activate(el, 'a');
    expect(el.value).to.equal('b');
  });

  it('submits with a form, one entry per value when multiple', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <wc-select name="fruit" value="apple">
          <wc-option value="apple">Apple</wc-option>
        </wc-select>
        <wc-select name="tags" multiple value="x,y">
          <wc-option value="x">X</wc-option>
          <wc-option value="y">Y</wc-option>
        </wc-select>
      </form>
    `);

    const data = new FormData(form);
    expect(data.get('fruit')).to.equal('apple');
    expect(data.getAll('tags')).to.deep.equal(['x', 'y']);
  });

  it('restores its starting value on form reset', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <wc-select name="fruit" value="apple">
          <wc-option value="apple">Apple</wc-option>
          <wc-option value="banana">Banana</wc-option>
        </wc-select>
      </form>
    `);
    const el = form.querySelector<Select>('wc-select')!;

    activate(el, 'banana');
    expect(el.value).to.equal('banana');

    form.reset();
    expect(el.value).to.equal('apple');
  });

  function trigger(el: Select) {
    return el.shadowRoot!.querySelector<HTMLElement>('.select-trigger')!;
  }

  function menuOf(el: Select) {
    return el.shadowRoot!.querySelector<Menu>('wc-menu')!;
  }

  async function settle(el: Select) {
    await el.updateComplete;
    await menuOf(el).updateComplete;
  }

  it('uses listbox and option roles', async () => {
    const el = await fixture<Select>(html`
      <wc-select multiple value="b">
        <wc-option value="a">A</wc-option>
        <wc-option value="b">B</wc-option>
      </wc-select>
    `);
    const menu = menuOf(el);
    const b = el.querySelector<SelectOptionElement>('wc-option[value="b"]')!;
    await b.updateComplete;
    const control = b.shadowRoot!.querySelector('#menu-item')!;

    expect(menu.getAttribute('role')).to.equal('listbox');
    expect(menu.getAttribute('aria-multiselectable')).to.equal('true');
    expect(control.getAttribute('role')).to.equal('option');
    expect(control.getAttribute('aria-selected')).to.equal('true');
  });

  it('opens with the keyboard and focuses the selected option', async () => {
    const el = await fixture<Select>(html`
      <wc-select value="b">
        <wc-option value="a">A</wc-option>
        <wc-option value="b">B</wc-option>
        <wc-option value="c">C</wc-option>
      </wc-select>
    `);
    trigger(el).focus();
    trigger(el).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
    );
    await settle(el);

    expect(menuOf(el).open).to.be.true;
    expect(document.activeElement === el.querySelector('wc-option[value="b"]'))
      .to.be.true;
  });

  it('picks an option with Enter and returns focus to the field', async () => {
    const el = await fixture<Select>(html`
      <wc-select>
        <wc-option value="a">A</wc-option>
        <wc-option value="b">B</wc-option>
      </wc-select>
    `);
    trigger(el).focus();
    trigger(el).dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    await settle(el);

    const menu = menuOf(el);
    menu.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        bubbles: true,
        composed: true,
      }),
    );
    (document.activeElement as HTMLElement).dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
      }),
    );
    await settle(el);

    expect(el.value).to.equal('b');
    expect(menu.open).to.be.false;
    expect(el.shadowRoot!.activeElement === trigger(el)).to.be.true;
  });

  it('does not show an empty-value option as selected behind a placeholder', async () => {
    const el = await fixture<Select>(html`
      <wc-select placeholder="Pick one">
        <wc-option value="">None</wc-option>
        <wc-option value="a">A</wc-option>
      </wc-select>
    `);
    const none = el.querySelector<SelectOptionElement>('wc-option[value=""]')!;
    expect(none.selected).to.be.false;
    expect(el.shadowRoot!.querySelector('.placeholder')?.textContent).to.equal(
      'Pick one',
    );
  });

  it('shows a checkbox on every option in multiple mode', async () => {
    const el = await fixture<Select>(html`
      <wc-select multiple value="a">
        <wc-option value="a">A</wc-option>
        <wc-option value="b">B</wc-option>
      </wc-select>
    `);
    const [a, b] = Array.from(
      el.querySelectorAll<SelectOptionElement>('wc-option'),
    );
    await a.updateComplete;
    await b.updateComplete;

    expect(
      a.shadowRoot!.querySelector('.checkbox-indicator')?.getAttribute('name'),
    ).to.equal('check_box');
    expect(
      b.shadowRoot!.querySelector('.checkbox-indicator')?.getAttribute('name'),
    ).to.equal('check_box_outline_blank');
    expect(a.shadowRoot!.querySelector('.check-indicator')).to.not.exist;
    expect(a.keepOpen).to.be.true;
  });

  it('exposes the selected values as an array', async () => {
    const el = await fixture<Select>(html`
      <wc-select multiple value="a,b">
        <wc-option value="a">A</wc-option>
        <wc-option value="b">B</wc-option>
      </wc-select>
    `);
    expect(el.values).to.deep.equal(['a', 'b']);
    el.values = ['b'];
    expect(el.value).to.equal('b');
  });

  it('clears the value with the clear button', async () => {
    const el = await fixture<Select>(html`
      <wc-select clearable value="a">
        <wc-option value="a">A</wc-option>
      </wc-select>
    `);
    const clear = el.shadowRoot!.querySelector<HTMLElement>('.clear-btn')!;
    expect(clear).to.exist;

    setTimeout(() => clear.click());
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;
    await el.updateComplete;

    expect(event.detail.value).to.equal('');
    expect(el.shadowRoot!.querySelector('.clear-btn')).to.not.exist;
  });

  it('filters options with search and shows a no-results row', async () => {
    const el = await fixture<Select>(html`
      <wc-select search="contains">
        <wc-option value="apple">Apple</wc-option>
        <wc-option value="banana">Banana</wc-option>
      </wc-select>
    `);
    trigger(el).click();
    await settle(el);

    const input =
      el.shadowRoot!.querySelector<HTMLInputElement>('.search-input')!;
    input.value = 'ban';
    input.dispatchEvent(new InputEvent('input'));
    await settle(el);

    const apple = el.querySelector<SelectOptionElement>(
      'wc-option[value="apple"]',
    )!;
    expect(apple.filtered).to.be.true;
    expect(apple.hidden).to.be.true;

    input.value = 'zzz';
    input.dispatchEvent(new InputEvent('input'));
    await settle(el);
    expect(
      el.shadowRoot!.querySelector('.no-results')?.textContent?.trim(),
    ).to.equal('No results');
  });

  it('picks the first match with Enter in the search input', async () => {
    const el = await fixture<Select>(html`
      <wc-select search="contains">
        <wc-option value="apple">Apple</wc-option>
        <wc-option value="banana">Banana</wc-option>
      </wc-select>
    `);
    trigger(el).click();
    await settle(el);

    const input =
      el.shadowRoot!.querySelector<HTMLInputElement>('.search-input')!;
    input.value = 'nan';
    input.dispatchEvent(new InputEvent('input'));
    await settle(el);
    input.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        composed: true,
      }),
    );
    await settle(el);

    expect(el.value).to.equal('banana');
  });
});

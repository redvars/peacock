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
});

/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import {
  Field,
  Item,
  Menu,
  MenuItem,
  Select,
  SelectOptionElement,
} from '../src/index.js';

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
});

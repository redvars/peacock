/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Popover, PopoverContent } from '../src/popover/index.js';
import { Modal } from '../src/modal/index.js';
import { Menu } from '../src/menu/menu/menu.js';
import { MenuItem } from '../src/menu/menu-item/menu-item.js';
import { DateField } from '../src/date-field/date-field.js';
import { DatePicker } from '../src/date-picker/date-picker.js';
import { Field } from '../src/field/field.js';
import { Item } from '../src/item/index.js';

for (const [tag, element] of [
  ['wc-item', Item],
  ['wc-popover', Popover],
  ['wc-popover-content', PopoverContent],
  ['wc-modal', Modal],
  ['wc-menu', Menu],
  ['wc-menu-item', MenuItem],
  ['wc-date-field', DateField],
  ['wc-date-picker', DatePicker],
  ['wc-field', Field],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function escape(target: EventTarget = document) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      composed: true,
      cancelable: true,
    }),
  );
}

describe('Overlay events', () => {
  it('keeps a date field picker’s open/close inside the field', async () => {
    const wrapper = await fixture<HTMLDivElement>(
      html`<div><wc-date-field label="Day"></wc-date-field></div>`,
    );
    const field = wrapper.querySelector<DateField>('wc-date-field')!;
    const heard: string[] = [];
    wrapper.addEventListener('open', e => heard.push(e.type));
    wrapper.addEventListener('close', e => heard.push(e.type));
    wrapper.addEventListener('wc-popover--open', e => heard.push(e.type));

    field.showPicker();
    await field.updateComplete;
    const popover = field.shadowRoot!.querySelector<Popover>('wc-popover')!;
    await popover.updateComplete;
    popover.hide();
    await popover.updateComplete;

    expect(heard).to.deep.equal([]);
  });

  it('does not close a modal when a popover inside it closes', async () => {
    const el = await fixture<Modal>(html`
      <wc-modal open>
        <wc-popover>
          <button>More</button>
          <wc-popover-content>Details</wc-popover-content>
        </wc-popover>
      </wc-modal>
    `);
    await el.updateComplete;
    const popover = el.querySelector<Popover>('wc-popover')!;
    popover.show();
    await popover.updateComplete;

    escape();
    await popover.updateComplete;
    await el.updateComplete;

    expect(popover.open).to.equal(false);
    expect(el.open).to.equal(true);
  });

  it('lets a menu inside a popover take Escape first', async () => {
    const el = await fixture<Popover>(html`
      <wc-popover>
        <button>Open</button>
        <wc-popover-content>
          <button id="anchor">Actions</button>
          <wc-menu anchor="anchor">
            <wc-menu-item>Rename</wc-menu-item>
          </wc-menu>
        </wc-popover-content>
      </wc-popover>
    `);
    el.show();
    await el.updateComplete;
    const menu = el.querySelector<Menu>('wc-menu')!;
    menu.open = true;
    await menu.updateComplete;
    expect(menu.hasAttribute('data-handles-escape')).to.equal(true);

    escape(menu.querySelector('wc-menu-item')!);
    await menu.updateComplete;
    await el.updateComplete;

    expect(el.open).to.equal(true);
    expect(menu.hasAttribute('data-handles-escape')).to.equal(menu.open);
  });

  it('leaves focus where the person pressed after a light dismiss', async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <wc-popover>
          <button id="trigger">Open</button>
          <wc-popover-content
            ><button id="inside">In</button></wc-popover-content
          >
        </wc-popover>
        <input id="elsewhere" />
      </div>
    `);
    const popover = wrapper.querySelector<Popover>('wc-popover')!;
    const trigger = wrapper.querySelector<HTMLButtonElement>('#trigger')!;
    const elsewhere = wrapper.querySelector<HTMLInputElement>('#elsewhere')!;
    trigger.focus();
    popover.show();
    await popover.updateComplete;
    wrapper.querySelector<HTMLButtonElement>('#inside')!.focus();

    elsewhere.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, composed: true }),
    );
    elsewhere.focus();
    await popover.updateComplete;

    expect(popover.open).to.equal(false);
    expect(document.activeElement).to.equal(elsewhere);
  });
});

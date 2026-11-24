/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { createAgent } from '@ui-sdk/web/agent';
import { Input } from '../src/input/index.js';
import { Field } from '../src/field/index.js';
import { Item } from '../src/item/index.js';
import { Menu, MenuItem } from '../src/menu/index.js';
import { Select, SelectOptionElement } from '../src/select/index.js';

for (const [tag, element] of [
  ['wc-input', Input],
  ['wc-field', Field],
  ['wc-item', Item],
  ['wc-menu', Menu],
  ['wc-menu-item', MenuItem],
  ['wc-select', Select],
  ['wc-option', SelectOptionElement],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

// The agent bridge must exist before components render, so it hears them as they're made.
const agent = createAgent();

type Entry = {
  ref: string;
  component: string;
  label?: string;
  value?: unknown;
  actions?: string[];
  items?: { value: string; label: string }[];
};

async function entries(): Promise<Entry[]> {
  const snapshot = (await agent.snapshot()) as unknown;
  const list = Array.isArray(snapshot)
    ? snapshot
    : ((snapshot as { components?: Entry[] }).components ?? []);
  return list as Entry[];
}

describe('ui-sdk agent bridge (spike)', () => {
  it('lists wc-input with its label, value and actions', async () => {
    await fixture<Input>(
      html`<wc-input label="Project name" value="Apollo"></wc-input>`,
    );
    const entry = (await entries()).find(e => e.label === 'Project name');
    expect(entry, JSON.stringify(await agent.snapshot())).to.exist;
    expect(entry?.component).to.equal('input');
    expect(entry?.value).to.equal('Apollo');
    expect(entry?.actions).to.include('setValue');
  });

  it('lets an agent set the value through wc-input', async () => {
    const el = await fixture<Input>(
      html`<wc-input label="Codename" value="Apollo"></wc-input>`,
    );
    const input = oneEvent(el, 'input');
    const change = oneEvent(el, 'change');
    const result = await agent.act({
      steps: [{ ref: 'Codename', action: 'setValue', args: ['Atlas'] }],
    });
    expect((result as { ok?: boolean }).ok, JSON.stringify(result)).to.equal(
      true,
    );
    expect((await input).detail.value).to.equal('Atlas');
    expect((await change).detail.value).to.equal('Atlas');
    expect(el.value).to.equal('Atlas');
  });

  it('sees values the person types', async () => {
    const el = await fixture<Input>(
      html`<wc-input label="Owner" value=""></wc-input>`,
    );
    const native = el.shadowRoot!.querySelector('input')!;
    native.value = 'Hollis';
    native.dispatchEvent(new Event('input', { bubbles: true }));
    await el.updateComplete;
    const entry = (await entries()).find(e => e.label === 'Owner');
    expect(entry?.value).to.equal('Hollis');
  });

  it('sees values the app sets on wc-input', async () => {
    const el = await fixture<Input>(
      html`<wc-input label="Region" value="eu"></wc-input>`,
    );
    el.value = 'us';
    await el.updateComplete;
    const entry = (await entries()).find(e => e.label === 'Region');
    expect(entry?.value).to.equal('us');
  });

  describe('wc-select', () => {
    const fruit = html`<wc-select label="Fruit" value="apple">
      <wc-option value="apple">Apple</wc-option>
      <wc-option value="banana">Banana</wc-option>
      <wc-option value="cherry" disabled>Cherry</wc-option>
    </wc-select>`;

    it('is listed with its label, value and items', async () => {
      await fixture<Select>(fruit);
      const entry = (await entries()).find(e => e.label === 'Fruit');
      expect(entry, JSON.stringify(await agent.snapshot())).to.exist;
      expect(entry?.value).to.equal('apple');
      expect(entry?.actions).to.include('setValue');
      expect(entry?.items?.map(i => i.label)).to.deep.equal([
        'Apple',
        'Banana',
        'Cherry',
      ]);
    });

    it('takes an item by its label and fires change', async () => {
      const el = await fixture<Select>(fruit);
      const change = oneEvent(el, 'change');
      const result = (await agent.act({
        steps: [{ ref: 'Fruit', action: 'setValue', args: ['Banana'] }],
      })) as { ok: boolean };
      expect(result.ok, JSON.stringify(result)).to.equal(true);
      expect((await change).detail.value).to.equal('banana');
      expect(el.value).to.equal('banana');
    });

    it('refuses a value that is not one of its items', async () => {
      const el = await fixture<Select>(fruit);
      const result = (await agent.act({
        steps: [{ ref: 'Fruit', action: 'setValue', args: ['Durian'] }],
      })) as { ok: boolean; error?: { message: string } };
      expect(result.ok).to.equal(false);
      expect(result.error?.message).to.contain('Apple, Banana, Cherry');
      expect(el.value).to.equal('apple');
    });

    it('follows values the app sets', async () => {
      const el = await fixture<Select>(fruit);
      el.value = 'banana';
      await el.updateComplete;
      const entry = (await entries()).find(e => e.label === 'Fruit');
      expect(entry?.value).to.equal('banana');
    });

    it('offers no actions while disabled', async () => {
      const el = await fixture<Select>(
        html`<wc-select label="Locked fruit" value="apple" disabled>
          <wc-option value="apple">Apple</wc-option>
          <wc-option value="banana">Banana</wc-option>
        </wc-select>`,
      );
      const result = (await agent.act({
        steps: [{ ref: 'Locked fruit', action: 'setValue', args: ['banana'] }],
      })) as { ok: boolean };
      expect(result.ok).to.equal(false);
      expect(el.value).to.equal('apple');
    });

    it('sets every value of a multi-select', async () => {
      const el = await fixture<Select>(
        html`<wc-select label="Toppings" multiple value="cheese">
          <wc-option value="cheese">Cheese</wc-option>
          <wc-option value="olives">Olives</wc-option>
          <wc-option value="basil">Basil</wc-option>
        </wc-select>`,
      );
      const change = oneEvent(el, 'change');
      const result = (await agent.act({
        steps: [
          { ref: 'Toppings', action: 'setValue', args: [['Olives', 'basil']] },
        ],
      })) as { ok: boolean };
      expect(result.ok, JSON.stringify(result)).to.equal(true);
      expect((await change).detail.values).to.deep.equal(['olives', 'basil']);
      expect(el.value).to.equal('olives,basil');
    });
  });
});

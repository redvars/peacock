/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync, waitUntil } from '@open-wc/testing';
import {
  DescriptionItem,
  DescriptionList,
} from '../src/description-list/index.js';

for (const [tag, element] of [
  ['wc-description-item', DescriptionItem],
  ['wc-description-list', DescriptionList],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

async function list(template: ReturnType<typeof html>) {
  const el = fixtureSync<DescriptionList>(template);
  await el.updateComplete;
  const items = Array.from(
    el.querySelectorAll<DescriptionItem>('wc-description-item'),
  );
  await Promise.all(items.map(item => item.updateComplete));
  // Slot changes land after the first render.
  await Promise.all(items.map(item => item.updateComplete));
  return { el, items };
}

function part(item: DescriptionItem, selector: string) {
  return item.shadowRoot!.querySelector<HTMLElement>(selector)!;
}

describe('wc-description-list', () => {
  it('renders each item as a dl with a dt and a dd that holds the value', async () => {
    const { items } = await list(html`
      <wc-description-list>
        <wc-description-item label="Status">Active</wc-description-item>
      </wc-description-list>
    `);
    const dl = part(items[0], 'dl');
    expect(dl).to.exist;
    const [dt, dd] = Array.from(dl.children);
    expect(dt.tagName).to.equal('DT');
    expect(dt.textContent!.trim()).to.equal('Status');
    expect(dd.tagName).to.equal('DD');
    const slot = dd.querySelector<HTMLSlotElement>('slot:not([name])')!;
    expect(slot.assignedNodes()[0].textContent).to.equal('Active');
  });

  it('shows a dash read as "Not set" for an empty value', async () => {
    const { items } = await list(html`
      <wc-description-list>
        <wc-description-item label="Due date"> </wc-description-item>
        <wc-description-item label="Owner">Ana</wc-description-item>
      </wc-description-list>
    `);
    await waitUntil(() => part(items[0], '.empty'));
    expect(part(items[0], '.empty').getAttribute('aria-hidden')).to.equal(
      'true',
    );
    expect(part(items[0], '.screen-reader-only').textContent).to.equal(
      'Not set',
    );
    expect(part(items[1], '.empty')).to.equal(null);
  });

  it('drops the placeholder once a value is added', async () => {
    const { items } = await list(html`
      <wc-description-list>
        <wc-description-item label="Owner"></wc-description-item>
      </wc-description-list>
    `);
    expect(part(items[0], '.empty')).to.exist;
    items[0].textContent = 'Ana';
    await waitUntil(() => part(items[0], '.empty') === null);
  });

  it('shows the actions slot only when it has content', async () => {
    const { items } = await list(html`
      <wc-description-list>
        <wc-description-item label="ID">
          A-1 <button slot="actions">Copy</button>
        </wc-description-item>
        <wc-description-item label="Owner">Ana</wc-description-item>
      </wc-description-list>
    `);
    await waitUntil(() => !part(items[0], '.actions').hidden);
    expect(part(items[1], '.actions').hidden).to.equal(true);
    // The actions sit in the definition, next to the value.
    expect(part(items[0], 'dd .actions')).to.exist;
  });

  it('puts the label above the value by default and beside it inline', async () => {
    const { el, items } = await list(html`
      <wc-description-list style="width: 600px">
        <wc-description-item label="Status">Active</wc-description-item>
      </wc-description-list>
    `);
    const dt = () => part(items[0], 'dt').getBoundingClientRect();
    const dd = () => part(items[0], 'dd').getBoundingClientRect();
    expect(dd().top).to.be.greaterThan(dt().top);
    el.layout = 'inline';
    await el.updateComplete;
    expect(dd().top).to.equal(dt().top);
    expect(dd().left).to.be.greaterThan(dt().left);
  });

  it('lays the items out in columns that collapse when the list is narrow', async () => {
    const { el, items } = await list(html`
      <wc-description-list columns="4" style="width: 800px">
        <wc-description-item label="A">1</wc-description-item>
        <wc-description-item label="B">2</wc-description-item>
        <wc-description-item label="C">3</wc-description-item>
        <wc-description-item label="D">4</wc-description-item>
      </wc-description-list>
    `);
    const tops = () => items.map(item => item.getBoundingClientRect().top);
    expect(new Set(tops()).size).to.equal(1);
    // Below 40rem: two columns.
    el.style.width = '500px';
    await waitUntil(() => new Set(tops()).size === 2);
    // Below 24rem: one column.
    el.style.width = '300px';
    await waitUntil(() => new Set(tops()).size === 4);
  });

  it('stacks inline items in a narrow list', async () => {
    const { items } = await list(html`
      <wc-description-list layout="inline" style="width: 300px">
        <wc-description-item label="Status">Active</wc-description-item>
      </wc-description-list>
    `);
    const dt = part(items[0], 'dt').getBoundingClientRect();
    const dd = part(items[0], 'dd').getBoundingClientRect();
    expect(dd.top).to.be.greaterThan(dt.top);
  });

  it('clamps columns to 1-4', async () => {
    const { el } = await list(html`
      <wc-description-list columns="9"></wc-description-list>
    `);
    expect(el.shadowRoot!.querySelector('.list')!.className).to.contain(
      'columns-4',
    );
  });

  it('lets a span item take a whole row', async () => {
    const { items } = await list(html`
      <wc-description-list columns="2" style="width: 800px">
        <wc-description-item label="A">1</wc-description-item>
        <wc-description-item label="B">2</wc-description-item>
        <wc-description-item label="Notes" span>Long text</wc-description-item>
      </wc-description-list>
    `);
    expect(items[2].getBoundingClientRect().width).to.be.closeTo(800, 1);
  });

  it('draws a line under every item when divided', async () => {
    const { el, items } = await list(html`
      <wc-description-list>
        <wc-description-item label="A">1</wc-description-item>
      </wc-description-list>
    `);
    expect(getComputedStyle(items[0]).borderBottomStyle).to.equal('none');
    el.divided = true;
    await el.updateComplete;
    expect(getComputedStyle(items[0]).borderBottomStyle).to.equal('solid');
  });
});

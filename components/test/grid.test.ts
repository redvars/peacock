/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync } from '@open-wc/testing';
import { Grid } from '../src/grid/grid.js';

if (!customElements.get('wc-grid')) {
  customElements.define('wc-grid', Grid);
}

async function render(template: ReturnType<typeof html>) {
  const wrapper = fixtureSync<HTMLDivElement>(
    html`<div
      style="--spacing-200: 16px; --spacing-100: 8px; --spacing-000: 0; width: 450px"
    >
      ${template}
    </div>`,
  );
  const el = wrapper.querySelector('wc-grid') as Grid;
  await el.updateComplete;
  return el;
}

function trackCount(el: Element) {
  const value = getComputedStyle(el).gridTemplateColumns;
  return value === 'none' ? 0 : value.split(' ').length;
}

const items = html`<div>1</div>
  <div>2</div>
  <div>3</div>
  <div>4</div>
  <div>5</div>
  <div>6</div>`;

describe('Grid', () => {
  it('is a grid container with its children as grid items', async () => {
    const el = await render(html`<wc-grid columns="3">${items}</wc-grid>`);
    expect(getComputedStyle(el).display).to.equal('grid');
    expect(trackCount(el)).to.equal(3);
    expect(getComputedStyle(el).gridTemplateColumns).to.equal(
      '150px 150px 150px',
    );
  });

  it('updates when columns changes', async () => {
    const el = await render(html`<wc-grid columns="3">${items}</wc-grid>`);
    el.columns = 2;
    await el.updateComplete;
    expect(trackCount(el)).to.equal(2);
  });

  it('fits as many columns as min-column-width allows', async () => {
    const el = await render(
      html`<wc-grid min-column-width="100px">${items}</wc-grid>`,
    );
    expect(trackCount(el)).to.equal(4);
  });

  it('caps the auto-fill columns at columns when both are set', async () => {
    const el = await render(
      html`<wc-grid min-column-width="100px" columns="2">${items}</wc-grid>`,
    );
    expect(trackCount(el)).to.equal(2);
    el.minColumnWidth = '300px';
    await el.updateComplete;
    expect(trackCount(el)).to.equal(1);
  });

  it('maps gap, row-gap and column-gap to spacing tokens', async () => {
    const el = await render(
      html`<wc-grid columns="2" gap="200">${items}</wc-grid>`,
    );
    expect(getComputedStyle(el).rowGap).to.equal('16px');
    expect(getComputedStyle(el).columnGap).to.equal('16px');
    el.rowGap = '100';
    await el.updateComplete;
    expect(getComputedStyle(el).rowGap).to.equal('8px');
    expect(getComputedStyle(el).columnGap).to.equal('16px');
    // The cap accounts for the column gap: two columns of (450 - 16) / 2.
    expect(getComputedStyle(el).gridTemplateColumns).to.equal('217px 217px');
  });

  it('lets an item span columns with plain CSS', async () => {
    const el = await render(
      html`<wc-grid columns="3"
        ><div style="grid-column: span 2">wide</div>
        <div>narrow</div></wc-grid
      >`,
    );
    const wide = el.children[0] as HTMLElement;
    expect(wide.getBoundingClientRect().width).to.equal(300);
  });

  it('sets align-items and justify-items', async () => {
    const el = await render(
      html`<wc-grid align="center" justify="end"></wc-grid>`,
    );
    expect(getComputedStyle(el).alignItems).to.equal('center');
    expect(getComputedStyle(el).justifyItems).to.equal('end');
  });
});

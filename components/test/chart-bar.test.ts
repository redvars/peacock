/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixture } from '@open-wc/testing';
import { ChartBar, ChartStackedBar } from '../src/index.js';

const RENDER_SETTLE_TIME = 300;

if (!customElements.get('wc-chart-bar')) {
  customElements.define('wc-chart-bar', ChartBar);
}

if (!customElements.get('wc-chart-stacked-bar')) {
  customElements.define('wc-chart-stacked-bar', ChartStackedBar);
}

describe('ChartBar', () => {
  it('renders a bar for each datum', async () => {
    const el = await fixture<ChartBar>(
      html`<wc-chart-bar width="420" height="260"></wc-chart-bar>`,
    );

    el.data = [
      { name: 'one', label: 'One', value: 10 },
      { name: 'two', label: 'Two', value: 20 },
      { name: 'three', label: 'Three', value: 15 },
    ];

    await el.updateComplete;
    await new Promise(resolve => setTimeout(resolve, RENDER_SETTLE_TIME));

    const bars = el.shadowRoot!.querySelectorAll<SVGRectElement>('.bars rect');
    expect(bars.length).to.equal(3);

    const legendItems =
      el.shadowRoot!.querySelectorAll<HTMLSpanElement>('.legend-item');
    expect(legendItems.length).to.equal(3);
  });
});

describe('ChartStackedBar', () => {
  it('stacks segments for each category', async () => {
    const el = await fixture<ChartStackedBar>(
      html`<wc-chart-stacked-bar width="480" height="280"></wc-chart-stacked-bar>`,
    );

    el.data = [
      {
        name: 'alpha',
        label: 'Alpha',
        segments: [
          { name: 'a', label: 'Group A', value: 12 },
          { name: 'b', label: 'Group B', value: 8 },
        ],
      },
      {
        name: 'beta',
        label: 'Beta',
        segments: [
          { name: 'a', label: 'Group A', value: 5 },
          { name: 'b', label: 'Group B', value: 7 },
        ],
      },
    ];

    await el.updateComplete;
    await new Promise(resolve => setTimeout(resolve, RENDER_SETTLE_TIME));

    const segments =
      el.shadowRoot!.querySelectorAll<SVGRectElement>('.stacked-segment');
    expect(segments.length).to.equal(4);

    const legendItems =
      el.shadowRoot!.querySelectorAll<HTMLSpanElement>('.legend-item');
    expect(legendItems.length).to.equal(2);
  });
});

/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixture, oneEvent } from '@open-wc/testing';
import { ChartBar } from '../src/chart-bar/index.js';
import { ChartLine } from '../src/chart-line/index.js';
import { ChartArea } from '../src/chart-area/index.js';
import { ChartPie } from '../src/chart-pie/index.js';
import { ChartDoughnut } from '../src/chart-doughnut/index.js';
import type { ChartSelectDetail } from '../src/__internal/chart/types.js';

for (const [tag, element] of [
  ['wc-chart-bar', ChartBar],
  ['wc-chart-line', ChartLine],
  ['wc-chart-area', ChartArea],
  ['wc-chart-pie', ChartPie],
  ['wc-chart-doughnut', ChartDoughnut],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

const config = {
  desktop: { label: 'Desktop' },
  mobile: { label: 'Mobile' },
};

const data = [
  { month: 'Jan', desktop: 186, mobile: 80 },
  { month: 'Feb', desktop: 305, mobile: 200 },
  { month: 'Mar', desktop: 237, mobile: 120 },
  { month: 'Apr', desktop: 73, mobile: 190 },
];

const slices = [
  { name: 'chrome', label: 'Chrome', value: 275 },
  { name: 'safari', label: 'Safari', value: 200 },
  { name: 'firefox', label: 'Firefox', value: 125 },
];

type AnyChart = ChartBar | ChartLine | ChartArea | ChartPie | ChartDoughnut;

function root(el: AnyChart): ShadowRoot {
  return el.shadowRoot as ShadowRoot;
}

function frame() {
  return new Promise(resolve => {
    requestAnimationFrame(() => resolve(undefined));
  });
}

/** Waits for the resize observer, the redraw it triggers, and the highlight pass. */
async function settle(el: AnyChart) {
  await el.updateComplete;
  await frame();
  await frame();
  await el.updateComplete;
}

/** Mounts a chart inside a fixed-width container with animation off. */
async function mount<T extends AnyChart>(
  template: ReturnType<typeof html>,
): Promise<T> {
  const wrapper = await fixture<HTMLDivElement>(
    html`<div style="width: 480px">${template}</div>`,
  );
  const el = wrapper.firstElementChild as T;
  await settle(el);
  return el;
}

function plot(el: AnyChart): HTMLElement {
  return root(el).querySelector('.plot') as HTMLElement;
}

async function press(el: AnyChart, key: string) {
  plot(el).dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
  await settle(el);
}

describe('wc-chart-bar', () => {
  it('fills its container and draws one bar per series and category', async () => {
    const el = await mount<ChartBar>(
      html`<wc-chart-bar
        disable-animation
        category-key="month"
        .config=${config}
        .data=${data}
      ></wc-chart-bar>`,
    );
    const svg = root(el).querySelector('svg.chart-svg') as SVGSVGElement;
    expect(svg.getAttribute('width')).to.equal('480');
    expect(svg.getAttribute('height')).to.equal('300');
    expect(root(el).querySelectorAll('path.bar').length).to.equal(8);
  });

  it('labels categories and value ticks', async () => {
    const el = await mount<ChartBar>(
      html`<wc-chart-bar
        disable-animation
        category-key="month"
        .config=${config}
        .data=${data}
      ></wc-chart-bar>`,
    );
    const categories = [
      ...root(el).querySelectorAll('.category-axis text'),
    ].map(t => t.textContent);
    expect(categories).to.deep.equal(['Jan', 'Feb', 'Mar', 'Apr']);
    expect(
      root(el).querySelectorAll('.value-axis text').length,
    ).to.be.greaterThan(2);
  });

  it('stacks segments so each category reaches its total', async () => {
    const el = await mount<ChartBar>(
      html`<wc-chart-bar
        disable-animation
        stacked
        category-key="month"
        .config=${config}
        .data=${data}
      ></wc-chart-bar>`,
    );
    const bars = [...root(el).querySelectorAll<SVGPathElement>('path.bar')];
    expect(bars.length).to.equal(8);
    const desktop = bars.find(
      b => b.dataset.index === '1' && b.dataset.key === 'desktop',
    );
    const mobile = bars.find(
      b => b.dataset.index === '1' && b.dataset.key === 'mobile',
    );
    // Mobile sits on top of desktop, so it starts higher up.
    expect(mobile!.getBBox().y).to.be.lessThan(desktop!.getBBox().y);
  });

  it('re-renders when the container resizes', async () => {
    const el = await mount<ChartBar>(
      html`<wc-chart-bar
        disable-animation
        category-key="month"
        .config=${config}
        .data=${data}
      ></wc-chart-bar>`,
    );
    (el.parentElement as HTMLElement).style.width = '300px';
    await settle(el);
    const svg = root(el).querySelector('svg.chart-svg') as SVGSVGElement;
    expect(svg.getAttribute('width')).to.equal('300');
  });

  it('hides a series from the legend', async () => {
    const el = await mount<ChartBar>(
      html`<wc-chart-bar
        disable-animation
        category-key="month"
        .config=${config}
        .data=${data}
      ></wc-chart-bar>`,
    );
    const buttons =
      root(el).querySelectorAll<HTMLButtonElement>('.legend-item');
    expect(buttons.length).to.equal(2);
    buttons[1].click();
    await settle(el);
    expect(buttons[1].getAttribute('aria-pressed')).to.equal('false');
    expect(
      root(el).querySelectorAll('path.bar[data-key="mobile"]').length,
    ).to.equal(0);
    expect(root(el).querySelectorAll('path.bar').length).to.equal(4);
  });

  it('hides the legend for a single series unless legend="show"', async () => {
    const single = { desktop: { label: 'Desktop' } };
    const el = await mount<ChartBar>(
      html`<wc-chart-bar
        disable-animation
        category-key="month"
        .config=${single}
        .data=${data}
      ></wc-chart-bar>`,
    );
    expect(el.legend).to.equal('auto');
    expect(root(el).querySelector('.legend')).to.equal(null);
    el.legend = 'show';
    await settle(el);
    expect(root(el).querySelector('.legend')).to.not.equal(null);
    el.legend = 'hide';
    el.config = config;
    await settle(el);
    expect(root(el).querySelector('.legend')).to.equal(null);
  });

  it('ignores the removed show-legend, hide-legend and index attributes', async () => {
    const single = { desktop: { label: 'Desktop' } };
    const el = await mount<ChartBar>(
      html`<wc-chart-bar
        disable-animation
        show-legend
        index="month"
        .config=${single}
        .data=${data}
      ></wc-chart-bar>`,
    );
    expect(root(el).querySelector('.legend')).to.equal(null);
    const categories = [
      ...root(el).querySelectorAll('.category-axis text'),
    ].map(t => t.textContent);
    expect(categories).to.not.include('Jan');
  });

  it('mirrors Left and Right in RTL', async () => {
    const el = await mount<ChartBar>(
      html`<wc-chart-bar
        dir="rtl"
        disable-animation
        category-key="month"
        .config=${config}
        .data=${data}
      ></wc-chart-bar>`,
    );
    await press(el, 'ArrowLeft');
    expect(root(el).querySelector('.tooltip-title')?.textContent).to.equal(
      'Jan',
    );
    await press(el, 'ArrowLeft');
    expect(root(el).querySelector('.tooltip-title')?.textContent).to.equal(
      'Feb',
    );
    await press(el, 'ArrowRight');
    expect(root(el).querySelector('.tooltip-title')?.textContent).to.equal(
      'Jan',
    );
  });

  it('shows a tooltip and announces values on arrow keys', async () => {
    const el = await mount<ChartBar>(
      html`<wc-chart-bar
        disable-animation
        category-key="month"
        .config=${config}
        .data=${data}
      ></wc-chart-bar>`,
    );
    await press(el, 'ArrowRight');
    const tooltip = root(el).querySelector('.tooltip') as HTMLElement;
    expect(tooltip.querySelector('.tooltip-title')?.textContent).to.equal(
      'Jan',
    );
    expect(tooltip.querySelectorAll('.tooltip-row').length).to.equal(2);
    expect(root(el).querySelector('[aria-live]')?.textContent).to.contain(
      'Desktop 186',
    );
    expect(root(el).querySelectorAll('path.bar.is-dimmed').length).to.equal(6);

    await press(el, 'End');
    expect(root(el).querySelector('.tooltip-title')?.textContent).to.equal(
      'Apr',
    );

    await press(el, 'Escape');
    expect(root(el).querySelector('.tooltip')).to.equal(null);
  });

  it('fires select on Enter', async () => {
    const el = await mount<ChartBar>(
      html`<wc-chart-bar
        disable-animation
        category-key="month"
        .config=${config}
        .data=${data}
      ></wc-chart-bar>`,
    );
    await press(el, 'ArrowRight');
    await press(el, 'ArrowRight');
    setTimeout(() =>
      plot(el).dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' })),
    );
    const event = (await oneEvent(
      el,
      'select',
    )) as CustomEvent<ChartSelectDetail>;
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);
    expect(event.detail.index).to.equal(1);
    expect(event.detail.datum).to.equal(data[1]);
  });

  it('draws horizontal bars with values', async () => {
    const el = await mount<ChartBar>(
      html`<wc-chart-bar
        disable-animation
        orientation="horizontal"
        show-values
        category-key="month"
        .config=${{ desktop: {} }}
        .data=${data}
      ></wc-chart-bar>`,
    );
    const bar = root(el).querySelector<SVGPathElement>(
      'path.bar[data-index="1"]',
    ) as SVGPathElement;
    const box = bar.getBBox();
    expect(box.width).to.be.greaterThan(box.height);
    const values = [...root(el).querySelectorAll('.value-label')].map(
      t => t.textContent,
    );
    expect(values).to.include('305');
  });

  it('uses the value formatter on ticks and tooltips', async () => {
    const el = await mount<ChartBar>(
      html`<wc-chart-bar
        disable-animation
        category-key="month"
        .config=${config}
        .data=${data}
        .valueFormatter=${(v: number) => `$${v}`}
      ></wc-chart-bar>`,
    );
    const ticks = [...root(el).querySelectorAll('.value-axis text')].map(
      t => t.textContent,
    );
    expect(ticks.every(t => t?.startsWith('$'))).to.equal(true);
    await press(el, 'ArrowRight');
    expect(root(el).querySelector('.tooltip-value')?.textContent).to.equal(
      '$186',
    );
  });

  it('shows the empty slot without data and a skeleton while loading', async () => {
    const el = await mount<ChartBar>(
      html`<wc-chart-bar disable-animation></wc-chart-bar>`,
    );
    expect(root(el).querySelector('.empty')).to.not.equal(null);
    expect(root(el).querySelector('svg')).to.equal(null);
    el.loading = true;
    await settle(el);
    expect(root(el).querySelector('.skeleton')).to.not.equal(null);
    el.loading = false;
    el.categoryKey = 'month';
    el.config = config;
    el.data = data;
    await settle(el);
    expect(root(el).querySelectorAll('path.bar').length).to.equal(8);
  });

  it('mirrors the data in a table for screen readers', async () => {
    const el = await mount<ChartBar>(
      html`<wc-chart-bar
        disable-animation
        label="Visitors"
        category-key="month"
        .config=${config}
        .data=${data}
      ></wc-chart-bar>`,
    );
    const table = root(el).querySelector('table.sr-only') as HTMLTableElement;
    expect(table.caption?.textContent?.trim()).to.equal('Visitors');
    expect(table.tBodies[0].rows.length).to.equal(4);
    expect(plot(el).getAttribute('aria-label')).to.contain('Visitors');
  });
});

describe('wc-chart-line', () => {
  it('draws one line per series and optional dots', async () => {
    const el = await mount<ChartLine>(
      html`<wc-chart-line
        disable-animation
        category-key="month"
        .config=${config}
        .data=${data}
      ></wc-chart-line>`,
    );
    expect(root(el).querySelectorAll('path.line').length).to.equal(2);
    expect(root(el).querySelectorAll('circle.dot').length).to.equal(0);
    el.showDots = true;
    await settle(el);
    expect(root(el).querySelectorAll('circle.dot').length).to.equal(8);
  });

  it('shows active dots for the focused category', async () => {
    const el = await mount<ChartLine>(
      html`<wc-chart-line
        disable-animation
        category-key="month"
        .config=${config}
        .data=${data}
      ></wc-chart-line>`,
    );
    await press(el, 'ArrowRight');
    expect(root(el).querySelectorAll('.active-layer circle').length).to.equal(
      2,
    );
    expect(root(el).querySelector('.cursor.is-visible')).to.not.equal(null);
  });

  it('infers series from numeric fields when config is empty', async () => {
    const el = await mount<ChartLine>(
      html`<wc-chart-line
        disable-animation
        category-key="month"
        .data=${data}
      ></wc-chart-line>`,
    );
    expect(root(el).querySelectorAll('path.line').length).to.equal(2);
  });
});

describe('wc-chart-area', () => {
  it('fills each series with a gradient', async () => {
    const el = await mount<ChartArea>(
      html`<wc-chart-area
        disable-animation
        category-key="month"
        .config=${config}
        .data=${data}
      ></wc-chart-area>`,
    );
    expect(root(el).querySelectorAll('linearGradient').length).to.equal(2);
    const area = root(el).querySelector('path.area') as SVGPathElement;
    expect(area.style.fill).to.contain('url(');
  });

  it('stacks series so the top line shows the total', async () => {
    const el = await mount<ChartArea>(
      html`<wc-chart-area
        disable-animation
        stacked
        category-key="month"
        .config=${config}
        .data=${data}
      ></wc-chart-area>`,
    );
    await press(el, 'ArrowRight');
    await press(el, 'ArrowRight');
    const dots = [
      ...root(el).querySelectorAll<SVGCircleElement>('.active-layer circle'),
    ];
    const [desktop, mobile] = dots.map(d => Number(d.getAttribute('cy')));
    // Mobile is stacked on desktop, so it sits higher.
    expect(mobile).to.be.lessThan(desktop);
  });
});

describe('wc-chart-pie', () => {
  it('draws a slice per item and always shows the legend', async () => {
    const el = await mount<ChartPie>(
      html`<wc-chart-pie disable-animation .data=${slices}></wc-chart-pie>`,
    );
    expect(root(el).querySelectorAll('path.slice').length).to.equal(3);
    expect(root(el).querySelectorAll('.legend-item').length).to.equal(3);
  });

  it('prints percentages when show-labels is set', async () => {
    const el = await mount<ChartPie>(
      html`<wc-chart-pie
        disable-animation
        show-labels
        .data=${slices}
      ></wc-chart-pie>`,
    );
    const labels = [...root(el).querySelectorAll('.slice-label')].map(
      t => t.textContent,
    );
    expect(labels.length).to.equal(3);
    expect(labels[0]).to.contain('45.8');
  });

  it('hides the legend with legend="hide"', async () => {
    const el = await mount<ChartPie>(
      html`<wc-chart-pie
        disable-animation
        legend="hide"
        .data=${slices}
      ></wc-chart-pie>`,
    );
    expect(root(el).querySelector('.legend')).to.equal(null);
  });

  it('has no inner-radius: a pie has no hole', async () => {
    const el = await mount<ChartPie>(
      html`<wc-chart-pie disable-animation .data=${slices}></wc-chart-pie>`,
    );
    expect('innerRadius' in el).to.equal(false);
  });

  it('shows value and share in the tooltip', async () => {
    const el = await mount<ChartPie>(
      html`<wc-chart-pie disable-animation .data=${slices}></wc-chart-pie>`,
    );
    await press(el, 'ArrowRight');
    expect(root(el).querySelector('.tooltip-label')?.textContent).to.equal(
      'Chrome',
    );
    expect(root(el).querySelector('.tooltip-value')?.textContent).to.contain(
      '275',
    );
  });
});

describe('wc-chart-doughnut', () => {
  it('shows the total in the centre and the focused slice on keyboard focus', async () => {
    const el = await mount<ChartDoughnut>(
      html`<wc-chart-doughnut
        disable-animation
        center-label="Visitors"
        .data=${slices}
      ></wc-chart-doughnut>`,
    );
    expect(root(el).querySelector('.center-value')?.textContent).to.equal(
      '600',
    );
    expect(root(el).querySelector('.center-label')?.textContent).to.equal(
      'Visitors',
    );
    await press(el, 'ArrowRight');
    expect(root(el).querySelector('.center-value')?.textContent).to.equal(
      '275',
    );
    expect(root(el).querySelector('.center-label')?.textContent).to.equal(
      'Chrome',
    );
  });

  it('owns inner-radius and drops the centre at 0', async () => {
    const el = await mount<ChartDoughnut>(
      html`<wc-chart-doughnut
        disable-animation
        inner-radius="0.5"
        .data=${slices}
      ></wc-chart-doughnut>`,
    );
    expect(el.innerRadius).to.equal(0.5);
    expect(root(el).querySelector('.center')).to.not.equal(null);
    el.innerRadius = 0;
    await settle(el);
    expect(root(el).querySelector('.center')).to.equal(null);
  });

  it('drops a hidden slice from the total', async () => {
    const el = await mount<ChartDoughnut>(
      html`<wc-chart-doughnut
        disable-animation
        .data=${slices}
      ></wc-chart-doughnut>`,
    );
    root(el).querySelectorAll<HTMLButtonElement>('.legend-item')[0].click();
    await settle(el);
    expect(root(el).querySelector('.center-value')?.textContent).to.equal(
      '325',
    );
  });
});

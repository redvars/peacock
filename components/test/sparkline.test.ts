/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync } from '@open-wc/testing';
import { Sparkline } from '../src/sparkline/index.js';

if (!customElements.get('wc-sparkline')) {
  customElements.define('wc-sparkline', Sparkline);
}

async function sparkline(template: ReturnType<typeof html>) {
  const el = fixtureSync<Sparkline>(template);
  await el.updateComplete;
  return el;
}

function image(el: Sparkline) {
  return el.shadowRoot!.querySelector<HTMLElement>('[role="img"]')!;
}

function linePath(el: Sparkline) {
  return el.shadowRoot!.querySelector('path.line')?.getAttribute('d') ?? null;
}

describe('wc-sparkline', () => {
  it('is an image named by its label and a summary', async () => {
    const el = await sparkline(
      html`<wc-sparkline
        lang="en-US"
        label="Signups"
        .data=${[12, 9, 21, 18]}
      ></wc-sparkline>`,
    );
    expect(image(el).getAttribute('aria-label')).to.equal(
      'Signups, Trend from 12 to 18, high 21, low 9',
    );
  });

  it('reads the data attribute as JSON', async () => {
    const el = await sparkline(
      html`<wc-sparkline data="[1, 2, 3]"></wc-sparkline>`,
    );
    expect(el.data).to.deep.equal([1, 2, 3]);
    expect(linePath(el)).to.equal('M0,100L50,50L100,0');
  });

  it('formats the summary with format in the locale', async () => {
    const el = await sparkline(
      html`<wc-sparkline
        lang="de-DE"
        .format=${{ style: 'currency', currency: 'EUR' }}
        .data=${[1000, 2000]}
      ></wc-sparkline>`,
    );
    const label = image(el).getAttribute('aria-label')!;
    expect(label).to.contain('1.000,00');
    expect(label).to.contain('€');
  });

  it('stretches an SVG that keeps its stroke width', async () => {
    const el = await sparkline(
      html`<wc-sparkline .data=${[1, 3, 2]}></wc-sparkline>`,
    );
    const svg = el.shadowRoot!.querySelector('svg')!;
    expect(svg.getAttribute('preserveAspectRatio')).to.equal('none');
    expect(svg.getAttribute('aria-hidden')).to.equal('true');
    const path = el.shadowRoot!.querySelector('path.line')!;
    expect(getComputedStyle(path).vectorEffect).to.equal('non-scaling-stroke');
  });

  it('fills a default box of 6rem by 1.5rem', async () => {
    const el = await sparkline(
      html`<wc-sparkline .data=${[1, 2]}></wc-sparkline>`,
    );
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    const box = el.getBoundingClientRect();
    expect(box.width).to.equal(6 * rem);
    expect(box.height).to.equal(1.5 * rem);
  });

  it('draws a flat series across the middle', async () => {
    const el = await sparkline(
      html`<wc-sparkline .data=${[5, 5, 5]}></wc-sparkline>`,
    );
    expect(linePath(el)).to.equal('M0,50L50,50L100,50');
    expect(image(el).getAttribute('aria-label')).to.equal(
      'Trend from 5 to 5, high 5, low 5',
    );
  });

  it('draws a single value as a flat line', async () => {
    const el = await sparkline(
      html`<wc-sparkline .data=${[7]}></wc-sparkline>`,
    );
    expect(linePath(el)).to.equal('M0,50L100,50');
    expect(image(el).getAttribute('aria-label')).to.equal('Value 7');
  });

  it('draws nothing for empty data and says so', async () => {
    const el = await sparkline(
      html`<wc-sparkline label="Signups" .data=${[]}></wc-sparkline>`,
    );
    expect(el.shadowRoot!.querySelector('svg')).to.equal(null);
    expect(image(el).getAttribute('aria-label')).to.equal('Signups, No data');
  });

  it('skips values that are not finite numbers', async () => {
    const el = await sparkline(
      html`<wc-sparkline .data=${[1, Number.NaN, 3]}></wc-sparkline>`,
    );
    expect(linePath(el)).to.equal('M0,100L100,0');
  });

  it('fills the area under the line for type="area"', async () => {
    const el = await sparkline(
      html`<wc-sparkline type="area" .data=${[0, 10]}></wc-sparkline>`,
    );
    const area = el.shadowRoot!.querySelector('path.area')!;
    expect(area.getAttribute('d')).to.equal('M0,100L100,0L100,100L0,100Z');
  });

  it('draws bars from zero for type="bar"', async () => {
    const el = await sparkline(
      html`<wc-sparkline type="bar" .data=${[5, 10, -5]}></wc-sparkline>`,
    );
    const bars = Array.from(el.shadowRoot!.querySelectorAll('rect.bar'));
    expect(bars).to.have.length(3);
    // Range -5..10: zero sits a third of the way up.
    const heights = bars.map(bar => Number(bar.getAttribute('height')));
    expect(heights[0]).to.be.closeTo(100 / 3, 0.001);
    expect(heights[1]).to.be.closeTo(200 / 3, 0.001);
    expect(heights[2]).to.be.closeTo(100 / 3, 0.001);
    expect(Number(bars[2].getAttribute('y'))).to.be.closeTo(200 / 3, 0.001);
  });

  it('highlights the last point with a dot', async () => {
    const el = await sparkline(
      html`<wc-sparkline highlight-last .data=${[1, 2]}></wc-sparkline>`,
    );
    const dot = el.shadowRoot!.querySelector<HTMLElement>('.dot')!;
    expect(dot).to.exist;
    expect(dot.style.insetInlineStart).to.equal('100%');
    expect(dot.style.insetBlockStart).to.equal('0%');
  });

  it('highlights the last bar', async () => {
    const el = await sparkline(
      html`<wc-sparkline
        type="bar"
        highlight-last
        .data=${[1, 2]}
      ></wc-sparkline>`,
    );
    const bars = el.shadowRoot!.querySelectorAll('rect.bar');
    expect(getComputedStyle(bars[0]).fillOpacity).to.equal('0.4');
    expect(getComputedStyle(bars[1]).fillOpacity).to.equal('1');
  });

  it('colors the line with --sparkline-color', async () => {
    const el = await sparkline(
      html`<wc-sparkline
        style="--sparkline-color: rgb(1, 2, 3)"
        .data=${[1, 2]}
      ></wc-sparkline>`,
    );
    const path = el.shadowRoot!.querySelector('path.line')!;
    expect(getComputedStyle(path).stroke).to.equal('rgb(1, 2, 3)');
  });

  it('mirrors the chart in right-to-left layouts', async () => {
    const wrapper = fixtureSync<HTMLDivElement>(
      html`<div dir="rtl">
        <wc-sparkline highlight-last .data=${[1, 2]}></wc-sparkline>
      </div>`,
    );
    const el = wrapper.querySelector<Sparkline>('wc-sparkline')!;
    await el.updateComplete;
    const svg = el.shadowRoot!.querySelector('svg')!;
    expect(getComputedStyle(svg).transform).to.equal(
      'matrix(-1, 0, 0, 1, 0, 0)',
    );
    // The last point sits at the inline end, which is the left edge.
    const dot = el.shadowRoot!.querySelector('.dot')!.getBoundingClientRect();
    const box = el.getBoundingClientRect();
    expect(dot.left + dot.width / 2).to.be.closeTo(box.left, 1);
  });

  it('re-renders when data changes', async () => {
    const el = await sparkline(
      html`<wc-sparkline .data=${[1, 2]}></wc-sparkline>`,
    );
    el.data = [3, 1];
    await el.updateComplete;
    expect(linePath(el)).to.equal('M0,0L100,100');
    expect(image(el).getAttribute('aria-label')).to.equal(
      'Trend from 3 to 1, high 3, low 1',
    );
  });
});

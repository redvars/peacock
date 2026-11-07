/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync, waitUntil } from '@open-wc/testing';
import { Stack, lengthToPixels } from '../src/stack/stack.js';

if (!customElements.get('wc-stack')) {
  customElements.define('wc-stack', Stack);
}

async function render(template: ReturnType<typeof html>) {
  const wrapper = fixtureSync<HTMLDivElement>(
    html`<div style="--spacing-200: 16px; --spacing-100: 8px; width: 600px">
      ${template}
    </div>`,
  );
  const el = wrapper.querySelector('wc-stack') as Stack;
  await el.updateComplete;
  return { wrapper, el };
}

describe('Stack', () => {
  it('is a vertical flex container by default, with its children as flex items', async () => {
    const { el } = await render(
      html`<wc-stack><span>A</span><span>B</span></wc-stack>`,
    );
    const style = getComputedStyle(el);
    expect(style.display).to.equal('flex');
    expect(style.flexDirection).to.equal('column');
    const [a, b] = Array.from(el.children) as HTMLElement[];
    // Spans are flex items, so they are blockified and stack.
    expect(getComputedStyle(a).display).to.equal('block');
    expect(b.getBoundingClientRect().top).to.be.greaterThan(
      a.getBoundingClientRect().top,
    );
  });

  it('lays out a row when horizontal', async () => {
    const { el } = await render(
      html`<wc-stack direction="horizontal"><span>A</span></wc-stack>`,
    );
    expect(getComputedStyle(el).flexDirection).to.equal('row');
  });

  it('maps gap to the spacing token of that step', async () => {
    const { el } = await render(html`<wc-stack gap="200"></wc-stack>`);
    expect(getComputedStyle(el).rowGap).to.equal('16px');
    el.gap = '100';
    await el.updateComplete;
    expect(getComputedStyle(el).rowGap).to.equal('8px');
  });

  it('sets align-items, justify-content and wrap', async () => {
    const { el } = await render(
      html`<wc-stack align="center" justify="space-between" wrap></wc-stack>`,
    );
    const style = getComputedStyle(el);
    expect(style.alignItems).to.equal('center');
    expect(style.justifyContent).to.equal('space-between');
    expect(style.flexWrap).to.equal('wrap');
  });

  it('collapses a horizontal stack narrower than collapse-below', async () => {
    const { wrapper, el } = await render(
      html`<wc-stack direction="horizontal" collapse-below="400"></wc-stack>`,
    );
    expect(el.collapsed).to.equal(false);
    expect(getComputedStyle(el).flexDirection).to.equal('row');

    wrapper.style.width = '300px';
    await waitUntil(() => el.collapsed, 'did not collapse');
    expect(getComputedStyle(el).flexDirection).to.equal('column');

    el.direction = 'vertical';
    await el.updateComplete;
    expect(el.collapsed).to.equal(false);
  });

  it('measures on connect when already narrow', async () => {
    const wrapper = fixtureSync<HTMLDivElement>(
      html`<div style="width: 200px">
        <wc-stack direction="horizontal" collapse-below="20rem"></wc-stack>
      </div>`,
    );
    const el = wrapper.querySelector('wc-stack') as Stack;
    await el.updateComplete;
    expect(el.collapsed).to.equal(true);
  });

  it('reads px, rem, em and bare numbers', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    expect(lengthToPixels('480', el)).to.equal(480);
    expect(lengthToPixels('480px', el)).to.equal(480);
    const rootSize = parseFloat(
      getComputedStyle(document.documentElement).fontSize,
    );
    expect(lengthToPixels('2rem', el)).to.equal(2 * rootSize);
    expect(lengthToPixels('wide', el)).to.equal(null);
    el.remove();
  });
});

/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync } from '@open-wc/testing';
import { ScrollArea } from '../src/scroll-area/index.js';

if (!customElements.get('wc-scroll-area')) {
  customElements.define('wc-scroll-area', ScrollArea);
}

async function setup(template: ReturnType<typeof html>) {
  const el = fixtureSync<ScrollArea>(template);
  await el.updateComplete;
  await el.updateComplete;
  return el;
}

function viewport(el: ScrollArea) {
  return el.shadowRoot!.querySelector<HTMLElement>('.viewport')!;
}

function visibleShadows(el: ScrollArea) {
  return Array.from(el.shadowRoot!.querySelectorAll('.shadow.visible')).map(
    shadow =>
      ['top', 'bottom', 'start', 'end'].find(edge =>
        shadow.classList.contains(edge),
      ),
  );
}

/** Scrolls the viewport and reports it, as background test pages may not fire `scroll`. */
async function scrollViewport(el: ScrollArea, top: number, left = 0) {
  const vp = viewport(el);
  vp.scrollTop = top;
  vp.scrollLeft = left;
  vp.dispatchEvent(new Event('scroll'));
  await el.updateComplete;
}

const tall = html`<div style="block-size: 600px">Long content</div>`;

describe('wc-scroll-area', () => {
  it('is focusable and a named region when its content overflows', async () => {
    const el = await setup(
      html`<wc-scroll-area label="Release notes" style="block-size: 100px"
        >${tall}</wc-scroll-area
      >`,
    );
    const vp = viewport(el);
    expect(el.scrollable).to.be.true;
    expect(vp.getAttribute('tabindex')).to.equal('0');
    expect(vp.getAttribute('role')).to.equal('region');
    expect(vp.getAttribute('aria-label')).to.equal('Release notes');
    expect(vp.clientHeight).to.equal(100);
    expect(vp.scrollHeight).to.be.greaterThan(500);
  });

  it('is not focusable when everything fits, and not a region without a label', async () => {
    const el = await setup(
      html`<wc-scroll-area style="block-size: 100px"
        ><p style="margin: 0">Short</p></wc-scroll-area
      >`,
    );
    const vp = viewport(el);
    expect(el.scrollable).to.be.false;
    expect(vp.hasAttribute('tabindex')).to.be.false;
    expect(vp.hasAttribute('role')).to.be.false;
    expect(visibleShadows(el)).to.deep.equal([]);
  });

  it('shows a shadow at each edge with more content beyond it', async () => {
    const el = await setup(
      html`<wc-scroll-area style="block-size: 100px">${tall}</wc-scroll-area>`,
    );
    expect(visibleShadows(el)).to.deep.equal(['bottom']);
    await scrollViewport(el, 200);
    expect(visibleShadows(el)).to.deep.equal(['top', 'bottom']);
    await scrollViewport(el, 10_000);
    expect(visibleShadows(el)).to.deep.equal(['top']);
  });

  it('works with max-block-size', async () => {
    const el = await setup(
      html`<wc-scroll-area style="max-block-size: 120px"
        >${tall}</wc-scroll-area
      >`,
    );
    expect(viewport(el).clientHeight).to.equal(120);
    expect(el.scrollable).to.be.true;
  });

  it('scrolls horizontally, with start and end shadows that mirror in RTL', async () => {
    const wide = html`<div style="display: flex; inline-size: 800px">
      Wide content
    </div>`;
    const el = await setup(
      html`<wc-scroll-area orientation="horizontal" style="inline-size: 200px"
        >${wide}</wc-scroll-area
      >`,
    );
    expect(getComputedStyle(viewport(el)).overflowX).to.equal('auto');
    expect(getComputedStyle(viewport(el)).overflowY).to.equal('hidden');
    expect(visibleShadows(el)).to.deep.equal(['end']);
    await scrollViewport(el, 0, 100);
    expect(visibleShadows(el)).to.deep.equal(['start', 'end']);

    const rtl = await setup(
      html`<div dir="rtl">
        <wc-scroll-area orientation="horizontal" style="inline-size: 200px"
          >${wide}</wc-scroll-area
        >
      </div>`,
    );
    const area = rtl.querySelector('wc-scroll-area') as ScrollArea;
    await area.updateComplete;
    expect(visibleShadows(area)).to.deep.equal(['end']);
    await scrollViewport(area, 0, -100);
    expect(visibleShadows(area)).to.deep.equal(['start', 'end']);
  });

  it('ignores the axis it does not scroll in', async () => {
    const el = await setup(
      html`<wc-scroll-area style="block-size: 100px; inline-size: 100px"
        ><div style="block-size: 50px; inline-size: 400px">
          x
        </div></wc-scroll-area
      >`,
    );
    expect(el.scrollable).to.be.false;
    el.orientation = 'both';
    await el.updateComplete;
    await el.updateComplete;
    expect(el.scrollable).to.be.true;
    expect(visibleShadows(el)).to.deep.equal(['end']);
  });

  it('scrolls the content through scrollTo and scrollBy and fires scroll', async () => {
    const el = await setup(
      html`<wc-scroll-area style="block-size: 100px">${tall}</wc-scroll-area>`,
    );
    let scrolls = 0;
    el.addEventListener('scroll', () => {
      scrolls += 1;
    });
    el.scrollTo({ top: 150 });
    expect(viewport(el).scrollTop).to.equal(150);
    el.scrollBy(0, 50);
    expect(viewport(el).scrollTop).to.equal(200);
    viewport(el).dispatchEvent(new Event('scroll'));
    expect(scrolls).to.equal(1);
  });
});

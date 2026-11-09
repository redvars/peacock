/// <reference types="mocha" />
import { html, type TemplateResult } from 'lit';
import { expect, fixture, oneEvent, waitUntil } from '@open-wc/testing';
import { Carousel } from '../src/carousel/index.js';
import type { CarouselChangeDetail } from '../src/carousel/index.js';
import { IconButton } from '../src/button/icon-button/icon-button.js';

if (!customElements.get('wc-carousel')) {
  customElements.define('wc-carousel', Carousel);
}
if (!customElements.get('wc-icon-button')) {
  customElements.define('wc-icon-button', IconButton);
}

function part<T extends Element = HTMLElement>(el: Carousel, selector: string) {
  return el.shadowRoot!.querySelector<T>(selector);
}

function parts<T extends Element = HTMLElement>(
  el: Carousel,
  selector: string,
) {
  return Array.from(el.shadowRoot!.querySelectorAll<T>(selector));
}

function slides(count: number) {
  return Array.from(
    { length: count },
    (_, i) => html`<div style="height: 80px">Slide ${i + 1}</div>`,
  );
}

/** Renders the carousel in a container of the given width, and waits for it to measure. */
async function carousel(template: TemplateResult, width = 800) {
  const wrapper = await fixture<HTMLDivElement>(
    html`<div style="width: ${width}px">${template}</div>`,
  );
  const el = wrapper.querySelector('wc-carousel') as Carousel;
  await new Promise(resolve => {
    requestAnimationFrame(resolve);
  });
  await el.updateComplete;
  return el;
}

function slideElements(el: Carousel) {
  return Array.from(el.children) as HTMLElement[];
}

describe('Carousel', () => {
  it('is a named carousel region of named slides', async () => {
    const el = await carousel(
      html`<wc-carousel label="Testimonials">
        <div>One</div>
        <div aria-label="The workspace">Two</div>
        <div>Three</div>
      </wc-carousel>`,
    );
    const region = part(el, '[part="base"]')!;
    expect(region.getAttribute('role')).to.equal('region');
    expect(region.getAttribute('aria-roledescription')).to.equal('carousel');
    expect(region.getAttribute('aria-label')).to.equal('Testimonials');
    const [one, two, three] = slideElements(el);
    expect(one.getAttribute('role')).to.equal('group');
    expect(one.getAttribute('aria-roledescription')).to.equal('slide');
    expect(one.getAttribute('aria-label')).to.equal('1 of 3');
    expect(two.getAttribute('aria-label')).to.equal('The workspace');
    expect(three.getAttribute('aria-label')).to.equal('3 of 3');
  });

  it('makes slides out of view inert', async () => {
    const el = await carousel(
      html`<wc-carousel label="Shots">${slides(3)}</wc-carousel>`,
    );
    expect(slideElements(el).map(slide => slide.inert)).to.deep.equal([
      false,
      true,
      true,
    ]);
    el.index = 2;
    await el.updateComplete;
    expect(slideElements(el).map(slide => slide.inert)).to.deep.equal([
      true,
      true,
      false,
    ]);
  });

  it('moves with next and previous and fires change', async () => {
    const el = await carousel(
      html`<wc-carousel label="Shots">${slides(3)}</wc-carousel>`,
    );
    const previous = part<IconButton>(el, '.previous')!;
    expect(previous.softDisabled).to.be.true;
    setTimeout(() => part<IconButton>(el, '.next')!.click());
    const event = await oneEvent(el, 'change');
    expect((event as CustomEvent<CarouselChangeDetail>).detail.index).to.equal(
      1,
    );
    await el.updateComplete;
    expect(el.index).to.equal(1);
    expect(previous.softDisabled).to.be.false;
    el.previous();
    await el.updateComplete;
    expect(el.index).to.equal(0);
  });

  it('stops at the ends without loop and wraps with it', async () => {
    const el = await carousel(
      html`<wc-carousel label="Shots">${slides(3)}</wc-carousel>`,
    );
    el.previous();
    await el.updateComplete;
    expect(el.index).to.equal(0);
    el.loop = true;
    el.previous();
    await el.updateComplete;
    expect(el.index).to.equal(2);
    el.next();
    await el.updateComplete;
    expect(el.index).to.equal(0);
  });

  it('has a picker per page that shows the current one', async () => {
    const el = await carousel(
      html`<wc-carousel label="Shots">${slides(4)}</wc-carousel>`,
    );
    const pickers = parts<HTMLButtonElement>(el, '.picker');
    expect(pickers).to.have.length(4);
    expect(pickers[0].getAttribute('aria-current')).to.equal('true');
    expect(pickers[2].getAttribute('aria-label')).to.equal('Slide 3 of 4');
    pickers[2].click();
    await el.updateComplete;
    expect(el.index).to.equal(2);
    expect(
      parts(el, '.picker').map(p => p.getAttribute('aria-current')),
    ).to.deep.equal([null, null, 'true', null]);
  });

  it('pages several slides at a time with per-view', async () => {
    const el = await carousel(
      html`<wc-carousel label="Quotes" per-view="3">${slides(7)}</wc-carousel>`,
    );
    const pickers = parts(el, '.picker');
    expect(pickers.map(p => p.getAttribute('aria-label'))).to.deep.equal([
      'Slides 1 to 3 of 7',
      'Slides 4 to 6 of 7',
      'Slides 5 to 7 of 7',
    ]);
    expect(slideElements(el).filter(slide => !slide.inert)).to.have.length(3);
    el.next();
    await el.updateComplete;
    expect(el.index).to.equal(3);
    el.next();
    await el.updateComplete;
    expect(el.index).to.equal(4);
  });

  it('shows fewer slides when it is too narrow for per-view', async () => {
    const el = await carousel(
      html`<wc-carousel label="Quotes" per-view="3">${slides(3)}</wc-carousel>`,
      300,
    );
    expect(slideElements(el).filter(slide => !slide.inert)).to.have.length(1);
    expect(parts(el, '.picker')).to.have.length(3);
  });

  it('hides the controls when every slide fits', async () => {
    const el = await carousel(
      html`<wc-carousel label="Quotes" per-view="3">${slides(3)}</wc-carousel>`,
    );
    expect(part(el, '.controls')).to.be.null;
  });

  it('shows a counter instead of pickers with many pages', async () => {
    const el = await carousel(
      html`<wc-carousel label="Shots">${slides(9)}</wc-carousel>`,
    );
    expect(parts(el, '.picker')).to.have.length(0);
    expect(part(el, '.counter')!.textContent!.trim()).to.equal('1 of 9');
  });

  it('follows the person scrolling the track', async () => {
    const el = await carousel(
      html`<wc-carousel label="Shots">${slides(3)}</wc-carousel>`,
    );
    const track = part(el, '.track')!;
    setTimeout(() => {
      track.scrollLeft = track.scrollWidth;
    });
    const event = await oneEvent(el, 'change');
    expect((event as CustomEvent<CarouselChangeDetail>).detail.index).to.equal(
      2,
    );
    expect(el.index).to.equal(2);
  });

  describe('autoplay', () => {
    const original = window.matchMedia;
    let reduced = false;

    // The carousel reads reduced motion when it is created; the test browser may ask for it.
    beforeEach(() => {
      reduced = false;
      window.matchMedia = (media: string) =>
        media.includes('reduced-motion')
          ? ({
              matches: reduced,
              media,
              addEventListener() {},
              removeEventListener() {},
            } as unknown as MediaQueryList)
          : original.call(window, media);
    });

    afterEach(() => {
      window.matchMedia = original;
    });

    it('does not start when the person asks for reduced motion', async () => {
      reduced = true;
      const el = await carousel(
        html`<wc-carousel label="Shots" autoplay>${slides(3)}</wc-carousel>`,
      );
      expect(part(el, '.track')!.getAttribute('aria-live')).to.equal('polite');
      expect(part(el, '.rotation')!.getAttribute('aria-label')).to.equal(
        'Start slide rotation',
      );
    });

    it('moves on by itself, quiet while it rotates', async function rotates() {
      this.timeout(4000);
      const el = await carousel(
        html`<wc-carousel label="Shots" autoplay interval="1000"
          >${slides(3)}</wc-carousel
        >`,
      );
      expect(part(el, '.track')!.getAttribute('aria-live')).to.equal('off');
      expect(part(el, '.rotation')!.getAttribute('aria-label')).to.equal(
        'Stop slide rotation',
      );
      await waitUntil(() => el.index === 1, 'did not rotate', {
        timeout: 2500,
      });
    });

    it('pauses while focus is inside', async () => {
      const el = await carousel(
        html`<wc-carousel label="Shots" autoplay>${slides(3)}</wc-carousel>`,
      );
      part<IconButton>(el, '.next')!.focus();
      el.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      await el.updateComplete;
      expect(part(el, '.track')!.getAttribute('aria-live')).to.equal('polite');
    });

    it('stops for good when the person uses a control', async () => {
      const el = await carousel(
        html`<wc-carousel label="Shots" autoplay>${slides(3)}</wc-carousel>`,
      );
      part<IconButton>(el, '.next')!.click();
      await el.updateComplete;
      expect(part(el, '.rotation')!.getAttribute('aria-label')).to.equal(
        'Start slide rotation',
      );
      part<IconButton>(el, '.rotation')!.click();
      await el.updateComplete;
      expect(part(el, '.rotation')!.getAttribute('aria-label')).to.equal(
        'Stop slide rotation',
      );
    });

    it('has no rotation button without autoplay', async () => {
      const el = await carousel(
        html`<wc-carousel label="Shots">${slides(3)}</wc-carousel>`,
      );
      expect(part(el, '.rotation')).to.be.null;
    });
  });
});

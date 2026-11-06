/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, waitUntil } from '@open-wc/testing';
import { Image } from '../src/image/index.js';
import { Svg } from '../src/svg/index.js';
import { resetDeprecationWarnings } from '../src/__internal/utils/deprecate.js';

if (!customElements.get('wc-image')) {
  customElements.define('wc-image', Image);
}
if (!customElements.get('wc-svg')) {
  customElements.define('wc-svg', Svg);
}

const LIGHT =
  'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACwAAAAAAQABAAACAkQBADs=';
const DARK =
  'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';

function img(el: Image) {
  return el.shadowRoot?.querySelector<HTMLImageElement>('.image-wrapper img');
}

async function loaded(el: Image) {
  await waitUntil(() => img(el), 'image did not load');
  return img(el) as HTMLImageElement;
}

/**
 * Reports every observed element as visible at once. Background test tabs render no frames, so a
 * real IntersectionObserver may never fire when test files run in parallel.
 */
type ObserverCallback = ConstructorParameters<typeof IntersectionObserver>[0];

class VisibleIntersectionObserver {
  private callback: ObserverCallback;

  constructor(callback: ObserverCallback) {
    this.callback = callback;
  }

  observe(target: Element) {
    queueMicrotask(() =>
      this.callback(
        [{ isIntersecting: true, target } as IntersectionObserverEntry],
        this as unknown as IntersectionObserver,
      ),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  disconnect() {}
}

let realIntersectionObserver: typeof IntersectionObserver;

before(() => {
  realIntersectionObserver = window.IntersectionObserver;
  window.IntersectionObserver =
    VisibleIntersectionObserver as unknown as typeof IntersectionObserver;
});

after(() => {
  window.IntersectionObserver = realIntersectionObserver;
});

describe('Image', () => {
  let warnings: string[];
  let original: typeof console.warn;
  let theme: string | undefined;

  beforeEach(() => {
    resetDeprecationWarnings();
    warnings = [];
    original = console.warn;
    console.warn = (message: string) => {
      warnings.push(message);
    };
    theme = document.documentElement.dataset.theme;
  });

  afterEach(() => {
    console.warn = original;
    if (theme === undefined) delete document.documentElement.dataset.theme;
    else document.documentElement.dataset.theme = theme;
  });

  it('uses alt as the text alternative', async () => {
    const el = await fixture<Image>(
      html`<wc-image src=${LIGHT} alt="A lake"></wc-image>`,
    );
    expect((await loaded(el)).alt).to.equal('A lake');
    expect(warnings).to.have.length(0);
  });

  it('keeps the deprecated image-title working, with a warning', async () => {
    const el = await fixture<Image>(
      html`<wc-image src=${LIGHT} image-title="A lake"></wc-image>`,
    );
    expect((await loaded(el)).alt).to.equal('A lake');
    expect(warnings).to.have.length(1);
    expect(warnings[0]).to.contain('wc-image');
    expect(warnings[0]).to.contain('`alt`');
  });

  it('switches to dark-src when data-theme changes', async () => {
    document.documentElement.dataset.theme = 'light';
    const el = await fixture<Image>(
      html`<wc-image src=${LIGHT} dark-src=${DARK} alt="Logo"></wc-image>`,
    );
    expect((await loaded(el)).getAttribute('src')).to.equal(LIGHT);

    document.documentElement.dataset.theme = 'dark';
    await waitUntil(
      () => img(el)?.getAttribute('src') === DARK,
      'image did not switch to dark-src',
    );

    document.documentElement.dataset.theme = 'light';
    await waitUntil(
      () => img(el)?.getAttribute('src') === LIGHT,
      'image did not switch back to src',
    );
  });
});

describe('Svg', () => {
  let warnings: string[];
  let original: typeof console.warn;

  beforeEach(() => {
    resetDeprecationWarnings();
    warnings = [];
    original = console.warn;
    console.warn = (message: string) => {
      warnings.push(message);
    };
  });

  afterEach(() => {
    console.warn = original;
  });

  it('names the preview dialog from alt and labels the close button', async () => {
    const el = await fixture<Svg>(html`<wc-svg alt="Bug icon"></wc-svg>`);
    const dialog = el.shadowRoot?.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-label')).to.contain('Bug icon');
    const close = el.shadowRoot?.querySelector('.preview-close');
    expect(close?.getAttribute('aria-label')).to.be.a('string').and.not.empty;
    expect(warnings).to.have.length(0);
  });

  it('keeps the deprecated image-title working, with a warning', async () => {
    const el = await fixture<Svg>(
      html`<wc-svg image-title="Bug icon"></wc-svg>`,
    );
    const dialog = el.shadowRoot?.querySelector('[role="dialog"]');
    expect(dialog?.getAttribute('aria-label')).to.contain('Bug icon');
    expect(warnings).to.have.length(1);
    expect(warnings[0]).to.contain('wc-svg');
  });
});

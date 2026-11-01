/// <reference types="mocha" />
/* eslint-disable max-classes-per-file */
import { html, LitElement } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { LoaderConfig, LoaderUtils } from '../src/LoaderUtils.js';

/** A module, as a blob URL, whose default export is a new element class, as a lazy component's. */
function lazyModule(): string {
  return URL.createObjectURL(
    new Blob(['export default class extends HTMLElement {}'], {
      type: 'text/javascript',
    }),
  );
}

const LAZY = [
  'test-lazy-in-document',
  'test-lazy-in-shadow',
  'test-lazy-nested',
  'test-lazy-closed',
  'test-lazy-early',
  'test-lazy-parent',
  'test-lazy-dependency',
];

class ShadowHost extends LitElement {
  render() {
    return html`<test-lazy-in-shadow></test-lazy-in-shadow>`;
  }
}
customElements.define('test-shadow-host', ShadowHost);

class InnerHost extends LitElement {
  render() {
    return html`<test-lazy-nested></test-lazy-nested>`;
  }
}
customElements.define('test-inner-host', InnerHost);

class OuterHost extends LitElement {
  render() {
    return html`<test-inner-host></test-inner-host>`;
  }
}
customElements.define('test-outer-host', OuterHost);

/** Resolves once `tag` is defined and `element` is upgraded to it. */
async function upgraded(element: Element | null | undefined, tag: string) {
  const ElementClass = await customElements.whenDefined(tag);
  expect(element).to.be.instanceOf(ElementClass);
}

describe('LoaderUtils', () => {
  let early: HTMLElement;

  before(() => {
    // A shadow root attached before the loader starts.
    early = document.createElement('div');
    early.attachShadow({ mode: 'open' }).innerHTML =
      '<test-lazy-early></test-lazy-early>';
    document.body.append(early);

    const components: NonNullable<LoaderConfig['components']> =
      Object.fromEntries(LAZY.map(tag => [tag, { importPath: lazyModule() }]));
    components['test-lazy-parent'].dependencies = ['test-lazy-dependency'];
    new LoaderUtils({ components }).start();
  });

  after(() => early.remove());

  it('loads a lazy component added to the document', async () => {
    const el = await fixture(
      html`<test-lazy-in-document></test-lazy-in-document>`,
    );
    await upgraded(el, 'test-lazy-in-document');
  });

  it('loads a lazy component a component renders in its shadow root', async () => {
    const host = await fixture<ShadowHost>(
      html`<test-shadow-host></test-shadow-host>`,
    );
    await upgraded(
      host.shadowRoot?.querySelector('test-lazy-in-shadow'),
      'test-lazy-in-shadow',
    );
  });

  it('loads a lazy component in a nested shadow root', async () => {
    const outer = await fixture<OuterHost>(
      html`<test-outer-host></test-outer-host>`,
    );
    const inner = outer.shadowRoot?.querySelector('test-inner-host');
    await (inner as InnerHost).updateComplete;
    await upgraded(
      inner?.shadowRoot?.querySelector('test-lazy-nested'),
      'test-lazy-nested',
    );
  });

  it('loads a lazy component in a closed shadow root', async () => {
    const host = document.createElement('div');
    // eslint-disable-next-line wc/no-closed-shadow-root
    const shadowRoot = host.attachShadow({ mode: 'closed' });
    document.body.append(host);
    const el = document.createElement('test-lazy-closed');
    shadowRoot.append(el);
    try {
      await upgraded(el, 'test-lazy-closed');
    } finally {
      host.remove();
    }
  });

  it('loads a lazy component in a shadow root attached before it started', async () => {
    await upgraded(
      early.shadowRoot?.querySelector('test-lazy-early'),
      'test-lazy-early',
    );
  });

  it("loads a lazy component's dependencies with it", async () => {
    await fixture(html`<test-lazy-parent></test-lazy-parent>`);
    await customElements.whenDefined('test-lazy-dependency');
    expect(customElements.get('test-lazy-dependency')).to.exist;
  });
});

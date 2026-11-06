/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Link } from '../src/link/link.js';
import { Breadcrumb, BreadcrumbItem } from '../src/breadcrumb/index.js';

for (const [tag, element] of [
  ['wc-link', Link],
  ['wc-breadcrumb', Breadcrumb],
  ['wc-breadcrumb-item', BreadcrumbItem],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

describe('Link', () => {
  it('passes rel and download values to the anchor', async () => {
    const el = await fixture<Link>(
      html`<wc-link href="/a.pdf" rel="noopener" download="a.pdf"
        >PDF</wc-link
      >`,
    );
    const a = el.shadowRoot!.querySelector('a')!;
    expect(a.getAttribute('rel')).to.equal('noopener');
    expect(a.getAttribute('download')).to.equal('a.pdf');
  });

  it('omits rel and download when they are not set', async () => {
    const el = await fixture<Link>(html`<wc-link href="/a">A</wc-link>`);
    const a = el.shadowRoot!.querySelector('a')!;
    expect(a.hasAttribute('rel')).to.be.false;
    expect(a.hasAttribute('download')).to.be.false;
    expect(a.hasAttribute('tabindex')).to.be.false;
  });
});

describe('BreadcrumbItem', () => {
  it('numbers its position among sibling items', async () => {
    const el = await fixture<HTMLElement>(html`
      <wc-breadcrumb>
        <wc-breadcrumb-item href="/">Home</wc-breadcrumb-item>
        <wc-breadcrumb-item href="/docs">Docs</wc-breadcrumb-item>
      </wc-breadcrumb>
    `);
    const second = el.querySelectorAll<BreadcrumbItem>('wc-breadcrumb-item')[1];
    await second.updateComplete;
    expect(
      second
        .shadowRoot!.querySelector('meta[itemprop="position"]')!
        .getAttribute('content'),
    ).to.equal('2');
  });

  it('sets rel="noopener noreferrer" on links that open a new tab', async () => {
    const el = await fixture<BreadcrumbItem>(
      html`<wc-breadcrumb-item href="https://example.com" target="_blank"
        >Docs</wc-breadcrumb-item
      >`,
    );
    expect(el.shadowRoot!.querySelector('a')!.getAttribute('rel')).to.equal(
      'noopener noreferrer',
    );
  });
});

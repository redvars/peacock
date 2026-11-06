/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Link } from '../src/link/link.js';
import { Breadcrumb, BreadcrumbItem } from '../src/breadcrumb/index.js';
import { resetDeprecationWarnings } from '../src/__internal/utils/deprecate.js';

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

  it('makes each item host a listitem of the list in the breadcrumb', async () => {
    const el = await fixture<Breadcrumb>(html`
      <wc-breadcrumb>
        <wc-breadcrumb-item href="/">Home</wc-breadcrumb-item>
        <wc-breadcrumb-item current>Docs</wc-breadcrumb-item>
      </wc-breadcrumb>
    `);
    const items = el.querySelectorAll<BreadcrumbItem>('wc-breadcrumb-item');
    await items[1].updateComplete;

    const ol = el.shadowRoot!.querySelector('nav ol')!;
    expect(ol.getAttribute('itemtype')).to.equal(
      'https://schema.org/BreadcrumbList',
    );
    for (const item of items) {
      expect(item.getAttribute('role')).to.equal('listitem');
      expect(item.shadowRoot!.querySelector('li')).to.be.null;
      const listItem = item.shadowRoot!.querySelector(
        '[itemprop="itemListElement"]',
      )!;
      expect(listItem.getAttribute('itemtype')).to.equal(
        'https://schema.org/ListItem',
      );
    }
    expect(items[1].shadowRoot!.querySelector('[aria-current="page"]')).to.not
      .be.null;
    expect(items[0].shadowRoot!.querySelector('[aria-current]')).to.be.null;
  });

  it('maps the deprecated active to current and warns', async () => {
    resetDeprecationWarnings();
    const warnings: string[] = [];
    const original = console.warn;
    console.warn = (message: string) => {
      warnings.push(message);
    };
    try {
      const el = await fixture<BreadcrumbItem>(
        html`<wc-breadcrumb-item active>Docs</wc-breadcrumb-item>`,
      );
      expect(el.current).to.be.true;
      expect(el.shadowRoot!.querySelector('[aria-current="page"]')).to.not.be
        .null;
      expect(warnings).to.have.length(1);
      expect(warnings[0]).to.contain('wc-breadcrumb-item');
    } finally {
      console.warn = original;
    }
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

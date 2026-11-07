/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync } from '@open-wc/testing';
import { PageHeader } from '../src/page-header/index.js';

if (!customElements.get('wc-page-header')) {
  customElements.define('wc-page-header', PageHeader);
}

async function header(template: ReturnType<typeof html>) {
  const el = fixtureSync<PageHeader>(template);
  await el.updateComplete;
  await el.updateComplete;
  return el;
}

function part(el: PageHeader, selector: string) {
  return el.shadowRoot!.querySelector<HTMLElement>(selector);
}

describe('PageHeader', () => {
  it('renders the headline as an h1 by default', async () => {
    const el = await header(
      html`<wc-page-header headline="Invoices"></wc-page-header>`,
    );
    const heading = part(el, '.headline')!;
    expect(heading.localName).to.equal('h1');
    expect(heading.textContent).to.equal('Invoices');
  });

  it('takes the heading level from heading-level', async () => {
    const el = await header(
      html`<wc-page-header
        headline="Invoices"
        heading-level="3"
      ></wc-page-header>`,
    );
    expect(part(el, '.headline')!.localName).to.equal('h3');
    el.headingLevel = 2;
    await el.updateComplete;
    expect(part(el, '.headline')!.localName).to.equal('h2');
  });

  it('keeps out-of-range levels within h1–h6', async () => {
    const el = await header(
      html`<wc-page-header
        headline="Invoices"
        heading-level="9"
      ></wc-page-header>`,
    );
    expect(part(el, '.headline')!.localName).to.equal('h6');
  });

  it('renders the supporting text only when set', async () => {
    const el = await header(
      html`<wc-page-header headline="Invoices"></wc-page-header>`,
    );
    expect(part(el, '.supporting-text')).to.be.null;
    el.supportingText = 'All invoices this year';
    await el.updateComplete;
    expect(part(el, '.supporting-text')!.textContent!.trim()).to.equal(
      'All invoices this year',
    );
  });

  it('renders a back link only with back-href', async () => {
    const el = await header(
      html`<wc-page-header headline="Invoice 42"></wc-page-header>`,
    );
    expect(part(el, '.back')).to.be.null;
    el.backHref = '/invoices';
    await el.updateComplete;
    const back = part(el, '.back')!;
    expect(back.getAttribute('href')).to.equal('/invoices');
    expect(back.getAttribute('aria-label')).to.equal('Back');
    expect(back.getAttribute('shape')).to.equal('round');
    el.backLabel = 'All invoices';
    await el.updateComplete;
    expect(back.getAttribute('aria-label')).to.equal('All invoices');
  });

  it('places the back link before the title', async () => {
    const el = await header(
      html`<wc-page-header
        headline="Invoice 42"
        back-href="/"
      ></wc-page-header>`,
    );
    const row = part(el, '.title-row')!;
    expect(row.firstElementChild!.classList.contains('back')).to.be.true;
  });

  it('hides empty slot wrappers and shows filled ones', async () => {
    const el = await header(html`
      <wc-page-header headline="Invoices">
        <button slot="actions">New invoice</button>
      </wc-page-header>
    `);
    expect(part(el, '.actions')!.hidden).to.be.false;
    expect(part(el, '.breadcrumb')!.hidden).to.be.true;
    expect(part(el, '.meta')!.hidden).to.be.true;
    expect(part(el, '.tabs')!.hidden).to.be.true;

    const meta = document.createElement('span');
    meta.slot = 'meta';
    meta.textContent = 'Draft';
    el.append(meta);
    await new Promise(resolve => {
      setTimeout(resolve, 0);
    });
    await el.updateComplete;
    expect(part(el, '.meta')!.hidden).to.be.false;
  });

  it('removes the bottom padding when it has tabs', async () => {
    const el = await header(html`
      <wc-page-header headline="Project">
        <div slot="tabs">Tabs</div>
      </wc-page-header>
    `);
    expect(part(el, '.page-header')!.classList.contains('has-tabs')).to.be.true;
  });

  it('moves the actions onto their own row in narrow containers', async () => {
    const el = await header(html`
      <div style="width: 360px">
        <wc-page-header headline="Invoices">
          <button slot="actions">New invoice</button>
        </wc-page-header>
      </div>
    `);
    const pageHeader = el.querySelector('wc-page-header') as PageHeader;
    await pageHeader.updateComplete;
    const actions = part(pageHeader, '.actions')!;
    const titles = part(pageHeader, '.title-row')!;
    expect(actions.getBoundingClientRect().top).to.be.greaterThanOrEqual(
      titles.getBoundingClientRect().bottom,
    );
  });
});

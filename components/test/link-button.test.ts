/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { LinkButton } from '../src/button/link-button/link-button.js';

if (!customElements.get('wc-link-button')) {
  customElements.define('wc-link-button', LinkButton);
}

describe('LinkButton', () => {
  it('renders a native link with href, target, rel and download', async () => {
    const el = await fixture<LinkButton>(
      html`<wc-link-button
        href="/report.csv"
        target="_blank"
        rel="noopener noreferrer"
        download="report.csv"
        >Report</wc-link-button
      >`,
    );
    const link = el.shadowRoot!.querySelector('a')!;
    expect(link.id).to.equal('link');
    expect(link.getAttribute('href')).to.equal('/report.csv');
    expect(link.getAttribute('target')).to.equal('_blank');
    expect(link.getAttribute('rel')).to.equal('noopener noreferrer');
    expect(link.getAttribute('download')).to.equal('report.csv');
    expect(el.shadowRoot!.querySelector('button')).to.not.exist;
  });

  it('omits rel and download when unset', async () => {
    const el = await fixture<LinkButton>(
      html`<wc-link-button href="/docs">Docs</wc-link-button>`,
    );
    const link = el.shadowRoot!.querySelector('a')!;
    expect(link.hasAttribute('rel')).to.be.false;
    expect(link.hasAttribute('download')).to.be.false;
  });

  it('reflects the button defaults and resolves level', async () => {
    const el = await fixture<LinkButton>(
      html`<wc-link-button href="/docs">Docs</wc-link-button>`,
    );
    expect(el.getAttribute('size')).to.equal('sm');
    expect(el.getAttribute('variant')).to.equal('filled');
    expect(el.getAttribute('color')).to.equal('primary');

    el.level = 'secondary';
    await el.updateComplete;
    expect(el.getAttribute('variant')).to.equal('tonal');
    expect(el.getAttribute('color')).to.equal('surface');

    el.variant = 'outlined';
    await el.updateComplete;
    expect(el.getAttribute('variant')).to.equal('outlined');
  });

  it('marks a disabled link and stops its navigation', async () => {
    const el = await fixture<LinkButton>(
      html`<wc-link-button href="#nowhere" disabled>Docs</wc-link-button>`,
    );
    const link = el.shadowRoot!.querySelector('a')!;
    expect(link.getAttribute('aria-disabled')).to.equal('true');
    expect(link.getAttribute('tabindex')).to.equal('-1');

    let clicks = 0;
    el.addEventListener('click', () => {
      clicks += 1;
    });
    link.click();
    expect(clicks).to.equal(0);
  });
});

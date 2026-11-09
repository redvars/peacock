/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixture } from '@open-wc/testing';
import { SiteFooter, SiteFooterGroup } from '../src/site-footer/index.js';

if (!customElements.get('wc-site-footer')) {
  customElements.define('wc-site-footer', SiteFooter);
}
if (!customElements.get('wc-site-footer-group')) {
  customElements.define('wc-site-footer-group', SiteFooterGroup);
}

function part<T extends HTMLElement = HTMLElement>(
  el: HTMLElement,
  selector: string,
) {
  return el.shadowRoot!.querySelector<T>(selector);
}

describe('SiteFooter', () => {
  it('renders a contentinfo footer with every row', async () => {
    const el = await fixture<SiteFooter>(
      html`<wc-site-footer>
        <a slot="brand" href="/">Redvars</a>
        <wc-site-footer-group label="Product">
          <a href="#a">A</a>
        </wc-site-footer-group>
        <span slot="legal">© 2026</span>
        <a slot="social" href="#gh" aria-label="GitHub">GH</a>
      </wc-site-footer>`,
    );
    expect(part(el, 'footer')).to.exist;
    expect(part(el, '.top')!.hidden).to.be.false;
    expect(part(el, '.brand')!.hidden).to.be.false;
    expect(part(el, '.groups')!.hidden).to.be.false;
    expect(part(el, '.bottom')!.hidden).to.be.false;
    expect(part(el, 'footer')!.classList.contains('slim')).to.be.false;
  });

  it('is slim with only legal content', async () => {
    const el = await fixture<SiteFooter>(
      html`<wc-site-footer>
        <span slot="legal">© Acme</span>
        <a slot="legal" href="#privacy">Privacy</a>
      </wc-site-footer>`,
    );
    expect(part(el, '.top')!.hidden).to.be.true;
    expect(part(el, '.social')!.hidden).to.be.true;
    expect(part(el, 'footer')!.classList.contains('slim')).to.be.true;
  });

  it('hides the bottom row while legal and social are empty', async () => {
    const el = await fixture<SiteFooter>(
      html`<wc-site-footer>
        <wc-site-footer-group label="Product"
          ><a href="#a">A</a></wc-site-footer-group
        >
      </wc-site-footer>`,
    );
    expect(part(el, '.bottom')!.hidden).to.be.true;
    expect(part(el, '.brand')!.hidden).to.be.true;
  });

  it('shows rows as content arrives', async () => {
    const el = await fixture<SiteFooter>(
      html`<wc-site-footer></wc-site-footer>`,
    );
    expect(part(el, '.bottom')!.hidden).to.be.true;
    const legal = document.createElement('span');
    legal.slot = 'legal';
    legal.textContent = '© 2026';
    el.append(legal);
    await new Promise(resolve => {
      setTimeout(resolve, 0);
    });
    await el.updateComplete;
    expect(part(el, '.bottom')!.hidden).to.be.false;
  });
});

describe('SiteFooterGroup', () => {
  it('is a navigation landmark named by its label', async () => {
    const el = await fixture<SiteFooterGroup>(
      html`<wc-site-footer-group label="Company"
        ><a href="#about">About</a></wc-site-footer-group
      >`,
    );
    const nav = part(el, 'nav')!;
    expect(nav.getAttribute('aria-label')).to.equal('Company');
    const title = part(el, '.title')!;
    expect(title.textContent).to.equal('Company');
    expect(title.getAttribute('aria-hidden')).to.equal('true');
  });
});

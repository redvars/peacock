/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Icon } from '../src/icon/index.js';

if (!customElements.get('wc-icon')) {
  customElements.define('wc-icon', Icon);
}

describe('Icon', () => {
  it('reflects its name', async () => {
    const el = await fixture<Icon>(html`<wc-icon name="home"></wc-icon>`);
    expect(el.name).to.equal('home');
    expect(el.getAttribute('name')).to.equal('home');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<Icon>(html`<wc-icon name="home"></wc-icon>`);
    await expect(el).shadowDom.to.be.accessible();
  });

  it('is decorative by default', async () => {
    const el = await fixture<Icon>(html`<wc-icon name="home"></wc-icon>`);
    expect(el.getAttribute('aria-hidden')).to.equal('true');
    expect(el.hasAttribute('role')).to.equal(false);
    expect(el.hasAttribute('aria-label')).to.equal(false);
  });

  it('becomes a named image with a label', async () => {
    const el = await fixture<Icon>(
      html`<wc-icon name="warning" label="Warning"></wc-icon>`,
    );
    expect(el.getAttribute('role')).to.equal('img');
    expect(el.getAttribute('aria-label')).to.equal('Warning');
    expect(el.hasAttribute('aria-hidden')).to.equal(false);
  });

  it('switches between labelled and decorative when the label changes', async () => {
    const el = await fixture<Icon>(html`<wc-icon name="home"></wc-icon>`);
    el.label = 'Home';
    await el.updateComplete;
    expect(el.getAttribute('role')).to.equal('img');
    expect(el.getAttribute('aria-label')).to.equal('Home');
    expect(el.hasAttribute('aria-hidden')).to.equal(false);

    el.label = '';
    await el.updateComplete;
    expect(el.hasAttribute('role')).to.equal(false);
    expect(el.hasAttribute('aria-label')).to.equal(false);
    expect(el.getAttribute('aria-hidden')).to.equal('true');
  });

  it('does not hide an icon the consumer named with aria-label', async () => {
    const el = await fixture<Icon>(
      html`<wc-icon name="home" aria-label="Home"></wc-icon>`,
    );
    expect(el.hasAttribute('aria-hidden')).to.equal(false);
    expect(el.getAttribute('aria-label')).to.equal('Home');
  });
});

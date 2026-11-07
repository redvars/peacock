/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Tag } from '../src/chip/tag/tag.js';

if (!customElements.get('wc-tag')) {
  customElements.define('wc-tag', Tag);
}

function surface(el: Tag) {
  return el.shadowRoot!.querySelector('.tag')!;
}

describe('Tag', () => {
  it('is neutral by default', async () => {
    const el = await fixture<Tag>(html`<wc-tag>Draft</wc-tag>`);
    expect(el.getAttribute('variant')).to.equal('tonal');
    expect(surface(el).className).to.not.match(/intent-|accent-/);
  });

  it('styles an intent, which wins over an accent', async () => {
    const el = await fixture<Tag>(
      html`<wc-tag intent="danger" accent="blue">Failed</wc-tag>`,
    );
    expect(surface(el).classList.contains('intent-danger')).to.be.true;
    expect(surface(el).classList.contains('accent-blue')).to.be.false;
  });

  it('styles a decorative accent', async () => {
    const el = await fixture<Tag>(
      html`<wc-tag
        accent="purple"
        style="--color-purple-container: rgb(1, 2, 3)"
        >Design</wc-tag
      >`,
    );
    expect(el.getAttribute('accent')).to.equal('purple');
    expect(surface(el).classList.contains('accent-purple')).to.be.true;
    const background = el.shadowRoot!.querySelector('.background')!;
    expect(getComputedStyle(background).backgroundColor).to.equal(
      'rgb(1, 2, 3)',
    );
  });

  it('has no dismiss button', async () => {
    const el = await fixture<Tag>(html`<wc-tag>Tag</wc-tag>`);
    expect(el.shadowRoot!.querySelector('button')).to.be.null;
  });
});

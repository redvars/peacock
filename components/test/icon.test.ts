import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Icon } from '../src/index.js';
import '../src/p-icon.js';

describe('Icon', () => {
  it('has a default name as home', async () => {
    const el = await fixture<Icon>(html`<p-icon></p-icon>`);
    expect(el.name).to.equal('home');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<Icon>(html`<p-icon></p-icon>`);
    await expect(el).shadowDom.to.be.accessible();
  });
});

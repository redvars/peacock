/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync, oneEvent } from '@open-wc/testing';
import { Banner, bannerStorageKey } from '../src/banner/index.js';

if (!customElements.get('wc-banner'))
  customElements.define('wc-banner', Banner);

async function banner(template: ReturnType<typeof html>) {
  const el = fixtureSync<Banner>(template);
  await el.updateComplete;
  return el;
}

function part(el: Banner, selector: string) {
  return el.shadowRoot!.querySelector<HTMLElement>(selector);
}

describe('wc-banner', () => {
  afterEach(() => {
    window.localStorage.removeItem(bannerStorageKey('test-key'));
  });

  it('renders the headline, description and intent icon', async () => {
    const el = await banner(
      html`<wc-banner
        intent="warning"
        headline="Maintenance"
        description="Down tonight."
      ></wc-banner>`,
    );
    expect(part(el, '.banner')!.classList.contains('warning')).to.be.true;
    expect(part(el, '.headline')!.textContent).to.equal('Maintenance');
    expect(part(el, '.message')!.textContent).to.contain('Down tonight.');
    expect(part(el, '.icon wc-icon')!.getAttribute('name')).to.equal('warning');
    expect(part(el, '.icon')!.hidden).to.be.false;
  });

  it('is neutral and icon-less without an intent', async () => {
    const el = await banner(html`<wc-banner>Hello</wc-banner>`);
    expect(part(el, '.banner')!.classList.contains('neutral')).to.be.true;
    expect(part(el, '.icon')!.hidden).to.be.true;
    el.icon = 'campaign';
    await el.updateComplete;
    expect(part(el, '.icon')!.hidden).to.be.false;
  });

  it('is not a live region unless asked', async () => {
    const el = await banner(html`<wc-banner>Hi</wc-banner>`);
    expect(part(el, '.banner')!.hasAttribute('role')).to.be.false;
    el.live = 'polite';
    await el.updateComplete;
    expect(part(el, '.banner')!.getAttribute('role')).to.equal('status');
    el.live = 'assertive';
    await el.updateComplete;
    expect(part(el, '.banner')!.getAttribute('role')).to.equal('alert');
  });

  it('shows the action area only with slotted actions', async () => {
    const el = await banner(
      html`<wc-banner>Hi<button slot="action">Go</button></wc-banner>`,
    );
    await el.updateComplete;
    expect(part(el, '.actions')!.hidden).to.be.false;
  });

  it('fires close with reason action and hides', async () => {
    const el = await banner(html`<wc-banner dismissible>Hi</wc-banner>`);
    const close = part(el, '.close')!;
    expect(close.getAttribute('aria-label')).to.equal('Dismiss banner');
    setTimeout(() => close.click());
    const event = (await oneEvent(el, 'close')) as CustomEvent;
    expect(event.detail).to.deep.equal({ reason: 'action' });
    expect(event.bubbles && event.composed).to.be.true;
    expect(el.hidden).to.be.true;
  });

  it('stays when close is cancelled', async () => {
    const el = await banner(html`<wc-banner dismissible>Hi</wc-banner>`);
    el.addEventListener('close', e => e.preventDefault());
    part(el, '.close')!.click();
    expect(el.hidden).to.be.false;
  });

  it('remembers a dismissal under dismiss-key', async () => {
    const first = await banner(
      html`<wc-banner dismissible dismiss-key="test-key"></wc-banner>`,
    );
    expect(first.hidden).to.be.false;
    part(first, '.close')!.click();
    expect(window.localStorage.getItem(bannerStorageKey('test-key'))).to.be.a(
      'string',
    );
    const second = await banner(
      html`<wc-banner dismissible dismiss-key="test-key"></wc-banner>`,
    );
    expect(second.hidden).to.be.true;
  });

  it('still works when storage throws', async () => {
    const { getItem, setItem } = Storage.prototype;
    Storage.prototype.getItem = () => {
      throw new Error('blocked');
    };
    Storage.prototype.setItem = () => {
      throw new Error('blocked');
    };
    try {
      const el = await banner(
        html`<wc-banner dismissible dismiss-key="test-key"></wc-banner>`,
      );
      expect(el.hidden).to.be.false;
      part(el, '.close')!.click();
      expect(el.hidden).to.be.true;
    } finally {
      Storage.prototype.getItem = getItem;
      Storage.prototype.setItem = setItem;
    }
  });

  it('reflects sticky', async () => {
    const el = await banner(html`<wc-banner sticky>Hi</wc-banner>`);
    expect(getComputedStyle(el).position).to.equal('sticky');
  });
});

/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, waitUntil } from '@open-wc/testing';
import { Avatar } from '../src/avatar/avatar.js';

if (!customElements.get('wc-avatar')) {
  customElements.define('wc-avatar', Avatar);
}

describe('Avatar', () => {
  it('shows the initials of the first and last words, as a named image', async () => {
    const el = await fixture<Avatar>(
      html`<wc-avatar name="Grace Brewster Hopper"></wc-avatar>`,
    );
    const initials = el.shadowRoot!.querySelector('.avatar > .initials')!;
    expect(initials.textContent!.trim()).to.equal('GH');
    expect(initials.getAttribute('role')).to.equal('img');
    expect(initials.getAttribute('aria-label')).to.equal(
      'Grace Brewster Hopper',
    );
  });

  it('handles one word and extra spaces', async () => {
    const el = await fixture<Avatar>(
      html`<wc-avatar name="  ada  "></wc-avatar>`,
    );
    expect(el.initials).to.equal('A');
  });

  it('prefers label as the accessible name', async () => {
    const el = await fixture<Avatar>(
      html`<wc-avatar
        name="Ada Lovelace"
        label="Ada Lovelace, online"
      ></wc-avatar>`,
    );
    expect(
      el
        .shadowRoot!.querySelector('.avatar > .initials')!
        .getAttribute('aria-label'),
    ).to.equal('Ada Lovelace, online');
  });

  it('shows a decorative icon without a name', async () => {
    const el = await fixture<Avatar>(html`<wc-avatar></wc-avatar>`);
    const icon = el.shadowRoot!.querySelector('.fallback-icon')!;
    expect(icon).to.exist;
    expect(icon.getAttribute('aria-hidden')).to.equal('true');
  });

  it('falls back to initials, then the icon, when the image fails', async () => {
    const el = await fixture<Avatar>(
      html`<wc-avatar
        name="Ada Lovelace"
        src="/does-not-exist.png"
      ></wc-avatar>`,
    );
    const img = el.shadowRoot!.querySelector('img');
    expect(img?.getAttribute('alt')).to.equal('Ada Lovelace');

    await waitUntil(
      () => el.shadowRoot!.querySelector('.avatar > .initials'),
      'initials',
    );
    expect(el.shadowRoot!.querySelector('img')).to.be.null;

    el.name = '';
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.fallback-icon')).to.exist;

    // A new src tries the image again.
    el.src = '/another.png';
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('img')).to.exist;
  });

  it('maps size onto --avatar-size', async () => {
    const el = await fixture<Avatar>(
      html`<wc-avatar name="A B" size="lg"></wc-avatar>`,
    );
    expect(el.getAttribute('size')).to.equal('lg');
    expect(
      getComputedStyle(el).getPropertyValue('--avatar-size').trim(),
    ).to.equal('3rem');
  });
});

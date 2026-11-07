/// <reference types="mocha" />
import { html } from 'lit';
import { fixtureSync, expect } from '@open-wc/testing';
import { Kbd, splitShortcut } from '../src/kbd/index.js';
import { setPeacockStrings } from '../src/__internal/i18n/strings.js';

if (!customElements.get('wc-kbd')) customElements.define('wc-kbd', Kbd);

function caps(el: Kbd) {
  return Array.from(el.shadowRoot!.querySelectorAll('.keys .key')).map(
    key => key.textContent,
  );
}

function spoken(el: Kbd) {
  return el.shadowRoot!.querySelector('.screen-reader-only')?.textContent;
}

describe('Kbd', () => {
  afterEach(() => setPeacockStrings({}));

  it('splits shortcuts, including the plus key', () => {
    expect(splitShortcut('mod+shift+p')).to.deep.equal(['mod', 'shift', 'p']);
    expect(splitShortcut('ctrl++')).to.deep.equal(['ctrl', '+']);
    expect(splitShortcut('+')).to.deep.equal(['+']);
  });

  it('shows names joined by + off Apple platforms', async () => {
    const el = fixtureSync<Kbd>(
      html`<wc-kbd keys="mod+shift+p" platform="other"></wc-kbd>`,
    );
    await el.updateComplete;
    expect(caps(el)).to.deep.equal(['Ctrl', 'Shift', 'P']);
    expect(el.shadowRoot!.querySelectorAll('.separator').length).to.equal(2);
    expect(spoken(el)).to.equal('Control+Shift+P');
  });

  it('shows symbols without separators on Apple platforms', async () => {
    const el = fixtureSync<Kbd>(
      html`<wc-kbd keys="mod+alt+enter" platform="apple"></wc-kbd>`,
    );
    await el.updateComplete;
    expect(caps(el)).to.deep.equal(['⌘', '⌥', '↩']);
    expect(el.shadowRoot!.querySelectorAll('.separator').length).to.equal(0);
    expect(spoken(el)).to.equal('Command+Option+Return');
  });

  it('hides the glyphs from screen readers', async () => {
    const el = fixtureSync<Kbd>(
      html`<wc-kbd keys="up" platform="other"></wc-kbd>`,
    );
    await el.updateComplete;
    expect(
      el.shadowRoot!.querySelector('.keys')!.getAttribute('aria-hidden'),
    ).to.equal('true');
    expect(caps(el)).to.deep.equal(['↑']);
    expect(spoken(el)).to.equal('Up arrow');
  });

  it('takes aliases and unknown keys as written', async () => {
    const el = fixtureSync<Kbd>(
      html`<wc-kbd keys="cmd+esc+F5" platform="other"></wc-kbd>`,
    );
    await el.updateComplete;
    expect(caps(el)).to.deep.equal(['Win', 'Esc', 'F5']);
    expect(spoken(el)).to.equal('Windows+Escape+F5');
  });

  it('shows its content as one key without keys', async () => {
    const el = fixtureSync<Kbd>(html`<wc-kbd>Esc</wc-kbd>`);
    await el.updateComplete;
    const key = el.shadowRoot!.querySelector('kbd.key')!;
    expect(key.querySelector('slot')).to.exist;
    expect(el.shadowRoot!.querySelector('.screen-reader-only')).to.equal(null);
  });

  it('uses translated key names', async () => {
    setPeacockStrings({ kbdControl: 'Steuerung', kbdCtrlShort: 'Strg' });
    const el = fixtureSync<Kbd>(
      html`<wc-kbd keys="ctrl+c" platform="other"></wc-kbd>`,
    );
    await el.updateComplete;
    expect(caps(el)).to.deep.equal(['Strg', 'C']);
    expect(spoken(el)).to.equal('Steuerung+C');
  });

  it('updates when keys change', async () => {
    const el = fixtureSync<Kbd>(
      html`<wc-kbd keys="a" platform="other"></wc-kbd>`,
    );
    await el.updateComplete;
    el.keys = 'shift+tab';
    await el.updateComplete;
    expect(caps(el)).to.deep.equal(['Shift', 'Tab']);
  });
});

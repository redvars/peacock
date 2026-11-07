/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { TypingIndicator } from '../src/typing-indicator/index.js';
import { setPeacockAi } from '../src/__internal/ai/config.js';
import { setPeacockStrings } from '../src/__internal/i18n/strings.js';

if (!customElements.get('wc-typing-indicator')) {
  customElements.define('wc-typing-indicator', TypingIndicator);
}

const text = (el: TypingIndicator) =>
  el.shadowRoot!.querySelector('.label')?.textContent?.trim();

describe('TypingIndicator', () => {
  afterEach(() => {
    setPeacockAi({});
    setPeacockStrings({});
  });

  it('is a status region that says "Thinking…" by default', async () => {
    const el = await fixture<TypingIndicator>(
      html`<wc-typing-indicator></wc-typing-indicator>`,
    );
    expect(el.getAttribute('role')).to.equal('status');
    expect(text(el)).to.equal('Thinking…');
    expect(
      el.shadowRoot!.querySelector('.dots')?.getAttribute('aria-hidden'),
    ).to.equal('true');
  });

  it('shows and updates its label, and keeps a role the page set', async () => {
    const el = await fixture<TypingIndicator>(
      html`<wc-typing-indicator
        label="Looking up your laptop…"
        role="presentation"
      ></wc-typing-indicator>`,
    );
    expect(text(el)).to.equal('Looking up your laptop…');
    expect(el.getAttribute('role')).to.equal('presentation');
    el.label = 'Checking loaner stock…';
    await el.updateComplete;
    expect(text(el)).to.equal('Checking loaner stock…');
  });

  it('keeps working with AI off, because people type too', async () => {
    setPeacockAi({ enabled: false });
    const el = await fixture<TypingIndicator>(
      html`<wc-typing-indicator label="Ravi is typing"></wc-typing-indicator>`,
    );
    expect(text(el)).to.equal('Ravi is typing');
  });

  it('uses translated strings', async () => {
    setPeacockStrings({ typingThinking: 'A pensar…' });
    const el = await fixture<TypingIndicator>(
      html`<wc-typing-indicator></wc-typing-indicator>`,
    );
    expect(text(el)).to.equal('A pensar…');
  });
});

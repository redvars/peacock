/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { AiBadge } from '../src/ai-badge/index.js';
import { setPeacockAi } from '../src/__internal/ai/config.js';
import { setPeacockStrings } from '../src/__internal/i18n/strings.js';

if (!customElements.get('wc-ai-badge')) {
  customElements.define('wc-ai-badge', AiBadge);
}

function label(el: AiBadge): string {
  const slot = el.shadowRoot!.querySelector('slot') as HTMLSlotElement | null;
  if (!slot) return '';
  const assigned = slot.assignedNodes({ flatten: true });
  return (assigned.length ? assigned : Array.from(slot.childNodes))
    .map(node => node.textContent)
    .join('')
    .trim();
}

describe('AiBadge', () => {
  afterEach(() => {
    setPeacockAi({});
    setPeacockStrings({});
  });

  it('labels each kind in words, with a decorative sparkle', async () => {
    const suggested = await fixture<AiBadge>(html`<wc-ai-badge></wc-ai-badge>`);
    const draft = await fixture<AiBadge>(
      html`<wc-ai-badge kind="draft"></wc-ai-badge>`,
    );
    const generated = await fixture<AiBadge>(
      html`<wc-ai-badge kind="generated"></wc-ai-badge>`,
    );
    expect(label(suggested)).to.equal('Suggested');
    expect(label(draft)).to.equal('Draft');
    expect(label(generated)).to.equal('By the assistant');
    const sparkle = suggested.shadowRoot!.querySelector('.sparkle');
    expect(sparkle?.getAttribute('aria-hidden')).to.equal('true');
  });

  it('takes its label from the default slot', async () => {
    const el = await fixture<AiBadge>(
      html`<wc-ai-badge kind="generated"
        >Summary by the assistant</wc-ai-badge
      >`,
    );
    expect(label(el)).to.equal('Summary by the assistant');
  });

  it('shows the reason in a tooltip and makes the label focusable', async () => {
    const el = await fixture<AiBadge>(
      html`<wc-ai-badge reason="You didn't say you can't work."></wc-ai-badge>`,
    );
    const tooltip = el.shadowRoot!.querySelector('wc-tooltip');
    expect(tooltip?.textContent?.trim()).to.equal(
      "You didn't say you can't work.",
    );
    expect(tooltip?.getAttribute('for')).to.equal('label');
    expect(
      el.shadowRoot!.querySelector('#label')?.getAttribute('tabindex'),
    ).to.equal('0');

    const plain = await fixture<AiBadge>(html`<wc-ai-badge></wc-ai-badge>`);
    expect(plain.shadowRoot!.querySelector('wc-tooltip')).to.equal(null);
    expect(
      plain.shadowRoot!.querySelector('#label')?.hasAttribute('tabindex'),
    ).to.equal(false);
  });

  it('fires dismiss from its clear button, named for the kind', async () => {
    const el = await fixture<AiBadge>(
      html`<wc-ai-badge kind="draft" dismissible></wc-ai-badge>`,
    );
    const button = el.shadowRoot!.querySelector(
      '.dismiss',
    ) as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).to.equal('Discard draft');
    setTimeout(() => button.click());
    const event = await oneEvent(el, 'dismiss');
    expect(event.bubbles).to.equal(true);
    expect(event.composed).to.equal(true);

    el.kind = 'suggested';
    await el.updateComplete;
    expect(
      el.shadowRoot!.querySelector('.dismiss')?.getAttribute('aria-label'),
    ).to.equal('Clear suggestion');
  });

  it('renders nothing while AI is off, and returns when it is on again', async () => {
    setPeacockAi({ enabled: false });
    const el = await fixture<AiBadge>(
      html`<wc-ai-badge reason="Why" dismissible>Suggested</wc-ai-badge>`,
    );
    expect(el.shadowRoot!.querySelector('.badge')).to.equal(null);
    expect(el.shadowRoot!.textContent?.trim()).to.equal('');

    setPeacockAi({});
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('.badge')).to.not.equal(null);
  });

  it('uses translated strings', async () => {
    setPeacockStrings({ aiSuggested: 'Sugerido' });
    const el = await fixture<AiBadge>(html`<wc-ai-badge></wc-ai-badge>`);
    expect(label(el)).to.equal('Sugerido');
    el.strings = { aiSuggested: 'Proposé' };
    await el.updateComplete;
    expect(label(el)).to.equal('Proposé');
  });
});

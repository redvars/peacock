/// <reference types="mocha" />
import { html } from 'lit';
import { fixtureSync, expect, waitUntil, aTimeout } from '@open-wc/testing';
import { HoverCard } from '../src/hover-card/index.js';

if (!customElements.get('wc-hover-card')) {
  customElements.define('wc-hover-card', HoverCard);
}

async function setup() {
  const el = fixtureSync<HoverCard>(
    html`<wc-hover-card open-delay="20" close-delay="20">
      <a href="#ana">Ana Lima</a>
      <div slot="content"><button>Follow</button></div>
    </wc-hover-card>`,
  );
  await el.updateComplete;
  return el;
}

function trigger(el: HoverCard) {
  return el.querySelector('a')!;
}

function card(el: HoverCard) {
  return el.shadowRoot!.querySelector<HTMLElement>('.card')!;
}

function pointer(target: Element, type: string, pointerType = 'mouse') {
  target.dispatchEvent(new PointerEvent(type, { pointerType }));
}

describe('HoverCard', () => {
  it('points the trigger at the content with aria-details and no popup semantics', async () => {
    const el = await setup();
    const content = el.querySelector('[slot="content"]')!;
    expect(content.id).to.match(/^wc-hover-card-content-/);
    expect(trigger(el).getAttribute('aria-details')).to.equal(content.id);
    expect(trigger(el).hasAttribute('aria-haspopup')).to.be.false;
    expect(trigger(el).hasAttribute('aria-expanded')).to.be.false;
  });

  it('opens after the open delay on hover and fires open', async () => {
    const el = await setup();
    let opened = 0;
    el.addEventListener('open', () => {
      opened += 1;
    });
    pointer(trigger(el), 'pointerenter');
    expect(el.open).to.be.false;
    await waitUntil(() => el.open);
    await el.updateComplete;
    expect(opened).to.equal(1);
    expect(card(el).matches(':popover-open')).to.be.true;
  });

  it('does not open when the pointer leaves before the delay', async () => {
    const el = await setup();
    pointer(trigger(el), 'pointerenter');
    pointer(trigger(el), 'pointerleave');
    await aTimeout(50);
    expect(el.open).to.be.false;
  });

  it('stays open while the pointer moves into the card, closes after leaving', async () => {
    const el = await setup();
    const reasons: string[] = [];
    el.addEventListener('close', event =>
      reasons.push((event as CustomEvent).detail.reason),
    );
    el.show();
    await el.updateComplete;
    pointer(trigger(el), 'pointerenter');
    pointer(trigger(el), 'pointerleave');
    pointer(card(el), 'pointerenter');
    await aTimeout(50);
    expect(el.open).to.be.true;
    pointer(card(el), 'pointerleave');
    await waitUntil(() => !el.open);
    expect(reasons).to.deep.equal(['light-dismiss']);
  });

  it('opens on keyboard focus of the trigger but not on touch', async () => {
    const el = await setup();
    pointer(trigger(el), 'pointerenter', 'touch');
    await aTimeout(50);
    expect(el.open).to.be.false;

    // A tap focuses the link; that focus does not open the card.
    pointer(trigger(el), 'pointerdown', 'touch');
    trigger(el).dispatchEvent(
      new FocusEvent('focusin', { bubbles: true, composed: true }),
    );
    await aTimeout(50);
    expect(el.open).to.be.false;

    trigger(el).dispatchEvent(
      new FocusEvent('focusout', { bubbles: true, composed: true }),
    );
    trigger(el).dispatchEvent(
      new FocusEvent('focusin', { bubbles: true, composed: true }),
    );
    await waitUntil(() => el.open);
  });

  it('stays open while focus is inside the card', async () => {
    const el = await setup();
    el.show();
    await el.updateComplete;
    const button = el.querySelector('button')!;
    button.dispatchEvent(
      new FocusEvent('focusin', { bubbles: true, composed: true }),
    );
    pointer(card(el), 'pointerenter');
    pointer(card(el), 'pointerleave');
    await aTimeout(50);
    expect(el.open).to.be.true;
  });

  it('closes on Escape with reason escape', async () => {
    const el = await setup();
    let reason = '';
    el.addEventListener('close', event => {
      reason = (event as CustomEvent).detail.reason;
    });
    el.show();
    await el.updateComplete;
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );
    await el.updateComplete;
    expect(el.open).to.be.false;
    expect(reason).to.equal('escape');
  });

  it('hide() closes with reason api', async () => {
    const el = await setup();
    let reason = '';
    el.addEventListener('close', event => {
      reason = (event as CustomEvent).detail.reason;
    });
    el.show();
    await el.updateComplete;
    el.hide();
    await el.updateComplete;
    expect(reason).to.equal('api');
    expect(card(el).matches(':popover-open')).to.be.false;
  });

  it('leaves an aria-details the page set', async () => {
    const el = fixtureSync<HoverCard>(
      html`<wc-hover-card>
        <a href="#x" aria-details="mine">x</a>
        <div slot="content">card</div>
      </wc-hover-card>`,
    );
    await el.updateComplete;
    expect(el.querySelector('a')!.getAttribute('aria-details')).to.equal(
      'mine',
    );
  });
});

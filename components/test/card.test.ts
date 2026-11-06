/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Card, CardContent } from '../src/card/index.js';

if (!customElements.get('wc-card')) {
  customElements.define('wc-card', Card);
}
if (!customElements.get('wc-card-content')) {
  customElements.define('wc-card-content', CardContent);
}

function inner(el: Card) {
  return el.shadowRoot!.querySelector<HTMLElement>('#card')!;
}

function slotContainer(el: Card) {
  return el.shadowRoot!.querySelector<HTMLElement>('.slot-container')!;
}

describe('Card', () => {
  it('reflects the elevated variant by default and renders a static div', async () => {
    const el = await fixture<Card>(html`<wc-card>Content</wc-card>`);

    expect(el.getAttribute('variant')).to.equal('elevated');
    expect(inner(el).tagName).to.equal('DIV');
    expect(slotContainer(el).inert).to.be.false;
  });

  it('renders a button with inert content when actionable', async () => {
    const el = await fixture<Card>(html`<wc-card actionable>Pick me</wc-card>`);

    const button = inner(el) as HTMLButtonElement;
    expect(button.tagName).to.equal('BUTTON');
    expect(button.type).to.equal('button');
    expect(button.disabled).to.be.false;
    expect(button.hasAttribute('aria-disabled')).to.be.false;
    expect(slotContainer(el).inert).to.be.true;
  });

  it('renders a link with target, rel and download when href is set', async () => {
    const el = await fixture<Card>(
      html`<wc-card
        href="/report.pdf"
        target="_blank"
        rel="noopener noreferrer"
        download="report.pdf"
        >Report</wc-card
      >`,
    );

    const anchor = inner(el);
    expect(anchor.tagName).to.equal('A');
    expect(anchor.getAttribute('href')).to.equal('/report.pdf');
    expect(anchor.getAttribute('target')).to.equal('_blank');
    expect(anchor.getAttribute('rel')).to.equal('noopener noreferrer');
    expect(anchor.getAttribute('download')).to.equal('report.pdf');
    expect(anchor.hasAttribute('role')).to.be.false;
    expect(anchor.getAttribute('tabindex')).to.equal('0');
  });

  it('uses native disabled for a disabled actionable card without a reason', async () => {
    const el = await fixture<Card>(
      html`<wc-card actionable disabled>Upgrade</wc-card>`,
    );

    const button = inner(el) as HTMLButtonElement;
    expect(button.disabled).to.be.true;
    expect(button.getAttribute('aria-disabled')).to.equal('true');
    expect(button.hasAttribute('aria-describedby')).to.be.false;
    expect(el.shadowRoot!.querySelector('[role="tooltip"]')).to.not.exist;
  });

  it('keeps a disabled card with a reason focusable and describes it', async () => {
    const el = await fixture<Card>(
      html`<wc-card
        actionable
        disabled
        disabled-reason="Your organization admin manages billing."
        >Upgrade</wc-card
      >`,
    );

    const button = inner(el) as HTMLButtonElement;
    expect(button.disabled).to.be.false;
    expect(button.getAttribute('aria-disabled')).to.equal('true');

    const describedBy = button.getAttribute('aria-describedby');
    expect(describedBy).to.be.a('string').and.not.be.empty;
    const reason = el.shadowRoot!.getElementById(describedBy!);
    expect(reason?.textContent?.trim()).to.equal(
      'Your organization admin manages billing.',
    );
  });

  it('drops href from a disabled link card and takes it out of the tab order', async () => {
    const el = await fixture<Card>(
      html`<wc-card href="/export" disabled>Export</wc-card>`,
    );

    const anchor = inner(el);
    expect(anchor.hasAttribute('href')).to.be.false;
    expect(anchor.getAttribute('role')).to.equal('link');
    expect(anchor.getAttribute('aria-disabled')).to.equal('true');
    expect(anchor.getAttribute('tabindex')).to.equal('-1');
  });

  it('makes the content of a disabled static card inert', async () => {
    const el = await fixture<Card>(html`<wc-card disabled>Content</wc-card>`);
    expect(slotContainer(el).inert).to.be.true;
  });

  it('fires click once on an enabled actionable card', async () => {
    const el = await fixture<Card>(html`<wc-card actionable>Go</wc-card>`);
    let clicks = 0;
    el.addEventListener('click', () => {
      clicks += 1;
    });

    el.click();
    expect(clicks).to.equal(1);
  });

  it('never lets a click on a disabled card reach consumer listeners', async () => {
    const el = await fixture<Card>(
      html`<wc-card actionable disabled disabled-reason="Not yet">Go</wc-card>`,
    );
    let clicks = 0;
    el.addEventListener('click', () => {
      clicks += 1;
    });

    el.click();
    inner(el).click();
    expect(clicks).to.equal(0);
  });

  it('parses throttle-delay as a number', async () => {
    const el = await fixture<Card>(
      html`<wc-card actionable throttle-delay="300">Go</wc-card>`,
    );
    expect(el.throttleDelay).to.equal(300);
  });

  it('re-renders when disabled is toggled', async () => {
    const el = await fixture<Card>(html`<wc-card actionable>Go</wc-card>`);
    el.disabled = true;
    await el.updateComplete;
    expect((inner(el) as HTMLButtonElement).disabled).to.be.true;

    el.disabled = false;
    await el.updateComplete;
    expect((inner(el) as HTMLButtonElement).disabled).to.be.false;
  });
});

describe('CardContent', () => {
  it('pads all sides with 1rem by default', async () => {
    const el = await fixture<CardContent>(
      html`<wc-card-content>Text</wc-card-content>`,
    );
    const style = getComputedStyle(el);
    expect(style.paddingTop).to.equal('16px');
    expect(style.paddingInlineStart).to.equal('16px');
  });

  it('follows --card-content-padding', async () => {
    const el = await fixture<CardContent>(
      html`<wc-card-content style="--card-content-padding: 8px"
        >Text</wc-card-content
      >`,
    );
    expect(getComputedStyle(el).paddingBottom).to.equal('8px');
  });
});

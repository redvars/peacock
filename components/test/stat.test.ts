/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync } from '@open-wc/testing';
import { Stat } from '../src/stat/index.js';

if (!customElements.get('wc-stat')) customElements.define('wc-stat', Stat);

async function stat(template: ReturnType<typeof html>) {
  const el = fixtureSync<Stat>(template);
  await el.updateComplete;
  return el;
}

function q(el: Stat, selector: string) {
  return el.shadowRoot!.querySelector<HTMLElement>(selector);
}

function announcement(el: Stat) {
  return q(el, '.screen-reader-only')!.textContent!.trim();
}

const usd: Intl.NumberFormatOptions = {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
};

describe('wc-stat', () => {
  it('formats the value with format in the locale', async () => {
    const el = await stat(
      html`<wc-stat
        lang="en-US"
        label="Revenue"
        value="12400"
        .format=${usd}
      ></wc-stat>`,
    );
    expect(q(el, '.value')!.textContent!.trim()).to.equal('$12,400');
    expect(q(el, '.label')!.textContent!.trim()).to.equal('Revenue');
  });

  it('formats in the nearest lang', async () => {
    const wrapper = fixtureSync<HTMLDivElement>(
      html`<div lang="de-DE"><wc-stat value="12400.5"></wc-stat></div>`,
    );
    const el = wrapper.querySelector<Stat>('wc-stat')!;
    await el.updateComplete;
    expect(q(el, '.value')!.textContent!.trim()).to.equal('12.400,5');
  });

  it('works out a percentage change from previous and reads one sentence', async () => {
    const el = await stat(html`
      <wc-stat
        lang="en-US"
        label="Monthly revenue"
        value="12400"
        previous="11481.48"
        .format=${usd}
      ></wc-stat>
    `);
    expect(el.direction).to.equal('up');
    expect(el.intent).to.equal('success');
    expect(q(el, '.change-text')!.textContent!.trim()).to.equal('8%');
    expect(q(el, '.change')!.classList.contains('success')).to.equal(true);
    expect(q(el, '.arrow')!.getAttribute('name')).to.equal('arrow_upward');
    expect(announcement(el)).to.equal(
      'Monthly revenue, $12,400, up 8% from last period',
    );
  });

  it('shows an absolute change formatted like the value', async () => {
    const el = await stat(html`
      <wc-stat
        lang="en-US"
        value="900"
        previous="1000"
        delta-format="absolute"
        .format=${usd}
      ></wc-stat>
    `);
    expect(el.change).to.equal(-100);
    expect(q(el, '.change-text')!.textContent!.trim()).to.equal('$100');
    expect(el.intent).to.equal('danger');
    expect(q(el, '.arrow')!.getAttribute('name')).to.equal('arrow_downward');
  });

  it('takes an explicit delta over previous', async () => {
    const el = await stat(html`
      <wc-stat lang="en-US" value="10" previous="5" delta="-0.25"></wc-stat>
    `);
    expect(el.change).to.equal(-0.25);
    expect(q(el, '.change-text')!.textContent!.trim()).to.equal('25%');
  });

  it('colors a fall green when positive="down"', async () => {
    const el = await stat(html`
      <wc-stat label="Churn" value="3" previous="4" positive="down"></wc-stat>
    `);
    expect(el.intent).to.equal('success');
    el.positive = 'none';
    await el.updateComplete;
    expect(el.intent).to.equal(undefined);
    expect(q(el, '.change')!.classList.contains('neutral')).to.equal(true);
  });

  it('reads no change as unchanged, with the comparison', async () => {
    const el = await stat(html`
      <wc-stat
        lang="en-US"
        label="Users"
        value="5"
        previous="5"
        comparison="vs last month"
      ></wc-stat>
    `);
    expect(el.direction).to.equal('flat');
    expect(q(el, '.arrow')).to.equal(null);
    expect(q(el, '.comparison')!.textContent).to.equal('vs last month');
    expect(announcement(el)).to.equal('Users, 5, unchanged vs last month');
  });

  it('shows no change without previous or delta, or from zero', async () => {
    const el = await stat(html`<wc-stat value="5"></wc-stat>`);
    expect(q(el, '.change')).to.equal(null);
    el.previous = 0;
    await el.updateComplete;
    expect(el.change).to.equal(undefined);
    expect(q(el, '.change')).to.equal(null);
  });

  it('shows a dash read as "Not set" without a value', async () => {
    const el = await stat(html`<wc-stat label="Revenue"></wc-stat>`);
    expect(q(el, '.value')!.textContent!.trim()).to.equal('—');
    expect(announcement(el)).to.equal('Revenue, Not set');
  });

  it('shows a placeholder while loading', async () => {
    const el = await stat(
      html`<wc-stat label="Revenue" value="5" loading></wc-stat>`,
    );
    expect(q(el, '.stat')!.getAttribute('aria-busy')).to.equal('true');
    expect(q(el, '.skeleton')).to.exist;
    expect(q(el, '.value')).to.equal(null);
    expect(announcement(el)).to.equal('Revenue, Loading');
    el.loading = false;
    await el.updateComplete;
    expect(q(el, '.value')).to.exist;
  });

  it('adds an info button with the help text as its tooltip', async () => {
    const el = await stat(
      html`<wc-stat label="ARR" help="Annual recurring revenue"></wc-stat>`,
    );
    const help = q(el, '.help')!;
    expect(help.tagName).to.equal('WC-ICON-BUTTON');
    expect(help.getAttribute('aria-label')).to.equal('About this metric');
    expect(help.getAttribute('tooltip')).to.equal('Annual recurring revenue');
    expect(help.getAttribute('shape')).to.equal('round');
  });

  it('has a trend slot', async () => {
    const el = await stat(html`
      <wc-stat value="1"><span slot="trend">chart</span></wc-stat>
    `);
    const slot = q(el, 'slot[name="trend"]') as HTMLSlotElement;
    expect(slot.assignedElements()).to.have.length(1);
  });

  it('drops its chrome with variant="plain"', async () => {
    const el = await stat(html`<wc-stat value="1"></wc-stat>`);
    expect(getComputedStyle(q(el, '.stat')!).borderTopStyle).to.equal('solid');
    el.variant = 'plain';
    await el.updateComplete;
    const style = getComputedStyle(q(el, '.stat')!);
    expect(style.borderTopStyle).to.equal('none');
    expect(style.paddingTop).to.equal('0px');
  });
});

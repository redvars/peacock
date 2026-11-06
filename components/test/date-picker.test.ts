/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { DatePicker } from '../src/date-picker/index.js';

if (!customElements.get('wc-date-picker')) {
  customElements.define('wc-date-picker', DatePicker);
}

function day(el: DatePicker, iso: string) {
  return el.shadowRoot!.querySelector<HTMLButtonElement>(
    `.day[data-date="${iso}"]`,
  );
}

function tabStop(el: DatePicker) {
  return el.shadowRoot!.querySelector<HTMLButtonElement>(
    '.cell[tabindex="0"]',
  )!;
}

function key(
  target: HTMLElement,
  name: string,
  init: { shiftKey?: boolean } = {},
) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: name,
      bubbles: true,
      composed: true,
      ...init,
    }),
  );
}

const header = (el: DatePicker) =>
  el.shadowRoot!.querySelector('.view-button')!.textContent!.trim();

describe('DatePicker', () => {
  it('shows the month of its value with the value selected', async () => {
    const el = await fixture<DatePicker>(
      html`<wc-date-picker value="2026-11-06" locale="en-US"></wc-date-picker>`,
    );
    expect(header(el)).to.equal('November 2026');
    const selected = day(el, '2026-11-06')!;
    expect(selected.classList.contains('selected')).to.be.true;
    expect(selected.tabIndex).to.equal(0);
    expect(selected.getAttribute('aria-label')).to.equal(
      'Friday, November 6, 2026',
    );
  });

  it('starts the week on the given day', async () => {
    const el = await fixture<DatePicker>(
      html`<wc-date-picker
        value="2026-11-06"
        locale="en-US"
        first-day-of-week="1"
      ></wc-date-picker>`,
    );
    const first = el.shadowRoot!.querySelector('th')!;
    expect(first.textContent!.trim()).to.equal('Mon');
  });

  it('fires change when a day is picked', async () => {
    const el = await fixture<DatePicker>(
      html`<wc-date-picker value="2026-11-06"></wc-date-picker>`,
    );
    setTimeout(() => day(el, '2026-11-12')!.click());
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;
    expect(event.detail.value).to.equal('2026-11-12');
    expect(el.value).to.equal('2026-11-12');
  });

  it('ignores days outside min and max', async () => {
    const el = await fixture<DatePicker>(
      html`<wc-date-picker
        value="2026-11-06"
        min="2026-11-05"
        max="2026-11-20"
      ></wc-date-picker>`,
    );
    const early = day(el, '2026-11-04')!;
    expect(early.getAttribute('aria-disabled')).to.equal('true');
    early.click();
    await el.updateComplete;
    expect(el.value).to.equal('2026-11-06');
  });

  it('picks a range in either order', async () => {
    const el = await fixture<DatePicker>(
      html`<wc-date-picker
        range
        value="2026-11-01/2026-11-02"
      ></wc-date-picker>`,
    );
    setTimeout(() => day(el, '2026-11-09')!.click());
    const start = (await oneEvent(el, 'input')) as CustomEvent<{
      value: string;
    }>;
    expect(start.detail.value).to.equal('2026-11-09/');
    await el.updateComplete;

    setTimeout(() => day(el, '2026-11-03')!.click());
    const end = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;
    expect(end.detail.value).to.equal('2026-11-03/2026-11-09');
    await el.updateComplete;
    const middle = day(el, '2026-11-05')!.parentElement!;
    expect(middle.classList.contains('in-range')).to.be.true;
  });

  it('moves with the arrow and page keys', async () => {
    const el = await fixture<DatePicker>(
      html`<wc-date-picker value="2026-11-06" locale="en-US"></wc-date-picker>`,
    );
    key(tabStop(el), 'ArrowRight');
    await el.updateComplete;
    expect(tabStop(el).dataset.date).to.equal('2026-11-07');

    key(tabStop(el), 'ArrowDown');
    await el.updateComplete;
    expect(tabStop(el).dataset.date).to.equal('2026-11-14');

    key(tabStop(el), 'PageDown');
    await el.updateComplete;
    expect(tabStop(el).dataset.date).to.equal('2026-12-14');
    expect(header(el)).to.equal('December 2026');

    key(tabStop(el), 'PageUp', { shiftKey: true });
    await el.updateComplete;
    expect(tabStop(el).dataset.date).to.equal('2025-12-14');

    setTimeout(() => key(tabStop(el), 'Enter'));
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;
    expect(event.detail.value).to.equal('2025-12-14');
  });

  it('skips disabled dates when moving', async () => {
    const el = await fixture<DatePicker>(
      html`<wc-date-picker value="2026-11-06"></wc-date-picker>`,
    );
    el.isDateDisabled = iso => iso === '2026-11-07' || iso === '2026-11-08';
    await el.updateComplete;
    key(tabStop(el), 'ArrowRight');
    await el.updateComplete;
    expect(tabStop(el).dataset.date).to.equal('2026-11-09');
  });

  it('jumps months through the month and year views', async () => {
    const el = await fixture<DatePicker>(
      html`<wc-date-picker value="2026-11-06" locale="en-US"></wc-date-picker>`,
    );
    const viewButton =
      el.shadowRoot!.querySelector<HTMLButtonElement>('.view-button')!;
    viewButton.click();
    await el.updateComplete;
    expect(header(el)).to.equal('2026');
    viewButton.click();
    await el.updateComplete;
    expect(header(el)).to.equal('2020 – 2029');

    const year = Array.from(
      el.shadowRoot!.querySelectorAll<HTMLButtonElement>('.choice'),
    ).find(b => b.textContent!.trim() === '2028')!;
    year.click();
    await el.updateComplete;
    const march = Array.from(
      el.shadowRoot!.querySelectorAll<HTMLButtonElement>('.choice'),
    ).find(b => b.textContent!.trim() === 'Mar')!;
    march.click();
    await el.updateComplete;
    expect(header(el)).to.equal('March 2028');
    expect(tabStop(el).dataset.date).to.equal('2028-03-06');
  });

  it('clears and picks today from the actions', async () => {
    const el = await fixture<DatePicker>(
      html`<wc-date-picker value="2026-11-06" show-actions></wc-date-picker>`,
    );
    setTimeout(() =>
      el.shadowRoot!.querySelector<HTMLElement>('.clear-button')!.click(),
    );
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      value: string;
    }>;
    expect(event.detail.value).to.equal('');
  });

  it('does not reflect value to an attribute', async () => {
    const el = await fixture<DatePicker>(
      html`<wc-date-picker></wc-date-picker>`,
    );
    el.value = '2026-11-06';
    await el.updateComplete;
    expect(el.hasAttribute('value')).to.be.false;
  });
});

/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Search } from '../src/search/search.js';

if (!customElements.get('wc-search')) {
  customElements.define('wc-search', Search);
}

describe('Search', () => {
  it('renders with default properties', async () => {
    const el = await fixture<Search>(html`<wc-search></wc-search>`);
    await el.updateComplete;

    expect(el.variant).to.equal('filled');
    expect(el.placeholder).to.equal('Search');
    expect(el.value).to.equal('');
    expect(el.disabled).to.equal(false);
    expect(el.clearable).to.equal(true);
    expect(el.size).to.equal('md');
  });

  it('reflects variant attribute', async () => {
    const el = await fixture<Search>(
      html`<wc-search variant="outlined"></wc-search>`,
    );
    await el.updateComplete;

    expect(el.variant).to.equal('outlined');
    expect(el.getAttribute('variant')).to.equal('outlined');
  });

  it('reflects disabled attribute', async () => {
    const el = await fixture<Search>(html`<wc-search disabled></wc-search>`);
    await el.updateComplete;

    expect(el.disabled).to.equal(true);
    const input = el.shadowRoot!.querySelector('input') as HTMLInputElement;
    expect(input.disabled).to.equal(true);
  });

  it('renders the search input with placeholder', async () => {
    const el = await fixture<Search>(
      html`<wc-search placeholder="Find items..."></wc-search>`,
    );
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector(
      '.search-input',
    ) as HTMLInputElement;
    expect(input).to.exist;
    expect(input.placeholder).to.equal('Find items...');
  });

  it('updates value on input event', async () => {
    const el = await fixture<Search>(html`<wc-search></wc-search>`);
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector(
      '.search-input',
    ) as HTMLInputElement;
    input.value = 'hello';
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));

    await el.updateComplete;
    expect(el.value).to.equal('hello');
  });

  it('dispatches input event with value detail', async () => {
    const el = await fixture<Search>(html`<wc-search></wc-search>`);
    await el.updateComplete;

    let receivedDetail: { value: string } | null = null;
    let eventCount = 0;
    el.addEventListener('input', (e: Event) => {
      eventCount += 1;
      receivedDetail = (e as CustomEvent).detail;
    });

    const input = el.shadowRoot!.querySelector(
      '.search-input',
    ) as HTMLInputElement;
    input.value = 'test';
    input.dispatchEvent(new InputEvent('input', { bubbles: true }));

    await el.updateComplete;
    expect(eventCount).to.equal(1);
    expect(receivedDetail).to.not.be.null;
    expect(receivedDetail!.value).to.equal('test');
  });

  it('dispatches change event once with value detail', async () => {
    const el = await fixture<Search>(html`<wc-search></wc-search>`);
    await el.updateComplete;

    let receivedDetail: { value: string } | null = null;
    let eventCount = 0;
    el.addEventListener('change', (e: Event) => {
      eventCount += 1;
      receivedDetail = (e as CustomEvent).detail;
    });

    const input = el.shadowRoot!.querySelector(
      '.search-input',
    ) as HTMLInputElement;
    input.value = 'changed';
    input.dispatchEvent(new Event('change', { bubbles: true }));

    await el.updateComplete;
    expect(eventCount).to.equal(1);
    expect(receivedDetail).to.not.be.null;
    expect(receivedDetail!.value).to.equal('changed');
  });

  it('shows clear button when value is present', async () => {
    const el = await fixture<Search>(
      html`<wc-search value="hello"></wc-search>`,
    );
    await el.updateComplete;

    const clearBtn = el.shadowRoot!.querySelector('.clear-button');
    expect(clearBtn).to.exist;
  });

  it('hides clear button when value is empty', async () => {
    const el = await fixture<Search>(html`<wc-search></wc-search>`);
    await el.updateComplete;

    const clearBtn = el.shadowRoot!.querySelector('.clear-button');
    expect(clearBtn).to.not.exist;
  });

  it('hides clear button when clearable is false', async () => {
    const el = await fixture<Search>(
      html`<wc-search value="hello" .clearable=${false}></wc-search>`,
    );
    await el.updateComplete;

    const clearBtn = el.shadowRoot!.querySelector('.clear-button');
    expect(clearBtn).to.not.exist;
  });

  it('clears value and dispatches clear event on clear button click', async () => {
    const el = await fixture<Search>(
      html`<wc-search value="hello"></wc-search>`,
    );
    await el.updateComplete;

    let clearFired = false;
    el.addEventListener('clear', () => {
      clearFired = true;
    });

    const clearBtn = el.shadowRoot!.querySelector(
      '.clear-button',
    ) as HTMLButtonElement;
    clearBtn.click();

    await el.updateComplete;
    expect(el.value).to.equal('');
    expect(clearFired).to.be.true;
  });

  it('dispatches search event on Enter key', async () => {
    const el = await fixture<Search>(
      html`<wc-search value="query"></wc-search>`,
    );
    await el.updateComplete;

    let searchDetail: { value: string } | null = null;
    el.addEventListener('search', (e: Event) => {
      searchDetail = (e as CustomEvent).detail;
    });

    const input = el.shadowRoot!.querySelector(
      '.search-input',
    ) as HTMLInputElement;
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );

    expect(searchDetail).to.not.be.null;
    expect(searchDetail!.value).to.equal('query');
  });

  it('clears value on Escape key', async () => {
    const el = await fixture<Search>(
      html`<wc-search value="query"></wc-search>`,
    );
    await el.updateComplete;

    const input = el.shadowRoot!.querySelector(
      '.search-input',
    ) as HTMLInputElement;
    input.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }),
    );

    await el.updateComplete;
    expect(el.value).to.equal('');
  });

  it('applies size class', async () => {
    const el = await fixture<Search>(
      html`<wc-search size="lg"></wc-search>`,
    );
    await el.updateComplete;

    const container = el.shadowRoot!.querySelector('.search');
    expect(container?.classList.contains('size-lg')).to.be.true;
  });
});

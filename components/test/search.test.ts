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

    expect(el.variant).to.equal('default');
    expect(
      el.shadowRoot!.querySelector('.search')!.classList.contains(
        'variant-filled',
      ),
    ).to.be.true;
    expect(el.placeholder).to.equal('');
    const input = el.shadowRoot?.querySelector('input');
    expect(input?.placeholder).to.equal('Search');
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

  function inputOf(el: Search) {
    return el.shadowRoot!.querySelector<HTMLInputElement>('.search-input')!;
  }

  it('names the search box from label, else the placeholder', async () => {
    const el = await fixture<Search>(
      html`<wc-search label="Search products" placeholder="Find"></wc-search>`,
    );
    expect(inputOf(el).getAttribute('aria-label')).to.equal('Search products');
    el.label = '';
    await el.updateComplete;
    expect(inputOf(el).getAttribute('aria-label')).to.equal('Find');
  });

  it('renders start and end slots, and still the deprecated leading and trailing', async () => {
    const el = await fixture<Search>(html`
      <wc-search>
        <span slot="start" class="s"></span>
        <span slot="end" class="e"></span>
        <span slot="trailing" class="t"></span>
      </wc-search>
    `);
    const slot = (name: string) =>
      el.shadowRoot!.querySelector<HTMLSlotElement>(`slot[name="${name}"]`)!;
    expect(slot('start').assignedElements()[0]).to.equal(el.querySelector('.s'));
    expect(slot('end').assignedElements()[0]).to.equal(el.querySelector('.e'));
    expect(slot('trailing').assignedElements()[0]).to.equal(
      el.querySelector('.t'),
    );
    expect(slot('leading')).to.exist;
  });

  it('only stops Escape when it clears a value, and fires change on clear', async () => {
    const el = await fixture<Search>(html`<wc-search value="q"></wc-search>`);
    const outside: string[] = [];
    el.addEventListener('keydown', e => outside.push(e.key));
    const changes: string[] = [];
    el.addEventListener('change', e =>
      changes.push((e as CustomEvent).detail.value),
    );

    const escape = () =>
      inputOf(el).dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          composed: true,
        }),
      );
    escape();
    await el.updateComplete;
    expect(el.value).to.equal('');
    expect(outside).to.deep.equal([]);
    expect(changes).to.deep.equal(['']);

    escape();
    expect(outside).to.deep.equal(['Escape']);
  });

  it('hides the clear button with clearable="false"', async () => {
    const el = await fixture<Search>(
      html`<wc-search value="q" clearable="false"></wc-search>`,
    );
    expect(el.clearable).to.be.false;
    expect(el.shadowRoot!.querySelector('.clear-button')).to.not.exist;
  });

  it('submits its value with a form and resets', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form><wc-search name="q" value="start"></wc-search></form>
    `);
    const el = form.querySelector<Search>('wc-search')!;
    await el.updateComplete;
    expect(new FormData(form).get('q')).to.equal('start');

    el.value = 'next';
    await el.updateComplete;
    expect(new FormData(form).get('q')).to.equal('next');
    form.reset();
    expect(el.value).to.equal('start');
  });
});

/// <reference types="mocha" />
import { html } from 'lit';
import { fixtureSync, expect } from '@open-wc/testing';
import {
  JsonViewer,
  type JsonViewerToggleDetail,
} from '../src/json-viewer/index.js';
import { childPath, copyText } from '../src/json-viewer/json-path.js';

if (!customElements.get('wc-json-viewer')) {
  customElements.define('wc-json-viewer', JsonViewer);
}

function press(target: Element, key: string) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    composed: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

async function mount(template: ReturnType<typeof html>) {
  const el = fixtureSync<JsonViewer>(template);
  await el.updateComplete;
  const root = el.shadowRoot as ShadowRoot;
  const item = (path: string) =>
    Array.from(root.querySelectorAll<HTMLElement>('.item')).find(
      node => node.dataset.path === path,
    ) as HTMLElement;
  const paths = () =>
    Array.from(root.querySelectorAll<HTMLElement>('.item')).map(
      node => node.dataset.path,
    );
  return { el, root, item, paths };
}

const sample = {
  id: 42,
  name: 'Ada',
  active: true,
  manager: null,
  items: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
  'odd key': { "it's": 1 },
};

describe('json-path', () => {
  it('writes JSONPath with dot and bracket notation', () => {
    expect(childPath('$', 'items')).to.equal('$.items');
    expect(childPath('$.items', 2)).to.equal('$.items[2]');
    expect(childPath('$', 'odd key')).to.equal("$['odd key']");
    expect(childPath('$', "it's")).to.equal("$['it\\'s']");
    expect(childPath('$', '1abc')).to.equal("$['1abc']");
  });

  it('copies strings as is and other values as JSON', () => {
    expect(copyText('hello')).to.equal('hello');
    expect(copyText({ a: 1 })).to.equal('{\n  "a": 1\n}');
    const circular: Record<string, unknown> = {};
    circular.self = circular;
    expect(copyText(circular)).to.equal('[object Object]');
  });
});

describe('wc-json-viewer', () => {
  it('renders the root expanded and its children collapsed by default', async () => {
    const { el, root, item, paths } = await mount(
      html`<wc-json-viewer .value=${sample}></wc-json-viewer>`,
    );
    expect(
      root.querySelector('[role="tree"]')?.getAttribute('aria-label'),
    ).to.equal('JSON');
    expect(paths()).to.deep.equal([
      '$',
      '$.id',
      '$.name',
      '$.active',
      '$.manager',
      '$.items',
      "$['odd key']",
    ]);
    const items = item('$.items');
    expect(items.getAttribute('aria-expanded')).to.equal('false');
    expect(items.getAttribute('aria-level')).to.equal('2');
    expect(items.getAttribute('aria-posinset')).to.equal('5');
    expect(items.getAttribute('aria-setsize')).to.equal('6');
    expect(items.querySelector('.size')?.textContent).to.equal('3 items');
    expect(items.getAttribute('aria-label')).to.equal('items: 3 items');
    expect(item("$['odd key']").querySelector('.size')?.textContent).to.equal(
      '1 key',
    );
    expect(item('$.name').querySelector('.string')?.textContent).to.equal(
      '"Ada"',
    );
    expect(item('$.id').querySelector('.number')).to.exist;
    expect(item('$.active').querySelector('.boolean')).to.exist;
    expect(item('$.manager').querySelector('.null')).to.exist;
    // Children of collapsed nodes are not rendered.
    expect(root.querySelectorAll('.item').length).to.equal(7);
    expect(el.value).to.equal(sample);
  });

  it('parses the value attribute and shows an error for invalid JSON', async () => {
    const { el, root, paths } = await mount(
      html`<wc-json-viewer value='{"a": [1, 2]}'></wc-json-viewer>`,
    );
    expect(paths()).to.deep.equal(['$', '$.a']);
    expect(el.value).to.deep.equal({ a: [1, 2] });

    el.setAttribute('value', '{"a": ');
    await el.updateComplete;
    expect(root.querySelector('[role="tree"]')).to.equal(null);
    expect(root.querySelector('.error')?.textContent).to.contain(
      'Invalid JSON:',
    );

    el.value = [1];
    await el.updateComplete;
    expect(root.querySelector('.error')).to.equal(null);
    expect(paths()).to.deep.equal(['$', '$[0]']);
  });

  it('expands to expand-depth, or everything with all', async () => {
    const { el, paths } = await mount(
      html`<wc-json-viewer
        .value=${sample}
        expand-depth="all"
      ></wc-json-viewer>`,
    );
    expect(el.expandDepth).to.equal(Infinity);
    expect(paths()).to.include('$.items[2].id');
    expect(paths()).to.include("$['odd key']['it\\'s']");

    el.expandDepth = 0;
    await el.updateComplete;
    expect(paths()).to.deep.equal(['$']);
  });

  it('expands and collapses with the arrow keys and fires events', async () => {
    const { el, item } = await mount(
      html`<wc-json-viewer .value=${sample}></wc-json-viewer>`,
    );
    const events: string[] = [];
    el.addEventListener('expand', e =>
      events.push(
        `expand ${(e as CustomEvent<JsonViewerToggleDetail>).detail.path}`,
      ),
    );
    el.addEventListener('collapse', e =>
      events.push(
        `collapse ${(e as CustomEvent<JsonViewerToggleDetail>).detail.path}`,
      ),
    );

    press(item('$.items'), 'ArrowRight');
    await el.updateComplete;
    expect(item('$.items').getAttribute('aria-expanded')).to.equal('true');
    expect(item('$.items[0]')).to.exist;

    press(item('$.items'), 'ArrowRight');
    await el.updateComplete;
    expect(item('$.items[0]').tabIndex).to.equal(0);

    press(item('$.items[0]'), 'ArrowLeft');
    await el.updateComplete;
    expect(item('$.items').tabIndex).to.equal(0);

    press(item('$.items'), 'ArrowLeft');
    await el.updateComplete;
    expect(item('$.items').getAttribute('aria-expanded')).to.equal('false');
    expect(events).to.deep.equal(['expand $.items', 'collapse $.items']);
  });

  it('moves with Up, Down, Home, End and typeahead', async () => {
    const { el, item } = await mount(
      html`<wc-json-viewer .value=${sample}></wc-json-viewer>`,
    );
    expect(item('$').tabIndex).to.equal(0);
    press(item('$'), 'ArrowDown');
    await el.updateComplete;
    expect(item('$.id').tabIndex).to.equal(0);
    expect(item('$').tabIndex).to.equal(-1);
    press(item('$.id'), 'End');
    await el.updateComplete;
    expect(item("$['odd key']").tabIndex).to.equal(0);
    press(item("$['odd key']"), 'Home');
    await el.updateComplete;
    expect(item('$').tabIndex).to.equal(0);
    press(item('$'), 'm');
    await el.updateComplete;
    expect(item('$.manager').tabIndex).to.equal(0);
  });

  it('expands every sibling with *', async () => {
    const { el, item } = await mount(
      html`<wc-json-viewer .value=${sample}></wc-json-viewer>`,
    );
    press(item('$.id'), '*');
    await el.updateComplete;
    expect(item('$.items').getAttribute('aria-expanded')).to.equal('true');
    expect(item("$['odd key']").getAttribute('aria-expanded')).to.equal('true');
  });

  it('toggles a node on click', async () => {
    const { el, item } = await mount(
      html`<wc-json-viewer .value=${sample}></wc-json-viewer>`,
    );
    (item('$.items').querySelector('.row') as HTMLElement).click();
    await el.updateComplete;
    expect(item('$.items').getAttribute('aria-expanded')).to.equal('true');
  });

  it('renders large arrays in batches', async () => {
    const big = Array.from({ length: 250 }, (_, i) => i);
    const { el, root, item } = await mount(
      html`<wc-json-viewer .value=${big}></wc-json-viewer>`,
    );
    expect(root.querySelectorAll('.item:not(.more-item)').length).to.equal(101);
    const more = item('$#more');
    expect(more.textContent).to.contain('Show 100 more of 150');
    press(more, 'Enter');
    await el.updateComplete;
    await el.updateComplete;
    expect(root.querySelectorAll('.item:not(.more-item)').length).to.equal(201);
    expect(item('$[100]').tabIndex).to.equal(0);
    expect(item('$#more').textContent).to.contain('Show 50 more of 50');
  });

  it('is fast on a large payload at depth 1', async () => {
    const payload = {
      rows: Array.from({ length: 100000 }, (_, i) => ({
        id: i,
        name: `row ${i}`,
        tags: ['a', 'b'],
      })),
    };
    const start = performance.now();
    const { root } = await mount(
      html`<wc-json-viewer .value=${payload}></wc-json-viewer>`,
    );
    expect(performance.now() - start).to.be.below(500);
    expect(root.querySelectorAll('.item').length).to.equal(2);
  });

  it('truncates long strings until activated', async () => {
    const long = 'x'.repeat(500);
    const { el, item } = await mount(
      html`<wc-json-viewer .value=${{ long }}></wc-json-viewer>`,
    );
    const text = () => item('$.long').querySelector('.string')?.textContent;
    expect(text()?.length).to.equal(201);
    expect(item('$.long').querySelector('.more')?.textContent).to.equal(
      '302 more characters',
    );
    press(item('$.long'), 'Enter');
    await el.updateComplete;
    expect(text()).to.equal(JSON.stringify(long));
  });

  it('sorts keys with sort-keys and shows the root label', async () => {
    const { paths, item } = await mount(
      html`<wc-json-viewer
        sort-keys
        root-label="response"
        .value=${{ b: 1, a: 2, c: 3 }}
      ></wc-json-viewer>`,
    );
    expect(paths()).to.deep.equal(['$', '$.a', '$.b', '$.c']);
    expect(item('$').querySelector('.key')?.textContent).to.equal('response');
  });

  it('shows circular references without recursing', async () => {
    const value: Record<string, unknown> = { a: 1 };
    value.self = value;
    const { el, item } = await mount(
      html`<wc-json-viewer
        .value=${value}
        expand-depth="all"
      ></wc-json-viewer>`,
    );
    await el.updateComplete;
    expect(item('$.self').textContent).to.contain('Circular reference');
  });

  it('shows copy buttons on the focused row', async () => {
    const { el, item } = await mount(
      html`<wc-json-viewer .value=${sample}></wc-json-viewer>`,
    );
    expect(item('$.id').querySelector('.actions')).to.equal(null);
    item('$.id').dispatchEvent(
      new FocusEvent('focusin', { bubbles: true, composed: true }),
    );
    await el.updateComplete;
    const actions = item('$.id').querySelector('.actions');
    expect(
      actions?.querySelector('.copy-value')?.getAttribute('aria-label'),
    ).to.equal('Copy value');
    expect(
      actions?.querySelector('.copy-path')?.getAttribute('aria-label'),
    ).to.equal('Copy path');
  });

  it('expandAll and collapseAll', async () => {
    const { el, paths } = await mount(
      html`<wc-json-viewer .value=${sample}></wc-json-viewer>`,
    );
    el.expandAll();
    await el.updateComplete;
    expect(paths()).to.include('$.items[1].id');
    el.collapseAll();
    await el.updateComplete;
    expect(paths()).to.deep.equal(['$']);
  });
});

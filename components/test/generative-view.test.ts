/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixture, oneEvent } from '@open-wc/testing';
import { setPeacockAi } from '../src/__internal/ai/config.js';
import { AiBadge } from '../src/ai-badge/index.js';
import { Button } from '../src/button/index.js';
import { Card, CardContent } from '../src/card/index.js';
import { Citation } from '../src/citation/index.js';
import { Item } from '../src/item/index.js';
import { List, ListItem } from '../src/list/index.js';
import { Markdown } from '../src/markdown/markdown.js';
import { Stack } from '../src/stack/index.js';
import { Stat } from '../src/stat/index.js';
import { TypingIndicator } from '../src/typing-indicator/index.js';
import {
  GenerativeView,
  generativeViewSchema,
  parsePartialJson,
  cleanValue,
  type GenerativeViewActionDetail,
} from '../src/generative-view/index.js';
import { catalog } from '../src/generative-view/catalog.generated.js';
import { cleanJson, LIMITS } from '../src/generative-view/validate.js';

for (const [tag, element] of [
  ['wc-ai-badge', AiBadge],
  ['wc-button', Button],
  ['wc-card', Card],
  ['wc-card-content', CardContent],
  ['wc-citation', Citation],
  ['wc-generative-view', GenerativeView],
  ['wc-item', Item],
  ['wc-list', List],
  ['wc-list-item', ListItem],
  ['wc-markdown', Markdown],
  ['wc-stack', Stack],
  ['wc-stat', Stat],
  ['wc-typing-indicator', TypingIndicator],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

const content = (el: GenerativeView) =>
  el.shadowRoot?.querySelector('.content') as HTMLElement;

async function view(value: unknown, extra: Partial<GenerativeView> = {}) {
  const el = await fixture<GenerativeView>(
    html`<wc-generative-view></wc-generative-view>`,
  );
  Object.assign(el, extra, { value });
  await el.updateComplete;
  return el;
}

describe('GenerativeView', () => {
  afterEach(() => setPeacockAi({}));

  it('renders allowed components from JSON text, marked as the assistant’s', async () => {
    const el = await fixture<GenerativeView>(
      html`<wc-generative-view
        value='{"type": "stat", "props": {"label": "Open incidents", "value": 42}}'
      ></wc-generative-view>`,
    );
    const stat = content(el).querySelector('wc-stat') as Stat;
    expect(stat.label).to.equal('Open incidents');
    expect(stat.value).to.equal(42);
    expect(el.shadowRoot?.querySelector('wc-ai-badge')).to.exist;
    expect(el.issues).to.deep.equal([]);
  });

  it('lays out nodes, text and headings', async () => {
    const el = await view([
      { type: 'text', props: { variant: 'headline' }, children: ['Today'] },
      {
        type: 'stack',
        props: { direction: 'horizontal', gap: '200' },
        children: [
          { type: 'stat', props: { label: 'A', value: 1 } },
          'plain text',
        ],
      },
    ]);
    const heading = content(el).querySelector('h3');
    expect(heading?.textContent).to.equal('Today');
    const stack = content(el).querySelector('wc-stack') as Stack;
    expect(stack.direction).to.equal('horizontal');
    expect(stack.querySelector('wc-stat')).to.exist;
    expect(stack.textContent).to.contain('plain text');
  });

  it('wraps card children in card content', async () => {
    const el = await view({
      type: 'card',
      props: { variant: 'outlined' },
      children: [{ type: 'text', children: ['Inside'] }],
    });
    const card = content(el).querySelector('wc-card') as Card;
    expect(
      card.querySelector(':scope > wc-card-content > p')?.textContent,
    ).to.equal('Inside');
  });

  it('never renders HTML, URLs or unknown elements', async () => {
    const el = await view([
      '<img src=x onerror="window.__pwned = true">',
      {
        type: 'iframe',
        props: { src: 'https://evil.example' },
        children: ['shown as text'],
      },
      {
        type: 'button',
        props: { href: 'https://evil.example', level: 'primary' },
        children: ['Open'],
      },
      { type: 'icon', props: { name: 'https://evil.example/x' } },
      { type: 'stat', props: { label: 7, value: 'many', variant: 'neon' } },
    ]);
    const root = content(el);
    expect(root.querySelector('img, iframe, script')).to.equal(null);
    expect(root.textContent).to.contain('<img src=x');
    expect(root.textContent).to.contain('shown as text');
    const button = root.querySelector('wc-button') as Button;
    expect(button.getAttribute('href')).to.equal(null);
    expect((button as unknown as { href?: string }).href).to.equal(undefined);
    const icon = root.querySelector('wc-icon') as HTMLElement & {
      name?: string;
    };
    expect(icon.name).to.equal(undefined);
    const stat = root.querySelector('wc-stat') as Stat;
    expect(stat.label).to.equal('');
    expect(stat.variant).to.equal('outlined');
    expect(el.issues).to.include(
      '$[1]: unknown type "iframe", shown as its content',
    );
    expect(el.issues).to.include('$[2]: button has no prop "href"');
    expect(el.issues).to.include('$[3]: invalid icon.name');
    expect(el.issues).to.include('$[4]: invalid stat.variant');
    expect((window as unknown as { __pwned?: boolean }).__pwned).to.equal(
      undefined,
    );
  });

  it('fires action with the node’s id and payload, and nothing else', async () => {
    const el = await view({
      type: 'button',
      props: { level: 'primary' },
      action: 'open-incident',
      payload: { id: 'INC-2318' },
      children: ['Open INC-2318'],
    });
    const button = content(el).querySelector('wc-button') as HTMLElement;
    setTimeout(() => button.click());
    const event = (await oneEvent(
      el,
      'action',
    )) as CustomEvent<GenerativeViewActionDetail>;
    expect(event.detail).to.deep.equal({
      id: 'open-incident',
      type: 'button',
      payload: { id: 'INC-2318' },
    });
  });

  it('drops an action on a node that takes none, and makes list items actionable', async () => {
    const el = await view([
      { type: 'stat', props: { label: 'A' }, action: 'x' },
      {
        type: 'list',
        children: [
          {
            type: 'list-item',
            action: 'pick',
            children: [{ type: 'text', slot: 'headline', children: ['Row'] }],
          },
        ],
      },
    ]);
    expect(el.issues).to.include('$[0]: stat takes no action');
    const item = content(el).querySelector('wc-list-item') as ListItem;
    expect(item.actionable).to.equal(true);
    expect(item.querySelector('[slot="headline"]')?.textContent).to.equal(
      'Row',
    );
  });

  it('puts children in named slots and refuses unslotted children where there are none', async () => {
    const el = await view({
      type: 'stat',
      props: { label: 'Open', value: 4 },
      children: [
        { type: 'markdown', slot: 'insight', props: { value: 'Up **2**' } },
        { type: 'markdown', slot: 'nowhere', props: { value: 'x' } },
        'loose text',
      ],
    });
    const stat = content(el).querySelector('wc-stat') as Stat;
    expect(stat.querySelectorAll('wc-markdown')).to.have.length(1);
    expect(stat.querySelector('wc-markdown')?.getAttribute('slot')).to.equal(
      'insight',
    );
    expect(el.issues).to.include('$[0][1]: unknown slot "nowhere"');
    expect(el.issues).to.include('$[0][2]: $[0] takes no text');
  });

  it('shows streamed JSON as it arrives and keeps the same elements', async () => {
    const full =
      '[{"type": "stat", "props": {"label": "Open incidents", "value": 42}}, {"type": "text", "children": ["Most are the export failure"]}]';
    const upTo = (text: string) => full.slice(0, full.indexOf(text));
    const el = await view(upTo('cidents'), { streaming: true });
    const stat = content(el).querySelector('wc-stat') as Stat;
    expect(stat.label).to.equal('Open in');
    el.value = upTo('export');
    await el.updateComplete;
    expect(content(el).querySelector('wc-stat')).to.equal(stat);
    expect(stat.value).to.equal(42);
    expect(content(el).querySelector('p')?.textContent).to.equal(
      'Most are the ',
    );
    el.value = full;
    el.streaming = false;
    await el.updateComplete;
    expect(content(el).querySelector('p')?.textContent).to.equal(
      'Most are the export failure',
    );
    expect(el.shadowRoot?.querySelector('section')?.hasAttribute('aria-busy'))
      .to.be.false;
  });

  it('turns loose text into paragraphs and follows a heading’s variant as it arrives', async () => {
    const el = await view('[{"type": "text", "children": ["Inci', {
      streaming: true,
    });
    expect(content(el).querySelector('p')?.textContent).to.equal('Inci');
    el.value =
      '[{"type": "text", "props": {"variant": "title"}, "children": ["Incidents"]}, "One", "Two"]';
    el.streaming = false;
    await el.updateComplete;
    expect(content(el).querySelector('h4')?.textContent).to.equal('Incidents');
    const paragraphs = content(el).querySelectorAll(':scope > p');
    expect(Array.from(paragraphs, p => p.textContent)).to.deep.equal([
      'One',
      'Two',
    ]);
  });

  it('shows a table as loading until its rows arrive', async () => {
    const el = await view(
      '{"type": "table", "props": {"columns": [{"name": "n", "label": "N"}], "data": [',
      { streaming: true },
    );
    const table = content(el).querySelector('wc-table') as HTMLElement & {
      loading: boolean;
    };
    expect(table.loading).to.equal(true);
    el.value =
      '{"type": "table", "props": {"columns": [{"name": "n", "label": "N"}], "data": [{"n": 1}]}}';
    el.streaming = false;
    await el.updateComplete;
    expect(table.loading).to.not.equal(true);
  });

  it('shows a typing indicator until the first node arrives', async () => {
    const el = await view('[{"ty', { streaming: true });
    expect(el.shadowRoot?.querySelector('wc-typing-indicator')).to.exist;
  });

  it('restores a prop the next value leaves out', async () => {
    const el = await view({
      type: 'stat',
      props: { label: 'A', variant: 'filled' },
    });
    const stat = content(el).querySelector('wc-stat') as Stat;
    expect(stat.variant).to.equal('filled');
    el.value = { type: 'stat', props: { label: 'A' } };
    await el.updateComplete;
    expect(content(el).querySelector('wc-stat')).to.equal(stat);
    expect(stat.variant).to.equal('outlined');
  });

  it('resolves citations through the app’s citations', async () => {
    const el = await view(
      { type: 'citation', props: { value: 'inc_2318', label: '1' } },
      {
        citations: [
          {
            id: 'inc_2318',
            headline: 'INC-2318',
            supportingText: 'IT service desk',
          },
        ],
      },
    );
    const citation = content(el).querySelector('wc-citation') as Citation;
    expect(citation.headline).to.equal('INC-2318');
    expect(citation.supportingText).to.equal('IT service desk');
  });

  it('reports JSON it cannot read', async () => {
    const el = await view('{"type": ');
    expect(el.issues).to.deep.equal(['$: value is not JSON']);
    expect(content(el).childNodes).to.have.length(0);
  });

  it('renders nothing while AI is off, and can drop its marker', async () => {
    setPeacockAi({ enabled: false });
    const off = await view({ type: 'stat', props: { label: 'A' } });
    expect(off.shadowRoot?.querySelector('section')).to.equal(null);
    setPeacockAi({});
    const bare = await view(
      { type: 'stat', props: { label: 'A' } },
      {
        hideBadge: true,
      },
    );
    expect(bare.shadowRoot?.querySelector('wc-ai-badge')).to.equal(null);
    expect(content(bare).querySelector('wc-stat')).to.exist;
  });
});

describe('cleanValue', () => {
  it('cuts the tree at the depth and node limits', () => {
    let deep: unknown = { type: 'text', children: ['bottom'] };
    for (let i = 0; i < LIMITS.depth + 2; i += 1)
      deep = { type: 'stack', children: [deep] };
    const { issues } = cleanValue(deep);
    expect(issues.some(issue => issue.includes('nested deeper'))).to.equal(
      true,
    );

    const many = Array.from({ length: LIMITS.nodes + 10 }, () => ({
      type: 'divider',
    }));
    const result = cleanValue(many);
    expect(result.nodes).to.have.length(LIMITS.nodes);
    expect(result.issues.some(issue => issue.includes('more than'))).to.equal(
      true,
    );
  });

  it('keeps only plain JSON in array and object props', () => {
    const value = JSON.parse('{"a": [1, "b", null], "__proto__": {"x": 1}}');
    expect(cleanJson(value)).to.deep.equal({ a: [1, 'b', null] });
    expect(cleanJson({ f: () => 1 })).to.equal(undefined);
    expect(cleanJson(new Date())).to.equal(undefined);
    expect(cleanJson({ n: Infinity })).to.equal(undefined);
    expect(
      cleanJson({
        a: { label: 'A', color: 'url(https://evil.example/x.svg#p)' },
        b: { color: 'var(--color-chart-2)' },
        c: { color: '#ff0066' },
      }),
    ).to.deep.equal({
      a: { label: 'A' },
      b: { color: 'var(--color-chart-2)' },
      c: { color: '#ff0066' },
    });
  });
});

describe('parsePartialJson', () => {
  it('closes cut-off strings, arrays and objects', () => {
    expect(
      parsePartialJson('{"type": "stat", "props": {"label": "Op'),
    ).to.deep.equal({ type: 'stat', props: { label: 'Op' } });
    expect(parsePartialJson('[{"type": "a"}, {"ty')).to.deep.equal([
      { type: 'a' },
      {},
    ]);
    expect(parsePartialJson('{"a": 1, "b": tr')).to.deep.equal({ a: 1 });
    expect(parsePartialJson('{"a": "x\\')).to.deep.equal({ a: 'x' });
    expect(parsePartialJson('')).to.equal(undefined);
    expect(parsePartialJson('[1, 2]')).to.deep.equal([1, 2]);
  });
});

describe('generativeViewSchema', () => {
  it('describes every component and prop of the catalog, and nothing else', () => {
    const schema = generativeViewSchema();
    const defs = schema.$defs as Record<string, Record<string, unknown>>;
    for (const [type, entry] of Object.entries(catalog)) {
      const def = defs[type];
      expect(def, type).to.exist;
      expect(def.additionalProperties).to.equal(false);
      const { props } = def.properties as Record<
        string,
        Record<string, unknown>
      >;
      expect(
        Object.keys(props.properties as Record<string, unknown>),
      ).to.deep.equal(Object.keys(entry.props));
      expect(props.additionalProperties).to.equal(false);
    }
    const node = defs.node.anyOf as { $ref: string }[];
    expect(node.map(ref => ref.$ref.split('/').pop())).to.deep.equal([
      'text',
      ...Object.keys(catalog),
    ]);
  });

  it('allows nothing that can navigate, load an address or run code', () => {
    const risky =
      /^(href|src|target|rel|download|srcdoc|action|formaction)$|Template$|Formatter$|^on/i;
    for (const [type, entry] of Object.entries(catalog)) {
      for (const name of Object.keys(entry.props))
        expect(risky.test(name), `${type}.${name}`).to.equal(false);
    }
  });
});

/// <reference types="mocha" />
import { html } from 'lit';
import {
  aTimeout,
  expect,
  fixture,
  oneEvent,
  waitUntil,
} from '@open-wc/testing';
import { setPeacockAi } from '../src/__internal/ai/config.js';
import type { AiParseRequest } from '../src/__internal/ai/types.js';
import { AiBadge } from '../src/ai-badge/index.js';
import {
  AiSummary,
  type AiSummaryFeedbackDetail,
} from '../src/ai-summary/index.js';
import { CommandPalette } from '../src/command-palette/index.js';
import { CommentComposer } from '../src/comment-composer/index.js';
import {
  CbRule,
  ConditionBuilder,
  type ConditionBuilderDescribeDetail,
} from '../src/condition-builder/index.js';
import { Discussion } from '../src/discussion/index.js';
import {
  FilterBar,
  filtersFromParse,
  type FilterBarChangeDetail,
  type FilterDefinition,
} from '../src/filter-bar/index.js';
import { Markdown } from '../src/markdown/markdown.js';
import { Search } from '../src/search/index.js';
import { Stat } from '../src/stat/index.js';
import { mockAi } from './helpers/mock-ai.js';

for (const [tag, element] of [
  ['wc-ai-badge', AiBadge],
  ['wc-ai-summary', AiSummary],
  ['wc-cb-rule', CbRule],
  ['wc-command-palette', CommandPalette],
  ['wc-comment-composer', CommentComposer],
  ['wc-condition-builder', ConditionBuilder],
  ['wc-discussion', Discussion],
  ['wc-filter-bar', FilterBar],
  ['wc-markdown', Markdown],
  ['wc-search', Search],
  ['wc-stat', Stat],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

const root = (el: Element) => el.shadowRoot as ShadowRoot;

describe('AiSummary', () => {
  afterEach(() => setPeacockAi({}));

  it('shows the summary marked as the assistant’s, with its actions', async () => {
    const el = await fixture<AiSummary>(
      html`<wc-ai-summary
        headline="For you today"
        badge-label="Summary by the assistant"
        value="- Leave waiting"
      ></wc-ai-summary>`,
    );
    expect(root(el).querySelector('.headline')?.textContent?.trim()).to.equal(
      'For you today',
    );
    expect(root(el).querySelector('wc-ai-badge')?.textContent?.trim()).to.equal(
      'Summary by the assistant',
    );
    expect((root(el).querySelector('wc-markdown') as Markdown).value).to.equal(
      '- Leave waiting',
    );
    const [again, hide] = Array.from(
      root(el).querySelectorAll('.header wc-icon-button'),
    ) as HTMLElement[];
    setTimeout(() => again.click());
    await oneEvent(el, 'regenerate');
    setTimeout(() => hide.click());
    await oneEvent(el, 'dismiss');
    const up = root(el).querySelector('.footer wc-icon-button') as HTMLElement;
    setTimeout(() => up.click());
    const event = (await oneEvent(
      el,
      'feedback',
    )) as CustomEvent<AiSummaryFeedbackDetail>;
    expect(event.detail.value).to.equal('up');
  });

  it('shows the status while loading and offers Try again on error', async () => {
    const el = await fixture<AiSummary>(
      html`<wc-ai-summary
        headline="Thread"
        loading
        status="Reading 14 comments…"
      ></wc-ai-summary>`,
    );
    expect(
      root(el).querySelector('wc-typing-indicator')?.getAttribute('label'),
    ).to.equal('Reading 14 comments…');
    expect(root(el).querySelector('.footer wc-icon-button')).to.equal(null);
    el.loading = false;
    el.error = true;
    await el.updateComplete;
    expect(root(el).querySelector('.error')?.textContent).to.contain(
      "The summary couldn't be written.",
    );
    setTimeout(() =>
      (root(el).querySelector('.footer wc-button') as HTMLElement).click(),
    );
    await oneEvent(el, 'regenerate');
  });

  it('has a one-line inline variant', async () => {
    const el = await fixture<AiSummary>(
      html`<wc-ai-summary
        variant="inline"
        value="Up 35% since Monday."
      ></wc-ai-summary>`,
    );
    expect(root(el).querySelector('.inline .sparkle')).to.not.equal(null);
    expect(root(el).querySelector('.header')).to.equal(null);
    expect((root(el).querySelector('wc-markdown') as Markdown).inline).to.equal(
      true,
    );
  });

  it('renders nothing while AI is off', async () => {
    setPeacockAi({ enabled: false });
    const el = await fixture<AiSummary>(
      html`<wc-ai-summary value="x"></wc-ai-summary>`,
    );
    expect(root(el).childElementCount).to.equal(0);
  });
});

describe('Search with ask', () => {
  afterEach(() => setPeacockAi({}));

  const input = (el: Search) =>
    root(el).querySelector('input') as HTMLInputElement;
  const key = (el: Search, init: { key: string; ctrlKey?: boolean }) =>
    input(el).dispatchEvent(
      new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        ...init,
      }),
    );

  it('asks with the Ask button and Ctrl+Enter, and still searches on Enter', async () => {
    const el = await fixture<Search>(
      html`<wc-search
        ask
        placeholder="Search"
        ask-placeholder="Ask for something, or search"
        value="who can see salaries"
      ></wc-search>`,
    );
    expect(input(el).placeholder).to.equal('Ask for something, or search');
    const button = root(el).querySelector('.ask-button') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).to.equal('Ask the assistant');
    setTimeout(() => button.click());
    let event = (await oneEvent(el, 'ask')) as CustomEvent<{ value: string }>;
    expect(event.detail.value).to.equal('who can see salaries');

    let searched = false;
    el.addEventListener('search', () => {
      searched = true;
    });
    setTimeout(() => key(el, { key: 'Enter', ctrlKey: true }));
    event = (await oneEvent(el, 'ask')) as CustomEvent<{ value: string }>;
    expect(searched).to.equal(false);
    key(el, { key: 'Enter' });
    expect(searched).to.equal(true);
  });

  it('is a plain search without ask or while AI is off', async () => {
    const plain = await fixture<Search>(
      html`<wc-search value="x"></wc-search>`,
    );
    expect(root(plain).querySelector('.ask-button')).to.equal(null);

    setPeacockAi({ enabled: false });
    const off = await fixture<Search>(
      html`<wc-search
        ask
        ask-placeholder="Ask…"
        placeholder="Search apps"
        value="x"
      ></wc-search>`,
    );
    expect(root(off).querySelector('.ask-button')).to.equal(null);
    expect(input(off).placeholder).to.equal('Search apps');
    let asked = false;
    off.addEventListener('ask', () => {
      asked = true;
    });
    setTimeout(() => key(off, { key: 'Enter', ctrlKey: true }));
    await oneEvent(off, 'search');
    expect(asked).to.equal(false);
  });
});

describe('CommandPalette with ask', () => {
  afterEach(() => setPeacockAi({}));

  async function palette(ask = true) {
    const el = await fixture<CommandPalette>(
      html`<wc-command-palette ?ask=${ask}></wc-command-palette>`,
    );
    el.commands = [
      { id: 'expense', label: 'New expense claim' },
      { id: 'leave', label: 'Request leave' },
    ];
    el.show();
    await el.updateComplete;
    return el;
  }
  const typeQuery = async (el: CommandPalette, text: string) => {
    const field = root(el).querySelector('.search-input') as HTMLInputElement;
    field.value = text;
    field.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await el.updateComplete;
  };
  const labels = (el: CommandPalette) =>
    Array.from(root(el).querySelectorAll('.option-label')).map(label =>
      label.textContent?.trim(),
    );

  it('puts Ask first for a question and last for a command name', async () => {
    const el = await palette();
    await typeQuery(el, 'who approved the trip?');
    expect(labels(el)[0]).to.equal(
      'Ask the assistant: “who approved the trip?”',
    );
    await typeQuery(el, 'expense');
    expect(labels(el)).to.deep.equal([
      'New expense claim',
      'Ask the assistant: “expense”',
    ]);
  });

  it('fires ask and closes, unless cancelled', async () => {
    const el = await palette();
    await typeQuery(el, 'what is waiting for me?');
    const field = root(el).querySelector('.search-input') as HTMLInputElement;
    el.addEventListener('ask', event => event.preventDefault(), { once: true });
    field.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Enter',
        bubbles: true,
        cancelable: true,
      }),
    );
    expect(el.open).to.equal(true);
    setTimeout(() =>
      field.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    const event = (await oneEvent(el, 'ask')) as CustomEvent<{ value: string }>;
    expect(event.detail.value).to.equal('what is waiting for me?');
    await el.updateComplete;
    expect(el.open).to.equal(false);
  });

  it('offers no Ask row without ask or while AI is off', async () => {
    const plain = await palette(false);
    await typeQuery(plain, 'who approved the trip?');
    expect(labels(plain).some(label => label?.startsWith('Ask'))).to.equal(
      false,
    );
    setPeacockAi({ enabled: false });
    const off = await palette(true);
    await typeQuery(off, 'who approved the trip?');
    expect(labels(off).some(label => label?.startsWith('Ask'))).to.equal(false);
  });
});

const FILTERS: FilterDefinition[] = [
  {
    key: 'urgency',
    label: 'Urgency',
    type: 'select',
    options: [
      { label: '1 · High', value: '1' },
      { label: '3 · Medium', value: '3' },
    ],
  },
  {
    key: 'category',
    label: 'Category',
    type: 'multiselect',
    options: [{ label: 'Hardware', value: 'hw' }],
  },
  { key: 'mine', label: 'Assigned to me', type: 'boolean' },
  { key: 'opened', label: 'Opened', type: 'date-range' },
];

describe('Filters from a sentence', () => {
  afterEach(() => setPeacockAi({}));

  it('keeps only known filters with valid values', () => {
    expect(
      filtersFromParse(
        {
          urgency: '1',
          category: ['hw', 'nonsense'],
          mine: 'yes',
          opened: '2026-10-26/2026-11-01',
          salary: '9000',
          q: 'Pune',
        },
        FILTERS,
      ),
    ).to.deep.equal({
      urgency: '1',
      category: ['hw'],
      opened: '2026-10-26/2026-11-01',
      q: 'Pune',
    });
    expect(filtersFromParse({ urgency: '7' }, FILTERS)).to.deep.equal({});
    expect(filtersFromParse('not an object', FILTERS)).to.deep.equal({});
  });

  it('turns the search text into suggested filters, and the badge puts the old ones back', async () => {
    const provider = mockAi({
      parse: { value: { urgency: '1', category: ['hw'], q: 'Pune' } },
    });
    setPeacockAi({ provider });
    const el = await fixture<FilterBar>(
      html`<wc-filter-bar search></wc-filter-bar>`,
    );
    el.filters = FILTERS;
    el.value = { mine: true, q: 'urgent hardware incidents in Pune' };
    await el.updateComplete;
    const button = root(el).querySelector('.from-sentence') as HTMLElement;
    expect(button).to.not.equal(null);
    setTimeout(() => button.click());
    const change = (await oneEvent(
      el,
      'change',
    )) as CustomEvent<FilterBarChangeDetail>;
    expect(change.detail.value).to.deep.equal({
      mine: true,
      urgency: '1',
      category: ['hw'],
      q: 'Pune',
    });
    const request = provider.requests[0].request as AiParseRequest;
    expect(request.target).to.equal('filter-bar');
    expect(request.text).to.equal('urgent hardware incidents in Pune');
    await el.updateComplete;
    const suggested = Array.from(
      root(el).querySelectorAll('.filter-chip.suggested'),
    ).map(chip => (chip as HTMLElement).dataset.key);
    expect(suggested).to.deep.equal(['urgency', 'category']);

    const badge = root(el).querySelector('.suggestion-badge') as AiBadge;
    await badge.updateComplete;
    setTimeout(() =>
      (
        badge.shadowRoot!.querySelector('.dismiss') as HTMLButtonElement
      ).click(),
    );
    const restored = (await oneEvent(
      el,
      'change',
    )) as CustomEvent<FilterBarChangeDetail>;
    expect(restored.detail.value).to.deep.equal({
      mine: true,
      q: 'urgent hardware incidents in Pune',
    });
    await el.updateComplete;
    expect(root(el).querySelector('.suggestion-badge')).to.equal(null);
  });

  it('offers nothing for short text, with no-ai, or without parse', async () => {
    setPeacockAi({ provider: mockAi({ parse: { value: {} } }) });
    const el = await fixture<FilterBar>(
      html`<wc-filter-bar search></wc-filter-bar>`,
    );
    el.filters = FILTERS;
    el.value = { q: 'laptop' };
    await el.updateComplete;
    expect(root(el).querySelector('.from-sentence')).to.equal(null);
    el.value = { q: 'urgent hardware in Pune' };
    el.noAi = true;
    await el.updateComplete;
    expect(root(el).querySelector('.from-sentence')).to.equal(null);
    setPeacockAi({});
    el.noAi = false;
    await el.updateComplete;
    expect(root(el).querySelector('.from-sentence')).to.equal(null);
  });
});

describe('Describe the condition', () => {
  afterEach(() => setPeacockAi({}));

  it('sends the sentence and schema, and fires describe with the answer', async () => {
    const answer = {
      operator: 'and',
      rules: [{ field: 'priority', operator: 'is', value: '1' }],
    };
    const provider = mockAi({ parse: { value: answer } });
    setPeacockAi({ provider });
    const el = await fixture<ConditionBuilder>(
      html`<wc-condition-builder></wc-condition-builder>`,
    );
    el.aiSchema = [{ key: 'priority', label: 'Priority' }];
    await el.updateComplete;
    const input = root(el).querySelector('.describe-input') as HTMLInputElement;
    input.value = 'P1 incidents';
    setTimeout(() =>
      input.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: 'Enter',
          bubbles: true,
          cancelable: true,
        }),
      ),
    );
    const event = (await oneEvent(
      el,
      'describe',
    )) as CustomEvent<ConditionBuilderDescribeDetail>;
    expect(event.detail).to.deep.equal({ text: 'P1 incidents', value: answer });
    const request = provider.requests[0].request as AiParseRequest;
    expect(request.target).to.equal('condition-builder');
    expect(request.schema).to.deep.equal([
      { key: 'priority', label: 'Priority' },
    ]);
  });

  it('marks a suggested rule until one of its controls changes', async () => {
    const rule = await fixture<CbRule>(
      html`<wc-cb-rule suggested><input name="value" value="1" /></wc-cb-rule>`,
    );
    expect(root(rule).querySelector('.suggested-badge')).to.not.equal(null);
    rule
      .querySelector('input')!
      .dispatchEvent(new Event('change', { bubbles: true }));
    await rule.updateComplete;
    expect(rule.suggested).to.equal(false);
    expect(root(rule).querySelector('.suggested-badge')).to.equal(null);
  });

  it('offers no describe box without parse', async () => {
    const el = await fixture<ConditionBuilder>(
      html`<wc-condition-builder></wc-condition-builder>`,
    );
    expect(root(el).querySelector('.describe')).to.equal(null);
  });
});

describe('Suggested replies and slots', () => {
  afterEach(() => setPeacockAi({}));

  it('drafts a reply in the discussion composer, marked until edited', async () => {
    const el = await fixture<Discussion>(html`<wc-discussion></wc-discussion>`);
    el.suggestReply(
      'Thanks Ravi. Mei, can you confirm?',
      'Ravi asked for a check.',
    );
    const composer = root(el).querySelector(
      'wc-comment-composer',
    ) as CommentComposer;
    await composer.updateComplete;
    await aTimeout(20);
    expect(composer.value).to.equal('Thanks Ravi. Mei, can you confirm?');
    const marker = root(composer).querySelector('.suggestion wc-ai-badge');
    expect(marker?.textContent?.trim()).to.equal('Suggested reply');
    expect(
      root(composer).querySelector('.suggestion-reason')?.textContent,
    ).to.equal('Ravi asked for a check.');
    composer.dismissSuggestion();
    await composer.updateComplete;
    expect(composer.value).to.equal('');
    expect(root(composer).querySelector('.suggestion')).to.equal(null);
  });

  it('gives discussions a summary slot and stats an insight slot', async () => {
    const discussion = await fixture<Discussion>(
      html`<wc-discussion></wc-discussion>`,
    );
    expect(root(discussion).querySelector('slot[name="summary"]')).to.not.equal(
      null,
    );
    const stat = await fixture<Stat>(
      html`<wc-stat label="Open" value="42"></wc-stat>`,
    );
    expect(root(stat).querySelector('slot[name="insight"]')).to.not.equal(null);
  });

  it('accepts a drafted reply when it is sent', async () => {
    const composer = await fixture<CommentComposer>(
      html`<wc-comment-composer></wc-comment-composer>`,
    );
    composer.suggestion = { value: 'Looks good', reason: '' };
    await composer.updateComplete;
    await waitUntil(() => composer.suggested, 'suggested');
    let cause = '';
    composer.addEventListener('accept', event => {
      cause = (event as CustomEvent<{ cause: string }>).detail.cause;
    });
    composer.submit();
    expect(cause).to.equal('submit');
  });
});

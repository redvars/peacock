/// <reference types="mocha" />
import { html } from 'lit';
import { fixtureSync, expect, waitUntil } from '@open-wc/testing';
import { Field } from '../src/field/index.js';
import { IconButton } from '../src/button/index.js';
import {
  MentionInput,
  type Mention,
  type MentionSuggestion,
} from '../src/mention-input/index.js';
import {
  findQuery,
  shiftMentions,
  validMentions,
} from '../src/mention-input/mention-model.js';

for (const [tag, element] of [
  ['wc-field', Field],
  ['wc-icon-button', IconButton],
  ['wc-mention-input', MentionInput],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

const PEOPLE: MentionSuggestion[] = [
  { id: '42', label: 'Ana Lima', description: 'Design' },
  { id: '7', label: 'Bo Chen' },
];

function textarea(el: MentionInput) {
  return el.shadowRoot!.querySelector<HTMLTextAreaElement>('.input-element')!;
}

function list(el: MentionInput) {
  return el.shadowRoot!.querySelector<HTMLElement>('.suggestions')!;
}

/** Types `text` at the caret the way a person would: value, caret, `input`. */
function type(el: MentionInput, text: string) {
  const area = textarea(el);
  const at = area.selectionEnd;
  area.value = area.value.slice(0, at) + text + area.value.slice(at);
  area.setSelectionRange(at + text.length, at + text.length);
  area.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
}

function key(
  el: MentionInput,
  name: string,
  init: { ctrlKey?: boolean; shiftKey?: boolean } = {},
) {
  const event = new KeyboardEvent('keydown', {
    key: name,
    bubbles: true,
    composed: true,
    cancelable: true,
    ...init,
  });
  textarea(el).dispatchEvent(event);
  return event;
}

async function setup(template = html`<wc-mention-input></wc-mention-input>`) {
  const el = fixtureSync<MentionInput>(template);
  await el.updateComplete;
  // Answer every search with the matching people, as an app would.
  el.addEventListener('search', event => {
    const { query } = (event as CustomEvent<{ query: string }>).detail;
    el.suggestions = PEOPLE.filter(person =>
      person.label.toLowerCase().includes(query.toLowerCase()),
    );
  });
  textarea(el).focus();
  return el;
}

describe('mention model', () => {
  it('finds a query after a trigger at the start or after a space', () => {
    expect(findQuery('hi @an', 6, ['@'], [])).to.deep.equal({
      trigger: '@',
      start: 3,
      query: 'an',
    });
    expect(findQuery('@', 1, ['@'], [])?.query).to.equal('');
    expect(findQuery('mail me@x', 9, ['@'], [])).to.equal(null);
    expect(findQuery('@ana lima', 9, ['@'], [])?.query).to.equal('ana lima');
    expect(findQuery('@ana  lima', 10, ['@'], [])).to.equal(null);
    expect(findQuery('@an\nx', 5, ['@'], [])).to.equal(null);
    expect(findQuery('#bug', 4, ['@', '#'], [])?.trigger).to.equal('#');
  });

  it('does not find a query inside a mention', () => {
    const mention: Mention = {
      id: '42',
      label: 'Ana Lima',
      trigger: '@',
      start: 0,
      end: 9,
    };
    expect(findQuery('@Ana Lima', 9, ['@'], [mention])).to.equal(null);
  });

  it('shifts mentions after an edit and drops one the edit touched', () => {
    const mention: Mention = {
      id: '42',
      label: 'Ana',
      trigger: '@',
      start: 3,
      end: 7,
    };
    expect(
      shiftMentions([mention], 'hi @Ana', 'oh hi @Ana', 3)[0].start,
    ).to.equal(6);
    expect(
      shiftMentions([mention], 'hi @Ana', 'hi @Ana!', 8)[0].start,
    ).to.equal(3);
    expect(shiftMentions([mention], 'hi @Ana', 'hi @Aa', 5)).to.have.length(0);
    // Typing "@" right before "@Ana" moves it rather than breaking it.
    expect(
      shiftMentions([mention], 'hi @Ana', 'hi @@Ana', 4)[0].start,
    ).to.equal(4);
  });

  it('keeps only mentions that match the text', () => {
    const text = '@Ana and @Bo';
    const result = validMentions(
      [
        { id: '7', label: 'Bo', trigger: '@', start: 9, end: 12 },
        { id: '42', label: 'Ana', trigger: '@', start: 0, end: 4 },
        { id: 'x', label: 'Zed', trigger: '@', start: 0, end: 4 },
      ],
      text,
    );
    expect(result.map(m => m.id)).to.deep.equal(['42', '7']);
  });
});

describe('MentionInput', () => {
  it('fires search with the trigger and query and shows the suggestions', async () => {
    const el = await setup();
    const searches: unknown[] = [];
    el.addEventListener('search', event =>
      searches.push((event as CustomEvent).detail),
    );
    type(el, 'hi @a');
    await el.updateComplete;
    expect(searches).to.deep.equal([{ trigger: '@', query: 'a' }]);
    const options = list(el).querySelectorAll('[role="option"]');
    expect(options.length).to.equal(1);
    expect(options[0].textContent).to.contain('Ana Lima');
    expect(textarea(el).getAttribute('aria-activedescendant')).to.equal(
      options[0].id,
    );
    expect(list(el).matches(':popover-open')).to.be.true;
  });

  it('inserts the highlighted suggestion on Enter and tracks the mention', async () => {
    const el = await setup();
    const inserted: unknown[] = [];
    const inputs: { value: string; mentions: Mention[] }[] = [];
    el.addEventListener('mention', event =>
      inserted.push((event as CustomEvent).detail.mention),
    );
    el.addEventListener('input', event =>
      inputs.push((event as CustomEvent).detail),
    );
    type(el, 'hi @');
    await el.updateComplete;
    key(el, 'ArrowDown');
    await el.updateComplete;
    const enter = key(el, 'Enter');
    await el.updateComplete;

    expect(enter.defaultPrevented).to.be.true;
    expect(el.value).to.equal('hi @Bo Chen ');
    expect(textarea(el).value).to.equal('hi @Bo Chen ');
    expect(textarea(el).selectionStart).to.equal(12);
    const mention = {
      id: '7',
      label: 'Bo Chen',
      trigger: '@',
      start: 3,
      end: 11,
    };
    expect(el.mentions).to.deep.equal([mention]);
    expect(inserted).to.deep.equal([mention]);
    expect(inputs[inputs.length - 1]).to.deep.equal({
      value: 'hi @Bo Chen ',
      mentions: [mention],
    });
    expect(list(el).matches(':popover-open')).to.be.false;
  });

  it('keeps mention positions as text is typed before them', async () => {
    const el = await setup();
    type(el, '@an');
    await el.updateComplete;
    key(el, 'Tab');
    await el.updateComplete;
    textarea(el).setSelectionRange(0, 0);
    type(el, 'Hey ');
    await el.updateComplete;
    expect(el.value).to.equal('Hey @Ana Lima ');
    expect(el.mentions[0]).to.include({ start: 4, end: 13 });
  });

  it('removes a whole mention with Backspace right after it', async () => {
    const el = await setup();
    el.value = 'hi @Ana Lima';
    el.mentions = [
      { id: '42', label: 'Ana Lima', trigger: '@', start: 3, end: 12 },
    ];
    await el.updateComplete;
    textarea(el).setSelectionRange(12, 12);
    const event = key(el, 'Backspace');
    await el.updateComplete;
    expect(event.defaultPrevented).to.be.true;
    expect(el.value).to.equal('hi ');
    expect(el.mentions).to.deep.equal([]);
  });

  it('closes the list on Escape without leaving the field', async () => {
    const el = await setup();
    type(el, '@a');
    await el.updateComplete;
    const event = key(el, 'Escape');
    await el.updateComplete;
    expect(event.defaultPrevented).to.be.true;
    expect(list(el).matches(':popover-open')).to.be.false;
    // Typing more in the same query keeps it closed.
    type(el, 'n');
    await el.updateComplete;
    expect(list(el).matches(':popover-open')).to.be.false;
  });

  it('drops mentions that no longer match when value is set from outside', async () => {
    const el = await setup();
    el.value = '@Ana Lima';
    el.mentions = [
      { id: '42', label: 'Ana Lima', trigger: '@', start: 0, end: 9 },
    ];
    expect(el.mentions).to.have.length(1);
    el.value = '';
    expect(el.mentions).to.deep.equal([]);
  });

  it('shows the list while loading and marks it busy', async () => {
    const el = fixtureSync<MentionInput>(
      html`<wc-mention-input loading></wc-mention-input>`,
    );
    await el.updateComplete;
    textarea(el).focus();
    type(el, '@');
    await el.updateComplete;
    expect(list(el).matches(':popover-open')).to.be.true;
    expect(list(el).getAttribute('aria-busy')).to.equal('true');
  });

  it('takes several triggers', async () => {
    const el = await setup(
      html`<wc-mention-input triggers="@#"></wc-mention-input>`,
    );
    let detail: unknown;
    el.addEventListener('search', event => {
      detail = (event as CustomEvent).detail;
    });
    type(el, '#bug');
    expect(detail).to.deep.equal({ trigger: '#', query: 'bug' });
  });

  it('fires change on blur when the value changed', async () => {
    const el = await setup();
    let detail: unknown;
    el.addEventListener('change', event => {
      detail = (event as CustomEvent).detail;
    });
    type(el, 'hello');
    textarea(el).dispatchEvent(new FocusEvent('blur'));
    expect(detail).to.deep.equal({ value: 'hello', mentions: [] });
  });

  it('is form-associated and validates required and maxlength', async () => {
    const form = fixtureSync<HTMLFormElement>(
      html`<form>
        <wc-mention-input
          name="note"
          required
          maxlength="20"
        ></wc-mention-input>
      </form>`,
    );
    const el = form.querySelector<MentionInput>('wc-mention-input')!;
    await el.updateComplete;
    expect(el.checkValidity()).to.be.false;
    el.value = 'hi @Ana';
    await el.updateComplete;
    expect(el.checkValidity()).to.be.true;
    expect(new FormData(form).get('note')).to.equal('hi @Ana');
    expect(textarea(el).maxLength).to.equal(20);
    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal('');
  });

  it('does not insert a mention that would exceed maxlength', async () => {
    const el = await setup(
      html`<wc-mention-input maxlength="6"></wc-mention-input>`,
    );
    type(el, '@a');
    await el.updateComplete;
    key(el, 'Enter');
    await el.updateComplete;
    expect(el.value).to.equal('@a');
    expect(el.mentions).to.deep.equal([]);
  });

  it('gives the textarea its label and list semantics', async () => {
    const el = await setup(
      html`<wc-mention-input label="Comment"></wc-mention-input>`,
    );
    const area = textarea(el);
    expect(area.getAttribute('aria-label')).to.equal('Comment');
    expect(area.getAttribute('aria-autocomplete')).to.equal('list');
    expect(area.getAttribute('aria-controls')).to.equal(list(el).id);
    expect(list(el).getAttribute('role')).to.equal('listbox');
  });

  it('works as the composer of a comment thread', async () => {
    await import('../src/comment-thread/index.js').then(module => {
      if (!customElements.get('wc-comment-thread')) {
        customElements.define('wc-comment-thread', module.CommentThread);
      }
    });
    const thread = fixtureSync(
      html`<wc-comment-thread>
        <wc-mention-input slot="composer"></wc-mention-input>
      </wc-comment-thread>`,
    ) as HTMLElement & { updateComplete: Promise<unknown> };
    await thread.updateComplete;
    const el = thread.querySelector<MentionInput>('wc-mention-input')!;
    await el.updateComplete;
    let body = '';
    thread.addEventListener('submit', event => {
      body = (event as unknown as CustomEvent).detail.body;
    });
    textarea(el).focus();
    el.value = '@Ana Lima ok';
    el.mentions = [
      { id: '42', label: 'Ana Lima', trigger: '@', start: 0, end: 9 },
    ];
    textarea(el).value = el.value;
    textarea(el).dispatchEvent(
      new Event('input', { bubbles: true, composed: true }),
    );
    await thread.updateComplete;
    key(el, 'Enter', { ctrlKey: true });
    await waitUntil(() => body !== '');
    expect(body).to.equal('@Ana Lima ok');
    expect(el.value).to.equal('');
    expect(el.mentions).to.deep.equal([]);
  });
});

/// <reference types="mocha" />
import { html } from 'lit';
import {
  aTimeout,
  expect,
  fixture,
  oneEvent,
  waitUntil,
} from '@open-wc/testing';
import type { Editor } from '@tiptap/core';
import { setPeacockAi } from '../src/__internal/ai/config.js';
import { AiBadge } from '../src/ai-badge/index.js';
import {
  AssistantPanel,
  type AssistantPanelCloseDetail,
} from '../src/assistant-panel/index.js';
import { AssistantStep, AssistantSteps } from '../src/assistant-steps/index.js';
import {
  ChatMessage,
  type ChatMessageFeedbackDetail,
  type ChatMessageSuggestionDetail,
} from '../src/chat-message/index.js';
import {
  ChatEvent,
  ChatThread,
  type ChatThreadSuggestionDetail,
} from '../src/chat-thread/index.js';
import { DraftCard } from '../src/draft-card/index.js';
import { Markdown } from '../src/markdown/markdown.js';
import {
  PromptInput,
  type PromptInputSubmitDetail,
} from '../src/prompt-input/index.js';
import { SideSheet } from '../src/side-sheet/index.js';
import { TypingIndicator } from '../src/typing-indicator/index.js';

for (const [tag, element] of [
  ['wc-ai-badge', AiBadge],
  ['wc-assistant-panel', AssistantPanel],
  ['wc-assistant-step', AssistantStep],
  ['wc-assistant-steps', AssistantSteps],
  ['wc-chat-event', ChatEvent],
  ['wc-chat-message', ChatMessage],
  ['wc-chat-thread', ChatThread],
  ['wc-draft-card', DraftCard],
  ['wc-markdown', Markdown],
  ['wc-prompt-input', PromptInput],
  ['wc-side-sheet', SideSheet],
  ['wc-typing-indicator', TypingIndicator],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

const root = (el: Element) => el.shadowRoot as ShadowRoot;
const tiptap = (el: PromptInput) =>
  (el as unknown as { editor: Editor }).editor;
const press = (el: PromptInput, key: string, shiftKey = false) =>
  tiptap(el).view.dom.dispatchEvent(
    new KeyboardEvent('keydown', {
      key,
      shiftKey,
      bubbles: true,
      cancelable: true,
    }),
  );

describe('PromptInput', () => {
  it('sends with Enter, with the mentions, and empties the box', async () => {
    const el = await fixture<PromptInput>(
      html`<wc-prompt-input></wc-prompt-input>`,
    );
    tiptap(el)
      .chain()
      .focus()
      .insertContent('Why is ')
      .insertContent({
        type: 'mention',
        attrs: { id: 'inc_2318', label: 'INC-2318', trigger: '@' },
      })
      .insertContent(' still open?')
      .run();
    setTimeout(() => press(el, 'Enter'));
    const event = (await oneEvent(
      el,
      'submit',
    )) as CustomEvent<PromptInputSubmitDetail>;
    expect(event.detail.value).to.equal(
      'Why is [@INC-2318](mention:inc_2318) still open?',
    );
    expect(event.detail.mentions).to.deep.equal([
      { id: 'inc_2318', label: 'INC-2318', trigger: '@' },
    ]);
    await el.updateComplete;
    expect(el.value).to.equal('');
    expect(tiptap(el).getText()).to.equal('');
  });

  it('keeps the text when submit is cancelled, and sends nothing when empty', async () => {
    const el = await fixture<PromptInput>(
      html`<wc-prompt-input></wc-prompt-input>`,
    );
    let count = 0;
    el.addEventListener('submit', event => {
      count += 1;
      event.preventDefault();
    });
    press(el, 'Enter');
    expect(count).to.equal(0);
    tiptap(el).chain().focus().insertContent('Hello').run();
    press(el, 'Enter');
    expect(count).to.equal(1);
    await el.updateComplete;
    expect(tiptap(el).getText()).to.equal('Hello');
  });

  it('starts a new line with Shift+Enter', async () => {
    const el = await fixture<PromptInput>(
      html`<wc-prompt-input></wc-prompt-input>`,
    );
    tiptap(el).chain().focus().insertContent('One').run();
    press(el, 'Enter', true);
    tiptap(el).chain().insertContent('Two').run();
    expect(tiptap(el).getJSON().content?.length).to.equal(2);
  });

  it('turns Send into Stop while loading, and Enter does not send', async () => {
    const el = await fixture<PromptInput>(
      html`<wc-prompt-input loading></wc-prompt-input>`,
    );
    tiptap(el).chain().focus().insertContent('Hello').run();
    let sent = false;
    el.addEventListener('submit', () => {
      sent = true;
    });
    press(el, 'Enter');
    expect(sent).to.equal(false);
    const stop = root(el).querySelector('.action.stop') as HTMLElement;
    expect(stop.getAttribute('aria-label')).to.equal('Stop');
    setTimeout(() => stop.click());
    await oneEvent(el, 'stop');
    el.loading = false;
    await el.updateComplete;
    expect(root(el).querySelector('.action.send')).to.not.equal(null);
  });

  it('holds no formatting and offers no slash menu', async () => {
    const el = await fixture<PromptInput>(
      html`<wc-prompt-input></wc-prompt-input>`,
    );
    const { schema } = tiptap(el);
    expect(schema.marks.bold).to.equal(undefined);
    expect(schema.nodes.heading).to.equal(undefined);
    tiptap(el).chain().focus().insertContent('/').run();
    await aTimeout(20);
    await el.updateComplete;
    expect(
      root(el).querySelector('.slash-menu')?.matches(':popover-open'),
    ).to.not.equal(true);
  });
});

describe('ChatMessage', () => {
  it("shows the person's text in a bubble and the answer as content", async () => {
    const user = await fixture<ChatMessage>(
      html`<wc-chat-message from="user" value="Hello"></wc-chat-message>`,
    );
    expect(root(user).querySelector('.bubble wc-markdown')).to.not.equal(null);
    expect(
      root(user).querySelector('article')?.getAttribute('aria-label'),
    ).to.equal('You');
    expect(root(user).querySelector('.actions')).to.equal(null);

    const answer = await fixture<ChatMessage>(
      html`<wc-chat-message value="Hi **there**"></wc-chat-message>`,
    );
    expect(root(answer).querySelector('.content wc-markdown')).to.not.equal(
      null,
    );
    expect(answer.authorName).to.equal('Assistant');
    expect(root(answer).querySelector('.actions wc-copy-button')).to.not.equal(
      null,
    );
  });

  it('shows the status while an answer has no words yet, and no actions while streaming', async () => {
    const el = await fixture<ChatMessage>(
      html`<wc-chat-message
        streaming
        status="Looking up your laptop…"
      ></wc-chat-message>`,
    );
    const typing = root(el).querySelector('wc-typing-indicator');
    expect(typing?.getAttribute('label')).to.equal('Looking up your laptop…');
    el.value = 'Desk support';
    await el.updateComplete;
    expect(root(el).querySelector('wc-typing-indicator')).to.equal(null);
    expect(
      (root(el).querySelector('wc-markdown') as Markdown).streaming,
    ).to.equal(true);
    expect(root(el).querySelector('.actions')).to.equal(null);
  });

  it('toggles feedback and asks again', async () => {
    const el = await fixture<ChatMessage>(
      html`<wc-chat-message value="Answer"></wc-chat-message>`,
    );
    const [again, up] = Array.from(
      root(el).querySelectorAll('.actions wc-icon-button'),
    ) as HTMLElement[];
    setTimeout(() => up.click());
    let event = (await oneEvent(
      el,
      'feedback',
    )) as CustomEvent<ChatMessageFeedbackDetail>;
    expect(event.detail.value).to.equal('up');
    expect(el.feedback).to.equal('up');
    setTimeout(() => up.click());
    event = (await oneEvent(
      el,
      'feedback',
    )) as CustomEvent<ChatMessageFeedbackDetail>;
    expect(event.detail.value).to.equal('');
    setTimeout(() => again.click());
    await oneEvent(el, 'regenerate');
  });

  it('says when the answer failed, with Try again', async () => {
    const el = await fixture<ChatMessage>(
      html`<wc-chat-message error></wc-chat-message>`,
    );
    const error = root(el).querySelector('.error') as HTMLElement;
    expect(error.getAttribute('role')).to.equal('alert');
    expect(error.textContent).to.contain("The assistant couldn't answer.");
    setTimeout(() => (error.querySelector('wc-button') as HTMLElement).click());
    await oneEvent(el, 'regenerate');
  });

  it("shows a participant's text in a bubble under their name, with no actions", async () => {
    const el = await fixture<ChatMessage>(
      html`<wc-chat-message
        from="participant"
        author="Priya Shah"
        channel="Teams"
        datetime="2026-11-08T09:41:00"
        locale="en-GB"
        value="VPN keeps dropping."
      ></wc-chat-message>`,
    );
    const header = root(el).querySelector('.header') as HTMLElement;
    expect(header.hidden).to.equal(false);
    expect(header.querySelector('.author')?.textContent?.trim()).to.equal(
      'Priya Shah',
    );
    expect(header.querySelector('.channel')?.textContent?.trim()).to.equal(
      'via Teams',
    );
    const time = header.querySelector('time') as HTMLTimeElement;
    expect(time.dateTime).to.equal('2026-11-08T09:41:00');
    // A clock time, with the date before it on any day but today.
    expect(time.textContent?.trim()).to.match(/9:41/);
    expect(time.title).to.contain('2026');
    expect(root(el).querySelector('.participant .bubble')).to.not.equal(null);
    expect(root(el).querySelector('.actions')).to.equal(null);

    const nameless = await fixture<ChatMessage>(
      html`<wc-chat-message from="participant" value="Hi"></wc-chat-message>`,
    );
    expect(nameless.authorName).to.equal('Participant');
  });

  it('shows the header only when there is something to say, including the meta slot', async () => {
    const bare = await fixture<ChatMessage>(
      html`<wc-chat-message value="Answer"></wc-chat-message>`,
    );
    expect(
      (root(bare).querySelector('.header') as HTMLElement).hidden,
    ).to.equal(true);

    const noted = await fixture<ChatMessage>(
      html`<wc-chat-message from="user" value="Checked the gateway"
        ><span slot="meta">Work note</span></wc-chat-message
      >`,
    );
    await waitUntil(
      () => !(root(noted).querySelector('.header') as HTMLElement).hidden,
      'header shown for meta',
    );
    expect(
      root(noted).querySelector('.header .author')?.textContent?.trim(),
    ).to.equal('You');
  });

  it('offers quick replies once complete and fires suggestion-select', async () => {
    const el = await fixture<ChatMessage>(
      html`<wc-chat-message value="Done." streaming></wc-chat-message>`,
    );
    el.suggestions = ['Promote to major incident', 'Why P2?'];
    await el.updateComplete;
    expect(root(el).querySelector('.suggestions')).to.equal(null);
    el.streaming = false;
    await el.updateComplete;
    const group = root(el).querySelector('.suggestions') as HTMLElement;
    expect(group.getAttribute('role')).to.equal('group');
    expect(group.getAttribute('aria-label')).to.equal('Suggested replies');
    const chips = group.querySelectorAll('wc-chip');
    expect(chips.length).to.equal(2);
    setTimeout(() => (chips[1] as HTMLElement).click());
    const event = (await oneEvent(
      el,
      'suggestion-select',
    )) as CustomEvent<ChatMessageSuggestionDetail>;
    expect(event.detail.value).to.equal('Why P2?');
  });
});

describe('ChatEvent', () => {
  it('says what happened with its icon and time', async () => {
    const el = await fixture<ChatEvent>(
      html`<wc-chat-event icon="verified" datetime="2026-11-08T10:07:00"
        ><strong>Alan Kay</strong> confirmed the rollback</wc-chat-event
      >`,
    );
    expect(
      root(el).querySelector('wc-icon')?.getAttribute('aria-hidden'),
    ).to.equal('true');
    expect(root(el).querySelector('wc-icon')?.getAttribute('name')).to.equal(
      'verified',
    );
    expect(
      (root(el).querySelector('time') as HTMLTimeElement).dateTime,
    ).to.equal('2026-11-08T10:07:00');
    expect(el.textContent?.trim()).to.equal('Alan Kay confirmed the rollback');

    const plain = await fixture<ChatEvent>(
      html`<wc-chat-event>Joined</wc-chat-event>`,
    );
    expect(root(plain).querySelector('wc-icon')).to.equal(null);
    expect(root(plain).querySelector('time')).to.equal(null);
  });

  it('counts as content in a thread', async () => {
    const el = await fixture<ChatThread>(
      html`<wc-chat-thread style="height: 200px"
        ><wc-chat-event>Incident opened</wc-chat-event></wc-chat-thread
      >`,
    );
    await el.updateComplete;
    expect((root(el).querySelector('.empty') as HTMLElement).hidden).to.equal(
      true,
    );
  });
});

describe('ChatThread', () => {
  it('shows the empty slot and prompt starters until the first message', async () => {
    const el = await fixture<ChatThread>(
      html`<wc-chat-thread style="height: 300px"
        ><p slot="empty">What can I help with?</p></wc-chat-thread
      >`,
    );
    el.suggestions = ['Request leave', 'Report a problem'];
    await el.updateComplete;
    const empty = root(el).querySelector('.empty') as HTMLElement;
    expect(empty.hidden).to.equal(false);
    const chips = root(el).querySelectorAll('.suggestions wc-chip');
    expect(chips.length).to.equal(2);
    setTimeout(() => (chips[1] as HTMLElement).click());
    const event = (await oneEvent(
      el,
      'suggestion-select',
    )) as CustomEvent<ChatThreadSuggestionDetail>;
    expect(event.detail.value).to.equal('Report a problem');

    const message = document.createElement('wc-chat-message') as ChatMessage;
    message.value = 'Hi';
    el.append(message);
    await waitUntil(() => empty.hidden, 'empty hidden');
  });

  it('announces an answer once it is complete, but not history or the person', async () => {
    const el = await fixture<ChatThread>(
      html`<wc-chat-thread style="height: 300px">
        <wc-chat-message value="Old answer"></wc-chat-message>
      </wc-chat-thread>`,
    );
    const status = () =>
      root(el).querySelector('[role=status]')?.textContent?.trim() ?? '';
    expect(status()).to.equal('');

    const user = document.createElement('wc-chat-message') as ChatMessage;
    user.from = 'user';
    user.value = 'Will I get a loaner?';
    el.append(user);
    const answer = document.createElement('wc-chat-message') as ChatMessage;
    answer.streaming = true;
    el.append(answer);
    await aTimeout(30);
    expect(status()).to.equal('');

    answer.value = 'Desk support has **2 loaners** free[1](cite:asset_9).';
    await answer.updateComplete;
    await aTimeout(30);
    expect(status()).to.equal('');
    answer.streaming = false;
    await waitUntil(() => status() !== '', 'announced');
    expect(status()).to.equal('Assistant: Desk support has 2 loaners free.');
  });

  it('offers Jump to latest once the reader scrolls up', async () => {
    const el = await fixture<ChatThread>(
      html`<wc-chat-thread style="height: 120px"></wc-chat-thread>`,
    );
    for (let i = 0; i < 8; i += 1) {
      const message = document.createElement('wc-chat-message') as ChatMessage;
      message.value = `Message ${i}`;
      message.hideActions = true;
      el.append(message);
    }
    await aTimeout(100);
    const scroller = root(el).querySelector('.scroller') as HTMLElement;
    expect(scroller.scrollTop).to.be.greaterThan(0);
    expect(root(el).querySelector('.jump')).to.equal(null);
    scroller.scrollTop = 0;
    scroller.dispatchEvent(new Event('scroll'));
    await el.updateComplete;
    expect(root(el).querySelector('.jump')).to.not.equal(null);
  });

  it('keeps following when content grows below without the reader scrolling', async () => {
    const el = await fixture<ChatThread>(
      html`<wc-chat-thread style="height: 120px"></wc-chat-thread>`,
    );
    for (let i = 0; i < 6; i += 1) {
      const message = document.createElement('wc-chat-message') as ChatMessage;
      message.value = `Message ${i}`;
      message.hideActions = true;
      el.append(message);
    }
    await aTimeout(100);
    const scroller = root(el).querySelector('.scroller') as HTMLElement;
    // A tall card lands below, and a scroll event arrives before the thread catches up.
    const card = document.createElement('div');
    card.style.height = '400px';
    el.append(card);
    scroller.dispatchEvent(new Event('scroll'));
    await el.updateComplete;
    expect(root(el).querySelector('.jump')).to.equal(null);
    await aTimeout(100);
    const distance =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    expect(distance).to.be.at.most(48);
  });
});

describe('ChatThread on a page with smooth scrolling', () => {
  const style = document.createElement('style');
  before(() => {
    style.textContent =
      'wc-chat-thread::part(scroller) { scroll-behavior: smooth; }';
    document.head.append(style);
  });
  after(() => style.remove());

  it('keeps following new content', async () => {
    const el = await fixture<ChatThread>(
      html`<wc-chat-thread style="height: 120px"></wc-chat-thread>`,
    );
    const scroller = root(el).querySelector('.scroller') as HTMLElement;
    for (let i = 0; i < 10; i += 1) {
      const message = document.createElement('wc-chat-message') as ChatMessage;
      message.value = `Message ${i}`;
      message.hideActions = true;
      el.append(message);
      // eslint-disable-next-line no-await-in-loop
      await aTimeout(20);
    }
    await aTimeout(200);
    const distance =
      scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight;
    expect(distance).to.be.at.most(48);
    expect(root(el).querySelector('.jump')).to.equal(null);
  });
});

describe('AssistantSteps', () => {
  afterEach(() => setPeacockAi({}));

  it('sums up its steps and opens to list them', async () => {
    const el = await fixture<AssistantSteps>(
      html`<wc-assistant-steps label="Looked up 2 records">
        <wc-assistant-step status="done" app="Asset management"
          >found LT-0412</wc-assistant-step
        >
        <wc-assistant-step status="running" app="Human resources"
          >reading your balance</wc-assistant-step
        >
      </wc-assistant-steps>`,
    );
    await el.updateComplete;
    expect(el.status).to.equal('running');
    const toggle = root(el).querySelector('.toggle') as HTMLButtonElement;
    expect(toggle.getAttribute('aria-expanded')).to.equal('false');
    expect((root(el).querySelector('.list') as HTMLElement).hidden).to.equal(
      true,
    );
    setTimeout(() => toggle.click());
    await oneEvent(el, 'open');
    await el.updateComplete;
    expect(toggle.getAttribute('aria-expanded')).to.equal('true');
    expect(toggle.textContent?.trim()).to.equal('Hide steps');

    const running = el.querySelector('[status=running]') as AssistantStep;
    running.status = 'blocked';
    await waitUntil(() => el.status === 'done', 'done');
    el.querySelector<AssistantStep>('[status=done]')!.status = 'error';
    await waitUntil(() => el.status === 'error', 'error');
  });

  it('reads each step with its app and status', async () => {
    const step = await fixture<AssistantStep>(
      html`<wc-assistant-step status="blocked" app="Payroll"
        >not read</wc-assistant-step
      >`,
    );
    expect(step.getAttribute('role')).to.equal('listitem');
    expect(root(step).querySelector('.app')?.textContent).to.equal('Payroll');
    expect(
      root(step).querySelector('.screen-reader-only')?.textContent,
    ).to.equal(', Not allowed');
  });

  it('renders nothing while AI is off', async () => {
    setPeacockAi({ enabled: false });
    const el = await fixture<AssistantSteps>(
      html`<wc-assistant-steps label="x"></wc-assistant-steps>`,
    );
    expect(root(el).querySelector('.summary')).to.equal(null);
  });
});

describe('DraftCard', () => {
  afterEach(() => setPeacockAi({}));

  it('lists the fields, marking suggested ones with their reason', async () => {
    const el = await fixture<DraftCard>(
      html`<wc-draft-card
        headline="New incident"
        supporting-text="IT service desk"
      ></wc-draft-card>`,
    );
    el.fields = [
      { label: 'Short description', value: 'Cracked screen' },
      {
        label: 'Urgency',
        value: '3 · Medium',
        suggested: true,
        reason: "You didn't say you can't work.",
      },
    ];
    await el.updateComplete;
    const fields = root(el).querySelectorAll('.field');
    expect(fields.length).to.equal(2);
    expect(fields[1].querySelector('wc-ai-badge')).to.not.equal(null);
    expect(fields[1].querySelector('.reason')?.textContent).to.equal(
      "You didn't say you can't work.",
    );
    expect(
      root(el).querySelector('.head wc-ai-badge')?.getAttribute('kind'),
    ).to.equal('draft');
  });

  it('puts each label above its value in a narrow card', async () => {
    const el = await fixture<DraftCard>(
      html`<wc-draft-card
        headline="Reply"
        style="width: 20rem"
      ></wc-draft-card>`,
    );
    el.fields = [{ label: 'To', value: 'Priya Shah' }];
    await el.updateComplete;
    const field = root(el).querySelector('.field') as HTMLElement;
    const columns = () =>
      getComputedStyle(field).gridTemplateColumns.split(' ').length;
    expect(columns()).to.equal(1);
    el.style.width = '40rem';
    await aTimeout(30);
    expect(columns()).to.equal(2);
  });

  it('fires confirm and edit, and discards unless cancelled', async () => {
    const el = await fixture<DraftCard>(
      html`<wc-draft-card
        headline="Leave request"
        confirm-label="Send request"
      ></wc-draft-card>`,
    );
    const [confirm, edit] = Array.from(
      root(el).querySelectorAll('.actions wc-button'),
    ) as HTMLElement[];
    expect(confirm.textContent?.trim()).to.equal('Send request');
    setTimeout(() => confirm.click());
    await oneEvent(el, 'confirm');
    setTimeout(() => edit.click());
    await oneEvent(el, 'edit');

    const discard = root(el).querySelector(
      '.actions wc-icon-button',
    ) as HTMLElement;
    el.addEventListener('discard', event => event.preventDefault(), {
      once: true,
    });
    discard.click();
    expect(el.state).to.equal('draft');
    discard.click();
    await el.updateComplete;
    expect(el.state).to.equal('discarded');
    expect(
      root(el).querySelector('.supporting-text')?.textContent?.trim(),
    ).to.equal('Discarded · nothing was sent');
    expect(root(el).querySelector('.actions')).to.equal(null);
  });

  it('asks again before an irreversible confirm', async () => {
    const el = await fixture<DraftCard>(
      html`<wc-draft-card
        headline="Remove access"
        confirm-label="Remove"
        irreversible
      ></wc-draft-card>`,
    );
    const dialog = root(el).querySelector(
      'wc-confirm-dialog',
    ) as HTMLElement & { show: () => void };
    let shown = false;
    dialog.show = () => {
      shown = true;
    };
    let confirmed = false;
    el.addEventListener('confirm', () => {
      confirmed = true;
    });
    (root(el).querySelector('.actions wc-button') as HTMLElement).click();
    expect(shown).to.equal(true);
    expect(confirmed).to.equal(false);
    dialog.dispatchEvent(
      new CustomEvent('confirm', { bubbles: true, composed: true }),
    );
    expect(confirmed).to.equal(true);
  });

  it('shows the result once done and the problem on error', async () => {
    const el = await fixture<DraftCard>(
      html`<wc-draft-card
        headline="New incident"
        state="done"
        result-text="Raised INC-2318"
        result-href="/inc/2318"
      ></wc-draft-card>`,
    );
    const done = root(el).querySelector('.done') as HTMLElement;
    expect(done.textContent).to.contain('Raised INC-2318');
    expect(done.querySelector('wc-link')?.getAttribute('href')).to.equal(
      '/inc/2318',
    );
    expect(root(el).querySelector('.head wc-ai-badge')).to.equal(null);

    el.state = 'error';
    el.errorText = 'Asset is required.';
    await el.updateComplete;
    // The card's state never takes the styles of its error or done rows.
    const card = root(el).querySelector('.card') as HTMLElement;
    expect(card.classList.contains('error')).to.equal(false);
    expect(getComputedStyle(card).display).to.equal('block');
    expect(root(el).querySelector('.error')?.textContent).to.contain(
      'Asset is required.',
    );
    expect(root(el).querySelector('.actions')).to.not.equal(null);
  });

  it('renders nothing while AI is off', async () => {
    setPeacockAi({ enabled: false });
    const el = await fixture<DraftCard>(
      html`<wc-draft-card headline="x"></wc-draft-card>`,
    );
    expect(root(el).querySelector('.card')).to.equal(null);
  });
});

describe('AssistantPanel', () => {
  afterEach(() => setPeacockAi({}));

  it('says whose access it uses and fires its header actions', async () => {
    const el = await fixture<AssistantPanel>(
      html`<wc-assistant-panel
        supporting-text="Acting as Alan Turing, with your access"
      ></wc-assistant-panel>`,
    );
    expect(root(el).querySelector('.headline')?.textContent?.trim()).to.equal(
      'Assistant',
    );
    expect(root(el).querySelector('.supporting-text')?.textContent).to.equal(
      'Acting as Alan Turing, with your access',
    );
    expect(root(el).querySelector('.disclaimer')?.textContent?.trim()).to.equal(
      'The assistant can be wrong. Check a draft before you send it.',
    );
    const [fresh, close] = Array.from(
      root(el).querySelectorAll('.header wc-icon-button'),
    ) as HTMLElement[];
    setTimeout(() => fresh.click());
    await oneEvent(el, 'new-conversation');
    setTimeout(() => close.click());
    const event = (await oneEvent(
      el,
      'close',
    )) as CustomEvent<AssistantPanelCloseDetail>;
    expect(event.detail.reason).to.equal('action');
  });

  it('opens as a modal sheet with show() and hide()', async () => {
    const el = await fixture<AssistantPanel>(
      html`<wc-assistant-panel variant="modal"></wc-assistant-panel>`,
    );
    const sheet = root(el).querySelector('wc-side-sheet') as HTMLElement;
    expect(sheet.hasAttribute('open')).to.equal(false);
    el.show();
    await el.updateComplete;
    expect(sheet.hasAttribute('open')).to.equal(true);
    setTimeout(() => el.hide());
    const event = (await oneEvent(
      el,
      'close',
    )) as CustomEvent<AssistantPanelCloseDetail>;
    expect(event.detail.reason).to.equal('api');
    expect(el.open).to.equal(false);
  });

  it('opens a modal sheet with the composer focused', async () => {
    const el = await fixture<AssistantPanel>(
      html`<wc-assistant-panel variant="modal">
        <textarea slot="composer" aria-label="Ask"></textarea>
      </wc-assistant-panel>`,
    );
    setTimeout(() => el.show());
    await oneEvent(el, 'open');
    await new Promise(resolve => {
      setTimeout(resolve, 100);
    });
    expect(document.activeElement).to.equal(el.querySelector('textarea'));
  });

  it('renders nothing while AI is off', async () => {
    setPeacockAi({ enabled: false });
    const el = await fixture<AssistantPanel>(
      html`<wc-assistant-panel></wc-assistant-panel>`,
    );
    expect(root(el).querySelector('.panel')).to.equal(null);
  });
});

/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync, waitUntil } from '@open-wc/testing';
import { Field } from '../src/field/index.js';
import { Button, IconButton } from '../src/button/index.js';
import { Textarea } from '../src/textarea/index.js';
import { Menu, MenuItem } from '../src/menu/index.js';
import { Item } from '../src/item/index.js';
import { CommentElement, CommentThread } from '../src/comment-thread/index.js';
import {
  formatRelativeTime,
  parseDatetime,
} from '../src/__internal/utils/relative-time.js';

for (const [tag, element] of [
  ['wc-field', Field],
  ['wc-button', Button],
  ['wc-icon-button', IconButton],
  ['wc-textarea', Textarea],
  ['wc-item', Item],
  ['wc-menu', Menu],
  ['wc-menu-item', MenuItem],
  ['wc-comment', CommentElement],
  ['wc-comment-thread', CommentThread],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

const minutesAgo = (minutes: number) =>
  new Date(Date.now() - minutes * 60_000).toISOString();

async function settle(el: CommentThread) {
  for (let round = 0; round < 3; round += 1) {
    // eslint-disable-next-line no-await-in-loop
    await el.updateComplete;
    // eslint-disable-next-line no-await-in-loop
    await Promise.all(el.comments.map(comment => comment.updateComplete));
  }
}

async function setup(template: unknown) {
  const el = fixtureSync<CommentThread>(template as never);
  await settle(el);
  return el;
}

function q<T extends Element>(el: Element, selector: string) {
  return el.shadowRoot!.querySelector<T>(selector);
}

async function typeInto(textarea: Textarea, text: string) {
  await textarea.updateComplete;
  const native = textarea.shadowRoot!.querySelector('textarea')!;
  native.value = text;
  native.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
}

function ctrlEnter(target: Element) {
  const event = new KeyboardEvent('keydown', {
    key: 'Enter',
    ctrlKey: true,
    bubbles: true,
    composed: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

describe('relative time', () => {
  it('formats past times in the locale', () => {
    const now = Date.parse('2026-11-07T12:00:00Z');
    const at = (iso: string) =>
      formatRelativeTime(new Date(iso), 'en', { now });
    expect(at('2026-11-07T11:59:50Z')).to.equal('now');
    expect(at('2026-11-07T11:55:00Z')).to.equal('5 minutes ago');
    expect(at('2026-11-07T09:00:00Z')).to.equal('3 hours ago');
    expect(at('2026-11-06T12:00:00Z')).to.equal('yesterday');
    expect(at('2026-10-24T12:00:00Z')).to.equal('2 weeks ago');
    expect(at('2026-08-07T12:00:00Z')).to.equal('3 months ago');
    expect(at('2024-11-07T12:00:00Z')).to.equal('2 years ago');
    expect(
      formatRelativeTime(new Date('2026-11-07T11:55:00Z'), 'de', { now }),
    ).to.equal('vor 5 Minuten');
  });

  it('rejects text that is not a date', () => {
    expect(parseDatetime('soon')).to.be.null;
    expect(parseDatetime('')).to.be.null;
    expect(parseDatetime('2026-11-07T12:00:00Z')).to.be.instanceOf(Date);
  });
});

describe('wc-comment', () => {
  it('shows author, relative time with an absolute title, body and edited marker', async () => {
    const el = await setup(
      html`<wc-comment-thread>
        <wc-comment
          comment-id="1"
          author="Ada Lovelace"
          datetime=${minutesAgo(5)}
          body=${'Line one\nLine two'}
          edited
        ></wc-comment>
      </wc-comment-thread>`,
    );
    const [comment] = el.comments;
    expect(q(comment, '.author')!.textContent).to.equal('Ada Lovelace');
    const time = q<HTMLTimeElement>(comment, 'time')!;
    expect(time.textContent).to.equal('5 minutes ago');
    expect(time.dateTime).to.match(/^\d{4}-\d\d-\d\dT/);
    expect(time.title).to.not.be.empty;
    expect(q(comment, '.plain')!.textContent).to.equal('Line one\nLine two');
    expect(q(comment, '.edited')!.textContent).to.equal('Edited');
    expect(q(comment, 'wc-avatar')!.getAttribute('name')).to.equal(
      'Ada Lovelace',
    );
  });

  it('is an article named by author and time', async () => {
    const el = await setup(
      html`<wc-comment-thread>
        <wc-comment author="Ada" datetime=${minutesAgo(5)}>
          <wc-comment
            slot="replies"
            author="Grace"
            datetime=${minutesAgo(1)}
          ></wc-comment>
        </wc-comment>
      </wc-comment-thread>`,
    );
    const [comment, reply] = el.comments;
    const { internals } = comment as unknown as {
      internals: ReturnType<HTMLElement['attachInternals']>;
    };
    expect(internals.role).to.equal('article');
    expect(internals.ariaLabel).to.equal('Comment by Ada, 5 minutes ago');
    expect(
      (
        reply as unknown as {
          internals: ReturnType<HTMLElement['attachInternals']>;
        }
      ).internals.ariaLabel,
    ).to.equal('Reply by Grace, 1 minute ago');
    expect(comment.tabIndex).to.equal(-1);
  });

  it('lets slotted rich text replace body', async () => {
    const el = await setup(
      html`<wc-comment-thread>
        <wc-comment author="Ada" body="plain"
          ><p><b>Rich</b> text</p></wc-comment
        >
      </wc-comment-thread>`,
    );
    const [comment] = el.comments;
    expect(q(comment, '.plain')).to.be.null;
  });

  it('keeps the plain body when only replies are slotted', async () => {
    const el = await setup(
      html`<wc-comment-thread>
        <wc-comment author="Ada" body="Parent">
          <wc-comment slot="replies" author="Grace" body="Child"></wc-comment>
        </wc-comment>
      </wc-comment-thread>`,
    );
    const [comment, reply] = el.comments;
    expect(q(comment, '.plain')!.textContent).to.equal('Parent');
    expect(q(comment, '.replies')!.hasAttribute('hidden')).to.be.false;
    expect(q(comment, '.replies')!.getAttribute('aria-label')).to.equal(
      'Replies to Ada',
    );
    // One level: a reply has no Reply button and no replies.
    expect(reply.isReply).to.be.true;
    expect(q(reply, '.reply-button')).to.be.null;
    expect(q(reply, '.replies')).to.be.null;
  });

  it('shows the menu only with actions, and fires their events', async () => {
    const el = await setup(
      html`<wc-comment-thread>
        <wc-comment comment-id="1" author="Ada"></wc-comment>
        <wc-comment
          comment-id="2"
          author="Grace"
          editable
          deletable
          href="#c2"
          datetime="2026-01-01T00:00:00Z"
        ></wc-comment>
      </wc-comment-thread>`,
    );
    const [plain, full] = el.comments;
    expect(q(plain, '.menu-button')).to.be.null;
    const button = q(full, '.menu-button')!;
    expect(button.getAttribute('aria-label')).to.equal(
      'More actions for comment by Grace',
    );
    const items = Array.from(
      full.shadowRoot!.querySelectorAll<MenuItem>('wc-menu-item'),
    );
    expect(items.map(item => item.value)).to.deep.equal([
      'edit',
      'copy-link',
      'delete',
    ]);

    const seen: [string, unknown][] = [];
    for (const type of ['edit', 'delete', 'copy-link']) {
      el.addEventListener(type, e =>
        seen.push([type, (e as CustomEvent).detail]),
      );
    }
    const menu = q<Menu>(full, 'wc-menu')!;
    for (const item of items) {
      menu.dispatchEvent(
        new CustomEvent('menu-item-activate', {
          detail: { item },
          bubbles: true,
          composed: true,
        }),
      );
    }
    expect(seen[0]).to.deep.equal(['edit', { commentId: '2' }]);
    expect(seen[1][0]).to.equal('copy-link');
    expect((seen[1][1] as { href: string }).href).to.match(/#c2$/);
    expect(seen[2]).to.deep.equal(['delete', { commentId: '2' }]);
    // The time links to the permalink.
    expect(q<HTMLAnchorElement>(full, 'a.time')!.getAttribute('href')).to.equal(
      '#c2',
    );
  });

  it('opens a reply composer that submits with the parent id', async () => {
    const el = await setup(
      html`<wc-comment-thread>
        <wc-comment comment-id="7" author="Ada"></wc-comment>
      </wc-comment-thread>`,
    );
    const [comment] = el.comments;
    const replies: CustomEvent[] = [];
    const submits: CustomEvent[] = [];
    el.addEventListener('reply', e => replies.push(e as CustomEvent));
    el.addEventListener('submit', e =>
      submits.push(e as unknown as CustomEvent),
    );

    q<HTMLElement>(comment, '.reply-button')!.click();
    await comment.updateComplete;
    expect(replies[0].detail).to.deep.equal({ commentId: '7' });
    const input = q<Textarea>(comment, '.reply-input')!;
    expect(input).to.exist;
    expect(input.configAria['aria-label']).to.equal('Reply to Ada');
    const send = q<Button>(comment, '.reply-send')!;
    expect(send.disabled).to.be.true;

    await typeInto(input, '  Agreed  ');
    await comment.updateComplete;
    expect(send.disabled).to.be.false;
    ctrlEnter(input.shadowRoot!.querySelector('textarea')!);
    await comment.updateComplete;
    expect(submits).to.have.length(1);
    expect(submits[0].detail).to.deep.equal({ body: 'Agreed', parentId: '7' });
    expect(q(comment, '.reply-input')).to.be.null;
  });

  it('keeps the reply composer when reply is cancelled or submit is cancelled', async () => {
    const el = await setup(
      html`<wc-comment-thread>
        <wc-comment comment-id="7" author="Ada"></wc-comment>
      </wc-comment-thread>`,
    );
    const [comment] = el.comments;
    const stopReply = (e: Event) => e.preventDefault();
    el.addEventListener('reply', stopReply);
    q<HTMLElement>(comment, '.reply-button')!.click();
    await comment.updateComplete;
    expect(q(comment, '.reply-input')).to.be.null;
    el.removeEventListener('reply', stopReply);

    await comment.openReply();
    el.addEventListener('submit', e => e.preventDefault());
    const input = q<Textarea>(comment, '.reply-input')!;
    await typeInto(input, 'Hi');
    await comment.updateComplete;
    q<HTMLElement>(comment, '.reply-send')!.click();
    await comment.updateComplete;
    expect(q(comment, '.reply-input')).to.exist;

    input.shadowRoot!.querySelector('textarea')!.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        composed: true,
      }),
    );
    await comment.updateComplete;
    expect(q(comment, '.reply-input')).to.be.null;
  });
});

describe('wc-comment-thread', () => {
  it('is a feed named Comments, with the empty message', async () => {
    const el = await setup(html`<wc-comment-thread></wc-comment-thread>`);
    const feed = q(el, '[role="feed"]')!;
    expect(feed.getAttribute('aria-label')).to.equal('Comments');
    expect(feed.getAttribute('aria-busy')).to.equal('false');
    expect(q(el, '.empty')!.textContent).to.contain('No comments yet');
  });

  it('shows placeholder rows while loading', async () => {
    const el = await setup(
      html`<wc-comment-thread loading></wc-comment-thread>`,
    );
    expect(q(el, '[role="feed"]')!.getAttribute('aria-busy')).to.equal('true');
    expect(el.shadowRoot!.querySelectorAll('.skeleton-row')).to.have.length(3);
    expect(q(el, '.empty')).to.be.null;
    expect(q<Button>(el, '.send-button')!.disabled).to.be.true;
    expect(q<Textarea>(el, '.composer-input')!.disabled).to.be.true;
  });

  it('submits a new comment with Ctrl+Enter and empties the composer', async () => {
    const el = await setup(html`<wc-comment-thread></wc-comment-thread>`);
    const submits: CustomEvent[] = [];
    el.addEventListener('submit', e =>
      submits.push(e as unknown as CustomEvent),
    );
    let leaked = 0;
    el.addEventListener('input', () => {
      leaked += 1;
    });
    const send = q<Button>(el, '.send-button')!;
    expect(send.disabled).to.be.true;

    const input = q<Textarea>(el, '.composer-input')!;
    await typeInto(input, 'Hello\nteam');
    await el.updateComplete;
    expect(send.disabled).to.be.false;
    ctrlEnter(input.shadowRoot!.querySelector('textarea')!);
    await el.updateComplete;
    expect(submits).to.have.length(1);
    expect(submits[0].detail).to.deep.equal({
      body: 'Hello\nteam',
      parentId: null,
    });
    expect(submits[0].cancelable).to.be.true;
    expect(input.value).to.equal('');
    expect(leaked).to.equal(0);
  });

  it('keeps the text when submit is cancelled', async () => {
    const el = await setup(html`<wc-comment-thread></wc-comment-thread>`);
    el.addEventListener('submit', e => e.preventDefault());
    const input = q<Textarea>(el, '.composer-input')!;
    await typeInto(input, 'Draft');
    await el.updateComplete;
    q<HTMLElement>(el, '.send-button')!.click();
    await el.updateComplete;
    expect(input.value).to.equal('Draft');
  });

  it('takes a slotted composer control', async () => {
    const el = await setup(
      html`<wc-comment-thread>
        <wc-textarea slot="composer" class="custom"></wc-textarea>
      </wc-comment-thread>`,
    );
    const custom = el.querySelector<Textarea>('.custom')!;
    const submits: CustomEvent[] = [];
    el.addEventListener('submit', e =>
      submits.push(e as unknown as CustomEvent),
    );
    await typeInto(custom, 'From slot');
    await el.updateComplete;
    q<HTMLElement>(el, '.send-button')!.click();
    await el.updateComplete;
    expect(submits[0].detail.body).to.equal('From slot');
    expect(custom.value).to.equal('');
  });

  it('hides the composer and Reply buttons when readonly', async () => {
    const el = await setup(
      html`<wc-comment-thread readonly>
        <wc-comment author="Ada"></wc-comment>
      </wc-comment-thread>`,
    );
    expect(q(el, '.composer')).to.be.null;
    expect(q(el.comments[0], '.reply-button')).to.be.null;
    el.readonly = false;
    await settle(el);
    expect(q(el, '.composer')).to.exist;
    expect(q(el.comments[0], '.reply-button')).to.exist;
  });

  it('announces a comment added after loading, not the first batch', async () => {
    const el = await setup(
      html`<wc-comment-thread>
        <wc-comment author="Ada"></wc-comment>
      </wc-comment-thread>`,
    );
    const live = () => q(el, '[aria-live="polite"]')!.textContent!.trim();
    await new Promise(resolve => {
      setTimeout(resolve, 10);
    });
    expect(live()).to.equal('');
    const added = document.createElement('wc-comment') as CommentElement;
    added.author = 'Grace';
    el.append(added);
    await waitUntil(() => live() === 'New comment by Grace', 'not announced');
    expect(q(el, '.empty')).to.be.null;
  });

  it('moves between comments with Page Down and Page Up', async () => {
    const el = await setup(
      html`<wc-comment-thread>
        <wc-comment author="A"></wc-comment>
        <wc-comment author="B"></wc-comment>
      </wc-comment-thread>`,
    );
    const [first, second] = el.comments;
    let focused: Element | null = null;
    second.focus = () => {
      focused = second;
    };
    first.dispatchEvent(
      new KeyboardEvent('keydown', {
        key: 'PageDown',
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    expect(focused).to.equal(second);
  });
});

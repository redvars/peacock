/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent, waitUntil } from '@open-wc/testing';
import { CodeGroup, CodeHighlighter } from '../src/code-highlighter/index.js';
import {
  buildLineVariants,
  decodeEntities,
  dedent,
  parseLineRanges,
} from '../src/code-highlighter/line-ranges.js';
import { Icon } from '../src/icon/index.js';
import { Button, IconButton } from '../src/button/index.js';
import { Tab, Tabs } from '../src/tabs/index.js';
import { CopyButton } from '../src/copy-button/index.js';

for (const [tag, element] of [
  ['wc-icon', Icon],
  ['wc-icon-button', IconButton],
  ['wc-copy-button', CopyButton],
  ['wc-button', Button],
  ['wc-tabs', Tabs],
  ['wc-tab', Tab],
  ['wc-code-highlighter', CodeHighlighter],
  ['wc-code-group', CodeGroup],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function root(el: CodeHighlighter): ShadowRoot {
  return el.shadowRoot as ShadowRoot;
}

/**
 * Replaces `navigator.clipboard.writeText` for one test: background test pages are not focused,
 * so the real one rejects (and the execCommand fallback copies nothing).
 */
function stubClipboard(succeed: boolean) {
  const original = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
  const writes: string[] = [];
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: {
      writeText: async (text: string) => {
        writes.push(text);
        if (!succeed) throw new Error('denied');
      },
    },
  });
  const originalExec = document.execCommand;
  document.execCommand = (() => succeed) as typeof document.execCommand;
  return {
    writes,
    restore() {
      if (original) Object.defineProperty(navigator, 'clipboard', original);
      else delete (navigator as { clipboard?: unknown }).clipboard;
      document.execCommand = originalExec;
    },
  };
}

/** The button inside the highlighter's wc-copy-button, where a real click lands. */
async function copyControl(el: CodeHighlighter): Promise<HTMLElement> {
  const copy = root(el).querySelector('.copy-button') as CopyButton;
  await copy.updateComplete;
  return copy.shadowRoot!.querySelector('wc-icon-button') as HTMLElement;
}

function lines(el: CodeHighlighter): HTMLElement[] {
  return [...root(el).querySelectorAll<HTMLElement>('.line')];
}

const tallCode = Array.from({ length: 40 }, (_, i) => `line ${i + 1}`).join(
  '\n',
);

describe('code-highlighter line ranges', () => {
  it('parses single lines and ranges', () => {
    expect([...parseLineRanges('1, 3-5, 9')]).to.deep.equal([1, 3, 4, 5, 9]);
  });

  it('skips malformed parts and reads reversed ranges', () => {
    expect([...parseLineRanges('x, 4-2, , 0')]).to.deep.equal([2, 3, 4]);
    expect(parseLineRanges('').size).to.equal(0);
  });

  it('lets removed win over added, and added over highlighted', () => {
    const variants = buildLineVariants({
      highlighted: '1-3',
      added: '2-3',
      removed: '3',
    });
    expect(variants.get(1)).to.equal('highlighted');
    expect(variants.get(2)).to.equal('added');
    expect(variants.get(3)).to.equal('removed');
  });

  it('dedents and trims blank edge lines', () => {
    expect(dedent('\n    a\n      b\n\n    c\n  \n')).to.equal('a\n  b\n\nc');
  });

  it('decodes entities with &amp; last', () => {
    expect(decodeEntities('a &amp;&amp; b &lt; c &amp;lt;')).to.equal(
      'a && b < c &lt;',
    );
  });
});

describe('CodeHighlighter', () => {
  it('reads, decodes and dedents light-DOM code', async () => {
    const el = await fixture<CodeHighlighter>(html`
      <wc-code-highlighter language="javascript" format="false">
        <pre><code>
          if (a &amp;&amp; b &lt; c) {
            run();
          }
      </code></pre>
      </wc-code-highlighter>
    `);
    const rendered = lines(el).map(line => line.textContent);
    expect(rendered).to.deep.equal(['if (a && b < c) {', '  run();', '}']);
  });

  it('turns formatting off with format="false"', async () => {
    const el = await fixture<CodeHighlighter>(
      html`<wc-code-highlighter format="false"></wc-code-highlighter>`,
    );
    expect(el.format).to.equal(false);
  });

  it('renders one line per source line, keeping blank lines', async () => {
    const el = await fixture<CodeHighlighter>(html`
      <wc-code-highlighter
        language="text"
        .format=${false}
        .value=${'a\n\nb\n'}
      ></wc-code-highlighter>
    `);
    expect(lines(el)).to.have.length(3);
    expect(lines(el)[1].textContent).to.equal('\n');
  });

  it('starts the line counter at start-line', async () => {
    const el = await fixture<CodeHighlighter>(html`
      <wc-code-highlighter
        language="text"
        line-numbers
        start-line="10"
        .value=${'a\nb'}
      ></wc-code-highlighter>
    `);
    const code = root(el).querySelector('.code') as HTMLElement;
    expect(code.style.counterReset).to.equal('line 9');
    expect(root(el).querySelector('.code-block.line-numbers')).to.exist;
  });

  it('marks highlighted, added and removed lines', async () => {
    const el = await fixture<CodeHighlighter>(html`
      <wc-code-highlighter
        language="text"
        highlight-lines="1"
        added-lines="2-3"
        removed-lines="3"
        .value=${'a\nb\nc\nd'}
      ></wc-code-highlighter>
    `);
    expect(lines(el).map(line => line.dataset.variant)).to.deep.equal([
      'highlighted',
      'added',
      'removed',
      undefined,
    ]);

    el.highlightLines = '4';
    await el.updateComplete;
    expect(lines(el)[3].dataset.variant).to.equal('highlighted');
  });

  it('floats the actions when there is no header', async () => {
    const el = await fixture<CodeHighlighter>(html`
      <wc-code-highlighter language="text" .value=${'a'}></wc-code-highlighter>
    `);
    expect(root(el).querySelector('.header')).to.not.exist;
    expect(root(el).querySelector('.actions.floating .copy-button')).to.exist;
  });

  it('shows the header for a label or a title slot', async () => {
    const labelled = await fixture<CodeHighlighter>(html`
      <wc-code-highlighter
        language="text"
        label="app.js"
        .value=${'a'}
      ></wc-code-highlighter>
    `);
    const header = root(labelled).querySelector('.header');
    expect(header).to.exist;
    expect(header?.querySelector('.actions:not(.floating)')).to.exist;
    expect(root(labelled).querySelector('.title')?.textContent).to.contain(
      'app.js',
    );

    const slotted = await fixture<CodeHighlighter>(html`
      <wc-code-highlighter language="text" .value=${'a'}
        ><span slot="title">Terminal</span></wc-code-highlighter
      >
    `);
    expect(root(slotted).querySelector('.header')).to.exist;
  });

  it('hides the copy button with hide-copy', async () => {
    const el = await fixture<CodeHighlighter>(html`
      <wc-code-highlighter
        language="text"
        hide-copy
        .value=${'a'}
      ></wc-code-highlighter>
    `);
    expect(el.hideCopy).to.equal(true);
    expect(root(el).querySelector('.copy-button')).to.not.exist;
    expect(root(el).querySelector('.actions')).to.not.exist;
  });

  it('fires copied with the code', async () => {
    const el = await fixture<CodeHighlighter>(html`
      <wc-code-highlighter
        language="text"
        .value=${'npm i\nnpm test\n'}
      ></wc-code-highlighter>
    `);
    const button = await copyControl(el);
    const clipboard = stubClipboard(true);
    try {
      setTimeout(() => button.click());
      const event = (await oneEvent(el, 'copied')) as CustomEvent<{
        value: string;
      }>;
      expect(event.detail.value).to.equal('npm i\nnpm test');
      expect(clipboard.writes).to.deep.equal(['npm i\nnpm test']);
    } finally {
      clipboard.restore();
    }
  });

  it('fires copy-error, not copied, when nothing could be copied', async () => {
    const el = await fixture<CodeHighlighter>(html`
      <wc-code-highlighter language="text" .value=${'a'}></wc-code-highlighter>
    `);
    const button = await copyControl(el);
    let copied = false;
    el.addEventListener('copied', () => {
      copied = true;
    });
    const clipboard = stubClipboard(false);
    try {
      setTimeout(() => button.click());
      const error = (await oneEvent(el, 'copy-error')) as CustomEvent<{
        value: string;
      }>;
      expect(error.detail.value).to.equal('a');
      expect(copied).to.be.false;
    } finally {
      clipboard.restore();
    }
  });

  it('copies copy-value instead of the code when set', async () => {
    const el = await fixture<CodeHighlighter>(html`
      <wc-code-highlighter
        language="text"
        copy-value="npm i"
        .value=${'$ npm i\nadded 1 package'}
      ></wc-code-highlighter>
    `);
    const button = await copyControl(el);
    const clipboard = stubClipboard(true);
    try {
      setTimeout(() => button.click());
      const event = (await oneEvent(el, 'copied')) as CustomEvent<{
        value: string;
      }>;
      expect(event.detail.value).to.equal('npm i');
    } finally {
      clipboard.restore();
    }
  });

  it('toggles wrapping from the wrap button', async () => {
    const el = await fixture<CodeHighlighter>(html`
      <wc-code-highlighter
        language="text"
        wrap-toggle
        .value=${'a'}
      ></wc-code-highlighter>
    `);
    const button = root(el).querySelector('.wrap-button') as IconButton;
    expect(button.selected).to.equal(false);

    button.click();
    await el.updateComplete;
    expect(el.wrap).to.equal(true);
    expect(el.hasAttribute('wrap')).to.equal(true);
    expect(button.selected).to.equal(true);
    expect(root(el).querySelector('.code-block.wrap')).to.exist;
  });

  it('shows a show more button only when collapsed code overflows', async () => {
    const short = await fixture<CodeHighlighter>(html`
      <wc-code-highlighter
        language="text"
        collapsible
        .value=${'a\nb'}
      ></wc-code-highlighter>
    `);
    await new Promise(resolve => {
      requestAnimationFrame(resolve);
    });
    await short.updateComplete;
    expect(root(short).querySelector('.footer')).to.not.exist;

    const tall = await fixture<CodeHighlighter>(html`
      <wc-code-highlighter
        language="text"
        collapsible
        style="--code-highlighter-collapsed-height: 4rem"
        .value=${tallCode}
      ></wc-code-highlighter>
    `);
    await waitUntil(
      () => root(tall).querySelector('.footer'),
      'footer did not appear',
    );
    expect(root(tall).querySelector('.code-block.overflowing')).to.exist;

    const button = root(tall).querySelector('.expand-button') as Button;
    expect(button.ariaExpanded).to.equal('false');
    setTimeout(() => button.click());
    const event = (await oneEvent(tall, 'expanded-change')) as CustomEvent<{
      expanded: boolean;
    }>;
    expect(event.detail.expanded).to.equal(true);
    await tall.updateComplete;
    expect(tall.expanded).to.equal(true);
    expect(button.ariaExpanded).to.equal('true');
    expect(root(tall).querySelector('.code-block.collapsed')).to.not.exist;
    expect(button.textContent).to.contain('Show less');
  });

  it('settles on one state for code just over the collapsed height (no footer loop)', async () => {
    const el = await fixture<CodeHighlighter>(html`
      <wc-code-highlighter
        language="text"
        collapsible
        style="--spacing-200: 16px; --spacing-100: 8px"
        .value=${'one\ntwo\nthree\nfour'}
      ></wc-code-highlighter>
    `);
    await el.updateComplete;
    const content = root(el).querySelector('.content') as HTMLElement;
    const code = root(el).querySelector('.code') as HTMLElement;
    const style = getComputedStyle(content);
    const room =
      code.offsetHeight +
      parseFloat(style.paddingTop) +
      parseFloat(style.paddingBottom);
    // 3px short of fitting with the full bottom padding, but it would fit with the footer's
    // smaller one: the footer used to shrink the padding, then go away, forever.
    el.style.setProperty(
      '--code-highlighter-collapsed-height',
      `${room - 3}px`,
    );
    await waitUntil(
      () => root(el).querySelector('.footer'),
      'footer did not appear',
    );
    const footerChanges: boolean[] = [];
    const observer = new MutationObserver(() =>
      footerChanges.push(!!root(el).querySelector('.footer')),
    );
    observer.observe(root(el), { childList: true, subtree: true });
    for (let frame = 0; frame < 10; frame += 1) {
      // eslint-disable-next-line no-await-in-loop
      await new Promise(resolve => {
        requestAnimationFrame(resolve);
      });
    }
    observer.disconnect();
    expect(footerChanges.filter(shown => !shown)).to.deep.equal([]);
    // Collapsed, the footer keeps the full bottom padding.
    expect(getComputedStyle(content).paddingBottom).to.equal(style.paddingTop);
  });

  it('renders inline code without block chrome', async () => {
    const el = await fixture<CodeHighlighter>(html`
      <wc-code-highlighter inline language="text"
        >button-variant</wc-code-highlighter
      >
    `);
    expect(root(el).querySelector('code.inline')?.textContent).to.equal(
      'button-variant',
    );
    expect(root(el).querySelector('.copy-button')).to.not.exist;
  });

  it('highlights tokens with theme variables', async function highlights() {
    this.timeout(20000);
    const el = await fixture<CodeHighlighter>(html`
      <wc-code-highlighter
        language="javascript"
        .format=${false}
        .value=${'const answer = 42;'}
      ></wc-code-highlighter>
    `);
    await waitUntil(
      () => root(el).querySelector('.line-content span[style]'),
      'tokens did not render',
      { timeout: 15000 },
    );
    const colors = [
      ...root(el).querySelectorAll<HTMLElement>('.line-content span[style]'),
    ].map(span => span.style.color);
    expect(colors.some(color => color.includes('--code-highlighter-token-'))).to
      .be.true;
    expect(lines(el)[0].textContent).to.equal('const answer = 42;');
  });

  it('keeps plain lines for an unknown language', async function unknown() {
    this.timeout(20000);
    const el = await fixture<CodeHighlighter>(html`
      <wc-code-highlighter
        language=${'not-a-language' as 'text'}
        .format=${false}
        .value=${'a <b>\nc'}
      ></wc-code-highlighter>
    `);
    await new Promise(resolve => {
      setTimeout(resolve, 1500);
    });
    expect(lines(el).map(line => line.textContent)).to.deep.equal([
      'a <b>',
      'c',
    ]);
  });
});

describe('CodeGroup', () => {
  async function group() {
    const el = await fixture<CodeGroup>(html`
      <wc-code-group>
        <wc-code-highlighter
          label="greeting.ts"
          language="text"
          .value=${'a'}
        ></wc-code-highlighter>
        <wc-code-highlighter
          label="greeting.css"
          language="text"
          .value=${'b'}
        ></wc-code-highlighter>
      </wc-code-group>
    `);
    await el.updateComplete;
    return el;
  }

  function blocks(el: CodeGroup): CodeHighlighter[] {
    return [...el.querySelectorAll<CodeHighlighter>('wc-code-highlighter')];
  }

  function tabs(el: CodeGroup): Tab[] {
    return [...(el.shadowRoot as ShadowRoot).querySelectorAll<Tab>('wc-tab')];
  }

  it('shows a tab per block, named by its label', async () => {
    const el = await group();
    expect(tabs(el).map(tab => tab.textContent?.trim())).to.deep.equal([
      'greeting.ts',
      'greeting.css',
    ]);
    expect(tabs(el)[0].selected).to.equal(true);
  });

  it('shows only the selected block, framed by the group', async () => {
    const el = await group();
    const [first, second] = blocks(el);
    await first.updateComplete;
    expect(first.grouped).to.equal(true);
    expect(first.hidden).to.equal(false);
    expect(second.hidden).to.equal(true);
    expect(getComputedStyle(second).display).to.equal('none');
    expect(root(first).querySelector('.header')).to.not.exist;
    expect(root(first).querySelector('.actions.floating .copy-button')).to
      .exist;
  });

  it('switches blocks when a tab is clicked and fires one change', async () => {
    const el = await group();
    let changes = 0;
    el.addEventListener('change', () => {
      changes += 1;
    });
    setTimeout(() => tabs(el)[1].click());
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      index: number;
    }>;
    await el.updateComplete;
    expect(event.detail.index).to.equal(1);
    expect(changes).to.equal(1);
    expect(el.selectedIndex).to.equal(1);
    expect(blocks(el).map(block => block.hidden)).to.deep.equal([true, false]);
  });

  it('gives a block its own frame back when it leaves the group', async () => {
    const el = await group();
    const [first] = blocks(el);
    document.body.appendChild(first);
    await el.updateComplete;
    expect(first.grouped).to.equal(false);
    expect(first.hidden).to.equal(false);
    first.remove();
  });
});

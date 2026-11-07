/// <reference types="mocha" />
import { expect } from '@open-wc/testing';
import { Editor } from '@tiptap/core';

import {
  matchMention,
  mentionToMarkdown,
} from '../src/__internal/rich-text/mention.js';
import { extractMentions } from '../src/__internal/rich-text/markdown-lexer.js';
import { buildExtensions } from '../src/__internal/rich-text/extensions.js';
import type { RichTextProfile } from '../src/__internal/rich-text/extensions.js';

/** A headless editor with a mention plugin for `@`, loaded with `markdown`. */
function markdownEditor(
  markdown: string,
  profile: RichTextProfile = 'markdown',
) {
  return new Editor({
    element: document.createElement('div'),
    extensions: buildExtensions(profile, {
      mentions: [{ char: '@', items: () => [] }],
    }),
    content: markdown,
    contentType: 'markdown',
  });
}

describe('rich-text mentions', () => {
  it('writes a mention as a mention: link and reads it back', () => {
    const markdown = mentionToMarkdown({
      id: 'usr 142/a',
      label: 'Ana [QA] Lima',
      trigger: '@',
    });
    expect(markdown).to.equal('[@Ana \\[QA\\] Lima](mention:usr%20142%2Fa)');
    expect(matchMention(`${markdown} rest`)).to.deep.equal({
      raw: markdown,
      id: 'usr 142/a',
      label: 'Ana [QA] Lima',
      trigger: '@',
    });
  });

  it('does not read ordinary links or a bad id as mentions', () => {
    expect(matchMention('[@Ana](https://example.com)')).to.equal(undefined);
    expect(matchMention('[Ana](mention:1)')).to.equal(undefined);
    expect(matchMention('[@Ana](mention:%E0%A4%A)')).to.equal(undefined);
  });

  it('extracts mentions once each, skipping code', () => {
    const markdown = [
      'Hi [@Ana Lima](mention:1) and [#INC-7](mention:inc-7).',
      '',
      '- again [@Ana Lima](mention:1)',
      '',
      '| who |',
      '| --- |',
      '| [@Ravi](mention:2) |',
      '',
      '`[@Code](mention:3)`',
      '',
      '```',
      '[@Block](mention:4)',
      '```',
    ].join('\n');
    expect(extractMentions(markdown)).to.deep.equal([
      { id: '1', label: 'Ana Lima', trigger: '@' },
      { id: 'inc-7', label: 'INC-7', trigger: '#' },
      { id: '2', label: 'Ravi', trigger: '@' },
    ]);
  });
});

describe('rich-text Markdown round trip', () => {
  it('parses a mention into a mention node', () => {
    const editor = markdownEditor('Ask [@Ana Lima](mention:usr_142) today');
    const paragraph = editor.getJSON().content?.[0];
    const mention = (paragraph?.content ?? []).find(
      node => node.type === 'mention',
    ) as { attrs?: Record<string, unknown> } | undefined;
    expect(mention?.attrs).to.include({
      id: 'usr_142',
      label: 'Ana Lima',
      mentionSuggestionChar: '@',
    });
    expect(editor.getText()).to.contain('@Ana Lima');
    editor.destroy();
  });

  it('writes back the Markdown it read', () => {
    const source = [
      '## Steps',
      '',
      '1. Open the **billing** page',
      '2. Ask [@Ana Lima](mention:usr_142) to _confirm_',
      '',
      '- [link](https://example.com)',
      '- `code`',
      '',
      '> Quoted',
      '',
      '```js',
      'const a = 1;',
      '```',
    ].join('\n');
    const editor = markdownEditor(source);
    const once = editor.getMarkdown();
    expect(once).to.contain('## Steps');
    expect(once).to.contain('**billing**');
    expect(once).to.contain('[@Ana Lima](mention:usr_142)');
    expect(once).to.contain('[link](https://example.com)');
    expect(once).to.contain('```js');

    // Reading what it wrote gives the same document.
    const again = markdownEditor(once);
    expect(again.getJSON()).to.deep.equal(editor.getJSON());
    expect(again.getMarkdown()).to.equal(once);
    editor.destroy();
    again.destroy();
  });

  it('allows underline only where the value can store it', () => {
    const markdown = markdownEditor('text');
    const html = markdownEditor('text', 'html');
    const comment = markdownEditor('text', 'comment');
    expect(markdown.schema.marks.underline).to.equal(undefined);
    expect(html.schema.marks.underline).to.not.equal(undefined);
    expect(comment.schema.nodes.heading).to.equal(undefined);
    expect(markdown.schema.nodes.heading).to.not.equal(undefined);
    markdown.destroy();
    html.destroy();
    comment.destroy();
  });
});

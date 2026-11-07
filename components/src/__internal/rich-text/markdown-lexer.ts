import {
  Marked,
  type Token,
  type TokenizerExtension,
  type Tokens,
} from 'marked';

import { matchMention, mentionStart, type RichTextMention } from './mention.js';

/**
 * The Markdown dialect every Peacock rich-text component reads: GitHub-flavoured Markdown without
 * soft line breaks turning into `<br>`, plus mentions. `wc-markdown` lexes with it, and the editors
 * use the same mention tokenizer, so read view and edit view agree.
 */

/** A mention token from the lexer. */
export interface MentionToken extends Tokens.Generic, RichTextMention {
  type: 'mention';
  raw: string;
}

/** The marked tokenizer for mention links; it runs before marked's own link tokenizer. */
export const mentionTokenizer: TokenizerExtension = {
  name: 'mention',
  level: 'inline',
  start(source: string) {
    const index = mentionStart(source);
    return index < 0 ? undefined : index;
  },
  tokenizer(source: string): MentionToken | undefined {
    const match = matchMention(source);
    if (!match) return undefined;
    return {
      type: 'mention',
      raw: match.raw,
      id: match.id,
      label: match.label,
      trigger: match.trigger,
    };
  },
};

let shared: Marked | undefined;

/** The shared marked instance with Peacock's options and the mention tokenizer. */
export function peacockMarked(): Marked {
  if (!shared) {
    shared = new Marked({ gfm: true, breaks: false, async: false });
    shared.use({ extensions: [mentionTokenizer] });
  }
  return shared;
}

/** Splits Markdown into block tokens. */
export function lexMarkdown(markdown: string): Token[] {
  return peacockMarked().lexer(markdown ?? '');
}

function collectMentions(tokens: Token[], found: RichTextMention[]) {
  for (const token of tokens) {
    if (token.type === 'mention') {
      const { id, label, trigger } = token as MentionToken;
      found.push({ id, label, trigger });
    }
    const nested = token as Tokens.Generic;
    // Mentions inside code are text, not mentions; code tokens have no nested tokens.
    if (Array.isArray(nested.tokens)) collectMentions(nested.tokens, found);
    if (Array.isArray(nested.items)) collectMentions(nested.items, found);
    if (token.type === 'table') {
      const table = token as Tokens.Table;
      table.header.forEach(cell => collectMentions(cell.tokens, found));
      table.rows.forEach(row =>
        row.forEach(cell => collectMentions(cell.tokens, found)),
      );
    }
  }
}

/**
 * The mentions in some Markdown, in document order, without duplicates (same trigger and id). Use
 * it to find who to notify when a comment or description is saved.
 */
export function extractMentions(markdown: string): RichTextMention[] {
  const found: RichTextMention[] = [];
  collectMentions(lexMarkdown(markdown), found);
  const seen = new Set<string>();
  return found.filter(mention => {
    const key = `${mention.trigger}\u0000${mention.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

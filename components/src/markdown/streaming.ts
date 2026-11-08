import type { Token } from 'marked';

import { lexMarkdown } from '@/__internal/rich-text/markdown-lexer.js';

/** Whether the text ends inside an open ``` or ~~~ fence. */
function insideFence(text: string): boolean {
  let open: string | undefined;
  for (const line of text.split('\n')) {
    const fence = /^ {0,3}(`{3,}|~{3,})/.exec(line)?.[1];
    if (fence && !open) open = fence;
    else if (
      fence &&
      open &&
      fence[0] === open[0] &&
      fence.length >= open.length
    )
      open = undefined;
  }
  return !!open;
}

/** Counts `marker` in text, ignoring inline code. */
function count(text: string, marker: string): number {
  const withoutCode = text.replace(/`[^`\n]*`/g, '');
  return withoutCode.split(marker).length - 1;
}

/**
 * Makes the unfinished end of a streaming answer render as it will once complete, instead of
 * flashing raw Markdown: an open `**`, `~~` or `` ` `` is closed, and a link still being written
 * (`[label](addr`) is held back until its `)` arrives. Only the last block is touched, and nothing
 * inside an open code fence, which marked already shows as code to the end.
 *
 * Only for display while streaming; the finished text is always rendered as it is.
 */
export function closeOpenMarkdown(text: string): string {
  if (!text || insideFence(text)) return text;
  const blockStart = text.lastIndexOf('\n\n') + 1;
  const head = text.slice(0, blockStart);
  let tail = text.slice(blockStart);

  // A link or image still being written shows once complete.
  tail = tail.replace(/!?\[[^\]\n]*(\]\([^)\n]*)?$/, '');
  // A marker with nothing after it yet would close onto itself.
  tail = tail.replace(/(\*{1,2}|_{1,2}|~~|`)$/, '');

  if (count(tail, '`') % 2 === 1) tail += '`';
  if (count(tail, '**') % 2 === 1) tail += '**';
  if (count(tail, '~~') % 2 === 1) tail += '~~';
  return head + tail;
}

/**
 * Lexes Markdown that grows at the end, as a streamed answer does. While the new text extends the
 * previous one, the blocks before the last two are kept and only the end is lexed again, so a long
 * answer costs the same per chunk as a short one. Anything else is lexed in full.
 */
export class StreamLexer {
  private source = '';

  private tokens: Token[] = [];

  /** The tokens for `text`; with `streaming`, its unfinished end is closed first. */
  lex(text: string, streaming: boolean): Token[] {
    const value = text ?? '';
    const tokens = streaming ? this.lexGrowing(value) : lexMarkdown(value);
    this.source = value;
    this.tokens = tokens;
    return tokens;
  }

  private lexGrowing(text: string): Token[] {
    const kept = this.tokens.slice(0, -2);
    const offset = kept.reduce((sum, token) => sum + token.raw.length, 0);
    const reusable =
      kept.length > 0 &&
      text.startsWith(this.source) &&
      !this.tokens.some(token => token.type === 'def') &&
      kept.map(token => token.raw).join('') === text.slice(0, offset);
    if (!reusable) return lexMarkdown(closeOpenMarkdown(text));
    return kept.concat(lexMarkdown(closeOpenMarkdown(text.slice(offset))));
  }
}

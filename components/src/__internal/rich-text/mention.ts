/**
 * Mentions in Peacock's rich text. Free of Tiptap, so `wc-markdown` can use it without loading an
 * editor.
 *
 * A mention is stored in Markdown as a link with the `mention:` scheme:
 *
 * ```md
 * [@Ana Lima](mention:usr_142)
 * ```
 *
 * The link text is the trigger followed by the label, and the address is the id, URI-encoded. It
 * is ordinary Markdown, so a renderer that knows nothing about mentions still shows the name.
 */

/** A mention in rich text. */
export interface RichTextMention {
  /** The `id` of the suggestion it was made from, such as a user id. */
  id: string;
  /** The name shown, without the trigger. */
  label: string;
  /** The trigger character, such as `@`. */
  trigger: string;
}

/** The address scheme of a mention link. */
export const MENTION_SCHEME = 'mention:';

/**
 * A mention link at the start of the source. Group 1 is the trigger (a symbol, never a letter or
 * digit), 2 the label, 3 the id.
 */
const MENTION_AT_START =
  /^\[([^\s\p{L}\p{N}\\[\]])((?:\\.|[^\\\]\n])+)\]\(mention:([^()\s]+)\)/u;

/** Where a mention link may start; used to tell the lexer where to stop plain text. */
const MENTION_ANYWHERE =
  /\[[^\s\p{L}\p{N}\\[\]](?:\\.|[^\\\]\n])+\]\(mention:/u;

/** A mention found at the start of some source, with the characters it spans. */
export interface MentionMatch extends RichTextMention {
  /** The Markdown the mention was read from. */
  raw: string;
}

/** Escapes the characters that would end the link text early. */
function escapeLabel(label: string): string {
  return label.replace(/[\\[\]]/g, '\\$&');
}

function unescapeLabel(label: string): string {
  return label.replace(/\\(.)/g, '$1');
}

/** The Markdown for a mention: `[@Ana Lima](mention:usr_142)`. */
export function mentionToMarkdown(mention: RichTextMention): string {
  return `[${mention.trigger}${escapeLabel(mention.label)}](${MENTION_SCHEME}${encodeURIComponent(mention.id)})`;
}

/** Reads a mention link at the very start of `source`, or returns `undefined`. */
export function matchMention(source: string): MentionMatch | undefined {
  const match = MENTION_AT_START.exec(source);
  if (!match) return undefined;
  let id: string;
  try {
    id = decodeURIComponent(match[3]);
  } catch {
    return undefined;
  }
  return {
    raw: match[0],
    trigger: match[1],
    label: unescapeLabel(match[2]),
    id,
  };
}

/** Index of the first place a mention link may start in `source`, or -1. */
export function mentionStart(source: string): number {
  return source.search(MENTION_ANYWHERE);
}

/** Whether a link address is a mention's. */
export function isMentionHref(href: string | null | undefined): boolean {
  return !!href && href.startsWith(MENTION_SCHEME);
}

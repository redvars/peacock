import { Mention } from '@tiptap/extension-mention';
import type { SuggestionOptions } from '@tiptap/suggestion';

import {
  matchMention,
  mentionStart,
  mentionToMarkdown,
  type RichTextMention,
} from './mention.js';

/** The attributes of a mention node. */
interface MentionAttrs {
  id?: string | null;
  label?: string | null;
  mentionSuggestionChar?: string | null;
}

/** The mention a node holds. */
export function mentionFromAttrs(attrs: MentionAttrs): RichTextMention {
  return {
    id: attrs.id ?? '',
    label: attrs.label ?? attrs.id ?? '',
    trigger: attrs.mentionSuggestionChar ?? '@',
  };
}

/**
 * Tiptap's mention node, read from and written to Markdown as a `mention:` link
 * (`[@Ana Lima](mention:usr_142)`) instead of Tiptap's own shortcode, so the stored Markdown reads
 * well anywhere. In HTML it stays Tiptap's `<span data-type="mention" data-id data-label>`.
 */
export const RichTextMentionNode = Mention.extend({
  markdownTokenName: 'mention',

  markdownTokenizer: {
    name: 'mention',
    level: 'inline',
    start: (source: string) => mentionStart(source),
    tokenize: (source: string) => {
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
  },

  parseMarkdown(token) {
    return {
      type: 'mention',
      attrs: {
        id: token.id,
        label: token.label,
        mentionSuggestionChar: token.trigger,
      },
    };
  },

  renderMarkdown(node) {
    return mentionToMarkdown(mentionFromAttrs(node.attrs ?? {}));
  },
});

/** The mention node configured with one suggestion plugin per trigger. */
export function createMentionExtension(
  suggestions: Omit<SuggestionOptions, 'editor'>[],
) {
  return RichTextMentionNode.configure({
    HTMLAttributes: { class: 'mention' },
    suggestions,
  });
}

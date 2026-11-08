import { Extension, type Extensions } from '@tiptap/core';
import { Plugin } from '@tiptap/pm/state';
import { StarterKit } from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TableKit } from '@tiptap/extension-table';
import { Markdown } from '@tiptap/markdown';
import type { SuggestionOptions } from '@tiptap/suggestion';

import { createMentionExtension } from './mention-node.js';

/**
 * Which editor the extensions are for. Each profile only allows what its value can store:
 * - `markdown`: `wc-markdown-editor`. No underline, which Markdown cannot write.
 * - `comment`: `wc-comment-composer`. Markdown without headings.
 * - `html`: `wc-html-editor`. Everything StarterKit has, including underline.
 * - `document`: `wc-document-editor`. Like `html`, with Markdown export.
 */
/**
 * What an editor can hold. `prompt` is plain text with line breaks and mentions, for
 * `wc-prompt-input`: no formatting, blocks or tables.
 */
export type RichTextProfile =
  | 'markdown'
  | 'comment'
  | 'html'
  | 'document'
  | 'prompt';

export interface RichTextExtensionOptions {
  /** The placeholder shown in an empty editor. */
  placeholder?: () => string;
  /** Maximum number of characters of text; typing stops there. */
  maxlength?: number;
  /** One suggestion plugin per mention trigger, from `RichTextMentionController`. */
  mentions?: Omit<SuggestionOptions, 'editor'>[];
  /** Turns the editor's own undo history off; collaboration brings its own. */
  history?: boolean;
  /** Extensions only one component needs, such as its slash menu. */
  extra?: Extensions;
}

/**
 * Transaction meta for content that comes from the `value` property rather than typing; the length
 * limit lets it through, so a value longer than `maxlength` loads whole and reports `tooLong`.
 */
export const SET_VALUE_META = 'peacockSetValue';

/**
 * Stops typing, pasting and commands from making the text longer than `limit` characters, as
 * `maxlength` does on a textarea. Shortening an over-long text is always allowed.
 */
function maxLength(limit: number) {
  return Extension.create({
    name: 'peacockMaxLength',
    addProseMirrorPlugins() {
      return [
        new Plugin({
          filterTransaction: (transaction, state) => {
            if (
              !transaction.docChanged ||
              transaction.getMeta(SET_VALUE_META)
            ) {
              return true;
            }
            const before = state.doc.textContent.length;
            const after = transaction.doc.textContent.length;
            return after <= limit || after <= before;
          },
        }),
      ];
    },
  });
}

/** Whether the profile's value is Markdown. */
export function isMarkdownProfile(profile: RichTextProfile): boolean {
  return (
    profile === 'markdown' || profile === 'comment' || profile === 'prompt'
  );
}

/** StarterKit with only paragraphs, line breaks and history: the plain `prompt` profile. */
function plainStarterKit(history: boolean) {
  return StarterKit.configure({
    bold: false,
    italic: false,
    strike: false,
    code: false,
    underline: false,
    link: false,
    heading: false,
    blockquote: false,
    codeBlock: false,
    bulletList: false,
    orderedList: false,
    listItem: false,
    listKeymap: false,
    horizontalRule: false,
    undoRedo: history ? {} : false,
  });
}

/** The Tiptap extensions for a Peacock rich-text editor. */
export function buildExtensions(
  profile: RichTextProfile,
  options: RichTextExtensionOptions = {},
): Extensions {
  const markdown = isMarkdownProfile(profile);
  if (profile === 'prompt') {
    const plain: Extensions = [
      plainStarterKit(options.history !== false),
      Placeholder.configure({
        placeholder: () => options.placeholder?.() ?? '',
      }),
      Markdown.configure({ markedOptions: { gfm: true } }),
    ];
    if (options.maxlength !== undefined && options.maxlength >= 0) {
      plain.push(maxLength(options.maxlength));
    }
    if (options.mentions?.length) {
      plain.push(createMentionExtension(options.mentions));
    }
    if (options.extra) plain.push(...options.extra);
    return plain;
  }
  const extensions: Extensions = [
    StarterKit.configure({
      underline: markdown ? false : {},
      undoRedo: options.history === false ? false : {},
      heading: profile === 'comment' ? false : { levels: [1, 2, 3] },
      link: {
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      },
    }),
    Placeholder.configure({
      placeholder: () => options.placeholder?.() ?? '',
    }),
    TaskList,
    TaskItem.configure({ nested: true }),
  ];
  if (options.maxlength !== undefined && options.maxlength >= 0) {
    extensions.push(maxLength(options.maxlength));
  }
  if (profile !== 'comment') {
    // Markdown tables have no merged cells or column widths.
    extensions.push(TableKit.configure({ table: { resizable: !markdown } }));
  }
  if (markdown || profile === 'document') {
    extensions.push(Markdown.configure({ markedOptions: { gfm: true } }));
  }
  if (options.mentions?.length) {
    extensions.push(createMentionExtension(options.mentions));
  }
  if (options.extra) extensions.push(...options.extra);
  return extensions;
}

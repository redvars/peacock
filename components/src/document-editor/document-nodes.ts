import { Node, type Extensions } from '@tiptap/core';
import { StarterKit } from '@tiptap/starter-kit';
import { Placeholder } from '@tiptap/extensions';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color, TextStyle } from '@tiptap/extension-text-style';
import { Image } from '@tiptap/extension-image';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    pageBreak: {
      /** Inserts a page break: what follows starts on a new page. */
      setPageBreak: () => ReturnType;
    };
    pageNumber: {
      /** Inserts the page number (`current`) or the page count (`total`). */
      insertPageNumber: (kind: 'current' | 'total') => ReturnType;
    };
  }
}

/** A manual page break. Ctrl/Cmd+Enter inserts one. */
export const PageBreak = Node.create<{ label: string }>({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  selectable: true,

  addOptions() {
    return { label: 'Page break' };
  },

  parseHTML() {
    return [{ tag: 'div[data-type="page-break"]' }];
  },

  renderHTML() {
    return [
      'div',
      {
        'data-type': 'page-break',
        'data-label': this.options.label,
        class: 'page-break',
      },
    ];
  },

  renderMarkdown() {
    return '<!-- page break -->';
  },

  addCommands() {
    return {
      setPageBreak:
        () =>
        ({ commands }) =>
          commands.insertContent({ type: this.name }),
    };
  },

  addKeyboardShortcuts() {
    return { 'Mod-Enter': () => this.editor.commands.setPageBreak() };
  },
});

/**
 * The page number or page count, for headers and footers. The editor shows `#`; each page shows
 * its own number.
 */
export const PageNumber = Node.create({
  name: 'pageNumber',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      kind: {
        default: 'current',
        parseHTML: element =>
          element.getAttribute('data-kind') === 'total' ? 'total' : 'current',
        renderHTML: attributes => ({ 'data-kind': attributes.kind }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-type="page-number"]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      { ...HTMLAttributes, 'data-type': 'page-number', class: 'page-number' },
      HTMLAttributes['data-kind'] === 'total' ? '##' : '#',
    ];
  },

  renderText({ node }) {
    return node.attrs.kind === 'total' ? '##' : '#';
  },

  renderMarkdown() {
    return '';
  },

  addCommands() {
    return {
      insertPageNumber:
        kind =>
        ({ commands }) =>
          commands.insertContent({ type: this.name, attrs: { kind } }),
    };
  },
});

/** Text align, text color and images: what a document adds to the rich-text set. */
export function documentFormatting(): Extensions {
  return [
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    TextStyle,
    Color,
    Image.configure({
      allowBase64: false,
      resize: {
        enabled: true,
        alwaysPreserveAspectRatio: true,
        minWidth: 48,
        minHeight: 48,
      },
    }),
  ];
}

/** The small editor of a header or footer: inline formatting, alignment and page numbers. */
export function marginalExtensions(
  placeholder: () => string,
  history = true,
): Extensions {
  return [
    StarterKit.configure({
      heading: false,
      codeBlock: false,
      blockquote: false,
      horizontalRule: false,
      bulletList: false,
      orderedList: false,
      listItem: false,
      undoRedo: history ? {} : false,
      link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
    }),
    TextAlign.configure({ types: ['paragraph'] }),
    TextStyle,
    Color,
    PageNumber,
    Placeholder.configure({ placeholder }),
  ];
}

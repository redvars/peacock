import { Mark, mergeAttributes, type Editor } from '@tiptap/core';
import type { Node as PMNode } from '@tiptap/pm/model';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    comment: {
      /** Marks the selection as commented in the thread `threadId`. */
      setComment: (threadId: string) => ReturnType;
      /** Removes every mark of the thread `threadId`. */
      unsetComment: (threadId: string) => ReturnType;
    };
  }
}

/** A commented range of the document. */
export interface CommentRange {
  threadId: string;
  from: number;
  to: number;
}

/** Every commented range, in document order. Adjacent pieces of one thread are merged. */
export function commentRanges(doc: PMNode): CommentRange[] {
  const ranges: CommentRange[] = [];
  doc.descendants((node, pos) => {
    if (!node.isText) return true;
    for (const mark of node.marks) {
      if (mark.type.name === 'comment' && mark.attrs.threadId) {
        const threadId = mark.attrs.threadId as string;
        const last = [...ranges]
          .reverse()
          .find(range => range.threadId === threadId);
        if (last && last.to === pos) last.to = pos + node.nodeSize;
        else ranges.push({ threadId, from: pos, to: pos + node.nodeSize });
      }
    }
    return false;
  });
  return ranges;
}

/** The threads at a position, innermost last. */
export function threadsAt(doc: PMNode, pos: number): string[] {
  const $pos = doc.resolve(pos);
  const marks = $pos.marks().concat($pos.nodeAfter?.marks ?? []);
  return Array.from(
    new Set(
      marks
        .filter(mark => mark.type.name === 'comment')
        .map(mark => mark.attrs.threadId as string),
    ),
  );
}

export const activeCommentKey = new PluginKey<string | null>(
  'peacockActiveComment',
);

/**
 * A comment on a range of text: a mark with the app's thread id, highlighted in the text. Threads
 * may overlap. In Markdown the mark is left out; in HTML it is a `span` with `data-thread-id`.
 * The thread under the caret, or set with the `activeCommentKey` meta, is highlighted more.
 */
export const CommentMark = Mark.create({
  name: 'comment',
  inclusive: false,
  excludes: '',

  addAttributes() {
    return {
      threadId: {
        default: null,
        parseHTML: element => element.getAttribute('data-thread-id'),
        renderHTML: attributes => ({ 'data-thread-id': attributes.threadId }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'span[data-thread-id]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'span',
      mergeAttributes({ class: 'comment-mark' }, HTMLAttributes),
      0,
    ];
  },

  renderMarkdown(node, helpers) {
    return helpers.renderChildren(node);
  },

  addCommands() {
    return {
      setComment:
        threadId =>
        ({ commands }) =>
          commands.setMark(this.name, { threadId }),
      unsetComment:
        threadId =>
        ({ tr, state, dispatch }) => {
          const type = state.schema.marks[this.name];
          let found = false;
          state.doc.descendants((node, pos) => {
            node.marks.forEach(mark => {
              if (mark.type === type && mark.attrs.threadId === threadId) {
                found = true;
                tr.removeMark(pos, pos + node.nodeSize, mark);
              }
            });
          });
          if (found && dispatch) dispatch(tr);
          return found;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin<string | null>({
        key: activeCommentKey,
        state: {
          init: () => null,
          apply: (tr, value) => {
            const meta = tr.getMeta(activeCommentKey);
            return meta === undefined ? value : (meta as string | null);
          },
        },
        props: {
          decorations: state => {
            const active = activeCommentKey.getState(state);
            if (!active) return null;
            const decorations = commentRanges(state.doc)
              .filter(range => range.threadId === active)
              .map(range =>
                Decoration.inline(range.from, range.to, {
                  class: 'comment-active',
                }),
              );
            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});

/** Highlights a thread's text more, or none for `null`. */
export function setActiveComment(editor: Editor, threadId: string | null) {
  if (activeCommentKey.getState(editor.state) === threadId) return;
  editor.view.dispatch(
    editor.state.tr
      .setMeta(activeCommentKey, threadId)
      .setMeta('addToHistory', false),
  );
}

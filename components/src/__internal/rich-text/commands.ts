import type { ChainedCommands, Editor } from '@tiptap/core';

/**
 * The formatting commands of Peacock's rich-text editors, in one place, so the toolbar, the slash
 * menu and the selection bubble offer the same things. A command is only offered when the editor's
 * schema has its node or mark, so each editor shows what its value can store.
 */

/** Keys of the strings that name blocks. */
export type BlockId =
  | 'paragraph'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletedList'
  | 'numberedList'
  | 'taskList'
  | 'quote'
  | 'codeBlock'
  | 'divider'
  | 'table';

/** Keys of the strings that name inline marks. */
export type MarkId =
  | 'bold'
  | 'italic'
  | 'underline'
  | 'strikethrough'
  | 'inlineCode';

export interface BlockCommand {
  id: BlockId;
  icon: string;
  /** Markdown that makes the same block, shown in the slash menu. */
  hint: string;
  /** The node the editor needs for this block. */
  node: string;
  /** Whether the block is a text style (paragraph or heading), offered in the style menu. */
  textStyle?: boolean;
  active: (editor: Editor) => boolean;
  run: (chain: ChainedCommands) => ChainedCommands;
}

export interface MarkCommand {
  id: MarkId;
  icon: string;
  mark: string;
  run: (chain: ChainedCommands) => ChainedCommands;
}

const heading = (level: 1 | 2 | 3): BlockCommand => ({
  id: `heading${level}`,
  icon: `format_h${level}`,
  hint: '#'.repeat(level),
  node: 'heading',
  textStyle: true,
  active: editor => editor.isActive('heading', { level }),
  run: chain => chain.setNode('heading', { level }),
});

export const BLOCKS: BlockCommand[] = [
  {
    id: 'paragraph',
    icon: 'notes',
    hint: '',
    node: 'paragraph',
    textStyle: true,
    active: editor =>
      editor.isActive('paragraph') && !editor.isActive('heading'),
    run: chain => chain.setParagraph(),
  },
  heading(1),
  heading(2),
  heading(3),
  {
    id: 'bulletedList',
    icon: 'format_list_bulleted',
    hint: '-',
    node: 'bulletList',
    active: editor => editor.isActive('bulletList'),
    run: chain => chain.toggleBulletList(),
  },
  {
    id: 'numberedList',
    icon: 'format_list_numbered',
    hint: '1.',
    node: 'orderedList',
    active: editor => editor.isActive('orderedList'),
    run: chain => chain.toggleOrderedList(),
  },
  {
    id: 'taskList',
    icon: 'checklist',
    hint: '[ ]',
    node: 'taskList',
    active: editor => editor.isActive('taskList'),
    run: chain => chain.toggleTaskList(),
  },
  {
    id: 'quote',
    icon: 'format_quote',
    hint: '>',
    node: 'blockquote',
    active: editor => editor.isActive('blockquote'),
    run: chain => chain.toggleBlockquote(),
  },
  {
    id: 'codeBlock',
    icon: 'code_blocks',
    hint: '```',
    node: 'codeBlock',
    active: editor => editor.isActive('codeBlock'),
    run: chain => chain.toggleCodeBlock(),
  },
  {
    id: 'table',
    icon: 'table',
    hint: '| |',
    node: 'table',
    active: editor => editor.isActive('table'),
    run: chain => chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }),
  },
  {
    id: 'divider',
    icon: 'horizontal_rule',
    hint: '---',
    node: 'horizontalRule',
    active: () => false,
    run: chain => chain.setHorizontalRule(),
  },
];

export const MARKS: MarkCommand[] = [
  {
    id: 'bold',
    icon: 'format_bold',
    mark: 'bold',
    run: chain => chain.toggleBold(),
  },
  {
    id: 'italic',
    icon: 'format_italic',
    mark: 'italic',
    run: chain => chain.toggleItalic(),
  },
  {
    id: 'underline',
    icon: 'format_underlined',
    mark: 'underline',
    run: chain => chain.toggleUnderline(),
  },
  {
    id: 'strikethrough',
    icon: 'format_strikethrough',
    mark: 'strike',
    run: chain => chain.toggleStrike(),
  },
  {
    id: 'inlineCode',
    icon: 'code',
    mark: 'code',
    run: chain => chain.toggleCode(),
  },
];

/** The blocks the editor's schema can hold. */
export function blocksFor(editor: Editor): BlockCommand[] {
  return BLOCKS.filter(block => !!editor.schema.nodes[block.node]);
}

/** The marks the editor's schema can hold. */
export function marksFor(editor: Editor): MarkCommand[] {
  return MARKS.filter(mark => !!editor.schema.marks[mark.mark]);
}

/** The text style (paragraph or heading level) at the selection. */
export function activeTextStyle(editor: Editor): BlockCommand | undefined {
  return blocksFor(editor).find(
    block => block.textStyle && block.active(editor),
  );
}

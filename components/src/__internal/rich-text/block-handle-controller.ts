import {
  html,
  nothing,
  type ReactiveController,
  type ReactiveControllerHost,
  type TemplateResult,
} from 'lit';
import { classMap } from 'lit/directives/class-map.js';
import { Extension, type Editor } from '@tiptap/core';
import { DOMSerializer } from '@tiptap/pm/model';
import { NodeSelection, Plugin } from '@tiptap/pm/state';

import type { I18nController } from '../i18n/i18n-controller.js';

interface HandleHost extends ReactiveControllerHost, HTMLElement {
  readonly renderRoot: HTMLElement | DocumentFragment;
  disabled: boolean;
  readonly: boolean;
}

interface HandleOptions {
  editor: () => Editor | undefined;
  i18n: I18nController;
  /** Whether the handle may show; false in source view. */
  allowed: () => boolean;
  /** Opens the block menu to insert a block after the one at `position`. */
  insertAfter: (position: number) => void;
}

/**
 * The block handle: hovering a top-level block shows, to its start, a drag button that moves the
 * block and a + button that opens the block menu to insert one below it.
 */
export class RichTextBlockHandleController implements ReactiveController {
  private readonly host: HandleHost;

  private readonly options: HandleOptions;

  private visible = false;

  /** A document position inside the block under the pointer. */
  private position = -1;

  private hideTimer?: number;

  /** The block being dragged with the handle: its position and its DOM. */
  private dragged: { from: number; dom: HTMLElement | null } | null = null;

  constructor(host: HandleHost, options: HandleOptions) {
    this.host = host;
    this.options = options;
    host.addController(this);
  }

  hostDisconnected() {
    window.clearTimeout(this.hideTimer);
    this.visible = false;
  }

  /** The ProseMirror plugin that follows the pointer over blocks. */
  extension() {
    const controller = this;
    return Extension.create({
      name: 'peacockBlockHandle',
      addProseMirrorPlugins() {
        return [
          new Plugin({
            props: {
              handleDOMEvents: {
                mousemove: (view, event) => {
                  controller.onMove(event);
                  return false;
                },
                mouseleave: (_view, event) => {
                  controller.onLeave(event);
                  return false;
                },
              },
            },
          }),
        ];
      },
    });
  }

  render(): TemplateResult | typeof nothing {
    if (!this.options.allowed()) return nothing;
    const { i18n } = this.options;
    const disabled = this.host.disabled || this.host.readonly;
    return html`<div
      class=${classMap({ 'block-handle': true, visible: this.visible })}
      @mouseenter=${this.onHandleEnter}
      @mouseleave=${this.onHandleLeave}
    >
      <button
        type="button"
        class="block-handle-button"
        title=${i18n.t('dragToReorder')}
        aria-label=${i18n.t('dragToReorder')}
        draggable="true"
        ?disabled=${disabled}
        @click=${this.selectBlock}
        @dragstart=${this.onDragStart}
        @dragend=${this.onDragEnd}
      >
        <wc-icon name="drag_indicator" size="sm"></wc-icon>
      </button>
      <button
        type="button"
        class="block-handle-button"
        title=${i18n.t('insertBlockBelow')}
        aria-label=${i18n.t('insertBlockBelow')}
        ?disabled=${disabled}
        @mousedown=${(event: Event) => event.preventDefault()}
        @click=${() => this.options.insertAfter(this.position)}
      >
        <wc-icon name="add" size="sm"></wc-icon>
      </button>
    </div>`;
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private get handle(): HTMLElement | null {
    return this.host.renderRoot.querySelector<HTMLElement>('.block-handle');
  }

  private setVisible(visible: boolean) {
    if (this.visible === visible) return;
    this.visible = visible;
    this.host.requestUpdate();
  }

  private onMove(event: MouseEvent) {
    const editor = this.options.editor();
    if (
      !editor ||
      this.host.disabled ||
      this.host.readonly ||
      !this.options.allowed()
    ) {
      this.setVisible(false);
      return;
    }
    const coords = editor.view.posAtCoords({
      left: event.clientX,
      top: event.clientY,
    });
    if (!coords) {
      this.setVisible(false);
      return;
    }
    // A position inside the block, so domAtPos() resolves to the block, not its parent.
    this.position = coords.pos;
    window.clearTimeout(this.hideTimer);
    this.setVisible(true);
    this.place(editor);
  }

  private onLeave(event: MouseEvent) {
    const next = event.relatedTarget as Node | null;
    if (next && this.handle?.contains(next)) return;
    // A short delay lets the pointer travel to the handle.
    window.clearTimeout(this.hideTimer);
    this.hideTimer = window.setTimeout(() => this.setVisible(false), 400);
  }

  private onHandleEnter = () => {
    window.clearTimeout(this.hideTimer);
  };

  private onHandleLeave = (event: MouseEvent) => {
    const next = event.relatedTarget as Node | null;
    if (next && this.options.editor()?.view.dom.contains(next)) return;
    window.clearTimeout(this.hideTimer);
    this.hideTimer = window.setTimeout(() => this.setVisible(false), 150);
  };

  /** Places the handle beside the top-level block at `position`. */
  private place(editor: Editor) {
    const { handle } = this;
    if (!handle) return;
    try {
      const { view } = editor;
      const $pos = view.state.doc.resolve(this.position);
      if ($pos.depth < 1) {
        this.setVisible(false);
        return;
      }
      const block = view.nodeDOM($pos.before(1)) as HTMLElement | null;
      if (!block || !(block instanceof HTMLElement)) {
        this.setVisible(false);
        return;
      }
      const rect = block.getBoundingClientRect();
      const root = view.dom.getBoundingClientRect();
      const height = handle.offsetHeight || 28;
      handle.style.setProperty(
        'top',
        `${rect.top + Math.min(rect.height, 28) / 2 - height / 2}px`,
      );
      // The handle sits in the gutter at the start of the line: the left, or the right in RTL.
      const rtl = getComputedStyle(view.dom).direction === 'rtl';
      const left = rtl ? root.right + 4 : root.left - handle.offsetWidth - 4;
      handle.style.setProperty('left', `${left}px`);
    } catch {
      this.setVisible(false);
    }
  }

  private blockPosition(editor: Editor): number | undefined {
    try {
      const $pos = editor.state.doc.resolve(this.position);
      return $pos.depth > 0 ? $pos.before(1) : undefined;
    } catch {
      return undefined;
    }
  }

  /** A click (without a drag) selects the block, so it can be copied, cut or deleted. */
  private selectBlock = () => {
    const editor = this.options.editor();
    if (!editor) return;
    const at = this.blockPosition(editor);
    if (at === undefined) return;
    const { state } = editor.view;
    editor.view.dispatch(
      state.tr.setSelection(NodeSelection.create(state.doc, at)),
    );
    editor.view.focus();
  };

  /**
   * Starts a native drag of the block. The `mousedown` before it must not be cancelled, or the
   * browser never starts the drag. ProseMirror's own drop handler moves the block: `dragging.node`
   * tells it which node to delete, so the move does not depend on the editor's selection.
   */
  private onDragStart = (event: DragEvent) => {
    const editor = this.options.editor();
    if (!editor || !event.dataTransfer) return;
    const at = this.blockPosition(editor);
    const node = at === undefined ? null : editor.state.doc.nodeAt(at);
    if (at === undefined || !node) {
      event.preventDefault();
      return;
    }
    const { view } = editor;
    const selection = NodeSelection.create(view.state.doc, at);
    view.dispatch(view.state.tr.setSelection(selection));
    const slice = selection.content();
    const container = document.createElement('div');
    container.appendChild(
      DOMSerializer.fromSchema(editor.schema).serializeFragment(slice.content),
    );
    const { dataTransfer } = event;
    dataTransfer.clearData();
    dataTransfer.setData('text/html', container.innerHTML);
    dataTransfer.setData('text/plain', container.textContent ?? '');
    dataTransfer.effectAllowed = 'move';
    // Show the block itself under the pointer, not the handle.
    const block = view.nodeDOM(at);
    const dom = block instanceof HTMLElement ? block : null;
    if (dom) dataTransfer.setDragImage(dom, 0, 0);
    // Dropped outside the editor (in another app, say), ProseMirror's own handlers see a normal drag.
    view.dragging = {
      slice,
      move: true,
      node: selection,
    } as typeof view.dragging;
    this.dragged = { from: at, dom };
  };

  private onDragEnd = () => {
    const editor = this.options.editor();
    if (editor) editor.view.dragging = null;
    this.dragged = null;
    this.setDropIndex(-1);
  };

  // ── Dropping ─────────────────────────────────────────────────────────────

  /**
   * For the editing area's `dragover`, in the capture phase: while a block is dragged with the
   * handle, it picks the gap between blocks nearest the pointer by height and shows the drop line.
   * Returns whether it handled the event.
   */
  dragOver(event: DragEvent): boolean {
    const editor = this.options.editor();
    if (!this.dragged || !editor) return false;
    event.preventDefault();
    event.stopPropagation();
    const { dataTransfer } = event;
    if (dataTransfer) dataTransfer.dropEffect = 'move';
    this.setDropIndex(this.gapAt(editor, event.clientY));
    return true;
  }

  /** For the editing area's `drop`, in the capture phase: moves the dragged block into the gap. */
  drop(event: DragEvent): boolean {
    const editor = this.options.editor();
    const { dragged } = this;
    if (!dragged || !editor) return false;
    event.preventDefault();
    event.stopPropagation();
    const index = this.gapAt(editor, event.clientY);
    this.dragged = null;
    this.setDropIndex(-1);
    editor.view.dragging = null;
    this.move(editor, dragged.from, index);
    return true;
  }

  /** The drop line, for the host's template. */
  renderDropLine(): TemplateResult {
    return html`<div class="drop-line" aria-hidden="true"></div>`;
  }

  /** The index of the top-level block the pointer is above the middle of; the count when below all. */
  private gapAt(editor: Editor, y: number): number {
    const { doc } = editor.state;
    let pos = 0;
    for (let index = 0; index < doc.childCount; index += 1) {
      const dom = editor.view.nodeDOM(pos);
      if (dom instanceof HTMLElement) {
        const rect = dom.getBoundingClientRect();
        if (y < rect.top + rect.height / 2) return index;
      }
      pos += doc.child(index).nodeSize;
    }
    return doc.childCount;
  }

  /** Moves the top-level block at `from` to before the block at `index`. */
  private move(editor: Editor, from: number, index: number) {
    const { state } = editor.view;
    const node = state.doc.nodeAt(from);
    if (!node) return;
    let to = 0;
    for (let i = 0; i < index && i < state.doc.childCount; i += 1) {
      to += state.doc.child(i).nodeSize;
    }
    // Dropped right before or after itself: nothing moves.
    if (to === from || to === from + node.nodeSize) {
      editor.view.focus();
      return;
    }
    const tr = state.tr.delete(from, from + node.nodeSize);
    const at = tr.mapping.map(to);
    tr.insert(at, node);
    tr.setSelection(NodeSelection.create(tr.doc, at));
    editor.view.dispatch(tr.scrollIntoView());
    editor.view.focus();
  }

  /** Shows the drop line in the gap before the block at `index`, or hides it for -1. */
  private setDropIndex(index: number) {
    const line = this.host.renderRoot.querySelector<HTMLElement>('.drop-line');
    const editor = this.options.editor();
    if (!line) return;
    if (index < 0 || !editor) {
      line.classList.remove('visible');
      return;
    }
    const { view } = editor;
    const { doc } = view.state;
    const box = view.dom.getBoundingClientRect();
    const rectOf = (i: number) => {
      let pos = 0;
      for (let j = 0; j < i; j += 1) pos += doc.child(j).nodeSize;
      const dom = view.nodeDOM(pos);
      return dom instanceof HTMLElement ? dom.getBoundingClientRect() : null;
    };
    const above = index > 0 ? rectOf(index - 1) : null;
    const below = index < doc.childCount ? rectOf(index) : null;
    let { top } = box;
    if (above && below) top = (above.bottom + below.top) / 2;
    else if (above) top = above.bottom + 2;
    else if (below) top = below.top - 2;
    line.style.setProperty('top', `${top - 1}px`);
    line.style.setProperty('left', `${box.left}px`);
    line.style.inlineSize = `${box.width}px`;
    line.classList.add('visible');
  }
}

import {
  html,
  type ReactiveController,
  type ReactiveControllerHost,
  type TemplateResult,
} from 'lit';
import type { Editor } from '@tiptap/core';
import { TextSelection } from '@tiptap/pm/state';

import { FloatingController } from '../controllers/floating-controller.js';
import { OverlayController } from '../controllers/overlay-controller.js';
import type { I18nController } from '../i18n/i18n-controller.js';
import { marksFor } from './commands.js';

interface BubbleHost extends ReactiveControllerHost, HTMLElement {
  readonly renderRoot: HTMLElement | DocumentFragment;
  disabled: boolean;
  readonly: boolean;
}

interface BubbleOptions {
  editor: () => Editor | undefined;
  i18n: I18nController;
  /** Whether the bubble may show now; false in source view or while another popup is open. */
  allowed: () => boolean;
  /** Opens the link editor. */
  editLink: () => void;
  /** Buttons a component adds after the standard ones, such as Comment. */
  extra?: () => TemplateResult | string;
}

let bubbleCount = 0;

/**
 * The selection bubble: a small toolbar above selected text with the inline marks the editor
 * allows and a link button. It is the main formatting control when the fixed toolbar is hidden.
 * Pressing it never takes focus from the editor.
 */
export class RichTextBubbleController implements ReactiveController {
  private readonly host: BubbleHost;

  private readonly options: BubbleOptions;

  private readonly id = `wc-rich-text-bubble-${(bubbleCount += 1)}`;

  private shown = false;

  private readonly floating: FloatingController;

  private readonly overlay: OverlayController;

  constructor(host: BubbleHost, options: BubbleOptions) {
    this.host = host;
    this.options = options;
    host.addController(this);
    this.floating = new FloatingController(host, {
      placement: 'top',
      strategy: 'fixed',
      offset: 8,
      trigger: 'manual',
      closeOnClickOutside: false,
    });
    this.overlay = new OverlayController(host, {
      surface: () => this.bubble,
      closeOnEscape: () => false,
      focusOnOpen: () => false,
      restoreFocus: () => false,
      requestClose: () => undefined,
    });
  }

  hostUpdated() {
    const show = this.visible;
    if (show !== this.shown) {
      this.shown = show;
      if (show) {
        this.overlay.sync(true);
        this.place();
        this.floating.open();
      } else {
        this.floating.close();
        this.overlay.sync(false);
      }
    } else if (show) {
      this.place();
    }
  }

  hostDisconnected() {
    this.shown = false;
  }

  /** Whether the bubble shows: text is selected in a focused, editable editor. */
  get visible(): boolean {
    const editor = this.options.editor();
    if (!editor || editor.isDestroyed || !editor.isFocused) return false;
    if (this.host.disabled || this.host.readonly || !this.options.allowed()) {
      return false;
    }
    const { selection } = editor.state;
    return selection instanceof TextSelection && !selection.empty;
  }

  render(): TemplateResult {
    const editor = this.options.editor();
    const { i18n } = this.options;
    const marks = editor ? marksFor(editor) : [];
    return html`<span class="bubble-anchor" aria-hidden="true"></span>
      <div
        id=${this.id}
        class="bubble-menu"
        popover="manual"
        role="toolbar"
        aria-label=${i18n.t('inlineFormatting')}
        @mousedown=${(event: MouseEvent) => event.preventDefault()}
      >
        ${editor && this.visible
          ? html`${marks.map(
              mark =>
                html`<wc-icon-button
                  class="bubble-button"
                  variant="text"
                  color="surface"
                  shape="round"
                  size="xs"
                  toggle
                  ?selected=${editor.isActive(mark.mark)}
                  aria-label=${i18n.t(mark.id)}
                  tooltip=${i18n.t(mark.id)}
                  @click=${() => mark.run(editor.chain().focus()).run()}
                  ><wc-icon name=${mark.icon}></wc-icon
                ></wc-icon-button>`,
            )}
            ${editor.schema.marks.link
              ? html`<wc-icon-button
                  class="bubble-button"
                  variant="text"
                  color="surface"
                  shape="round"
                  size="xs"
                  toggle
                  ?selected=${editor.isActive('link')}
                  aria-label=${i18n.t('link')}
                  tooltip=${i18n.t('link')}
                  @click=${() => this.options.editLink()}
                  ><wc-icon name="link"></wc-icon
                ></wc-icon-button>`
              : ''}
            ${this.options.extra?.() ?? ''}`
          : ''}
      </div>`;
  }

  private get bubble(): HTMLElement | null {
    return this.host.renderRoot.querySelector<HTMLElement>(`#${this.id}`);
  }

  private place() {
    const editor = this.options.editor();
    const anchor =
      this.host.renderRoot.querySelector<HTMLElement>('.bubble-anchor');
    const { bubble } = this;
    if (!editor || !anchor || !bubble) return;
    const { from, to } = editor.state.selection;
    const start = editor.view.coordsAtPos(from);
    const end = editor.view.coordsAtPos(to);
    const left = Math.min(start.left, end.left);
    const right = Math.max(start.right, end.right);
    anchor.style.setProperty('top', `${start.top}px`);
    anchor.style.setProperty('left', `${left}px`);
    anchor.style.inlineSize = `${Math.max(1, right - left)}px`;
    anchor.style.blockSize = `${Math.max(1, end.bottom - start.top)}px`;
    this.floating.setElements(anchor, bubble);
  }
}

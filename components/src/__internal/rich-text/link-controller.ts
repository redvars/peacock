import {
  html,
  nothing,
  type ReactiveController,
  type ReactiveControllerHost,
  type TemplateResult,
} from 'lit';
import { Extension, type Editor } from '@tiptap/core';

import { FloatingController } from '../controllers/floating-controller.js';
import { OverlayController } from '../controllers/overlay-controller.js';
import type { I18nController } from '../i18n/i18n-controller.js';
import { linkFromInput } from './url.js';

interface LinkHost extends ReactiveControllerHost, HTMLElement {
  readonly renderRoot: HTMLElement | DocumentFragment;
  disabled: boolean;
  readonly: boolean;
}

interface LinkOptions {
  editor: () => Editor | undefined;
  i18n: I18nController;
}

let linkCount = 0;

/**
 * The link editor: a small popover under the selection with an address field, opened from the
 * toolbar, the selection bubble or Ctrl/Cmd+K. Apply links the selection (or the link the caret is
 * in); Remove unlinks it. Addresses are checked with `linkFromInput`, so `javascript:` never
 * becomes a link and `example.com` gets `https://`.
 */
export class RichTextLinkController implements ReactiveController {
  /** Whether the popover is open. */
  open = false;

  private readonly host: LinkHost;

  private readonly options: LinkOptions;

  private readonly id = `wc-rich-text-link-${(linkCount += 1)}`;

  private draft = '';

  private invalid = false;

  /** Whether the selection was already in a link when the popover opened. */
  private editing = false;

  private shown = false;

  private readonly floating: FloatingController;

  private readonly overlay: OverlayController;

  constructor(host: LinkHost, options: LinkOptions) {
    this.host = host;
    this.options = options;
    host.addController(this);
    this.floating = new FloatingController(host, {
      placement: 'bottom-start',
      strategy: 'fixed',
      offset: 8,
      trigger: 'manual',
      closeOnClickOutside: false,
    });
    this.overlay = new OverlayController(host, {
      surface: () => this.popover,
      lightDismiss: () => true,
      focusOnOpen: () => true,
      initialFocus: () =>
        this.popover?.querySelector<HTMLElement>('wc-input') ?? null,
      restoreFocus: () => false,
      requestClose: () => this.close(true),
    });
  }

  hostUpdated() {
    if (this.open !== this.shown) {
      this.shown = this.open;
      if (this.open) {
        this.overlay.sync(true);
        this.place();
        this.floating.open();
      } else {
        this.floating.close();
        this.overlay.sync(false);
      }
    }
  }

  hostDisconnected() {
    this.open = false;
    this.shown = false;
  }

  /** The Ctrl/Cmd+K shortcut. */
  extension() {
    const controller = this;
    return Extension.create({
      name: 'peacockLinkShortcut',
      addKeyboardShortcuts() {
        return {
          'Mod-k': () => {
            controller.show();
            return true;
          },
        };
      },
    });
  }

  /** Opens the popover for the selection. */
  show() {
    const editor = this.options.editor();
    if (!editor || this.host.disabled || this.host.readonly) return;
    if (!editor.schema.marks.link) return;
    const href =
      (editor.getAttributes('link').href as string | undefined) ?? '';
    this.editing = !!href;
    this.draft = href;
    this.invalid = false;
    this.open = true;
    this.host.requestUpdate();
  }

  render(): TemplateResult {
    const { i18n } = this.options;
    return html`<span class="link-anchor" aria-hidden="true"></span>
      <div
        id=${this.id}
        class="link-editor"
        popover="manual"
        role="dialog"
        aria-label=${i18n.t('link')}
      >
        ${this.open
          ? html`<wc-input
                class="link-input"
                size="sm"
                label=${i18n.t('linkAddress')}
                placeholder="https://"
                .value=${this.draft}
                ?error=${this.invalid}
                error-text=${this.invalid ? i18n.t('linkInvalid') : ''}
                @input=${(event: CustomEvent<{ value: string }>) => {
                  event.stopPropagation();
                  this.draft = event.detail.value;
                  this.invalid = false;
                }}
                @change=${(event: Event) => event.stopPropagation()}
                @keydown=${this.onKeyDown}
              ></wc-input>
              <div class="link-actions">
                ${this.editing
                  ? html`<wc-button
                      variant="text"
                      size="sm"
                      @click=${this.remove}
                      >${i18n.t('removeLink')}</wc-button
                    >`
                  : nothing}
                <wc-button size="sm" @click=${this.apply}
                  >${i18n.t('applyLink')}</wc-button
                >
              </div>`
          : nothing}
      </div>`;
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.apply();
    }
  };

  private apply = () => {
    const editor = this.options.editor();
    if (!editor) return;
    if (!this.draft.trim()) {
      this.remove();
      return;
    }
    const href = linkFromInput(this.draft);
    if (!href) {
      this.invalid = true;
      this.host.requestUpdate();
      return;
    }
    const { empty } = editor.state.selection;
    if (empty && !this.editing) {
      // Nothing selected: insert the address as linked text.
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'text',
          text: this.draft.trim(),
          marks: [{ type: 'link', attrs: { href } }],
        })
        .run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    }
    this.close(false);
  };

  private remove = () => {
    this.options
      .editor()
      ?.chain()
      .focus()
      .extendMarkRange('link')
      .unsetLink()
      .run();
    this.close(false);
  };

  private close(refocus: boolean) {
    if (!this.open) return;
    this.open = false;
    this.host.requestUpdate();
    if (refocus) this.options.editor()?.commands.focus();
  }

  private get popover(): HTMLElement | null {
    return this.host.renderRoot.querySelector<HTMLElement>(`#${this.id}`);
  }

  /** Puts the anchor under the selection. */
  private place() {
    const editor = this.options.editor();
    const anchor =
      this.host.renderRoot.querySelector<HTMLElement>('.link-anchor');
    const { popover } = this;
    if (!editor || !anchor || !popover) return;
    const { from, to } = editor.state.selection;
    const start = editor.view.coordsAtPos(from);
    const end = editor.view.coordsAtPos(to);
    anchor.style.setProperty('top', `${start.top}px`);
    anchor.style.setProperty('left', `${Math.min(start.left, end.left)}px`);
    anchor.style.blockSize = `${end.bottom - start.top}px`;
    this.floating.setElements(anchor, popover);
  }
}

import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import { styleMap } from 'lit/directives/style-map.js';
import IndividualComponent from '../IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import {
  type CloseReason,
  OverlayController,
} from '@/__internal/controllers/overlay-controller.js';
import { deprecate } from '@/__internal/utils/deprecate.js';
import styles from './bottom-sheet.scss';

/** The `bottom-sheet-close` reasons from before `close` (deprecated event). */
const LEGACY_REASONS: Record<CloseReason, string> = {
  escape: 'esc',
  'light-dismiss': 'scrim',
  action: 'drag',
  timeout: 'programmatic',
  api: 'programmatic',
};

/** How far (px) the sheet must be dragged down to close. */
const DRAG_CLOSE_DISTANCE = 80;

/** Pointer movement (px) under which a press on the handle counts as a click, not a drag. */
const DRAG_CLICK_TOLERANCE = 4;

/**
 * @label Bottom Sheet
 * @tag wc-bottom-sheet
 * @rawTag bottom-sheet
 * @summary Bottom sheets slide up from the bottom of the screen to reveal additional content. Supports standard and modal variants.
 * @overview
 * <p>The sheet renders a native <code>&lt;dialog&gt;</code>. The <code>modal</code> variant (the default)
 * opens it with <code>showModal()</code>: it renders in the browser's top layer above the page, with a
 * scrim; the rest of the page is inert and does not scroll; focus moves to the first element with
 * <code>autofocus</code> inside it and returns where it was when the sheet closes. Escape and a click
 * on the scrim close it (<code>no-light-dismiss</code> keeps it open on scrim clicks).</p>
 * <p>The drag handle closes the sheet when dragged down, clicked, or pressed with Enter or Space.</p>
 * <p>The <code>standard</code> variant opens the dialog with <code>show()</code>: it is not modal and
 * stays in the page flow at the end of its container.</p>
 *
 * @cssprop --bottom-sheet-container-color - Background color of the sheet container.
 * @cssprop --bottom-sheet-scrim-color - Color of the modal scrim overlay.
 * @cssprop --bottom-sheet-shape - Corner radius of the top edge.
 * @cssprop --bottom-sheet-max-height - Maximum height of the sheet.
 *
 * @fires {CustomEvent} open - Fired when the sheet opens.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api'}>} close - Fired when the sheet closes: Escape, a scrim click, the drag handle (`action`), or `hide()`.
 * @fires {CustomEvent<{reason: string}>} bottom-sheet-close - Deprecated, use `close`. `detail.reason` is `"esc"`, `"scrim"`, `"drag"` or `"programmatic"`.
 *
 * @example
 * ```html
 * <wc-button onclick="document.getElementById('share').show()">Share</wc-button>
 * <wc-bottom-sheet id="share" label="Share">
 *   <wc-list>
 *     <wc-list-item autofocus>Copy link</wc-list-item>
 *     <wc-list-item>Email</wc-list-item>
 *   </wc-list>
 * </wc-bottom-sheet>
 * ```
 * @tags navigation, overlay
 */
@IndividualComponent
export class BottomSheet extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Whether the sheet is visible. */
  @property({ type: Boolean, reflect: true }) open = false;

  /**
   * Sheet variant. Set it before opening the sheet.
   * - `"standard"`: Non-modal; stays in the page flow, no scrim.
   * - `"modal"`: Overlays the page in the top layer with a scrim; the page is inert.
   */
  @property({ type: String, reflect: true }) variant: 'standard' | 'modal' =
    'modal';

  /** Accessible name of the sheet. */
  @property({ type: String }) label = '';

  /** Hides the drag handle. */
  @property({ type: Boolean, reflect: true, attribute: 'hide-handle' })
  hideHandle = false;

  /** Keeps a modal sheet open when the scrim is clicked. Escape still closes it. */
  @property({ type: Boolean, attribute: 'no-light-dismiss' }) noLightDismiss =
    false;

  /** @deprecated Use `hide-handle`. */
  @property({ type: Boolean, attribute: 'show-handle' }) showHandle = true;

  // ── State ────────────────────────────────────────────────────────────────

  @state() private _dragging = false;

  @state() private _dragOffsetY = 0;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('dialog') private _dialog?: HTMLDialogElement;

  @query('.sheet') private _sheet?: HTMLElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the default label and the drag handle. */
  private readonly i18n = new I18nController(this);

  private readonly overlay = new OverlayController(this, {
    surface: () => this._dialog,
    modal: () => this._isModal,
    closeOnEscape: () => this._isModal,
    exitAnimationTargets: () => [this._sheet],
    requestClose: reason => this._close(reason),
  });

  private _dragStartY = 0;

  /** The last press on the handle moved, so the click that follows it is not a click. */
  private _suppressHandleClick = false;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('showHandle') && !this.showHandle) {
      deprecate('wc-bottom-sheet', '`showHandle = false`', '`hide-handle`');
    }
    if (changed.has('open') && this.open) {
      this._dragOffsetY = 0;
    }
  }

  protected override updated(changed: PropertyValues<this>) {
    if (!changed.has('open')) return;
    this.overlay.sync(this.open);
    if (this.open) {
      this.dispatchEvent(
        new CustomEvent('open', { bubbles: true, composed: true }),
      );
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Opens the sheet. */
  show() {
    this.open = true;
  }

  /** Closes the sheet. */
  hide() {
    this._close('api');
  }

  /** Opens the sheet when closed, closes it when open. */
  toggle() {
    if (this.open) this.hide();
    else this.show();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private get _isModal() {
    return this.variant !== 'standard';
  }

  private get _hasHandle() {
    return this.showHandle && !this.hideHandle;
  }

  private _close(reason: CloseReason) {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(
      new CustomEvent('close', {
        detail: { reason },
        bubbles: true,
        composed: true,
      }),
    );
    this.dispatchEvent(
      new CustomEvent('bottom-sheet-close', {
        detail: { reason: LEGACY_REASONS[reason] },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** The native Escape `cancel`: the overlay controller handles Escape, so keep `open` in charge. */
  private _handleCancel(event: Event) {
    event.preventDefault();
    this._close('escape');
  }

  /**
   * The browser closed the dialog by itself: keep `open` in step. A `close` from content inside
   * the dialog (a popover, menu or select closing; they bubble and are composed) is not ours.
   */
  private _handleNativeClose(event: Event) {
    if (event.target !== this._dialog) return;
    if (this.open) this._close('escape');
  }

  /** A click on the scrim, not on the sheet, is a light dismiss. */
  private _handleDialogClick(event: MouseEvent) {
    const target = event.target as Element;
    if (!target.classList?.contains('scrim')) return;
    if (this._isModal && !this.noLightDismiss) this._close('light-dismiss');
  }

  private _handleDragStart(event: PointerEvent) {
    this._dragging = true;
    this._suppressHandleClick = false;
    this._dragStartY = event.clientY;
    this._dragOffsetY = 0;
    try {
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    } catch {
      // The pointer is no longer active (or is synthetic); dragging works without capture.
    }
  }

  private _handleDragMove(event: PointerEvent) {
    if (!this._dragging) return;
    this._dragOffsetY = Math.max(0, event.clientY - this._dragStartY);
    if (this._dragOffsetY > DRAG_CLICK_TOLERANCE) {
      this._suppressHandleClick = true;
    }
  }

  private _handleDragEnd() {
    if (!this._dragging) return;
    this._dragging = false;
    if (this._dragOffsetY > DRAG_CLOSE_DISTANCE) {
      // Keep the dragged offset so the exit animation starts where the sheet was let go.
      this._close('action');
      return;
    }
    this._dragOffsetY = 0;
  }

  /** A click, or Enter / Space on the focused handle (a native button), closes the sheet. */
  private _handleHandleClick() {
    if (this._suppressHandleClick) {
      this._suppressHandleClick = false;
      return;
    }
    this._close('action');
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private _renderHandle() {
    if (!this._hasHandle) return nothing;
    return html`<button
      class="handle-area"
      part="handle"
      type="button"
      aria-label=${this.i18n.t('closeSheet')}
      @click=${this._handleHandleClick}
      @pointerdown=${this._handleDragStart}
      @pointermove=${this._handleDragMove}
      @pointerup=${this._handleDragEnd}
      @pointercancel=${this._handleDragEnd}
    >
      <span class="handle"></span>
    </button>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    // The scrim click has its keyboard equivalent in Escape, which the overlay controller
    // handles; lit-a11y does not count that as a key listener.
    /* eslint-disable lit-a11y/click-events-have-key-events */
    return html`
      <dialog
        class=${classMap({
          'native-dialog': true,
          [`variant-${this._isModal ? 'modal' : 'standard'}`]: true,
        })}
        part="dialog"
        aria-label=${this.label || this.ariaLabel || this.i18n.t('bottomSheet')}
        @cancel=${this._handleCancel}
        @close=${this._handleNativeClose}
        @click=${this._handleDialogClick}
      >
        ${this._isModal
          ? html`<div
              class=${classMap({ scrim: true, visible: this.open })}
              aria-hidden="true"
            ></div>`
          : nothing}

        <div
          class=${classMap({
            sheet: true,
            open: this.open,
            dragging: this._dragging,
          })}
          part="sheet"
          style=${styleMap({
            transform:
              this._dragOffsetY > 0
                ? `translateY(${this._dragOffsetY}px)`
                : undefined,
          })}
        >
          ${this._renderHandle()}
          <div class="content">
            <slot></slot>
          </div>
        </div>
      </dialog>
    `;
    /* eslint-enable lit-a11y/click-events-have-key-events */
  }
}

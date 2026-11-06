import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { property, query } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '../IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import {
  type CloseReason,
  OverlayController,
} from '@/__internal/controllers/overlay-controller.js';
import { deprecate } from '@/__internal/utils/deprecate.js';
import styles from './side-sheet.scss';

type SideSheetPlacement = 'start' | 'end';

/** The `side-sheet-close` reasons from before `close` (deprecated event). */
const LEGACY_REASONS: Record<CloseReason, string> = {
  escape: 'escape',
  'light-dismiss': 'scrim',
  action: 'close-button',
  timeout: 'programmatic',
  api: 'programmatic',
};

/**
 * @label Side Sheet
 * @tag wc-side-sheet
 * @rawTag side-sheet
 * @summary Side sheets slide in from the start or end edge of the screen to reveal supplemental content. Supports standard and modal variants.
 * @overview
 * <p>The sheet renders a native <code>&lt;dialog&gt;</code>. The <code>modal</code> variant (the default)
 * opens it with <code>showModal()</code>: it renders in the browser's top layer above the page, with a
 * scrim; the rest of the page is inert and does not scroll; focus moves to the first element with
 * <code>autofocus</code> inside it and returns where it was when the sheet closes. Escape and a click
 * on the scrim close it (<code>no-light-dismiss</code> keeps it open on scrim clicks).</p>
 * <p>The <code>standard</code> variant opens the dialog with <code>show()</code>: it is not modal, stays
 * in the page flow beside the content (place it in a flex row), and does not trap focus, lock
 * scrolling or close on Escape.</p>
 * <p><code>placement</code> is logical: <code>end</code> is the right edge in left-to-right pages and
 * the left edge in right-to-left pages.</p>
 *
 * @cssprop --side-sheet-container-color - Background color of the sheet container.
 * @cssprop --side-sheet-scrim-color - Color of the modal scrim overlay.
 * @cssprop --side-sheet-shape - Corner radius of the leading edge.
 * @cssprop --side-sheet-width - Width of the side sheet.
 *
 * @fires {CustomEvent} open - Fired when the sheet opens.
 * @fires {CustomEvent<{reason: 'escape' | 'light-dismiss' | 'action' | 'api'}>} close - Fired when the sheet closes: Escape, a scrim click, the close button, or `hide()`.
 * @fires {CustomEvent<{reason: string}>} side-sheet-close - Deprecated, use `close`. `detail.reason` is `"escape"`, `"scrim"`, `"close-button"` or `"programmatic"`.
 *
 * @example
 * ```html
 * <wc-button onclick="document.getElementById('filters').show()">Filters</wc-button>
 * <wc-side-sheet id="filters" heading="Filters">
 *   <wc-checkbox autofocus>In stock only</wc-checkbox>
 *   <wc-checkbox>Free shipping</wc-checkbox>
 *   <wc-button onclick="this.closest('wc-side-sheet').hide()">Apply</wc-button>
 * </wc-side-sheet>
 * ```
 * @tags navigation, overlay
 */
@IndividualComponent
export class SideSheet extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Whether the sheet is visible. */
  @property({ type: Boolean, reflect: true }) open = false;

  /**
   * Sheet variant. Set it before opening the sheet.
   * - `"standard"`: Non-modal; sits beside the page content in the layout, no scrim.
   * - `"modal"`: Overlays the page in the top layer with a scrim; the page is inert.
   */
  @property({ type: String, reflect: true }) variant: 'standard' | 'modal' =
    'modal';

  /**
   * Edge the sheet slides in from, logical: `"start"` or `"end"` (default). In right-to-left
   * pages `"end"` is the left edge.
   */
  @property({ type: String, reflect: true }) placement: SideSheetPlacement =
    'end';

  /** Heading shown in the sheet header; it also names the sheet. */
  @property({ type: String, reflect: true }) heading = '';

  /** Accessible name of the sheet when it has no `heading`. */
  @property({ type: String }) label = '';

  /** Hides the close button in the header (shown when there is a `heading`). */
  @property({ type: Boolean, reflect: true, attribute: 'hide-close' })
  hideClose = false;

  /** Keeps a modal sheet open when the scrim is clicked. Escape still closes it. */
  @property({ type: Boolean, attribute: 'no-light-dismiss' }) noLightDismiss =
    false;

  /** @deprecated Use `placement` (`left` → `start`, `right` → `end`). */
  @property({ type: String }) position?: 'left' | 'right';

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('dialog') private _dialog?: HTMLDialogElement;

  @query('.sheet') private _sheet?: HTMLElement;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the default label and the close button. */
  private readonly i18n = new I18nController(this);

  private readonly overlay = new OverlayController(this, {
    surface: () => this._dialog,
    modal: () => this._isModal,
    closeOnEscape: () => this._isModal,
    exitAnimationTargets: () => [this._sheet],
    requestClose: reason => this._close(reason),
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('position') && this.position) {
      deprecate('wc-side-sheet', '`position`', '`placement`');
      this.placement = this.position === 'left' ? 'start' : 'end';
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
      new CustomEvent('side-sheet-close', {
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

  private _handleCloseClick() {
    this._close('action');
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private _renderHeader() {
    if (!this.heading) return nothing;
    return html`
      <div class="header" part="header">
        <h2 id="side-sheet-heading" class="heading">${this.heading}</h2>
        ${!this.hideClose
          ? html`<wc-icon-button
              class="close"
              variant="text"
              shape="round"
              aria-label=${this.i18n.t('closeSheet')}
              @click=${this._handleCloseClick}
            >
              <wc-icon name="close"></wc-icon>
            </wc-icon-button>`
          : nothing}
      </div>
    `;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const label = this.heading
      ? nothing
      : this.label || this.ariaLabel || this.i18n.t('sideSheet');

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
        aria-labelledby=${this.heading ? 'side-sheet-heading' : nothing}
        aria-label=${label}
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
            [`placement-${this.placement}`]: true,
          })}
          part="sheet"
        >
          ${this._renderHeader()}
          <div class="content">
            <slot></slot>
          </div>
        </div>
      </dialog>
    `;
    /* eslint-enable lit-a11y/click-events-have-key-events */
  }
}

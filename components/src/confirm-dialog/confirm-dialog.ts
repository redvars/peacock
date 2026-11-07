import { LitElement, html, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '../IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import {
  type CloseReason,
  OverlayController,
} from '@/__internal/controllers/overlay-controller.js';
import type { ButtonColor } from '../button/ButtonTypes.js';
import modalStyles from '../modal/modal.scss';
import styles from './confirm-dialog.scss';

/** What the confirmed action means; `danger` for destructive actions (ADR-030001 vocabulary). */
export type ConfirmDialogIntent = 'info' | 'success' | 'warning' | 'danger';

/** `close` detail: why the dialog closed, and whether the person confirmed. */
export interface ConfirmDialogCloseDetail {
  reason: CloseReason;
  confirmed: boolean;
}

/** The confirm button's color for each intent; no intent is the plain primary button. */
const INTENT_COLORS: Record<ConfirmDialogIntent, ButtonColor> = {
  info: 'primary',
  success: 'success',
  warning: 'warning',
  danger: 'danger',
};

/** Focusable children render their inner control a microtask after they are created. */
type Focusable = HTMLElement & { updateComplete?: Promise<unknown> };

/**
 * @label Confirm Dialog
 * @tag wc-confirm-dialog
 * @rawTag confirm-dialog
 * @summary A ready-made "Are you sure?" dialog with confirm and cancel buttons.
 * @overview
 * <p>Confirm dialog asks one question before an action runs. It opens in the browser's top layer
 * like <code>wc-modal</code> (same overlay stack: scroll lock, Escape, focus return), with the
 * <code>alertdialog</code> role: the headline is its name and the message its description.</p>
 * <p>Escape and the cancel button close it; a click on the scrim does not, because a confirmation
 * needs an explicit answer. Set <code>intent="danger"</code> for destructive actions: the confirm
 * button turns the danger color and Cancel gets the initial focus. Set <code>confirm-text</code> to
 * make the person type that text (for example the project name) before Confirm enables.</p>
 * <p>For an async action, call <code>preventDefault()</code> on <code>confirm</code>: the dialog
 * stays open; set <code>loading</code> while the request runs (the buttons are disabled and
 * Escape does nothing), then call <code>hide()</code>. For a quick question from script, use the
 * <code>confirmDialog()</code> helper, which resolves to <code>true</code> or <code>false</code>.</p>
 *
 * @slot - The message: what will happen and whether it can be undone. It is the dialog's accessible description.
 *
 * @cssprop --confirm-dialog-container-color - Background color of the dialog container.
 * @cssprop --confirm-dialog-scrim-color - Color of the scrim backdrop.
 * @cssprop --confirm-dialog-shape - Corner radius of the dialog container.
 * @cssprop --confirm-dialog-max-width - Maximum width of the dialog.
 *
 * @fires {CustomEvent} open - Fired when the dialog opens.
 * @fires {CustomEvent} confirm - Fired when the person confirms. Cancelable: `preventDefault()` keeps the dialog open, so the app can set `loading`, await its request and call `hide()`.
 * @fires {CustomEvent<{reason: 'escape' | 'action' | 'api', confirmed: boolean}>} close - Fired when the dialog closes. `reason` is `action` for both buttons, `escape`, or `api` (`hide()` / `open = false`); `confirmed` says whether the person confirmed, including an async confirm the app finished with `hide()`.
 *
 * @example
 * ```html
 * <wc-confirm-dialog id="discard" headline="Discard changes?" confirm-label="Discard">
 *   Your edits to this page are not saved.
 * </wc-confirm-dialog>
 * ```
 * @example
 * ```html
 * <wc-confirm-dialog
 *   headline="Delete acme-prod?"
 *   intent="danger"
 *   confirm-label="Delete project"
 *   confirm-text="acme-prod"
 * >
 *   The project and its 3 environments are deleted for everyone. This can't be undone.
 * </wc-confirm-dialog>
 * ```
 * @example
 * ```js
 * import { confirmDialog } from '@redvars/peacock';
 * if (await confirmDialog({ headline: 'Sign out?', message: 'You will need to sign in again.' })) {
 *   signOut();
 * }
 * ```
 * @tags overlay, dialog, feedback
 */
@IndividualComponent
export class ConfirmDialog extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [modalStyles, styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** Whether the dialog is open. */
  @property({ type: Boolean, reflect: true }) open = false;

  /** The question, shown as the dialog's title and used as its accessible name. */
  @property({ type: String }) headline = '';

  /** Label of the confirm button. Default "Confirm"; name the action, such as "Delete project". */
  @property({ type: String, attribute: 'confirm-label' }) confirmLabel = '';

  /** Label of the cancel button. Default "Cancel". */
  @property({ type: String, attribute: 'cancel-label' }) cancelLabel = '';

  /** `danger` for destructive actions: a danger-colored confirm button, and Cancel focused first. */
  @property({ type: String, reflect: true }) intent?: ConfirmDialogIntent;

  /** Text the person must type, exactly, before Confirm enables, such as the project name. */
  @property({ type: String, attribute: 'confirm-text' }) confirmText = '';

  /** An async confirm is running: buttons are disabled, Confirm shows a spinner, Escape does nothing. */
  @property({ type: Boolean, reflect: true }) loading = false;

  // ── State ────────────────────────────────────────────────────────────────

  /** What the person typed in the type-to-confirm field. */
  @state() private _typed = '';

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('dialog') private _dialog?: HTMLDialogElement;

  @query('.dialog') private _panel?: HTMLElement;

  @query('.confirm-button') private _confirmButton?: Focusable;

  @query('.cancel-button') private _cancelButton?: Focusable;

  @query('.confirm-field') private _field?: Focusable;

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the button labels and the field label. */
  private readonly i18n = new I18nController(this);

  /** The app prevented `confirm` and has not closed the dialog since: `hide()` then means confirmed. */
  private _confirmPending = false;

  /** `_close()` already fired `close` for the `open` change being rendered. */
  private _closeFired = false;

  private readonly overlay = new OverlayController(this, {
    surface: () => this._dialog,
    modal: true,
    // The dialog moves focus itself, once its buttons and field have rendered.
    focusOnOpen: () => false,
    exitAnimationTargets: () => [this._panel],
    requestClose: reason => this._handleRequestClose(reason),
  });

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(changed: PropertyValues<this>) {
    if (!changed.has('open')) return;
    if (this.open) {
      this._typed = '';
      this._confirmPending = false;
    } else if (changed.get('open') === true && !this._closeFired) {
      this._fireClose('api', this._confirmPending);
    }
    this._closeFired = false;
  }

  protected override updated(changed: PropertyValues<this>) {
    if (!changed.has('open')) return;
    this.overlay.sync(this.open);
    if (this.open) {
      this._focusInitial();
      this.dispatchEvent(
        new CustomEvent('open', { bubbles: true, composed: true }),
      );
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** Opens the dialog. */
  show() {
    this.open = true;
  }

  /**
   * Closes the dialog with reason `api`. After a prevented `confirm`, `detail.confirmed` is `true`:
   * the app finished the confirmed action.
   */
  hide() {
    this._close('api', this._confirmPending);
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private get _matches() {
    return !this.confirmText || this._typed === this.confirmText;
  }

  /** Cancel for danger (the safer answer), Confirm otherwise; the field when there is one. */
  private _initialFocusTarget(): Focusable | undefined {
    if (this.confirmText) return this._field;
    if (this.intent === 'danger') return this._cancelButton;
    return this._confirmButton;
  }

  private async _focusInitial() {
    const target = this._initialFocusTarget();
    if (!target) return;
    await target.updateComplete;
    if (this.open) target.focus();
  }

  private _close(reason: CloseReason, confirmed: boolean) {
    if (!this.open) return;
    this._confirmPending = false;
    this._closeFired = true;
    this.open = false;
    this._fireClose(reason, confirmed);
  }

  private _fireClose(reason: CloseReason, confirmed: boolean) {
    this._confirmPending = false;
    this.dispatchEvent(
      new CustomEvent<ConfirmDialogCloseDetail>('close', {
        detail: { reason, confirmed },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Escape from the overlay stack: ignored while an async confirm runs. */
  private _handleRequestClose(reason: CloseReason) {
    if (this.loading) return;
    this._close(reason, false);
  }

  private _confirm() {
    if (!this.open || this.loading || !this._matches) return;
    const proceed = this.dispatchEvent(
      new CustomEvent('confirm', {
        bubbles: true,
        composed: true,
        cancelable: true,
      }),
    );
    if (proceed) this._close('action', true);
    else this._confirmPending = true;
  }

  private _handleCancelClick() {
    if (this.loading) return;
    this._close('action', false);
  }

  /** The native Escape `cancel`: the overlay controller handles Escape, so keep `open` in charge. */
  private _handleNativeCancel(event: Event) {
    event.preventDefault();
    this._handleRequestClose('escape');
  }

  /** The browser closed the dialog by itself: keep `open` in step. Not a close from nested content. */
  private _handleNativeClose(event: Event) {
    if (event.target !== this._dialog) return;
    if (this.overlay.takeOwnClose()) return;
    if (this.open) this._close('escape', false);
  }

  private _handleFieldInput(event: CustomEvent<{ value: string }>) {
    event.stopPropagation();
    this._typed = event.detail.value;
  }

  private _handleFieldKeydown(event: KeyboardEvent) {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    this._confirm();
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private _renderField() {
    if (!this.confirmText) return nothing;
    return html`<wc-input
      class="confirm-field"
      label=${this.i18n.t('typeToConfirm')(this.confirmText)}
      autocomplete="off"
      spellcheck="false"
      .value=${this._typed}
      ?disabled=${this.loading}
      @input=${this._handleFieldInput}
      @change=${(event: Event) => event.stopPropagation()}
      @keydown=${this._handleFieldKeydown}
    ></wc-input>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const color = this.intent ? INTENT_COLORS[this.intent] : 'primary';
    return html`
      <dialog
        class="native-dialog"
        part="dialog"
        role="alertdialog"
        aria-labelledby=${this.headline ? 'headline' : nothing}
        aria-describedby="message"
        aria-busy=${this.loading ? 'true' : nothing}
        @cancel=${this._handleNativeCancel}
        @close=${this._handleNativeClose}
      >
        <div
          class=${classMap({ scrim: true, visible: this.open })}
          aria-hidden="true"
        ></div>

        <div class="dialog-wrapper">
          <div class=${classMap({ dialog: true, open: this.open })}>
            ${this.headline
              ? html`<div class="dialog-header">
                  <h2 id="headline" class="dialog-heading">${this.headline}</h2>
                </div>`
              : nothing}

            <div class="dialog-content">
              <div id="message" class="message"><slot></slot></div>
              ${this._renderField()}
            </div>

            <div class="actions">
              <wc-button
                class="cancel-button"
                variant="text"
                ?disabled=${this.loading}
                @click=${this._handleCancelClick}
              >
                ${this.cancelLabel || this.i18n.t('cancel')}
              </wc-button>
              <wc-button
                class="confirm-button"
                variant="filled"
                color=${color}
                ?loading=${this.loading}
                ?disabled=${!this._matches}
                @click=${this._confirm}
              >
                ${this.confirmLabel || this.i18n.t('confirm')}
              </wc-button>
            </div>
          </div>
        </div>
      </dialog>
    `;
  }
}

// ── Imperative helper ─────────────────────────────────────────────────────

/** Options of `confirmDialog()`; they mirror the element's properties, with the message as text. */
export interface ConfirmDialogOptions {
  headline?: string;
  /** The message, as plain text. */
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  intent?: ConfirmDialogIntent;
  confirmText?: string;
}

/** How long to wait for the exit animation before removing the dialog anyway. */
const REMOVE_FALLBACK_MS = 600;

/**
 * Opens a confirm dialog and resolves `true` when the person confirms, `false` when they cancel
 * or press Escape. The dialog is appended to `document.body` and removed once it has closed.
 *
 * @example
 * if (await confirmDialog({ headline: 'Delete 3 files?', intent: 'danger', confirmLabel: 'Delete' })) {
 *   deleteFiles();
 * }
 */
export function confirmDialog(
  options: ConfirmDialogOptions = {},
): Promise<boolean> {
  if (!customElements.get('wc-confirm-dialog')) {
    customElements.define('wc-confirm-dialog', ConfirmDialog);
  }
  const dialog = document.createElement('wc-confirm-dialog') as ConfirmDialog;
  const { message, ...props } = options;
  Object.assign(dialog, props);
  if (message) dialog.textContent = message;

  return new Promise<boolean>(resolve => {
    const handleClose = async (event: Event) => {
      // A composed `close` from content inside (a popover or menu closing) is not the dialog's.
      const { detail } = event as CustomEvent<ConfirmDialogCloseDetail>;
      if (typeof detail?.confirmed !== 'boolean') return;
      dialog.removeEventListener('close', handleClose);
      resolve(detail.confirmed);
      await dialog.updateComplete;
      const panel = dialog.shadowRoot?.querySelector('.dialog');
      const animations = (panel?.getAnimations({ subtree: true }) ?? []).map(
        animation => animation.finished,
      );
      // Background pages run no animation frames, so never wait on the animation alone.
      await Promise.race([
        Promise.all(animations).catch(() => undefined),
        new Promise(done => {
          setTimeout(done, REMOVE_FALLBACK_MS);
        }),
      ]);
      dialog.remove();
    };
    dialog.addEventListener('close', handleClose);
    document.body.append(dialog);
    dialog.show();
  });
}

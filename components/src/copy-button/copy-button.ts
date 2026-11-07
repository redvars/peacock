import { html, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import styles from './copy-button.scss';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type {
  ButtonColor,
  ButtonSize,
  ButtonVariant,
} from '@/button/ButtonTypes.js';
import {
  textToCopyFrom,
  writeClipboardText,
} from '@/__internal/utils/clipboard.js';

/** What the button shows: ready, just copied, or just failed. */
export type CopyButtonStatus = 'idle' | 'copied' | 'error';

/** Detail of the `copied` event. */
export interface CopyEventDetail {
  value: string;
}

/** Detail of the `copy-error` event. */
export interface CopyErrorEventDetail {
  value: string;
  error: unknown;
}

/** Icon and button color for each status. */
const STATUS_LOOK = {
  idle: { icon: 'content_copy', color: 'surface' },
  copied: { icon: 'check', color: 'success' },
  error: { icon: 'error', color: 'danger' },
} as const satisfies Record<
  CopyButtonStatus,
  { icon: string; color: ButtonColor }
>;

/**
 * @label Copy Button
 * @tag wc-copy-button
 * @rawTag copy-button
 * @summary An icon button that copies a value, or the text of another element, to the clipboard.
 * @overview
 * <p>Pressing the button copies <code>value</code>, or, without it, the text of the element whose
 * <code>id</code> is in <code>for</code> (the value of an <code>input</code>,
 * <code>textarea</code> or <code>select</code>, else its text content). The element is looked up
 * when the button is pressed, in the same document or shadow root, so its text can change.</p>
 * <p>It copies with the Clipboard API, and falls back to a hidden textarea and
 * <code>execCommand('copy')</code> where that API is missing or refuses. For about two seconds
 * afterwards the icon turns into a check and the tooltip says "Copied", or into an error icon and
 * "Copy failed"; screen readers hear the same through a polite live region. The accessible name
 * stays <code>label</code> ("Copy" by default) throughout.</p>
 * <p>The button is a round <code>wc-icon-button</code> and takes its <code>size</code>
 * (default <code>sm</code>) and <code>variant</code> (default <code>text</code>).</p>
 *
 * @fires {CustomEvent<{value: string}>} copied - Dispatched after the text was copied, as on wc-code-highlighter and wc-code-editor.
 * @fires {CustomEvent<{value: string, error: unknown}>} copy-error - Dispatched when the text could not be copied, or there was nothing to copy (`for` names no element).
 *
 * @example
 * ```html
 * <code id="api-key">pk_test_4f9a…</code>
 * <wc-copy-button for="api-key" label="Copy API key"></wc-copy-button>
 * <wc-copy-button value="npm install @redvars/peacock"></wc-copy-button>
 * ```
 *
 * @tags controls
 */
@IndividualComponent
export class CopyButton extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static override styles = [styles];

  /** How long the copied or failed feedback shows, in milliseconds. */
  static readonly FEEDBACK_DURATION = 2000;

  // ── Properties ───────────────────────────────────────────────────────────

  /** The text to copy. When set, `for` is not read. */
  @property({ type: String }) value?: string;

  /** The `id` of an element whose text (or form value) to copy, when `value` is not set. */
  @property({ type: String, reflect: true }) for?: string;

  /** The accessible name and tooltip. Defaults to "Copy". */
  @property({ type: String }) label?: string;

  /** Button size: `xs`, `sm` (default), `md`, `lg` or `xl`. */
  @property({ type: String, reflect: true }) size: ButtonSize = 'sm';

  /** Button style, as on `wc-icon-button`. Defaults to `text`. */
  @property({ type: String, reflect: true }) variant: ButtonVariant = 'text';

  /** Disables the button. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  // ── State ────────────────────────────────────────────────────────────────

  /** Feedback of the last copy, until it times out. */
  @state() private __status: CopyButtonStatus = 'idle';

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  /** Puts the feedback back to idle. */
  private __feedbackTimer?: ReturnType<typeof setTimeout>;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override disconnectedCallback() {
    super.disconnectedCallback();
    clearTimeout(this.__feedbackTimer);
    this.__status = 'idle';
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** The feedback the button shows: `idle`, `copied` or `error`. */
  get status(): CopyButtonStatus {
    return this.__status;
  }

  /**
   * Copies, as a press would, and resolves with whether it worked. Browsers only allow clipboard
   * writes during a user gesture, so call it from one.
   */
  async copy(): Promise<boolean> {
    const value = this.__resolveValue();
    if (value === null) {
      this.__fail('', new Error(`No element with id "${this.for ?? ''}".`));
      return false;
    }
    try {
      await writeClipboardText(value);
    } catch (error) {
      this.__fail(value, error);
      return false;
    }
    this.__showFeedback('copied');
    this.dispatchEvent(
      new CustomEvent<CopyEventDetail>('copied', {
        detail: { value },
        bubbles: true,
        composed: true,
      }),
    );
    return true;
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** The text to copy, or `null` when `for` names no element. */
  private __resolveValue(): string | null {
    if (this.value !== undefined && this.value !== null) return this.value;
    if (!this.for) return null;
    const root = this.getRootNode() as Document | ShadowRoot;
    const target =
      typeof root.getElementById === 'function'
        ? root.getElementById(this.for)
        : null;
    return target ? textToCopyFrom(target) : null;
  }

  private __fail(value: string, error: unknown) {
    this.__showFeedback('error');
    this.dispatchEvent(
      new CustomEvent<CopyErrorEventDetail>('copy-error', {
        detail: { value, error },
        bubbles: true,
        composed: true,
      }),
    );
  }

  private __showFeedback(status: CopyButtonStatus) {
    this.__status = status;
    clearTimeout(this.__feedbackTimer);
    this.__feedbackTimer = setTimeout(() => {
      this.__status = 'idle';
    }, CopyButton.FEEDBACK_DURATION);
  }

  private __handleClick() {
    this.copy();
  }

  // ── Render ───────────────────────────────────────────────────────────────

  override render() {
    const label = this.label || this.i18n.t('copy');
    const status = this.__status;
    let feedback = '';
    if (status === 'copied') feedback = this.i18n.t('copied');
    if (status === 'error') feedback = this.i18n.t('copyFailed');
    const { icon, color } = STATUS_LOOK[status];
    return html`<wc-icon-button
        class="button"
        part="button"
        shape="round"
        size=${this.size}
        variant=${this.variant}
        color=${color}
        aria-label=${label}
        tooltip=${feedback || label}
        ?disabled=${this.disabled}
        @click=${this.__handleClick}
      >
        <wc-icon class="icon" name=${icon}></wc-icon>
      </wc-icon-button>
      <span class="screen-reader-only" role="status">${feedback}</span>`;
  }
}

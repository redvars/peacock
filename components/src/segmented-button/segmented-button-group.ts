import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import styles from './segmented-button-group.scss';
import { SegmentedButton } from './segmented-button.js';

/**
 * @label Segmented Button Group
 * @tag wc-segmented-button-group
 * @rawTag segmented-button-group
 * @summary A container for segmented buttons following Material Design 3.
 * @overview
 * <p>Segmented buttons help people select options, switch views, or sort elements. They follow the Material Design 3 specification.</p>
 * <p>Use <code>multi-select</code> to allow more than one segment to be selected at a time. By default only one segment can be active (single-select).</p>
 *
 * @cssprop --segmented-button-group-shape: Border-radius of the group container.
 *
 * @fires {CustomEvent} change - Dispatched when the selection changes. Detail contains <code>{ value, values }</code>.
 *
 * @example
 * ```html
 * <wc-segmented-button-group>
 *   <wc-segmented-button value="day">Day</wc-segmented-button>
 *   <wc-segmented-button value="week" selected>Week</wc-segmented-button>
 *   <wc-segmented-button value="month">Month</wc-segmented-button>
 * </wc-segmented-button-group>
 * ```
 *
 * @tags controls
 */
export class SegmentedButtonGroup extends LitElement {
  static styles = [styles];

  static SegmentedButton = SegmentedButton;

  /**
   * When true, multiple segments can be selected simultaneously.
   * Defaults to single-select mode.
   */
  @property({ type: Boolean, reflect: true, attribute: 'multi-select' })
  multiSelect: boolean = false;

  /**
   * When true, in single-select mode the currently selected segment can be
   * deselected by clicking it again (allowing an empty selection).
   * Defaults to `false`.
   */
  @property({ type: Boolean, reflect: true })
  nullable: boolean = false;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      'segmented-button--change',
      this._onSegmentChange as EventListener,
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      'segmented-button--change',
      this._onSegmentChange as EventListener,
    );
  }

  private _getSegments(): SegmentedButton[] {
    return Array.from(this.querySelectorAll<SegmentedButton>('wc-segmented-button'));
  }

  private _onSegmentChange = (ev: CustomEvent) => {
    ev.stopPropagation();
    const target = ev.composedPath()[0] as SegmentedButton;
    const segments = this._getSegments();

    if (this.multiSelect) {
      target.selected = !target.selected;
    } else {
      if (target.selected && this.nullable) {
        target.selected = false;
      } else {
        segments.forEach(seg => {
          seg.selected = seg === target;
        });
      }
    }

    const selectedValues = segments
      .filter(s => s.selected)
      .map(s => s.value || s.textContent?.trim() || '');

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: {
          value: selectedValues[0] ?? null,
          values: selectedValues,
        },
        bubbles: true,
        composed: true,
      }),
    );
  };

  render() {
    return html`
      <div class="segmented-button-group" role="group">
        <slot></slot>
      </div>
    `;
  }
}

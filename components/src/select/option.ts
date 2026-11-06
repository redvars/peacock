import { html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';
import { MenuItem } from '../menu/menu-item/menu-item.js';
import IndividualComponent from '@/IndividualComponent.js';

/**
 * @label Select Option
 * @tag wc-option
 * @rawTag option
 *
 * @summary An option of a wc-select.
 * @overview
 * <p>Options are menu items with the <code>option</code> role. The selected option of a single select
 * shows a check mark at the end; in a multi-select every option shows a checkbox at the start.</p>
 *
 * @example
 * ```html
 * <wc-select label="Fruit">
 *   <wc-option value="apple">Apple</wc-option>
 *   <wc-option value="banana">Banana</wc-option>
 * </wc-select>
 * ```
 */
@IndividualComponent
export class SelectOptionElement extends MenuItem {
  /**
   * Optional Material Symbol icon name shown before the label.
   */
  @property({ type: String, reflect: true })
  icon: string = '';

  // ── Managed by wc-select ──────────────────────────────────────────────────

  /** Whether the option belongs to a multi-select, which shows a checkbox. Set by wc-select. */
  @property({ type: Boolean, reflect: true })
  multiple: boolean = false;

  /**
   * When true the option is hidden and skipped by keyboard navigation because it does not
   * match the current typeahead search query. Set by wc-select.
   */
  @property({ type: Boolean, reflect: true })
  filtered: boolean = false;

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('filtered')) {
      this.hidden = this.filtered;
    }
    if (changed.has('multiple')) {
      this.keepOpen = this.multiple;
    }
  }

  protected override get itemRole() {
    return 'option';
  }

  protected override get itemAriaSelected() {
    return String(this.selected);
  }

  protected override renderStart(): TemplateResult | typeof nothing {
    const checkbox = this.multiple
      ? html`<wc-icon
          class="indicator checkbox-indicator"
          name=${this.selected ? 'check_box' : 'check_box_outline_blank'}
          aria-hidden="true"
        ></wc-icon>`
      : nothing;
    const icon = this.icon
      ? html`<wc-icon name=${this.icon} aria-hidden="true"></wc-icon>`
      : nothing;

    if (checkbox === nothing && icon === nothing) {
      return nothing;
    }

    return html`${checkbox}${icon}`;
  }

  protected override renderEnd(): TemplateResult | typeof nothing {
    // A multi-select shows its state in the leading checkbox instead of a trailing check.
    return this.multiple ? nothing : super.renderEnd();
  }
}

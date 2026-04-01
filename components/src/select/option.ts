import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

/**
 * @label Select Option
 * @tag wc-option
 * @rawTag option
 * @parentRawTag select
 *
 * @summary A declarative option element for use inside wc-select.
 *
 * @example
 * ```html
 * <wc-select label="Fruit">
 *   <wc-option value="apple">Apple</wc-option>
 *   <wc-option value="banana">Banana</wc-option>
 * </wc-select>
 * ```
 */
export class SelectOptionElement extends LitElement {
  /**
   * The option's submitted value.
   */
  @property({ type: String, reflect: true })
  value: string = '';

  /**
   * Optional Material Symbol icon name shown before the label.
   */
  @property({ type: String, reflect: true })
  icon: string = '';

  /**
   * Disables the option so it cannot be selected.
   */
  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  // wc-option has no visual rendering — it is a data carrier used by wc-select
  // to build its option list from declarative HTML markup.
  protected override createRenderRoot() {
    return this;
  }

  override render() {
    return null;
  }
}

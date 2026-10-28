import { html } from 'lit';
import IndividualComponent from '@/IndividualComponent.js';
import { CbGroupBase } from './cb-group-base.js';
import baseStyles from './cb-group-base.scss';
import styles from './condition-builder.scss';

/**
 * @label Condition Builder
 * @tag wc-condition-builder
 * @rawTag condition-builder
 * @summary A query builder for composing filter conditions from rules and nested groups joined by And/Or.
 * @overview
 * <p>The condition builder is the root group of a query. It holds rules (<code>wc-cb-rule</code>) and bordered nested groups (<code>wc-cb-group</code>), each joined by a bracket with an And/Or pill.</p>
 * <ul>
 *   <li>Click the pill to switch a group between And and Or.</li>
 *   <li>Drag a rule by its handle to reorder it or move it between groups.</li>
 *   <li>Removing, moving and switching are built in; adding rules and groups is up to you, since only you know what a new rule contains. Listen for <code>add-rule</code> and <code>add-group</code>.</li>
 * </ul>
 * @tags condition-builder
 *
 * @fires {CustomEvent<{operator: 'and' | 'or'}>} operator-change - Dispatched when the user picks a different operator, on this or a nested group.
 * @fires {CustomEvent<{rule: CbRule, from: HTMLElement | null, to: HTMLElement, index: number}>} rule-move - Dispatched before a rule is moved. Cancelable: unless prevented, the target group moves the rule.
 * @fires {CustomEvent<{rule: CbRule, group: HTMLElement | null}>} rule-remove - Dispatched when a rule's remove button is clicked. Cancelable: unless prevented, the rule removes itself.
 * @fires {CustomEvent<{group: HTMLElement}>} add-rule - Dispatched when "Add rule" (or a nested group's "Add condition") is clicked.
 * @fires {CustomEvent<{group: HTMLElement}>} add-group - Dispatched when "Add inner group" is clicked.
 *
 * @slot - Rules (`wc-cb-rule`) and groups (`wc-cb-group`).
 * @slot actions - Replaces the default "Add rule" and "Add inner group" buttons.
 * @slot actions-end - Actions aligned to the end of the footer, such as a "Run query" button.
 *
 * @example
 * ```html
 * <wc-condition-builder operator="and">
 *   <wc-cb-rule>
 *     <wc-input placeholder="Value"></wc-input>
 *   </wc-cb-rule>
 *   <wc-cb-group operator="or">
 *     <wc-cb-rule>
 *       <wc-input placeholder="Value"></wc-input>
 *     </wc-cb-rule>
 *     <wc-cb-rule>
 *       <wc-input placeholder="Value"></wc-input>
 *     </wc-cb-rule>
 *   </wc-cb-group>
 *   <wc-button slot="actions-end">Run query</wc-button>
 * </wc-condition-builder>
 * ```
 */
@IndividualComponent
export class ConditionBuilder extends CbGroupBase {
  // ── Static ────────────────────────────────────────────────────────────────

  static styles = [baseStyles, styles];

  // ── Private methods ───────────────────────────────────────────────────────

  private _dispatchAdd(type: 'add-rule' | 'add-group') {
    this.dispatchEvent(
      new CustomEvent<{ group: HTMLElement }>(type, {
        detail: { group: this },
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── Render helpers ────────────────────────────────────────────────────────

  protected override renderFooter() {
    return html`
      <div class="footer">
        <div class="actions">
          <slot name="actions">
            <wc-button
              variant="outlined"
              size="sm"
              @click=${() => this._dispatchAdd('add-rule')}
            >
              <wc-icon slot="icon" name="add_circle"></wc-icon>
              Add rule
            </wc-button>
            <wc-button
              variant="text"
              size="sm"
              @click=${() => this._dispatchAdd('add-group')}
            >
              <wc-icon slot="icon" name="create_new_folder"></wc-icon>
              Add inner group
            </wc-button>
          </slot>
        </div>
        <div class="actions-end">
          <slot name="actions-end"></slot>
        </div>
      </div>
    `;
  }
}

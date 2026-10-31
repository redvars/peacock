import { i, _ as __decorate, I as IndividualComponent, b } from './IndividualComponent-Bdwyrvd6.js';
import { C as CbGroupBase } from './cb-group-base-Blw4tZnc.js';
import { c as css_248z$1 } from './cb-group-base-D9gv7SDY.js';
import './property-B49QQ8pS.js';
import './state-DkTK9EGF.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './class-map-DG7CA1et.js';
import './directive-ZPhl09Yt.js';
import './style-map-BQD5Et1D.js';

var css_248z = i`.footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-100);
  padding-top: var(--spacing-200);
}

.actions,
.actions-end {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-100);
}`;

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
let ConditionBuilder = class ConditionBuilder extends CbGroupBase {
    // ── Private methods ───────────────────────────────────────────────────────
    _dispatchAdd(type) {
        this.dispatchEvent(new CustomEvent(type, {
            detail: { group: this },
            bubbles: true,
            composed: true,
        }));
    }
    // ── Render helpers ────────────────────────────────────────────────────────
    renderFooter() {
        return b `
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
};
// ── Static ────────────────────────────────────────────────────────────────
ConditionBuilder.styles = [css_248z$1, css_248z];
ConditionBuilder = __decorate([
    IndividualComponent
], ConditionBuilder);

export { ConditionBuilder };
//# sourceMappingURL=condition-builder.js.map

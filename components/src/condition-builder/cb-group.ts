import { html, nothing } from 'lit';
import IndividualComponent from '@/IndividualComponent.js';
import { CbGroupBase } from './cb-group-base.js';
import baseStyles from './cb-group-base.scss';
import styles from './cb-group.scss';

/**
 * @label CB Group
 * @tag wc-cb-group
 * @rawTag cb-group
 * @summary A bordered, nested group of rules in a condition builder, joined by its own And/Or operator.
 * @overview
 * <p>A bracket on the left joins the group's rules, with a pill to switch between And and Or. Rules can be dragged into, out of and within the group, or moved with the keyboard from their handles.</p>
 * <p>It takes <code>disabled</code> and <code>readonly</code> from the builder around it, or sets them for itself and what it holds.</p>
 * @tags condition-builder
 *
 * @fires {CustomEvent<{operator: 'and' | 'or'}>} operator-change - Dispatched when the user picks a different operator.
 * @fires {CustomEvent<{rule: CbRule, from: HTMLElement | null, to: HTMLElement, index: number}>} rule-move - Dispatched before a rule is moved into this group. Cancelable: unless prevented, the group moves the rule.
 * @fires {CustomEvent<{group: HTMLElement}>} add-rule - Dispatched when the default "Add condition" link is clicked.
 * @fires {CustomEvent<{group: HTMLElement}>} add-group - Dispatched when the default "Add inner group" link is clicked.
 *
 * @slot - Rules (`wc-cb-rule`) and nested groups.
 * @slot actions - Replaces the default "Add condition" and "Add inner group" links. Hidden while disabled or read-only.
 *
 * @example
 * ```html
 * <wc-cb-group operator="or">
 *   <wc-cb-rule>
 *     <wc-input placeholder="Value"></wc-input>
 *   </wc-cb-rule>
 *   <wc-cb-rule>
 *     <wc-input placeholder="Value"></wc-input>
 *   </wc-cb-rule>
 * </wc-cb-group>
 * ```
 */
@IndividualComponent
export class CbGroup extends CbGroupBase {
  // ── Static ────────────────────────────────────────────────────────────────

  static styles = [baseStyles, styles];

  // ── Render helpers ────────────────────────────────────────────────────────

  protected override renderFooter() {
    if (this.locked) return nothing;
    return html`
      <div class="footer">
        <slot name="actions">
          <wc-button
            class="add-condition"
            variant="text"
            size="xs"
            @click=${() => this.dispatchAdd('add-rule')}
          >
            <wc-icon slot="icon" name="add"></wc-icon>
            ${this.i18n.t('addCondition')}
          </wc-button>
          <wc-button
            class="add-group"
            variant="text"
            size="xs"
            @click=${() => this.dispatchAdd('add-group')}
          >
            <wc-icon slot="icon" name="create_new_folder"></wc-icon>
            ${this.i18n.t('addInnerGroup')}
          </wc-button>
        </slot>
      </div>
    `;
  }
}

import { i, _ as __decorate, I as IndividualComponent, A, b } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { A as AiController } from './ai-controller-DR_Tg0sN.js';
import { s as sparkle } from './sparkle-BmtM0vbq.js';
import { a as CbGroupBase } from './cb-group-base-YkeoDYk2.js';
import { c as css_248z$1 } from './cb-group-base-BBDUgxne.js';
import './locale-DEsJZCQG.js';
import './state-BCeDVCI9.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './class-map-NDIkZErE.js';
import './directive-ZPhl09Yt.js';
import './style-map-CHOg6N_R.js';
import './i18n-controller-DLJcJ5gO.js';
import './strings-MXyrGrNs.js';

var css_248z = i`.describe {
  display: flex;
  align-items: center;
  gap: var(--spacing-100);
  margin-top: var(--spacing-200);
  padding: var(--spacing-050) var(--spacing-050) var(--spacing-050) var(--spacing-150);
  background: var(--color-surface);
  border: 1px solid var(--color-outline);
  border-radius: var(--shape-corner-small);
}
.describe:focus-within {
  border-color: var(--color-primary);
  outline: 1px solid var(--color-primary);
}

.describe-sparkle .sparkle {
  inline-size: 1.25rem;
  block-size: 1.25rem;
  fill: var(--color-primary);
}

.describe-input {
  flex: 1;
  min-inline-size: 0;
  padding: var(--spacing-075) 0;
  color: var(--color-on-surface);
  font: inherit;
  background: transparent;
  border: none;
  outline: none;
}

.footer {
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
 *   <li>Without a mouse, focus a rule's handle: ArrowUp and ArrowDown move it within its group, ArrowRight moves it into the group beside it and ArrowLeft out of its group. Each move is announced.</li>
 *   <li>Removing, moving and switching are built in; adding rules and groups is up to you, since only you know what a new rule contains. Listen for <code>add-rule</code> and <code>add-group</code>, which nested groups fire too; <code>detail.group</code> is the group to add to.</li>
 *   <li><code>disabled</code> and <code>readonly</code> apply to every group and rule inside: the add, remove and drag controls are hidden and the operator is locked. Disable or lock the slotted controls yourself.</li>
 * </ul>
 * <p><code>value</code> (read-only) returns the query as a tree, ready for <code>JSON.stringify()</code>:</p>
 * <pre><code>{
 *   type: 'group', id, operator: 'and' | 'or', data,
 *   children: [
 *     { type: 'rule', id, value, data },
 *     { type: 'group', id, operator, data, children: [...] }
 *   ]
 * }</code></pre>
 * <p><code>id</code> is the element's id, <code>data</code> its <code>data-*</code> attributes. A rule's <code>value</code> is the rule's own <code>value</code> property when set, else the values of the controls slotted into it: an object keyed by <code>name</code> when every control has a name, else an array. Each node also has a non-enumerable <code>element</code>, the element it came from, which <code>JSON.stringify()</code> leaves out.</p>
 * <p><b>Describe the condition.</b> With a provider that offers <code>parse</code> (ADR-030002), a
 * box above the footer takes a sentence, such as "P1 incidents with no assignment group for over 30
 * minutes". The provider gets it with <code>target: 'condition-builder'</code> and the fields in
 * <code>ai-schema</code> (never record values), and its answer arrives as <code>describe</code>.
 * Build the rules from it as you build any rule, with <code>suggested</code> on each
 * <code>wc-cb-rule</code>: they show a Suggested badge until the person changes them, and removing
 * one discards it. <code>no-ai</code> turns the box off.</p>
 * @tags condition-builder
 *
 * @fires {CustomEvent<{operator: 'and' | 'or'}>} operator-change - Dispatched when the user picks a different operator, on this or a nested group.
 * @fires {CustomEvent<{rule: CbRule, from: HTMLElement | null, to: HTMLElement, index: number}>} rule-move - Dispatched before a rule is moved. Cancelable: unless prevented, the target group moves the rule.
 * @fires {CustomEvent<{rule: CbRule, group: HTMLElement | null}>} rule-remove - Dispatched when a rule's remove button is clicked. Cancelable: unless prevented, the rule removes itself.
 * @fires {CustomEvent<{group: HTMLElement}>} add-rule - Dispatched when "Add rule" (or a nested group's "Add condition") is clicked.
 * @fires {CustomEvent<{group: HTMLElement}>} add-group - Dispatched when "Add inner group" is clicked, on this or a nested group.
 * @fires {CustomEvent<ConditionBuilderDescribeDetail>} describe - The provider turned the person's sentence into conditions; build the rules from `detail.value`, marked `suggested`.
 *
 * @slot - Rules (`wc-cb-rule`) and groups (`wc-cb-group`).
 * @slot actions - Replaces the default "Add rule" and "Add inner group" buttons. Hidden while disabled or read-only.
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
    constructor() {
        // ── Static ────────────────────────────────────────────────────────────────
        super(...arguments);
        /**
         * The fields a rule can use, sent to the provider with a described condition, such as
         * `[{ key: 'priority', label: 'Priority', options: [...] }]`. Never record values.
         */
        this.aiSchema = [];
        /** Turns off Describe the condition, even when the page's AI offers it. */
        this.noAi = false;
        // ── Private fields ────────────────────────────────────────────────────────
        this.ai = new AiController(this, 'parse');
        this.onDescribeKey = (event) => {
            if (event.key !== 'Enter')
                return;
            event.preventDefault();
            this.describe();
        };
    }
    // ── Private methods ───────────────────────────────────────────────────────
    async describe() {
        const input = this.renderRoot.querySelector('.describe-input');
        const { provider } = this.ai;
        const text = input?.value.trim() ?? '';
        if (!provider?.parse || !text)
            return;
        const value = await this.ai.run(signal => provider.parse({
            signal,
            context: this.ai.context(),
            target: 'condition-builder',
            text,
            schema: this.aiSchema,
        }));
        if (value === undefined || value === null) {
            if (this.ai.error || value === null) {
                this.announce(this.i18n.t('conditionDescribeFailed'));
            }
            return;
        }
        if (input)
            input.value = '';
        this.dispatchEvent(new CustomEvent('describe', {
            detail: { text, value },
            bubbles: true,
            composed: true,
        }));
    }
    // ── Render helpers ────────────────────────────────────────────────────────
    renderDescribe() {
        if (this.locked || !this.ai.available)
            return A;
        const label = this.i18n.t('conditionDescribe');
        return b `<div
      class="describe"
      @input=${(event) => event.stopPropagation()}
      @change=${(event) => event.stopPropagation()}
    >
      <span class="describe-sparkle" aria-hidden="true">${sparkle}</span>
      <input
        class="describe-input"
        type="text"
        aria-label=${label}
        placeholder=${label}
        @keydown=${this.onDescribeKey}
      />
      <wc-button
        size="sm"
        variant="tonal"
        ?loading=${this.ai.busy}
        @click=${() => this.describe()}
        >${this.i18n.t('conditionDescribeGo')}</wc-button
      >
    </div>`;
    }
    renderFooter() {
        return b `
      ${this.renderDescribe()}
      <div class="footer">
        <div class="actions">
          ${this.locked
            ? A
            : b `<slot name="actions">
                <wc-button
                  variant="outlined"
                  size="sm"
                  @click=${() => this.dispatchAdd('add-rule')}
                >
                  <wc-icon slot="icon" name="add_circle"></wc-icon>
                  ${this.i18n.t('addRule')}
                </wc-button>
                <wc-button
                  variant="text"
                  size="sm"
                  @click=${() => this.dispatchAdd('add-group')}
                >
                  <wc-icon slot="icon" name="create_new_folder"></wc-icon>
                  ${this.i18n.t('addInnerGroup')}
                </wc-button>
              </slot>`}
        </div>
        <div class="actions-end">
          <slot name="actions-end"></slot>
        </div>
      </div>
    `;
    }
};
ConditionBuilder.styles = [css_248z$1, css_248z];
__decorate([
    n({ attribute: false })
], ConditionBuilder.prototype, "strings", void 0);
__decorate([
    n({ attribute: false })
], ConditionBuilder.prototype, "aiSchema", void 0);
__decorate([
    n({ type: Boolean, reflect: true, attribute: 'no-ai' })
], ConditionBuilder.prototype, "noAi", void 0);
ConditionBuilder = __decorate([
    IndividualComponent
], ConditionBuilder);

export { ConditionBuilder };
//# sourceMappingURL=condition-builder.js.map

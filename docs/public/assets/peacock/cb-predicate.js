import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { e } from './class-map-DG7CA1et.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  display: none !important;
}

[hidden] {
  display: none !important;
}

:host {
  display: block;
}

.predicate:not(.vertical) .predicate-body {
  padding-top: var(--spacing-200);
}
.predicate:not(.vertical) .predicate-condition-operator {
  padding: var(--spacing-200) var(--spacing-400) 0 var(--spacing-400);
}

.predicate.vertical {
  display: flex;
  align-items: stretch;
}
.predicate.vertical .predicate-condition-operator {
  padding: var(--spacing-400) 0 var(--spacing-200) 0;
  padding-inline-end: var(--spacing-200);
}
.predicate.vertical .predicate-body {
  flex: 1;
}

.slot-end {
  display: block;
}`;

/**
 * @label CB Predicate
 * @tag wc-cb-predicate
 * @rawTag cb-predicate
 * @summary A predicate container in a condition builder that can display conditions in horizontal or vertical layout with an optional logical operator divider.
 * @tags condition-builder
 *
 * @example
 * ```html
 * <wc-cb-predicate condition-operator="and" vertical>
 *   <wc-cb-compound-expression field-label="Age">
 *     <wc-cb-expression></wc-cb-expression>
 *   </wc-cb-compound-expression>
 * </wc-cb-predicate>
 * ```
 */
let CbPredicate = class CbPredicate extends i$1 {
    constructor() {
        super(...arguments);
        /** Whether to render the predicate in vertical layout. */
        this.vertical = false;
    }
    updated() {
        if (this.vertical) {
            this.__adjustSlotEndPadding();
        }
    }
    __adjustSlotEndPadding() {
        const slotEnd = this.renderRoot.querySelector('.slot-end');
        const operatorElm = this.renderRoot.querySelector('.predicate-condition-operator');
        if (slotEnd && operatorElm) {
            slotEnd.style.paddingInlineStart =
                operatorElm.getBoundingClientRect().width + 'px';
        }
    }
    __renderHorizontalOperator() {
        if (!this.conditionOperator)
            return A;
        return b `
      <wc-cb-divider vertical class="predicate-condition-operator">
        <wc-tag color="yellow" size="sm">${this.conditionOperator}</wc-tag>
      </wc-cb-divider>
    `;
    }
    __renderVerticalOperator() {
        if (!this.conditionOperator)
            return A;
        return b `
      <div class="predicate-condition-operator">
        <wc-cb-divider connect-start connect-end>
          <wc-tag color="green" size="sm">${this.conditionOperator}</wc-tag>
        </wc-cb-divider>
      </div>
    `;
    }
    render() {
        const classes = {
            predicate: true,
            vertical: this.vertical,
        };
        if (this.vertical) {
            return b `
        <div class=${e(classes)}>
          ${this.__renderVerticalOperator()}
          <div class="predicate-body">
            <slot></slot>
          </div>
        </div>
        <div class="slot-end">
          <slot name="end"></slot>
        </div>
      `;
        }
        return b `
      <div class=${e(classes)}>
        <div class="predicate-body">
          <slot></slot>
        </div>
        ${this.__renderHorizontalOperator()}
      </div>
    `;
    }
};
CbPredicate.styles = [css_248z];
__decorate([
    n({ type: String, attribute: 'condition-operator', reflect: true })
], CbPredicate.prototype, "conditionOperator", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], CbPredicate.prototype, "vertical", void 0);
CbPredicate = __decorate([
    IndividualComponent
], CbPredicate);

export { CbPredicate };
//# sourceMappingURL=cb-predicate.js.map

import { i, _ as __decorate, I as IndividualComponent, a as i$1, A, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';

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

.compound-expression {
  display: flex;
  padding-top: var(--spacing-200);
}
.compound-expression .field-name-container {
  display: flex;
  flex-direction: column;
  padding-top: var(--spacing-100);
  padding-right: var(--spacing-200);
}
.compound-expression .field-name-container .field-label {
  font-family: var(--typography-label-medium-font-family);
  font-size: var(--typography-label-medium-font-size);
  font-weight: var(--typography-label-medium-font-weight);
  line-height: var(--typography-label-medium-line-height);
  letter-spacing: var(--typography-label-medium-letter-spacing);
  color: var(--color-on-surface-variant);
  text-align: center;
}
.compound-expression .field-name-container .field-compound-type {
  flex: 1;
  padding-bottom: var(--spacing-250);
}
.compound-expression .conditions {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.slot-end {
  display: block;
}`;

/**
 * @label CB Compound Expression
 * @tag wc-cb-compound-expression
 * @rawTag cb-compound-expression
 * @summary A compound expression group in a condition builder that displays a field label, an optional condition operator divider, and slots for child expressions.
 * @tags condition-builder
 *
 * @example
 * ```html
 * <wc-cb-compound-expression field-label="Age" condition-operator="or">
 *   <wc-cb-expression>
 *     <wc-input placeholder="Enter value"></wc-input>
 *   </wc-cb-expression>
 * </wc-cb-compound-expression>
 * ```
 */
let CbCompoundExpression = class CbCompoundExpression extends i$1 {
    constructor() {
        super(...arguments);
        /** The field name for the compound expression. */
        this.fieldName = '';
        /** The display label for the field. */
        this.fieldLabel = '';
    }
    updated() {
        this.__adjustSlotEndPadding();
    }
    __adjustSlotEndPadding() {
        const slotEnd = this.renderRoot.querySelector('.slot-end');
        const fieldNameContainer = this.renderRoot.querySelector('.field-name-container');
        if (slotEnd && fieldNameContainer) {
            slotEnd.style.paddingInlineStart =
                fieldNameContainer.getBoundingClientRect().width + 'px';
        }
    }
    __renderOperatorDivider() {
        if (!this.conditionOperator)
            return A;
        return b `
      <wc-cb-divider connect-end>
        <wc-tag color="yellow" size="sm">${this.conditionOperator}</wc-tag>
      </wc-cb-divider>
    `;
    }
    render() {
        return b `
      <div class="compound-expression" field-name=${this.fieldName}>
        <div class="field-name-container">
          <span class="field-label">${this.fieldLabel}</span>
          <div class="field-compound-type">
            ${this.__renderOperatorDivider()}
          </div>
        </div>
        <div class="conditions">
          <slot></slot>
        </div>
      </div>
      <div class="slot-end">
        <slot name="end"></slot>
      </div>
    `;
    }
};
CbCompoundExpression.styles = [css_248z];
__decorate([
    n({ type: String, attribute: 'condition-operator', reflect: true })
], CbCompoundExpression.prototype, "conditionOperator", void 0);
__decorate([
    n({ type: String, attribute: 'field-name' })
], CbCompoundExpression.prototype, "fieldName", void 0);
__decorate([
    n({ type: String, attribute: 'field-label' })
], CbCompoundExpression.prototype, "fieldLabel", void 0);
CbCompoundExpression = __decorate([
    IndividualComponent
], CbCompoundExpression);

export { CbCompoundExpression };
//# sourceMappingURL=cb-compound-expression.js.map

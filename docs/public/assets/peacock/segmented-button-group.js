import { i, _ as __decorate, I as IndividualComponent, a as i$1, b } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { SegmentedButton } from './segmented-button.js';
import './state-DkTK9EGF.js';
import './class-map-DG7CA1et.js';
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
  display: inline-flex;
  --_segmented-button-group-shape: var(--shape-corner-full, 9999px);
}

.segmented-button-group {
  display: flex;
  align-items: stretch;
  border-radius: var(--segmented-button-group-shape, var(--_segmented-button-group-shape));
  border: 1px solid var(--segmented-button-outline-color, var(--color-outline, #79747e));
  overflow: hidden;
  min-width: max-content;
}
.segmented-button-group ::slotted(wc-segmented-button) {
  flex: 1;
}`;

/**
 * @label Segmented Button Group
 * @tag wc-segmented-button-group
 * @rawTag segmented-button-group
 * @summary A container for segmented buttons.
 * @overview
 * <p>Segmented buttons help people select options, switch views, or sort elements. They follow the specification.</p>
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
let SegmentedButtonGroup = class SegmentedButtonGroup extends i$1 {
    constructor() {
        super(...arguments);
        /**
         * When true, multiple segments can be selected simultaneously.
         * Defaults to single-select mode.
         */
        this.multiSelect = false;
        /**
         * When true, in single-select mode the currently selected segment can be
         * deselected by clicking it again (allowing an empty selection).
         * Defaults to `false`.
         */
        this.nullable = false;
        this._onSegmentChange = (ev) => {
            ev.stopPropagation();
            const target = ev.composedPath()[0];
            const segments = this._getSegments();
            if (this.multiSelect) {
                target.selected = !target.selected;
            }
            else {
                if (target.selected && this.nullable) {
                    target.selected = false;
                }
                else {
                    segments.forEach(seg => {
                        seg.selected = seg === target;
                    });
                }
            }
            const selectedValues = segments
                .filter(s => s.selected)
                .map(s => s.value || s.textContent?.trim() || '');
            this.dispatchEvent(new CustomEvent('change', {
                detail: {
                    value: selectedValues[0] ?? null,
                    values: selectedValues,
                },
                bubbles: true,
                composed: true,
            }));
        };
    }
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('segmented-button--change', this._onSegmentChange);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('segmented-button--change', this._onSegmentChange);
    }
    _getSegments() {
        return Array.from(this.querySelectorAll('wc-segmented-button'));
    }
    render() {
        return b `
      <div class="segmented-button-group" role="group">
        <slot></slot>
      </div>
    `;
    }
};
SegmentedButtonGroup.styles = [css_248z];
SegmentedButtonGroup.SegmentedButton = SegmentedButton;
__decorate([
    n({ type: Boolean, reflect: true, attribute: 'multi-select' })
], SegmentedButtonGroup.prototype, "multiSelect", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], SegmentedButtonGroup.prototype, "nullable", void 0);
SegmentedButtonGroup = __decorate([
    IndividualComponent
], SegmentedButtonGroup);

export { SegmentedButtonGroup };
//# sourceMappingURL=segmented-button-group.js.map

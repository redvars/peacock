import { i, a as i$1, A, b, _ as __decorate, I as IndividualComponent } from './IndividualComponent-BK7XZjE2.js';
import { n } from './property-B2TG3KEE.js';
import { m as mixinElementInternals } from './element-internals-QME0yEz4.js';
import { m as mixinFormAssociated, g as getFormValue } from './form-associated-BHbg72PG.js';
import { SegmentedButton } from './segmented-button.js';
import './state-BCeDVCI9.js';
import './class-map-NDIkZErE.js';
import './directive-ZPhl09Yt.js';

var css_248z = i`* {
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
}

.screen-reader-only {
  position: absolute !important;
  inline-size: 1px !important;
  block-size: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip-path: inset(50%) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

[hidden] {
  display: none !important;
}

@media (forced-colors: active) {
  .selected,
  [aria-selected=true],
  [aria-pressed=true],
  [aria-checked=true],
  [aria-current]:not([aria-current=false]) {
    outline: 2px solid Highlight;
    outline-offset: -2px;
  }
  .disabled,
  [aria-disabled=true] {
    color: GrayText;
  }
}
:host {
  display: inline-flex;
  --_segmented-button-group-shape: var(--shape-corner-full, 9999px);
}

/* Read by the segments; \`sm\` keeps their own 2.5rem default. */
:host([size=md]) {
  --_segmented-button-group-height: 3.5rem;
}

:host([size=lg]) {
  --_segmented-button-group-height: 4rem;
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

/** The value a segment stands for: its `value`, else its text. */
function segmentValue(segment) {
    return segment.value || segment.textContent?.trim() || '';
}
/**
 * @label Segmented Button Group
 * @tag wc-segmented-button-group
 * @rawTag segmented-button-group
 * @summary A row of joined buttons for choosing one option, or several, such as a view or a sort order.
 * @overview
 * <p>By default one segment is selected at a time: the group is a <code>radiogroup</code> of
 * <code>radio</code> segments, with one tab stop and the arrow keys (and Home/End) moving the
 * selection. <code>nullable</code> lets the selected segment be clicked again to leave nothing
 * selected. Use <code>multiple</code> to let segments toggle independently: the group is then a
 * <code>group</code> of toggle buttons with <code>aria-pressed</code>.</p>
 * <p>Read or set the selection with <code>value</code> (single) or <code>values</code>
 * (<code>multiple</code>); a segment's value is its <code>value</code>, else its text. Without a
 * value set, the group adopts the segments marked <code>selected</code>. Nothing selected is
 * <code>''</code>.</p>
 * <p>The group is form-associated: it submits the selected value under <code>name</code> (one entry
 * per value with <code>multiple</code>), and <code>form.reset()</code> restores the starting
 * selection. <code>disabled</code> disables every segment.</p>
 *
 * @cssprop --segmented-button-group-shape: Border-radius of the group container.
 *
 * @fires {CustomEvent<{value: string, values: string[]}>} change - Dispatched when the person changes the selection. `value` is the first selected value, `''` when none. The segments' own `change` events are swallowed.
 *
 * @example
 * ```html
 * <wc-segmented-button-group label="View" name="view" value="week">
 *   <wc-segmented-button value="day">Day</wc-segmented-button>
 *   <wc-segmented-button value="week">Week</wc-segmented-button>
 *   <wc-segmented-button value="month">Month</wc-segmented-button>
 * </wc-segmented-button-group>
 * ```
 *
 * @tags controls
 */
let SegmentedButtonGroup = class SegmentedButtonGroup extends mixinFormAssociated(mixinElementInternals(i$1)) {
    constructor() {
        // ── Static ───────────────────────────────────────────────────────────────
        super(...arguments);
        // ── Properties ───────────────────────────────────────────────────────────
        // `name` and `disabled` come from mixinFormAssociated.
        /** When true, segments toggle independently and the group has several `values`. */
        this.multiple = false;
        /**
         * When true, in single-select mode the currently selected segment can be
         * deselected by clicking it again (allowing an empty selection).
         * Defaults to `false`.
         */
        this.nullable = false;
        /** Accessible name of the group. */
        this.label = '';
        /** Height of the segments: `sm` (2.5rem, default), `md` (3.5rem) or `lg` (4rem). */
        this.size = 'sm';
        // ── Private fields ───────────────────────────────────────────────────────
        /** The selection set through `value` or `values`; read only once `valuesSet` is true. */
        this.selectedValues = [];
        /**
         * Whether the consumer set `value` or `values`. Until then the segments' own `selected` is the
         * selection, so markup (or a template binding `?selected`) keeps driving it.
         */
        this.valuesSet = false;
        this.hasAdopted = false;
        /** The selection when first adopted; `form.reset()` returns to it. */
        this.defaultValues = [];
        /** Segments the group disabled, so re-enabling leaves segments disabled on their own alone. */
        this.disabledByGroup = new WeakSet();
        /** Pushes the selection, the role, the roving tabindex and `disabled` down to the segments. */
        this._syncSegments = () => {
            const segments = this._getSegments();
            if (segments.length && !this.hasAdopted) {
                this.hasAdopted = true;
                this.defaultValues = this.values;
                // The form value read the segments before they were there.
                this.requestUpdate();
            }
            const { values } = this;
            for (const segment of segments) {
                if (this.valuesSet) {
                    segment.selected = values.includes(segmentValue(segment));
                }
                segment.groupRole = this.multiple ? 'button' : 'radio';
                if (this.disabled && !segment.disabled) {
                    segment.disabled = true;
                    this.disabledByGroup.add(segment);
                }
                else if (!this.disabled && this.disabledByGroup.has(segment)) {
                    segment.disabled = false;
                    this.disabledByGroup.delete(segment);
                }
            }
            // Single select: one tab stop, the selected segment (or the first enabled one).
            const enabled = segments.filter(segment => !segment.disabled);
            const focusTarget = enabled.find(segment => segment.selected) ?? enabled[0];
            for (const segment of segments) {
                const tabIndex = segment === focusTarget ? 0 : -1;
                segment.groupTabIndex = this.multiple ? undefined : tabIndex;
            }
        };
        /**
         * Handles a segment's own `change` on the way down (capture phase) and swallows it, so
         * listeners on the group and above see only the group's `change`.
         */
        this._onSegmentChange = (ev) => {
            if (ev.target === this)
                return;
            ev.stopPropagation();
            if (ev.target instanceof SegmentedButton)
                this._activate(ev.target);
        };
        /** Single select: the arrows, Home and End move the selection, like a radio group. */
        this._onKeyDown = (ev) => {
            if (this.multiple || this.disabled)
                return;
            const segments = this._enabledSegments();
            const current = ev.target;
            const index = segments.indexOf(current);
            if (index < 0 || !segments.length)
                return;
            const rtl = getComputedStyle(this).direction === 'rtl';
            let nextIndex;
            switch (ev.key) {
                case 'ArrowRight':
                    nextIndex = index + (rtl ? -1 : 1);
                    break;
                case 'ArrowDown':
                    nextIndex = index + 1;
                    break;
                case 'ArrowLeft':
                    nextIndex = index + (rtl ? 1 : -1);
                    break;
                case 'ArrowUp':
                    nextIndex = index - 1;
                    break;
                case 'Home':
                    nextIndex = 0;
                    break;
                case 'End':
                    nextIndex = segments.length - 1;
                    break;
                default:
                    return;
            }
            ev.preventDefault();
            const target = segments[(nextIndex + segments.length) % segments.length];
            if (!target.selected)
                this._activate(target);
            target.focus();
        };
    }
    /** The selected value in single-select mode (the first selected one with `multiple`); `''` for none. */
    get value() {
        return this.current[0] ?? '';
    }
    set value(value) {
        this.values = value ? [value] : [];
    }
    /** The selected values; with `multiple`, all of them, in segment order. */
    get values() {
        return this.multiple ? [...this.current] : this.current.slice(0, 1);
    }
    set values(values) {
        const old = this.values;
        this.selectedValues = [...(values ?? [])];
        this.valuesSet = true;
        this.requestUpdate('values', old);
        this.requestUpdate('value', old[0] ?? '');
    }
    // ── Lifecycle ────────────────────────────────────────────────────────────
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener('change', this._onSegmentChange, { capture: true });
        this.addEventListener('keydown', this._onKeyDown);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener('change', this._onSegmentChange, {
            capture: true,
        });
        this.removeEventListener('keydown', this._onKeyDown);
    }
    updated(changed) {
        super.updated(changed);
        if (changed.has('values') ||
            changed.has('multiple') ||
            changed.has('disabled')) {
            this._syncSegments();
        }
    }
    // ── Form association ─────────────────────────────────────────────────────
    [getFormValue]() {
        if (!this.multiple)
            return this.value || null;
        // One entry per selected value, like a native <select multiple>.
        const data = new FormData();
        for (const value of this.values)
            data.append(this.name, value);
        return data;
    }
    formResetCallback() {
        this.values = this.defaultValues;
    }
    formStateRestoreCallback(state) {
        if (typeof state === 'string') {
            this.values = [state];
        }
        else if (Array.isArray(state)) {
            this.values = state.map(([, value]) => String(value));
        }
        else {
            this.values = this.defaultValues;
        }
    }
    // ── Private methods ──────────────────────────────────────────────────────
    /**
     * The selection: what the consumer set, else the selected segments. The form mixin reads it
     * from the base constructor, before the fields are initialised.
     */
    get current() {
        if (this.valuesSet)
            return this.selectedValues;
        return this._getSegments()
            .filter(segment => segment.selected)
            .map(segmentValue);
    }
    _getSegments() {
        return Array.from(this.querySelectorAll('wc-segmented-button'));
    }
    _enabledSegments() {
        return this._getSegments().filter(segment => !segment.disabled);
    }
    /** Selects (or toggles, with `multiple`) a segment and fires `change` when the selection moved. */
    _activate(target) {
        if (this.disabled || target.disabled)
            return;
        const value = segmentValue(target);
        let next;
        if (this.multiple) {
            const toggled = new Set(this.values);
            if (toggled.has(value)) {
                toggled.delete(value);
            }
            else {
                toggled.add(value);
            }
            // In segment order.
            next = this._getSegments()
                .map(segmentValue)
                .filter(segment => toggled.has(segment));
        }
        else if (this.current[0] === value) {
            if (!this.nullable)
                return;
            next = [];
        }
        else {
            next = [value];
        }
        if (this.valuesSet) {
            this.values = next;
        }
        else {
            // The segments hold the selection; the consumer may bind their `selected`.
            const old = this.values;
            for (const segment of this._getSegments()) {
                segment.selected = next.includes(segmentValue(segment));
            }
            this.requestUpdate('values', old);
        }
        this._syncSegments();
        this.dispatchEvent(new CustomEvent('change', {
            detail: { value: this.value, values: this.values },
            bubbles: true,
            composed: true,
        }));
    }
    // ── Render ───────────────────────────────────────────────────────────────
    render() {
        return b `
      <div
        class="segmented-button-group"
        role=${this.multiple ? 'group' : 'radiogroup'}
        aria-label=${this.label || A}
        aria-disabled=${this.disabled ? 'true' : A}
      >
        <slot @slotchange=${this._syncSegments}></slot>
      </div>
    `;
    }
};
SegmentedButtonGroup.styles = [css_248z];
SegmentedButtonGroup.SegmentedButton = SegmentedButton;
__decorate([
    n({ type: Boolean, reflect: true })
], SegmentedButtonGroup.prototype, "multiple", void 0);
__decorate([
    n({ type: Boolean, reflect: true })
], SegmentedButtonGroup.prototype, "nullable", void 0);
__decorate([
    n({ type: String })
], SegmentedButtonGroup.prototype, "value", null);
__decorate([
    n({ attribute: false })
], SegmentedButtonGroup.prototype, "values", null);
__decorate([
    n({ type: String })
], SegmentedButtonGroup.prototype, "label", void 0);
__decorate([
    n({ type: String, reflect: true })
], SegmentedButtonGroup.prototype, "size", void 0);
SegmentedButtonGroup = __decorate([
    IndividualComponent
], SegmentedButtonGroup);

export { SegmentedButtonGroup };
//# sourceMappingURL=segmented-button-group.js.map

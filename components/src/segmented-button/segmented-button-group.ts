import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { mixinElementInternals } from '@/__internal/mixins/element-internals.js';
import {
  type FormRestoreState,
  type FormValue,
  getFormValue,
  mixinFormAssociated,
} from '@/__internal/mixins/form-associated.js';
import { deprecate } from '@/__internal/utils/deprecate.js';
import type { Size } from '@/__internal/utils/size.js';
import styles from './segmented-button-group.scss';
import { SegmentedButton } from './segmented-button.js';
import IndividualComponent from '@/IndividualComponent.js';

/** The value a segment stands for: its `value`, else its text. */
function segmentValue(segment: SegmentedButton): string {
  return segment.value || segment.textContent?.trim() || '';
}

/**
 * @label Segmented Button Group
 * @tag wc-segmented-button-group
 * @rawTag segmented-button-group
 * @summary A container for segmented buttons.
 * @overview
 * <p>Segmented buttons help people select options, switch views, or sort elements. They follow the specification.</p>
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
 * <p>Deprecated: <code>multi-select</code> still works until 4.0; use <code>multiple</code>.</p>
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
@IndividualComponent
export class SegmentedButtonGroup extends mixinFormAssociated(
  mixinElementInternals(LitElement),
) {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  static SegmentedButton = SegmentedButton;

  // ── Properties ───────────────────────────────────────────────────────────
  // `name` and `disabled` come from mixinFormAssociated.

  /** When true, segments toggle independently and the group has several `values`. */
  @property({ type: Boolean, reflect: true })
  multiple: boolean = false;

  /**
   * When true, multiple segments can be selected simultaneously.
   * @deprecated Use `multiple`.
   */
  @property({ type: Boolean, attribute: 'multi-select' })
  get multiSelect(): boolean {
    return this.multiple;
  }

  set multiSelect(value: boolean) {
    deprecate('wc-segmented-button-group', '`multi-select`', '`multiple`');
    this.multiple = value;
  }

  /**
   * When true, in single-select mode the currently selected segment can be
   * deselected by clicking it again (allowing an empty selection).
   * Defaults to `false`.
   */
  @property({ type: Boolean, reflect: true })
  nullable: boolean = false;

  /** The selected value in single-select mode (the first selected one with `multiple`); `''` for none. */
  @property({ type: String })
  get value(): string {
    return this.current[0] ?? '';
  }

  set value(value: string) {
    this.values = value ? [value] : [];
  }

  /** The selected values; with `multiple`, all of them, in segment order. */
  @property({ attribute: false })
  get values(): string[] {
    return this.multiple ? [...this.current] : this.current.slice(0, 1);
  }

  set values(values: string[]) {
    const old = this.values;
    this.selectedValues = [...(values ?? [])];
    this.valuesSet = true;
    this.requestUpdate('values', old);
    this.requestUpdate('value', old[0] ?? '');
  }

  /** Accessible name of the group. */
  @property({ type: String })
  label = '';

  /** Height of the segments: `sm` (2.5rem, default), `md` (3.5rem) or `lg` (4rem). */
  @property({ type: String, reflect: true })
  size: Size = 'sm';

  // ── Private fields ───────────────────────────────────────────────────────

  /** The selection set through `value` or `values`; read only once `valuesSet` is true. */
  private selectedValues: string[] = [];

  /**
   * Whether the consumer set `value` or `values`. Until then the segments' own `selected` is the
   * selection, so markup (or a template binding `?selected`) keeps driving it.
   */
  private valuesSet = false;

  private hasAdopted = false;

  /** The selection when first adopted; `form.reset()` returns to it. */
  private defaultValues: string[] = [];

  /** Segments the group disabled, so re-enabling leaves segments disabled on their own alone. */
  private readonly disabledByGroup = new WeakSet<SegmentedButton>();

  // ── Lifecycle ────────────────────────────────────────────────────────────

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('change', this._onSegmentChange, { capture: true });
    this.addEventListener('segmented-button--change', this._stopLegacyChange, {
      capture: true,
    });
    this.addEventListener('keydown', this._onKeyDown);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener('change', this._onSegmentChange, {
      capture: true,
    });
    this.removeEventListener(
      'segmented-button--change',
      this._stopLegacyChange,
      { capture: true },
    );
    this.removeEventListener('keydown', this._onKeyDown);
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (
      changed.has('values') ||
      changed.has('multiple') ||
      changed.has('disabled')
    ) {
      this._syncSegments();
    }
  }

  // ── Form association ─────────────────────────────────────────────────────

  override [getFormValue](): FormValue | null {
    if (!this.multiple) return this.value || null;
    // One entry per selected value, like a native <select multiple>.
    const data = new FormData();
    for (const value of this.values) data.append(this.name, value);
    return data;
  }

  formResetCallback() {
    this.values = this.defaultValues;
  }

  formStateRestoreCallback(state: FormRestoreState | null) {
    if (typeof state === 'string') {
      this.values = [state];
    } else if (Array.isArray(state)) {
      this.values = state.map(([, value]) => String(value));
    } else {
      this.values = this.defaultValues;
    }
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /**
   * The selection: what the consumer set, else the selected segments. The form mixin reads it
   * from the base constructor, before the fields are initialised.
   */
  private get current(): string[] {
    if (this.valuesSet) return this.selectedValues;
    return this._getSegments()
      .filter(segment => segment.selected)
      .map(segmentValue);
  }

  private _getSegments(): SegmentedButton[] {
    return Array.from(
      this.querySelectorAll<SegmentedButton>('wc-segmented-button'),
    );
  }

  private _enabledSegments(): SegmentedButton[] {
    return this._getSegments().filter(segment => !segment.disabled);
  }

  /** Pushes the selection, the role, the roving tabindex and `disabled` down to the segments. */
  private _syncSegments = () => {
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
      } else if (!this.disabled && this.disabledByGroup.has(segment)) {
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

  /** The segments' deprecated event stays inside the group, as before. */
  private _stopLegacyChange = (ev: Event) => {
    if (ev.target !== this) ev.stopPropagation();
  };

  /**
   * Handles a segment's own `change` on the way down (capture phase) and swallows it, so
   * listeners on the group and above see only the group's `change`.
   */
  private _onSegmentChange = (ev: Event) => {
    if (ev.target === this) return;
    ev.stopPropagation();
    if (ev.target instanceof SegmentedButton) this._activate(ev.target);
  };

  /** Selects (or toggles, with `multiple`) a segment and fires `change` when the selection moved. */
  private _activate(target: SegmentedButton) {
    if (this.disabled || target.disabled) return;
    const value = segmentValue(target);
    let next: string[];

    if (this.multiple) {
      const toggled = new Set(this.values);
      if (toggled.has(value)) {
        toggled.delete(value);
      } else {
        toggled.add(value);
      }
      // In segment order.
      next = this._getSegments()
        .map(segmentValue)
        .filter(segment => toggled.has(segment));
    } else if (this.current[0] === value) {
      if (!this.nullable) return;
      next = [];
    } else {
      next = [value];
    }

    if (this.valuesSet) {
      this.values = next;
    } else {
      // The segments hold the selection; the consumer may bind their `selected`.
      const old = this.values;
      for (const segment of this._getSegments()) {
        segment.selected = next.includes(segmentValue(segment));
      }
      this.requestUpdate('values', old);
    }
    this._syncSegments();
    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: this.value, values: this.values },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /** Single select: the arrows, Home and End move the selection, like a radio group. */
  private _onKeyDown = (ev: KeyboardEvent) => {
    if (this.multiple || this.disabled) return;
    const segments = this._enabledSegments();
    const current = ev.target as SegmentedButton;
    const index = segments.indexOf(current);
    if (index < 0 || !segments.length) return;

    const rtl = getComputedStyle(this).direction === 'rtl';
    let nextIndex: number;
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
    if (!target.selected) this._activate(target);
    target.focus();
  };

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    return html`
      <div
        class="segmented-button-group"
        role=${this.multiple ? 'group' : 'radiogroup'}
        aria-label=${this.label || nothing}
        aria-disabled=${this.disabled ? 'true' : nothing}
      >
        <slot @slotchange=${this._syncSegments}></slot>
      </div>
    `;
  }
}

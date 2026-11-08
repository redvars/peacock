import { html, type PropertyValues } from 'lit';
import { state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { spread } from '@/__internal/directive/spread.js';
import { peacockString } from '@/__internal/i18n/strings.js';
import ToggleBase from '@/__internal/toggle-base.js';
import type { ControlValidity } from '@/input/BaseInput.js';

import styles from './radio.scss';
import IndividualComponent from '@/IndividualComponent.js';

type RadioDirection = 1 | -1;

/**
 * @label Radio
 * @tag wc-radio
 * @rawTag radio
 * @summary A round button for choosing one option from a set; radios that share a name form a group.
 * @overview
 * <p>Radios that share a <code>name</code> form a group. Wrap them in <code>wc-radio-group</code> to get a
 * group label and a single <code>change</code> event for the whole set.</p>
 * <p>The radio is form-associated: the checked radio submits its <code>value</code> under its <code>name</code>.
 * When any radio of a group is <code>required</code>, the group blocks form submission until one is checked.</p>
 *
 * @cssprop --radio-size: Size of the outer radio circle.
 * @cssprop --radio-dot-size: Size of the inner dot when selected.
 * @cssprop --radio-selected-color: Color of the radio when selected.
 * @cssprop --radio-unselected-color: Color of the radio outline when unselected.
 * @cssprop --radio-state-layer-size: Size of the state layer for touch target.
 * @cssprop --radio-disabled-opacity: Opacity applied when the radio is disabled.
 *
 * @fires {CustomEvent<{checked: boolean, value: string, originalEvent?: Event}>} change - Dispatched when the radio is selected.
 *
 * @example
 * ```html
 * <wc-radio name="fruits" value="apple" label="Apple"></wc-radio>
 * ```
 * @tags input, form
 */
@IndividualComponent
export class Radio extends ToggleBase {
  // ── Static ───────────────────────────────────────────────────────────────

  private static readonly DIRECTION_NEXT: RadioDirection = 1;

  private static readonly DIRECTION_PREVIOUS: RadioDirection = -1;

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────
  // `name` (which groups radios), `disabled`, `required`, `readonly`, `label`, `checked`, `value`
  // and `configAria` are inherited.

  // ── State ────────────────────────────────────────────────────────────────

  /** True for the one radio in the group that should receive tab focus (roving tabindex). */
  @state()
  private isGroupFocusTarget = false;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override firstUpdated() {
    this.updateGroupFocusTarget();
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);

    if (changed.has('checked') && this.checked) {
      this.uncheckSiblings();
    }

    if (changed.has('checked') || changed.has('name')) {
      this.updateGroupFocusTarget();
    }

    if (changed.has('checked') || changed.has('required')) {
      // Group validity depends on every radio; let the others recompute theirs.
      for (const radio of this.getGroupRadios()) {
        if (radio !== this) radio.requestUpdate();
      }
    }
  }

  // ── Protected methods ────────────────────────────────────────────────────

  /** A radio submits nothing but its `value`; there is no `"on"` default to show. */
  protected override get defaultToggleValue(): string {
    return '';
  }

  /** Invalid while any radio of the group is required and none is checked. */
  protected override computeValidity(): ControlValidity {
    const group = this.getGroupRadios();
    const required = group.some(radio => radio.required);
    const checked = group.some(radio => radio.checked);
    if (required && !checked && !this.disabled) {
      return {
        flags: { valueMissing: true },
        message: peacockString('valueMissingRadio'),
      };
    }
    return { flags: {}, message: '' };
  }

  // ── Private methods ──────────────────────────────────────────────────────

  private keyDownHandler = (event: KeyboardEvent) => {
    if (event.key === ' ') {
      event.preventDefault();
      this.isActive = true;
      this.selectRadio(event);
    } else if (event.key === 'ArrowRight' || event.key === 'ArrowDown') {
      event.preventDefault();
      this.navigateGroup(Radio.DIRECTION_NEXT);
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.navigateGroup(Radio.DIRECTION_PREVIOUS);
    }
  };

  private clickHandler = (event: MouseEvent) => {
    this.selectRadio(event);
  };

  private selectRadio(event?: Event) {
    if (this.disabled || this.readonly) return;

    if (!this.checked) {
      this.checked = true;
      this.uncheckSiblings();
      this.dispatchChange(event);
    }

    this.containerElement?.focus();
  }

  private uncheckSiblings() {
    if (!this.name || !this.checked) return;
    for (const radio of this.getGroupRadios()) {
      if (radio !== this) radio.checked = false;
    }
  }

  private getGroupRadios(): Radio[] {
    if (!this.name) return [this];
    // A radio group or form scopes the name; otherwise the radio's own tree (document or the
    // shadow root it was rendered into).
    const scopeRoot = (this.closest('wc-radio-group, form') ??
      this.getRootNode()) as ParentNode;
    return Array.from(
      scopeRoot.querySelectorAll<Radio>(
        `wc-radio[name="${CSS.escape(this.name)}"]`,
      ),
    );
  }

  private static isRadioEnabled(radio: Radio) {
    return !radio.disabled && !radio.readonly;
  }

  private updateGroupFocusTarget() {
    const group = this.getGroupRadios();
    if (!group.length) return;

    const enabledGroup = group.filter(radio => Radio.isRadioEnabled(radio));
    if (!enabledGroup.length) {
      group.forEach(radio => {
        radio.isGroupFocusTarget = false;
      });
      return;
    }

    const target = enabledGroup.find(radio => radio.checked) || enabledGroup[0];

    group.forEach(radio => {
      radio.isGroupFocusTarget = radio === target;
    });
  }

  private navigateGroup(direction: RadioDirection) {
    const group = this.getGroupRadios().filter(radio =>
      Radio.isRadioEnabled(radio),
    );
    if (!group.length) return;

    const currentIndex = group.indexOf(this);
    const startIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (startIndex + direction + group.length) % group.length;
    const target = group[nextIndex];

    target.selectRadio();
    target.containerElement?.focus();
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const cssClasses = {
      radio: true,
      'state-checked': this.checked,
      'has-focus': this.hasFocus,
      active: this.isActive,
      disabled: this.disabled,
      readonly: this.readonly,
      required: this.required,
      'has-content': this.slotHasContent,
    };

    const attributes = this.controlAttributes();
    if (!this.isGroupFocusTarget) attributes.tabindex = '-1';

    return html`
      <label class=${classMap(cssClasses)}>
        <div
          class="container"
          role="radio"
          aria-checked=${String(this.checked)}
          @mousedown=${this.handleMouseDown}
          @keydown=${this.keyDownHandler}
          @focus=${this.handleFocusChange}
          @blur=${this.handleFocusChange}
          ${spread(attributes)}
        >
          <div class="state-layer"></div>
          <div class="outer-circle"></div>
          <div class="inner-circle"></div>
        </div>

        <input
          type="radio"
          class="input-native"
          .value=${this.value}
          .checked=${this.checked}
          aria-hidden="true"
          ?disabled=${this.disabled}
          tabindex="-1"
          @click=${this.clickHandler}
        />

        ${this.renderLabel()}
      </label>
    `;
  }
}

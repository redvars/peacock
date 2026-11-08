import { LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { WithElementInternals } from '@/__internal/mixins/element-internals.js';
import { throttle } from '@/__internal/utils/throttle.js';
import { warnOnce } from '@/__internal/utils/warn-once.js';
import { MixinBase, MixinReturn } from '@/__internal/mixins/mixin.js';
import type {
  ButtonColor,
  ButtonLevel,
  ButtonVariant,
} from '@/button/ButtonTypes.js';

/**
 * 1. Define an interface for the members the mixin adds.
 * This makes the type annotation much cleaner.
 */
export interface BaseButton {
  variant: string;

  color: string;

  disabled: boolean;

  softDisabled: boolean;

  disabledReason: string;

  throttleDelay?: number;

  __dispatchClickWithThrottle: (event: MouseEvent | KeyboardEvent) => void;

  __dispatchClick: (event: MouseEvent | KeyboardEvent) => void;
}

export function mixinBaseButton<
  T extends MixinBase<LitElement & WithElementInternals>,
>(base: T): MixinReturn<T, BaseButton> {
  abstract class BaseButtonElement extends base implements BaseButton {
    /** The visual style of the button, such as `"filled"`, `"tonal"`, `"outlined"` or `"text"`. */
    @property({ type: String, reflect: true })
    variant: string = '';

    /** The color role of the button, such as `"primary"`, `"surface"` or `"danger"`. */
    @property({ type: String, reflect: true })
    color: string = '';

    /**
     * When `true`, the button is disabled and cannot be interacted with. Reflects to the `disabled` attribute. Defaults to `false`.
     */
    @property({ type: Boolean, reflect: true })
    disabled: boolean = false;

    /**
     * When `true`, the button is visually styled as disabled and cannot be interacted with, but remains focusable.
     * Use this in combination with `disabledReason` to communicate why the button is unavailable.
     * Reflects to the `soft-disabled` attribute. Defaults to `false`.
     */
    @property({ type: Boolean, reflect: true, attribute: 'soft-disabled' })
    softDisabled: boolean = false;

    /**
     * A human-readable explanation of why the button is disabled or soft-disabled.
     * Rendered as a visually hidden tooltip and linked via `aria-describedby` for accessibility.
     * Maps to the `disabled-reason` attribute.
     */
    @property({ attribute: 'disabled-reason' })
    disabledReason: string = '';

    /**
     * Sets the delay for throttle in milliseconds. When undefined (default), no throttle is applied.
     */
    @property({ type: Number, attribute: 'throttle-delay' })
    throttleDelay?: number;

    __dispatchClickWithThrottle: (event: MouseEvent | KeyboardEvent) => void =
      event => {
        this.__dispatchClick(event);
      };

    abstract __dispatchClick: (event: MouseEvent | KeyboardEvent) => void;

    override firstUpdated(changedProperties: PropertyValues) {
      super.firstUpdated(changedProperties);
      if (typeof this.throttleDelay === 'number') {
        this.__dispatchClickWithThrottle = throttle(
          this.__dispatchClick,
          this.throttleDelay,
        );
      }
    }
  }

  return BaseButtonElement;
}

// ── Level ────────────────────────────────────────────────────────────────────

/**
 * What each `level` preset resolves to, shared by `wc-button`, `wc-icon-button` and
 * `wc-link-button`. A `color` or `variant` the consumer sets wins over the preset, one property at
 * a time, so `level="danger" variant="outlined"` is an outlined danger button.
 */
export const BUTTON_LEVEL_APPEARANCE: Readonly<
  Record<
    ButtonLevel,
    { readonly color: ButtonColor; readonly variant: ButtonVariant }
  >
> = {
  primary: { color: 'primary', variant: 'filled' },
  secondary: { color: 'surface', variant: 'tonal' },
  tertiary: { color: 'primary', variant: 'text' },
  danger: { color: 'danger', variant: 'filled' },
};

/** Variant and color used when neither the consumer nor a `level` sets one. */
export const BUTTON_DEFAULT_APPEARANCE = {
  color: 'primary',
  variant: 'filled',
} as const satisfies { color: ButtonColor; variant: ButtonVariant };

/** The preset for `level`, or `undefined` for no level or an unknown one. */
export function levelAppearance(
  level: string | undefined | null,
):
  | { readonly color: ButtonColor; readonly variant: ButtonVariant }
  | undefined {
  if (
    !level ||
    !Object.prototype.hasOwnProperty.call(BUTTON_LEVEL_APPEARANCE, level)
  )
    return undefined;
  return BUTTON_LEVEL_APPEARANCE[level as ButtonLevel];
}

/** The members `mixinButtonLevel` adds. */
export interface ButtonLevelAppearance {
  /**
   * Preset of `color` and `variant`: `primary` (primary, filled), `secondary` (surface, tonal),
   * `tertiary` (primary, text), `danger` (danger, filled). A `color` or `variant` set on the
   * element wins over the preset.
   */
  level?: ButtonLevel;

  /** The visual style. Reads back the resolved value: the one set, else the level's, else `filled`. */
  variant: ButtonVariant;

  /** The color role. Reads back the resolved value: the one set, else the level's, else `primary`. */
  color: ButtonColor;
}

/**
 * Adds `level` and resolves `variant` and `color` from it at render time. The `variant` and
 * `color` attributes reflect the resolved values (the styles key on them), but the level never
 * writes the consumer's own values, so a later change to `level` takes effect and an explicit
 * `color`/`variant` always wins.
 */
export function mixinButtonLevel<T extends MixinBase<LitElement & BaseButton>>(
  base: T,
): MixinReturn<T, ButtonLevelAppearance> {
  abstract class ButtonLevelElement
    extends base
    implements ButtonLevelAppearance
  {
    /**
     * Preset of `color` and `variant`: `primary` (primary, filled), `secondary` (surface, tonal),
     * `tertiary` (primary, text), `danger` (danger, filled). A `color` or `variant` set on the
     * element wins over the preset.
     */
    @property({ type: String }) level?: ButtonLevel;

    /**
     * The visual style of the button: `"filled"`, `"tonal"`, `"outlined"`, `"text"`,
     * `"elevated"` or `"neo"`. Unset, it comes from `level`, else `"filled"`.
     */
    @property({ type: String, reflect: true })
    get variant(): ButtonVariant {
      return (
        this.__explicitVariant ||
        levelAppearance(this.level)?.variant ||
        BUTTON_DEFAULT_APPEARANCE.variant
      );
    }

    set variant(value: ButtonVariant) {
      this.__explicitVariant = value || undefined;
    }

    /**
     * The color role of the button. Unset, it comes from `level`, else `"primary"`.
     */
    @property({ type: String, reflect: true })
    get color(): ButtonColor {
      return (
        this.__explicitColor ||
        levelAppearance(this.level)?.color ||
        BUTTON_DEFAULT_APPEARANCE.color
      );
    }

    set color(value: ButtonColor) {
      this.__explicitColor = value || undefined;
    }

    __explicitVariant?: ButtonVariant;

    __explicitColor?: ButtonColor;

    override willUpdate(changedProperties: PropertyValues) {
      super.willUpdate(changedProperties);
      // The level changes the resolved values without going through their setters, so ask Lit
      // to reflect them (also on the first update, when nothing has set them yet).
      if (!this.hasUpdated || changedProperties.has('level')) {
        this.requestUpdate('variant', undefined);
        this.requestUpdate('color', undefined);
      }
    }
  }

  return ButtonLevelElement;
}

// ── Toggle ───────────────────────────────────────────────────────────────────

/** A button that can act as a toggle: `toggle` turns it on, `selected` is its pressed state. */
export interface ToggleableButton extends HTMLElement {
  toggle: boolean;
  selected: boolean;
  disabled: boolean;
}

/**
 * Flips `selected` on a toggle button and fires `change` with the new state. Does nothing unless
 * `toggle` is set or while the button is disabled; callers block soft-disabled and loading first.
 */
export function toggleButtonSelected(host: ToggleableButton): void {
  if (!host.toggle || host.disabled) return;
  host.selected = !host.selected;
  host.dispatchEvent(
    new CustomEvent<{ selected: boolean }>('change', {
      detail: { selected: host.selected },
      bubbles: true,
      composed: true,
    }),
  );
}

// ── Accessible name ──────────────────────────────────────────────────────────

/**
 * The name an icon-only button falls back to: its `aria-label`, else its tooltip text.
 */
export function iconButtonLabel(
  ariaLabel: string | null | undefined,
  tooltip: string | undefined,
): string | undefined {
  return ariaLabel || tooltip || undefined;
}

/**
 * Warns once per tag when an icon-only button has nothing to be announced by: no `aria-label`,
 * no `aria-labelledby`, no `tooltip` and no slotted text.
 */
export function warnIfUnnamed(
  host: HTMLElement,
  ariaLabel: string | null | undefined,
  ...otherNames: (string | null | undefined)[]
): void {
  if (ariaLabel || otherNames.some(name => !!name)) return;
  if (host.hasAttribute('aria-labelledby')) return;
  if (host.hasAttribute('data-aria-labelledby')) return;
  if (host.textContent?.trim()) return;
  const tag = host.localName;
  warnOnce(
    `${tag}:accessible-name`,
    `[peacock] ${tag} has no accessible name, so screen readers announce it as just "button". Give it an aria-label or a tooltip.`,
  );
}

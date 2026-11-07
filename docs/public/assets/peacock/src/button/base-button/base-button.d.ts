import { LitElement } from 'lit';
import { WithElementInternals } from '@/__internal/mixins/element-internals.js';
import { MixinBase, MixinReturn } from '@/__internal/mixins/mixin.js';
import type { ButtonColor, ButtonLevel, ButtonVariant } from '@/button/ButtonTypes.js';
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
export declare function mixinBaseButton<T extends MixinBase<LitElement & WithElementInternals>>(base: T): MixinReturn<T, BaseButton>;
/**
 * What each `level` preset resolves to, shared by `wc-button`, `wc-icon-button` and
 * `wc-link-button`. A `color` or `variant` the consumer sets wins over the preset, one property at
 * a time, so `level="danger" variant="outlined"` is an outlined danger button.
 */
export declare const BUTTON_LEVEL_APPEARANCE: Readonly<Record<ButtonLevel, {
    readonly color: ButtonColor;
    readonly variant: ButtonVariant;
}>>;
/** Variant and color used when neither the consumer nor a `level` sets one. */
export declare const BUTTON_DEFAULT_APPEARANCE: {
    readonly color: "primary";
    readonly variant: "filled";
};
/** The preset for `level`, or `undefined` for no level or an unknown one. */
export declare function levelAppearance(level: string | undefined | null): {
    readonly color: ButtonColor;
    readonly variant: ButtonVariant;
} | undefined;
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
export declare function mixinButtonLevel<T extends MixinBase<LitElement & BaseButton>>(base: T): MixinReturn<T, ButtonLevelAppearance>;
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
export declare function toggleButtonSelected(host: ToggleableButton): void;
/**
 * The name an icon-only button falls back to: its `aria-label`, else its tooltip text.
 */
export declare function iconButtonLabel(ariaLabel: string | null | undefined, tooltip: string | undefined): string | undefined;
/**
 * Warns once per tag when an icon-only button has nothing to be announced by: no `aria-label`,
 * no `aria-labelledby`, no `tooltip` and no slotted text.
 */
export declare function warnIfUnnamed(host: HTMLElement, ariaLabel: string | null | undefined, ...otherNames: (string | null | undefined)[]): void;

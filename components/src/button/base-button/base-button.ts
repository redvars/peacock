import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { WithElementInternals } from '@/__internal/mixins/element-internals.js';
import { MixinBase, MixinReturn } from '@/__internal/mixins/mixin.js';

/**
 * 1. Define an interface for the members the mixin adds.
 * This makes the type annotation much cleaner.
 */
export interface BaseButton {
  disabled: boolean;

  softDisabled: boolean;

  disabledReason: string;
}

export function mixinBaseButton<
  T extends MixinBase<LitElement & WithElementInternals>,
>(base: T): MixinReturn<T, BaseButton> {
  abstract class BaseButtonElement extends base implements BaseButton {
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
  }

  return BaseButtonElement;
}

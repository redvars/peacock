import { LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { WithElementInternals } from '@/__internal/mixins/element-internals.js';
import { throttle } from '@/__internal/utils/throttle.js';
import { MixinBase, MixinReturn } from '@/__internal/mixins/mixin.js';

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
    @property({ type: String, reflect: true })
    variant: string = '';

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
    @property() throttleDelay?: number;

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

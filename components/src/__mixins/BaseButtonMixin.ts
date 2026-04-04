import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import type { MixinConstructor } from './MixinConstructor.js';


/**
 * 1. Define an interface for the members the mixin adds.
 * This makes the type annotation much cleaner.
 */
export interface BaseButtonInterface {
    htmlType: 'button' | 'submit' | 'reset';
    disabled: boolean;
    softDisabled: boolean;
    disabledReason: string;
    form: string;
    name: string;
    value: string;
}

/**
 * 2. Apply the type annotation to the variable.
 */
const BaseButtonMixin: <T extends MixinConstructor<LitElement>>(superclass: T) => T & MixinConstructor<BaseButtonInterface> = <T extends MixinConstructor<LitElement>>(superclass: T) => {
    // Naming the class (BaseButtonElement) instead of using 'Mixin' or anonymous 
    // prevents the "__childPart" visibility error.
    class BaseButtonElement extends superclass implements BaseButtonInterface {

        /**
         * The type of the underlying `<button>` element. Maps to the native `type` attribute.
         * Possible values are `"button"`, `"submit"`, `"reset"`. Defaults to `"button"`.
         */
        @property({ type: String }) htmlType: 'button' | 'submit' | 'reset' =
            'button';

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
         * The `id` of the `<form>` element to associate the button with.
         * If omitted, the button is associated with its nearest ancestor form.
         * Maps to the native `form` attribute.
         */
        @property()
        form: string = '';

        /**
         * The name of the button, submitted as part of a name/value pair when the associated form is submitted.
         * Maps to the native `name` attribute.
         */
        @property()
        name: string = '';

        /**
         * The value of the button, submitted as part of a name/value pair when the associated form is submitted.
         * Maps to the native `value` attribute.
         */
        @property()
        value: string = '';
    }

    return BaseButtonElement as T & MixinConstructor<BaseButtonInterface>;
};

export default BaseButtonMixin;
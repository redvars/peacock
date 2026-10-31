import { LitElement } from 'lit';
import { type FormRestoreState, type FormValue, getFormValue } from '@/__internal/mixins/form-associated.js';
declare const BaseInput_base: import("../__internal/mixins/mixin.js").MixinReturn<(abstract new (...args: any[]) => import("@/__internal/mixins/element-internals.js").WithElementInternals) & typeof LitElement & import("@/__internal/mixins/form-associated.js").FormAssociatedConstructor, import("@/__internal/mixins/form-associated.js").FormAssociated>;
/**
 * Base class for Peacock's text-like form controls.
 *
 * It is form-associated: `value` is submitted with the surrounding `<form>`, `form.reset()`
 * restores the value the control started with, and a disabled `<fieldset>` disables it.
 * `name` and `disabled` come from `mixinFormAssociated`; they are backed by attributes, so
 * subclasses must not redeclare them.
 */
export default abstract class BaseInput extends BaseInput_base {
    /** Each control declares its own `value` (a property, or an accessor such as Switch's). */
    abstract value?: any;
    readonly: boolean;
    required: boolean;
    skeleton: boolean;
    /** The value the control had when it was first connected; `form.reset()` returns to it. */
    private __defaultValue;
    private __defaultValueCaptured;
    connectedCallback(): void;
    [getFormValue](): FormValue | null;
    formResetCallback(): void;
    formStateRestoreCallback(state: FormRestoreState | null): void;
}
export {};

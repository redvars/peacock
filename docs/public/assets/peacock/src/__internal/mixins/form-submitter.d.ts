import { LitElement } from 'lit';
import { WithElementInternals } from './element-internals.js';
import { MixinBase, MixinReturn } from './mixin.js';
/**
 * A string indicating the form submission behavior of the element.
 *
 * - submit: The element submits the form. This is the default value if the
 * attribute is not specified, or if it is dynamically changed to an empty or
 * invalid value.
 * - reset: The element resets the form.
 * - button: The element does nothing.
 */
export type FormSubmitterType = 'button' | 'submit' | 'reset';
/**
 * An element that can submit or reset a `<form>`, similar to
 * `<button type="submit">`.
 */
export interface FormSubmitter {
    /**
     * A string indicating the form submission behavior of the element.
     *
     * - submit: The element submits the form. This is the default value if the
     * attribute is not specified, or if it is dynamically changed to an empty or
     * invalid value.
     * - reset: The element resets the form.
     * - button: The element does nothing.
     */
    type: string;
    /**
     * The HTML name to use in form submission. When combined with a `value`, the
     * submitting button's name/value will be added to the form.
     *
     * Names must reflect to a `name` attribute for form integration.
     */
    name: string;
    /**
     * The value of the button. When combined with a `name`, the submitting
     * button's name/value will be added to the form.
     */
    value: string;
}
/**
 * Mixes in form submitter behavior for a class.
 *
 * A click listener is added to each element instance. If the click is not
 * default prevented, it will submit the element's form, if any.
 *
 * @example
 * ```ts
 * const base = mixinFormSubmitter(mixinElementInternals(LitElement));
 * class MyButton extends base {
 *   static formAssociated = true;
 * }
 * ```
 *
 * @param base The class to mix functionality into.
 * @return The provided class with `FormSubmitter` mixed in.
 */
export declare function mixinFormSubmitter<T extends MixinBase<LitElement & WithElementInternals>>(base: T): MixinReturn<T, FormSubmitter>;

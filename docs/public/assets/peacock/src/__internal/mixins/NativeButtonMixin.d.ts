import { LitElement } from 'lit';
import type { MixinConstructor } from './MixinConstructor.js';
/**
 * 1. Define an interface for the members the mixin adds.
 * This makes the type annotation much cleaner.
 */
export interface NativeButtonInterface {
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
declare const NativeButtonMixin: <T extends MixinConstructor<LitElement>>(superclass: T) => T & MixinConstructor<NativeButtonInterface>;
export default NativeButtonMixin;

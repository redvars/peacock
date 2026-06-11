import { LitElement } from 'lit';
import { WithElementInternals } from '@/__internal/mixins/element-internals.js';
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
export declare function mixinBaseButton<T extends MixinBase<LitElement & WithElementInternals>>(base: T): MixinReturn<T, BaseButton>;

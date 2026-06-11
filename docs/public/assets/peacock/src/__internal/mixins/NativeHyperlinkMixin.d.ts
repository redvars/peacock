import { LitElement } from 'lit';
import type { MixinConstructor } from './MixinConstructor.js';
/**
 * 1. Define an interface for the members the mixin adds.
 * This makes the type annotation much cleaner.
 */
export interface NativeHyperlinkInterface {
    href?: string;
    target: '_self' | '_parent' | '_blank' | '_top' | string;
    rel?: string;
    download?: string;
}
/**
 * 2. Apply the type annotation to the variable.
 */
declare const NativeHyperlinkMixin: <T extends MixinConstructor<LitElement>>(superclass: T) => T & MixinConstructor<NativeHyperlinkInterface>;
export default NativeHyperlinkMixin;

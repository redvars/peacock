import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * 1. Define an interface for the members the mixin adds.
 * This makes the type annotation much cleaner.
 */
export interface BaseHyperlinkInterface {
  href?: string;
  target: '_self' | '_parent' | '_blank' | '_top' | string;
  __isLink(): boolean;
}

/**
 * 2. Define the Mixin type separately for readability.
 */
type BaseHyperlinkMixinType = <T extends Constructor<LitElement>>(superclass: T) => T & Constructor<BaseHyperlinkInterface>;

/**
 * 3. Apply the type annotation to the variable.
 */
const BaseHyperlink: BaseHyperlinkMixinType = <T extends Constructor<LitElement>>(superclass: T) => {
  // Naming the class (BaseHyperlinkElement) instead of using 'Mixin' or anonymous 
  // prevents the "__childPart" visibility error.
  class BaseHyperlinkElement extends superclass implements BaseHyperlinkInterface {
    @property({ reflect: true }) 
    href?: string;

    @property() 
    target: '_self' | '_parent' | '_blank' | '_top' | string = '_self';

    __isLink(): boolean {
      return !!this.href;
    }
  }

  return BaseHyperlinkElement as T & Constructor<BaseHyperlinkInterface>;
};

export default BaseHyperlink;
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
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
const NativeHyperlinkMixin: <T extends MixinConstructor<LitElement>>(
  superclass: T,
) => T & MixinConstructor<NativeHyperlinkInterface> = <
  T extends MixinConstructor<LitElement>,
>(
  superclass: T,
) => {
  // Naming the class (BaseHyperlinkElement) instead of using 'Mixin' or anonymous
  // prevents the "__childPart" visibility error.
  class BaseHyperlinkElement
    extends superclass
    implements NativeHyperlinkInterface
  {
    /**
     * The URL that the hyperlink points to. When set, the component renders as an `<a>` element.
     * Maps to the native `href` attribute.
     */
    @property({ reflect: true })
    href?: string;

    /**
     * Where to display the linked URL. Maps to the native `target` attribute.
     * Possible values are `"_self"`, `"_blank"`, `"_parent"`, `"_top"`, or a custom frame name.
     * When using `"_blank"`, consider setting `rel="noopener noreferrer"` for security. Defaults to `"_self"`.
     */
    @property()
    target: '_self' | '_parent' | '_blank' | '_top' | string = '_self';

    /**
     * The relationship between the current document and the linked URL.
     * Maps to the native `rel` attribute on the rendered `<a>` element.
     * When `target="_blank"`, use `"noopener noreferrer"` to prevent tab-napping attacks.
     */
    @property()
    rel?: string;

    /**
     * Causes the browser to download the linked URL instead of navigating to it.
     * If a string value is provided, it is used as the suggested filename.
     * Omit or leave undefined to preserve normal navigation behaviour.
     * Maps to the native `download` attribute. Only applies when `href` is set.
     */
    @property()
    download?: string;
  }

  return BaseHyperlinkElement as T & MixinConstructor<NativeHyperlinkInterface>;
};

export default NativeHyperlinkMixin;

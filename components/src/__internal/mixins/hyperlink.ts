import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

import { MixinBase, MixinReturn } from './mixin.js';

/**
 * An element that navigates to a URL when activated, similar to `<a href>`.
 */
export interface Hyperlink {
  /**
   * The URL the hyperlink points to. When set, the component renders as an
   * `<a>` element. Maps to the native `href` attribute.
   */
  href: string;

  /**
   * Where to display the linked URL. Maps to the native `target` attribute.
   * Possible values: `"_self"`, `"_blank"`, `"_parent"`, `"_top"`, or a
   * frame name. When using `"_blank"`, set `rel="noopener noreferrer"`.
   */
  target: '_self' | '_parent' | '_blank' | '_top' | string;

  /**
   * The relationship between the current document and the linked URL.
   * Maps to the native `rel` attribute. Use `"noopener noreferrer"` when
   * `target="_blank"` to prevent tab-napping attacks.
   */
  rel: string;

  /**
   * Causes the browser to download the linked URL instead of navigating.
   * A string value is used as the suggested filename. Only applies when
   * `href` is set. Maps to the native `download` attribute.
   */
  download: string;
}

/**
 * Mixes in hyperlink behavior for a class.
 *
 * @example
 * ```ts
 * class MyLink extends mixinHyperlink(LitElement) {}
 * ```
 *
 * @param base The class to mix functionality into.
 * @return The provided class with `Hyperlink` mixed in.
 */
export function mixinHyperlink<T extends MixinBase<LitElement>>(
  base: T,
): MixinReturn<T, Hyperlink> {
  abstract class HyperlinkElement extends base implements Hyperlink {
    @property({ reflect: true }) href = '';

    @property() target: '_self' | '_parent' | '_blank' | '_top' | string =
      '_self';

    @property() rel = '';

    @property() download = '';

    // Mixins must have a constructor with `...args: any[]`
    // tslint:disable-next-line:no-any
    // eslint-disable-next-line no-useless-constructor
    constructor(...args: any[]) {
      super(...args);
    }
  }

  return HyperlinkElement;
}

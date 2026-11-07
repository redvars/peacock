import { LitElement } from 'lit';
/** What a tag means; it picks the matching color role. */
export type TagIntent = 'info' | 'success' | 'warning' | 'danger';
/** Decorative hues for tags that carry no meaning, such as categories. */
export type TagAccent = 'blue' | 'green' | 'red' | 'yellow' | 'orange' | 'purple';
/**
 * @label Tag
 * @tag wc-tag
 * @rawTag tag
 * @summary A read-only label for a status or a value.
 * @overview
 * <p>A tag shows a status or a value; it has no action of its own. Use <code>intent</code>
 * (<code>info</code>, <code>success</code>, <code>warning</code>, <code>danger</code>) when the
 * tag means something, and <code>accent</code> for a decorative hue (categories, labels). For a
 * removable or selectable item use <code>wc-chip</code>.</p>
 *
 * @example
 * ```html
 * <wc-tag intent="danger">Failed</wc-tag>
 * <wc-tag accent="purple">Design</wc-tag>
 * ```
 */
export declare class Tag extends LitElement {
    static styles: import("lit").CSSResultGroup[];
    /** Visual style. */
    variant: 'elevated' | 'filled' | 'tonal' | 'outlined';
    /** What the tag means: `info`, `success`, `warning` or `danger`. Takes precedence over `accent`. */
    intent?: TagIntent;
    /** A decorative hue for tags without meaning: `blue`, `green`, `red`, `yellow`, `orange`, `purple`. */
    accent?: TagAccent;
    /** Tag size. Possible values are `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`. */
    size?: 'sm' | 'md' | 'lg';
    render(): import("lit-html").TemplateResult<1>;
}

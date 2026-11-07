import { BaseProgress } from '../base-progress.js';
/**
 * @label Circular Progress
 * @tag wc-circular-progress
 * @rawTag circular-progress
 * @summary A ring that fills to show how much of a task is done, or spins when the length of the wait is unknown.
 * @overview
 * <p><code>value</code> runs from 0 to <code>max</code> (default 100) and is clamped into that
 * range. The visible <code>label</code> names the indicator through
 * <code>aria-labelledby</code>; without one, an <code>aria-label</code> on the element names it,
 * else it is named "Loading". With
 * <code>indeterminate</code> it spins, for a wait of unknown length.</p>
 * @tags display
 *
 * @example
 * ```html
 * <wc-circular-progress value="30"></wc-circular-progress>
 * ```
 */
export declare class CircularProgress extends BaseProgress {
    static styles: import("lit").CSSResultGroup[];
    render(): import("lit-html").TemplateResult<1>;
}

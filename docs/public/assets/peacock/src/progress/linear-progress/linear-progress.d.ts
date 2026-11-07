import { BaseProgress } from '../base-progress.js';
/**
 * @label Linear Progress
 * @tag wc-linear-progress
 * @rawTag linear-progress
 * @summary A bar that fills to show how much of a task is done, or moves on its own when the length of the wait is unknown.
 * @overview
 * <p><code>value</code> runs from 0 to <code>max</code> (default 100) and is clamped into that
 * range. The visible <code>label</code> names the bar through <code>aria-labelledby</code>; without
 * one, an <code>aria-label</code> on the element names it, else it is named "Loading". Use <code>indeterminate</code> when the amount of work is not
 * known.</p>
 * @tags display
 *
 * @example
 * ```html
 * <wc-linear-progress value="30" label="Uploading" style="width:10rem"></wc-linear-progress>
 * <wc-linear-progress value="3" max="8" label="Step 3 of 8"></wc-linear-progress>
 * ```
 */
export declare class LinearProgress extends BaseProgress {
    static styles: import("lit").CSSResultGroup[];
    render(): import("lit-html").TemplateResult<1>;
}

import { BaseProgress } from '../base-progress.js';
/**
 * @label Linear Progress
 * @tag wc-linear-progress
 * @rawTag linear-progress
 * @summary A linear progress indicator is a visual representation of progress toward a specific goal.
 * @tags display
 *
 * @example
 * ```html
 * <wc-linear-progress value="30" style="width:10rem"></wc-linear-progress>
 * ```
 */
export declare class LinearProgress extends BaseProgress {
    static styles: import("lit").CSSResultGroup[];
    render(): import("lit-html").TemplateResult<1>;
}

import { BaseProgress } from '../base-progress.js';
/**
 * @label Circular Progress
 * @tag wc-circular-progress
 * @rawTag circular-progress
 * @summary A circular progress indicator is a visual representation of progress toward a specific goal.
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

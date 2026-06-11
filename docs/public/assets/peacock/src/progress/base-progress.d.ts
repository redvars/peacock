import { LitElement } from 'lit';
export declare class BaseProgress extends LitElement {
    /** The current value. */
    value?: number;
    indeterminate: boolean;
    /** A label describing the progress bar. */
    label?: string;
    helperText?: string;
    inline: boolean;
    __getPercentageValue(): number;
}

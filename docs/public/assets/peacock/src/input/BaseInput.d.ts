import { LitElement } from 'lit';
export default abstract class BaseInput extends LitElement {
    value?: any;
    disabled: boolean;
    readonly: boolean;
    required: boolean;
    skeleton: boolean;
}

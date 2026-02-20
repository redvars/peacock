import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';

export default abstract class BaseInput extends LitElement {
  @property({ type: String })
  value = '';

  @property({ type: Boolean, reflect: true })
  disabled: boolean = false;

  @property({ type: Boolean, reflect: true })
  readonly: boolean = false;

  @property({ type: Boolean, reflect: true })
  required: boolean = false;

  @property({ type: Boolean, reflect: true })
  skeleton = false;
}

import {
  Component,
  ComponentInterface,
  Element,
  h,
  Host,
  Prop,
} from '@stencil/core';

/**
 * @label Form Control
 * @name form-control
 * @description The Form Control component adds a label and caption for its child control.
 * @category Form Inputs
 * @tags form
 * @example <pc-form-control label='Full Name' required>
 *   <pc-input type='text'></pc-input>
 * </pc-form-control>
 */
@Component({
  tag: 'pc-form-control',
  styleUrl: 'form-control.scss',
  shadow: true,
})
export class FormControl implements ComponentInterface {
  @Prop() label: string;

  @Prop() helperText: string;

  @Prop() invalid: boolean = false;

  @Prop() invalidText: string;

  @Prop() warn: boolean = false;

  @Prop() warnText: string;

  @Prop({ reflect: true }) inline: boolean = false;

  @Prop() skeleton: boolean = false;

  /**
   * Whether the form control is required.
   */
  @Prop() required: boolean = false;

  @Element() elm!: HTMLElement;

  componentDidLoad() {
    this.elm.setAttribute('role', 'group');
    const controlElm = this.getInputElement();
    this.passRequiredToField(controlElm, this.required);
    this.passLabelToField(controlElm, this.label);
  }

  getInputElement() {
    for (const compName of [
      'pc-input',
      'goat-textarea',
      'goat-select',
      'goat-checkbox',
      'goat-radio',
      'pc-code-editor',
    ]) {
      const controlElm = this.elm.querySelector(`${compName}`);
      if (controlElm) return controlElm;
    }
  }

  passRequiredToField(controlElm: Element, required: boolean) {
    if (controlElm) {
      // @ts-ignore
      controlElm.required = required;
    }
  }

  passLabelToField(controlElm: Element, label: string) {
    if (controlElm) {
      // @ts-ignore
      const oldProps = controlElm.configAria;
      // @ts-ignore
      controlElm.configAria = {
        'aria-label': label,
        ...oldProps,
      };
    }
  }

  componentShouldUpdate(
    newVal: any,
    _oldVal,
    propName: string,
  ): boolean | void {
    if (propName === 'required') {
      this.passRequiredToField(this.getInputElement(), newVal);
    } else if (propName === 'label') {
      this.passLabelToField(this.getInputElement(), newVal);
    }
  }

  renderHelper() {
    if (this.invalid)
      return <div class="helper invalid">{this.invalidText}</div>;
    else if (this.warn) return <div class="helper warn">{this.warnText}</div>;
    else if (this.helperText || this.helperText === '')
      return <div class="helper text">{this.helperText}</div>;
  }

  getLabel() {
    if (this.skeleton) return <div class="label skeleton" />;
    else {
      return (
        <label class="label">
          {this.required && <span class="required">*</span>}
          {this.label}
        </label>
      );
    }
  }

  render() {
    return (
      <Host invalid={this.invalid} warn={this.warn}>
        <div class={{ 'form-control': true, 'inline': this.inline }}>
          {this.label && this.getLabel()}
          <div class="field">
            <slot />
          </div>
          {this.renderHelper()}
        </div>
      </Host>
    );
  }
}

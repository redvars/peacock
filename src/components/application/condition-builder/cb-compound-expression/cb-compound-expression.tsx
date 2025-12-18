import { Component, Element, h, Host, Prop } from '@stencil/core';

@Component({
  tag: 'goat-cb-compound-expression',
  styleUrl: 'cb-compound-expression.scss',
  shadow: true,
})
export class CbCompoundExpression {
  @Prop() conditionOperator: 'and' | 'or';

  @Prop() fieldName: string = '';
  @Prop() fieldLabel: string = '';

  @Element() elm!: HTMLElement;

  componentDidRender() {
    const elm: HTMLElement = this.elm.shadowRoot.querySelector('.slot-end');
    const conditionOperatorElm: HTMLElement = this.elm.shadowRoot.querySelector(
      '.field-name-container',
    );
    setTimeout(() => {
      if (elm)
        elm.style.paddingInlineStart =
          conditionOperatorElm.getBoundingClientRect().width + 'px';
    }, 0);
  }

  render() {
    return (
      <Host>
        <div class="compound-expression" field-name={this.fieldName}>
          <div class="field-name-container">
            <span class={'text-label-medium'}>{this.fieldLabel}</span>
            <div class="field-compound-type">
              {(() => {
                if (this.conditionOperator)
                  return (
                    <goat-cb-divider connect-end={true}>
                      <goat-tag color={'warning'}>
                        {this.conditionOperator}
                      </goat-tag>
                    </goat-cb-divider>
                  );
              })()}
            </div>
          </div>
          <div class="conditions">
            <slot />
          </div>
        </div>

        <div class="slot-end">
          <slot name={'end'} />
        </div>
      </Host>
    );
  }
}

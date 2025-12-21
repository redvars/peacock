import { Component, Element, h, Host, Prop } from '@stencil/core';

@Component({
  tag: 'goat-cb-predicate',
  styleUrl: 'cb-predicate.scss',
  shadow: true,
})
export class CbPredicate {
  @Prop() conditionOperator: 'and' | 'or';

  @Prop() vertical: boolean = false;

  renderHorizontal() {
    return (
      <Host>
        <div class="predicate">
          <div class="predicate-body">
            <slot />
          </div>

          {(() => {
            if (this.conditionOperator) {
              return (
                <goat-cb-divider
                  vertical={true}
                  class="predicate-condition-operator"
                >
                  <pc-tag color={'warning'}>{this.conditionOperator}</pc-tag>
                </goat-cb-divider>
              );
            }
          })()}
        </div>
      </Host>
    );
  }

  @Element() elm!: HTMLElement;

  componentDidRender() {
    const elm: HTMLElement = this.elm.shadowRoot.querySelector('.slot-end');
    const conditionOperatorElm: HTMLElement = this.elm.shadowRoot.querySelector(
      '.predicate-condition-operator',
    );
    setTimeout(() => {
      if (elm)
        elm.style.paddingInlineStart =
          conditionOperatorElm.getBoundingClientRect().width + 'px';
    }, 0);
  }

  renderVertical() {
    return (
      <Host>
        <div class="predicate vertical">
          {(() => {
            if (this.conditionOperator) {
              return (
                <div class="predicate-condition-operator">
                  <goat-cb-divider connect-start={true} connect-end={true}>
                    <pc-tag color={'success'}>{this.conditionOperator}</pc-tag>
                  </goat-cb-divider>
                </div>
              );
            }
          })()}

          <div class="predicate-body">
            <slot />
          </div>
        </div>
        <div class="slot-end">
          <slot name={'end'} />
        </div>
      </Host>
    );
  }

  render() {
    if (this.vertical) return this.renderVertical();
    else return this.renderHorizontal();
  }
}

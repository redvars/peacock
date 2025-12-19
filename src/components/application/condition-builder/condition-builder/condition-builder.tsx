import { Component, h, Host, Prop } from '@stencil/core';

/**
 * @name Condition Builder
 * @description A condition builder is a component that allows users to build a condition using a set of rules.
 * @category Up coming
 * @tag content
 * @img /assets/img/condition-builder.webp
 */
@Component({
  tag: 'goat-condition-builder',
  styleUrl: 'condition-builder.scss',
  shadow: true,
})
export class ConditionBuilder {
  @Prop() content: string;

  renderHeader() {
    return (
      <div class="condition-builder__header">
        <slot name="header" />
      </div>
    );
  }

  renderCondition() {
    return (
      <div class="condition-builder__condition">
        <goat-select
          inline
          placeholder="Select Operator"
          items={[
            {
              label: 'Less than',
              value: 'new',
              icon: 'file-earmark',
            },
            {
              label: 'More than',
              value: 'save',
              icon: 'person-circle',
            },
            {
              label: 'Save As',
              value: 'save-as',
              icon: 'person-fill',
            },
            {
              label: 'Nadine Brooks',
              value: 'nadine',
              icon: 'person-check-fill',
            },
            {
              label: 'Laura Ballard',
              value: 'laura',
              icon: 'file-earmark-person',
            },
          ]}
        />

        <goat-input inline placeholder="Select Value" />
      </div>
    );
  }

  renderConditions() {
    return (
      <div class="condition-builder__compound_conditions">
        <div class="field-name-container">
          <span class={'pc-text-body inline'}>Field name</span>
          <div class="field-compound-type">
            <goat-cb-divider connect-end={true}>
              <goat-tag color={'warning'}>{'or'}</goat-tag>
            </goat-cb-divider>
          </div>
        </div>

        <div class="conditions">
          {this.renderCondition()}
          {this.renderCondition()}
        </div>
      </div>
    );
  }

  renderCompound() {
    return (
      <div class="condition-builder__compound">
        <div class="compound-type">
          <goat-cb-divider connect-start={true} connect-end={true}>
            <goat-tag color={'success'}>{'and'}</goat-tag>
          </goat-cb-divider>
        </div>

        <div class="compound-body">
          {this.renderConditions()}
          {this.renderConditions()}
        </div>
      </div>
    );
  }

  renderPredicates() {
    return (
      <div class="condition-builder__predicates">
        <div class={`condition-builder__predicate`}>
          {this.renderCompound()}
        </div>
        <goat-cb-divider vertical={true} class="predicate-divider">
          <goat-tag color={'warning'}>{'or'}</goat-tag>
        </goat-cb-divider>
        <div class={`condition-builder__predicate`}>
          {this.renderCompound()}
        </div>
      </div>
    );
  }

  render() {
    return (
      <Host>
        <div class="condition-builder">
          <slot />
        </div>
      </Host>
    );
  }
}

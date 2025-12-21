import { Component, Element, h, Host, Listen, Prop } from '@stencil/core';

/**
 * @label Tooltip
 * @name tooltip
 * @description The Tooltip component is used to display additional information on hover.
 * @category Informational
 * @tag content
 * @img /assets/img/tooltip.webp
 * @imgDark /assets/img/tooltip-dark.webp
 */
@Component({
  tag: 'goat-tooltip',
  styleUrl: 'tooltip.scss',
  shadow: true,
})
export class Tooltip {
  @Element() elm!: HTMLElement;

  /**
   * The placement of the popover relative to the trigger element.
   * Possible values are:
   * - `"top"`: The popover is placed above the trigger element.
   * - `"right"`: The popover is placed to the right of the trigger element.
   * - `"bottom"`: The popover is placed below the trigger element.
   * - `"left"`: The popover is placed to the left of the trigger element.
   */
  @Prop() placements: string = 'top,bottom,right,left';

  /**
   * If true, the tooltip will be managed by the parent component.
   */
  @Prop({ reflect: true }) trigger: 'hover' | 'manual' = 'hover';

  /**
   * The content of the tooltip.
   */
  @Prop({ mutable: true }) content: string = '';

  targetElm: HTMLElement;

  @Listen('mouseover', { target: 'window' })
  windowMouseOver(evt) {
    const path = evt.path || evt.composedPath();
    for (const elm of path) {
      if (elm == this.elm) return;
    }
    let target: HTMLElement;
    for (const elm of path) {
      if (
        elm.hasAttribute &&
        elm.hasAttribute('tooltip-target') &&
        elm.getAttribute('tooltip-target') == this.elm.getAttribute('id')
      )
        target = elm;
    }

    if (target && this.targetElm != target) {
      this.targetElm = target;
      if (target.hasAttribute('tooltip-content'))
        this.content = target.getAttribute('tooltip-content');
      this.popoverElm.show(target);
    }
  }

  popoverElm: any;

  render() {
    return (
      <Host>
        <goat-popover
          class="popover"
          trigger={this.trigger}
          placements={this.placements}
          tip="caret"
          ref={elm => (this.popoverElm = elm)}
        >
          <slot />

          <goat-popover-content class="tooltip-content">
            {this.content}
            <slot name="content"></slot>
          </goat-popover-content>
        </goat-popover>
      </Host>
    );
  }
}

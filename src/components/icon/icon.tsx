import { Component, h, Host, Prop, Watch } from '@stencil/core';
import { fetchIcon } from './datasource';
import { getSVGHTMLElement } from '../../utils/utils';

/**
 * @label Icon
 * @name icon
 * @description Icons are visual symbols used to represent ideas, objects, or actions.
 * @overview Icons are visual symbols used to represent ideas, objects, or actions. They communicate messages at a glance, afford interactivity, and draw attention to important information.
 * @category General
 * @example <pc-icon name="home" size="2rem"></pc-icon>
 */
@Component({
  tag: 'pc-icon',
  styleUrl: 'icon.scss',
  shadow: true,
})
export class Icon {
  /**
   * The identifier for the icon.
   * This name corresponds to a specific SVG asset in the icon set.
   */
  @Prop() name: string;

  private iconElm?: HTMLElement;

  @Watch('name')
  handleNameChange(newValue: string) {
    this.fetchSvg(newValue);
  }

  async fetchSvg(name: string) {
    if (name) {
      const svgXml = await fetchIcon(name);
      this.iconElm.replaceChildren();
      const svgElement = getSVGHTMLElement(svgXml);
      if (svgElement) {
        this.iconElm.appendChild(svgElement);
      }
    } else {
      this.iconElm.replaceChildren();
    }
  }

  componentWillLoad() {
    this.fetchSvg(this.name);
  }

  render() {
    return (
      <Host>
        <div ref={elm => (this.iconElm = elm)} class="icon"></div>
      </Host>
    );
  }
}

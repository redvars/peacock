import { Component, h, Host, Prop, State, Watch } from '@stencil/core';
import { fetchIcon } from './datasource';
import { getSVGHTMLString } from '../../utils/utils';

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
  @Prop({ reflect: true }) name: string;

  @State() svg: string;

  @Watch('name')
  async handleNameChange(newValue: string) {
    await this.fetchSvg(newValue);
  }

  async fetchSvg(name: string) {
    if (this.name) {
      const svgXml = await fetchIcon(name);
      this.svg = getSVGHTMLString(svgXml);
    } else {
      this.svg = '';
    }
  }

  async componentWillLoad() {
    this.fetchSvg(this.name);
  }

  render() {
    return (
      <Host>
        <div innerHTML={this.svg} class="icon"></div>
      </Host>
    );
  }
}

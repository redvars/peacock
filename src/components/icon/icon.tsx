import { Component, h, Host, Prop, Watch } from '@stencil/core';
import { fetchIcon, fetchSVG } from './datasource';
import { getSVGHTMLElement } from '../../utils/utils';

@Component({
  tag: 'pc-icon',
  styleUrl: 'icon.scss',
  shadow: true,
})
export class Icon {
  @Prop({ reflect: true }) name?: string;

  @Prop({ reflect: true }) src?: string;

  private iconElm?: HTMLElement;

  @Watch('name')
  handleNameChange() {
    this.fetchSvg();
  }

  async fetchSvg() {
    if (this.name) {
      const svgXml = await fetchIcon(this.name);
      this.iconElm.replaceChildren();
      const svgElement = getSVGHTMLElement(svgXml);
      if (svgElement) {
        this.iconElm.appendChild(svgElement);
      }
    } else if (this.src) {
      const svgXml = await fetchSVG(this.src);
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
    this.fetchSvg();
  }

  render() {
    return (
      <Host>
        <div ref={elm => (this.iconElm = elm)} class="icon"></div>
      </Host>
    );
  }
}

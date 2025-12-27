import { html, css, LitElement } from 'lit';
import { property, state } from 'lit/decorators.js';
import { unsafeSVG } from 'lit-html/directives/unsafe-svg.js';
import * as sqlite from 'node:sqlite';
import { fetchIcon, fetchSVG } from './datasource.js';

/**
 * Icons are visual symbols used to represent ideas, objects, or actions.
 *
 * @element pc-icon
 * @cssprop --counter-color - Controls the color of the count display.
 */
export class Icon extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      line-height: 0;
      --icon-size: inherit;
      --icon-color: inherit;
    }

    .icon {
      display: inline-block;
      height: var(--icon-size, 1rem);
      width: var(--icon-size, 1rem);

      svg {
        fill: var(--icon-color);
        height: 100%;
        width: 100%;
      }
    }
  `;

  @property({ type: String }) name? = 'home';

  @property({ type: String }) src? = '';

  @state()
  private svgContent: string = '';

  async fetchSvg() {
    if (this.name) {
      const value = await fetchIcon(this.name);
      debugger;
      this.svgContent = value;
    } else if (this.src) {
      this.svgContent = await fetchSVG(this.src);
    } else {
      this.svgContent = '';
    }
  }

  constructor() {
    super();
    this.fetchSvg();
  }

  hasChanged() {
    console.log('has changed');
  }

  render() {
    return html` <div class="icon">${unsafeSVG(this.svgContent)}</div> `;
  }
}

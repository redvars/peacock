import {
  Component,
  ComponentInterface,
  Element,
  h,
  Host,
  Prop,
} from '@stencil/core';

/**
 * @name Text
 * @description Typography are used for rendering headlines, paragraphs and captions.
 * @category General
 * @example <goat-text type="heading" level="1">Heading</goat-text>
 */
@Component({
  tag: 'goat-text',
  styleUrl: 'text.scss',
  shadow: true,
})
export class Text implements ComponentInterface {
  @Prop({ reflect: true }) type:
    | 'code'
    | 'helper-text'
    | 'label'
    | 'legal'
    | 'heading'
    | 'body'
    | 'body-compact'
    | 'heading-compact'
    | 'fluid-heading' = 'body';

  @Prop({ reflect: true }) expressive: boolean = false;

  @Prop({ reflect: true }) headingSize: 1 | 2 | 3 | 4 | 5 | 6 | 7;

  @Prop({ reflect: true }) headingLevel: 1 | 2 | 3 | 4 | 5 | 6;

  @Prop({ reflect: true }) inline: boolean = false;

  @Prop({ reflect: true, mutable: true }) configAria: any = {};

  @Prop({ reflect: true }) color:
    | 'primary'
    | 'secondary'
    | 'tertiary'
    | 'helper'
    | 'error'
    | 'on-color'
    | 'inverse' = 'primary';

  @Element() elm!: HTMLElement;

  componentWillLoad() {
    // If the goat-text has a tabindex attribute we get the value
    // and pass it down to the native input, then remove it from the
    // goat-text to avoid causing tabbing twice on the same element
    this.elm.getAttributeNames().forEach((name: string) => {
      if (name.includes('aria-')) {
        this.configAria[name] = this.elm.getAttribute(name);
        this.elm.removeAttribute(name);
      }
    });
  }

  #getHeadingSize() {
    let headingSize = this.headingSize;
    if (!headingSize) {
      if (this.type == 'fluid-heading') {
        headingSize = 6;
      } else {
        headingSize = 7;
      }
    }
    return headingSize;
  }

  render() {
    return (
      <Host>
        <div
          class={{
            text: true,
            inline: this.inline,
            expressive: this.expressive,
            [`heading-size-${this.#getHeadingSize()}`]: true,
          }}
        >
          {this.renderText()}
        </div>
      </Host>
    );
  }

  renderText() {
    if (this.type == 'heading') return this.renderHeading();
    else return this.renderSimpleText();
  }

  renderSimpleText() {
    if (this.inline) {
      return (
        <span class="native-element" {...this.configAria}>
          <slot />
        </span>
      );
    } else {
      return (
        <p class="native-element" {...this.configAria}>
          <slot />
        </p>
      );
    }
  }

  renderHeading() {
    let headingLevel = this.headingLevel;
    if (!headingLevel) {
      switch (this.#getHeadingSize()) {
        case 7:
        case 6:
          headingLevel = 1;
          break;
        case 5:
          headingLevel = 2;
          break;
        case 4:
          headingLevel = 3;
          break;
        case 3:
          headingLevel = 4;
          break;
        case 2:
          headingLevel = 5;
          break;
        default:
          headingLevel = 6;
      }
    }

    const Heading = `h${headingLevel}`;
    return (
      <Heading class="native-element" {...this.configAria}>
        <slot />
      </Heading>
    );
  }
}

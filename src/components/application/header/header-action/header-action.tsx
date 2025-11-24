import { Component, Element, h, Method, Prop, State } from '@stencil/core';

@Component({
  tag: 'goat-header-action',
  styleUrl: 'header-action.scss',
  shadow: true,
})
export class HeaderAction {
  /**
   * Button size.
   * Possible values are `"sm"`, `"md"`, `"lg"`, `"xl"`, `"xxl"`, `"none"`. Defaults to `"md"`.
   */
  @Prop() size: 'sm' | 'md' | 'lg' | 'xl' | 'xxl' | 'none' = 'md';

  /**
   * Icon which will displayed on button.
   * Possible values are icon names.
   */
  @Prop() icon: string;

  /**
   * Sets or retrieves the window or frame at which to target content.
   */
  @Prop() target: string = '_self';

  @Prop() badge: string = '_self';

  /**
   * Hyperlink to navigate to on click.
   */
  @Prop({ reflect: true }) href: string;

  @Prop({ reflect: true, mutable: true }) configAria: any = {};

  /*
   * @internal
   */
  @Method()
  async setColor(color: string) {
    this.color = color;
  }

  @Element() elm!: HTMLElement;

  @State() slotHasContent = false;

  @State() color: any;

  componentWillLoad() {
    this.slotHasContent = this.elm.hasChildNodes();
    if (this.elm.getAttributeNames)
      this.elm.getAttributeNames().forEach((name: string) => {
        if (name.includes('aria-')) {
          this.configAria[name] = this.elm.getAttribute(name);
          this.elm.removeAttribute(name);
        }
      });
  }

  render() {
    return (
      <goat-button
        class="header-action"
        color={this.color}
        icon={this.icon}
        href={this.href}
        configAria={this.configAria}
        target={this.target}
      >
        {this.slotHasContent && <slot></slot>}
      </goat-button>
    );
  }
}

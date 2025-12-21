import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Listen,
  Method,
  Prop,
  State,
} from '@stencil/core';
import { getComponentIndex } from '../../../utils/utils';

/**
 * @label Tree Node
 * @name tree-node
 * @description A tree node is a hierarchical structure that provides nested levels of navigation.
 * @category Navigation
 * @subcategory Tree View
 * @childComponent true
 * @img /assets/img/tree-view.webp
 * @imgDark /assets/img/tree-view-dark.webp
 */
@Component({
  tag: 'pc-tree-node',
  styleUrl: 'tree-node.scss',
  shadow: true,
})
export class TreeNode implements ComponentInterface {
  gid: string = getComponentIndex();

  private nativeElement?: HTMLElement;

  private tabindex?: string | number = 1;

  /**
   * The menu item value.
   */
  @Prop({ mutable: true }) value?: string | number | null;

  @Prop({ mutable: true }) label: string = '';

  /**
   * Icon which will displayed on button.
   * Possible values are icon names.
   */
  @Prop() icon: string;

  /**
   * Hyperlink to navigate to on click.
   */
  @Prop({ reflect: true }) href: string;

  /**
   * Sets or retrieves the window or frame at which to target content.
   */
  @Prop() target: string = '_self';

  /**
   * If true, the user cannot interact with the button. Defaults to `false`.
   */
  @Prop({ reflect: true }) disabled: boolean = false;

  /**
   * Menu item selection state.
   */
  @Prop({ reflect: true, mutable: true }) selected: boolean;

  @Prop({ reflect: true, mutable: true }) expanded: boolean = true;

  @Prop({ reflect: true }) level: number = 0;

  /**
   * Emitted when the menu item is clicked.
   */
  @Event({ eventName: 'pc-tree-node--click' })
  goatTreeNodeClick: EventEmitter;

  @State() hasChildNodes = false;

  /**
   * Sets focus on the native `input` in `pc-input`. Use this method instead of the global
   * `input.focus()`.
   */
  @Method()
  async setFocus() {
    if (this.nativeElement) {
      this.nativeElement.focus();
    }
  }

  /**
   * Sets blur on the native `input` in `pc-input`. Use this method instead of the global
   * `input.blur()`.
   */
  @Method()
  async setBlur() {
    if (this.nativeElement) {
      this.nativeElement.blur();
    }
  }

  @Listen('mouseup', { target: 'window' })
  windowMouseUp() {
    if (this.isActive) this.isActive = false;
  }

  @Listen('keyup', { target: 'window' })
  windowKeyUp(evt) {
    if (this.isActive && evt.key == ' ') this.isActive = false;
  }

  @State() hasFocus = false;
  @State() isActive = false;
  @Element() elm!: HTMLElement;

  handleClick = () => {
    this.goatTreeNodeClick.emit({
      value: this.value || this.label,
      expand: this.expanded,
      id: this.gid,
    });
  };

  private clickHandler = event => {
    if (!this.disabled) {
      this.expanded = !this.expanded;
      this.handleClick();
    } else {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
  };

  private blurHandler = () => {
    this.hasFocus = false;
  };

  private focusHandler = () => {
    this.hasFocus = true;
  };

  private mouseDownHandler = () => {
    this.isActive = true;
  };

  isSelected(selectedNode: string) {
    if (this.value === undefined && this.label === undefined) return false;
    else if (this.value === undefined) return selectedNode === this.label;
    else return selectedNode === this.value;
  }

  private keyDownHandler = evt => {
    if (evt.key == ' ' || evt.key == 'Enter') {
      if (this.hasChildNodes) {
        evt.preventDefault();
        this.clickHandler(evt);
      } else if (!this.href) {
        evt.preventDefault();
        this.isActive = true;
        this.handleClick();
      } else {
        evt.preventDefault();
        this.isActive = true;
        this.handleClick();
        window.open(this.href, this.target);
      }
    } else if (evt.key === 'ArrowLeft') {
      evt.preventDefault();
      this.expanded = false;
    } else if (evt.key === 'ArrowRight') {
      evt.preventDefault();
      if (this.expanded && this.hasChildNodes) {
        const childNodes = this.elm.querySelectorAll('pc-tree-node');
        if (childNodes.length) {
          const firstChild = childNodes[0] as any;
          firstChild.setFocus();
        }
      } else {
        this.expanded = true;
      }
    }
  };

  componentWillLoad() {
    // If the ion-input has a tabindex attribute we get the value
    // and pass it down to the native input, then remove it from the
    // pc-input to avoid causing tabbing twice on the same element
    if (this.elm.hasAttribute('tabindex')) {
      const tabindex = this.elm.getAttribute('tabindex');
      this.tabindex = tabindex !== null ? tabindex : undefined;
      this.elm.removeAttribute('tabindex');
    }

    const treeView = this.elm.closest('pc-tree-view');

    // @ts-ignore
    treeView.getSelectedNode().then((selectedNode: string) => {
      this.selected = this.isSelected(selectedNode);
    });

    // @ts-ignore
    treeView.subscribeToSelect((selectedNode: string) => {
      this.selected = this.isSelected(selectedNode);
    });

    const childNodes = this.elm.querySelectorAll('pc-tree-node');
    this.hasChildNodes = !!childNodes.length;
    childNodes.forEach((node: any) => {
      node.level = this.level + 1;
    });
  }

  #getNativeElementTagName() {
    if (this.href) return 'a';
    else return 'div';
  }

  render = () => {
    const NativeElementTag = this.#getNativeElementTagName();
    const styles = {
      paddingInlineStart: `calc(${this.level + 1}rem - 0.125rem)`,
    };

    return (
      <Host active={this.isActive} has-focus={this.hasFocus}>
        <div class="tree-node">
          <NativeElementTag
            class={{
              'tree-node-content': true,
              'selected': this.selected,
              'active': this.isActive,
              'disabled': this.disabled,
              'has-focus': this.hasFocus,
            }}
            style={styles}
            href={this.href}
            target={this.target}
            onClick={this.clickHandler}
            onMouseDown={this.mouseDownHandler}
            onKeyDown={this.keyDownHandler}
            aria-disabled={this.disabled}
            onBlur={this.blurHandler}
            onFocus={this.focusHandler}
            tabindex={this.tabindex}
            ref={el => (this.nativeElement = el as HTMLElement)}
          >
            {this.hasChildNodes && (
              <pc-icon
                name="arrow_right"
                class={{ 'expand-icon': true, 'expanded': this.expanded }}
              />
            )}

            {!this.hasChildNodes && <div class="icon-space" />}

            {this.icon && <pc-icon name={this.icon} class={'icon'} />}

            <span class="tree-node-label">{this.label}</span>
          </NativeElementTag>

          <div
            class={{
              'node-slot': true,
              'expanded': this.expanded,
            }}
          >
            <slot></slot>
          </div>
        </div>
      </Host>
    );
  };
}

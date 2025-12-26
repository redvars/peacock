import {
  Component,
  ComponentInterface,
  Element,
  h,
  Listen,
  Method,
  Prop,
} from '@stencil/core';

/**
 * @label Menu
 * @name menu
 * @description Menus display a list of choices on temporary surfaces.
 * @category Navigation
 * @subcategory Menu
 * @img /assets/img/menu.webp
 * @imgDark /assets/img/menu-dark.webp
 */
@Component({
  tag: 'pc-menu',
  styleUrl: 'menu.scss',
  shadow: true,
})
export class Menu implements ComponentInterface {
  @Element() host!: HTMLElement;

  @Prop() showLoader: boolean = false;

  @Prop({ mutable: true }) value?: string | number;

  /**
   * The menu item size.
   * Possible values are: `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
   */
  @Prop({ reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';

  @Prop({ reflect: true }) layer?: 'background' | '01' | '02';

  @Prop({ mutable: true }) empty: boolean = false;

  @Prop({ mutable: true }) emptyStateHeadline: string = 'No items';

  @Prop({ mutable: true }) emptyStateDescription: string =
    'There are no items to display';

  @Listen('keydown', { target: 'window' })
  handleKeyDown(evt: KeyboardEvent) {
    const path = evt.composedPath();
    let menuItem = null;
    for (const elm of path) {
      // @ts-ignore
      if (elm.tagName === 'PC-MENU-ITEM') {
        menuItem = elm;
      }
      if (elm !== this.host) continue;
      if (evt.key === 'ArrowDown') {
        evt.preventDefault();
        this.focusNextItem(menuItem);
      } else if (evt.key === 'ArrowUp') {
        evt.preventDefault();
        this.focusPreviousItem(menuItem);
      }
    }
  }

  /**
   * Sets focus on first menu item. Use this method instead of the global
   * `element.focus()`.
   */
  @Method()
  async setFocus() {
    const firstMenuItem = this.getFirstItem();
    firstMenuItem?.setFocus();
  }

  getFirstItem() {
    let firstItem: any = this.host.querySelector('pc-menu-item');
    if (!firstItem) {
      if (
        this.host.childNodes.length &&
        this.host.childNodes[0].nodeName === 'SLOT'
      ) {
        const assignedElements = (
          this.host.childNodes[0] as HTMLSlotElement
        ).assignedElements();
        for (let i = 0; i < assignedElements.length; i++) {
          const item = assignedElements[i] as HTMLElement;
          if (item.tagName === 'PC-MENU-ITEM') {
            firstItem = item;
            break;
          }
        }

        if (!firstItem) {
          throw new Error('menu: No menu items found');
        }
      }
    }
    return firstItem;
  }

  getLastItem() {
    let lastItem: any = this.host.querySelector('pc-menu-item:last-child');
    if (!lastItem) {
      if (
        this.host.childNodes.length &&
        this.host.childNodes[0].nodeName === 'SLOT'
      ) {
        const assignedElements = (
          this.host.childNodes[0] as HTMLSlotElement
        ).assignedElements();
        for (let i = assignedElements.length - 1; i >= 0; i--) {
          const item = assignedElements[i] as HTMLElement;
          if (item.tagName === 'PC-MENU-ITEM') {
            lastItem = item;
            break;
          }
        }

        if (!lastItem) {
          throw new Error('pc-menu: No menu items found');
        }
      }
    }
    return lastItem;
  }

  focusNextItem(currentItem: HTMLElement) {
    let nextItem: any = currentItem.nextElementSibling;
    do {
      if (
        nextItem &&
        nextItem.tagName === 'PC-MENU-ITEM' &&
        !nextItem.disabled
      ) {
        nextItem.setFocus();
        return;
      }
      if (!nextItem) {
        nextItem = this.getFirstItem();
      } else {
        nextItem = nextItem.nextElementSibling;
      }
    } while (nextItem !== currentItem);
  }

  private focusPreviousItem(currentItem: HTMLElement) {
    let previousItem: any = currentItem.previousElementSibling;
    do {
      if (
        previousItem &&
        previousItem.tagName === 'PC-MENU-ITEM' &&
        !previousItem.disabled
      ) {
        previousItem.setFocus();
        return;
      }
      if (!previousItem) {
        previousItem = this.getLastItem();
      } else {
        previousItem = previousItem.previousElementSibling;
      }
    } while (previousItem !== currentItem);
  }

  render() {
    return (
      <div class="menu">
        <div class="slot-container">
          <slot />
        </div>

        {this.renderEmptyState()}
      </div>
    );
  }

  private renderEmptyState() {
    if (this.empty)
      return (
        <pc-empty-state
          class="empty-menu"
          headline={this.emptyStateHeadline}
          description={this.emptyStateDescription}
        />
      );
  }
}

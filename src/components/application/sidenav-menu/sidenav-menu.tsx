import {
  Component,
  ComponentInterface,
  Element,
  h,
  Listen,
  Method,
  Prop,
  State,
  Watch,
} from '@stencil/core';

@Component({
  tag: 'goat-sidenav-menu',
  styleUrl: 'sidenav-menu.scss',
  shadow: true,
})
export class SidenavMenu implements ComponentInterface {
  @Element() elm!: HTMLElement;

  @Prop() showLoader: boolean = false;

  @Prop({ mutable: true }) value?: string | number;

  @Prop({ mutable: true }) empty: boolean = false;

  @Prop({ mutable: true }) emptyState: any = `{
    "headline": "No items",
    "description": "There are no items to display"
  }`;

  @State()
  internalEmptyState: { title: string; description: string };

  @Watch('emptyState')
  parseEmptyState() {
    if (this.emptyState) {
      this.internalEmptyState = JSON.parse(this.emptyState);
    } else {
      this.internalEmptyState = this.emptyState;
    }
  }

  @Listen('keydown', { target: 'window' })
  handleKeyDown(evt: KeyboardEvent) {
    const path = evt.composedPath();
    let menuItem = null;
    for (const elm of path) {
      // @ts-ignore
      if (elm.tagName === 'PC-MENU-ITEM') {
        menuItem = elm;
      }
      if (elm !== this.elm) continue;
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

  private getFirstItem() {
    return this.elm.querySelector('pc-menu-item');
  }

  private focusNextItem(currentItem) {
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
        nextItem = this.elm.querySelector('pc-menu-item');
      } else {
        nextItem = nextItem.nextElementSibling;
      }
    } while (nextItem !== currentItem);
  }

  private focusPreviousItem(currentItem) {
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
        previousItem = this.elm.querySelector('pc-menu-item:last-child');
      } else {
        previousItem = previousItem.previousElementSibling;
      }
    } while (previousItem !== currentItem);
  }

  componentWillLoad() {
    this.parseEmptyState();
  }

  render() {
    return (
      <div class="menu">
        <slot />
        {this.renderEmptyState()}
      </div>
    );
  }

  private renderEmptyState() {
    if (this.empty)
      return (
        <pc-empty-state class="empty-menu">
          <div slot="title">{this.internalEmptyState.title}</div>
          <div slot="description">{this.internalEmptyState.description}</div>
        </pc-empty-state>
      );
  }
}

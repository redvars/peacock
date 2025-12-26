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
import { PcTreeNodeCustomEvent } from '../../../components';

/**
 * @label Tree View
 * @name tree-view
 * @description A tree view is a hierarchical structure that provides nested levels of navigation.
 * @category Navigation
 * @subcategory Tree View
 * @img /assets/img/tree-view.webp
 * @imgDark /assets/img/tree-view-dark.webp
 */
@Component({
  tag: 'pc-tree-view',
  styleUrl: 'tree-view.scss',
  shadow: true,
})
export class TreeView implements ComponentInterface {
  @Element() elm!: HTMLElement;

  @Prop({ mutable: true }) empty: boolean = false;

  @Prop({ mutable: true }) emptyState: string = `{
    "headline": "No items",
    "description": "There are no items to display"
  }`;

  @State()
  internalEmptyState: any;

  @Prop({ mutable: true })
  selectedNode: string;

  @Watch('emptyState')
  parseEmptyState() {
    if (typeof this.emptyState === 'string') {
      this.internalEmptyState = JSON.parse(this.emptyState);
    } else {
      this.internalEmptyState = this.emptyState;
    }
  }

  @Listen('tree-node--click')
  treeNodeClick(evt: PcTreeNodeCustomEvent<any>) {
    this.selectedNode = evt.detail.value;
    this.subscribers.forEach(cb => cb(evt.detail.value));
  }

  subscribers: any[] = [];

  @Method()
  async getSelectedNode() {
    return this.selectedNode;
  }

  @Method()
  async subscribeToSelect(cb) {
    this.subscribers.push(cb);
  }

  @Listen('keydown', { target: 'window' })
  handleKeyDown(evt: KeyboardEvent) {
    const path = evt.composedPath();
    let menuItem = null;
    for (const elm of path) {
      // @ts-ignore
      if (elm.tagName === 'PC-TREE-NODE') {
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
        nextItem.tagName === 'PC-TREE-NODE' &&
        !nextItem.disabled
      ) {
        nextItem.setFocus();
        return;
      }
      if (!nextItem) {
        nextItem = this.elm.querySelector('pc-tree-node:first-child');
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
        previousItem.tagName === 'PC-TREE-NODE' &&
        !previousItem.disabled
      ) {
        previousItem.setFocus();
        return;
      }
      if (!previousItem) {
        previousItem = this.elm.querySelector('pc-tree-node:last-child');
      } else {
        previousItem = previousItem.previousElementSibling;
      }
    } while (previousItem !== currentItem);
  }

  componentWillLoad() {
    this.parseEmptyState();
  }

  render() {
    if (this.empty) {
      return <div class="tree-view">{this.renderEmptyState()}</div>;
    } else
      return (
        <div class="tree-view">
          <slot></slot>
        </div>
      );
  }

  private renderEmptyState() {
    if (this.empty)
      return <pc-empty-state class="empty-menu" {...this.internalEmptyState} />;
  }
}

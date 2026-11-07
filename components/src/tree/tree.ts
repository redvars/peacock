import { html, LitElement, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import { RovingFocusController } from '@/__internal/controllers/roving-focus-controller.js';
import {
  isTreeItem,
  TreeItem,
  type TreeItemEventDetail,
  type TreeSelection,
} from './tree-item.js';
import styles from './tree.scss';

/** Detail of the tree `change` event; `values` is set with `selection="multiple"`. */
export interface TreeChangeDetail {
  value: string;
  values?: string[];
}

type CheckState = 'true' | 'false' | 'mixed';

/** Attributes of items that change the tree's structure or what it shows. */
const OBSERVED_ATTRIBUTES = [
  'expanded',
  'disabled',
  'value',
  'label',
  'has-children',
  'hidden',
];

/** Elements inside an item that handle their own clicks and keys (slotted actions). */
const INTERACTIVE =
  'a[href], button, input, select, textarea, [contenteditable], wc-button, wc-icon-button, wc-link, wc-checkbox, wc-switch';

/**
 * @label Tree
 * @tag wc-tree
 * @rawTag tree
 *
 * @summary A hierarchy the person expands, navigates and chooses from, such as files or categories.
 * @overview
 * <p>The tree follows the WAI-ARIA tree view pattern: the host has <code>role="tree"</code>
 * (with <code>aria-multiselectable</code> for <code>selection="multiple"</code>), each
 * <code>wc-tree-item</code> has <code>role="treeitem"</code> with <code>aria-level</code>,
 * <code>aria-setsize</code>, <code>aria-posinset</code> and, when it has children,
 * <code>aria-expanded</code>. Nest items to give them children.</p>
 * <p>It is one tab stop. Up and Down move between visible items, Right expands an item or moves
 * to its first child, Left collapses it or moves to its parent (both mirrored in right-to-left),
 * Home and End jump to the first and last item, <code>*</code> expands every sibling, and typing
 * a letter moves to the next item whose label starts with it. Enter or a double-click fires
 * <code>activate</code>, which toggles an item with children unless canceled. Disabled items are
 * skipped.</p>
 * <p><code>selection</code> is <code>none</code> (navigate and activate only),
 * <code>single</code> (the selection follows focus, <code>value</code> is the chosen item) or
 * <code>multiple</code> (each item has a checkbox that Space or a click toggles;
 * <code>value</code> is a comma-separated list, also readable as <code>values</code>). Checking
 * an item checks its descendants, and an item is checked when all its children are and
 * indeterminate when only some are. Disabled items keep their state.</p>
 * <p>For lazy loading, give an item <code>has-children</code> and add its child items when it
 * fires <code>expand</code>; it shows <code>loading</code> until they arrive.</p>
 *
 * @slot - `wc-tree-item` elements.
 *
 * @fires {CustomEvent<{value: string, values?: string[]}>} change - Dispatched when the person changes the selection. `values` is set with `selection="multiple"`.
 * @fires {CustomEvent<{item: TreeItem, value: string}>} expand - Dispatched from an item when the person expands it.
 * @fires {CustomEvent<{item: TreeItem, value: string}>} collapse - Dispatched from an item when the person collapses it.
 * @fires {CustomEvent<{item: TreeItem, value: string}>} activate - Dispatched from an item on Enter or double-click. Cancel it to keep an item with children from toggling.
 *
 * @cssprop --tree-indent - The indentation per level. Defaults to `1.5rem`.
 *
 * @example
 * ```html
 * <wc-tree label="Files" selection="single" value="src/index.ts">
 *   <wc-tree-item value="src" label="src" expanded>
 *     <wc-icon slot="start" name="folder"></wc-icon>
 *     <wc-tree-item value="src/index.ts" label="index.ts"></wc-tree-item>
 *     <wc-tree-item value="src/tree.ts" label="tree.ts"></wc-tree-item>
 *   </wc-tree-item>
 *   <wc-tree-item value="readme" label="README.md"></wc-tree-item>
 * </wc-tree>
 * ```
 *
 * @example
 * ```html
 * <wc-tree label="Permissions" selection="multiple" value="users.read">
 *   <wc-tree-item value="users" label="Users" expanded>
 *     <wc-tree-item value="users.read" label="Read"></wc-tree-item>
 *     <wc-tree-item value="users.write" label="Write"></wc-tree-item>
 *   </wc-tree-item>
 * </wc-tree>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class Tree extends LitElement {
  // ── Static

  static styles = [styles];

  static Item = TreeItem;

  // ── Properties

  /**
   * How the person chooses items: `none` (navigate and activate only), `single` or `multiple`
   * (checkboxes).
   */
  @property({ type: String, reflect: true }) selection: TreeSelection = 'none';

  /**
   * The selected item's value. With `selection="multiple"`, a comma-separated list of the checked
   * items' values (use `values`), so item values must not contain commas.
   */
  @property({ type: String }) value = '';

  /** The accessible name, when no `aria-label` or `aria-labelledby` is set. */
  @property({ type: String }) label = '';

  // ── Private fields

  /** Check state of every item, worked out from `value` in a multi-select tree. */
  private checks = new Map<TreeItem, CheckState>();

  /** Watches the items, so added, removed or changed items update the tree. */
  private observer?: MutationObserver;

  private readonly roving = new RovingFocusController(this, {
    items: () => this.visibleItems,
    orientation: () => 'vertical',
    wrap: () => false,
    // An item's textContent includes its children's labels, so match the label only.
    typeahead: () => true,
    itemText: item => (item as TreeItem).label,
    initialItem: items =>
      items.find(item => (item as TreeItem).selected) ?? items[0],
    isFocusable: item => !(item as TreeItem).disabled,
    onMove: item => this.__followFocus(item as TreeItem),
  });

  // ── Lifecycle

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'tree');
    this.observer = new MutationObserver(() => this.requestUpdate());
    this.observer.observe(this, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: OBSERVED_ATTRIBUTES,
    });
    // Items defined after the tree (lazy loading) are picked up once they upgrade.
    if (!customElements.get('wc-tree-item')) {
      customElements
        .whenDefined('wc-tree-item')
        .then(() => this.requestUpdate());
    }
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.observer?.disconnect();
    this.observer = undefined;
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    this.__computeChecks();
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (changed.has('selection')) {
      if (this.selection === 'multiple') {
        this.setAttribute('aria-multiselectable', 'true');
      } else {
        this.removeAttribute('aria-multiselectable');
      }
    }
    if (changed.has('label')) {
      if (this.label) this.setAttribute('aria-label', this.label);
      else if (changed.get('label')) this.removeAttribute('aria-label');
    }
    this.__syncItems();
    // A value set from outside moves the tab stop to the (first) selected item.
    if (changed.has('value') && !this.matches(':focus-within')) {
      const selected = this.visibleItems.find(
        item => item.selected && !item.disabled,
      );
      if (selected) this.roving.setActive(selected, false);
    }
  }

  // ── Public methods

  /** Every item, in document order, including those inside collapsed items. */
  get items(): TreeItem[] {
    return Array.from(this.querySelectorAll('wc-tree-item')).filter(isTreeItem);
  }

  /** The items the person can see: those whose ancestors are all expanded, in order. */
  get visibleItems(): TreeItem[] {
    const visible: TreeItem[] = [];
    const walk = (items: TreeItem[]) => {
      for (const item of items) {
        if (!item.hidden) {
          visible.push(item);
          if (item.expanded) walk(item.childItems);
        }
      }
    };
    walk(this.__topItems());
    return visible;
  }

  /**
   * The selected values, kept in sync with `value`. In a single-select tree it holds at most one
   * value; in a multi-select tree every checked item, parents included.
   */
  get values(): string[] {
    if (!this.value) return [];
    return this.selection === 'multiple' ? this.value.split(',') : [this.value];
  }

  set values(next: string[]) {
    this.value = (this.selection === 'multiple' ? next : next.slice(0, 1)).join(
      ',',
    );
  }

  override focus(options?: Parameters<HTMLElement['focus']>[0]) {
    this.roving.sync();
    this.roving.activeItem?.focus(options);
  }

  // ── Private methods

  private __topItems(): TreeItem[] {
    return Array.from(this.children).filter(isTreeItem);
  }

  private __parentItem(item: TreeItem): TreeItem | null {
    const parent = item.parentElement;
    return isTreeItem(parent) && this.contains(parent) ? parent : null;
  }

  private __siblings(item: TreeItem): TreeItem[] {
    const parent = this.__parentItem(item);
    return parent ? parent.childItems : this.__topItems();
  }

  /**
   * Multi-select: works out every item's check state from `value` and writes the normalized
   * value back. A listed item checks its enabled descendants; an item with enabled children is
   * checked when all of them are and mixed when some descendants are. Disabled items keep their
   * own state and stop the cascade.
   */
  private __computeChecks() {
    this.checks = new Map();
    if (this.selection !== 'multiple') return;
    const listed = new Set(this.values);

    const visit = (item: TreeItem, forced: boolean): CheckState => {
      const own = listed.has(item.itemValue);
      const top = item.disabled ? own : forced || own;
      const kids = item.childItems;
      const kidStates = kids.map(kid => visit(kid, !item.disabled && top));
      const enabled = kidStates.filter((_, i) => !kids[i].disabled);
      const someChecked = kidStates.some(s => s !== 'false');
      let result: CheckState;
      if (enabled.length === 0) {
        if (top) result = 'true';
        else result = someChecked ? 'mixed' : 'false';
      } else if (enabled.every(s => s === 'true')) {
        result = 'true';
      } else {
        result = someChecked ? 'mixed' : 'false';
      }
      this.checks.set(item, result);
      return result;
    };
    for (const item of this.__topItems()) visit(item, false);

    const known = new Set<string>();
    const checked: string[] = [];
    for (const item of this.items) {
      known.add(item.itemValue);
      if (
        this.checks.get(item) === 'true' &&
        !checked.includes(item.itemValue)
      ) {
        checked.push(item.itemValue);
      }
    }
    // Values of items that are not there yet (children still to load) are kept.
    const unknown = this.values.filter(v => !known.has(v));
    const value = [...checked, ...unknown].join(',');
    if (value !== this.value) this.value = value;
  }

  /** Pushes level, position, selection and loading state onto the items, and the tab stops. */
  private __syncItems() {
    const single = this.selection === 'single';
    const walk = (items: TreeItem[], level: number) => {
      const shown = items.filter(item => !item.hidden);
      shown.forEach((item, index) => {
        /* eslint-disable no-param-reassign */
        item.level = level;
        item.selection = this.selection;
        const check = this.checks.get(item);
        item.selected = single
          ? this.value !== '' && item.itemValue === this.value
          : check === 'true';
        item.indeterminate = check === 'mixed';
        if (item.loading && item.childItems.length > 0) item.loading = false;
        /* eslint-enable no-param-reassign */
        item.setAttribute('aria-level', String(level));
        item.setAttribute('aria-setsize', String(shown.length));
        item.setAttribute('aria-posinset', String(index + 1));
        walk(item.childItems, level + 1);
      });
    };
    walk(this.__topItems(), 1);

    // Items inside collapsed parents leave the Tab order; the controller handles visible ones.
    const visible = new Set(this.visibleItems);
    for (const item of this.items) {
      if (!visible.has(item) && item.tabIndex !== -1) item.tabIndex = -1;
    }
    this.roving.sync();
  }

  private __dispatchItemEvent(
    item: TreeItem,
    type: 'expand' | 'collapse' | 'activate',
  ) {
    const event = new CustomEvent<TreeItemEventDetail>(type, {
      bubbles: true,
      composed: true,
      cancelable: type === 'activate',
      detail: { item, value: item.itemValue },
    });
    return item.dispatchEvent(event);
  }

  /** Expands or collapses `item` for the person, and fires `expand` or `collapse`. */
  private __setExpanded(item: TreeItem, expanded: boolean) {
    if (item.disabled || !item.isBranch || item.expanded === expanded) return;
    /* eslint-disable no-param-reassign */
    item.expanded = expanded;
    if (expanded && item.childItems.length === 0) item.loading = true;
    /* eslint-enable no-param-reassign */
    // Collapsing around the focused item moves focus to the collapsed item.
    const active = this.roving.activeItem;
    if (!expanded && active && active !== item && item.contains(active)) {
      this.roving.setActive(item, this.matches(':focus-within'));
    }
    this.__syncItems();
    this.__dispatchItemEvent(item, expanded ? 'expand' : 'collapse');
  }

  private __activate(item: TreeItem) {
    if (item.disabled) return;
    const proceed = this.__dispatchItemEvent(item, 'activate');
    if (proceed && item.isBranch) this.__setExpanded(item, !item.expanded);
  }

  /** Moves focus to `item`, selecting it in a single-select tree. */
  private __moveTo(item: TreeItem) {
    this.roving.setActive(item);
    this.__followFocus(item);
  }

  private __followFocus(item: TreeItem) {
    if (this.selection === 'single') this.__choose(item);
  }

  /** Single: makes `item` the value. Multiple: toggles its check. Fires `change` when it changed. */
  private __choose(item: TreeItem) {
    if (item.disabled || this.selection === 'none') return;
    if (this.selection === 'single') {
      this.__commit(item.itemValue);
      return;
    }
    const values = new Set(this.values);
    if (this.checks.get(item) === 'true') {
      // Unchecking clears the item, its enabled descendants and its ancestors.
      values.delete(item.itemValue);
      const clear = (parent: TreeItem) => {
        for (const kid of parent.childItems) {
          if (!kid.disabled) {
            values.delete(kid.itemValue);
            clear(kid);
          }
        }
      };
      clear(item);
      for (let up = this.__parentItem(item); up; up = this.__parentItem(up)) {
        values.delete(up.itemValue);
      }
    } else {
      values.add(item.itemValue);
    }
    this.__commit([...values].join(','));
  }

  private __commit(next: string) {
    const before = this.value;
    this.value = next;
    // Normalize and mirror onto the items now, so listeners see them up to date.
    this.__computeChecks();
    this.__syncItems();
    if (this.value === before) return;
    const detail: TreeChangeDetail =
      this.selection === 'multiple'
        ? { value: this.value, values: this.values }
        : { value: this.value };
    this.dispatchEvent(
      new CustomEvent<TreeChangeDetail>('change', {
        bubbles: true,
        composed: true,
        detail,
      }),
    );
  }

  /** The innermost item `event` passed through, unless it came from an action inside the item. */
  private __itemFromEvent(event: Event): TreeItem | null {
    for (const node of event.composedPath()) {
      if (isTreeItem(node)) return this.contains(node) ? node : null;
      if (node instanceof Element && node.matches(INTERACTIVE)) return null;
    }
    return null;
  }

  private __handleKeyDown = (event: KeyboardEvent) => {
    const item = event.target;
    if (!isTreeItem(item) || !this.contains(item) || event.defaultPrevented) {
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey) return;

    const rtl = getComputedStyle(this).direction === 'rtl';
    const inward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const outward = rtl ? 'ArrowRight' : 'ArrowLeft';

    switch (event.key) {
      case inward: {
        event.preventDefault();
        if (!item.isBranch) return;
        if (!item.expanded) {
          this.__setExpanded(item, true);
          return;
        }
        const first = item.childItems.find(kid => !kid.hidden && !kid.disabled);
        if (first) this.__moveTo(first);
        return;
      }
      case outward: {
        event.preventDefault();
        if (item.isBranch && item.expanded) {
          this.__setExpanded(item, false);
          return;
        }
        const parent = this.__parentItem(item);
        if (parent && !parent.disabled) this.__moveTo(parent);
        return;
      }
      case 'Enter':
        event.preventDefault();
        this.__activate(item);
        return;
      case ' ':
        event.preventDefault();
        this.__choose(item);
        return;
      case '*':
        event.preventDefault();
        for (const sibling of this.__siblings(item)) {
          if (!sibling.hidden) this.__setExpanded(sibling, true);
        }
        return;
      default:
        break;
    }

    this.roving.handleKeyDown(event);
  };

  private __handleClick = (event: MouseEvent) => {
    const item = this.__itemFromEvent(event);
    const hit = item?.hitPart(event);
    if (!item || !hit || item.disabled) return;
    this.roving.setActive(item);
    if (hit === 'expander' && item.isBranch) {
      this.__setExpanded(item, !item.expanded);
      return;
    }
    this.__choose(item);
  };

  private __handleDoubleClick = (event: MouseEvent) => {
    const item = this.__itemFromEvent(event);
    if (!item || item.hitPart(event) !== 'row') return;
    this.__activate(item);
  };

  private __handleSlotChange = () => {
    this.requestUpdate();
  };

  // ── Render

  render() {
    return html`
      <div
        class="tree"
        part="container"
        @click=${this.__handleClick}
        @dblclick=${this.__handleDoubleClick}
        @keydown=${this.__handleKeyDown}
        @focusin=${this.roving.handleFocusIn}
      >
        <slot @slotchange=${this.__handleSlotChange}></slot>
      </div>
    `;
  }
}

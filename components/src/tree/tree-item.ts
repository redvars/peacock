import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { FocusRing } from '@/focus-ring/focus-ring.js';
import styles from './tree-item.scss';

/** How a `wc-tree` lets the person choose items. */
export type TreeSelection = 'none' | 'single' | 'multiple';

/** Where a pointer event landed in a tree item's own row. */
export type TreeItemHit = 'expander' | 'row';

/**
 * @label Tree Item
 * @tag wc-tree-item
 * @rawTag tree-item
 *
 * @summary An item of a wc-tree; nest items inside it to give it children.
 * @overview
 * <p>The item has <code>role="treeitem"</code>; <code>wc-tree</code> sets its
 * <code>aria-level</code>, <code>aria-setsize</code> and <code>aria-posinset</code>, and its
 * <code>selected</code> state, shown as <code>aria-selected</code> in a single-select tree and as
 * a checkbox with <code>aria-checked</code> (<code>"mixed"</code> when only some of its
 * descendants are checked) in a multi-select tree.</p>
 * <p>Its text is <code>label</code>; the default slot holds its child items, which it shows in a
 * <code>role="group"</code> while <code>expanded</code>. An item with <code>has-children</code>
 * and no child items yet shows an expander too: expanding it fires <code>expand</code>, and it
 * shows <code>loading</code> until child items are added. If loading fails, remove
 * <code>loading</code> (and <code>has-children</code> when it turned out empty).</p>
 *
 * @slot - Child `wc-tree-item` elements.
 * @slot start - Leading content, such as a file or folder icon.
 * @slot end - Trailing content, such as a badge or a round icon button.
 *
 * @fires {CustomEvent<{item: TreeItem, value: string}>} expand - Dispatched when the person expands the item.
 * @fires {CustomEvent<{item: TreeItem, value: string}>} collapse - Dispatched when the person collapses the item.
 * @fires {CustomEvent<{item: TreeItem, value: string}>} activate - Dispatched on Enter or double-click. Cancelable; unless canceled, activating an item with children toggles it.
 *
 * @cssprop --tree-indent - The indentation per level. Defaults to `1.5rem`.
 * @cssprop --tree-item-height - The minimum height of an item's row. Follows the density.
 * @cssprop --tree-item-selected-container-color - Background of a selected item.
 * @cssprop --tree-item-selected-label-text-color - Label color of a selected item.
 *
 * @example
 * ```html
 * <wc-tree label="Files">
 *   <wc-tree-item value="src" label="src" expanded>
 *     <wc-icon slot="start" name="folder"></wc-icon>
 *     <wc-tree-item value="src/index.ts" label="index.ts"></wc-tree-item>
 *   </wc-tree-item>
 * </wc-tree>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class TreeItem extends LitElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** The item's text, which is also what typing a letter matches. */
  @property({ type: String }) label = '';

  /**
   * The value the tree reports for this item; defaults to `label`. Must not contain commas in a
   * multi-select tree.
   */
  @property({ type: String }) value = '';

  /** Whether the item's children are shown. */
  @property({ type: Boolean, reflect: true }) expanded = false;

  /** Whether the item cannot be focused, chosen, expanded or activated. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /**
   * Whether the item has children that are not loaded yet: it shows an expander, and expanding it
   * fires `expand` so you can add them.
   */
  @property({ type: Boolean, reflect: true, attribute: 'has-children' })
  hasChildren = false;

  /** Whether the item's children are loading. Set when a `has-children` item expands with none. */
  @property({ type: Boolean, reflect: true }) loading = false;

  /** Whether the item is chosen (checked in a multi-select tree). Set by `wc-tree` from its value. */
  @property({ type: Boolean, reflect: true }) selected = false;

  // ── State

  /** @internal The item's depth, from 1. Set by `wc-tree`. */
  @state() level = 1;

  /** @internal The tree's selection mode. Set by `wc-tree`. */
  @state() selection: TreeSelection = 'none';

  /** @internal Whether only some descendants are checked (multi-select). Set by `wc-tree`. */
  @state() indeterminate = false;

  // ── Queries

  @query('.row') private readonly rowElement?: HTMLElement;

  @query('.expander') private readonly expanderElement?: HTMLElement;

  @query('.focus-ring') private readonly focusRing?: FocusRing;

  // ── Private fields

  private readonly i18n = new I18nController(this);

  // ── Lifecycle

  override connectedCallback() {
    super.connectedCallback();
    this.setAttribute('role', 'treeitem');
    if (!this.hasAttribute('tabindex')) this.tabIndex = -1;
  }

  protected override firstUpdated(changed: PropertyValues<this>) {
    super.firstUpdated(changed);
    // The ring sits in the row, so it covers the row only, but follows focus on the host. It is
    // attached once defined, since the loader may define it after this item.
    const ring = this.focusRing;
    if (ring) {
      customElements.whenDefined('wc-focus-ring').then(() => ring.attach(this));
    }
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (this.isBranch) {
      this.setAttribute('aria-expanded', String(this.expanded));
    } else {
      this.removeAttribute('aria-expanded');
    }
    this.__toggleAria('aria-disabled', this.disabled);
    this.__toggleAria('aria-busy', this.loading);
    if (this.selection === 'single') {
      this.setAttribute('aria-selected', String(this.selected));
      this.removeAttribute('aria-checked');
    } else if (this.selection === 'multiple') {
      this.setAttribute(
        'aria-checked',
        this.indeterminate ? 'mixed' : String(this.selected),
      );
      this.removeAttribute('aria-selected');
    } else {
      this.removeAttribute('aria-selected');
      this.removeAttribute('aria-checked');
    }
  }

  // ── Public methods

  /** The value this item stands for: `value`, or `label` when `value` is empty. */
  get itemValue(): string {
    return this.value || this.label;
  }

  /** The direct child items, in order. */
  get childItems(): TreeItem[] {
    // The same test as `isTreeItem`, which is declared below the class.
    return Array.from(this.children).filter(
      (child): child is TreeItem =>
        child.localName === 'wc-tree-item' &&
        typeof (child as Partial<TreeItem>).hitPart === 'function',
    );
  }

  /** Whether the item can expand: it has child items, or `has-children`. */
  get isBranch(): boolean {
    return this.hasChildren || this.childItems.length > 0;
  }

  /** @internal Which part of this item's own row `event` happened on, if any. Used by `wc-tree`. */
  hitPart(event: Event): TreeItemHit | null {
    const path = event.composedPath();
    if (this.expanderElement && path.includes(this.expanderElement)) {
      return 'expander';
    }
    if (this.rowElement && path.includes(this.rowElement)) return 'row';
    return null;
  }

  // ── Private methods

  private __toggleAria(name: string, on: boolean) {
    if (on) this.setAttribute(name, 'true');
    else this.removeAttribute(name);
  }

  private __handleSlotChange = () => {
    this.requestUpdate();
  };

  // ── Render helpers

  private __renderExpander() {
    if (this.loading) {
      return html`<span class="expander" aria-hidden="true"
        ><wc-circular-progress
          class="progress"
          indeterminate
        ></wc-circular-progress
      ></span>`;
    }
    return html`<span
      class="expander"
      part="expander"
      aria-hidden="true"
      ?data-leaf=${!this.isBranch}
      ><wc-icon class="expander-icon" name="chevron_right"></wc-icon
    ></span>`;
  }

  private __renderCheckbox() {
    if (this.selection !== 'multiple') return nothing;
    let name = 'check_box_outline_blank';
    if (this.indeterminate) name = 'indeterminate_check_box';
    else if (this.selected) name = 'check_box';
    return html`<wc-icon
      class="checkbox"
      name=${name}
      aria-hidden="true"
    ></wc-icon>`;
  }

  // ── Render

  render() {
    const showLoading = this.loading && this.expanded;
    return html`
      <div class="row" part="row" style="--_level: ${this.level}">
        <wc-focus-ring class="focus-ring" inward></wc-focus-ring>
        <wc-ripple class="ripple"></wc-ripple>
        <div class="background"></div>
        <div class="content">
          ${this.__renderExpander()} ${this.__renderCheckbox()}
          <slot name="start"></slot>
          <span class="label" part="label">${this.label}</span>
          <slot name="end"></slot>
        </div>
      </div>
      <div class="group" part="group" role="group" ?hidden=${!this.expanded}>
        <slot @slotchange=${this.__handleSlotChange}></slot>
        ${showLoading
          ? html`<div
              class="loading"
              aria-hidden="true"
              style="--_level: ${this.level + 1}"
            >
              ${this.i18n.t('treeLoading')}
            </div>`
          : nothing}
      </div>
    `;
  }
}

/** Detail of the `expand`, `collapse` and `activate` events. */
export interface TreeItemEventDetail {
  /** The item that expanded, collapsed or was activated. */
  item: TreeItem;
  /** That item's value (its `value`, or its `label` when `value` is empty). */
  value: string;
}

/** Whether `node` is an upgraded `wc-tree-item` (one not defined yet is skipped until it is). */
export function isTreeItem(node: unknown): node is TreeItem {
  return (
    node instanceof Element &&
    node.localName === 'wc-tree-item' &&
    typeof (node as Partial<TreeItem>).hitPart === 'function'
  );
}

import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import { RovingFocusController } from '@/__internal/controllers/roving-focus-controller.js';
import { writeClipboardText } from '@/__internal/utils/clipboard.js';
import { childPath, copyText, kindOf, type JsonKind } from './json-path.js';
import styles from './json-viewer.scss';

/** Detail of the `expand` and `collapse` events. */
export interface JsonViewerToggleDetail {
  /** The JSONPath of the node, such as `$.items[2]`. */
  path: string;
}

/** Detail of the `copied` event. */
export interface JsonViewerCopyDetail {
  /** The text that was copied. */
  value: string;
  /** Whether the value or the path of the node was copied. */
  kind: 'value' | 'path';
  /** The JSONPath of the node. */
  path: string;
}

/** What keyboard and pointer handling needs to know about a rendered row. */
interface NodeInfo {
  path: string;
  parent: string | null;
  value: unknown;
  /** A non-empty object or array. */
  branch: boolean;
  expanded: boolean;
  /** A string longer than the truncation limit. */
  long: boolean;
  /** Set on the "show more" row of a large node: the node's path. */
  moreOf?: string;
}

/** Children rendered per batch; a "show more" row renders the next batch. */
const PAGE_SIZE = 100;

/** Strings longer than this many characters (as written in JSON) are cut until expanded. */
const STRING_LIMIT = 200;

/** Turns `expand-depth="all"` or `"Infinity"` into `Infinity`. */
function parseDepth(value: string | null): number {
  if (value === null) return 1;
  if (value === 'all' || value === 'Infinity') return Infinity;
  const depth = Number(value);
  return Number.isNaN(depth) ? 1 : depth;
}

/**
 * @label JSON Viewer
 * @tag wc-json-viewer
 * @rawTag json-viewer
 *
 * @summary A collapsible tree of a JSON value, such as an API response or a webhook body.
 * @overview
 * <p>Set <code>value</code> to any JavaScript value from script, or to JSON text with the
 * <code>value</code> attribute. Text that is not valid JSON shows an error with the parser's
 * message. (A string set from script is shown as a string, not parsed.)</p>
 * <p>Objects and arrays expand and collapse; a collapsed one shows its size, such as
 * <code>{3 keys}</code> or <code>[12 items]</code>. <code>expand-depth</code> sets how many
 * levels start expanded (default 1, the root; <code>all</code> expands everything). Children are
 * rendered only once their parent is expanded, and at most 100 at a time with a row that shows
 * the next 100, so a large payload stays fast. Strings longer than 200 characters are cut until
 * clicked or Enter is pressed. Values are colored with the code highlighter's syntax colors.</p>
 * <p>Hovering or focusing a row shows buttons that copy its value (strings as is, anything else
 * as indented JSON) and its JSONPath, such as <code>$.items[2].id</code>.</p>
 * <p>The tree follows the WAI-ARIA tree view pattern and is one tab stop: Up and Down move
 * between rows, Right expands a row or moves to its first child, Left collapses it or moves to
 * its parent (mirrored in right-to-left), Home and End jump to the first and last row,
 * <code>*</code> expands every sibling, and typing moves to the next row whose key starts with
 * the typed text. Tab from a row reaches its copy buttons.</p>
 *
 * @fires {CustomEvent<{path: string}>} expand - Dispatched when the person expands a node.
 * @fires {CustomEvent<{path: string}>} collapse - Dispatched when the person collapses a node.
 * @fires {CustomEvent<{value: string, kind: 'value' | 'path', path: string}>} copied - Dispatched after a copy button copied a value or a path.
 *
 * @cssprop --json-viewer-background - Block background. Defaults to `--color-surface-container-low`.
 * @cssprop --json-viewer-border-color - Block border color. Defaults to `--color-outline-variant`.
 * @cssprop --json-viewer-shape - Block corner radius. Defaults to `--shape-corner-medium`.
 * @cssprop --json-viewer-foreground - Plain text color. Defaults to `--color-on-surface`.
 * @cssprop --json-viewer-max-height - Caps the height; the tree scrolls beyond. Defaults to `none`.
 * @cssprop --json-viewer-indent - Indentation per level. Defaults to `1.25rem`.
 *
 * @csspart container - The outer block.
 * @csspart tree - The scrollable tree.
 * @csspart row - Each node's row.
 * @csspart error - The invalid JSON message.
 *
 * @example
 * ```html
 * <wc-json-viewer
 *   root-label="response"
 *   expand-depth="2"
 *   value='{"id": 42, "name": "Ada", "tags": ["admin", "ops"], "manager": null}'
 * ></wc-json-viewer>
 * ```
 *
 * @tags display
 */
@IndividualComponent
export class JsonViewer extends LitElement {
  // ── Static ────────────────────────────────────────────────────────────────

  static styles = [styles];

  private static readonly COPY_FEEDBACK_DURATION = 2000;

  // The `value` attribute holds JSON text; the property holds the parsed value.
  static override get observedAttributes(): string[] {
    return [...super.observedAttributes, 'value'];
  }

  // ── Properties ────────────────────────────────────────────────────────────

  /**
   * The value to show: any JavaScript value. The `value` attribute takes JSON text, which is
   * parsed; invalid JSON shows an error.
   */
  @property({ attribute: false, noAccessor: true })
  get value(): unknown {
    return this.__value;
  }

  set value(next: unknown) {
    const old = this.__value;
    this.__value = next;
    this._parseError = null;
    this.requestUpdate('value', old);
  }

  /** How many levels start expanded: `0` none, `1` the root (default), `all` everything. */
  @property({
    attribute: 'expand-depth',
    converter: { fromAttribute: parseDepth },
  })
  expandDepth: number = 1;

  /** Shows object keys in alphabetical order instead of their own order. */
  @property({ attribute: 'sort-keys', type: Boolean, reflect: true })
  sortKeys: boolean = false;

  /** Key shown on the root row, such as `response`. Without it the root shows its value only. */
  @property({ attribute: 'root-label', type: String })
  rootLabel: string = '';

  /** The tree's accessible name. Defaults to "JSON". */
  @property({ type: String })
  label: string = '';

  /** Overrides Peacock's strings for this instance only. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── State ─────────────────────────────────────────────────────────────────

  /** The parser's message when the `value` attribute is not valid JSON. */
  @state() private _parseError: string | null = null;

  /** The row that holds focus, whose copy buttons show. */
  @state() private _activePath: string | null = null;

  /** The row under the pointer, whose copy buttons show. */
  @state() private _hoverPath: string | null = null;

  /** The copy button that shows its copied feedback. */
  @state() private _copied: { path: string; kind: 'value' | 'path' } | null =
    null;

  // ── Private fields ────────────────────────────────────────────────────────

  private __value: unknown = undefined;

  /** Nodes the person expanded or collapsed, overriding the depth. */
  private __toggled = new Map<string, boolean>();

  /** Children shown per node, beyond the first page. */
  private __limits = new Map<string, number>();

  /** Long strings shown in full. */
  private __fullStrings = new Set<string>();

  /** Depth set by `expandAll()` or `collapseAll()`, until `expand-depth` changes. */
  private __depthOverride: number | null = null;

  /** Object keys per object, sorted when `sort-keys` is set. */
  private __keys = new WeakMap<object, string[]>();

  /** The rows of the last render, by path. */
  private __nodes = new Map<string, NodeInfo>();

  /** A row to focus after the next render (the first of a batch that "show more" rendered). */
  private __focusAfterUpdate: string | null = null;

  private __copyFeedbackTimeout: number | null = null;

  private readonly i18n = new I18nController(this);

  private readonly roving = new RovingFocusController(this, {
    items: () =>
      Array.from(this.renderRoot?.querySelectorAll<HTMLElement>('.item') ?? []),
    orientation: () => 'vertical',
    wrap: () => false,
    typeahead: () => true,
    itemText: item => item.dataset.key ?? '',
  });

  // ── Lifecycle ─────────────────────────────────────────────────────────────

  override disconnectedCallback() {
    if (this.__copyFeedbackTimeout !== null) {
      window.clearTimeout(this.__copyFeedbackTimeout);
      this.__copyFeedbackTimeout = null;
    }
    this._copied = null;
    super.disconnectedCallback();
  }

  override attributeChangedCallback(
    name: string,
    old: string | null,
    next: string | null,
  ) {
    if (name !== 'value') {
      super.attributeChangedCallback(name, old, next);
      return;
    }
    if (next === null) {
      this.value = undefined;
      return;
    }
    try {
      this.value = JSON.parse(next);
    } catch (error) {
      this.value = undefined;
      this._parseError = error instanceof Error ? error.message : String(error);
    }
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    super.willUpdate(changed);
    if (changed.has('value')) {
      this.__toggled.clear();
      this.__limits.clear();
      this.__fullStrings.clear();
      this.__depthOverride = null;
    }
    if (changed.has('expandDepth')) {
      this.__toggled.clear();
      this.__depthOverride = null;
    }
    if (changed.has('sortKeys')) this.__keys = new WeakMap();
  }

  protected override updated(changed: PropertyValues<this>) {
    super.updated(changed);
    if (this.__focusAfterUpdate !== null) {
      const item = this.__item(this.__focusAfterUpdate);
      this.__focusAfterUpdate = null;
      if (item) this.roving.setActive(item);
    }
  }

  // ── Public methods ────────────────────────────────────────────────────────

  /** Expands every node. Children still render 100 at a time. */
  expandAll() {
    this.__toggled.clear();
    this.__depthOverride = Infinity;
    this.requestUpdate();
  }

  /** Collapses every node, the root included. */
  collapseAll() {
    this.__toggled.clear();
    this.__depthOverride = 0;
    this.requestUpdate();
  }

  override focus(options?: Parameters<HTMLElement['focus']>[0]) {
    this.roving.sync();
    this.roving.activeItem?.focus(options);
  }

  // ── Private methods ───────────────────────────────────────────────────────

  private __format(value: number): string {
    return new Intl.NumberFormat(this.i18n.locale).format(value);
  }

  private __isExpanded(path: string, level: number): boolean {
    const depth = this.__depthOverride ?? this.expandDepth;
    return this.__toggled.get(path) ?? level - 1 < depth;
  }

  /** The keys of an object, in display order. */
  private __objectKeys(value: object): string[] {
    let keys = this.__keys.get(value);
    if (!keys) {
      keys = Object.keys(value);
      if (this.sortKeys) keys.sort((a, b) => (a < b ? -1 : Number(a > b)));
      this.__keys.set(value, keys);
    }
    return keys;
  }

  /** The number of children of an object or array. */
  private __count(value: unknown, kind: JsonKind): number {
    if (kind === 'array') return (value as unknown[]).length;
    if (kind === 'object') return this.__objectKeys(value as object).length;
    return 0;
  }

  private __item(path: string): HTMLElement | null {
    return (
      Array.from(this.renderRoot.querySelectorAll<HTMLElement>('.item')).find(
        item => item.dataset.path === path,
      ) ?? null
    );
  }

  private __setExpanded(info: NodeInfo, expanded: boolean) {
    if (!info.branch || info.expanded === expanded) return;
    this.__toggled.set(info.path, expanded);
    this.requestUpdate();
    this.dispatchEvent(
      new CustomEvent<JsonViewerToggleDetail>(
        expanded ? 'expand' : 'collapse',
        { detail: { path: info.path }, bubbles: true, composed: true },
      ),
    );
  }

  /** Renders the next batch of a large node and focuses its first new row. */
  private __showMore(path: string) {
    const info = this.__nodes.get(path);
    if (!info) return;
    const shown = this.__limits.get(path) ?? PAGE_SIZE;
    this.__limits.set(path, shown + PAGE_SIZE);
    const kind = kindOf(info.value);
    const key =
      kind === 'array' ? shown : this.__objectKeys(info.value as object)[shown];
    this.__focusAfterUpdate = childPath(path, key);
    this.requestUpdate();
  }

  /** Enter or a click: toggles a node, a long string, or shows more children. */
  private __activate(info: NodeInfo) {
    if (info.moreOf) {
      this.__showMore(info.moreOf);
    } else if (info.branch) {
      this.__setExpanded(info, !info.expanded);
    } else if (info.long) {
      if (this.__fullStrings.has(info.path)) {
        this.__fullStrings.delete(info.path);
      } else {
        this.__fullStrings.add(info.path);
      }
      this.requestUpdate();
    }
  }

  private async __copy(info: NodeInfo, kind: 'value' | 'path') {
    const value = kind === 'path' ? info.path : copyText(info.value);
    try {
      await writeClipboardText(value);
    } catch {
      // Nothing was copied: no feedback and no event.
      return;
    }
    this._copied = { path: info.path, kind };
    this.dispatchEvent(
      new CustomEvent<JsonViewerCopyDetail>('copied', {
        detail: { value, kind, path: info.path },
        bubbles: true,
        composed: true,
      }),
    );
    if (this.__copyFeedbackTimeout !== null) {
      window.clearTimeout(this.__copyFeedbackTimeout);
    }
    this.__copyFeedbackTimeout = window.setTimeout(() => {
      this._copied = null;
      this.__copyFeedbackTimeout = null;
    }, JsonViewer.COPY_FEEDBACK_DURATION);
  }

  /** The innermost row `event` passed through, unless it came from its copy buttons. */
  // eslint-disable-next-line class-methods-use-this
  private __rowItem(event: Event): HTMLElement | null {
    for (const node of event.composedPath()) {
      if (node instanceof HTMLElement) {
        const { classList } = node;
        if (classList.contains('actions') || classList.contains('close')) {
          return null;
        }
        if (classList.contains('row')) return node.parentElement;
        if (classList.contains('item')) return null;
      }
    }
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  private __itemFromPath(event: Event): HTMLElement | null {
    return (
      (event
        .composedPath()
        .find(
          node =>
            node instanceof HTMLElement && node.classList.contains('item'),
        ) as HTMLElement | undefined) ?? null
    );
  }

  private __handleKeyDown = (event: KeyboardEvent) => {
    const item = event.target as HTMLElement | null;
    if (!item?.classList?.contains('item') || event.defaultPrevented) return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const info = this.__nodes.get(item.dataset.path ?? '');
    if (!info) return;

    const rtl = getComputedStyle(this).direction === 'rtl';
    const inward = rtl ? 'ArrowLeft' : 'ArrowRight';
    const outward = rtl ? 'ArrowRight' : 'ArrowLeft';

    switch (event.key) {
      case inward: {
        event.preventDefault();
        if (!info.branch) return;
        if (!info.expanded) {
          this.__setExpanded(info, true);
          return;
        }
        const first = item.querySelector<HTMLElement>(
          ':scope > .group > .item',
        );
        if (first) this.roving.setActive(first);
        return;
      }
      case outward: {
        event.preventDefault();
        if (info.branch && info.expanded) {
          this.__setExpanded(info, false);
          return;
        }
        const parent = info.parent === null ? null : this.__item(info.parent);
        if (parent) this.roving.setActive(parent);
        return;
      }
      case 'Enter':
        event.preventDefault();
        this.__activate(info);
        return;
      case '*':
        event.preventDefault();
        for (const sibling of this.__nodes.values()) {
          if (sibling.parent === info.parent && !sibling.moreOf) {
            this.__setExpanded(sibling, true);
          }
        }
        return;
      default:
        break;
    }
    this.roving.handleKeyDown(event);
  };

  private __handleClick = (event: MouseEvent) => {
    const item = this.__rowItem(event);
    const info = item && this.__nodes.get(item.dataset.path ?? '');
    if (!item || !info) return;
    this.roving.setActive(item);
    this.__activate(info);
  };

  private __handleFocusIn = (event: FocusEvent) => {
    this.roving.handleFocusIn(event);
    const path = this.__itemFromPath(event)?.dataset.path ?? null;
    if (path !== this._activePath) this._activePath = path;
  };

  private __handlePointerOver = (event: PointerEvent) => {
    const path = this.__itemFromPath(event)?.dataset.path ?? null;
    if (path !== this._hoverPath) this._hoverPath = path;
  };

  private __handlePointerLeave = () => {
    this._hoverPath = null;
  };

  // ── Render helpers ────────────────────────────────────────────────────────

  private __renderActions(info: NodeInfo) {
    if (info.path !== this._activePath && info.path !== this._hoverPath) {
      return nothing;
    }
    const button = (kind: 'value' | 'path', icon: string) => {
      const copied =
        this._copied?.path === info.path && this._copied.kind === kind;
      const label = this.i18n.t(
        kind === 'value' ? 'jsonViewerCopyValue' : 'jsonViewerCopyPath',
      );
      return html`<wc-icon-button
        class="copy-${kind}"
        variant="text"
        size="xs"
        shape="round"
        color=${copied ? 'success' : 'surface'}
        aria-label=${label}
        tooltip=${copied ? this.i18n.t('copied') : label}
        @click=${() => this.__copy(info, kind)}
      >
        <wc-icon name=${copied ? 'check' : icon}></wc-icon>
      </wc-icon-button>`;
    };
    return html`<span class="actions"
      >${button('value', 'content_copy')}${button('path', 'route')}</span
    >`;
  }

  /** The value part of a leaf row, and its text for the accessible name. */
  private __leaf(
    value: unknown,
    kind: JsonKind,
    path: string,
  ): { template: unknown; text: string; long: boolean } {
    switch (kind) {
      case 'string': {
        const written = JSON.stringify(value);
        const long = written.length > STRING_LIMIT;
        if (!long) {
          return {
            template: html`<span class="string">${written}</span>`,
            text: written,
            long,
          };
        }
        if (this.__fullStrings.has(path)) {
          return {
            template: html`<span class="string">${written}</span
              ><span class="more">${this.i18n.t('showLess')}</span>`,
            text: written,
            long,
          };
        }
        const cut = `${written.slice(0, STRING_LIMIT)}…`;
        const rest = written.length - STRING_LIMIT;
        const more = this.i18n.t('jsonViewerMoreCharacters')(
          rest,
          this.__format(rest),
        );
        return {
          template: html`<span class="string">${cut}</span
            ><span class="more">${more}</span>`,
          text: `${cut} ${more}`,
          long,
        };
      }
      case 'other': {
        const text =
          value instanceof Date ? String(value.toJSON()) : String(value);
        return {
          template: html`<span class="other">${text}</span>`,
          text,
          long: false,
        };
      }
      default: {
        const text = typeof value === 'bigint' ? `${value}n` : String(value);
        return {
          template: html`<span class=${kind}>${text}</span>`,
          text,
          long: false,
        };
      }
    }
  }

  private __renderKey(key: string | number | null) {
    if (key === null) return nothing;
    return html`<span class=${typeof key === 'number' ? 'index' : 'key'}
        >${key}</span
      ><span class="punctuation">:</span>`;
  }

  private __renderMore(
    parent: string,
    level: number,
    shown: number,
    count: number,
  ) {
    const path = `${parent}#more`;
    const hidden = count - shown;
    const next = Math.min(PAGE_SIZE, hidden);
    const text = this.i18n.t('jsonViewerShowMore')(
      this.__format(next),
      this.__format(hidden),
    );
    this.__nodes.set(path, {
      path,
      parent,
      value: undefined,
      branch: false,
      expanded: false,
      long: false,
      moreOf: parent,
    });
    // A tree without selection has no aria-selected (optional in WAI-ARIA 1.2).
    // eslint-disable-next-line lit-a11y/role-has-required-aria-attrs
    return html`<div
      class="item more-item"
      role="treeitem"
      tabindex="-1"
      aria-label=${text}
      aria-level=${level}
      data-path=${path}
      data-key=""
    >
      <div class="row" part="row" style="--_level: ${level}">
        <span class="expander" aria-hidden="true">
          <wc-icon name="unfold_more"></wc-icon>
        </span>
        <span class="more">${text}</span>
      </div>
    </div>`;
  }

  private __renderNode(
    value: unknown,
    key: string | number | null,
    path: string,
    parent: string | null,
    level: number,
    position: { index: number; size: number },
    ancestors: readonly object[],
  ): unknown {
    let kind = kindOf(value);
    const circular =
      (kind === 'object' || kind === 'array') &&
      ancestors.includes(value as object);
    if (circular) kind = 'other';
    const count = this.__count(value, kind);
    const branch = count > 0;
    const expanded = branch && this.__isExpanded(path, level);
    const open = kind === 'array' ? '[' : '{';
    const close = kind === 'array' ? ']' : '}';

    let valueTemplate: unknown;
    let valueText: string;
    let long = false;
    if (circular) {
      valueText = this.i18n.t('jsonViewerCircular');
      valueTemplate = html`<span class="other">${valueText}</span>`;
    } else if (kind === 'object' || kind === 'array') {
      const size =
        kind === 'array'
          ? this.i18n.t('jsonViewerItems')(count, this.__format(count))
          : this.i18n.t('jsonViewerKeys')(count, this.__format(count));
      valueText = size;
      if (!branch) {
        valueTemplate = html`<span class="punctuation">${open}${close}</span>`;
      } else if (expanded) {
        valueTemplate = html`<span class="punctuation">${open}</span>`;
      } else {
        valueTemplate = html`<span class="punctuation">${open}</span
          ><span class="size">${size}</span
          ><span class="punctuation">${close}</span>`;
      }
    } else {
      const leaf = this.__leaf(value, kind, path);
      valueTemplate = leaf.template;
      valueText = leaf.text;
      long = leaf.long;
    }

    const info: NodeInfo = { path, parent, value, branch, expanded, long };
    this.__nodes.set(path, info);
    const keyText = key === null ? '' : String(key);

    let children: unknown = nothing;
    if (expanded) {
      const shown = Math.min(count, this.__limits.get(path) ?? PAGE_SIZE);
      const keys: (string | number)[] =
        kind === 'array'
          ? Array.from({ length: shown }, (_, i) => i)
          : this.__objectKeys(value as object).slice(0, shown);
      const record = value as Record<string | number, unknown>;
      const inner = [...ancestors, value as object];
      children = html`<div class="group" role="group">
          ${repeat(
            keys,
            childKey => childPath(path, childKey),
            (childKey, index) =>
              this.__renderNode(
                record[childKey],
                childKey,
                childPath(path, childKey),
                path,
                level + 1,
                { index, size: count },
                inner,
              ),
          )}
          ${shown < count
            ? this.__renderMore(path, level + 1, shown, count)
            : nothing}
        </div>
        <div class="row close" aria-hidden="true" style="--_level: ${level}">
          <span class="expander"></span
          ><span class="punctuation">${close}</span>
        </div>`;
    }

    // A tree without selection has no aria-selected (optional in WAI-ARIA 1.2).
    // eslint-disable-next-line lit-a11y/role-has-required-aria-attrs
    return html`<div
      class="item"
      role="treeitem"
      tabindex="-1"
      aria-level=${level}
      aria-setsize=${position.size}
      aria-posinset=${position.index + 1}
      aria-expanded=${branch ? String(expanded) : nothing}
      aria-label=${keyText ? `${keyText}: ${valueText}` : valueText}
      data-path=${path}
      data-key=${keyText}
      data-kind=${kind}
      ?data-expanded=${expanded}
    >
      <div class="row" part="row" style="--_level: ${level}">
        <span class="expander" aria-hidden="true" ?data-leaf=${!branch}
          ><wc-icon class="expander-icon" name="chevron_right"></wc-icon
        ></span>
        ${this.__renderKey(key)}${valueTemplate}${this.__renderActions(info)}
      </div>
      ${children}
    </div>`;
  }

  // ── Render ────────────────────────────────────────────────────────────────

  render() {
    if (this._parseError !== null) {
      return html`<div class="code-block invalid" part="container">
        <p class="error" part="error">
          <wc-icon name="error"></wc-icon>
          <span>${this.i18n.t('jsonViewerInvalid')(this._parseError)}</span>
        </p>
      </div>`;
    }
    if (this.value === undefined) return nothing;

    this.__nodes = new Map();
    let copiedText = '';
    if (this._copied) {
      copiedText = this.i18n.t(
        this._copied.kind === 'value'
          ? 'jsonViewerCopiedValue'
          : 'jsonViewerCopiedPath',
      );
    }
    return html`<div class="code-block" part="container">
      <div
        class="tree"
        part="tree"
        role="tree"
        aria-label=${this.label || this.i18n.t('jsonViewer')}
        @click=${this.__handleClick}
        @keydown=${this.__handleKeyDown}
        @focusin=${this.__handleFocusIn}
        @pointerover=${this.__handlePointerOver}
        @pointerleave=${this.__handlePointerLeave}
      >
        ${this.__renderNode(
          this.value,
          this.rootLabel || null,
          '$',
          null,
          1,
          { index: 0, size: 1 },
          [],
        )}
      </div>
      <span class="sr-only" aria-live="polite">${copiedText}</span>
    </div>`;
  }
}

import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

import { AiController } from '@/__internal/ai/ai-controller.js';
import type { AiCitation } from '@/__internal/ai/types.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import type { PeacockStrings } from '@/__internal/i18n/strings.js';
import IndividualComponent from '@/IndividualComponent.js';
import { parsePartialJson } from './partial-json.js';
import type { GenerativeValue, GenerativeViewActionDetail } from './types.js';
import {
  cleanJson,
  cleanValue,
  type CleanChild,
  type CleanNode,
  TEXT_TYPE,
} from './validate.js';
import styles from './generative-view.scss';

/** What the view remembers about an element it rendered. */
interface Rendered {
  /** What the element was made for (see `keyOf`); a node with another key gets a new element. */
  key: string;
  /** Values the element had before the view first set each prop, to restore when a prop goes. */
  defaults: Record<string, unknown>;
  set: Set<string>;
  node: CleanNode;
  /** Where the default-slot children go: the element, or its wrapper. */
  content: Element;
}

const TEXT_TAGS: Record<string, string> = {
  headline: 'h3',
  title: 'h4',
};

/** Nodes whose text children are paragraphs, like the root's. */
const LAYOUT_TYPES = new Set(['stack', 'grid', 'card']);

/** Nodes that show `loading` while streaming until their `data` arrives. */
const LOADING_TYPES = /^(table|chart-.+|sparkline)$/;

/** A text node's tag depends on its variant, so a changed variant needs a new element. */
function keyOf(node: CleanNode): string {
  return node.type === TEXT_TYPE ? `text:${node.props.variant}` : node.type;
}

/**
 * @label Generative View
 * @tag wc-generative-view
 * @rawTag generative-view
 * @summary Shows an answer of the assistant as Peacock components, from JSON checked against an allow-list, never as HTML or code.
 * @overview
 * <p>When an answer is better as a few numbers, a chart or a table than as text, the assistant can
 * return it as JSON nodes, such as <code>{"type": "stat", "props": {"label": "Open incidents",
 * "value": 42}}</code>, and this view lays them out with Peacock components (ADR-030002). It
 * renders only the components and props of its catalog, which is generated from the component
 * manifest and an allow-list: layout (stack, grid, card, divider), text, numbers, charts, tables,
 * lists, tags, alerts, Markdown, citations and buttons. <code>generativeViewSchema()</code> returns
 * the catalog as a JSON Schema for the model service.</p>
 * <p>Nothing in it can navigate, load an address or run code: there is no HTML, no
 * <code>href</code> or <code>src</code>, no callbacks. An unknown node shows as its text, an unknown
 * or ill-typed prop is dropped, and <code>issues</code> lists what was dropped. A node with an
 * <code>action</code> id fires <code>action</code> when pressed or selected, and does nothing else:
 * the app decides what happens, and a write is still a draft the person confirms.</p>
 * <p>Give the answer in <code>value</code>, as nodes or as their JSON text. With
 * <code>streaming</code> the text may be cut off; the view shows what has arrived so far. Citations
 * resolve through <code>citations</code>, as in <code>wc-markdown</code>.</p>
 * <p>It is marked "By the assistant" (<code>badge-label</code> changes it; <code>hide-badge</code>
 * drops it where its container already marks it, such as a <code>wc-chat-message</code>). Like every
 * marker of the assistant, it renders nothing while AI is off for the page.</p>
 * @tags display, ai
 *
 * @csspart view - The frame.
 * @csspart content - The rendered nodes.
 *
 * @fires {CustomEvent<GenerativeViewActionDetail>} action - A node with an `action` was pressed or selected.
 *
 * @example
 * ```html
 * <wc-generative-view value='{"type": "stat", "props": {"label": "Open incidents", "value": 42}}'></wc-generative-view>
 * ```
 */
@IndividualComponent
export class GenerativeView extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The answer: a node, a list of nodes and text, or their JSON text. */
  @property() value: GenerativeValue = null;

  /** The JSON is still arriving and may be cut off. */
  @property({ type: Boolean, reflect: true }) streaming = false;

  /** The sources that `citation` nodes and `cite:` links refer to, by id. */
  @property({ attribute: false }) citations: AiCitation[] = [];

  /** Address of a cited source not in `citations`; `{id}` is replaced by its id. */
  @property({ type: String, attribute: 'citation-href' }) citationHref = '';

  /** Accessible name of the view, such as "Open incidents by priority". */
  @property({ type: String }) label = '';

  /** The marker's text; defaults to "By the assistant". */
  @property({ type: String, attribute: 'badge-label' }) badgeLabel = '';

  /** Drops the marker, where the container already marks the answer as the assistant's. */
  @property({ type: Boolean, attribute: 'hide-badge' }) hideBadge = false;

  /** Per-instance string overrides. */
  @property({ attribute: false }) strings?: Partial<PeacockStrings>;

  // ── Private fields ───────────────────────────────────────────────────────

  private readonly i18n = new I18nController(this);

  private readonly ai = new AiController(this);

  private _nodes: CleanChild[] = [];

  private _issues: string[] = [];

  private _rendered = new WeakMap<Element, Rendered>();

  // ── Public getters ───────────────────────────────────────────────────────

  /** What the last value lost: unknown nodes and props, invalid values, cut-offs. */
  get issues(): string[] {
    return [...this._issues];
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  protected override willUpdate(changed: PropertyValues<this>) {
    if (!changed.has('value') && !changed.has('streaming')) return;
    let parsed: unknown = this.value;
    if (typeof this.value === 'string') {
      if (this.streaming) {
        parsed = parsePartialJson(this.value);
        // Keep what is shown until the next chunk makes sense.
        if (parsed === undefined && this.value.trim()) return;
      } else {
        try {
          parsed = this.value.trim() ? JSON.parse(this.value) : null;
        } catch {
          this._nodes = [];
          this._issues = ['$: value is not JSON'];
          return;
        }
      }
    }
    const { nodes, issues } = cleanValue(parsed);
    this._nodes = nodes;
    this._issues = issues;
  }

  protected override updated() {
    const content = this.renderRoot.querySelector('.content');
    if (content) this._reconcile(content, this._nodes, 0, true);
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /**
   * Makes `container`'s children, from `offset` on, match `children`, reusing what it can. With
   * `paragraphs` (the root and layout nodes), text becomes body paragraphs rather than running on.
   */
  private _reconcile(
    container: Element,
    children: CleanChild[],
    offset = 0,
    paragraphs = false,
  ) {
    const list: CleanChild[] = paragraphs
      ? children.map(child =>
          typeof child === 'string'
            ? { type: TEXT_TYPE, props: { variant: 'body' }, children: [child] }
            : child,
        )
      : children;
    list.forEach((child, index) => {
      const existing = container.childNodes[offset + index] as
        | Element
        | Text
        | undefined;
      if (typeof child === 'string') {
        if (existing?.nodeType === Node.TEXT_NODE) {
          if (existing.textContent !== child) existing.textContent = child;
        } else this._place(container, document.createTextNode(child), existing);
        return;
      }
      const reuse =
        existing instanceof Element &&
        this._rendered.get(existing)?.key === keyOf(child)
          ? existing
          : undefined;
      const element = reuse ?? this._create(child);
      if (!reuse) this._place(container, element, existing);
      this._update(element, child);
    });
    while (container.childNodes.length > offset + list.length)
      container.lastChild?.remove();
  }

  private _place(container: Element, node: Node, existing?: Element | Text) {
    if (existing) existing.replaceWith(node);
    else container.append(node);
  }

  private _create(node: CleanNode): Element {
    if (node.type === TEXT_TYPE) {
      const variant = String(node.props.variant);
      const element = document.createElement(TEXT_TAGS[variant] ?? 'p');
      element.className = `text text-${variant}`;
      this._rendered.set(element, {
        key: keyOf(node),
        defaults: {},
        set: new Set(),
        node,
        content: element,
      });
      return element;
    }
    const { entry } = node;
    if (!entry) throw new Error(`No entry for ${node.type}`);
    // Tags come from the catalog only, never from the value.
    const element = document.createElement(entry.tag);
    element.classList.add('node');
    let content: Element = element;
    if (entry.wrap) {
      content = document.createElement(entry.wrap);
      content.classList.add('wrap');
      element.append(content);
    }
    const rendered: Rendered = {
      key: keyOf(node),
      defaults: {},
      set: new Set(),
      node,
      content,
    };
    this._rendered.set(element, rendered);
    if (entry.action) {
      element.addEventListener(entry.action, event =>
        this._onAction(element, event),
      );
    }
    return element;
  }

  private _update(element: Element, node: CleanNode) {
    const rendered = this._rendered.get(element);
    if (!rendered) return;
    rendered.node = node;
    if (node.slot) element.setAttribute('slot', node.slot);
    else element.removeAttribute('slot');

    if (node.type === TEXT_TYPE) {
      const text = node.children.join('');
      const heading = element;
      if (heading.textContent !== text) heading.textContent = text;
      return;
    }

    const target = element as unknown as Record<string, unknown>;
    const props: Record<string, unknown> = { ...node.props };
    if (node.type === 'list-item') props.actionable = Boolean(node.action);
    // A table or chart whose rows have not arrived yet shows it is loading, not "No items".
    if (
      this.streaming &&
      LOADING_TYPES.test(node.type) &&
      !(Array.isArray(node.props.data) && node.props.data.length)
    )
      props.loading = true;
    if (node.type === 'markdown') {
      props.citations = this.citations;
      props.citationHref = this.citationHref;
    }
    if (node.type === 'citation') {
      const id = String(node.props.value ?? '');
      const source = this.citations.find(citation => citation.id === id);
      props.headline = source?.headline ?? '';
      props.supportingText = source?.supportingText ?? '';
      props.href =
        source?.href ??
        (this.citationHref && id
          ? this.citationHref.replace(/\{id\}/g, encodeURIComponent(id))
          : '');
    }
    for (const name of rendered.set) {
      if (!(name in props)) {
        target[name] = rendered.defaults[name];
        rendered.set.delete(name);
      }
    }
    for (const [name, value] of Object.entries(props)) {
      if (!rendered.set.has(name)) {
        rendered.defaults[name] = target[name];
        rendered.set.add(name);
      }
      if (target[name] !== value) target[name] = value;
    }

    const slotted = node.children.filter(
      child => typeof child !== 'string' && child.slot,
    );
    const layout = LAYOUT_TYPES.has(node.type);
    if (rendered.content === element) {
      this._reconcile(element, node.children, 0, layout);
    } else {
      this._reconcile(
        rendered.content,
        node.children.filter(child => typeof child === 'string' || !child.slot),
        0,
        layout,
      );
      this._reconcile(element, slotted, 1);
    }
  }

  private _onAction(element: Element, event: Event) {
    const node = this._rendered.get(element)?.node;
    if (!node?.action) return;
    if ((element as HTMLElement & { disabled?: boolean }).disabled) return;
    const detail: GenerativeViewActionDetail = {
      id: node.action,
      type: node.type,
      ...(node.payload !== undefined ? { payload: node.payload } : {}),
    };
    if (event instanceof CustomEvent && event.detail !== undefined) {
      const clean = cleanJson(event.detail);
      if (clean !== undefined) detail.detail = clean;
    }
    this.dispatchEvent(
      new CustomEvent<GenerativeViewActionDetail>('action', {
        detail,
        bubbles: true,
        composed: true,
      }),
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    if (!this.ai.available) return nothing;
    const waiting = this.streaming && !this._nodes.length;
    return html`<section
      class="view"
      part="view"
      aria-label=${this.label || nothing}
      aria-busy=${this.streaming ? 'true' : nothing}
    >
      ${this.hideBadge
        ? nothing
        : html`<wc-ai-badge class="badge" kind="generated"
            >${this.badgeLabel || this.i18n.t('aiGenerated')}</wc-ai-badge
          >`}
      ${waiting
        ? html`<wc-typing-indicator
            label=${this.i18n.t('typingThinking')}
          ></wc-typing-indicator>`
        : nothing}
      <div class="content" part="content"></div>
    </section>`;
  }
}

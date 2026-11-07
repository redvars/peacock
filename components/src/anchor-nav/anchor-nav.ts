import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import IndividualComponent from '@/IndividualComponent.js';

import styles from './anchor-nav.scss';

/** A link to a section of the page. */
export interface AnchorNavItem {
  /** The `id` of the section or its heading. */
  id: string;
  /** The link text. */
  label: string;
  /** Nesting level: 1 (default) for a section, 2 for a subsection, 3 below that. */
  level?: number;
}

/** `detail` of `change`. */
export interface AnchorNavChangeDetail {
  /** The id of the section now in view. */
  value: string;
}

interface ItemNode {
  item: AnchorNavItem;
  children: ItemNode[];
}

/** The headings discovered in a `for` container, and the level of each. */
const DISCOVERED_HEADINGS: Record<string, number> = { h2: 1, h3: 2 };

const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6';

/**
 * Where a section counts as in view: once its top passes the first third of the scroll
 * container. The observer's root is cut to that band, so it fires as a section crosses the line.
 */
const ACTIVATION_RATIO = 1 / 3;

const ROOT_MARGIN = '0px 0px -66% 0px';

/** Longest a click waits for its smooth scroll to end before scroll spying resumes. */
const SCROLL_SETTLE_MS = 1000;

/** The parent in the flat tree: the slot an element is assigned to, or the host of a shadow root. */
function composedParent(node: Node): Element | null {
  if (node instanceof Element && node.assignedSlot) return node.assignedSlot;
  const parent = node.parentNode;
  if (parent instanceof ShadowRoot) return parent.host;
  return parent instanceof Element ? parent : null;
}

function isScrollable(element: Element): boolean {
  const { overflowY } = getComputedStyle(element);
  return (
    overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay'
  );
}

/** A URL fragment made of the heading text, such as "getting-started". */
function slug(text: string): string {
  return (
    text
      .trim()
      .toLowerCase()
      .replace(/[^\p{L}\p{N}]+/gu, '-')
      .replace(/^-+|-+$/g, '') || 'section'
  );
}

/** Nests items under the nearest earlier item of a lower level. */
function buildTree(items: AnchorNavItem[]): ItemNode[] {
  const roots: ItemNode[] = [];
  const stack: { level: number; node: ItemNode }[] = [];
  for (const item of items) {
    const level = Math.min(3, Math.max(1, Math.round(item.level ?? 1)));
    const node: ItemNode = { item, children: [] };
    while (stack.length && stack[stack.length - 1].level >= level) stack.pop();
    const parent = stack[stack.length - 1];
    if (parent) parent.node.children.push(node);
    else roots.push(node);
    stack.push({ level, node });
  }
  return roots;
}

/**
 * @label Anchor Nav
 * @tag wc-anchor-nav
 * @rawTag anchor-nav
 * @summary "On this page" links to the sections of a long page, highlighting the one in view.
 *
 * @overview
 * <p>An anchor nav lists the sections of a long settings or documentation page and marks the one
 * being read. Point <code>for</code> at the element holding the content and it lists its
 * <code>h2</code> and <code>h3</code> headings (an <code>h3</code> nested under the
 * <code>h2</code> before it), using each heading's text as the link and its <code>id</code> as
 * the target; a heading without an <code>id</code> gets one made from its text. It follows
 * headings added, removed or renamed later. Or set <code>items</code> to
 * <code>{ id, label, level? }</code> objects, for sections that are not headings or labels that
 * differ from them; <code>items</code> wins when both are set.</p>
 * <p>The link of the section in view has <code>aria-current="location"</code>. A section is in
 * view once its top passes the first third of the scroll container; at the very end of the page
 * the last section is current even when it is too short to reach that line. The nav fires
 * <code>change</code> when the current section changes.</p>
 * <p>Pressing a link scrolls its section into view, smoothly unless the person asks for reduced
 * motion, and moves focus to the section's heading (giving it <code>tabindex="-1"</code> when it
 * is not focusable), so keyboard and screen reader users continue reading from there. Set
 * <code>update-hash</code> to also put the section in the address bar with
 * <code>history.replaceState()</code>, without adding a history entry. Links are real
 * <code>#id</code> links, so they can be copied or opened in a new tab.</p>
 * <p>The sections may scroll inside an element rather than the page: the nav uses the nearest
 * scrolling ancestor of the sections (such as a <code>wc-scroll-area</code>), or the element
 * that <code>scroll-container</code> selects. Set <code>scroll-margin-top</code> on the headings
 * when a sticky header covers the top of the scroll container.</p>
 * <p>The nav is a <code>nav</code> landmark named "On this page" (<code>label</code> to change
 * it); <code>headline</code> shows a visible title, which then names the landmark. It does not
 * stick in place on its own: put it in a sidebar and give it <code>position: sticky</code> and
 * <code>top</code> when it should stay visible while the page scrolls. Call
 * <code>refresh()</code> after replacing the content wholesale or moving the sections.</p>
 *
 * @fires {CustomEvent<{value: string}>} change - Dispatched when the section in view changes. `value` is its id.
 *
 * @cssprop --anchor-nav-text-color - Color of the links.
 * @cssprop --anchor-nav-current-color - Color of the current link and its marker.
 * @cssprop --anchor-nav-track-color - Color of the line along the links.
 *
 * @example
 * ```html
 * <wc-anchor-nav for="article" headline="On this page" update-hash style="position: sticky; top: 1rem"></wc-anchor-nav>
 * <article id="article">
 *   <h2 id="install">Install</h2> ...
 *   <h3 id="npm">With npm</h3> ...
 *   <h2 id="usage">Usage</h2> ...
 * </article>
 * ```
 * @example
 * ```html
 * <wc-anchor-nav id="settings-nav"></wc-anchor-nav>
 * <script>
 *   document.querySelector('#settings-nav').items = [
 *     { id: 'profile', label: 'Profile' },
 *     { id: 'notifications', label: 'Notifications' },
 *     { id: 'email', label: 'Email', level: 2 },
 *   ];
 * </script>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class AnchorNav extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static styles = [styles];

  // ── Properties ───────────────────────────────────────────────────────────

  /** The sections to link to. Unset, they are discovered from the headings in `for`. */
  @property({ type: Array, attribute: false })
  items?: AnchorNavItem[];

  /** The id of the element whose `h2` and `h3` headings become the links. */
  @property({ type: String, reflect: true })
  for = '';

  /** A selector for the element the sections scroll in; defaults to their nearest scrolling ancestor. */
  @property({ type: String, attribute: 'scroll-container' })
  scrollContainer = '';

  /** Puts the section in the address bar (`history.replaceState()`) when a link is pressed. */
  @property({ type: Boolean, attribute: 'update-hash' })
  updateHash = false;

  /** A visible title above the links, such as "On this page"; it then names the landmark. */
  @property({ type: String })
  headline = '';

  /** The landmark's accessible name; defaults to `headline`, else "On this page". */
  @property({ type: String })
  label = '';

  /** Sections discovered from `for`. */
  @state() private discovered: AnchorNavItem[] = [];

  /** The id of the section in view. */
  @state() private currentId = '';

  // ── Private fields ───────────────────────────────────────────────────────

  /** Peacock's strings for the landmark name. */
  private readonly i18n = new I18nController(this);

  /** The section elements, in item order. */
  private targets: HTMLElement[] = [];

  /** The element the sections scroll in; `null` for the page. */
  private scroller: HTMLElement | null = null;

  /** Fires as sections cross the activation line. */
  private intersectionObserver?: IntersectionObserver;

  /** Follows headings in `for` being added, removed or renamed. */
  private mutationObserver?: MutationObserver;

  /** Whether the scroll container was scrolled to its end at the last scroll event. */
  private atEnd = false;

  /** The section a link press scrolled to, current until the person scrolls on their own. */
  private pending?: { id: string; settled: boolean };

  private settleTimer?: ReturnType<typeof setTimeout>;

  private rediscoverQueued = false;

  // ── Lifecycle ────────────────────────────────────────────────────────────

  override connectedCallback() {
    super.connectedCallback();
    if (this.hasUpdated) this.refresh();
  }

  override disconnectedCallback() {
    super.disconnectedCallback();
    this.teardown();
    this.mutationObserver?.disconnect();
    this.mutationObserver = undefined;
  }

  protected override willUpdate(changed: PropertyValues<this>) {
    if (changed.has('for')) this.watchContainer();
  }

  protected override updated(changed: PropertyValues) {
    super.updated(changed);
    if (
      changed.has('items') ||
      changed.has('for') ||
      changed.has('scrollContainer') ||
      changed.has('discovered')
    ) {
      this.spy();
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  /** The id of the section in view, or `''`. */
  get current(): string {
    return this.currentId;
  }

  /** Discovers the headings again, finds the sections and their scroll container, and works out the current one. */
  refresh() {
    this.watchContainer();
    this.discover();
    this.spy();
  }

  // ── Private methods ──────────────────────────────────────────────────────

  /** The items in effect: `items`, else those discovered from `for`. */
  private get resolvedItems(): AnchorNavItem[] {
    return this.items ?? this.discovered;
  }

  private get root(): Document | ShadowRoot {
    const root = this.getRootNode();
    return root instanceof ShadowRoot ? root : document;
  }

  private get container(): HTMLElement | null {
    return this.for ? this.root.getElementById(this.for) : null;
  }

  private watchContainer() {
    this.mutationObserver?.disconnect();
    this.mutationObserver = undefined;
    const { container } = this;
    if (container) {
      this.mutationObserver = new MutationObserver(() =>
        this.queueRediscover(),
      );
      this.mutationObserver.observe(container, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }
    this.discover();
  }

  private queueRediscover() {
    if (this.rediscoverQueued) return;
    this.rediscoverQueued = true;
    queueMicrotask(() => {
      this.rediscoverQueued = false;
      this.discover();
    });
  }

  /** Lists the `h2` and `h3` headings of `for`, giving each one without an id an id. */
  private discover() {
    const { container } = this;
    if (!container) {
      if (this.discovered.length) this.discovered = [];
      return;
    }
    const headings = Array.from(
      container.querySelectorAll<HTMLElement>(
        Object.keys(DISCOVERED_HEADINGS).join(', '),
      ),
    );
    const items = headings.map(heading => {
      if (!heading.id) {
        const base = slug(heading.textContent ?? '');
        let id = base;
        for (let n = 2; this.root.getElementById(id); n += 1)
          id = `${base}-${n}`;
        heading.setAttribute('id', id);
      }
      return {
        id: heading.id,
        label: (heading.textContent ?? '').trim().replace(/\s+/g, ' '),
        level: DISCOVERED_HEADINGS[heading.localName],
      };
    });
    const same =
      items.length === this.discovered.length &&
      items.every(
        (item, index) =>
          item.id === this.discovered[index].id &&
          item.label === this.discovered[index].label &&
          item.level === this.discovered[index].level,
      );
    if (!same) this.discovered = items;
  }

  private findTarget(id: string): HTMLElement | null {
    const { container } = this;
    if (container) {
      const inside = container.querySelector<HTMLElement>(`#${CSS.escape(id)}`);
      if (inside) return inside;
    }
    return this.root.getElementById(id) ?? document.getElementById(id);
  }

  /** The element the sections scroll in, or `null` for the page. */
  private findScroller(target: HTMLElement | undefined): HTMLElement | null {
    const selected = this.scrollContainer
      ? (this.root.querySelector<HTMLElement>(this.scrollContainer) ??
        document.querySelector<HTMLElement>(this.scrollContainer))
      : null;
    if (selected && isScrollable(selected)) return selected;
    // Walk up from the sections, through shadow roots (such as a wc-scroll-area's viewport).
    let node: Element | null = target ? composedParent(target) : null;
    while (
      node &&
      node !== document.body &&
      node !== document.documentElement
    ) {
      if (node instanceof HTMLElement && isScrollable(node)) return node;
      if (node === selected) break;
      node = composedParent(node);
    }
    return selected;
  }

  private teardown() {
    this.intersectionObserver?.disconnect();
    this.intersectionObserver = undefined;
    this.scrollTarget.removeEventListener('scroll', this.handleScroll);
    clearTimeout(this.settleTimer);
    this.pending = undefined;
  }

  private get scrollTarget(): HTMLElement | Window {
    return this.scroller ?? window;
  }

  /** Finds the sections and their scroll container, and watches them. */
  private spy() {
    this.teardown();
    this.targets = this.resolvedItems
      .map(item => this.findTarget(item.id))
      .filter((target): target is HTMLElement => target !== null);
    this.scroller = this.findScroller(this.targets[0]);
    if (this.targets.length === 0) {
      this.setCurrent('');
      return;
    }
    this.scrollTarget.addEventListener('scroll', this.handleScroll, {
      passive: true,
    });
    if (typeof IntersectionObserver !== 'undefined') {
      this.intersectionObserver = new IntersectionObserver(
        () => {
          if (!this.pending) this.syncCurrent();
        },
        { root: this.scroller, rootMargin: ROOT_MARGIN, threshold: [0, 1] },
      );
      for (const target of this.targets)
        this.intersectionObserver.observe(target);
    }
    this.atEnd = this.scrolledToEnd();
    this.syncCurrent();
  }

  /** The top and height of the scroll container's visible area, in viewport coordinates. */
  private viewportBox(): { top: number; height: number } {
    if (!this.scroller) return { top: 0, height: window.innerHeight };
    const rect = this.scroller.getBoundingClientRect();
    return {
      top: rect.top + this.scroller.clientTop,
      height: this.scroller.clientHeight,
    };
  }

  private scrolledToEnd(): boolean {
    const scroller = this.scroller ?? document.scrollingElement;
    if (!scroller) return false;
    const { scrollTop, clientHeight, scrollHeight } = scroller;
    return (
      scrollHeight > clientHeight &&
      scrollTop + clientHeight >= scrollHeight - 2
    );
  }

  /** Works out the section in view from where the sections are. */
  private syncCurrent() {
    const { targets } = this;
    if (targets.length === 0) return;
    const { top, height } = this.viewportBox();
    const line = top + height * ACTIVATION_RATIO;
    let index = 0;
    targets.forEach((target, i) => {
      if (target.getBoundingClientRect().top <= line + 1) index = i;
    });
    // At the end, the last section is in view even when it is too short to reach the line.
    if (this.atEnd) {
      const last = targets[targets.length - 1];
      if (last.getBoundingClientRect().top < top + height)
        index = targets.length - 1;
    }
    this.setCurrent(targets[index].id);
  }

  private setCurrent(id: string) {
    if (id === this.currentId) return;
    this.currentId = id;
    if (id) {
      this.dispatchEvent(
        new CustomEvent<AnchorNavChangeDetail>('change', {
          detail: { value: id },
          bubbles: true,
          composed: true,
        }),
      );
    }
  }

  private handleScroll = () => {
    if (this.pending) {
      // The person scrolled after the link's scroll ended: follow them again.
      if (!this.pending.settled) return;
      this.pending = undefined;
    }
    const atEnd = this.scrolledToEnd();
    const changed = atEnd !== this.atEnd;
    this.atEnd = atEnd;
    // The observer covers sections crossing the line; reaching or leaving the end needs this.
    if (changed || !this.intersectionObserver) this.syncCurrent();
  };

  private settle = () => {
    clearTimeout(this.settleTimer);
    this.scrollTarget.removeEventListener('scrollend', this.settle);
    if (this.pending) this.pending.settled = true;
    this.atEnd = this.scrolledToEnd();
  };

  private handleLinkClick(event: MouseEvent, item: AnchorNavItem) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const target = this.findTarget(item.id);
    if (!target) return;
    event.preventDefault();

    clearTimeout(this.settleTimer);
    this.pending = { id: item.id, settled: false };
    this.setCurrent(item.id);
    this.scrollTarget.addEventListener('scrollend', this.settle, {
      once: true,
    });
    this.settleTimer = setTimeout(this.settle, SCROLL_SETTLE_MS);

    const reduceMotion =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });

    const heading = target.matches(HEADING_SELECTOR)
      ? target
      : (target.querySelector<HTMLElement>(HEADING_SELECTOR) ?? target);
    if (heading.tabIndex < 0 && !heading.hasAttribute('tabindex')) {
      heading.setAttribute('tabindex', '-1');
    }
    heading.focus({ preventScroll: true });

    if (this.updateHash) {
      window.history.replaceState(
        window.history.state,
        '',
        `#${encodeURIComponent(item.id)}`,
      );
    }
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  private renderList(nodes: ItemNode[], level: number): unknown {
    return html`<ul class=${`list level-${level}`}>
      ${nodes.map(({ item, children }) => {
        const current = item.id === this.currentId;
        return html`<li class="item">
          <a
            class=${classMap({ link: true, current })}
            part=${current ? 'link current-link' : 'link'}
            href=${`#${encodeURIComponent(item.id)}`}
            aria-current=${current ? 'location' : nothing}
            @click=${(event: MouseEvent) => this.handleLinkClick(event, item)}
            >${item.label}</a
          >${children.length ? this.renderList(children, level + 1) : nothing}
        </li>`;
      })}
    </ul>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const items = this.resolvedItems;
    const name = this.label || this.headline || this.i18n.t('anchorNavLabel');
    const labelledByHeadline = !this.label && !!this.headline;
    return html`<nav
      class="anchor-nav"
      part="nav"
      aria-label=${labelledByHeadline ? nothing : name}
      aria-labelledby=${labelledByHeadline ? 'headline' : nothing}
    >
      ${this.headline
        ? html`<div class="headline" id="headline" part="headline">
            ${this.headline}
          </div>`
        : nothing}
      ${items.length ? this.renderList(buildTree(items), 1) : nothing}
    </nav>`;
  }
}

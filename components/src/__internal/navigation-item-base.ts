import { html, LitElement, nothing, TemplateResult } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap, ClassInfo } from 'lit/directives/class-map.js';
import {
  dispatchActivationClick,
  isActivationClick,
} from './utils/dispatch-event-utils.js';
import { deprecate } from './utils/deprecate.js';
import { throttle } from './utils/throttle.js';

/**
 * Shared base of `wc-navigation-bar-item`, `wc-navigation-rail-item` and
 * `wc-navigation-drawer-item`: the current-destination state, link or button rendering, the
 * disabled reason, the badge and the throttled host click. Subclasses render the content.
 *
 * Not a component on its own: it is not registered and carries no `@IndividualComponent` marker.
 */
export abstract class NavigationItemBase extends LitElement {
  // ── Static ───────────────────────────────────────────────────────────────

  static override shadowRootOptions = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  // ── Properties ───────────────────────────────────────────────────────────

  /** Whether this item is the current destination. Sets `aria-current="page"`. */
  @property({ type: Boolean, reflect: true }) current = false;

  /**
   * Deprecated alias of `current`, kept until 4.0.
   * @deprecated Use `current`.
   */
  @property({ type: Boolean, attribute: 'active' })
  get active(): boolean {
    return this.current;
  }

  set active(value: boolean) {
    deprecate(this.localName, 'active', 'current');
    this.current = value;
  }

  /** Whether this item is disabled. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** If provided, the item renders as a link. */
  @property({ reflect: true }) href?: string;

  /** Link target. */
  @property() target: string = '_self';

  /** Identifies the item in the container's `change` event. */
  @property({ reflect: true }) value?: string;

  /** Short text, such as an unread count. The `badge` slot overrides it. */
  @property() badge?: string;

  /** Reason the item is disabled, read to screen reader users. */
  @property({ attribute: 'disabled-reason' }) disabledReason: string = '';

  /** Throttles activation clicks by this many milliseconds. No throttle when unset. */
  @property({ type: Number, attribute: 'throttle-delay' })
  throttleDelay?: number;

  // ── State ────────────────────────────────────────────────────────────────

  /** True when the `badge` slot has content. */
  @state() protected hasSlottedBadge = false;

  // ── Queries ──────────────────────────────────────────────────────────────

  @query('#item') readonly itemElement!: HTMLElement | null;

  // ── Private fields ───────────────────────────────────────────────────────

  readonly #id = crypto.randomUUID();

  /** Forwards host clicks to the inner element, throttled once `throttleDelay` is known. */
  #dispatchClick: (event: MouseEvent) => void = event =>
    this.forwardClick(event);

  // ── Lifecycle ────────────────────────────────────────────────────────────

  constructor() {
    super();
    this.addEventListener('click', this.handleHostClick);
  }

  protected override firstUpdated() {
    if (typeof this.throttleDelay === 'number') {
      this.#dispatchClick = throttle(
        (event: MouseEvent) => this.forwardClick(event),
        this.throttleDelay,
      );
    }
  }

  // ── Public methods ───────────────────────────────────────────────────────

  override focus() {
    this.itemElement?.focus();
  }

  override blur() {
    this.itemElement?.blur();
  }

  // ── Protected methods ────────────────────────────────────────────────────

  /** Extra classes for the inner link or button. */
  protected itemClasses(): ClassInfo {
    return {};
  }

  /** Whether the badge has anything to show. */
  protected get hasBadge(): boolean {
    return this.hasSlottedBadge || !!this.badge;
  }

  protected handleBadgeSlotChange(event: Event) {
    this.hasSlottedBadge =
      (event.target as HTMLSlotElement).assignedNodes({ flatten: true })
        .length > 0;
  }

  /** The content of the inner link or button. */
  protected abstract renderContent(): TemplateResult;

  // ── Private methods ──────────────────────────────────────────────────────

  private handleHostClick = (event: MouseEvent) => {
    this.#dispatchClick(event);
  };

  /** A click on the host itself (`item.click()`) activates the inner link or button. */
  private forwardClick(event: MouseEvent) {
    if (!isActivationClick(event) || !this.itemElement) return;
    this.focus();
    dispatchActivationClick(this.itemElement);
  }

  // ── Render helpers ───────────────────────────────────────────────────────

  protected renderBadge() {
    return html`<span class="badge" ?hidden=${!this.hasBadge}
      ><slot name="badge" @slotchange=${this.handleBadgeSlotChange}
        >${this.badge ?? nothing}</slot
      ></span
    >`;
  }

  protected renderDisabledReason() {
    if (!this.disabled || !this.disabledReason) return nothing;
    return html`<div
      id="disabled-reason-${this.#id}"
      class="screen-reader-only"
    >
      ${this.disabledReason}
    </div>`;
  }

  // ── Render ───────────────────────────────────────────────────────────────

  render() {
    const classes = classMap({
      item: true,
      ...this.itemClasses(),
      current: this.current,
      // Kept for consumers and styles that target the old class name.
      active: this.current,
      disabled: this.disabled,
    });
    const describedBy =
      this.disabled && this.disabledReason
        ? `disabled-reason-${this.#id}`
        : nothing;

    if (this.href && !this.disabled) {
      return html`<a
        id="item"
        class=${classes}
        href=${this.href}
        target=${this.target}
        aria-current=${this.current ? 'page' : nothing}
        >${this.renderContent()}</a
      >`;
    }

    return html`<button
        id="item"
        class=${classes}
        ?disabled=${this.disabled}
        aria-current=${this.current ? 'page' : nothing}
        aria-describedby=${describedBy}
      >
        ${this.renderContent()}
      </button>
      ${this.renderDisabledReason()}`;
  }
}

/** Detail of the `change` event that navigation bars, rails and drawers fire. */
export interface NavigationChangeDetail<
  T extends NavigationItemBase = NavigationItemBase,
> {
  /** The chosen item's `value`. */
  value: string | undefined;
  /** The chosen item's position among the container's items, in document order. */
  index: number;
  /** The chosen item. */
  item: T;
}

/**
 * The click handling the navigation containers share: finds the item the click landed on, makes
 * it the only current one and fires `change` with `{ value, index, item }`. Returns the detail, or
 * `null` when the click was not on an enabled item.
 */
export function selectNavigationItem<T extends NavigationItemBase>(
  host: HTMLElement,
  event: Event,
  selector: string,
): NavigationChangeDetail<T> | null {
  const item = (event.target as Element | null)?.closest?.(
    selector,
  ) as T | null;
  if (!item || item.disabled || !host.contains(item)) return null;

  const items = Array.from(host.querySelectorAll<T>(selector));
  for (const other of items) {
    other.current = other === item;
  }

  const detail: NavigationChangeDetail<T> = {
    value: item.value,
    index: items.indexOf(item),
    item,
  };
  host.dispatchEvent(
    new CustomEvent<NavigationChangeDetail<T>>('change', {
      detail,
      bubbles: true,
      composed: true,
    }),
  );
  return detail;
}

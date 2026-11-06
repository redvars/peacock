import { html, LitElement, nothing, type PropertyValues } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';

import {
  dispatchActivationClick,
  isActivationClick,
} from '@/__internal/utils/dispatch-event-utils.js';
import { observerSlotChangesWithCallback } from '@/__internal/utils/observe-slot-change.js';
import { throttle } from '@/__internal/utils/throttle.js';
import { isLink } from '@/__internal/utils/is-link.js';
import { spread } from '@/__internal/directive/spread.js';
import { deprecate } from '@/__internal/utils/deprecate.js';

import styles from './tab.scss';
import type { Tabs } from './tabs.js';
import IndividualComponent from '@/IndividualComponent.js';

/** Old camelCase attribute names, which HTML lowercases; they still work, with a warning. */
const LEGACY_ATTRIBUTES: Record<string, string> = {
  disabledreason: 'disabled-reason',
  throttledelay: 'throttle-delay',
};

/** An element that can point at the elements it controls (ARIA element reflection). */
type AriaControlsElement = HTMLElement & {
  ariaControlsElements?: Element[] | null;
};

/**
 * @label Tab
 * @tag wc-tab
 * @rawTag tab
 *
 * @summary A tab component for use within tabs.
 * @overview
 * <p>Tab represents an individual tab in a <code>wc-tabs</code> list. It renders a control with
 * <code>role="tab"</code> and <code>aria-selected</code>; inside a <code>wc-tab-group</code> the
 * control also points at its panel.</p>
 * <p>A tab with <code>href</code> is a link, not a tab: it renders a plain <code>&lt;a&gt;</code>
 * with <code>aria-current="page"</code> when selected. Tabs that navigate between pages are
 * navigation, so put link tabs in a <code>&lt;nav&gt;</code>.</p>
 * <p>Deprecated: <code>active</code> (use <code>selected</code>), and the
 * <code>disabledreason</code> and <code>throttledelay</code> attributes (use
 * <code>disabled-reason</code> and <code>throttle-delay</code>).</p>
 *
 * @slot - The tab label.
 * @slot icon - An icon shown with the label.
 * @slot badge - A badge shown with the label.
 *
 * @example
 * ```html
 * <wc-tab selected>Tab Label</wc-tab>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class Tab extends LitElement {
  // ── Static

  /** @nocollapse */ // eslint-disable-next-line
  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  static styles = [styles];

  static override get observedAttributes() {
    return [...super.observedAttributes, ...Object.keys(LEGACY_ATTRIBUTES)];
  }

  // ── Properties

  /** Whether this is the chosen tab. Reflects to `aria-selected` (or `aria-current` on a link tab). */
  @property({ type: Boolean, reflect: true }) selected = false;

  /**
   * Deprecated alias of `selected`.
   * @deprecated Use `selected`.
   */
  @property({ type: Boolean, noAccessor: true })
  get active(): boolean {
    return this.selected;
  }

  set active(value: boolean) {
    deprecate('wc-tab', '`active`', '`selected`');
    this.selected = Boolean(value);
  }

  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Why the tab is disabled; read to screen reader users. */
  @property({ type: String, attribute: 'disabled-reason' })
  disabledReason = '';

  /** Links the tab to the `wc-tab-panel` with the same `value`, and is sent in `change`. */
  @property({ type: String }) value?: string;

  /** ARIA attributes spread onto the inner control. */
  @property({ type: Object })
  configAria?: { [key: string]: any };

  /**
   * Sets or retrieves the window or frame at which to target content.
   */
  @property() target: string = '_self';

  @property({ type: String, reflect: true }) href?: string;

  /**
   * Sets the delay for throttle in milliseconds. When unset (default), no throttle is applied.
   */
  @property({ type: Number, attribute: 'throttle-delay' })
  throttleDelay?: number;

  /** The panel this tab controls; set by `wc-tab-group`. */
  @property({ attribute: false }) panel?: HTMLElement | null;

  // ── State

  @state() slotHasContent = false;

  @state() slotHasIcon = false;

  @state() slotHasBadge = false;

  // ── Queries

  @query('.tab-element') readonly tabElement!: HTMLElement | null;

  // ── Private fields

  #id = crypto.randomUUID();

  // ── Lifecycle

  constructor() {
    super();
    this.addEventListener('click', this.__dispatchClickWithThrottle);
  }

  override attributeChangedCallback(
    name: string,
    old: string | null,
    value: string | null,
  ) {
    super.attributeChangedCallback(name, old, value);
    const replacement = LEGACY_ATTRIBUTES[name];
    if (!replacement || value === null) return;
    deprecate('wc-tab', `the \`${name}\` attribute`, `\`${replacement}\``);
    if (name === 'disabledreason') this.disabledReason = value;
    else this.throttleDelay = Number(value);
  }

  override firstUpdated() {
    if (typeof this.throttleDelay === 'number') {
      this.__dispatchClickWithThrottle = throttle(
        this.__dispatchClick,
        this.throttleDelay,
      );
    }
    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot:not([name])'),
      hasContent => {
        this.slotHasContent = hasContent;
      },
    );

    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot[name="icon"]'),
      hasContent => {
        this.slotHasIcon = hasContent;
      },
    );

    observerSlotChangesWithCallback(
      this.renderRoot.querySelector('slot[name="badge"]'),
      hasContent => {
        this.slotHasBadge = hasContent;
      },
    );
  }

  override updated(changed: PropertyValues) {
    super.updated(changed);
    // The panel is in the light DOM and the control in this shadow root, so an id reference
    // cannot reach it; element reflection can (where the browser supports it).
    const control = this.tabElement as AriaControlsElement | null;
    if (control && 'ariaControlsElements' in control) {
      control.ariaControlsElements =
        this.panel && !isLink(this) ? [this.panel] : null;
    }
  }

  // ── Public

  override focus(options?: Parameters<HTMLElement['focus']>[0]) {
    this.tabElement?.focus(options);
  }

  override blur() {
    this.tabElement?.blur();
  }

  // ── Private

  __dispatchClickWithThrottle: (event: MouseEvent | KeyboardEvent) => void =
    event => {
      this.__dispatchClick(event);
    };

  __dispatchClick = (event: MouseEvent | KeyboardEvent) => {
    // A disabled link must not navigate, and its click must not reach other listeners.
    if (this.disabled && this.href) {
      event.stopImmediatePropagation();
      event.preventDefault();
      return;
    }

    if (!isActivationClick(event) || !this.tabElement) {
      return;
    }

    this.focus();
    dispatchActivationClick(this.tabElement);
  };

  __getParentTabsVariant(): Tabs['variant'] {
    return (this.closest('wc-tabs') as Tabs | null)?.variant ?? 'primary';
  }

  __getDisabledReasonID() {
    return this.disabled && this.disabledReason
      ? `disabled-reason-${this.#id}`
      : nothing;
  }

  // ── Render helpers

  renderTabContent(variant: Tabs['variant']) {
    switch (variant) {
      case 'secondary':
        return this.renderSecondaryTabContent();
      case 'contained':
        return this.renderContainedTabContent();
      case 'filled':
        return this.renderFilledTabContent();
      case 'primary':
      default:
        return this.renderPrimaryTabContent();
    }
  }

  renderPrimaryTabContent() {
    return html`
      <wc-focus-ring class="focus-ring" for="button"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <div class="outline"></div>
      <wc-ripple class="ripple"></wc-ripple>

      <div class="tab-content">
        <div class="icon-section">
          <slot name="badge"></slot>
          <slot name="icon"></slot>
        </div>
        <div class="slot-container">
          <slot></slot>
        </div>

        <div class="indicator"></div>
      </div>

      ${this.__renderDisabledReason()}
    `;
  }

  renderSecondaryTabContent() {
    return html`
      <wc-focus-ring class="focus-ring" for="button"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <div class="outline"></div>
      <wc-ripple class="ripple"></wc-ripple>

      <div class="tab-content">
        <slot name="icon"></slot>

        <div class="slot-container">
          <slot></slot>
        </div>

        <slot name="badge"></slot>
      </div>

      <div class="indicator"></div>

      ${this.__renderDisabledReason()}
    `;
  }

  renderContainedTabContent() {
    return this.renderSegmentedTabContent();
  }

  renderFilledTabContent() {
    return this.renderSegmentedTabContent();
  }

  renderSegmentedTabContent() {
    return html`
      <wc-focus-ring class="focus-ring" for="button"></wc-focus-ring>
      <wc-elevation class="elevation"></wc-elevation>
      <div class="background"></div>
      <div class="outline"></div>
      <wc-ripple class="ripple"></wc-ripple>

      <div class="tab-content">
        <slot name="icon"></slot>

        <div class="slot-container">
          <slot></slot>
        </div>

        <slot name="badge"></slot>
      </div>

      ${this.__renderDisabledReason()}
    `;
  }

  __renderDisabledReason() {
    if (this.disabled && this.disabledReason)
      return html`<div
        id="disabled-reason-${this.#id}"
        role="tooltip"
        aria-label=${this.disabledReason}
        class="screen-reader-only"
      >
        ${this.disabledReason}
      </div>`;
    return nothing;
  }

  // ── Render

  render() {
    const variant = this.__getParentTabsVariant();

    const cssClasses = {
      tab: true,
      'tab-element': true,
      disabled: this.disabled,
      active: this.selected,
      [`variant-${variant}`]: true,
      'has-content': this.slotHasContent,
      'has-icon': this.slotHasIcon,
      'has-badge': this.slotHasBadge,
    };

    if (!isLink(this)) {
      return html`<button
        id="button"
        class=${classMap(cssClasses)}
        role="tab"
        aria-selected=${this.selected ? 'true' : 'false'}
        aria-describedby=${this.__getDisabledReasonID()}
        aria-disabled=${`${this.disabled}`}
        ?disabled=${this.disabled}
        ${spread(this.configAria)}
      >
        ${this.renderTabContent(variant)}
      </button>`;
    }

    // A link tab navigates: it is a plain link, marked as the current page when selected.
    return html`<a
      class=${classMap(cssClasses)}
      id="button"
      href=${this.href}
      target=${this.target}
      aria-current=${this.selected ? 'page' : nothing}
      aria-describedby=${this.__getDisabledReasonID()}
      aria-disabled=${`${this.disabled}`}
      ${spread(this.configAria)}
    >
      ${this.renderTabContent(variant)}
    </a>`;
  }
}

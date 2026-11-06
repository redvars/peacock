import { html, LitElement, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './navigation-rail.scss';
import { NavigationRailItem } from './navigation-rail-item.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';

/**
 * @label Navigation Rail
 * @tag wc-navigation-rail
 * @rawTag navigation-rail
 *
 * @summary A vertical side navigation for medium-sized screens,.
 * @overview
 * <p>Navigation rail provides access to primary destinations in an app using icons—with or without labels—on a vertical rail.</p>
 * <p>Use navigation rail on medium-sized screens (tablets) with 3–7 destinations.</p>
 *
 * @slot header - Content displayed above the rail items.
 * @slot footer - Content pinned to the bottom of the rail.
 *
 * @cssprop --nav-rail-width - Width of the rail container. Defaults to 5rem (80dp).
 * @cssprop --nav-rail-container-color - Background color of the rail. Defaults to surface color.
 * @cssprop --nav-rail-indicator-color - Color of the active indicator. Defaults to secondary-container.
 * @cssprop --nav-rail-indicator-shape - Shape (border-radius) of the active indicator. Defaults to full (pill).
 * @cssprop --nav-rail-indicator-width - Width of the active indicator. Defaults to 3.5rem (56dp).
 * @cssprop --nav-rail-indicator-height - Height of the active indicator. Defaults to 2rem (32dp).
 * @cssprop --nav-rail-inactive-icon-color - Color of inactive icons. Defaults to on-surface-variant.
 * @cssprop --nav-rail-active-icon-color - Color of active icons. Defaults to on-secondary-container.
 * @cssprop --nav-rail-inactive-label-color - Color of inactive labels. Defaults to on-surface-variant.
 * @cssprop --nav-rail-active-label-color - Color of active labels. Defaults to on-surface.
 *
 * @example
 * ```html
 * <wc-navigation-rail>
 *   <wc-navigation-rail-item active>
 *     <wc-icon slot="icon" name="home"></wc-icon>
 *     Home
 *   </wc-navigation-rail-item>
 *   <wc-navigation-rail-item>
 *     <wc-icon slot="icon" name="search"></wc-icon>
 *     Search
 *   </wc-navigation-rail-item>
 * </wc-navigation-rail>
 * ```
 * @tags navigation
 */
@IndividualComponent
export class NavigationRail extends LitElement {
  static styles = [styles];

  static Item = NavigationRailItem;

  /**
   * Display mode of the navigation rail.
   * - `"expanded"`: shows labels.
   * - `"collapsed"`: hides labels.
   */
  @property({ reflect: true }) mode: 'expanded' | 'collapsed' = 'expanded';

  /**
   * Whether to show a divider between the header and items sections.
   */
  @property({ type: Boolean, attribute: 'show-divider' }) showDivider = false;

  /** Peacock's strings for the default landmark label. */
  private readonly i18n = new I18nController(this);

  /** The `aria-label` the rail set itself, so it follows the string table until the author sets one. */
  private _defaultLabel?: string;

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener('click', this._handleItemClick);
    this.setAttribute('role', 'navigation');
    this._syncLabel();
  }

  disconnectedCallback() {
    this.removeEventListener('click', this._handleItemClick);
    super.disconnectedCallback();
  }

  protected override firstUpdated() {
    this._syncItemMode();
  }

  protected override willUpdate() {
    this._syncLabel();
  }

  protected override updated(changedProperties: PropertyValues<this>) {
    if (changedProperties.has('mode')) {
      this._syncItemMode();
    }
  }

  private _handleItemClick = (event: Event) => {
    const target = event.target as HTMLElement;
    const item = target.closest('wc-navigation-rail-item') as NavigationRailItem | null;

    if (!item || item.disabled) return;

    // Deactivate all items and activate the clicked one
    for (const railItem of this._getItems()) {
      railItem.active = railItem === item;
    }

    this.dispatchEvent(
      new CustomEvent('nav-change', {
        detail: {
          value: item.value,
          item,
        },
        bubbles: true,
        composed: true,
      }),
    );
  };

  /** Gives the landmark the default label unless the author set one. */
  private _syncLabel() {
    const current = this.getAttribute('aria-label');
    if (current !== null && current !== this._defaultLabel) return;
    this._defaultLabel = this.i18n.t('mainNavigation');
    this.setAttribute('aria-label', this._defaultLabel);
  }

  private _getItems(): NavigationRailItem[] {
    return Array.from(
      this.querySelectorAll('wc-navigation-rail-item'),
    ) as NavigationRailItem[];
  }

  private _syncItemMode = () => {
    const isCollapsed = this.mode === 'collapsed';
    for (const railItem of this._getItems()) {
      railItem.collapsed = isCollapsed;
    }
  };

  render() {
    const cssClasses = {
      rail: true,
      [`mode-${this.mode}`]: true,
    };

    return html`
      <div class=${classMap(cssClasses)}>
        <div class="header">
          <slot name="header"></slot>
        </div>
        ${this.showDivider ? html`<wc-divider></wc-divider>` : ''}
        <nav class="items" role="presentation">
          <slot @slotchange=${this._syncItemMode}></slot>
        </nav>
        <div class="footer">
          <slot name="footer"></slot>
        </div>
      </div>
    `;
  }
}

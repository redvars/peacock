import { html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './tooltip.scss';
import { PopoverController } from '../PopoverController.js';

// Define a type for valid trigger combinations
export type TooltipTrigger = 'hover' | 'focus' | 'click';

/**
 * @label Tooltip
 * @tag p-tooltip
 * @rawTag tooltip
 * @summary Displays a tooltip for an element.
 *
 * @example
 * ```html
 * <span class="tooltip">Tooltip</span>
 * ```
 * @tags display
 */
export class Tooltip extends LitElement {
  static styles = [styles];

  @property() content: string = '';

  /**
   * The ID of the element the tooltip should attach to.
   * If not provided, it defaults to the parent element.
   */
  @property() for: string = '';

  @property({ type: String }) trigger: string = 'hover focus';

  @property({ type: Boolean, reflect: true }) open = false;

  @property({ type: String, reflect: true }) variant: 'plain' | 'rich' =
    'plain';

  @query('#tooltip') floatingEl!: HTMLElement;

  private _target: HTMLElement | null = null;

  private _popover = new PopoverController(this, {
    placement: 'top',
    offset: 8,
  });

  private static CLOSE_OTHERS_EVENT = 'tooltip--open';

  private hasTrigger(type: TooltipTrigger): boolean {
    return this.trigger.split(' ').includes(type);
  }

  // Define listeners as arrow functions to maintain 'this' context
  private _onMouseEnter = () => this.hasTrigger('hover') && this.show();

  private _onMouseLeave = () => this.hasTrigger('hover') && this.hide();

  private _onFocusIn = () => this.hasTrigger('focus') && this.show();

  private _onFocusOut = (e: FocusEvent) => {
    if (!this.hasTrigger('focus')) return;
    if (this._target && !this._target.contains(e.relatedTarget as Node)) {
      this.hide();
    }
  };

  private _onClick = (e: MouseEvent) => {
    if (!this.hasTrigger('click')) return;
    e.stopPropagation();
    this.toggle();
  };

  private show() {
    if (this.open) return;
    window.dispatchEvent(
      new CustomEvent(Tooltip.CLOSE_OTHERS_EVENT, {
        detail: { invoker: this },
      }),
    );
    this.open = true;
  }

  private hide() {
    if (!this.open) return;
    this.open = false;
  }

  private toggle() {
    // eslint-disable-next-line no-unused-expressions
    this.open ? this.hide() : this.show();
  }

  private _handleGlobalOpen = (e: any) => {
    if (e.detail.invoker !== this) this.hide();
  };

  private _handleDocumentClick = (e: MouseEvent) => {
    const path = e.composedPath();
    if (this._target && !path.includes(this._target)) {
      this.hide();
    }
  };

  private detachListeners() {
    if (!this._target) return;
    this._target.removeEventListener('mouseenter', this._onMouseEnter);
    this._target.removeEventListener('mouseleave', this._onMouseLeave);
    this._target.removeEventListener('focusin', this._onFocusIn);
    this._target.removeEventListener('focusout', this._onFocusOut);
    this._target.removeEventListener('click', this._onClick);
    this._target = null;
  }

  private attachListeners() {
    this.detachListeners(); // Cleanup old target if it exists

    // Resolve target: ID-based lookup or fallback to parent
    const root = this.getRootNode() as ShadowRoot | Document;
    this._target = this.for
      ? (root.getElementById(this.for) as HTMLElement)
      : this.parentElement;

    if (!this._target) return;

    this._target.addEventListener('mouseenter', this._onMouseEnter);
    this._target.addEventListener('mouseleave', this._onMouseLeave);
    this._target.addEventListener('focusin', this._onFocusIn);
    this._target.addEventListener('focusout', this._onFocusOut);
    this._target.addEventListener('click', this._onClick);
  }

  connectedCallback() {
    super.connectedCallback();
    this.attachListeners();
    window.addEventListener(Tooltip.CLOSE_OTHERS_EVENT, this._handleGlobalOpen);
    window.addEventListener('click', this._handleDocumentClick);
  }

  disconnectedCallback() {
    this.detachListeners();
    window.removeEventListener(
      Tooltip.CLOSE_OTHERS_EVENT,
      this._handleGlobalOpen,
    );
    window.removeEventListener('click', this._handleDocumentClick);
    super.disconnectedCallback();
  }

  protected updated(changedProps: Map<string, any>) {
    // If the 'for' property changes, re-bind listeners to the new target
    if (changedProps.has('for')) {
      this.attachListeners();
    }

    if (changedProps.has('open') && this.open && this._target) {
      this._popover.updatePosition(this._target, this.floatingEl);
    }
  }

  render() {
    return html` <div
      class=${classMap({
        tooltip: true,
        open: this.open,
        [`variant-${this.variant}`]: true,
      })}
      id="tooltip"
      role="tooltip"
      aria-hidden=${!this.open}
      aria-labelledby="tooltip-labelledby"
    >
      ${this.variant === 'plain'
        ? this.__renderPlainTooltip()
        : this.__renderRichTooltip()}
    </div>`;
  }

  // eslint-disable-next-line class-methods-use-this
  __renderPlainTooltip() {
    return html`<div class="tooltip-content" id="tooltip-labelledby">
      <slot></slot>
    </div>`;
  }

  // eslint-disable-next-line class-methods-use-this
  __renderRichTooltip() {
    return html`
      <div class="tooltip-content">
        <p-elevation class="elevation"></p-elevation>

        <div class="tooltip-title" id="tooltip-labelledby">
          <slot name="title"></slot>
        </div>
        <div class="tooltip-suport-text">
          <slot></slot>
        </div>
      </div>
    `;
  }
}

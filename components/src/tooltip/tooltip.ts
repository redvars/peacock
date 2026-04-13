import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './tooltip.scss';
import { FloatingController } from '../__controllers/floating-controller.js';

// Define a type for valid trigger combinations
export type TooltipTrigger = 'hover' | 'focus' | 'click';

/**
 * @label Tooltip
 * @tag wc-tooltip
 * @rawTag tooltip
 * @summary Displays a tooltip for an element.
 * @tags display
 *
 * @example
 * ```html
 * <wc-tooltip preview>Tooltip</wc-tooltip>
 * ```
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

  @property({ type: Boolean, reflect: true }) preview = false;

  private _target: HTMLElement | null = null;

  private _floating: FloatingController | null = null;

  private resolveTrigger(): 'hover' | 'click' | 'focus' | 'manual' | 'hover-focus' {
    if (this.preview) return 'manual';

    const triggerTokens = this.trigger.split(' ');
    const hasHover = triggerTokens.includes('hover');
    const hasFocus = triggerTokens.includes('focus');
    const hasClick = triggerTokens.includes('click');

    if (hasClick) return 'click';
    if (hasHover && hasFocus) return 'hover-focus';
    if (hasFocus) return 'focus';
    if (hasHover) return 'hover';
    return 'manual';
  }

  private detachListeners() {
    if (this._floating) {
      this._floating.close();
      this._floating = null;
    }
    this._target = null;
  }

  _focusTarget?: HTMLElement;

  set forElement(value: HTMLElement | null) {
    if (value) {
      this._focusTarget = value;
    } else {      
      this._focusTarget = undefined;
    }
  }

  __getFocusTarget(): HTMLElement | null {

    if (this._focusTarget) {
      return this._focusTarget;
    }

    const focusTarget = document.getElementById(this.for);
     if (focusTarget) {
      return focusTarget
     }

     return this.parentElement;
  }

  private attachListeners() {
    this.detachListeners();

    // Resolve target: ID-based lookup or fallback to parent
    const root = this.getRootNode() as ShadowRoot | Document;
    this._target = this.for
      ? (root.getElementById(this.for) as HTMLElement)
      : this.parentElement;

    if (!this._target) return;

    this._floating = new FloatingController(this, {
      placement: 'top',
      strategy: 'fixed',
      offset: 0,
      trigger: this.resolveTrigger(),
      closeOnClickOutside: true,
      onOpenChange: (isOpen) => {
        if (this.open === isOpen) return;
        this.open = isOpen;
      },
    });

    this._floating.setElements(this._target, this);
  }

  connectedCallback() {
    super.connectedCallback();
    this.attachListeners();
  }

  disconnectedCallback() {
    this.detachListeners();
    super.disconnectedCallback();
  }

  protected updated(changedProps: Map<string, any>) {
    // If the 'for' property changes, re-bind listeners to the new target
    if (changedProps.has('for')) {
      this.attachListeners();
    }

    if (changedProps.has('trigger') || changedProps.has('preview')) {
      this.attachListeners();
    }

    if (this._floating && this._target) {
      this._floating.setElements(this._target, this);

      if (changedProps.has('open') && this.open && !this._floating.isOpen) {
        this._floating.open();
      }

      if (changedProps.has('open') && !this.open && this._floating.isOpen) {
        this._floating.close();
      }
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
        <wc-elevation class="elevation"></wc-elevation>

        <div class="tooltip-title" id="tooltip-labelledby">
          <slot name="title"></slot>
        </div>
        <div class="tooltip-support-text">
          <slot></slot>
        </div>
        <div class="tooltip-actions">
          <slot name="actions"></slot>
        </div>
      </div>
    `;
  }
}

import { html, LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import type { Placement } from '@floating-ui/dom';
import IndividualComponent from '@/IndividualComponent.js';
import { FloatingController } from '../__controllers/floating-controller.js';
import styles from './popover.scss';
import type { PopoverContent } from './popover-content.js';

/**
 * @label Popover
 * @tag wc-popover
 * @rawTag popover
 * @summary Displays additional information in a floating panel anchored to a trigger element.
 * @overview
 * <p>The Popover component wraps a trigger element and a <code>wc-popover-content</code> child. It uses
 * floating-ui to compute position, keeping the panel visible inside the viewport even on scroll.</p>
 * @tags display
 *
 * @fires {CustomEvent} wc-popover--open - Fired when the popover opens.
 * @fires {CustomEvent} wc-popover--close - Fired when the popover closes.
 *
 * @example
 * ```html
 * <wc-popover trigger="click">
 *   <wc-button>Open popover</wc-button>
 *   <wc-popover-content>
 *     <p>Popover body text goes here.</p>
 *   </wc-popover-content>
 * </wc-popover>
 * ```
 */
@IndividualComponent
export class Popover extends LitElement {
  static styles = [styles];

  /**
   * Determines how the popover is triggered.
   * Possible values are `"click"`, `"hover"`, `"manual"`.
   */
  @property({ reflect: true }) trigger: 'click' | 'hover' | 'manual' = 'click';

  /**
   * Preferred placement of the popover relative to the trigger element.
   * Accepts any floating-ui `Placement` string such as `"bottom"`, `"top-start"`, `"right"`, etc.
   */
  @property({ reflect: true }) placement: Placement = 'bottom';

  /**
   * Whether the popover is open.
   */
  @property({ type: Boolean, reflect: true }) open = false;

  /**
   * Distance in pixels between the trigger element and the popover panel.
   */
  @property({ type: Number }) offset = 8;

  private _floating: FloatingController | null = null;

  private _contentEl: PopoverContent | null = null;

  private _triggerEl: HTMLElement | null = null;

  private _setupFloating() {
    // Tear down any existing controller
    if (this._floating) {
      this._floating = null;
    }

    // Resolve the content element
    this._contentEl = this.querySelector<PopoverContent>('wc-popover-content');

    // Resolve the trigger element: first light-DOM child that is NOT wc-popover-content
    this._triggerEl =
      (Array.from(this.children).find(
        (c) => c.tagName.toLowerCase() !== 'wc-popover-content',
      ) as HTMLElement) ?? null;

    if (!this._triggerEl || !this._contentEl) return;

    const triggerMode =
      this.trigger === 'manual'
        ? 'manual'
        : (this.trigger as 'click' | 'hover');

    this._floating = new FloatingController(this, {
      placement: this.placement,
      strategy: 'fixed',
      offset: this.offset,
      trigger: triggerMode,
      closeOnClickOutside: true,
      onOpenChange: (isOpen) => {
        this.open = isOpen;
        if (this._contentEl) {
          this._contentEl.open = isOpen;
        }
        this.dispatchEvent(
          new CustomEvent(isOpen ? 'wc-popover--open' : 'wc-popover--close', {
            bubbles: true,
            composed: true,
          }),
        );
      },
    });

    this._floating.setElements(
      this._triggerEl,
      this._contentEl as unknown as HTMLElement,
    );

    if (this.open) {
      this._floating.open();
      this._contentEl.open = true;
    }
  }

  connectedCallback() {
    super.connectedCallback();
  }

  firstUpdated() {
    this._setupFloating();
  }

  updated(changedProps: Map<string, unknown>) {
    if (
      changedProps.has('trigger') ||
      changedProps.has('placement') ||
      changedProps.has('offset')
    ) {
      this._setupFloating();
    }

    if (changedProps.has('open') && this._floating) {
      if (this.open && !this._floating.isOpen) {
        this._floating.open();
        if (this._contentEl) this._contentEl.open = true;
      } else if (!this.open && this._floating.isOpen) {
        this._floating.close();
        if (this._contentEl) this._contentEl.open = false;
      }
    }
  }

  /**
   * Programmatically opens the popover.
   */
  show() {
    if (this._floating && !this._floating.isOpen) {
      this._floating.open();
    } else if (!this._floating) {
      this.open = true;
    }
  }

  /**
   * Programmatically closes the popover.
   */
  hide() {
    if (this._floating && this._floating.isOpen) {
      this._floating.close();
    } else if (!this._floating) {
      this.open = false;
    }
  }

  render() {
    return html`<slot></slot>`;
  }
}

import { html, LitElement } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import styles from './tooltip.scss';
import { PopoverController } from '../PopoverController.js';

// Define a type for valid trigger combinations
export type TooltipTrigger = 'hover' | 'focus' | 'click';

export class Tooltip extends LitElement {
  static styles = [styles];

  @property() content: string = '';

  /**
   * Defines how the tooltip is triggered.
   * Accepts a space-separated list: 'hover', 'focus', 'click'.
   * Default is 'hover focus'.
   */
  @property({ type: String }) trigger: string = 'hover focus';

  @state() open = false;

  @query('#tooltip') floatingEl!: HTMLElement;

  private _popover = new PopoverController(this, {
    placement: 'top',
    offset: 8,
  });

  private static CLOSE_OTHERS_EVENT = 'tooltip-open';

  // Helper to check if a specific trigger is enabled
  private hasTrigger(type: TooltipTrigger): boolean {
    return this.trigger.split(' ').includes(type);
  }

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
    if (this.parentElement && !path.includes(this.parentElement)) {
      this.hide();
    }
  };

  connectedCallback() {
    super.connectedCallback();
    const parent = this.parentElement;
    if (!parent) return;

    // Hover Listeners
    parent.addEventListener('mouseenter', () => {
      if (this.hasTrigger('hover')) this.show();
    });
    parent.addEventListener('mouseleave', () => {
      if (this.hasTrigger('hover')) this.hide();
    });

    // Focus Listeners
    parent.addEventListener('focusin', () => {
      if (this.hasTrigger('focus')) this.show();
    });
    parent.addEventListener('focusout', (e: FocusEvent) => {
      if (!this.hasTrigger('focus')) return;
      if (!parent.contains(e.relatedTarget as Node)) {
        this.hide();
      }
    });

    // Click Listener
    parent.addEventListener('click', e => {
      if (!this.hasTrigger('click')) return;
      e.stopPropagation();
      this.toggle();
    });

    window.addEventListener(Tooltip.CLOSE_OTHERS_EVENT, this._handleGlobalOpen);
    window.addEventListener('click', this._handleDocumentClick);
  }

  disconnectedCallback() {
    window.removeEventListener(
      Tooltip.CLOSE_OTHERS_EVENT,
      this._handleGlobalOpen,
    );
    window.removeEventListener('click', this._handleDocumentClick);
    super.disconnectedCallback();
  }

  protected updated(changedProps: Map<string, any>) {
    if (changedProps.has('open') && this.open) {
      this._popover.updatePosition(this.parentElement, this.floatingEl);
    }
  }

  render() {
    return html` <div
      class=${classMap({ tooltip: true, open: this.open })}
      id="tooltip"
      role="tooltip"
      aria-hidden=${!this.open}
      aria-label=${this.content}
    >
      <div class="tooltip-content">${this.content}</div>
    </div>`;
  }
}

import type { ReactiveControllerHost } from 'lit';
import type { CloseReason } from './controllers/overlay-controller.js';
import type {
  Menu,
  MenuCloseDetail,
  MenuFocusTarget,
} from '../menu/menu/menu.js';

export interface MenuTriggerOptions {
  /** The menu the trigger opens, usually a `@query('wc-menu')` of the host. */
  menu: () => Menu | null | undefined;
  /** Whether the trigger is disabled; a disabled trigger never opens the menu. */
  disabled: () => boolean;
  /** Prefix of the generated menu id, such as `dropdown-menu`. */
  idPrefix: string;
}

/**
 * The menu wiring shared by buttons that open a `wc-menu` (dropdown button, split button):
 * show / close / toggle, Arrow Up / Down on the trigger, the trigger's `aria-haspopup`,
 * `aria-expanded` and `aria-controls`, and the host's `open` / `close` events (ADR-030001).
 *
 * The menu's own `open` / `close` events are stopped inside the host, which fires its own `open`
 * and `close` instead; `close` carries `detail.reason` from the menu's close event. The host renders the menu with `id=${trigger.menuId}`, `@open=${trigger.handleMenuOpen}`
 * and `@close=${trigger.handleMenuClose}`, and the trigger button with
 * `.configAria=${trigger.triggerAria}`, `@click=${trigger.handleTriggerClick}` and
 * `@keydown=${trigger.handleTriggerKeyDown}`.
 */
export class MenuTriggerController {
  /** Id for the menu, referenced by the trigger's `aria-controls`. */
  readonly menuId: string;

  private readonly host: ReactiveControllerHost & HTMLElement;

  private readonly options: MenuTriggerOptions;

  private _open = false;

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    options: MenuTriggerOptions,
  ) {
    this.host = host;
    this.options = options;
    this.menuId = `${options.idPrefix}-${Math.random().toString(36).slice(2, 9)}`;
  }

  /** Whether the menu is open, as last reported by its `open` / `close` events. */
  get open() {
    return this._open;
  }

  /** ARIA for the trigger button. */
  get triggerAria(): Record<string, string> {
    return {
      'aria-haspopup': 'menu',
      'aria-expanded': String(this._open),
      'aria-controls': this.menuId,
    };
  }

  /** Opens the menu, anchored to the host, and focuses its first (or last) item. */
  show(focusTarget: MenuFocusTarget = 'first') {
    const menu = this.options.menu();
    if (this.options.disabled() || !menu) return;
    menu.anchorElement = this.host;
    menu.show(focusTarget);
  }

  /** Closes the menu. */
  close() {
    this.options.menu()?.close();
  }

  /** Opens the menu when it is closed and closes it when it is open. */
  toggle() {
    // Read the menu itself, not cached state, so a toggle never acts on a stale value.
    if (this.options.menu()?.open) {
      this.close();
    } else {
      this.show();
    }
  }

  handleTriggerClick = (event: MouseEvent) => {
    event.stopPropagation();
    if (this.options.disabled()) return;
    this.toggle();
  };

  /** Arrow keys on the trigger open the menu on the first or last item. */
  handleTriggerKeyDown = (event: KeyboardEvent) => {
    if (this.options.disabled()) return;

    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.show(event.key === 'ArrowDown' ? 'first' : 'last');
    }
  };

  handleMenuOpen = (event: Event) => {
    if (!this._onMenuToggle(event, true)) return;
    this.host.dispatchEvent(
      new CustomEvent('open', { bubbles: true, composed: true }),
    );
  };

  handleMenuClose = (event: CustomEvent<MenuCloseDetail>) => {
    if (!this._onMenuToggle(event, false)) return;
    this.host.dispatchEvent(
      new CustomEvent<{ reason: CloseReason }>('close', {
        detail: { reason: event.detail.reason },
        bubbles: true,
        composed: true,
      }),
    );
  };

  /**
   * Stops the menu's event inside the host (the host fires its own `open` / `close`) and records
   * the new state. Returns whether the event was the menu's own rather than a submenu's.
   */
  private _onMenuToggle(event: Event, open: boolean) {
    event.stopPropagation();
    // A submenu's `open` / `close` bubble through the menu; only the menu's own count.
    if (event.target !== event.currentTarget) return false;
    this._open = open;
    this.host.requestUpdate();
    return true;
  }
}

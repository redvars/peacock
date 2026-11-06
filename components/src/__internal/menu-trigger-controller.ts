import type { ReactiveControllerHost } from 'lit';
import type { Menu, MenuFocusTarget } from '../menu/menu/menu.js';
import { deprecate } from './utils/deprecate.js';
import type { OverlayPlacement } from './utils/placement.js';

export interface MenuTriggerOptions {
  /** The menu the trigger opens, usually a `@query('wc-menu')` of the host. */
  menu: () => Menu | null | undefined;
  /** Whether the trigger is disabled; a disabled trigger never opens the menu. */
  disabled: () => boolean;
  /** Prefix of the generated menu id, such as `dropdown-menu`. */
  idPrefix: string;
  /** Tag of the host, named in deprecation warnings. */
  tag: string;
}

/**
 * The menu wiring shared by buttons that open a `wc-menu` (dropdown button, split button):
 * show / close / toggle, Arrow Up / Down on the trigger, the trigger's `aria-haspopup`,
 * `aria-expanded` and `aria-controls`, and the host's `toggle-menu` event.
 *
 * The menu's own `open` / `close` events are stopped at the host, which reports `toggle-menu`
 * instead. The host renders the menu with `id=${trigger.menuId}`, `@open=${trigger.handleMenuOpen}`
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

  /**
   * The placement to give the menu. The physical `left` / `right` sides are turned into the
   * logical `start` / `end` for the writing direction, with a deprecation warning for the host.
   */
  menuPlacement(placement: OverlayPlacement): OverlayPlacement {
    const [side, alignment] = placement.split('-');
    if (side !== 'left' && side !== 'right') return placement;

    const logical = alignment ? (`-${alignment}` as const) : '';
    const rtl = getComputedStyle(this.host).direction === 'rtl';
    const start = (side === 'left') !== rtl;
    const replacement =
      `${start ? 'start' : 'end'}${logical}` as OverlayPlacement;
    deprecate(
      this.options.tag,
      `placement="${placement}"`,
      `placement="${side === 'left' ? 'start' : 'end'}${logical}" (logical)`,
    );
    return replacement;
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
    this._onMenuToggle(event, true);
  };

  handleMenuClose = (event: Event) => {
    this._onMenuToggle(event, false);
  };

  private _onMenuToggle(event: Event, open: boolean) {
    // The menu's events are internal; the host reports `toggle-menu` instead.
    event.stopPropagation();
    // A submenu's `open` / `close` bubble through the menu; only the menu's own count.
    if (event.target !== event.currentTarget) return;
    this._open = open;
    this.host.requestUpdate();
    this.host.dispatchEvent(
      new CustomEvent('toggle-menu', {
        detail: { open },
        bubbles: true,
        composed: true,
      }),
    );
  }
}

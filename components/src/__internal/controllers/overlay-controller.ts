import type { ReactiveController, ReactiveControllerHost } from 'lit';

/** Why an overlay closed. The same type for every overlay (ADR-030001). */
export type CloseReason =
  | 'escape'
  | 'light-dismiss'
  | 'action'
  | 'timeout'
  | 'api';

export interface OverlayOptions {
  /**
   * The element shown in the top layer: a `<dialog>` (opened with `showModal()` when `modal`,
   * `show()` otherwise) or an element with the `popover` attribute.
   */
  surface: () => HTMLElement | null | undefined;
  /** Modal: the rest of the page is inert, focus stays inside, and page scrolling stops. */
  modal?: boolean | (() => boolean);
  /** Whether Escape closes the overlay. Default true. */
  closeOnEscape?: () => boolean;
  /**
   * Whether a pointer press outside closes the overlay. For a modal `<dialog>` that means a
   * click on its backdrop; for other overlays, a press anywhere outside the host and `surface`.
   * Default false.
   */
  lightDismiss?: () => boolean;
  /** Elements outside the host that do not count as "outside", such as a popover's trigger. */
  insideElements?: () => (Element | null | undefined)[];
  /** Element to focus when the overlay opens; default the first `[autofocus]`, else none. */
  initialFocus?: () => HTMLElement | null | undefined;
  /** Whether to move focus into the overlay on open. Default true for modal overlays. */
  focusOnOpen?: () => boolean;
  /** Whether to give focus back to where it was when the overlay closes. Default true. */
  restoreFocus?: () => boolean;
  /** Elements whose animations to await before the surface leaves the top layer. */
  exitAnimationTargets?: () => (Element | null | undefined)[];
  /** Called when the user asks to close (Escape, light dismiss); the host sets `open = false`. */
  requestClose: (reason: CloseReason) => void;
}

// ── Shared state ─────────────────────────────────────────────────────────────

/** Open overlays, oldest first; Escape goes to the last one. */
// Only a type reference; the class is defined below.
// eslint-disable-next-line no-use-before-define
const stack: OverlayController[] = [];

let scrollLocks = 0;
let savedOverflow = '';

function lockScroll() {
  if (scrollLocks === 0) {
    savedOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = 'hidden';
  }
  scrollLocks += 1;
}

function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) {
    document.documentElement.style.overflow = savedOverflow;
  }
}

/** The focused element, looking into shadow roots. */
function deepActiveElement(): HTMLElement | null {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active instanceof HTMLElement ? active : null;
}

function handleDocumentKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || event.defaultPrevented) return;
  // A component that handles Escape itself while open (a menu, a select's list) marks itself with
  // `data-handles-escape`; let it close first instead of the overlay around it.
  const handledInside = event
    .composedPath()
    .some(
      node =>
        node instanceof Element && node.hasAttribute('data-handles-escape'),
    );
  if (handledInside) return;
  // The topmost overlay that Escape may close; overlays that ignore Escape (a standard side
  // sheet) don't block the ones below them.
  const top = [...stack].reverse().find(overlay => overlay.escapeAllowed);
  if (!top) return;
  event.preventDefault();
  event.stopPropagation();
  top.requestClose('escape');
}

function handleDocumentPointerdown(event: PointerEvent) {
  const top = stack[stack.length - 1];
  if (!top || top.isModal || !top.lightDismissAllowed) return;
  if (!top.containsEvent(event)) top.requestClose('light-dismiss');
}

function updateDocumentListeners() {
  if (stack.length > 0) {
    document.addEventListener('keydown', handleDocumentKeydown, true);
    document.addEventListener('pointerdown', handleDocumentPointerdown, true);
  } else {
    document.removeEventListener('keydown', handleDocumentKeydown, true);
    document.removeEventListener(
      'pointerdown',
      handleDocumentPointerdown,
      true,
    );
  }
}

// ── Controller ───────────────────────────────────────────────────────────────

/**
 * Shared behaviour for Peacock overlays (modal, side and bottom sheets, popover, tooltip,
 * snackbar): the top layer, so overlays stack in the order they open and never sit under an
 * open modal; a ref-counted page scroll lock for modal overlays; Escape and light dismiss that
 * close only the topmost overlay; initial focus and focus return.
 *
 * The host keeps `open` as the source of truth: it calls `sync(open)` from `updated()`, and the
 * controller calls `requestClose(reason)` when the user asks to close. The host then sets
 * `open = false` and fires its `close` event with that reason.
 *
 * @example
 * private readonly overlay = new OverlayController(this, {
 *   surface: () => this.dialogElement,
 *   modal: true,
 *   lightDismiss: () => !this.noLightDismiss,
 *   requestClose: reason => this.hide(reason),
 * });
 * protected updated(changed) { if (changed.has('open')) this.overlay.sync(this.open); }
 */
export class OverlayController implements ReactiveController {
  private readonly host: ReactiveControllerHost & HTMLElement;

  private readonly options: OverlayOptions;

  private shown = false;

  private locked = false;

  private returnFocusTo: HTMLElement | null = null;

  /** Why the user asked to close, until the overlay leaves; light dismiss keeps focus where it went. */
  private requestedReason: CloseReason | null = null;

  private exitGeneration = 0;

  constructor(
    host: ReactiveControllerHost & HTMLElement,
    options: OverlayOptions,
  ) {
    this.host = host;
    this.options = options;
    host.addController(this);
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────

  hostDisconnected() {
    this.leave(true);
  }

  // ── Public ───────────────────────────────────────────────────────────────

  /** Whether the overlay is modal right now. */
  get isModal(): boolean {
    const { modal } = this.options;
    return typeof modal === 'function' ? modal() : !!modal;
  }

  /** Whether Escape may close it. */
  get escapeAllowed(): boolean {
    return this.options.closeOnEscape?.() ?? true;
  }

  /** Whether a press outside may close it. */
  get lightDismissAllowed(): boolean {
    return this.options.lightDismiss?.() ?? false;
  }

  /** Whether the overlay is the topmost open overlay. */
  get isTopmost(): boolean {
    return stack[stack.length - 1] === this;
  }

  /** Opens or closes the surface to match the host's `open`. Call it from `updated()`. */
  sync(open: boolean) {
    if (open && this.host.isConnected) this.enter();
    else this.leave(false);
  }

  /** Asks the host to close; used for Escape and light dismiss. */
  requestClose(reason: CloseReason) {
    this.requestedReason = reason;
    this.options.requestClose(reason);
  }

  /** Whether a pointer event happened inside the host, its surface or an inside element. */
  containsEvent(event: Event): boolean {
    const path = event.composedPath();
    const inside = [
      this.host,
      this.options.surface(),
      ...(this.options.insideElements?.() ?? []),
    ];
    return inside.some(element => !!element && path.includes(element));
  }

  // ── Private ──────────────────────────────────────────────────────────────

  private enter() {
    const surface = this.options.surface();
    if (!surface) return;
    this.exitGeneration += 1;

    if (!this.shown) {
      this.returnFocusTo = deepActiveElement();
      this.shown = true;
      stack.push(this);
      updateDocumentListeners();
    }

    this.showSurface(surface);

    if (this.isModal && !this.locked) {
      lockScroll();
      this.locked = true;
    }

    const focusOnOpen = this.options.focusOnOpen?.() ?? this.isModal;
    if (focusOnOpen) {
      const target =
        this.options.initialFocus?.() ??
        (this.host.querySelector('[autofocus]') as HTMLElement | null);
      target?.focus();
    }
  }

  private leave(immediately: boolean) {
    if (this.locked) {
      unlockScroll();
      this.locked = false;
    }
    if (!this.shown) return;
    this.shown = false;
    const index = stack.indexOf(this);
    if (index >= 0) stack.splice(index, 1);
    updateDocumentListeners();

    // After a press outside, focus belongs where the person pressed, not back on the opener.
    const lightDismissed = this.requestedReason === 'light-dismiss';
    this.requestedReason = null;
    if (
      !lightDismissed &&
      (this.options.restoreFocus?.() ?? true) &&
      this.returnFocusTo?.isConnected &&
      this.focusIsInside()
    ) {
      this.returnFocusTo.focus();
    }
    this.returnFocusTo = null;

    const surface = this.options.surface();
    if (!surface) return;
    if (immediately) {
      this.hideSurface(surface);
      return;
    }
    // Leave the top layer once exit animations finish, unless the overlay reopened meanwhile.
    const generation = this.exitGeneration;
    const animations = (this.options.exitAnimationTargets?.() ?? [surface])
      .filter((element): element is Element => !!element)
      .flatMap(element => element.getAnimations({ subtree: true }));
    if (animations.length === 0) {
      this.hideSurface(surface);
      return;
    }
    Promise.all(animations.map(animation => animation.finished))
      .catch(() => undefined)
      .then(() => {
        if (generation === this.exitGeneration && !this.shown) {
          this.hideSurface(surface);
        }
      });
  }

  private showSurface(surface: HTMLElement) {
    if (surface instanceof HTMLDialogElement) {
      if (surface.open) return;
      if (this.isModal) surface.showModal();
      else surface.show();
      return;
    }
    if (
      surface.hasAttribute('popover') &&
      typeof surface.showPopover === 'function' &&
      !surface.matches(':popover-open')
    ) {
      surface.showPopover();
    }
  }

  private hideSurface(surface: HTMLElement) {
    if (surface instanceof HTMLDialogElement) {
      if (surface.open) surface.close();
      return;
    }
    if (
      surface.hasAttribute('popover') &&
      typeof surface.hidePopover === 'function' &&
      surface.matches(':popover-open')
    ) {
      surface.hidePopover();
    }
  }

  /** Whether focus is inside the host or its surface, so returning it will not steal focus. */
  private focusIsInside(): boolean {
    const active = deepActiveElement();
    if (!active) return true;
    if (active === document.body) return true;
    const surface = this.options.surface();
    let node: Node | null = active;
    while (node) {
      if (node === this.host || node === surface) return true;
      node = node.parentNode ?? (node instanceof ShadowRoot ? node.host : null);
    }
    return false;
  }
}

/** For tests: the number of open overlays and page scroll locks. */
export function overlayState() {
  return { open: stack.length, scrollLocks };
}

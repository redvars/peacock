import { a as autoUpdate, o as offset, f as flip, s as shift, b as arrow, c as computePosition } from './floating-ui.dom-oQieRCpS.js';

class FloatingController {
    constructor(host, options = {}) {
        this.reference = null;
        this.floating = null;
        this.arrowElement = null;
        this.cleanup = null;
        this.isHostConnected = false;
        this.isOpen = false;
        this.toggle = () => {
            this.isOpen ? this.close() : this.open();
        };
        this.handleContextMenu = (e) => {
            e.preventDefault();
            this.open();
        };
        this.handleFocusOut = (e) => {
            if (!this.reference || this.reference.contains(e.relatedTarget))
                return;
            this.close();
        };
        this.handleOutsideClick = (e) => {
            if (this.isOpen &&
                this.reference &&
                this.floating &&
                !this.isEventInsideElement(e, this.reference) &&
                !this.isEventInsideElement(e, this.floating)) {
                this.close();
            }
        };
        this.open = () => {
            if (this.isOpen)
                return;
            this.isOpen = true;
            this.options.onOpenChange(this.isOpen);
            this.host.requestUpdate();
            this.updatePosition();
        };
        this.close = () => {
            if (!this.isOpen)
                return;
            this.isOpen = false;
            this.options.onOpenChange(this.isOpen);
            this.cleanup?.();
            this.cleanup = null;
            this.host.requestUpdate();
        };
        this.options = {
            placement: options.placement || 'bottom',
            strategy: options.strategy || 'absolute',
            offset: options.offset ?? 8,
            trigger: options.trigger || 'hover',
            closeOnClickOutside: options.closeOnClickOutside ?? true,
            onOpenChange: options.onOpenChange ?? (() => undefined),
        };
        this.host = host;
        this.host.addController(this);
    }
    hostConnected() {
        this.isHostConnected = true;
        if (this.options.closeOnClickOutside) {
            document.addEventListener('mousedown', this.handleOutsideClick);
        }
    }
    hostDisconnected() {
        this.isHostConnected = false;
        this.cleanup?.();
        this.removeEventListeners();
        document.removeEventListener('mousedown', this.handleOutsideClick);
    }
    setElements(reference, floating, arrowElement) {
        this.cleanup?.();
        this.cleanup = null;
        this.removeEventListeners();
        this.reference = reference;
        this.floating = floating;
        this.arrowElement = arrowElement || null;
        this.setupEventListeners();
        if (this.isOpen) {
            this.updatePosition();
        }
    }
    setOptions(options) {
        const previousTrigger = this.options.trigger;
        const previousCloseOnClickOutside = this.options.closeOnClickOutside;
        this.options = {
            ...this.options,
            ...options,
            onOpenChange: options.onOpenChange ?? this.options.onOpenChange,
        };
        if (this.reference && previousTrigger !== this.options.trigger) {
            this.removeEventListeners();
            this.setupEventListeners();
        }
        if (this.isHostConnected && previousCloseOnClickOutside !== this.options.closeOnClickOutside) {
            document.removeEventListener('mousedown', this.handleOutsideClick);
            if (this.options.closeOnClickOutside) {
                document.addEventListener('mousedown', this.handleOutsideClick);
            }
        }
        if (this.isOpen) {
            this.updatePosition();
        }
    }
    setupEventListeners() {
        if (!this.reference)
            return;
        if (this.options.trigger === 'hover' || this.options.trigger === 'hover-focus') {
            this.reference.addEventListener('mouseenter', this.open);
            this.reference.addEventListener('mouseleave', this.close);
        }
        if (this.options.trigger === 'click') {
            this.reference.addEventListener('click', this.toggle);
        }
        if (this.options.trigger === 'context-menu') {
            this.reference.addEventListener('contextmenu', this.handleContextMenu);
        }
        if (this.options.trigger === 'focus' || this.options.trigger === 'hover-focus') {
            this.reference.addEventListener('focusin', this.open);
            this.reference.addEventListener('focusout', this.handleFocusOut);
        }
    }
    removeEventListeners() {
        if (!this.reference)
            return;
        this.reference.removeEventListener('mouseenter', this.open);
        this.reference.removeEventListener('mouseleave', this.close);
        this.reference.removeEventListener('click', this.toggle);
        this.reference.removeEventListener('contextmenu', this.handleContextMenu);
        this.reference.removeEventListener('focusin', this.open);
        this.reference.removeEventListener('focusout', this.handleFocusOut);
    }
    isEventInsideElement(event, element) {
        return event.composedPath().some(target => target === element);
    }
    updatePosition() {
        if (!this.reference || !this.floating)
            return;
        this.cleanup = autoUpdate(this.reference, this.floating, () => {
            if (!this.reference || !this.floating)
                return;
            const middleware = [
                offset(this.options.offset),
                flip(),
                shift({ padding: 5 }),
            ];
            if (this.arrowElement) {
                middleware.push(arrow({ element: this.arrowElement }));
            }
            computePosition(this.reference, this.floating, {
                placement: this.options.placement,
                strategy: this.options.strategy,
                middleware,
            }).then(({ x, y, placement, middlewareData }) => {
                if (!this.floating)
                    return;
                Object.assign(this.floating.style, {
                    left: `${x}px`,
                    top: `${y}px`,
                    position: this.options.strategy,
                });
                if (this.arrowElement && middlewareData.arrow) {
                    const { x: ax, y: ay } = middlewareData.arrow;
                    const staticSide = {
                        top: 'bottom',
                        right: 'left',
                        bottom: 'top',
                        left: 'right',
                    }[placement.split('-')[0]];
                    Object.assign(this.arrowElement.style, {
                        left: ax != null ? `${ax}px` : '',
                        top: ay != null ? `${ay}px` : '',
                        right: '',
                        bottom: '',
                        [staticSide]: '-4px',
                    });
                }
            });
        });
    }
}

export { FloatingController as F };
//# sourceMappingURL=floating-controller-CZYwnRVu.js.map

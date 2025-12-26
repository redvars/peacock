import {
  Component,
  ComponentInterface,
  Element,
  Event,
  EventEmitter,
  h,
  Host,
  Listen,
  Method,
  Prop,
} from '@stencil/core';
import PopoverController from '../../popover/popover/PopoverController';

/**
 * @label Dropdown
 * @name dropdown
 * @description Enables native inputs to be used within a Form field.
 * @category Navigation
 * @subcategory Dropdown
 * @img /assets/img/dropdown.webp
 * @imgDark /assets/img/dropdown-dark.webp
 */
@Component({
  tag: 'pc-dropdown',
  styleUrl: 'dropdown.scss',
  shadow: true,
})
export class Dropdown implements ComponentInterface {
  @Element() host!: HTMLElement;

  slotRef: HTMLSlotElement;
  menuRef: HTMLPcDropdownMenuElement;
  triggerRef: HTMLElement | HTMLPcButtonElement;
  popoverController: PopoverController;

  @Prop({ mutable: true, reflect: true }) open: boolean = false;

  @Prop({ reflect: true }) managed: boolean = false;

  /**
   * If true, the user cannot interact with the button. Defaults to `false`.
   */
  @Prop() disabled: boolean = false;

  @Prop({ reflect: true }) placements: string =
    'bottom-start,top-start,bottom-end,top-end';

  @Prop({ reflect: true }) trigger: 'click' | 'hover' | 'manual' = 'click';

  @Event({ eventName: 'pc-dropdown--item-click' })
  goatDropdownItemClick: EventEmitter;

  /**
   * Emitted when the dropdown is opened.
   */
  @Event({ eventName: 'pc-dropdown--open' }) openEvent: EventEmitter;

  /**
   * Emitted when the dropdown is closed.
   */
  @Event({ eventName: 'pc-dropdown--close' }) closeEvent: EventEmitter;

  @Method()
  async setFocus() {
    this.setFocusOnTrigger();
  }

  setFocusOnTrigger() {
    (this.triggerRef as HTMLPcButtonElement).setFocus
      ? (this.triggerRef as HTMLPcButtonElement).setFocus()
      : this.triggerRef.focus();
  }

  @Listen('resize', { target: 'window' })
  resizeHandler() {
    this.popoverController.computePositionThrottle('resize');
  }

  @Listen('click', { target: 'window' })
  windowClickHandler(evt) {
    this.popoverController.windowClickHandler(evt);
  }

  disconnectedCallback() {
    this.popoverController.destroy();
  }

  hidePopover = () => {
    this.open = false;
    this.closeEvent.emit();
  };

  showPopover = () => {
    this.open = true;
    setTimeout(() => {
      this.menuRef.setFocus();
      this.openEvent.emit();
    });
  };

  componentDidUpdate() {
    this.popoverController.setOpen(this.open);
    if (this.open) {
      this.popoverController.computePositionThrottle('onUpdate');
    }
  }

  componentDidLoad() {
    const contentRef = this.host.querySelector('pc-dropdown-menu');

    if (!contentRef) {
      throw new Error(
        'pc-dropdown: The dropdown component must have a pc-dropdown-menu child component',
      );
    }

    this.menuRef = contentRef;

    this.popoverController = new PopoverController(
      this.host,
      this.trigger,
      this.open,
      contentRef,
      0,
      0,
      this.showPopover,
      this.hidePopover,
      this.placements,
    );

    this.triggerRef = this.slotRef.assignedElements()[0] as HTMLElement;
    if (this.triggerRef.nodeName === 'SLOT') {
      const assignedElements = (
        this.triggerRef as HTMLSlotElement
      ).assignedElements();
      if (assignedElements.length) {
        this.triggerRef = assignedElements[0] as HTMLSlotElement;
      }
    }

    this.popoverController.registerTarget(this.triggerRef);
    this.popoverController.setTriggerRef(this.triggerRef);

    this.host.addEventListener('pc-menu-item--click', (evt: CustomEvent) => {
      this.goatDropdownItemClick.emit(evt.detail);
      this.setFocusOnTrigger();
      this.popoverController.hidePopover();
    });

    this.host.addEventListener('keydown', evt => {
      if (evt.key === 'Escape') {
        evt.preventDefault();
        this.popoverController.hidePopover();
      }
    });
  }

  render() {
    return (
      <Host>
        <div
          class={{
            dropdown: true,
            open: this.open,
          }}
        >
          <slot ref={el => (this.slotRef = el as HTMLSlotElement)} />
        </div>
      </Host>
    );
  }
}

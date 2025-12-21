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
import { getComponentIndex } from '../../../utils/utils';
import PopoverController from './PopoverController';

/**
 * @label Popover
 * @name popover
 * @description The Popover component is used to display additional information.
 * @category Informational
 * @subcategory Popover
 * @img /assets/img/dropdown.webp
 * @imgDark /assets/img/dropdown-dark.webp
 */
@Component({
  tag: 'pc-popover',
  styleUrl: 'popover.scss',
  shadow: true,
})
export class Popover implements ComponentInterface {
  @Element() host!: HTMLElement;

  gid: string = getComponentIndex();
  slotRef: HTMLSlotElement;
  popoverController: PopoverController;

  /**
   * Determines how the popover is triggered.
   * Possible values are:
   * - `"click"`: The popover is shown or hidden when the trigger element is clicked.
   * - `"hover"`: The popover is shown when the mouse hovers over the trigger element and hidden when it leaves.
   * - `"manual"`: The visibility of the popover must be manually controlled through the `open` property.
   */
  @Prop() trigger: 'click' | 'hover' | 'manual' = 'hover';

  /**
   * The tip of the popover.
   * Possible values are:
   * - `"caret"`: A triangle tip.
   * - `"tab"`: A tab tip.
   * - `"none"`: No tip.
   */
  @Prop({ reflect: true }) tip: 'caret' | 'tab' | 'none' = 'caret';

  /**
   * The placement of the popover relative to the trigger element.
   * Possible values are:
   * - `"top"`: The popover is placed above the trigger element.
   * - `"top-start"`: The popover is placed above the trigger element, aligned to the start.
   * - `"top-end"`: The popover is placed above the trigger element, aligned to the end.
   * - `"right"`: The popover is placed to the right of the trigger element.
   * - `"right-start"`: The popover is placed to the right of the trigger element, aligned to the start.
   * - `"right-end"`: The popover is placed to the right of the trigger element, aligned to the end.
   * - `"bottom"`: The popover is placed below the trigger element.
   * - `"bottom-start"`: The popover is placed below the trigger element, aligned to the start.
   * - `"bottom-end"`: The popover is placed below the trigger element, aligned to the end.
   * - `"left"`: The popover is placed to the left of the trigger element.
   * - `"left-start"`: The popover is placed to the left of the trigger element, aligned to the start.
   * - `"left-end"`: The popover is placed to the left of the trigger element, aligned to the end.
   */
  @Prop({ mutable: true }) placements: string;

  /**
   * The offset of the popover relative to the trigger element.
   * This value is used to adjust the position of the popover along the axis of the trigger element.
   */
  @Prop() offset: number = 4;

  /**
   * Time in milliseconds to wait before showing the popover when the trigger is set to `"hover"`.
   */
  @Prop() openTimeout: number = 200;

  /**
   * Time in milliseconds to wait before hiding the popover when the trigger is set to `"hover"`.
   */
  @Prop() dismissTimeout: number = 300;

  /**
   * Determines whether the popover is open.
   */
  @Prop({ mutable: true, reflect: true }) open: boolean = false;

  /**
   * Emitted when the popover is opened.
   */
  @Event({ eventName: 'goat-popover--open' }) openEvent: EventEmitter;

  /**
   * Emitted when the popover is closed.
   */
  @Event({ eventName: 'goat-popover--close' }) closeEvent: EventEmitter;

  @Listen('resize', { target: 'window' })
  resizeHandler() {
    this.popoverController.computePositionThrottle('resize');
  }

  @Listen('click', { target: 'window' })
  windowClickHandler(evt) {
    this.popoverController.windowClickHandler(evt);
  }

  /**
   * Shows the popover.
   * This method is particularly useful when the trigger mode is set to `"manual"`.
   * It allows for programmatic control over the visibility of the popover, making it visible regardless of the trigger mode.
   * Optionally, a target HTMLElement can be provided to dynamically set the trigger element for the popover.
   */
  @Method()
  async show(target?: HTMLElement) {
    if (target) {
      this.popoverController.registerTarget(target);
      this.popoverController.setTriggerRef(target);
    }
    this.showPopover();
  }

  /**
   * Hides the popover. This method is useful when the trigger is set to `"manual"`.
   */
  @Method()
  async hide() {
    this.open = false;
  }

  componentWillLoad() {
    if (this.tip == 'tab' && !this.placements) {
      this.placements = 'bottom-end,bottom-start,top-end,top-start';
    }
  }

  componentDidUpdate() {
    this.popoverController.setOpen(this.open);
    if (this.open) {
      this.popoverController.computePositionThrottle('onUpdate');
    }
  }

  async componentDidLoad() {
    const contentRef = this.host.querySelector('pc-popover-content');

    if (!contentRef) {
      throw new Error(
        'The goat-popover component requires a goat-popover-content component to be present.',
      );
    }

    const arrowRef = contentRef.shadowRoot.querySelector(
      '.arrow',
    ) as HTMLElement;

    this.popoverController = new PopoverController(
      this.host,
      this.trigger,
      this.open,
      contentRef,
      this.tip === 'tab' ? 0 : this.offset,
      this.tip === 'tab' ? 8 : 0,
      this.showPopover,
      this.hidePopover,
      this.placements,
      this.openTimeout,
      this.dismissTimeout,
      this.tip == 'caret' ? arrowRef : null,
    );

    let triggerRef = this.slotRef.assignedElements()[0] as HTMLElement;
    if (triggerRef.nodeName === 'SLOT') {
      const assignedElements = (
        triggerRef as HTMLSlotElement
      ).assignedElements();
      if (
        assignedElements.length &&
        assignedElements[0].nodeName !== 'GOAT-POPOVER-CONTENT'
      ) {
        triggerRef = assignedElements[0] as HTMLSlotElement;
      }
    }

    if (triggerRef) {
      this.popoverController.registerTarget(triggerRef);
      this.popoverController.setTriggerRef(triggerRef);
    }

    if (this.open) {
      const triggerObserver = new IntersectionObserver(
        entries => {
          if (entries[0].isIntersecting) {
            this.popoverController.computePositionThrottle('onLoad');
            triggerObserver.disconnect();
          }
        },
        {
          threshold: [0, 1],
        },
      );
      triggerObserver.observe(triggerRef);
    }
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
    setTimeout(() => this.openEvent.emit());
  };

  render() {
    return (
      <Host gid={this.gid}>
        <div
          class={{
            popover: true,
            open: this.open,
            [`tip-${this.tip}`]: true,
          }}
        >
          <slot ref={el => (this.slotRef = el as HTMLSlotElement)} />
        </div>
      </Host>
    );
  }
}

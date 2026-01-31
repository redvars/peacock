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
  State,
  Watch,
} from '@stencil/core';
import {
  debounceEvent,
  getComponentIndex,
  remToPx,
  throttle,
} from '../../../utils/utils';
import { computePosition, flip, offset, size } from '@floating-ui/dom';
import { PcMenuItemCustomEvent, PcTagCustomEvent } from '../../../components';

/**
 * @label Select
 * @name select
 * @description Allows the user to select one or more options using a dropdown.
 * @category Form Inputs
 * @tags input, form
 * @img /assets/img/select.webp
 * @imgDark /assets/img/select-dark.webp
 */
@Component({
  tag: 'pc-select',
  styleUrl: 'select.scss',
  shadow: true,
})
export class Select implements ComponentInterface, InputComponentInterface {
  gid: string = getComponentIndex();

  /**
   * The input field name.
   */
  @Prop() name: string = `pc-input-${this.gid}`;

  /**
   * The input field placeholder.
   */
  @Prop() placeholder: string;

  @Prop() label: string;

  @Prop() helperText: string;

  @Prop() invalid: boolean = false;

  @Prop() invalidText: string;

  @Prop() warn: boolean = false;

  @Prop() warnText: string;

  /**
   * The input field value.
   */
  @Prop({ mutable: true }) value?: string | number = '';

  @Prop() multiple: boolean = false;

  @Prop() hideDropdownIcon: boolean = false;

  /**
   * The select input size.
   * Possible values are: `"sm"`, `"md"`, `"lg"`. Defaults to `"md"`.
   */
  @Prop({ reflect: true }) size: 'sm' | 'md' | 'lg' = 'md';

  @Prop({ reflect: true }) inline: boolean = false;

  /**
   * Search type
   * Possible values are `"none"`, `"initial"`, `"contains"`, `"managed"`. Defaults to `"none"`.
   */
  @Prop() search: 'none' | 'initial' | 'contains' | 'managed' = 'none';

  /**
   * The input state.
   * Possible values are: `"success"`, `"error"`, `"warning"`, 'default'. Defaults to `"default"`.
   */
  @Prop({ reflect: true }) state: 'success' | 'error' | 'warning' | 'default' =
    'default';

  /**
   * If true, required icon is show. Defaults to `false`.
   */
  @Prop({ reflect: true }) required: boolean = false;

  /**
   * If true, the user cannot interact with the button. Defaults to `false`.
   */
  @Prop({ reflect: true }) disabled: boolean = false;

  /**
   * If true, the user cannot interact with the button. Defaults to `false`.
   */
  @Prop({ reflect: true }) readonly: boolean = false;

  @Prop() showLoader: boolean = false;

  @Prop({ mutable: true, reflect: true }) open: boolean = false;

  @Prop({ reflect: true, mutable: true }) configAria: any = {};

  /**
   *  [{
   *    label: 'Shivaji Varma',
   *    value: 'shivaji-varma',
   *    icon: 'person'
   *  }]
   */
  @Prop() items: {
    label: string | number;
    value: string | number;
    icon?: string;
  }[] = [];

  @Prop() placements: string = 'bottom-start,top-start,bottom-end,top-end';

  /**
   * If `true`, a clear icon will appear in the input when there is a value. Clicking it clears the input.
   */
  @Prop() clearable: boolean = false;

  /**
   * Set the amount of time, in milliseconds, to wait to trigger the `goatChange` event after each keystroke.
   */
  @Prop() debounce = 300;

  @Prop({ reflect: true }) layer?: 'background' | '01' | '02';

  /**
   * Emitted when the value has changed.
   */
  @Event({ eventName: 'goat-select--change' }) goatChange: EventEmitter;

  /**
   * Emitted when a keyboard input occurred.
   */
  @Event({ eventName: 'goat-select--search' }) goatSearch: EventEmitter;

  @Event({ eventName: 'goat-select--enter' })
  goatSearchEnter: EventEmitter;

  /**
   * Sets focus on the native `input` in `ion-input`. Use this method instead of the global
   * `input.focus()`.t
   */
  @Method()
  async setFocus(): Promise<void> {
    if (!this.open && this.displayElement) {
      this.displayElement.focus();
    } else if (this.open && this.nativeElement) {
      this.nativeElement.focus();
    }
  }

  @Method()
  async openSelectList(): Promise<void> {
    this.openList();
  }

  /**
   * Sets blur on the native `input` in `pc-input`. Use this method instead of the global
   * `input.blur()`.
   */
  @Method()
  async setBlur() {
    if (this.nativeElement) {
      this.nativeElement.blur();
    }
  }

  @Watch('debounce')
  protected debounceChanged() {
    this.goatSearch = debounceEvent(this.goatSearch, this.debounce);
  }

  @Listen('click', { target: 'window' })
  windowClick(evt) {
    if (this.open === false) return;
    const path = evt.path || evt.composedPath();
    for (const elm of path) {
      if (elm == this.elm) return;
    }
    this.open = false;
  }

  @Listen('pc-menu-item--click')
  menuItemClick(evt: PcMenuItemCustomEvent<any>) {
    this.selectHandler(evt.detail.value);
  }

  @Method()
  async getComponentId() {
    return this.gid;
  }

  @Element() elm!: HTMLElement;
  private nativeElement?: HTMLInputElement;
  private menuElm?: HTMLPcMenuElement;
  @State() hasFocus = false;
  @State() searchString: string = '';
  @State() startSlotHasContent = false;
  @State() endSlotHasContent = false;
  @State() position: string;
  private displayElement?: HTMLElement;

  @Listen('tag--dismiss')
  tagDismissClick(evt: PcTagCustomEvent<any>) {
    this.removeItem(evt.detail.value);
  }

  private getValues() {
    if (this.value) return this.value.toString().split(',');
    else return [];
  }

  private containsValue(value: string | number) {
    const values = this.getValues();
    return values.includes(value?.toString());
  }

  private addItem(selectItemValue) {
    let value = this.getValues();
    if (!value.includes(selectItemValue)) {
      if (!this.multiple) value = [];
      value.push(selectItemValue);
      this.value = value.join(',');
      this.goatChange.emit({
        value: this.value,
        newItem: this.getItemByValue(selectItemValue),
      });
    }
  }

  private removeItem(selectItemValue) {
    let value = this.getValues();
    if (value.includes(selectItemValue)) {
      value = value.filter(item => item !== selectItemValue);
      this.value = value.join(',');
      this.goatChange.emit({
        value: this.value,
        removedItem: this.getItemByValue(selectItemValue),
      });
    }
  }

  private toggleItem(selectItemValue) {
    let value = this.getValues();
    if (value.includes(selectItemValue)) {
      this.removeItem(selectItemValue);
    } else {
      this.addItem(selectItemValue);
    }
  }

  private selectHandler = selectItemValue => {
    if (!this.disabled && !this.readonly) {
      this.searchString = '';

      if (this.multiple) this.toggleItem(selectItemValue);
      else this.addItem(selectItemValue);
    }
    if (!this.multiple) this.closeList();
  };

  private clearInput = () => {
    if (!this.disabled && !this.readonly) {
      this.removeItem(this.value);
    }
  };

  private blurHandler = () => {
    this.hasFocus = false;
  };

  private focusHandler = () => {
    this.hasFocus = true;
  };

  private closeList = () => {
    if (!this.disabled && !this.readonly && this.open) {
      this.open = false;
      setTimeout(() => this.setFocus(), 80);
    }
  };

  private openList = () => {
    if (!this.disabled && !this.readonly && !this.open) {
      this.open = true;
      this.hasFocus = false;
      if (this.search !== 'none') {
        this.searchString = '';
      }

      setTimeout(() => {
        if (this.search !== 'none' && this.open) {
          this.nativeElement.focus();
        }
      }, 300);
    }
  };

  componentDidUpdate() {
    if (this.open)
      // @ts-ignore
      this._fixPosition();
  }

  private toggleList = () => {
    if (this.open) this.closeList();
    else this.openList();
  };

  private keyDownHandler = evt => {
    if (evt.key === 'Enter') {
      evt.preventDefault();
      this.toggleList();
      this.goatSearchEnter.emit({
        value: this.searchString,
        currentItems: this.filterItems(),
      });
    } else if (evt.key === 'ArrowDown') {
      if (this.open) {
        evt.preventDefault();
        this.menuElm.setFocus();
      }
    } else if (evt.key === 'ArrowUp') {
      if (this.open) {
        evt.preventDefault();
        this.menuElm.setFocus(); // focus on previous item
      }
    }
  };

  private onInput = (ev: Event) => {
    const input = ev.target as HTMLInputElement;
    this.searchString = input.value || '';
    this.goatSearch.emit({
      value: this.searchString,
    });
  };

  private hasValue(): boolean {
    return (this.value || '').toString().length > 0;
  }

  private getItemByValue(value) {
    if (this.items) {
      return this.items.find(item => {
        return item.value == value;
      });
    }
  }

  private getDisplayValue() {
    if (!this.multiple) {
      if (this.items) {
        const item = this.getItemByValue(this.value);
        if (item) {
          return (
            <div class="display-value-container">
              {item.icon && <p-icon name={item.icon} />}
              <span class="item-label">{item.label}</span>
            </div>
          );
        }
      }
      if (!this.disabled && !this.readonly) {
        return this.placeholder;
      } else {
        return <span>&nbsp;</span>;
      }
    } else {
      if (!this.disabled && !this.readonly) {
        return this.placeholder;
      } else {
        return <span>&nbsp;</span>;
      }
    }
  }

  componentWillLoad() {
    if (this.elm.getAttributeNames)
      this.elm.getAttributeNames().forEach((name: string) => {
        if (name.includes('aria-')) {
          this.configAria[name] = this.elm.getAttribute(name);
          this.elm.removeAttribute(name);
        }
      });
    this.startSlotHasContent = !!this.elm.querySelector('[slot="start"]');
    this.endSlotHasContent = !!this.elm.querySelector('[slot="end"]');
  }

  private getMenuElement() {
    return this.elm.querySelector('pc-menu');
  }

  index = 0;

  _fixPosition = throttle(
    callBack => {
      const positions = this.placements.split(',');
      const placement: any = positions[0];
      const fallbackPlacements: any = positions.splice(1);
      const dropdownContent: any =
        this.elm.shadowRoot.querySelector('.dropdown-content');
      const menuElm: any = this.getMenuElement();

      computePosition(
        this.elm.shadowRoot.querySelector('.input-container'),
        dropdownContent,
        {
          placement: placement,
          // Try removing the middleware. The dropdown will
          // overflow the boundary's edge and get clipped!
          middleware: [
            offset(10),
            size({
              apply({ availableHeight }) {
                if (availableHeight < remToPx(10)) return;
                menuElm?.style.setProperty(
                  '--pc-menu-max-height',
                  `${availableHeight}px`,
                );
              },
              padding: 5,
            }),
            flip({
              fallbackPlacements: fallbackPlacements,
            }),
          ],
        },
      ).then(({ x, y }) => {
        Object.assign(dropdownContent.style, {
          top: `${y}px`,
          left: `${x}px`,
        });
        if (callBack) callBack();
      });
    },
    80,
    {
      leading: true,
      trailing: false,
    },
  );

  @Listen('scroll', { target: 'window' })
  fixPosition() {
    if (this.open) {
      this._fixPosition();
    }
  }

  @Listen('resize', { target: 'window' })
  resizeHandler() {
    this.fixPosition();
  }

  connectedCallback() {
    this.debounceChanged();
  }

  renderMultiSelectValues() {
    const values = this.getValues();
    if (this.multiple && values.length) {
      return values.map(value => {
        const item = this.getItemByValue(value);
        if (item) {
          return (
            <pc-tag
              size="sm"
              dismissible={!this.disabled && !this.readonly}
              class="multi-select-value"
              value={item.value?.toString()}
            >
              {item.label}
            </pc-tag>
          );
        }
      });
    }
  }

  render() {
    return (
      <Host
        has-value={this.hasValue()}
        has-focus={this.hasFocus}
        position={this.position}
      >
        <div class={{ 'form-control': true, 'inline': this.inline }}>
          {this.label && (
            <label class="label">
              {this.required && <span class="required">*</span>}
              {this.label}
            </label>
          )}

          <div class="field">
            <div
              class={{
                dropdown: true,
                select: true,
                multiple: this.multiple,
                [this.position]: true,
                open: this.open,
                [`search-${this.search}`]: true,
              }}
            >
              <div
                class={{
                  'input-container': true,
                  'has-focus': this.hasFocus,
                  'disabled': this.disabled,
                  'readonly': this.readonly,
                  'has-value': this.hasValue(),
                  'start-slot-has-content': this.startSlotHasContent,
                  'end-slot-has-content': this.endSlotHasContent,
                }}
              >
                <div class="slot-container start">
                  <slot name="start" />
                </div>

                <div
                  class="value-container"
                  on-click={evt => {
                    if (evt.target.classList.contains('multi-select-values')) {
                      this.toggleList();
                    }
                  }}
                >
                  {this.renderMultiSelectValues()}

                  {(() => {
                    if (this.search !== 'none' && this.open) {
                      return (
                        <input
                          class="input input-native"
                          ref={input => (this.nativeElement = input)}
                          type="text"
                          name={this.name}
                          value={this.searchString}
                          placeholder={this.placeholder}
                          onBlur={this.blurHandler}
                          onFocus={this.focusHandler}
                          onInput={this.onInput}
                          onKeyDown={this.keyDownHandler}
                          {...this.configAria}
                        />
                      );
                    } else {
                      return (
                        <div
                          class="input display-value"
                          tabindex="0"
                          ref={input => (this.displayElement = input)}
                          aria-disabled={this.disabled ? 'true' : null}
                          onFocus={this.focusHandler}
                          onBlur={this.blurHandler}
                          onKeyDown={this.keyDownHandler}
                          onClick={this.toggleList}
                          {...this.configAria}
                        >
                          {this.getDisplayValue()}
                        </div>
                      );
                    }
                  })()}
                </div>

                {this.clearable && !this.multiple && this.hasValue() && (
                  <pc-button
                    class="clear clear-action"
                    color={'secondary'}
                    size={'xs'}
                    variant="text"
                    onClick={this.clearInput}
                  >
                    <p-icon name="close" />
                  </pc-button>
                )}

                <div class="slot-container end">
                  <slot name="end" />
                </div>

                {this.getModeIcon()}
              </div>
              <div class="dropdown-content">
                {this.open && this.renderDropdownList()}
              </div>
            </div>
          </div>
        </div>
      </Host>
    );
  }

  private getModeIcon() {
    if (this.showLoader) {
      return <pc-spinner class="loader" />;
    }
    if (!this.disabled && !this.readonly && !this.hideDropdownIcon)
      return (
        <p-icon
          tabindex={-1}
          class="toggle-icon chevron-down color-secondary"
          name="chevron--down"
          onClick={this.toggleList}
        ></p-icon>
      );
  }

  private renderDropdownList() {
    if (this.search === 'managed' && !this.items.length) {
      return (
        <pc-menu
          class="menu"
          ref={el => (this.menuElm = el)}
          layer={this.layer}
        >
          <div class="start-search">
            <p-icon name="search" />
            <pc-text class="text-secondary">
              Start typing to perform search
            </pc-text>
          </div>
        </pc-menu>
      );
    }

    if (this.items) {
      const filteredItems = this.filterItems();
      return (
        <pc-menu
          class="menu"
          empty={filteredItems.length == 0}
          ref={el => (this.menuElm = el)}
          layer={this.layer}
        >
          {(() => {
            return filteredItems.map(item => {
              return (
                <pc-menu-item value={item.value} layer={this.layer}>
                  <div class={'slot-container-start'} slot="start">
                    {item.icon && <p-icon name={item.icon} />}
                  </div>
                  {item.label || item.value}

                  <div slot="end">
                    {((this.multiple && this.containsValue(item.value)) ||
                      this.value == item.value) && <p-icon name="checkmark" />}
                  </div>
                </pc-menu-item>
              );
            });
          })()}
        </pc-menu>
      );
    }
  }

  private filterItems() {
    if (this.search === 'managed') return this.items;
    return this.items.filter(item => {
      return (
        !this.searchString ||
        item.label
          .toString()
          .toLocaleLowerCase()
          .includes(this.searchString.toLocaleLowerCase())
      );
    });
  }
}

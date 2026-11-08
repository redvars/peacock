import { html, LitElement, nothing } from 'lit';
import { property, query, state } from 'lit/decorators.js';
import { classMap } from 'lit/directives/class-map.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { RovingFocusController } from '@/__internal/controllers/roving-focus-controller.js';
import { DiagramCanvasLink } from '@/__internal/diagram/canvas-link.js';
import type { Menu } from '@/menu/menu/menu.js';
import styles from './diagram-controls.scss';

/** Zoom levels offered in the zoom menu. */
const ZOOM_PRESETS = [0.5, 1, 2];

/**
 * @label Diagram controls
 * @tag wc-diagram-controls
 * @rawTag diagram-controls
 * @summary Zoom, fit, back-to-start and undo buttons for a diagram canvas such as `wc-diagram`.
 *
 * @overview
 * <p>Put it in a canvas's <code>controls</code> slot, or anywhere on the page with <code>for</code> set
 * to the canvas's id. It shows zoom out, the zoom level, zoom in, fit to content and back to start;
 * undo and redo join them when the canvas is <code>editable</code>. The zoom level opens a menu with
 * 50%, 100%, 200%, fit, zoom to selection and back to start.</p>
 * <p>It is a <code>toolbar</code>: Tab reaches it once and the arrow keys move between its buttons.</p>
 *
 * @example
 * ```html
 * <wc-diagram style="height: 400px">
 *   <wc-diagram-controls slot="controls"></wc-diagram-controls>
 * </wc-diagram>
 * ```
 * @tags data
 */
@IndividualComponent
export class DiagramControls extends LitElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** Id of the canvas to control, when the controls are not inside it. */
  @property({ type: String })
  for = '';

  /** Lays the buttons out in a row or a column. */
  @property({ type: String, reflect: true })
  orientation: 'horizontal' | 'vertical' = 'horizontal';

  /** Leaves out undo and redo even when the canvas is editable. */
  @property({ type: Boolean, attribute: 'hide-history' })
  hideHistory = false;

  // ── State

  @state()
  private _zoom = 1;

  @state()
  private _canUndo = false;

  @state()
  private _canRedo = false;

  @state()
  private _editable = false;

  // ── Private fields

  @query('wc-menu')
  private readonly _menu?: Menu;

  @query('.zoom-level')
  private readonly _zoomButton?: HTMLElement;

  private readonly i18n = new I18nController(this);

  private readonly roving = new RovingFocusController(this, {
    items: () =>
      Array.from(
        this.renderRoot.querySelectorAll<HTMLElement>(
          '.bar > wc-icon-button:not([disabled]), .bar > .zoom-level',
        ),
      ),
    orientation: () => this.orientation,
  });

  private readonly link = new DiagramCanvasLink(this, {
    forId: () => this.for,
    onSync: () => this.sync(),
  });

  // ── Lifecycle

  protected updated(changed: Map<string, unknown>) {
    if (changed.has('for') && changed.get('for') !== undefined)
      this.link.attach();
  }

  // ── Private methods

  private sync() {
    const c = this.link.canvas;
    if (!c) return;
    this._zoom = c.view.zoom;
    this._canUndo = c.canUndo;
    this._canRedo = c.canRedo;
    this._editable = c.editable;
  }

  private percent(value: number) {
    return new Intl.NumberFormat(this.i18n.locale, {
      style: 'percent',
      maximumFractionDigits: 0,
    }).format(value);
  }

  private openMenu() {
    const menu = this._menu;
    if (!menu || !this._zoomButton) return;
    if (menu.open) {
      menu.close();
      return;
    }
    menu.anchorElement = this._zoomButton;
    menu.show('first');
  }

  private onMenuActivate = (event: Event) => {
    const item = (
      event as CustomEvent<{ item: HTMLElement & { value: string } }>
    ).detail?.item;
    const c = this.link.canvas;
    if (!item || !c) return;
    const { value } = item;
    if (value === 'fit') c.fit();
    else if (value === 'selection') c.zoomToSelection();
    else if (value === 'home') c.home();
    else c.zoomTo(Number(value));
  };

  // ── Render

  protected render() {
    const c = this.link.canvas;
    const showHistory = this._editable && !this.hideHistory;
    const level = this.percent(this._zoom);
    return html`
      <div
        class=${classMap({
          bar: true,
          vertical: this.orientation === 'vertical',
        })}
        role="toolbar"
        aria-label=${this.i18n.t('diagramControls')}
        aria-orientation=${this.orientation}
        @keydown=${this.roving.handleKeyDown}
        @focusin=${this.roving.handleFocusIn}
      >
        <wc-icon-button
          variant="text"
          shape="round"
          aria-label=${this.i18n.t('diagramZoomOut')}
          tooltip=${this.i18n.t('diagramZoomOut')}
          @click=${() => c?.zoomOut()}
          ><wc-icon name="remove"></wc-icon
        ></wc-icon-button>
        <button
          class="zoom-level"
          type="button"
          aria-haspopup="menu"
          aria-label=${this.i18n.t('diagramZoomLevel')(level)}
          @click=${() => this.openMenu()}
        >
          ${level}
        </button>
        <wc-icon-button
          variant="text"
          shape="round"
          aria-label=${this.i18n.t('diagramZoomIn')}
          tooltip=${this.i18n.t('diagramZoomIn')}
          @click=${() => c?.zoomIn()}
          ><wc-icon name="add"></wc-icon
        ></wc-icon-button>
        <wc-icon-button
          variant="text"
          shape="round"
          aria-label=${this.i18n.t('diagramFit')}
          tooltip=${this.i18n.t('diagramFit')}
          @click=${() => c?.fit()}
          ><wc-icon name="fit_screen"></wc-icon
        ></wc-icon-button>
        <wc-icon-button
          variant="text"
          shape="round"
          aria-label=${this.i18n.t('diagramBackToStart')}
          tooltip=${this.i18n.t('diagramBackToStart')}
          @click=${() => c?.home()}
          ><wc-icon name="home"></wc-icon
        ></wc-icon-button>
        ${showHistory
          ? html`<span class="separator history" role="separator"></span>
              <wc-icon-button
                class="history"
                variant="text"
                shape="round"
                aria-label=${this.i18n.t('diagramUndo')}
                tooltip=${this.i18n.t('diagramUndo')}
                ?disabled=${!this._canUndo}
                @click=${() => c?.undo()}
                ><wc-icon name="undo"></wc-icon
              ></wc-icon-button>
              <wc-icon-button
                class="history"
                variant="text"
                shape="round"
                aria-label=${this.i18n.t('diagramRedo')}
                tooltip=${this.i18n.t('diagramRedo')}
                ?disabled=${!this._canRedo}
                @click=${() => c?.redo()}
                ><wc-icon name="redo"></wc-icon
              ></wc-icon-button>`
          : nothing}
      </div>
      <wc-menu placement="top-start" @menu-item-activate=${this.onMenuActivate}>
        ${ZOOM_PRESETS.map(
          z =>
            html`<wc-menu-item value=${String(z)}
              >${this.percent(z)}</wc-menu-item
            >`,
        )}
        <wc-divider></wc-divider>
        <wc-menu-item value="fit">
          <wc-icon slot="start" name="fit_screen"></wc-icon>${this.i18n.t(
            'diagramFit',
          )}
          <span slot="trailing-supporting-text">Shift+1</span>
        </wc-menu-item>
        <wc-menu-item value="selection">
          <wc-icon slot="start" name="select"></wc-icon>${this.i18n.t(
            'diagramZoomToSelection',
          )}
          <span slot="trailing-supporting-text">Shift+2</span>
        </wc-menu-item>
        <wc-menu-item value="home">
          <wc-icon slot="start" name="home"></wc-icon>${this.i18n.t(
            'diagramBackToStart',
          )}
          <span slot="trailing-supporting-text">Home</span>
        </wc-menu-item>
      </wc-menu>
    `;
  }
}

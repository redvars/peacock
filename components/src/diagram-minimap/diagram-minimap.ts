import { html, LitElement, svg } from 'lit';
import { property, state } from 'lit/decorators.js';
import IndividualComponent from '@/IndividualComponent.js';
import { I18nController } from '@/__internal/i18n/i18n-controller.js';
import { DiagramCanvasLink } from '@/__internal/diagram/canvas-link.js';
import type { DiagramOverview } from '@/__internal/diagram/host.js';
import { boundsOf, inflateRect } from '@/__internal/diagram/geometry.js';
import styles from './diagram-minimap.scss';

/**
 * @label Diagram minimap
 * @tag wc-diagram-minimap
 * @rawTag diagram-minimap
 * @summary A small overview of a diagram canvas that shows where the view is and moves it.
 *
 * @overview
 * <p>Put it in a canvas's <code>minimap</code> slot, or anywhere with <code>for</code> set to the
 * canvas's id. It draws every node as a box and the part of the canvas in view as a rectangle,
 * wherever the view has wandered. Click to fly there, or drag to move the view.</p>
 * <p>The minimap is a pointer shortcut; keyboard users pan the canvas itself with the arrow keys.</p>
 *
 * @example
 * ```html
 * <wc-diagram style="height: 400px">
 *   <wc-diagram-minimap slot="minimap"></wc-diagram-minimap>
 * </wc-diagram>
 * ```
 *
 * @cssprop --diagram-minimap-width - Width. Defaults to 200px.
 * @cssprop --diagram-minimap-height - Height. Defaults to 132px.
 * @tags data
 */
@IndividualComponent
export class DiagramMinimap extends LitElement {
  // ── Static

  static styles = [styles];

  // ── Properties

  /** Id of the canvas to show, when the minimap is not inside it. */
  @property({ type: String })
  for = '';

  // ── State

  @state()
  private _overview?: DiagramOverview;

  // ── Private fields

  private readonly i18n = new I18nController(this);

  private readonly link = new DiagramCanvasLink(this, {
    forId: () => this.for,
    onSync: () => {
      this._overview = this.link.canvas?._diagramOverview();
    },
  });

  private drag?: { pointerId: number; svg: SVGSVGElement };

  // ── Lifecycle

  protected updated(changed: Map<string, unknown>) {
    if (changed.has('for') && changed.get('for') !== undefined)
      this.link.attach();
  }

  // ── Private methods

  private toCanvas(svgEl: SVGSVGElement, clientX: number, clientY: number) {
    const matrix = svgEl.getScreenCTM();
    if (!matrix) return undefined;
    const point = new DOMPoint(clientX, clientY).matrixTransform(
      matrix.inverse(),
    );
    return { x: point.x, y: point.y };
  }

  private onPointerDown = (event: PointerEvent) => {
    if (event.button !== 0) return;
    const svgEl = event.currentTarget as SVGSVGElement;
    const p = this.toCanvas(svgEl, event.clientX, event.clientY);
    if (!p) return;
    event.preventDefault();
    this.link.canvas?.centerOn(p.x, p.y);
    this.drag = { pointerId: event.pointerId, svg: svgEl };
    try {
      svgEl.setPointerCapture(event.pointerId);
    } catch {
      // Synthetic pointers cannot be captured.
    }
  };

  private onPointerMove = (event: PointerEvent) => {
    const { drag } = this;
    if (!drag || event.pointerId !== drag.pointerId) return;
    const p = this.toCanvas(drag.svg, event.clientX, event.clientY);
    if (p) this.link.canvas?.centerOn(p.x, p.y, true);
  };

  private onPointerUp = (event: PointerEvent) => {
    if (event.pointerId === this.drag?.pointerId) this.drag = undefined;
  };

  // ── Render

  protected render() {
    const o = this._overview;
    const area = o ? boundsOf([...o.items, o.visible]) : undefined;
    if (!o || !area) {
      return html`<div
        class="frame"
        role="img"
        aria-label=${this.i18n.t('diagramMinimap')}
      ></div>`;
    }
    const world = inflateRect(area, Math.max(area.width, area.height) * 0.04);
    const v = o.visible;
    return html`
      <div class="frame">
        <svg
          viewBox="${world.x} ${world.y} ${world.width} ${world.height}"
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label=${this.i18n.t('diagramMinimap')}
          @pointerdown=${this.onPointerDown}
          @pointermove=${this.onPointerMove}
          @pointerup=${this.onPointerUp}
          @pointercancel=${this.onPointerUp}
        >
          ${o.items.map(
            r =>
              svg`<rect class=${r.selected ? 'item selected' : 'item'} x=${r.x} y=${r.y} width=${r.width} height=${r.height} rx=${Math.min(r.width, r.height) * 0.12}></rect>`,
          )}
          <rect
            class="view"
            x=${v.x}
            y=${v.y}
            width=${v.width}
            height=${v.height}
            vector-effect="non-scaling-stroke"
          ></rect>
        </svg>
      </div>
    `;
  }
}

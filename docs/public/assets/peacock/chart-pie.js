import { i, _ as __decorate, I as IndividualComponent, b, w } from './IndividualComponent-Bdwyrvd6.js';
import { n } from './property-B49QQ8pS.js';
import { o } from './style-map-BQD5Et1D.js';
import { a as constant, b as array, c as css_248z$1, C as ChartBase, d as chartColor, s as select, e as cubicOut, i as interpolate } from './chart-base-C2qRMF48.js';
import { w as withPath } from './path-CJ0Arqcy.js';
import './directive-ZPhl09Yt.js';
import './state-DkTK9EGF.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './class-map-DG7CA1et.js';

const abs = Math.abs;
const atan2 = Math.atan2;
const cos = Math.cos;
const max = Math.max;
const min = Math.min;
const sin = Math.sin;
const sqrt = Math.sqrt;

const epsilon = 1e-12;
const pi = Math.PI;
const halfPi = pi / 2;
const tau = 2 * pi;

function acos(x) {
  return x > 1 ? 0 : x < -1 ? pi : Math.acos(x);
}

function asin(x) {
  return x >= 1 ? halfPi : x <= -1 ? -halfPi : Math.asin(x);
}

function arcInnerRadius(d) {
  return d.innerRadius;
}

function arcOuterRadius(d) {
  return d.outerRadius;
}

function arcStartAngle(d) {
  return d.startAngle;
}

function arcEndAngle(d) {
  return d.endAngle;
}

function arcPadAngle(d) {
  return d && d.padAngle; // Note: optional!
}

function intersect(x0, y0, x1, y1, x2, y2, x3, y3) {
  var x10 = x1 - x0, y10 = y1 - y0,
      x32 = x3 - x2, y32 = y3 - y2,
      t = y32 * x10 - x32 * y10;
  if (t * t < epsilon) return;
  t = (x32 * (y0 - y2) - y32 * (x0 - x2)) / t;
  return [x0 + t * x10, y0 + t * y10];
}

// Compute perpendicular offset line of length rc.
// http://mathworld.wolfram.com/Circle-LineIntersection.html
function cornerTangents(x0, y0, x1, y1, r1, rc, cw) {
  var x01 = x0 - x1,
      y01 = y0 - y1,
      lo = (cw ? rc : -rc) / sqrt(x01 * x01 + y01 * y01),
      ox = lo * y01,
      oy = -lo * x01,
      x11 = x0 + ox,
      y11 = y0 + oy,
      x10 = x1 + ox,
      y10 = y1 + oy,
      x00 = (x11 + x10) / 2,
      y00 = (y11 + y10) / 2,
      dx = x10 - x11,
      dy = y10 - y11,
      d2 = dx * dx + dy * dy,
      r = r1 - rc,
      D = x11 * y10 - x10 * y11,
      d = (dy < 0 ? -1 : 1) * sqrt(max(0, r * r * d2 - D * D)),
      cx0 = (D * dy - dx * d) / d2,
      cy0 = (-D * dx - dy * d) / d2,
      cx1 = (D * dy + dx * d) / d2,
      cy1 = (-D * dx + dy * d) / d2,
      dx0 = cx0 - x00,
      dy0 = cy0 - y00,
      dx1 = cx1 - x00,
      dy1 = cy1 - y00;

  // Pick the closer of the two intersection points.
  // TODO Is there a faster way to determine which intersection to use?
  if (dx0 * dx0 + dy0 * dy0 > dx1 * dx1 + dy1 * dy1) cx0 = cx1, cy0 = cy1;

  return {
    cx: cx0,
    cy: cy0,
    x01: -ox,
    y01: -oy,
    x11: cx0 * (r1 / r - 1),
    y11: cy0 * (r1 / r - 1)
  };
}

function arc() {
  var innerRadius = arcInnerRadius,
      outerRadius = arcOuterRadius,
      cornerRadius = constant(0),
      padRadius = null,
      startAngle = arcStartAngle,
      endAngle = arcEndAngle,
      padAngle = arcPadAngle,
      context = null,
      path = withPath(arc);

  function arc() {
    var buffer,
        r,
        r0 = +innerRadius.apply(this, arguments),
        r1 = +outerRadius.apply(this, arguments),
        a0 = startAngle.apply(this, arguments) - halfPi,
        a1 = endAngle.apply(this, arguments) - halfPi,
        da = abs(a1 - a0),
        cw = a1 > a0;

    if (!context) context = buffer = path();

    // Ensure that the outer radius is always larger than the inner radius.
    if (r1 < r0) r = r1, r1 = r0, r0 = r;

    // Is it a point?
    if (!(r1 > epsilon)) context.moveTo(0, 0);

    // Or is it a circle or annulus?
    else if (da > tau - epsilon) {
      context.moveTo(r1 * cos(a0), r1 * sin(a0));
      context.arc(0, 0, r1, a0, a1, !cw);
      if (r0 > epsilon) {
        context.moveTo(r0 * cos(a1), r0 * sin(a1));
        context.arc(0, 0, r0, a1, a0, cw);
      }
    }

    // Or is it a circular or annular sector?
    else {
      var a01 = a0,
          a11 = a1,
          a00 = a0,
          a10 = a1,
          da0 = da,
          da1 = da,
          ap = padAngle.apply(this, arguments) / 2,
          rp = (ap > epsilon) && (padRadius ? +padRadius.apply(this, arguments) : sqrt(r0 * r0 + r1 * r1)),
          rc = min(abs(r1 - r0) / 2, +cornerRadius.apply(this, arguments)),
          rc0 = rc,
          rc1 = rc,
          t0,
          t1;

      // Apply padding? Note that since r1 ≥ r0, da1 ≥ da0.
      if (rp > epsilon) {
        var p0 = asin(rp / r0 * sin(ap)),
            p1 = asin(rp / r1 * sin(ap));
        if ((da0 -= p0 * 2) > epsilon) p0 *= (cw ? 1 : -1), a00 += p0, a10 -= p0;
        else da0 = 0, a00 = a10 = (a0 + a1) / 2;
        if ((da1 -= p1 * 2) > epsilon) p1 *= (cw ? 1 : -1), a01 += p1, a11 -= p1;
        else da1 = 0, a01 = a11 = (a0 + a1) / 2;
      }

      var x01 = r1 * cos(a01),
          y01 = r1 * sin(a01),
          x10 = r0 * cos(a10),
          y10 = r0 * sin(a10);

      // Apply rounded corners?
      if (rc > epsilon) {
        var x11 = r1 * cos(a11),
            y11 = r1 * sin(a11),
            x00 = r0 * cos(a00),
            y00 = r0 * sin(a00),
            oc;

        // Restrict the corner radius according to the sector angle. If this
        // intersection fails, it’s probably because the arc is too small, so
        // disable the corner radius entirely.
        if (da < pi) {
          if (oc = intersect(x01, y01, x00, y00, x11, y11, x10, y10)) {
            var ax = x01 - oc[0],
                ay = y01 - oc[1],
                bx = x11 - oc[0],
                by = y11 - oc[1],
                kc = 1 / sin(acos((ax * bx + ay * by) / (sqrt(ax * ax + ay * ay) * sqrt(bx * bx + by * by))) / 2),
                lc = sqrt(oc[0] * oc[0] + oc[1] * oc[1]);
            rc0 = min(rc, (r0 - lc) / (kc - 1));
            rc1 = min(rc, (r1 - lc) / (kc + 1));
          } else {
            rc0 = rc1 = 0;
          }
        }
      }

      // Is the sector collapsed to a line?
      if (!(da1 > epsilon)) context.moveTo(x01, y01);

      // Does the sector’s outer ring have rounded corners?
      else if (rc1 > epsilon) {
        t0 = cornerTangents(x00, y00, x01, y01, r1, rc1, cw);
        t1 = cornerTangents(x11, y11, x10, y10, r1, rc1, cw);

        context.moveTo(t0.cx + t0.x01, t0.cy + t0.y01);

        // Have the corners merged?
        if (rc1 < rc) context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw);

        // Otherwise, draw the two corners and the ring.
        else {
          context.arc(t0.cx, t0.cy, rc1, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw);
          context.arc(0, 0, r1, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), !cw);
          context.arc(t1.cx, t1.cy, rc1, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw);
        }
      }

      // Or is the outer ring just a circular arc?
      else context.moveTo(x01, y01), context.arc(0, 0, r1, a01, a11, !cw);

      // Is there no inner ring, and it’s a circular sector?
      // Or perhaps it’s an annular sector collapsed due to padding?
      if (!(r0 > epsilon) || !(da0 > epsilon)) context.lineTo(x10, y10);

      // Does the sector’s inner ring (or point) have rounded corners?
      else if (rc0 > epsilon) {
        t0 = cornerTangents(x10, y10, x11, y11, r0, -rc0, cw);
        t1 = cornerTangents(x01, y01, x00, y00, r0, -rc0, cw);

        context.lineTo(t0.cx + t0.x01, t0.cy + t0.y01);

        // Have the corners merged?
        if (rc0 < rc) context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t1.y01, t1.x01), !cw);

        // Otherwise, draw the two corners and the ring.
        else {
          context.arc(t0.cx, t0.cy, rc0, atan2(t0.y01, t0.x01), atan2(t0.y11, t0.x11), !cw);
          context.arc(0, 0, r0, atan2(t0.cy + t0.y11, t0.cx + t0.x11), atan2(t1.cy + t1.y11, t1.cx + t1.x11), cw);
          context.arc(t1.cx, t1.cy, rc0, atan2(t1.y11, t1.x11), atan2(t1.y01, t1.x01), !cw);
        }
      }

      // Or is the inner ring just a circular arc?
      else context.arc(0, 0, r0, a10, a00, cw);
    }

    context.closePath();

    if (buffer) return context = null, buffer + "" || null;
  }

  arc.centroid = function() {
    var r = (+innerRadius.apply(this, arguments) + +outerRadius.apply(this, arguments)) / 2,
        a = (+startAngle.apply(this, arguments) + +endAngle.apply(this, arguments)) / 2 - pi / 2;
    return [cos(a) * r, sin(a) * r];
  };

  arc.innerRadius = function(_) {
    return arguments.length ? (innerRadius = typeof _ === "function" ? _ : constant(+_), arc) : innerRadius;
  };

  arc.outerRadius = function(_) {
    return arguments.length ? (outerRadius = typeof _ === "function" ? _ : constant(+_), arc) : outerRadius;
  };

  arc.cornerRadius = function(_) {
    return arguments.length ? (cornerRadius = typeof _ === "function" ? _ : constant(+_), arc) : cornerRadius;
  };

  arc.padRadius = function(_) {
    return arguments.length ? (padRadius = _ == null ? null : typeof _ === "function" ? _ : constant(+_), arc) : padRadius;
  };

  arc.startAngle = function(_) {
    return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant(+_), arc) : startAngle;
  };

  arc.endAngle = function(_) {
    return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant(+_), arc) : endAngle;
  };

  arc.padAngle = function(_) {
    return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant(+_), arc) : padAngle;
  };

  arc.context = function(_) {
    return arguments.length ? ((context = _ == null ? null : _), arc) : context;
  };

  return arc;
}

function descending(a, b) {
  return b < a ? -1 : b > a ? 1 : b >= a ? 0 : NaN;
}

function identity(d) {
  return d;
}

function pie() {
  var value = identity,
      sortValues = descending,
      sort = null,
      startAngle = constant(0),
      endAngle = constant(tau),
      padAngle = constant(0);

  function pie(data) {
    var i,
        n = (data = array(data)).length,
        j,
        k,
        sum = 0,
        index = new Array(n),
        arcs = new Array(n),
        a0 = +startAngle.apply(this, arguments),
        da = Math.min(tau, Math.max(-tau, endAngle.apply(this, arguments) - a0)),
        a1,
        p = Math.min(Math.abs(da) / n, padAngle.apply(this, arguments)),
        pa = p * (da < 0 ? -1 : 1),
        v;

    for (i = 0; i < n; ++i) {
      if ((v = arcs[index[i] = i] = +value(data[i], i, data)) > 0) {
        sum += v;
      }
    }

    // Optionally sort the arcs by previously-computed values or by data.
    if (sortValues != null) index.sort(function(i, j) { return sortValues(arcs[i], arcs[j]); });
    else if (sort != null) index.sort(function(i, j) { return sort(data[i], data[j]); });

    // Compute the arcs! They are stored in the original data's order.
    for (i = 0, k = sum ? (da - n * pa) / sum : 0; i < n; ++i, a0 = a1) {
      j = index[i], v = arcs[j], a1 = a0 + (v > 0 ? v * k : 0) + pa, arcs[j] = {
        data: data[j],
        index: i,
        value: v,
        startAngle: a0,
        endAngle: a1,
        padAngle: p
      };
    }

    return arcs;
  }

  pie.value = function(_) {
    return arguments.length ? (value = typeof _ === "function" ? _ : constant(+_), pie) : value;
  };

  pie.sortValues = function(_) {
    return arguments.length ? (sortValues = _, sort = null, pie) : sortValues;
  };

  pie.sort = function(_) {
    return arguments.length ? (sort = _, sortValues = null, pie) : sort;
  };

  pie.startAngle = function(_) {
    return arguments.length ? (startAngle = typeof _ === "function" ? _ : constant(+_), pie) : startAngle;
  };

  pie.endAngle = function(_) {
    return arguments.length ? (endAngle = typeof _ === "function" ? _ : constant(+_), pie) : endAngle;
  };

  pie.padAngle = function(_) {
    return arguments.length ? (padAngle = typeof _ === "function" ? _ : constant(+_), pie) : padAngle;
  };

  return pie;
}

var css_248z = i`.slice {
  stroke: none;
  transition: opacity var(--duration-short3) var(--easing-standard), transform var(--duration-short4) var(--easing-emphasized-decelerate);
}

.slice-label {
  font-family: var(--typography-label-medium-font-family) !important;
  font-size: var(--typography-label-medium-font-size) !important;
  font-weight: var(--typography-label-medium-font-weight) !important;
  line-height: var(--typography-label-medium-line-height) !important;
  letter-spacing: var(--typography-label-medium-letter-spacing) !important;
  fill: var(--color-surface);
  pointer-events: none;
}

.center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  text-align: center;
}

.center-value {
  font-family: var(--typography-headline-medium-font-family) !important;
  font-size: var(--typography-headline-medium-font-size) !important;
  font-weight: var(--typography-headline-medium-font-weight) !important;
  line-height: var(--typography-headline-medium-line-height) !important;
  letter-spacing: var(--typography-headline-medium-letter-spacing) !important;
  color: var(--color-on-surface);
  font-variant-numeric: tabular-nums;
}

.center-label {
  font-family: var(--typography-label-medium-font-family) !important;
  font-size: var(--typography-label-medium-font-size) !important;
  font-weight: var(--typography-label-medium-font-weight) !important;
  line-height: var(--typography-label-medium-line-height) !important;
  letter-spacing: var(--typography-label-medium-letter-spacing) !important;
  color: var(--color-on-surface-variant);
  max-width: var(--_center-width, 8rem);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

@media (prefers-reduced-motion: reduce) {
  .slice {
    transition: none;
  }
}`;

const DURATION = 450;
/** Distance a hovered slice moves out from the centre. */
const PULL_OUT = 6;
/** Room around the pie for the hovered slice. */
const PADDING = PULL_OUT + 2;
/** Gap between slices, in pixels at the outer edge. */
const SLICE_GAP = 2;
/** Smallest slice angle that gets a percentage label. */
const MIN_LABEL_ANGLE = 0.35;
/**
 * @label Pie Chart
 * @tag wc-chart-pie
 * @rawTag chart-pie
 * @summary Shows how parts make up a whole. Best with a handful of slices.
 * @tags charts
 *
 * @example
 * ```html
 * <wc-chart-pie label="Visitors by browser"></wc-chart-pie>
 * <script>
 *   document.querySelector('wc-chart-pie').data = [
 *     { name: 'chrome', label: 'Chrome', value: 275 },
 *     { name: 'safari', label: 'Safari', value: 200 },
 *     { name: 'firefox', label: 'Firefox', value: 187 },
 *   ];
 * </script>
 * ```
 *
 * @slot empty - Shown when there is no data. Defaults to "No data".
 *
 * @fires chart-select - A slice was clicked or chosen with Enter. `detail` holds `index`, `series` (the slice name) and `datum`.
 *
 * @csspart container - The outer wrapper.
 * @csspart plot - The focusable plot area holding the SVG.
 * @csspart tooltip - The tooltip.
 * @csspart legend - The legend.
 *
 * @cssprop --color-chart-1 - Color of the first slice; slices cycle through `--color-chart-1` to `--color-chart-8`.
 * @cssprop --chart-dim-opacity - Opacity of slices that are not hovered. Defaults to `0.4`.
 */
let ChartPie = class ChartPie extends ChartBase {
    constructor() {
        // ── Static
        super(...arguments);
        // ── Properties
        /** Slices to draw. */
        this.data = [];
        /** Size of the hole as a fraction of the radius, from 0 (pie) to 0.9. */
        this.innerRadius = 0;
        /** Prints each slice's percentage inside it when it fits. */
        this.showLabels = false;
        // ── Private fields
        /** Arcs from the last draw. */
        this.arcs = [];
        /** Outer radius from the last draw. */
        this.radius = 0;
        /** Pie centre from the last draw, in plot coordinates. */
        this.center = { x: 0, y: 0 };
    }
    // ── Private methods
    drawProperties() {
        return [...super.drawProperties(), 'data', 'innerRadius', 'showLabels'];
    }
    hasData() {
        return this.data.some(item => item.value > 0);
    }
    getSeries() {
        return this.data.map((item, i) => ({
            key: item.name,
            label: item.label ?? item.name,
            color: item.color ?? chartColor(i),
        }));
    }
    legendVisible() {
        return !this.hideLegend;
    }
    getItemCount() {
        return this.data.length;
    }
    /** Sum of the visible slices. */
    visibleTotal() {
        return this.data
            .filter(item => !this.isHidden(item.name))
            .reduce((sum, item) => sum + Math.max(item.value, 0), 0);
    }
    percent(value) {
        const total = this.visibleTotal();
        return total
            ? new Intl.NumberFormat(undefined, {
                style: 'percent',
                maximumFractionDigits: 1,
            }).format(value / total)
            : '';
    }
    innerFraction() {
        return Math.min(Math.max(this.innerRadius || 0, 0), 0.9);
    }
    draw(animate) {
        if (!this.svgElement)
            return;
        const { width, height } = this.svgSize();
        const radius = Math.max(Math.min(width, height) / 2 - PADDING, 0);
        this.radius = radius;
        this.center = { x: width / 2, y: height / 2 };
        const inner = radius * this.innerFraction();
        const colors = new Map(this.getSeries().map(s => [s.key, s.color]));
        const arcs = pie()
            .sort(null)
            .value(item => (this.isHidden(item.name) ? 0 : Math.max(item.value, 0)))
            .padAngle(radius ? SLICE_GAP / radius : 0)(this.data);
        this.arcs = arcs;
        const sliceArc = arc()
            .innerRadius(inner)
            .outerRadius(radius)
            .cornerRadius(Math.min(4, (radius - inner) / 4));
        const root = select(this.svgElement)
            .select('.pie')
            .attr('transform', `translate(${this.center.x},${this.center.y})`);
        const slices = root
            .select('.slices')
            .selectAll('path.slice')
            .data(arcs, d => d.data.name)
            .join('path')
            .attr('class', 'slice mark')
            .attr('data-key', d => d.data.name)
            .style('fill', d => colors.get(d.data.name) ?? '');
        if (animate) {
            slices
                .transition()
                .duration(DURATION)
                .ease(cubicOut)
                .attrTween('d', function (d) {
                const el = this;
                // New slices sweep open from their start angle.
                const from = el.__current ?? {
                    startAngle: d.startAngle,
                    endAngle: d.startAngle,
                };
                const tween = interpolate(from, {
                    startAngle: d.startAngle,
                    endAngle: d.endAngle,
                });
                el.__current = { startAngle: d.startAngle, endAngle: d.endAngle };
                return t => sliceArc({ ...tween(t), padAngle: d.padAngle }) ?? '';
            });
        }
        else {
            slices.interrupt().each(function (d) {
                this.__current = {
                    startAngle: d.startAngle,
                    endAngle: d.endAngle,
                };
            });
            slices.attr('d', d => sliceArc(d) ?? '');
        }
        // Percentages inside slices big enough to hold them.
        const labelArc = arc()
            .innerRadius(inner + (radius - inner) / 2)
            .outerRadius(inner + (radius - inner) / 2);
        const labelled = this.showLabels
            ? arcs.filter(d => d.endAngle - d.startAngle >= MIN_LABEL_ANGLE)
            : [];
        root
            .select('.slice-labels')
            .selectAll('text')
            .data(labelled, d => d.data.name)
            .join('text')
            .attr('class', 'slice-label')
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('transform', d => `translate(${labelArc.centroid(d)})`)
            .text(d => this.percent(d.data.value));
    }
    drawHighlight() {
        if (!this.svgElement)
            return;
        const { activeIndex, activeSeries } = this;
        const activeName = activeIndex >= 0 ? this.data[activeIndex]?.name : activeSeries;
        select(this.svgElement)
            .select('.slices')
            .selectAll('path.slice')
            .classed('is-dimmed', d => activeName !== undefined && d.data.name !== activeName)
            .style('transform', d => {
            if (d.data.name !== activeName)
                return 'translate(0px, 0px)';
            const mid = (d.startAngle + d.endAngle) / 2;
            return `translate(${Math.sin(mid) * PULL_OUT}px, ${-Math.cos(mid) * PULL_OUT}px)`;
        });
    }
    itemAtPoint(x, y) {
        const dx = x - this.center.x;
        const dy = y - this.center.y;
        const distance = Math.hypot(dx, dy);
        if (distance > this.radius + PULL_OUT ||
            distance < this.radius * this.innerFraction()) {
            return -1;
        }
        let angle = Math.atan2(dx, -dy);
        if (angle < 0)
            angle += Math.PI * 2;
        const hit = this.arcs.find(d => d.endAngle > d.startAngle &&
            angle >= d.startAngle &&
            angle < d.endAngle);
        return hit ? hit.index : -1;
    }
    getTooltip(index) {
        const item = this.data[index];
        const slice = this.arcs.find(d => d.index === index);
        if (!item || !slice || this.isHidden(item.name))
            return undefined;
        const mid = (slice.startAngle + slice.endAngle) / 2;
        const reach = this.radius * 0.75;
        return {
            title: '',
            rows: [
                {
                    key: item.name,
                    label: item.label ?? item.name,
                    color: item.color ?? chartColor(index),
                    value: `${this.formatValue(item.value)} · ${this.percent(item.value)}`,
                },
            ],
            x: this.center.x + Math.sin(mid) * reach,
            y: this.center.y - Math.cos(mid) * reach,
        };
    }
    getSelectDetail(index) {
        return { index, series: this.data[index]?.name, datum: this.data[index] };
    }
    // ── Render helpers
    renderSkeleton() {
        return b `<div
      class="skeleton skeleton-circle"
      style=${o({ height: `${this.height}px` })}
      aria-hidden="true"
    >
      <span></span>
    </div>`;
    }
    renderSvgContent() {
        return w `<g class="pie"><g class="slices"></g><g class="slice-labels"></g></g>`;
    }
    renderTable() {
        return b `<thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Value</th>
          <th scope="col">Share</th>
        </tr>
      </thead>
      <tbody>
        ${this.data.map(item => b `<tr>
              <th scope="row">${item.label ?? item.name}</th>
              <td>${this.formatValue(item.value)}</td>
              <td>${this.percent(item.value)}</td>
            </tr>`)}
      </tbody>`;
    }
};
ChartPie.styles = [css_248z$1, css_248z];
__decorate([
    n({ type: Array })
], ChartPie.prototype, "data", void 0);
__decorate([
    n({ type: Number, attribute: 'inner-radius' })
], ChartPie.prototype, "innerRadius", void 0);
__decorate([
    n({ type: Boolean, attribute: 'show-labels' })
], ChartPie.prototype, "showLabels", void 0);
ChartPie = __decorate([
    IndividualComponent
], ChartPie);

export { ChartPie };
//# sourceMappingURL=chart-pie.js.map

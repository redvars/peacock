import { html, LitElement, nothing, svg } from "lit";
import { property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import IndividualComponent from "@/IndividualComponent.js";
import styles from "./flow.scss";

export type FlowDirection = "up" | "down" | "left" | "right";

export type FlowStrokeVariant = "solid" | "dashed" | "animated-dashed";

export interface FlowPoint {
  x: number;
  y: number;
}

export interface FlowPathSegment {
  direction: FlowDirection;
  length: number;
}

export interface FlowNode {
  id: string;
  position: { x: number; y: number };
  inputs?: ("top" | "left" | "bottom" | "right")[];
  outputs?: ("top" | "left" | "bottom" | "right")[];
  data: {
    label?: string;
    element?: HTMLElement;
    [key: string]: any;
  } | HTMLElement;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: "top" | "left" | "bottom" | "right";
  targetHandle?: "top" | "left" | "bottom" | "right";
  type?: "smoothstep" | "bezier" | "straight";
  variant?: FlowStrokeVariant;
  label?: string;
  color?: string;
}

/**
 * @label Flow
 * @tag wc-flow
 * @rawTag flow
 * @summary An interactive node editor canvas with draggable nodes, custom HTML element rendering, and mouse-based edge connection creation on a dotted grid.
 *
 * @example
 * ```html
 * <wc-flow id="my-flow"></wc-flow>
 * <script>
 *   const flow = document.getElementById('my-flow');
 *   flow.nodes = [
 *     { id: '1', position: { x: 50, y: 50 }, data: { label: 'Node 1' } },
 *     { id: '2', position: { x: 250, y: 50 }, data: { label: 'Node 2' } }
 *   ];
 *   flow.edges = [
 *     { id: 'e1-2', source: '1', target: '2' }
 *   ];
 * </script>
 * ```
 *
 * @cssprop --flow-background - Background color for the canvas wrapper. Defaults to surface-container-low.
 * @cssprop --flow-dot-color - Color of the background grid dots. Defaults to outline-variant.
 * @cssprop --flow-line-color - Default stroke color for lines and connectors. Defaults to on-surface.
 * @cssprop --flow-hover-color - Stroke color on hover for clickable shapes. Defaults to primary.
 * @cssprop --flow-arrow-color - Stroke color for arrow markers. Defaults to on-surface.
 */
@IndividualComponent
export class Flow extends LitElement {
  static styles = [styles];

  @property({ type: Array })
  nodes: FlowNode[] = [];

  @property({ type: Array })
  edges: FlowEdge[] = [];

  @property({ type: Number, reflect: true })
  zoom: number = 1;

  @property({ type: Number, reflect: true })
  padding: number = 50;

  // Node dimensions tracking
  private nodeDimensions = new Map<string, { width: number; height: number }>();

  // Drag node state
  @state()
  private draggingNodeId: string | null = null;
  private dragStartMouseX = 0;
  private dragStartMouseY = 0;
  private dragStartNodeX = 0;
  private dragStartNodeY = 0;

  // Connection drag state
  @state()
  private isDrawingConnection = false;
  @state()
  private draggingSourceId: string | null = null;
  @state()
  private draggingSourceHandle: "top" | "left" | "bottom" | "right" | null = null;
  @state()
  private connectionStartX = 0;
  @state()
  private connectionStartY = 0;
  @state()
  private currentMouseX = 0;
  @state()
  private currentMouseY = 0;

  protected updated() {
    let dimensionsChanged = false;
    this.shadowRoot?.querySelectorAll(".flow-node").forEach((el) => {
      const id = el.getAttribute("data-id");
      if (id) {
        const current = this.nodeDimensions.get(id);
        const w = (el as HTMLElement).offsetWidth || 150;
        const h = (el as HTMLElement).offsetHeight || 70;
        if (!current || current.width !== w || current.height !== h) {
          this.nodeDimensions.set(id, { width: w, height: h });
          dimensionsChanged = true;
        }
      }
    });
    if (dimensionsChanged) {
      this.requestUpdate();
    }
  }

  // --- Node Dragging Handlers ---
  private onNodeMouseDown(event: MouseEvent, node: FlowNode) {
    const target = event.target as HTMLElement;
    if (
      target.closest(".handle") ||
      target.closest("button") ||
      target.closest("input") ||
      target.closest("a")
    ) {
      return;
    }
    event.preventDefault();
    this.draggingNodeId = node.id;
    this.dragStartMouseX = event.clientX;
    this.dragStartMouseY = event.clientY;
    this.dragStartNodeX = node.position.x;
    this.dragStartNodeY = node.position.y;

    window.addEventListener("mousemove", this.onNodeMouseMove);
    window.addEventListener("mouseup", this.onNodeMouseUp);
  }

  private onNodeMouseMove = (event: MouseEvent) => {
    if (!this.draggingNodeId) return;
    const deltaX = (event.clientX - this.dragStartMouseX) / this.zoom;
    const deltaY = (event.clientY - this.dragStartMouseY) / this.zoom;

    const node = this.nodes.find((n) => n.id === this.draggingNodeId);
    if (node) {
      node.position = {
        x: this.dragStartNodeX + deltaX,
        y: this.dragStartNodeY + deltaY,
      };
      this.dispatchEvent(
        new CustomEvent("node-drag", {
          detail: { id: node.id, position: node.position },
          bubbles: true,
          composed: true,
        }),
      );
      this.requestUpdate();
    }
  };

  private onNodeMouseUp = () => {
    this.draggingNodeId = null;
    window.removeEventListener("mousemove", this.onNodeMouseMove);
    window.removeEventListener("mouseup", this.onNodeMouseUp);
  };

  // --- Handle Helpers ---
  private getNodeInputs(node: FlowNode): ("top" | "left" | "bottom" | "right")[] {
    if (node.inputs && Array.isArray(node.inputs)) {
      return node.inputs;
    }
    if (node.data && typeof node.data === "object" && Array.isArray((node.data as any).inputs)) {
      return (node.data as any).inputs;
    }
    return ["left"];
  }

  private getNodeOutputs(node: FlowNode): ("top" | "left" | "bottom" | "right")[] {
    if (node.outputs && Array.isArray(node.outputs)) {
      return node.outputs;
    }
    if (node.data && typeof node.data === "object" && Array.isArray((node.data as any).outputs)) {
      return (node.data as any).outputs;
    }
    return ["right"];
  }

  private getHandleCoordinates(
    node: FlowNode,
    position: "top" | "left" | "bottom" | "right",
    dim: { width: number; height: number },
  ): FlowPoint {
    const x = node.position.x;
    const y = node.position.y;
    const w = dim.width;
    const h = dim.height;

    switch (position) {
      case "top":
        return { x: x + w / 2, y };
      case "bottom":
        return { x: x + w / 2, y: y + h };
      case "left":
        return { x, y: y + h / 2 };
      case "right":
      default:
        return { x: x + w, y: y + h / 2 };
    }
  }

  // --- Connection Dragging Handlers ---
  private onHandleMouseDown(
    event: MouseEvent,
    node: FlowNode,
    position: "top" | "left" | "bottom" | "right",
  ) {
    event.stopPropagation();
    event.preventDefault();

    const dim = this.nodeDimensions.get(node.id) || { width: 150, height: 70 };
    this.draggingSourceId = node.id;
    this.draggingSourceHandle = position;

    const coords = this.getHandleCoordinates(node, position, dim);
    this.connectionStartX = coords.x;
    this.connectionStartY = coords.y;

    this.isDrawingConnection = true;
    this.currentMouseX = this.connectionStartX;
    this.currentMouseY = this.connectionStartY;

    window.addEventListener("mousemove", this.onConnectionMouseMove);
    window.addEventListener("mouseup", this.onConnectionMouseUp);
  }

  private onConnectionMouseMove = (event: MouseEvent) => {
    if (!this.isDrawingConnection) return;

    const workspaceEl = this.shadowRoot?.querySelector(".flow-workspace");
    if (workspaceEl) {
      const rect = workspaceEl.getBoundingClientRect();
      const bounds = this.getBounds();
      const viewBoxX = bounds.minX - this.padding;
      const viewBoxY = bounds.minY - this.padding;

      this.currentMouseX = viewBoxX + (event.clientX - rect.left) / this.zoom;
      this.currentMouseY = viewBoxY + (event.clientY - rect.top) / this.zoom;
      this.requestUpdate();
    }
  };

  private onConnectionMouseUp = (event: MouseEvent) => {
    if (!this.isDrawingConnection) return;
    this.isDrawingConnection = false;

    window.removeEventListener("mousemove", this.onConnectionMouseMove);
    window.removeEventListener("mouseup", this.onConnectionMouseUp);

    const target = this.shadowRoot?.elementFromPoint(event.clientX, event.clientY);
    const inputHandle = target?.closest(".handle-input");
    if (inputHandle) {
      const targetNodeId = inputHandle.getAttribute("data-node-id");
      const targetHandle = inputHandle.getAttribute("data-position") as "top" | "left" | "bottom" | "right";
      if (targetNodeId && targetNodeId !== this.draggingSourceId) {
        this.dispatchEvent(
          new CustomEvent("connect", {
            detail: {
              source: this.draggingSourceId,
              target: targetNodeId,
              sourceHandle: this.draggingSourceHandle,
              targetHandle: targetHandle,
            },
            bubbles: true,
            composed: true,
          }),
        );
      }
    }
    this.draggingSourceId = null;
    this.draggingSourceHandle = null;
    this.requestUpdate();
  };

  // --- Path Builders ---
  private getRoundedPath(points: FlowPoint[], radius = 12) {
    if (points.length < 3) {
      return points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
    }

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];

      const dxp = prev.x - curr.x;
      const dyp = prev.y - curr.y;
      const lenp = Math.hypot(dxp, dyp);

      const dxn = next.x - curr.x;
      const dyn = next.y - curr.y;
      const lenn = Math.hypot(dxn, dyn);

      if (lenp === 0 || lenn === 0) {
        path += ` L ${curr.x} ${curr.y}`;
        continue;
      }

      const r = Math.min(radius, lenp / 2, lenn / 2);

      if (r > 0) {
        const x1 = curr.x + (dxp / lenp) * r;
        const y1 = curr.y + (dyp / lenp) * r;
        const x2 = curr.x + (dxn / lenn) * r;
        const y2 = curr.y + (dyn / lenn) * r;

        path += ` L ${x1} ${y1} Q ${curr.x} ${curr.y} ${x2} ${y2}`;
      } else {
        path += ` L ${curr.x} ${curr.y}`;
      }
    }

    const last = points[points.length - 1];
    path += ` L ${last.x} ${last.y}`;
    return path;
  }

  private getSmoothStepPath(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    sourceHandle: "top" | "left" | "bottom" | "right" = "right",
    targetHandle: "top" | "left" | "bottom" | "right" = "left",
  ) {
    const isSourceHorizontal = sourceHandle === "left" || sourceHandle === "right";
    const isTargetHorizontal = targetHandle === "left" || targetHandle === "right";

    let points: FlowPoint[] = [];

    if (isSourceHorizontal && isTargetHorizontal) {
      const midX = x1 + (x2 - x1) / 2;
      points = [
        { x: x1, y: y1 },
        { x: midX, y: y1 },
        { x: midX, y: y2 },
        { x: x2, y: y2 },
      ];
    } else if (!isSourceHorizontal && !isTargetHorizontal) {
      const midY = y1 + (y2 - y1) / 2;
      points = [
        { x: x1, y: y1 },
        { x: x1, y: midY },
        { x: x2, y: midY },
        { x: x2, y: y2 },
      ];
    } else if (isSourceHorizontal && !isTargetHorizontal) {
      points = [
        { x: x1, y: y1 },
        { x: x2, y: y1 },
        { x: x2, y: y2 },
      ];
    } else {
      points = [
        { x: x1, y: y1 },
        { x: x1, y: y2 },
        { x: x2, y: y2 },
      ];
    }

    return this.getRoundedPath(points, 12);
  }

  private getBezierPath(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    sourceHandle: "top" | "left" | "bottom" | "right" = "right",
    targetHandle: "top" | "left" | "bottom" | "right" = "left",
  ) {
    const normals = {
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 },
      top: { x: 0, y: -1 },
      bottom: { x: 0, y: 1 },
    };

    const sNormal = normals[sourceHandle] || { x: 1, y: 0 };
    const tNormal = normals[targetHandle] || { x: -1, y: 0 };

    const dx = x2 - x1;
    const dy = y2 - y1;
    const dist = Math.hypot(dx, dy);
    const offset = Math.max(dist / 2, 50);

    const cx1 = x1 + sNormal.x * offset;
    const cy1 = y1 + sNormal.y * offset;
    const cx2 = x2 + tNormal.x * offset;
    const cy2 = y2 + tNormal.y * offset;

    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  }

  private getStraightPath(x1: number, y1: number, x2: number, y2: number) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }

  private drawPath(
    sourceId: string,
    targetId: string,
    type?: "smoothstep" | "bezier" | "straight",
    sourceHandle?: "top" | "left" | "bottom" | "right",
    targetHandle?: "top" | "left" | "bottom" | "right",
  ) {
    const sourceNode = this.nodes.find((n) => n.id === sourceId);
    const targetNode = this.nodes.find((n) => n.id === targetId);
    if (!sourceNode || !targetNode) return "";

    const sDim = this.nodeDimensions.get(sourceId) || { width: 150, height: 70 };
    const tDim = this.nodeDimensions.get(targetId) || { width: 150, height: 70 };

    const sHandle = sourceHandle || this.getNodeOutputs(sourceNode)[0] || "right";
    const tHandle = targetHandle || this.getNodeInputs(targetNode)[0] || "left";

    const startCoords = this.getHandleCoordinates(sourceNode, sHandle, sDim);
    const endCoords = this.getHandleCoordinates(targetNode, tHandle, tDim);

    const edgeType = type || "smoothstep";
    if (edgeType === "bezier") {
      return this.getBezierPath(startCoords.x, startCoords.y, endCoords.x, endCoords.y, sHandle, tHandle);
    }
    if (edgeType === "straight") {
      return this.getStraightPath(startCoords.x, startCoords.y, endCoords.x, endCoords.y);
    }
    return this.getSmoothStepPath(startCoords.x, startCoords.y, endCoords.x, endCoords.y, sHandle, tHandle);
  }

  // --- Auto viewbox math ---
  private getBounds() {
    if (this.nodes.length === 0) {
      return { minX: 0, minY: 0, maxX: 400, maxY: 300 };
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    this.nodes.forEach((node) => {
      const dim = this.nodeDimensions.get(node.id) ||
        { width: 150, height: 70 };
      const x = node.position.x;
      const y = node.position.y;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x + dim.width > maxX) maxX = x + dim.width;
      if (y + dim.height > maxY) maxY = y + dim.height;
    });

    return { minX, minY, maxX, maxY };
  }

  // --- Content Renderers ---
  private isCustomNode(node: FlowNode) {
    if (node.data instanceof HTMLElement) {
      return true;
    }
    if (
      node.data &&
      typeof node.data === "object" &&
      (node.data as any).element instanceof HTMLElement
    ) {
      return true;
    }
    return false;
  }

  private renderNodeContent(node: FlowNode) {
    if (node.data instanceof HTMLElement) {
      return node.data;
    }
    if (
      node.data &&
      typeof node.data === "object" &&
      (node.data as any).element instanceof HTMLElement
    ) {
      return (node.data as any).element;
    }
    const label = node.data && typeof node.data === "object"
      ? (node.data as any).label || node.id
      : String(node.data);
    return html`
      <div class="flow-node-default-card">
        <div class="flow-node-title">${label}</div>
      </div>
    `;
  }

  protected render() {
    const bounds = this.getBounds();
    const viewBoxX = bounds.minX - this.padding;
    const viewBoxY = bounds.minY - this.padding;
    const viewBoxWidth = bounds.maxX - bounds.minX + 2 * this.padding;
    const viewBoxHeight = bounds.maxY - bounds.minY + 2 * this.padding;

    const svgViewBox =
      `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`;

    return html`
      <div class="flow-container">
        <div
          class="flow-scroller"
          style="width: ${viewBoxWidth * this.zoom}px; height: ${viewBoxHeight * this.zoom}px; position: relative;"
        >
          <div
            class="flow-workspace"
            style="transform: scale(${this.zoom}); transform-origin: top left; width: ${viewBoxWidth}px; height: ${viewBoxHeight}px; position: absolute; left: 0; top: 0;"
          >
          <!-- SVG canvas for rendering grid and paths -->
          <svg class="flow-svg" viewBox="${svgViewBox}">
            <defs>
              <pattern
                id="dot-grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1" cy="1" r="1" />
              </pattern>
              <marker
                id="arrowhead"
                markerWidth="8"
                markerHeight="8"
                refX="7"
                refY="4"
                orient="auto"
              >
                <polygon
                  points="0 0, 8 4, 0 8"
                  fill="var(--flow-line-color, var(--color-outline))"
                />
              </marker>
            </defs>

            <!-- Background Grid -->
            <rect
              x="${viewBoxX}"
              y="${viewBoxY}"
              width="${viewBoxWidth}"
              height="${viewBoxHeight}"
              fill="url(#dot-grid)"
            />

            <!-- Connection Edges -->
            ${this.edges.map((edge) => {
              const pathString = this.drawPath(
                edge.source,
                edge.target,
                edge.type,
                edge.sourceHandle,
                edge.targetHandle,
              );
              const color = edge.color ||
                "var(--flow-line-color, var(--color-outline))";
              const variant = edge.variant || "solid";
              return svg`
                <path
                  class="${classMap({
                    "flow-edge": true,
                    "variant-dashed": variant === "dashed" ||
                      variant === "animated-dashed",
                    "variant-animated-dashed": variant === "animated-dashed",
                  })}"
                  d="${pathString}"
                  stroke="${color}"
                  fill="none"
                  stroke-width="2"
                  marker-end="url(#arrowhead)"
                />
              `;
            })}

            <!-- Connection Draft line preview -->
            ${this.isDrawingConnection && this.draggingSourceHandle
              ? svg`
                <path
                  class="flow-edge-preview"
                  d="${this.getBezierPath(
                    this.connectionStartX,
                    this.connectionStartY,
                    this.currentMouseX,
                    this.currentMouseY,
                    this.draggingSourceHandle,
                    ({
                      left: "right",
                      right: "left",
                      top: "bottom",
                      bottom: "top",
                    })[this.draggingSourceHandle] as any
                  )}"
                  stroke="var(--flow-hover-color, var(--color-primary))"
                  fill="none"
                  stroke-width="2"
                  stroke-dasharray="4 4"
                />
              `
              : nothing}
          </svg>

          <!-- Nodes Workspace -->
          <div
            class="flow-nodes"
            style="position: absolute; left: ${-viewBoxX}px; top: ${-viewBoxY}px;"
          >
            ${this.nodes.map((node) => {
              const inputs = this.getNodeInputs(node);
              const outputs = this.getNodeOutputs(node);
              return html`
                <div
                  class="${classMap({
                    "flow-node": true,
                    "flow-node-custom": this.isCustomNode(node),
                  })}"
                  data-id="${node.id}"
                  style="position: absolute; left: ${node.position
                    .x}px; top: ${node.position.y}px;"
                  @mousedown="${(e: MouseEvent) =>
                    this.onNodeMouseDown(e, node)}"
                >
                  <!-- Input connection handles -->
                  ${inputs.map((pos) => html`
                    <div
                      class="handle handle-input handle-position-${pos}"
                      data-node-id="${node.id}"
                      data-position="${pos}"
                    >
                    </div>
                  `)}

                  <!-- Node Inner Content -->
                  <div class="flow-node-content">
                    ${this.renderNodeContent(node)}
                  </div>

                  <!-- Output connection handles -->
                  ${outputs.map((pos) => html`
                    <div
                      class="handle handle-output handle-position-${pos}"
                      data-node-id="${node.id}"
                      data-position="${pos}"
                      @mousedown="${(e: MouseEvent) =>
                        this.onHandleMouseDown(e, node, pos)}"
                    >
                    </div>
                  `)}
                </div>
              `;
            })}
          </div>
        </div>
      </div>
    </div>
    `;
  }
}

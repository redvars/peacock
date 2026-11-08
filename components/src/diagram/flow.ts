import IndividualComponent from '@/IndividualComponent.js';
import { deprecate } from '@/__internal/utils/deprecate.js';
import { Diagram } from './diagram.js';
import type {
  DiagramChangeDetail,
  DiagramChangeReason,
  DiagramConnectDetail,
  DiagramConnector,
  DiagramDeleteDetail,
  DiagramEdge,
  DiagramEdgeType,
  DiagramHandlePosition,
  DiagramIntent,
  DiagramMarker,
  DiagramNode,
  DiagramNodeMoveDetail,
  DiagramPoint,
  DiagramPort,
  DiagramSelectDetail,
  DiagramStartPosition,
  DiagramStrokeVariant,
  DiagramView,
  DiagramViewportDetail,
} from './diagram.js';

/**
 * The deprecated name of the diagram canvas: `wc-flow` before 4.0, now `wc-diagram`. It works
 * like `wc-diagram` and warns once on the console. Removed in 5.0.
 *
 * It has no tag in its JSDoc on purpose, so the custom elements manifest, the docs and the
 * React, Vue and Angular bindings list only `wc-diagram`. Its own module (`dist/flow.js`) keeps
 * the lazy loader's one-element-per-module rule.
 *
 * @deprecated Use `Diagram` (`wc-diagram`).
 */
@IndividualComponent
export class Flow extends Diagram {
  override connectedCallback() {
    super.connectedCallback();
    deprecate('wc-flow', 'the `wc-flow` tag', '`wc-diagram`');
  }
}

/** @deprecated Use `DiagramStrokeVariant`. */
export type FlowStrokeVariant = DiagramStrokeVariant;
/** @deprecated Use `DiagramHandlePosition`. */
export type FlowHandlePosition = DiagramHandlePosition;
/** @deprecated Use `DiagramEdgeType`. */
export type FlowEdgeType = DiagramEdgeType;
/** @deprecated Use `DiagramMarker`. */
export type FlowMarker = DiagramMarker;
/** @deprecated Use `DiagramIntent`. */
export type FlowIntent = DiagramIntent;
/** @deprecated Use `DiagramConnector`. */
export type FlowConnector = DiagramConnector;
/** @deprecated Use `DiagramStartPosition`. */
export type FlowStartPosition = DiagramStartPosition;
/** @deprecated Use `DiagramPoint`. */
export type FlowPoint = DiagramPoint;
/** @deprecated Use `DiagramView`. */
export type FlowView = DiagramView;
/** @deprecated Use `DiagramPort`. */
export type FlowPort = DiagramPort;
/** @deprecated Use `DiagramNode`. */
export type FlowNode = DiagramNode;
/** @deprecated Use `DiagramEdge`. */
export type FlowEdge = DiagramEdge;
/** @deprecated Use `DiagramNodeMoveDetail`. */
export type FlowNodeMoveDetail = DiagramNodeMoveDetail;
/** @deprecated Use `DiagramSelectDetail`. */
export type FlowSelectDetail = DiagramSelectDetail;
/** @deprecated Use `DiagramConnectDetail`. */
export type FlowConnectDetail = DiagramConnectDetail;
/** @deprecated Use `DiagramChangeReason`. */
export type FlowChangeReason = DiagramChangeReason;
/** @deprecated Use `DiagramChangeDetail`. */
export type FlowChangeDetail = DiagramChangeDetail;
/** @deprecated Use `DiagramDeleteDetail`. */
export type FlowDeleteDetail = DiagramDeleteDetail;
/** @deprecated Use `DiagramViewportDetail`. */
export type FlowViewportDetail = DiagramViewportDetail;

/** A point in canvas or screen coordinates. */
export interface DiagramPoint {
  x: number;
  y: number;
}

export interface DiagramSize {
  width: number;
  height: number;
}

/** A box in canvas coordinates: top-left corner plus size. */
export interface DiagramRect extends DiagramPoint, DiagramSize {}

/** A side of a node, where a port sits and where a connector leaves or enters. */
export type DiagramSide = 'top' | 'right' | 'bottom' | 'left';

/** How a connector is drawn between two ports. */
export type DiagramConnector = 'elbow' | 'bezier' | 'straight';

/**
 * The symbol drawn at the end of a connector. The crow's-foot set (`one`, `zero-or-one`, `many`,
 * `one-or-many`, `zero-or-many`) marks cardinality in entity diagrams.
 */
export type DiagramMarker =
  | 'none'
  | 'arrow'
  | 'arrow-open'
  | 'circle'
  | 'diamond'
  | 'one'
  | 'zero-or-one'
  | 'many'
  | 'one-or-many'
  | 'zero-or-many';

/**
 * Where the camera is: a canvas point `c` is drawn on screen at `c * zoom + (x, y)`, relative to
 * the canvas's top-left corner.
 */
export interface DiagramView {
  x: number;
  y: number;
  zoom: number;
}

/**
 * Where the camera starts: `fit` fits all content, `origin` puts canvas point 0,0 at the top-left
 * corner at 100%, `first` centres the first node at 100%.
 */
export type DiagramStartPosition = 'fit' | 'origin' | 'first';

/** Detail of `viewport-change`. `settled` is true once a pan, zoom or animation has finished. */
export interface DiagramViewportDetail extends DiagramView {
  settled: boolean;
}

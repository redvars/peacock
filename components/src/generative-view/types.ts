/** The JSON kind of a prop a generated node may set. */
export type GenerativePropKind =
  | 'string'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'array'
  | 'object';

/** A prop a generated node may set. */
export interface GenerativePropSpec {
  kind: GenerativePropKind;
  /** The allowed values of an `enum`. */
  values?: string[];
  description: string;
}

/** A component the view may render. */
export interface GenerativeCatalogEntry {
  tag: string;
  description: string;
  props: Record<string, GenerativePropSpec>;
  /** Named slots a child may fill with `"slot"`. */
  slots: string[];
  /** Whether the node takes children and text in its default slot. */
  children: boolean;
  /** A tag the children are put in, such as a card's padded content. */
  wrap?: string;
  /** The element's event that fires the view's `action` for a node with an `action` id. */
  action?: string;
}

export type GenerativeCatalog = Record<string, GenerativeCatalogEntry>;

/**
 * One node of a generated view, as JSON: `{"type": "stat", "props": {"label": "Open incidents",
 * "value": 42}}`. `type` names a component of the catalog (see `generativeViewSchema()`), or
 * `text` for a heading or paragraph.
 */
export interface GenerativeNode {
  type: string;
  props?: Record<string, unknown>;
  /** The named slot of the parent this node goes in. */
  slot?: string;
  /** Child nodes and text. */
  children?: (GenerativeNode | string)[];
  /** Fires the view's `action` with this id when the node is pressed or selected. */
  action?: string;
  /** Sent with the action. */
  payload?: unknown;
}

/** A child of a node: another node, or text. */
export type GenerativeChild = GenerativeNode | string;

/** What a view shows: one node, several, or their JSON text (possibly incomplete while streaming). */
export type GenerativeValue =
  | GenerativeNode
  | GenerativeChild[]
  | string
  | null;

/** `detail` of `action`. */
export interface GenerativeViewActionDetail {
  /** The node's `action`. */
  id: string;
  /** The node's `payload`. */
  payload?: unknown;
  /** The node's type, such as `button`. */
  type: string;
  /** The element event's own detail, such as the selected chart point or the clicked row. */
  detail?: unknown;
}

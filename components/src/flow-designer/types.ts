/**
 * Workflow Data Types for Flow Designer
 * Defines the structure for low-code business process workflows
 */

/**
 * Supported node types in a workflow
 */
export type NodeType =
  | 'trigger'
  | 'action'
  | 'decision'
  | 'loop_start'
  | 'loop_end'
  | 'fork'
  | 'join';

/**
 * Payload for workflow-changed event
 */
export interface WorkflowChangeEvent {
  type:
    | 'node-added'
    | 'node-deleted'
    | 'node-edited'
    | 'node-moved'
    | 'undo'
    | 'redo';
  nodeId?: string;
  workflow: Workflow;
}

/**
 * Core workflow node structure
 */
export interface WorkflowNode {
  id: string;
  type: NodeType;
  label: string;
  description?: string;
  icon?: string;
  /**
   * For sequential nodes in parallel execution (fork tasks)
   */
  tasks?: WorkflowNode[];
  /**
   * For conditional branching (decision nodes)
   * Keys are branch conditions like "yes", "no"
   */
  branches?: Record<string, WorkflowNode[]>;
  /**
   * Child nodes for sequential flow
   */
  children?: WorkflowNode[];
  /**
   * For loop_end: points to the loop_start node id to repeat
   */
  target_id?: string;
  /**
   * For fork: join node that collects parallel paths
   */
  join?: WorkflowNode;
  /**
   * Custom metadata - can store domain-specific data
   */
  metadata?: Record<string, any>;
}

/**
 * Complete workflow definition
 */
export interface Workflow {
  workflow_id: string;
  nodes: WorkflowNode; // Root node (usually trigger)
  metadata?: Record<string, any>;
}

/**
 * Layout engine output - node with calculated position
 */
export interface PositionedNode {
  node: WorkflowNode;
  x: number; // Pixel X coordinate
  y: number; // Pixel Y coordinate
  width: number; // Node card width
  height: number; // Node card height
  lane: string; // Swimlane identifier (e.g., "yes_lane", "no_lane", "parallel_0")
  depth: number; // Horizontal depth in layout
  branchPath?: string; // For connectors: "yes" or "no" or branch name
  parentId?: string; // Reference to parent node id
  connectorPoints?: {
    // For canvas connector rendering
    from: { x: number; y: number };
    to: { x: number; y: number };
    type: 'straight' | 'curved' | 'branch' | 'fork' | 'join';
  }[];
}

/**
 * Validation error result
 */
export interface ValidationError {
  nodeId: string;
  type:
    | 'circular_loop'
    | 'orphaned_node'
    | 'invalid_branch'
    | 'missing_target'
    | 'invalid_fork_join';
  message: string;
  severity: 'error' | 'warning';
}

/**
 * State for a single undo/redo operation
 */
export interface HistoryEntry {
  command: WorkflowCommand;
  workflow: Workflow;
  timestamp: number;
}

/**
 * Command interface for undo/redo pattern
 */
export interface WorkflowCommand {
  execute(workflow: Workflow): Workflow;
  undo(workflow: Workflow): Workflow;
  description: string;
}

/**
 * Swimlane configuration
 */
export interface SwimlaneConfig {
  id: string;
  name: string;
  nodes: PositionedNode[];
  isParallel: boolean;
}

/**
 * Editor state
 */
export interface EditorState {
  selectedNodeId: string | null;
  isEditing: boolean;
  editingNode: Partial<WorkflowNode> | null;
  hoveredNodeId: string | null;
  isDragging: boolean;
  draggedNodeId: string | null;
  zoom: number;
  panX: number;
  panY: number;
}

/**
 * Node template configuration for slots
 */
export interface NodeTemplate {
  type: NodeType;
  defaultIcon?: string;
  defaultHeight?: number;
  allowedChildren?: NodeType[];
  allowedBranches?: string[];
}

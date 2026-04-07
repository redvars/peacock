import type { WorkflowNode, PositionedNode, SwimlaneConfig } from './types.js';
import { getAllNodes } from './workflow-utils.js';

/**
 * Swimlane layout algorithm for flow designer
 * Positions nodes in left-to-right swimlanes for parallel/branching flows
 */

interface LayoutNode {
  node: WorkflowNode;
  parent: WorkflowNode | null;
  lane: string;
  depth: number;
  branchPath?: string;
  width: number;
  height: number;
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;
const HORIZONTAL_GAP = 60; // Gap between depth levels (columns)
const VERTICAL_GAP = 40; // Gap between lanes
const LANE_HEIGHT = 140; // Height of each swimlane row
const LANE_HEADER_HEIGHT = 84; // Top offset so first row is not clipped by floating UI

export class SwimlaneLayout {
  /**
   * Calculate layout positions for all nodes in a workflow
   */
  static calculateLayout(rootNode: WorkflowNode): PositionedNode[] {
    const layoutNodes: LayoutNode[] = [];
    const lanes = new Map<string, LayoutNode[]>(); // lane -> nodes in that lane
    const depthMap = new Map<string, number>(); // Track max depth per lane

    // First pass: assign lanes and depths
    this._traverseAndAssignLanes(rootNode, null, 'main', 0, layoutNodes, lanes);

    // Second pass: calculate positions
    const positionedNodes: PositionedNode[] = [];
    const nodePositions = new Map<string, { x: number; y: number }>();

    for (const layoutNode of layoutNodes) {
      const x =
        layoutNode.depth * (NODE_WIDTH + HORIZONTAL_GAP) + HORIZONTAL_GAP;
      const laneIndex = Array.from(lanes.keys()).indexOf(layoutNode.lane);
      const y = laneIndex * (LANE_HEIGHT + VERTICAL_GAP) + LANE_HEADER_HEIGHT;

      nodePositions.set(layoutNode.node.id, { x, y });

      const positioned: PositionedNode = {
        node: layoutNode.node,
        x,
        y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        lane: layoutNode.lane,
        depth: layoutNode.depth,
        branchPath: layoutNode.branchPath,
        parentId: layoutNode.parent?.id,
        connectorPoints: [],
      };

      positionedNodes.push(positioned);
    }

    // Third pass: calculate connector points
    this._calculateConnectors(positionedNodes, nodePositions);

    return positionedNodes;
  }

  /**
   * Traverse workflow tree and assign lane/depth to each node
   */
  private static _traverseAndAssignLanes(
    node: WorkflowNode,
    parent: WorkflowNode | null,
    baseLane: string,
    depth: number,
    layoutNodes: LayoutNode[],
    lanes: Map<string, LayoutNode[]>
  ): void {
    const layoutNode: LayoutNode = {
      node,
      parent,
      lane: baseLane,
      depth,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
    };

    // Add to layout nodes
    layoutNodes.push(layoutNode);

    // Register in lanes map
    if (!lanes.has(baseLane)) {
      lanes.set(baseLane, []);
    }
    lanes.get(baseLane)!.push(layoutNode);

    // Process children
    if (node.children && node.children.length > 0) {
      for (const child of node.children) {
        this._traverseAndAssignLanes(
          child,
          node,
          baseLane,
          depth + 1,
          layoutNodes,
          lanes
        );
      }
    }

    // Process decision branches into separate swimlanes
    if (node.branches) {
      let branchIndex = 0;
      for (const [branchKey, branchNodes] of Object.entries(node.branches)) {
        const branchLane = `${baseLane}_${branchKey}_${branchIndex}`;

        for (const branchNode of branchNodes) {
          this._traverseAndAssignLanes(
            branchNode,
            node,
            branchLane,
            depth + 1,
            layoutNodes,
            lanes
          );
        }
        branchIndex++;
      }
    }

    // Process fork into parallel lanes
    if (node.type === 'fork' && node.tasks) {
      let taskIndex = 0;
      for (const task of node.tasks) {
        const parallelLane = `${baseLane}_parallel_${taskIndex}`;
        this._traverseAndAssignLanes(
          task,
          node,
          parallelLane,
          depth + 1,
          layoutNodes,
          lanes
        );
        taskIndex++;
      }
    }

    // Process fork join node
    if (node.type === 'fork' && node.join) {
      // Join node goes back to main lane at next depth
      this._traverseAndAssignLanes(
        node.join,
        node,
        baseLane,
        depth + 2,
        layoutNodes,
        lanes
      );
    }

    // Process task nodes (used in forks)
    if (node.tasks && node.type !== 'fork') {
      for (const task of node.tasks) {
        this._traverseAndAssignLanes(
          task,
          node,
          baseLane,
          depth + 1,
          layoutNodes,
          lanes
        );
      }
    }
  }

  /**
   * Calculate SVG connector points between nodes
   */
  private static _calculateConnectors(
    positionedNodes: PositionedNode[],
    nodePositions: Map<string, { x: number; y: number }>
  ): void {
    const nodeMap = new Map<string, PositionedNode>(
      positionedNodes.map((n) => [n.node.id, n])
    );

    for (const positioned of positionedNodes) {
      const connectors: PositionedNode['connectorPoints'] = [];
      const nodeMiddleRight = {
        x: positioned.x + positioned.width,
        y: positioned.y + positioned.height / 2,
      };

      // Connect to children (sequential)
      if (positioned.node.children && positioned.node.children.length > 0) {
        for (const child of positioned.node.children) {
          const childPos = nodeMap.get(child.id);
          if (childPos) {
            connectors.push({
              from: nodeMiddleRight,
              to: {
                x: childPos.x,
                y: childPos.y + childPos.height / 2,
              },
              type: 'straight',
            });
          }
        }
      }

      // Connect to branches (decision)
      if (positioned.node.branches) {
        for (const branchNodes of Object.values(positioned.node.branches)) {

          for (const branchNode of branchNodes) {
            const childPos = nodeMap.get(branchNode.id);
            if (childPos) {
              // Curved path to branch
              connectors.push({
                from: nodeMiddleRight,
                to: {
                  x: childPos.x,
                  y: childPos.y + childPos.height / 2,
                },
                type: 'branch',
              });
            }
          }
        }
      }

      // Connect fork to parallel tasks
      if (positioned.node.type === 'fork' && positioned.node.tasks) {
        for (const task of positioned.node.tasks) {
          const taskPos = nodeMap.get(task.id);
          if (taskPos) {
            connectors.push({
              from: nodeMiddleRight,
              to: {
                x: taskPos.x,
                y: taskPos.y + taskPos.height / 2,
              },
              type: 'fork',
            });
          }
        }
      }

      // Connect to join
      if (positioned.node.type === 'fork' && positioned.node.join) {
        const joinPos = nodeMap.get(positioned.node.join.id);
        if (joinPos) {
          connectors.push({
            from: nodeMiddleRight,
            to: {
              x: joinPos.x,
              y: joinPos.y + joinPos.height / 2,
            },
            type: 'join',
          });
        }
      }

      // Connect loop back
      if (positioned.node.type === 'loop_end' && positioned.node.target_id) {
        const targetPos = nodeMap.get(positioned.node.target_id);
        if (targetPos) {
          connectors.push({
            from: {
              x: positioned.x + positioned.width,
              y: positioned.y + positioned.height / 2,
            },
            to: {
              x: targetPos.x,
              y: targetPos.y + targetPos.height / 2,
            },
            type: 'curved',
          });
        }
      }

      positioned.connectorPoints = connectors;
    }
  }

  /**
   * Get swimlane configurations for rendering
   */
  static getSwimlanes(positionedNodes: PositionedNode[]): SwimlaneConfig[] {
    const swimlanesMap = new Map<string, PositionedNode[]>();

    for (const node of positionedNodes) {
      if (!swimlanesMap.has(node.lane)) {
        swimlanesMap.set(node.lane, []);
      }
      swimlanesMap.get(node.lane)!.push(node);
    }

    const swimlanes: SwimlaneConfig[] = [];
    for (const [laneId, nodes] of swimlanesMap.entries()) {
      const isParallel = laneId.includes('parallel');
      const name = this._getSwimlaneName(laneId);

      swimlanes.push({
        id: laneId,
        name,
        nodes,
        isParallel,
      });
    }

    return swimlanes;
  }

  /**
   * Generate human-readable swimlane name
   */
  private static _getSwimlaneName(laneId: string): string {
    if (laneId === 'main') return 'Main Flow';
    if (laneId.includes('yes')) return 'Yes Path';
    if (laneId.includes('no')) return 'No Path';
    if (laneId.includes('parallel')) {
      const match = laneId.match(/parallel_(\d+)/);
      if (match) return `Parallel Task ${parseInt(match[1]) + 1}`;
    }
    return laneId;
  }

  /**
   * Calculate canvas bounds for sizing
   */
  static getCanvasBounds(positionedNodes: PositionedNode[]): {
    width: number;
    height: number;
  } {
    if (positionedNodes.length === 0) {
      return { width: 600, height: 400 };
    }

    let maxX = 0;
    let maxY = 0;

    for (const node of positionedNodes) {
      maxX = Math.max(maxX, node.x + node.width + HORIZONTAL_GAP);
      maxY = Math.max(maxY, node.y + node.height + VERTICAL_GAP);
    }

    return {
      width: Math.max(600, maxX),
      height: Math.max(400, maxY),
    };
  }
}

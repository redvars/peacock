import type { Workflow, WorkflowNode, ValidationError } from './types.js';
import {
  findNodeById,
  getAllNodes,
  getNodePath,
  isDescendant,
} from './workflow-utils.js';

/**
 * Workflow validation - checks for common errors and inconsistencies
 */

export class WorkflowValidator {
  /**
   * Validate entire workflow
   */
  static validate(workflow: Workflow): ValidationError[] {
    const errors: ValidationError[] = [];

    // Check root node exists and is a trigger
    if (!workflow.nodes) {
      errors.push({
        nodeId: 'root',
        type: 'orphaned_node',
        message: 'Workflow has no root node',
        severity: 'error',
      });
      return errors;
    }

    // Validate all nodes
    const allNodes = getAllNodes(workflow.nodes);

    // Check for circular loops
    errors.push(...this._checkCircularLoops(workflow.nodes, allNodes));

    // Check for orphaned nodes
    errors.push(...this._checkOrphanedNodes(workflow.nodes, allNodes));

    // Check valid branches
    errors.push(...this._checkValidBranches(workflow.nodes, allNodes));

    // Check missing targets
    errors.push(...this._checkMissingTargets(workflow, allNodes));

    // Check invalid fork/join pairs
    errors.push(...this._checkForkJoinPairs(workflow.nodes, allNodes));

    return errors;
  }

  /**
   * Detect circular loop references
   * A loop_end cannot point to a node that is its own descendant (after the loop_start)
   */
  private static _checkCircularLoops(
    rootNode: WorkflowNode,
    allNodes: WorkflowNode[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const node of allNodes) {
      // Only check loop_end nodes
      if (node.type !== 'loop_end') continue;

      const targetId = node.target_id;
      if (!targetId) continue;

      // Check if target exists
      const targetNode = findNodeById(rootNode, targetId);
      if (!targetNode) continue;

      // If loop_end is a descendant of its target, it's circular
      if (isDescendant(rootNode, targetId, node.id)) {
        // This is the intended behavior - loop_end should be a descendant of loop_start
        // So this is actually valid. Skip this check.
      }

      // However, if the loop_end's target is a descendant of the loop_end, that's circular
      if (isDescendant(rootNode, node.id, targetId)) {
        errors.push({
          nodeId: node.id,
          type: 'circular_loop',
          message: `Loop cannot point to a node (${targetId}) that executes after the loop_end`,
          severity: 'error',
        });
      }
    }

    return errors;
  }

  /**
   * Check for orphaned nodes (not reachable from root)
   */
  private static _checkOrphanedNodes(
    rootNode: WorkflowNode,
    allNodes: WorkflowNode[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];
    const paths = new Map<string, string[]>();

    for (const node of allNodes) {
      const path = getNodePath(rootNode, node.id);
      if (path.length === 0 && node.id !== rootNode.id) {
        errors.push({
          nodeId: node.id,
          type: 'orphaned_node',
          message: `Node "${node.label}" is not reachable from the root trigger`,
          severity: 'error',
        });
      }
      paths.set(node.id, path);
    }

    // Check nodes in branches - all branch paths must be reachable
    // This is typically valid by structure, but warn if branch has no exit
    for (const node of allNodes) {
      if (!node.branches) continue;

      for (const [branchKey, branchNodes] of Object.entries(node.branches)) {
        if (branchNodes.length === 0) {
          errors.push({
            nodeId: node.id,
            type: 'invalid_branch',
            message: `Branch "${branchKey}" is empty - no nodes to execute`,
            severity: 'warning',
          });
        }
      }
    }

    return errors;
  }

  /**
   * Check that decision nodes have valid branches
   */
  private static _checkValidBranches(
    rootNode: WorkflowNode,
    allNodes: WorkflowNode[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const node of allNodes) {
      if (node.type !== 'decision') continue;

      if (!node.branches) {
        errors.push({
          nodeId: node.id,
          type: 'invalid_branch',
          message: `Decision node "${node.label}" has no branches defined`,
          severity: 'error',
        });
        continue;
      }

      // Standard decision should have "yes" and "no"
      const branchKeys = Object.keys(node.branches);
      if (!branchKeys.includes('yes') || !branchKeys.includes('no')) {
        errors.push({
          nodeId: node.id,
          type: 'invalid_branch',
          message: `Decision node "${node.label}" should have "yes" and "no" branches`,
          severity: 'warning',
        });
      }

      // Check for empty branches
      for (const [branchKey, branchNodes] of Object.entries(node.branches)) {
        if (branchNodes.length === 0) {
          errors.push({
            nodeId: node.id,
            type: 'invalid_branch',
            message: `Decision branch "${branchKey}" is empty`,
            severity: 'warning',
          });
        }
      }
    }

    return errors;
  }

  /**
   * Check that loop_end nodes reference valid loop_start nodes
   */
  private static _checkMissingTargets(
    workflow: Workflow,
    allNodes: WorkflowNode[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const node of allNodes) {
      if (node.type === 'loop_end') {
        if (!node.target_id) {
          errors.push({
            nodeId: node.id,
            type: 'missing_target',
            message: `Loop end "${node.label}" does not specify a target loop_start`,
            severity: 'error',
          });
        } else {
          const target = findNodeById(workflow.nodes, node.target_id);
          if (!target || target.type !== 'loop_start') {
            errors.push({
              nodeId: node.id,
              type: 'missing_target',
              message: `Loop end "${node.label}" references non-existent or non-loop_start node "${node.target_id}"`,
              severity: 'error',
            });
          }
        }
      }
    }

    return errors;
  }

  /**
   * Check that fork nodes have corresponding join nodes
   */
  private static _checkForkJoinPairs(
    rootNode: WorkflowNode,
    allNodes: WorkflowNode[]
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const node of allNodes) {
      if (node.type === 'fork') {
        if (!node.join) {
          errors.push({
            nodeId: node.id,
            type: 'invalid_fork_join',
            message: `Fork node "${node.label}" does not have a corresponding join node`,
            severity: 'error',
          });
        } else if (node.join.type !== 'join') {
          errors.push({
            nodeId: node.id,
            type: 'invalid_fork_join',
            message: `Fork node "${node.label}" join is not a join node`,
            severity: 'error',
          });
        }

        if (!node.tasks || node.tasks.length === 0) {
          errors.push({
            nodeId: node.id,
            type: 'invalid_fork_join',
            message: `Fork node "${node.label}" has no parallel tasks`,
            severity: 'warning',
          });
        }
      }
    }

    return errors;
  }

  /**
   * Check if workflow would create a valid execution path
   */
  static isExecutable(workflow: Workflow): boolean {
    const errors = this.validate(workflow);
    return errors.filter((e) => e.severity === 'error').length === 0;
  }

  /**
   * Get validation warnings only
   */
  static getWarnings(workflow: Workflow): ValidationError[] {
    const errors = this.validate(workflow);
    return errors.filter((e) => e.severity === 'warning');
  }

  /**
   * Get validation errors only
   */
  static getErrors(workflow: Workflow): ValidationError[] {
    const errors = this.validate(workflow);
    return errors.filter((e) => e.severity === 'error');
  }
}

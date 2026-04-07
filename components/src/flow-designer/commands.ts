import type { Workflow, WorkflowNode, WorkflowCommand } from './types.js';
import {
  findNodeById,
  cloneWorkflow,
  removeNodeById,
  insertNodeIntoWorkflow,
} from './workflow-utils.js';

/**
 * Add Node Command
 */
export class AddNodeCommand implements WorkflowCommand {
  description = 'Add node';

  constructor(
    private nodeToAdd: WorkflowNode,
    private parentNodeId: string,
    private connectionType: 'child' | 'branch' | 'task' = 'child',
    private branchKey?: string
  ) {}

  execute(workflow: Workflow): Workflow {
    const result = cloneWorkflow(workflow);
    const parent = findNodeById(result.nodes, this.parentNodeId);
    if (!parent) return workflow; // Validation in parent component

    insertNodeIntoWorkflow(parent, this.nodeToAdd, this.connectionType, this.branchKey);
    return result;
  }

  undo(workflow: Workflow): Workflow {
    const result = cloneWorkflow(workflow);
    removeNodeById(result.nodes, this.nodeToAdd.id);
    return result;
  }
}

/**
 * Delete Node Command
 */
export class DeleteNodeCommand implements WorkflowCommand {
  description = 'Delete node';
  private deletedNode: WorkflowNode | null = null;
  private parentReference: {
    parentId: string;
    connectionType: 'child' | 'branch' | 'task';
    branchKey?: string;
  } | null = null;

  constructor(
    private nodeId: string,
    workflow?: Workflow
  ) {
    if (workflow) {
      this.captureNodeContext(workflow);
    }
  }

  private captureNodeContext(workflow: Workflow) {
    const node = findNodeById(workflow.nodes, this.nodeId);
    if (!node) return;
    this.deletedNode = cloneWorkflow({ workflow_id: '', nodes: node }).nodes;

    // Find parent reference
    this.findParentReference(workflow.nodes);
  }

  private findParentReference(node: WorkflowNode) {
    if (node.children) {
      const idx = node.children.findIndex((n) => n.id === this.nodeId);
      if (idx !== -1) {
        this.parentReference = {
          parentId: node.id,
          connectionType: 'child',
        };
        return;
      }
      for (const child of node.children) {
        this.findParentReference(child);
      }
    }

    if (node.tasks) {
      const idx = node.tasks.findIndex((n) => n.id === this.nodeId);
      if (idx !== -1) {
        this.parentReference = {
          parentId: node.id,
          connectionType: 'task',
        };
        return;
      }
      for (const task of node.tasks) {
        this.findParentReference(task);
      }
    }

    if (node.branches) {
      for (const [branchKey, branchNodes] of Object.entries(node.branches)) {
        const idx = branchNodes.findIndex((n) => n.id === this.nodeId);
        if (idx !== -1) {
          this.parentReference = {
            parentId: node.id,
            connectionType: 'branch',
            branchKey,
          };
          return;
        }
        for (const branchNode of branchNodes) {
          this.findParentReference(branchNode);
        }
      }
    }
  }

  execute(workflow: Workflow): Workflow {
    const result = cloneWorkflow(workflow);
    removeNodeById(result.nodes, this.nodeId);
    return result;
  }

  undo(workflow: Workflow): Workflow {
    if (!this.deletedNode || !this.parentReference) return workflow;
    const result = cloneWorkflow(workflow);
    const parent = findNodeById(result.nodes, this.parentReference.parentId);
    if (!parent) return workflow;

    insertNodeIntoWorkflow(
      parent,
      this.deletedNode,
      this.parentReference.connectionType,
      this.parentReference.branchKey
    );
    return result;
  }
}

/**
 * Edit Node Command
 */
export class EditNodeCommand implements WorkflowCommand {
  description = 'Edit node';
  private previousState: Record<string, any> = {};

  constructor(
    private nodeId: string,
    private updates: Partial<WorkflowNode>,
    workflow?: Workflow
  ) {
    if (workflow) {
      const node = findNodeById(workflow.nodes, nodeId);
      if (node) {
        // Store only edited fields
        Object.keys(updates).forEach((key) => {
          this.previousState[key] = (node as Record<string, any>)[key];
        });
      }
    }
  }

  execute(workflow: Workflow): Workflow {
    const result = cloneWorkflow(workflow);
    const node = findNodeById(result.nodes, this.nodeId);
    if (!node) return workflow;

    Object.assign(node, this.updates);
    return result;
  }

  undo(workflow: Workflow): Workflow {
    const result = cloneWorkflow(workflow);
    const node = findNodeById(result.nodes, this.nodeId);
    if (!node) return workflow;

    Object.assign(node, this.previousState);
    return result;
  }
}

/**
 * Move Node Command - reorder in array or change parent
 */
export class MoveNodeCommand implements WorkflowCommand {
  description = 'Move node';
  private previousState: {
    parentId: string;
    index: number;
    connectionType: 'child' | 'branch' | 'task';
    branchKey?: string;
  } | null = null;

  constructor(
    private nodeId: string,
    private newParentId: string,
    private newIndex: number,
    private newConnectionType: 'child' | 'branch' | 'task' = 'child',
    private newBranchKey?: string,
    workflow?: Workflow
  ) {
    if (workflow) {
      this.captureCurrentPosition(workflow);
    }
  }

  private captureCurrentPosition(workflow: Workflow) {
    // Store current parent/position for undo
    // Implementation depends on finding current parent location
  }

  execute(workflow: Workflow): Workflow {
    // Remove from old parent, insert at new parent
    let result = cloneWorkflow(workflow);
    result.nodes = removeNodeById(result.nodes, this.nodeId);
    const newParent = findNodeById(result.nodes, this.newParentId);
    if (!newParent) return workflow;

    const node = findNodeById(workflow.nodes, this.nodeId);
    if (!node) return workflow;

    insertNodeIntoWorkflow(
      newParent,
      node,
      this.newConnectionType,
      this.newBranchKey
    );
    return result;
  }

  undo(workflow: Workflow): Workflow {
    // Restore to previous position
    if (!this.previousState) return workflow;
    let result = cloneWorkflow(workflow);
    result.nodes = removeNodeById(result.nodes, this.nodeId);
    const prevParent = findNodeById(result.nodes, this.previousState.parentId);
    if (!prevParent) return workflow;

    const node = findNodeById(workflow.nodes, this.nodeId);
    if (!node) return workflow;

    insertNodeIntoWorkflow(
      prevParent,
      node,
      this.previousState.connectionType,
      this.previousState.branchKey
    );
    return result;
  }
}

/**
 * Batch Command - combine multiple commands into one undo/redo step
 */
export class BatchCommand implements WorkflowCommand {
  description: string;

  constructor(
    private commands: WorkflowCommand[],
    description: string = `Batch operation (${commands.length} steps)`
  ) {
    this.description = description;
  }

  execute(workflow: Workflow): Workflow {
    let result = workflow;
    for (const command of this.commands) {
      result = command.execute(result);
    }
    return result;
  }

  undo(workflow: Workflow): Workflow {
    let result = workflow;
    // Execute commands in reverse order to undo
    for (let i = this.commands.length - 1; i >= 0; i--) {
      result = this.commands[i].undo(result);
    }
    return result;
  }
}

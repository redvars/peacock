import type { Workflow, WorkflowNode } from './types.js';

/**
 * Workflow utility functions for tree traversal and manipulation
 */

/**
 * Deep clone a workflow to ensure immutability
 */
export function cloneWorkflow(workflow: Workflow): Workflow {
  return JSON.parse(JSON.stringify(workflow));
}

/**
 * Deep clone a workflow node
 */
export function cloneNode(node: WorkflowNode): WorkflowNode {
  return JSON.parse(JSON.stringify(node));
}

/**
 * Find a node by ID anywhere in the workflow tree
 */
export function findNodeById(
  node: WorkflowNode,
  id: string
): WorkflowNode | null {
  if (node.id === id) return node;

  // Search children
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }

  // Search tasks
  if (node.tasks) {
    for (const task of node.tasks) {
      const found = findNodeById(task, id);
      if (found) return found;
    }
  }

  // Search branches
  if (node.branches) {
    for (const branchNodes of Object.values(node.branches)) {
      for (const branchNode of branchNodes) {
        const found = findNodeById(branchNode, id);
        if (found) return found;
      }
    }
  }

  // Search join
  if (node.join) {
    const found = findNodeById(node.join, id);
    if (found) return found;
  }

  return null;
}

/**
 * Remove a node by ID from the workflow tree
 */
export function removeNodeById(
  node: WorkflowNode,
  id: string
): WorkflowNode {
  const result = cloneNode(node);

  // Remove from children
  if (result.children) {
    result.children = result.children.filter((child) => {
      if (child.id === id) return false;
      removeNodeById(child, id);
      return true;
    });
  }

  // Remove from tasks
  if (result.tasks) {
    result.tasks = result.tasks.filter((task) => {
      if (task.id === id) return false;
      removeNodeById(task, id);
      return true;
    });
  }

  // Remove from branches
  if (result.branches) {
    for (const [branchKey, branchNodes] of Object.entries(result.branches)) {
      result.branches[branchKey] = branchNodes.filter((branchNode) => {
        if (branchNode.id === id) return false;
        removeNodeById(branchNode, id);
        return true;
      });
    }
  }

  // Recursively clean empty nodes
  for (const branchNode of result.children || []) {
    removeNodeById(branchNode, id);
  }
  for (const taskNode of result.tasks || []) {
    removeNodeById(taskNode, id);
  }
  for (const branchNodes of Object.values(result.branches || {})) {
    for (const branchNode of branchNodes) {
      removeNodeById(branchNode, id);
    }
  }

  return result;
}

/**
 * Insert a node into the workflow tree at a specific location
 */
export function insertNodeIntoWorkflow(
  parent: WorkflowNode,
  nodeToInsert: WorkflowNode,
  connectionType: 'child' | 'branch' | 'task' = 'child',
  branchKey?: string
): void {
  switch (connectionType) {
    case 'child':
      if (!parent.children) parent.children = [];
      parent.children.push(cloneNode(nodeToInsert));
      break;

    case 'task':
      if (!parent.tasks) parent.tasks = [];
      parent.tasks.push(cloneNode(nodeToInsert));
      break;

    case 'branch':
      if (!parent.branches) parent.branches = {};
      if (!branchKey) branchKey = 'default';
      if (!parent.branches[branchKey]) parent.branches[branchKey] = [];
      parent.branches[branchKey].push(cloneNode(nodeToInsert));
      break;
  }
}

/**
 * Collect all nodes in the workflow (depth-first)
 */
export function getAllNodes(node: WorkflowNode): WorkflowNode[] {
  const result: WorkflowNode[] = [node];

  if (node.children) {
    for (const child of node.children) {
      result.push(...getAllNodes(child));
    }
  }

  if (node.tasks) {
    for (const task of node.tasks) {
      result.push(...getAllNodes(task));
    }
  }

  if (node.branches) {
    for (const branchNodes of Object.values(node.branches)) {
      for (const branchNode of branchNodes) {
        result.push(...getAllNodes(branchNode));
      }
    }
  }

  if (node.join) {
    result.push(...getAllNodes(node.join));
  }

  return result;
}

/**
 * Get all parent node IDs for a given node (path from root to node)
 */
export function getNodePath(
  rootNode: WorkflowNode,
  targetId: string
): string[] {
  const path: string[] = [];

  function traverse(node: WorkflowNode): boolean {
    path.push(node.id);

    if (node.id === targetId) return true;

    // Search children
    if (node.children) {
      for (const child of node.children) {
        if (traverse(child)) return true;
      }
    }

    // Search tasks
    if (node.tasks) {
      for (const task of node.tasks) {
        if (traverse(task)) return true;
      }
    }

    // Search branches
    if (node.branches) {
      for (const branchNodes of Object.values(node.branches)) {
        for (const branchNode of branchNodes) {
          if (traverse(branchNode)) return true;
        }
      }
    }

    // Search join
    if (node.join) {
      if (traverse(node.join)) return true;
    }

    path.pop();
    return false;
  }

  traverse(rootNode);
  return path;
}

/**
 * Check if a node is a descendant of another node
 */
export function isDescendant(
  rootNode: WorkflowNode,
  potentialParentId: string,
  nodeId: string
): boolean {
  const path = getNodePath(rootNode, nodeId);
  return path.includes(potentialParentId);
}

/**
 * Replace a node in the tree
 */
export function replaceNode(
  node: WorkflowNode,
  targetId: string,
  replacement: WorkflowNode
): WorkflowNode {
  if (node.id === targetId) {
    return cloneNode(replacement);
  }

  const result = cloneNode(node);

  if (result.children) {
    result.children = result.children.map((child) =>
      replaceNode(child, targetId, replacement)
    );
  }

  if (result.tasks) {
    result.tasks = result.tasks.map((task) =>
      replaceNode(task, targetId, replacement)
    );
  }

  if (result.branches) {
    for (const [branchKey, branchNodes] of Object.entries(result.branches)) {
      result.branches[branchKey] = branchNodes.map((branchNode) =>
        replaceNode(branchNode, targetId, replacement)
      );
    }
  }

  if (result.join) {
    result.join = replaceNode(result.join, targetId, replacement);
  }

  return result;
}

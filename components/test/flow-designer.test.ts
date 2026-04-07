/// <reference types="mocha" />
import { expect, fixture } from '@open-wc/testing';
import type { Workflow, WorkflowNode } from '../src/flow-designer/types.js';
import { SwimlaneLayout } from '../src/flow-designer/layout.js';
import { WorkflowValidator } from '../src/flow-designer/validation.js';
import {
  cloneWorkflow,
  findNodeById,
  removeNodeById,
  insertNodeIntoWorkflow,
  getAllNodes,
  getNodePath,
  isDescendant,
} from '../src/flow-designer/workflow-utils.js';
import {
  AddNodeCommand,
  DeleteNodeCommand,
  EditNodeCommand,
} from '../src/flow-designer/commands.js';

describe('Flow Designer - Core Functionality', () => {
  let sampleWorkflow: Workflow;

  beforeEach(() => {
    sampleWorkflow = {
      workflow_id: 'test_workflow',
      nodes: {
        id: 'node_1',
        type: 'trigger',
        label: 'Start Process',
        children: [
          {
            id: 'node_2',
            type: 'action',
            label: 'Process Data',
            children: [
              {
                id: 'node_3',
                type: 'decision',
                label: 'Is Valid?',
                branches: {
                  yes: [
                    {
                      id: 'node_4',
                      type: 'action',
                      label: 'Save to DB',
                    },
                  ],
                  no: [
                    {
                      id: 'node_5',
                      type: 'action',
                      label: 'Log Error',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    };
  });

  describe('Workflow Utils', () => {
    it('should clone workflow deeply', () => {
      const cloned = cloneWorkflow(sampleWorkflow);
      expect(cloned).to.deep.equal(sampleWorkflow);
      expect(cloned).not.to.equal(sampleWorkflow);
    });

    it('should find node by ID', () => {
      const node = findNodeById(sampleWorkflow.nodes, 'node_2');
      expect(node).to.exist;
      expect(node?.label).to.equal('Process Data');
    });

    it('should return null for non-existent node', () => {
      const node = findNodeById(sampleWorkflow.nodes, 'nonexistent');
      expect(node).to.be.null;
    });

    it('should get all nodes in workflow', () => {
      const allNodes = getAllNodes(sampleWorkflow.nodes);
      expect(allNodes.length).to.equal(5);
    });

    it('should get path to node', () => {
      const path = getNodePath(sampleWorkflow.nodes, 'node_4');
      expect(path).to.include('node_1');
      expect(path).to.include('node_2');
      expect(path).to.include('node_3');
      expect(path).to.include('node_4');
    });

    it('should detect descendant relationship', () => {
      const isDesc = isDescendant(sampleWorkflow.nodes, 'node_3', 'node_4');
      expect(isDesc).to.be.true;
    });

    it('should not mark non-descendant as descendant', () => {
      const isDesc = isDescendant(sampleWorkflow.nodes, 'node_4', 'node_3');
      expect(isDesc).to.be.false;
    });
  });

  describe('Workflow Validation', () => {
    it('should validate a valid workflow', () => {
      const errors = WorkflowValidator.validate(sampleWorkflow);
      const criticalErrors = errors.filter((e) => e.severity === 'error');
      expect(criticalErrors.length).to.equal(0);
    });

    it('should detect missing loop target', () => {
      const invalidWorkflow: Workflow = {
        workflow_id: 'test',
        nodes: {
          id: 'start',
          type: 'trigger',
          label: 'Start',
          children: [
            {
              id: 'loop_end_1',
              type: 'loop_end',
              label: 'Loop End',
              // Missing target_id
            },
          ],
        },
      };

      const errors = WorkflowValidator.validate(invalidWorkflow);
      const missingTargetError = errors.find((e) => e.type === 'missing_target');
      expect(missingTargetError).to.exist;
    });

    it('should detect fork without join', () => {
      const invalidWorkflow: Workflow = {
        workflow_id: 'test',
        nodes: {
          id: 'start',
          type: 'trigger',
          label: 'Start',
          children: [
            {
              id: 'fork_1',
              type: 'fork',
              label: 'Fork',
              tasks: [
                {
                  id: 'task_1',
                  type: 'action',
                  label: 'Task 1',
                },
              ],
              // Missing join
            },
          ],
        },
      };

      const errors = WorkflowValidator.validate(invalidWorkflow);
      const forkError = errors.find((e) => e.type === 'invalid_fork_join');
      expect(forkError).to.exist;
    });

    it('should detect decision without branches', () => {
      const invalidWorkflow: Workflow = {
        workflow_id: 'test',
        nodes: {
          id: 'start',
          type: 'trigger',
          label: 'Start',
          children: [
            {
              id: 'decision_1',
              type: 'decision',
              label: 'Decision',
              // Missing branches
            },
          ],
        },
      };

      const errors = WorkflowValidator.validate(invalidWorkflow);
      const branchError = errors.find((e) => e.type === 'invalid_branch');
      expect(branchError).to.exist;
    });
  });

  describe('Layout Algorithm', () => {
    it('should calculate positions for simple sequential flow', () => {
      const simple: Workflow = {
        workflow_id: 'simple',
        nodes: {
          id: 'n1',
          type: 'trigger',
          label: 'Start',
          children: [
            {
              id: 'n2',
              type: 'action',
              label: 'Action',
            },
          ],
        },
      };

      const positioned = SwimlaneLayout.calculateLayout(simple.nodes);
      expect(positioned.length).to.equal(2);
      expect(positioned[0].node.id).to.equal('n1');
      expect(positioned[1].node.id).to.equal('n2');
    });

    it('should calculate positions for branched flow', () => {
      const positioned = SwimlaneLayout.calculateLayout(sampleWorkflow.nodes);
      expect(positioned.length).to.equal(5);

      // Check different lanes are assigned
      const lanes = new Set(positioned.map((n) => n.lane));
      expect(lanes.size).to.be.greaterThan(1);
    });

    it('should calculate canvas bounds', () => {
      const positioned = SwimlaneLayout.calculateLayout(sampleWorkflow.nodes);
      const bounds = SwimlaneLayout.getCanvasBounds(positioned);
      expect(bounds.width).to.be.greaterThan(0);
      expect(bounds.height).to.be.greaterThan(0);
    });

    it('should generate swimlane configurations', () => {
      const positioned = SwimlaneLayout.calculateLayout(sampleWorkflow.nodes);
      const swimlanes = SwimlaneLayout.getSwimlanes(positioned);
      expect(swimlanes.length).to.be.greaterThan(0);
      expect(swimlanes[0].name).to.exist;
    });
  });

  describe('Commands and History', () => {
    it('should add node via command', () => {
      const newNode: WorkflowNode = {
        id: 'new_node',
        type: 'action',
        label: 'New Action',
      };

      const command = new AddNodeCommand(newNode, 'node_1');
      const result = command.execute(sampleWorkflow);

      const addedNode = findNodeById(result.nodes, 'new_node');
      expect(addedNode).to.exist;
    });

    it('should delete node via command', () => {
      const command = new DeleteNodeCommand('node_2', sampleWorkflow);
      const result = command.execute(sampleWorkflow);

      const deletedNode = findNodeById(result.nodes, 'node_2');
      expect(deletedNode).to.be.null;
    });

    it('should edit node via command', () => {
      const command = new EditNodeCommand('node_2', { label: 'Updated Label' }, sampleWorkflow);
      const result = command.execute(sampleWorkflow);

      const updatedNode = findNodeById(result.nodes, 'node_2');
      expect(updatedNode?.label).to.equal('Updated Label');
    });

    it('should undo edit command', () => {
      const command = new EditNodeCommand('node_2', { label: 'Updated Label' }, sampleWorkflow);
      const executed = command.execute(sampleWorkflow);
      const undone = command.undo(executed);

      const restoredNode = findNodeById(undone.nodes, 'node_2');
      expect(restoredNode?.label).to.equal('Process Data');
    });
  });

  describe('Complex Workflow Scenarios', () => {
    it('should handle loop workflow', () => {
      const loopWorkflow: Workflow = {
        workflow_id: 'loop_test',
        nodes: {
          id: 'start',
          type: 'trigger',
          label: 'Start',
          children: [
            {
              id: 'loop_start',
              type: 'loop_start',
              label: 'Begin Loop',
              children: [
                {
                  id: 'action',
                  type: 'action',
                  label: 'Do Something',
                  children: [
                    {
                      id: 'loop_end',
                      type: 'loop_end',
                      label: 'End Loop',
                      target_id: 'loop_start',
                    },
                  ],
                },
              ],
            },
          ],
        },
      };

      const errors = WorkflowValidator.validate(loopWorkflow);
      expect(errors).to.be.an('array');
    });

    it('should handle fork/join workflow', () => {
      const forkWorkflow: Workflow = {
        workflow_id: 'fork_test',
        nodes: {
          id: 'start',
          type: 'trigger',
          label: 'Start',
          children: [
            {
              id: 'fork',
              type: 'fork',
              label: 'Parallel',
              tasks: [
                {
                  id: 'task1',
                  type: 'action',
                  label: 'Task 1',
                },
                {
                  id: 'task2',
                  type: 'action',
                  label: 'Task 2',
                },
              ],
              join: {
                id: 'join',
                type: 'join',
                label: 'Merge',
              },
            },
          ],
        },
      };

      const errors = WorkflowValidator.validate(forkWorkflow);
      const forkErrors = errors.filter((e) => e.type === 'invalid_fork_join');
      expect(forkErrors.length).to.equal(0);
    });
  });
});

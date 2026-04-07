# Flow Designer Component Demo

## Basic Usage

```html
<wc-flow-designer id="designer"></wc-flow-designer>

<script type="module">
  import { FlowDesigner, Workflow } from '@redvars/peacock';

  // Define a workflow
  const workflow = {
    workflow_id: 'demo_workflow',
    nodes: {
      id: 'start',
      type: 'trigger',
      label: 'Start Process',
      children: [
        {
          id: 'validate',
          type: 'decision',
          label: 'Data Valid?',
          branches: {
            yes: [
              {
                id: 'process',
                type: 'action',
                label: 'Process Data',
              }
            ],
            no: [
              {
                id: 'error',
                type: 'action',
                label: 'Log Error',
              }
            ]
          }
        }
      ]
    }
  };

  // Set workflow on component
  const designer = document.getElementById('designer');
  designer.workflow = workflow;

  // Listen for changes
  designer.addEventListener('workflow-changed', (e) => {
    console.log('Workflow changed:', e.detail.type);
    console.log('Updated workflow:', e.detail.workflow);
  });

  // Add a new node
  const newNode = {
    id: 'new_action',
    type: 'action',
    label: 'New Action'
  };
  designer.addNode(newNode, 'start');

  // Undo/Redo
  if (designer.canUndo()) {
    designer.undo();
  }

  if (designer.canRedo()) {
    designer.redo();
  }

  // Validate
  designer.validate();

  // Export
  const json = designer.exportWorkflow();
</script>
```

## Customizing Node Templates

```html
<wc-flow-designer id="designer">
  <!-- Custom trigger node template -->
  <div slot="trigger-header" style="color: green; font-weight: bold;">
    🚀 Custom Trigger
  </div>

  <!-- Custom action node template -->
  <div slot="action-header" style="color: blue;">
    ⚙️ Custom Action
  </div>
  <p slot="action-body">Custom action content here</p>

  <!-- Custom decision template -->
  <div slot="decision-header" style="color: orange;">
    ❓ Custom Decision
  </div>
</wc-flow-designer>
```

## Workflow Structure

The component supports complex workflows:

```javascript
{
  workflow_id: 'complex_workflow',
  nodes: {
    id: 'trigger_1',
    type: 'trigger',
    label: 'Input Received',
    
    // Sequential flow
    children: [
      {
        id: 'loop_1',
        type: 'loop_start',
        label: 'Begin Loop',
        
        children: [
          {
            id: 'decision_1',
            type: 'decision',
            label: 'Check Condition',
            
            // Conditional branching
            branches: {
              yes: [
                {
                  id: 'fork_1',
                  type: 'fork',
                  label: 'Parallel Tasks',
                  
                  // Parallel execution
                  tasks: [
                    { id: 'task_1', type: 'action', label: 'Task A' },
                    { id: 'task_2', type: 'action', label: 'Task B' }
                  ],
                  
                  // Join point
                  join: {
                    id: 'join_1',
                    type: 'join',
                    label: 'Merge',
                    children: [
                      {
                        id: 'loop_end_1',
                        type: 'loop_end',
                        label: 'Loop Back',
                        target_id: 'loop_1'
                      }
                    ]
                  }
                }
              ],
              no: [
                { id: 'skip', type: 'action', label: 'Skip' }
              ]
            }
          }
        ]
      }
    ]
  }
}
```

## Available Node Types

- **trigger** - Start of workflow
- **action** - Perform an action
- **decision** - Branch on condition (yes/no)
- **loop_start** - Begin loop
- **loop_end** - End loop (loop_start target)
- **fork** - Parallel execution start
- **join** - Parallel execution end

## Events

- `workflow-changed` - Emitted when workflow is modified
- `node-selected` - Emitted when node is clicked
- `node-edited` - Emitted when node is edited
- `node-deleted` - Emitted when node is deleted
- `validation-result` - Emitted when validate() is called

## Properties

- `workflow: Workflow` - Current workflow definition
- `readonly: boolean` - Read-only mode (default: false)
- `disabled: boolean` - Disabled state (default: false)
- `showValidation: boolean` - Show validation errors (default: false)

## Methods

- `addNode(node, parentId, connectionType?, branchKey?)` - Add node
- `deleteNode(nodeId)` - Delete node
- `editNode(nodeId, updates)` - Edit node
- `moveNode(nodeId, newParentId, newIndex, connectionType?, branchKey?)` - Move node
- `undo()` - Undo last operation
- `redo()` - Redo last undone operation
- `canUndo()` - Check if undo available
- `canRedo()` - Check if redo available
- `validate()` - Validate workflow
- `exportWorkflow()` - Export as JSON

## Validation

The component automatically validates workflows after each change:

- ✅ Detects circular loops
- ✅ Detects orphaned nodes
- ✅ Validates decision branches (yes/no)
- ✅ Validates fork/join pairs
- ✅ Validates loop targets

Invalid workflows will prompt user confirmation before accepting changes.

## Styling

Custom CSS properties available:

```css
wc-flow-designer {
  --flow-designer-height: 600px;
  --flow-designer-border-color: var(--color-outline-variant);
  --flow-designer-background: var(--color-surface);
  --flow-designer-border-radius: var(--shape-corner-medium);
  --flow-designer-action-bar-bg: var(--color-surface-container);
}
```

## Keyboard Shortcuts

- **Ctrl+Z** / **Cmd+Z** - Undo
- **Ctrl+Y** / **Cmd+Y** - Redo
- **Delete** - Delete selected node
- **Enter** / **Space** - Select/activate node
- **Click + Drag** - Pan canvas
- **Scroll** - Zoom in/out (via toolbar)

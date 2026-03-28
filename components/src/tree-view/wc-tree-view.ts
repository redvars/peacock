import { customElement } from 'lit/decorators.js';
import { TreeView } from './tree-view.js';
import { TreeNode } from './tree-node.js';

@customElement('wc-tree-node')
export class WcTreeNode extends TreeNode {}

@customElement('wc-tree-view')
export class WcTreeView extends TreeView {}

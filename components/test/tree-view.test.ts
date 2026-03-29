/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { TreeView, TreeNode } from '../src/index.js';
import '../src/tree-view/wc-tree-view.js';

describe('TreeView', () => {
  it('renders with slot content', async () => {
    const el = await fixture<TreeView>(html`
      <wc-tree-view>
        <wc-tree-node label="Node 1"></wc-tree-node>
      </wc-tree-view>
    `);
    expect(el).to.exist;
    const children = el.querySelectorAll('wc-tree-node');
    expect(children.length).to.equal(1);
  });

  it('has default selectedNode as empty string', async () => {
    const el = await fixture<TreeView>(html`<wc-tree-view></wc-tree-view>`);
    expect(el.selectedNode).to.equal('');
  });

  it('updates selectedNode when a node is clicked', async () => {
    const el = await fixture<TreeView>(html`
      <wc-tree-view>
        <wc-tree-node label="Node 1" value="node-1"></wc-tree-node>
      </wc-tree-view>
    `);

    const node = el.querySelector<TreeNode>('wc-tree-node')!;
    node.dispatchEvent(
      new CustomEvent('tree-node:click', {
        bubbles: true,
        composed: true,
        detail: { value: 'node-1', label: 'Node 1' },
      }),
    );

    expect(el.selectedNode).to.equal('node-1');
  });

  it('applies selectedNode to matching node on initial load', async () => {
    const el = await fixture<TreeView>(html`
      <wc-tree-view selected-node="node-2">
        <wc-tree-node label="Node 1" value="node-1"></wc-tree-node>
        <wc-tree-node label="Node 2" value="node-2"></wc-tree-node>
      </wc-tree-view>
    `);

    await el.updateComplete;

    const nodes = el.querySelectorAll<TreeNode>('wc-tree-node');
    expect(nodes[0]?.selected).to.be.false;
    expect(nodes[1]?.selected).to.be.true;
  });

  it('emits tree-view:change when a node is selected', async () => {
    const el = await fixture<TreeView>(html`
      <wc-tree-view>
        <wc-tree-node label="Node A" value="a"></wc-tree-node>
      </wc-tree-view>
    `);

    let changeDetail: any = null;
    el.addEventListener('tree-view:change', (e: Event) => {
      changeDetail = (e as CustomEvent).detail;
    });

    const node = el.querySelector<TreeNode>('wc-tree-node')!;
    node.dispatchEvent(
      new CustomEvent('tree-node:click', {
        bubbles: true,
        composed: true,
        detail: { value: 'a', label: 'Node A' },
      }),
    );

    expect(changeDetail).to.not.be.null;
    expect(changeDetail.value).to.equal('a');
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<TreeView>(html`
      <wc-tree-view>
        <wc-tree-node label="Node 1"></wc-tree-node>
        <wc-tree-node label="Node 2"></wc-tree-node>
      </wc-tree-view>
    `);
    await expect(el).to.be.accessible();
  });
});

describe('TreeNode', () => {
  it('has default properties', async () => {
    const el = await fixture<TreeNode>(
      html`<wc-tree-node label="Test"></wc-tree-node>`,
    );
    expect(el.label).to.equal('Test');
    expect(el.disabled).to.equal(false);
    expect(el.selected).to.equal(false);
    expect(el.expanded).to.equal(false);
    expect(el.level).to.equal(0);
  });

  it('renders label text', async () => {
    const el = await fixture<TreeNode>(
      html`<wc-tree-node label="My Node"></wc-tree-node>`,
    );
    const label = el.shadowRoot!.querySelector('.tree-node-label');
    expect(label?.textContent?.trim()).to.include('My Node');
  });

  it('reflects selected state', async () => {
    const el = await fixture<TreeNode>(
      html`<wc-tree-node label="Node" selected></wc-tree-node>`,
    );
    expect(el.selected).to.be.true;
    const content = el.shadowRoot!.querySelector('.tree-node-content');
    expect(content?.classList.contains('selected')).to.be.true;
  });

  it('reflects disabled state', async () => {
    const el = await fixture<TreeNode>(
      html`<wc-tree-node label="Node" disabled></wc-tree-node>`,
    );
    expect(el.disabled).to.be.true;
    const content = el.shadowRoot!.querySelector('.tree-node-content');
    expect(content?.classList.contains('disabled')).to.be.true;
  });

  it('shows expand icon when it has children', async () => {
    const el = await fixture<TreeNode>(html`
      <wc-tree-node label="Parent">
        <wc-tree-node label="Child"></wc-tree-node>
      </wc-tree-node>
    `);
    await el.updateComplete;
    const expandIcon = el.shadowRoot!.querySelector('.expand-icon');
    expect(expandIcon).to.exist;
  });

  it('shows icon-space when it has no children', async () => {
    const el = await fixture<TreeNode>(
      html`<wc-tree-node label="Leaf"></wc-tree-node>`,
    );
    const iconSpace = el.shadowRoot!.querySelector('.icon-space');
    expect(iconSpace).to.exist;
  });

  it('toggles expanded on click', async () => {
    const el = await fixture<TreeNode>(html`
      <wc-tree-node label="Parent">
        <wc-tree-node label="Child"></wc-tree-node>
      </wc-tree-node>
    `);
    await el.updateComplete;
    expect(el.expanded).to.be.false;

    const content = el.shadowRoot!.querySelector<HTMLElement>(
      '.tree-node-content',
    );
    content?.click();
    await el.updateComplete;

    expect(el.expanded).to.be.true;
  });

  it('does not toggle when disabled', async () => {
    const el = await fixture<TreeNode>(html`
      <wc-tree-node label="Parent" disabled>
        <wc-tree-node label="Child"></wc-tree-node>
      </wc-tree-node>
    `);
    await el.updateComplete;
    expect(el.expanded).to.be.false;

    const content = el.shadowRoot!.querySelector<HTMLElement>(
      '.tree-node-content',
    );
    content?.click();
    await el.updateComplete;

    expect(el.expanded).to.be.false;
  });

  it('renders as anchor when href is provided', async () => {
    const el = await fixture<TreeNode>(
      html`<wc-tree-node
        label="Link Node"
        href="https://example.com"
      ></wc-tree-node>`,
    );
    const anchor = el.shadowRoot!.querySelector('a.tree-node-content');
    expect(anchor).to.exist;
    expect(anchor?.getAttribute('href')).to.equal('https://example.com');
  });

  it('renders as div when no href is provided', async () => {
    const el = await fixture<TreeNode>(
      html`<wc-tree-node label="Div Node"></wc-tree-node>`,
    );
    const div = el.shadowRoot!.querySelector('div.tree-node-content');
    expect(div).to.exist;
  });

  it('passes the a11y audit', async () => {
    const el = await fixture<TreeView>(
      html`<wc-tree-view
        ><wc-tree-node label="Accessible Node"></wc-tree-node
      ></wc-tree-view>`,
    );
    await expect(el).to.be.accessible();
  });
});

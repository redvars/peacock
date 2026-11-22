/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { a11ySnapshot, sendKeys } from '@web/test-runner-commands';
import { Card, CardContent } from '../src/card/index.js';
import { Item } from '../src/item/index.js';
import { ListItem } from '../src/list/index.js';

/*
  Actionable and link cards and clickable list items render their content inside a native button
  or link, which takes its accessible name from that content. These tests read the name from the
  browser's accessibility tree (Chrome DevTools Protocol, through a11ySnapshot), because making the
  content inert, which keeps it out of the tab order, also removes it from that tree and leaves
  the control without a name.
 */

for (const [tag, ctor] of [
  ['wc-card', Card],
  ['wc-card-content', CardContent],
  ['wc-item', Item],
  ['wc-list-item', ListItem],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, ctor);
}

interface AXNode {
  role: string;
  name: string;
  description?: string;
  disabled?: boolean;
  children?: AXNode[];
}

/** Buttons and links in the page's accessibility tree, in document order. */
async function axControls(): Promise<AXNode[]> {
  const root = (await a11ySnapshot({})) as unknown as AXNode;
  const found: AXNode[] = [];
  const walk = (node: AXNode) => {
    if (node.role === 'button' || node.role === 'link') found.push(node);
    node.children?.forEach(walk);
  };
  walk(root);
  return found;
}

async function onlyControl(): Promise<AXNode> {
  const controls = await axControls();
  expect(
    controls,
    'buttons and links in the accessibility tree',
  ).to.have.length(1);
  return controls[0];
}

function normalize(text: string | undefined) {
  return (text ?? '').replace(/\s+/g, ' ').trim();
}

/** The focused element, following shadow roots down to the innermost one. */
function deepActiveElement() {
  let active = document.activeElement;
  while (active?.shadowRoot?.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

function query<T extends Element>(
  root: Element | DocumentFragment,
  selector: string,
): T {
  const found = root.querySelector<T>(selector);
  if (!found) throw new Error(`No element matches ${selector}`);
  return found;
}

/** The native button or link a card or list item renders. */
function control(host: Element, id: string) {
  if (!host.shadowRoot) throw new Error('No shadow root');
  return query<HTMLElement>(host.shadowRoot, `#${id}`);
}

const cardContent = html`<wc-card-content>
  <h3>Blank page</h3>
  <p>Start from an empty canvas.</p>
</wc-card-content>`;

describe('Accessible names', () => {
  describe('wc-card', () => {
    it('names an actionable card from its content', async () => {
      await fixture(html`<wc-card actionable>${cardContent}</wc-card>`);

      const node = await onlyControl();
      expect(node.role).to.equal('button');
      expect(normalize(node.name)).to.equal(
        'Blank page Start from an empty canvas.',
      );
    });

    it('names a link card from its content', async () => {
      await fixture(
        html`<wc-card href="/templates/blank">${cardContent}</wc-card>`,
      );

      const node = await onlyControl();
      expect(node.role).to.equal('link');
      expect(normalize(node.name)).to.equal(
        'Blank page Start from an empty canvas.',
      );
    });

    it('names a disabled card and describes it with the disabled reason', async () => {
      await fixture(
        html`<wc-card
          actionable
          disabled
          disabled-reason="Your organization admin manages billing."
          >${cardContent}</wc-card
        >`,
      );

      const node = await onlyControl();
      expect(normalize(node.name)).to.equal(
        'Blank page Start from an empty canvas.',
      );
      expect(normalize(node.description)).to.equal(
        'Your organization admin manages billing.',
      );
      expect(node.disabled).to.be.true;
    });

    it('names a disabled link card', async () => {
      await fixture(
        html`<wc-card href="/templates/blank" disabled
          >${cardContent}</wc-card
        >`,
      );

      const node = await onlyControl();
      expect(node.role).to.equal('link');
      expect(normalize(node.name)).to.equal(
        'Blank page Start from an empty canvas.',
      );
    });

    it('keeps focusable content out of the tab order', async () => {
      const wrapper = await fixture<HTMLElement>(
        html`<div>
          <button id="before">Before</button>
          <wc-card actionable>
            <wc-card-content>
              <h3>Report</h3>
              <a href="#nested">Nested link</a>
              <input aria-label="Nested input" />
            </wc-card-content>
          </wc-card>
          <button id="after">After</button>
        </div>`,
      );
      const card = query<Card>(wrapper, 'wc-card');
      const button = control(card, 'card');
      const before = query<HTMLButtonElement>(wrapper, '#before');
      const after = query<HTMLButtonElement>(wrapper, '#after');

      before.focus();
      await sendKeys({ press: 'Tab' });
      expect(deepActiveElement()).to.equal(button);
      await sendKeys({ press: 'Tab' });
      expect(deepActiveElement()).to.equal(after);

      await sendKeys({ down: 'Shift' });
      await sendKeys({ press: 'Tab' });
      expect(deepActiveElement()).to.equal(button);
      await sendKeys({ press: 'Tab' });
      await sendKeys({ up: 'Shift' });
      expect(deepActiveElement()).to.equal(before);
    });

    it('sends clicks on the content to the control', async () => {
      const el = await fixture<Card>(
        html`<wc-card actionable
          ><wc-card-content><h3>Report</h3></wc-card-content></wc-card
        >`,
      );
      const box = query(el, 'h3').getBoundingClientRect();
      const hit = el.shadowRoot?.elementFromPoint(
        box.x + box.width / 2,
        box.y + box.height / 2,
      );
      expect(hit).to.equal(control(el, 'card'));
    });
  });

  describe('wc-list-item', () => {
    it('names an actionable item from all of its content', async () => {
      await fixture(
        html`<wc-list-item actionable>
          Profile settings
          <span slot="supporting-text">Name, photo and email</span>
        </wc-list-item>`,
      );

      const node = await onlyControl();
      expect(node.role).to.equal('button');
      expect(normalize(node.name)).to.equal(
        'Profile settings Name, photo and email',
      );
    });

    it('names a link item from content in named slots', async () => {
      await fixture(
        html`<wc-list-item href="/people/ada">
          <span slot="start">AL</span>
          <span slot="headline">Ada Lovelace</span>
          <span slot="supporting-text">Software Engineer</span>
          <span slot="trailing-supporting-text">7</span>
          <span slot="end">New</span>
        </wc-list-item>`,
      );

      const node = await onlyControl();
      expect(node.role).to.equal('link');
      expect(normalize(node.name)).to.equal(
        'AL Ada Lovelace Software Engineer 7 New',
      );
    });

    it('keeps focusable content out of the tab order', async () => {
      const wrapper = await fixture<HTMLElement>(
        html`<div>
          <button id="before">Before</button>
          <wc-list-item actionable>
            <a slot="start" href="#start">Start link</a>
            Notifications
            <a slot="end" href="#end">End link</a>
          </wc-list-item>
          <button id="after">After</button>
        </div>`,
      );
      const item = query<ListItem>(wrapper, 'wc-list-item');
      await item.updateComplete;
      const button = control(item, 'list-item');

      query<HTMLButtonElement>(wrapper, '#before').focus();
      await sendKeys({ press: 'Tab' });
      expect(deepActiveElement()).to.equal(button);
      await sendKeys({ press: 'Tab' });
      expect(deepActiveElement()).to.equal(query(wrapper, '#after'));
    });

    it('sends clicks on the content to the control', async () => {
      const el = await fixture<ListItem>(
        html`<wc-list-item actionable
          ><span slot="headline">Notifications</span></wc-list-item
        >`,
      );
      const box = query(el, 'span').getBoundingClientRect();
      const hit = el.shadowRoot?.elementFromPoint(
        box.x + box.width / 2,
        box.y + box.height / 2,
      );
      expect(hit).to.equal(control(el, 'list-item'));
    });

    it('leaves the content of a static item focusable', async () => {
      const wrapper = await fixture<HTMLElement>(
        html`<div>
          <button id="before">Before</button>
          <wc-list-item>
            Notifications
            <a slot="end" href="#nested">Nested link</a>
          </wc-list-item>
        </div>`,
      );
      await query<ListItem>(wrapper, 'wc-list-item').updateComplete;

      query<HTMLButtonElement>(wrapper, '#before').focus();
      await sendKeys({ press: 'Tab' });
      expect(deepActiveElement()).to.equal(query(wrapper, 'a'));
    });
  });
});

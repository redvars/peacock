/// <reference types="mocha" />
import { html, LitElement } from 'lit';
import { fixture, expect } from '@open-wc/testing';
// Import modules directly: src/index.js pulls in html-editor's CommonJS js-beautify, which the
// test server cannot load.
import { Button } from '../src/button/button/button.js';
import { Fab } from '../src/button/fab/fab.js';
import { IconButton } from '../src/button/icon-button/icon-button.js';
import { LinkButton } from '../src/button/link-button/link-button.js';
import { Chip } from '../src/chip/chip/chip.js';
import { Item } from '../src/item/index.js';
import { ListItem } from '../src/list/index.js';
import { MenuItem } from '../src/menu/index.js';
import { Tab } from '../src/tabs/index.js';
import { countActivations, wait } from './helpers/count-activations.js';

for (const [tag, element] of [
  ['wc-button', Button],
  ['wc-fab', Fab],
  ['wc-icon-button', IconButton],
  ['wc-link-button', LinkButton],
  ['wc-chip', Chip],
  ['wc-item', Item],
  ['wc-list-item', ListItem],
  ['wc-menu-item', MenuItem],
  ['wc-tab', Tab],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

interface Case {
  tag: string;
  /** Attributes every fixture of this element needs. */
  attrs: Record<string, string>;
  /** The inner control a host click is forwarded to. */
  control: string;
  /** Attributes that make the element swallow clicks. */
  blocked: Record<string, string>;
}

const cases: Case[] = [
  {
    tag: 'wc-button',
    attrs: {},
    control: '.button',
    blocked: { 'soft-disabled': '' },
  },
  { tag: 'wc-fab', attrs: {}, control: '.button', blocked: { loading: '' } },
  {
    tag: 'wc-icon-button',
    attrs: { name: 'add' },
    control: '.button',
    blocked: { 'soft-disabled': '' },
  },
  {
    tag: 'wc-link-button',
    attrs: { href: '#throttle' },
    control: '.button',
    blocked: { 'soft-disabled': '' },
  },
  {
    tag: 'wc-chip',
    attrs: {},
    control: '.button',
    blocked: { 'soft-disabled': '' },
  },
  {
    tag: 'wc-list-item',
    attrs: { actionable: '' },
    control: '#list-item',
    blocked: { 'soft-disabled': '' },
  },
  {
    tag: 'wc-menu-item',
    attrs: {},
    control: '#menu-item',
    blocked: { 'soft-disabled': '' },
  },
  {
    tag: 'wc-tab',
    attrs: {},
    control: '.tab-element',
    blocked: { disabled: '', href: '#throttle' },
  },
];

async function make(tag: string, attrs: Record<string, string>) {
  const el = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    el.setAttribute(name, value);
  }
  el.textContent = 'Go';
  return fixture<LitElement>(html`${el}`);
}

describe('throttle-delay', () => {
  for (const { tag, attrs, control, blocked } of cases) {
    describe(tag, () => {
      it('activates on every click without throttle-delay', async () => {
        const el = await make(tag, attrs);
        expect(await countActivations(el, control)).to.equal(2);
      });

      it('activates once for two quick clicks with throttle-delay', async () => {
        const el = await make(tag, { ...attrs, 'throttle-delay': '1000' });
        expect(await countActivations(el, control)).to.equal(1);
      });

      it('drops a click inside the delay instead of replaying it after', async () => {
        const el = await make(tag, { ...attrs, 'throttle-delay': '50' });
        expect(await countActivations(el, control, 100)).to.equal(1);
      });

      it('activates again once the delay is over', async () => {
        const el = await make(tag, { ...attrs, 'throttle-delay': '50' });
        expect(await countActivations(el, control)).to.equal(1);
        await wait(100);
        expect(await countActivations(el, control)).to.equal(1);
      });

      it('swallows a real click on the inner control inside the delay', async () => {
        const el = await make(tag, { ...attrs, 'throttle-delay': '1000' });
        const inner = el.shadowRoot?.querySelector<HTMLElement>(control);
        if (!inner) throw new Error(`No ${control} in the shadow root`);
        let hostClicks = 0;
        let parentClicks = 0;
        el.addEventListener('click', () => {
          hostClicks += 1;
        });
        el.parentElement?.addEventListener('click', () => {
          parentClicks += 1;
        });

        inner.click();
        await wait();
        inner.click();
        await wait();
        expect(hostClicks).to.equal(1);
        expect(parentClicks).to.equal(1);
      });

      it('lets every real click through without throttle-delay', async () => {
        const el = await make(tag, attrs);
        const inner = el.shadowRoot?.querySelector<HTMLElement>(control);
        if (!inner) throw new Error(`No ${control} in the shadow root`);
        let hostClicks = 0;
        el.addEventListener('click', () => {
          hostClicks += 1;
        });

        inner.click();
        await wait();
        inner.click();
        await wait();
        expect(hostClicks).to.equal(2);
      });

      it('swallows every click while blocked, even inside the delay', async () => {
        const el = await make(tag, {
          ...attrs,
          ...blocked,
          'throttle-delay': '1000',
        });
        let clicks = 0;
        el.addEventListener('click', () => {
          clicks += 1;
        });

        el.click();
        await wait();
        el.click();
        expect(clicks).to.equal(0);
      });
    });
  }

  for (const tag of ['wc-button', 'wc-icon-button', 'wc-fab']) {
    describe(`${tag} toggle`, () => {
      const attrs = { toggle: '', 'throttle-delay': '50' };

      it('flips once and fires one change for a double click on the host', async () => {
        const el = await make(tag, attrs);
        let changes = 0;
        el.addEventListener('change', () => {
          changes += 1;
        });

        el.click();
        await wait();
        el.click();
        await wait(100);
        expect(changes).to.equal(1);
        expect((el as LitElement & { selected: boolean }).selected).to.equal(
          true,
        );
      });

      it('flips once and fires one change for a real double click', async () => {
        const el = await make(tag, attrs);
        const inner = el.shadowRoot?.querySelector<HTMLElement>('.button');
        if (!inner) throw new Error('No .button in the shadow root');
        let changes = 0;
        el.addEventListener('change', () => {
          changes += 1;
        });

        inner.click();
        await wait();
        inner.click();
        await wait(100);
        expect(changes).to.equal(1);
        expect((el as LitElement & { selected: boolean }).selected).to.equal(
          true,
        );
      });
    });
  }

  describe('wc-button in a form', () => {
    it('submits once for a real double click with throttle-delay', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form>
          <wc-button type="submit" throttle-delay="1000">Save</wc-button>
        </form>`,
      );
      let submits = 0;
      form.addEventListener('submit', event => {
        event.preventDefault();
        submits += 1;
      });
      const button = form.querySelector('wc-button');
      const inner = button?.shadowRoot?.querySelector<HTMLElement>('.button');
      if (!inner) throw new Error('No .button in the shadow root');

      inner.click();
      await wait();
      inner.click();
      await wait();
      expect(submits).to.equal(1);
    });

    it('does not submit while soft-disabled', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form>
          <wc-button type="submit" soft-disabled>Save</wc-button>
        </form>`,
      );
      let submits = 0;
      form.addEventListener('submit', event => {
        event.preventDefault();
        submits += 1;
      });
      const button = form.querySelector<HTMLElement>('wc-button');
      const inner = button?.shadowRoot?.querySelector<HTMLElement>('.button');
      if (!button || !inner) throw new Error('No .button in the shadow root');

      inner.click();
      await wait();
      button.click();
      await wait();
      expect(submits).to.equal(0);
    });

    it('submits on every real click without throttle-delay', async () => {
      const form = await fixture<HTMLFormElement>(
        html`<form><wc-button type="submit">Save</wc-button></form>`,
      );
      let submits = 0;
      form.addEventListener('submit', event => {
        event.preventDefault();
        submits += 1;
      });
      const button = form.querySelector('wc-button');
      const inner = button?.shadowRoot?.querySelector<HTMLElement>('.button');
      if (!inner) throw new Error('No .button in the shadow root');

      inner.click();
      await wait();
      inner.click();
      await wait();
      expect(submits).to.equal(2);
    });
  });
});

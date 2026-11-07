/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { Tab, TabGroup, TabPanel, Tabs } from '../src/tabs/index.js';

for (const [tag, element] of [
  ['wc-tab', Tab],
  ['wc-tabs', Tabs],
  ['wc-tab-panel', TabPanel],
  ['wc-tab-group', TabGroup],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function press(target: Element, key: string) {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    composed: true,
    cancelable: true,
  });
  target.dispatchEvent(event);
  return event;
}

function control(tab: Tab) {
  return tab.shadowRoot!.querySelector<HTMLElement>('#button')!;
}

/** Lets the mutation observers and the tabs' updates run. */
async function settle(el: HTMLElement) {
  await new Promise(resolve => {
    setTimeout(resolve);
  });
  const tabs = [el, ...el.querySelectorAll('wc-tab, wc-tabs, wc-tab-panel')];
  await Promise.all(
    tabs.map(node => (node as Tab).updateComplete ?? Promise.resolve()),
  );
}

async function tabList(dir = 'ltr') {
  const el = await fixture<Tabs>(html`
    <wc-tabs dir=${dir} aria-label="Sections">
      <wc-tab value="one" selected>One</wc-tab>
      <wc-tab value="two">Two</wc-tab>
      <wc-tab value="three" disabled>Three</wc-tab>
      <wc-tab value="four">Four</wc-tab>
    </wc-tabs>
  `);
  await settle(el);
  return { el, tabs: Array.from(el.querySelectorAll<Tab>('wc-tab')) };
}

describe('Tab', () => {
  it('renders the disabled reason text, not the template source', async () => {
    const el = await fixture<Tab>(
      html`<wc-tab disabled disabled-reason="No access">Billing</wc-tab>`,
    );
    const reason = el.shadowRoot!.querySelector('.screen-reader-only')!;

    expect(reason.textContent?.trim()).to.equal('No access');
    expect(control(el).getAttribute('aria-describedby')).to.equal(reason.id);
  });

  it('renders no disabled reason and no aria-describedby without one', async () => {
    const el = await fixture<Tab>(html`<wc-tab>Billing</wc-tab>`);
    expect(el.shadowRoot!.querySelector('.screen-reader-only')).to.not.exist;
    expect(control(el).hasAttribute('aria-describedby')).to.be.false;
  });

  it('renders role="tab" with aria-selected', async () => {
    const el = await fixture<Tab>(html`<wc-tab>Billing</wc-tab>`);
    expect(control(el).getAttribute('role')).to.equal('tab');
    expect(control(el).getAttribute('aria-selected')).to.equal('false');

    el.selected = true;
    await el.updateComplete;
    expect(control(el).getAttribute('aria-selected')).to.equal('true');
    expect(el.hasAttribute('selected')).to.be.true;
  });

  it('renders a link tab as a plain link with aria-current', async () => {
    const el = await fixture<Tab>(
      html`<wc-tab href="#billing" selected>Billing</wc-tab>`,
    );
    const link = control(el);
    expect(link.localName).to.equal('a');
    expect(link.hasAttribute('role')).to.be.false;
    expect(link.hasAttribute('aria-selected')).to.be.false;
    expect(link.getAttribute('aria-current')).to.equal('page');
  });

  it('does not reflect configAria', async () => {
    const el = await fixture<Tab>(html`<wc-tab>Billing</wc-tab>`);
    el.configAria = { 'aria-label': 'Billing details' };
    await el.updateComplete;
    expect(el.hasAttribute('configaria')).to.be.false;
    expect(control(el).getAttribute('aria-label')).to.equal('Billing details');
  });

  it('reads the kebab-case throttle-delay attribute', async () => {
    const el = await fixture<Tab>(
      html`<wc-tab throttle-delay="200">Billing</wc-tab>`,
    );
    expect(el.throttleDelay).to.equal(200);
  });

  it('reads the kebab-case disabled-reason attribute', async () => {
    const el = await fixture<Tab>(
      html`<wc-tab disabled disabled-reason="No access">Billing</wc-tab>`,
    );
    expect(el.disabledReason).to.equal('No access');
  });
});

describe('Tabs', () => {
  it('has role="tablist" and one tab stop, on the selected tab', async () => {
    const { el, tabs } = await tabList();
    expect(el.getAttribute('role')).to.equal('tablist');
    expect(tabs.map(tab => tab.tabIndex)).to.deep.equal([0, -1, -1, -1]);
  });

  it('moves and selects with the arrow keys, skipping disabled tabs', async () => {
    const { el, tabs } = await tabList();
    const [one, two, , four] = tabs;
    const values: (string | undefined)[] = [];
    el.addEventListener('change', event => {
      values.push((event as CustomEvent).detail.value);
    });

    press(one, 'ArrowRight');
    await settle(el);
    expect(two.selected).to.be.true;
    expect(one.selected).to.be.false;
    expect(two.tabIndex).to.equal(0);

    press(two, 'ArrowRight');
    await settle(el);
    expect(four.selected).to.be.true;

    // Wraps around.
    press(four, 'ArrowRight');
    await settle(el);
    expect(one.selected).to.be.true;

    press(one, 'End');
    await settle(el);
    expect(four.selected).to.be.true;

    press(four, 'Home');
    await settle(el);
    expect(one.selected).to.be.true;

    expect(values).to.deep.equal(['two', 'four', 'one', 'four', 'one']);
  });

  it('mirrors Left and Right in right-to-left layouts', async () => {
    const { el, tabs } = await tabList('rtl');
    const [one, two] = tabs;
    press(one, 'ArrowLeft');
    await settle(el);
    expect(two.selected).to.be.true;
    press(two, 'ArrowRight');
    await settle(el);
    expect(one.selected).to.be.true;
  });

  it('selects on click and fires change', async () => {
    const { el, tabs } = await tabList();
    setTimeout(() => tabs[1].click());
    const event = (await oneEvent(el, 'change')) as CustomEvent<{
      index: number;
      value: string;
    }>;
    expect(event.detail).to.deep.equal({ index: 1, value: 'two' });
    expect(tabs[1].selected).to.be.true;
  });

  it('leaves the selection to the consumer when managed', async () => {
    const { el, tabs } = await tabList();
    el.managed = true;
    setTimeout(() => tabs[1].click());
    const event = (await oneEvent(el, 'change')) as CustomEvent;
    expect(event.detail.index).to.equal(1);
    expect(tabs[0].selected).to.be.true;
    expect(tabs[1].selected).to.be.false;
  });

  it('moves the tab stop when the selection is set from outside', async () => {
    const { el, tabs } = await tabList();
    tabs[0].selected = false;
    tabs[3].selected = true;
    await settle(el);
    expect(tabs.map(tab => tab.tabIndex)).to.deep.equal([-1, -1, -1, 0]);
  });

  it('is navigation, not a tablist, when every tab is a link', async () => {
    const el = await fixture<Tabs>(html`
      <wc-tabs>
        <wc-tab href="#one" selected>One</wc-tab>
        <wc-tab href="#two">Two</wc-tab>
      </wc-tabs>
    `);
    await settle(el);
    expect(el.hasAttribute('role')).to.be.false;

    // Arrowing onto a link moves focus but does not select it.
    const [one, two] = Array.from(el.querySelectorAll<Tab>('wc-tab'));
    press(one, 'ArrowRight');
    await settle(el);
    expect(two.tabIndex).to.equal(0);
    expect(two.selected).to.be.false;
  });
});

describe('TabGroup', () => {
  it('links tabs to panels by value', async () => {
    const el = await fixture<TabGroup>(html`
      <wc-tab-group>
        <wc-tabs>
          <wc-tab value="one">One</wc-tab>
          <wc-tab value="two" selected>Two</wc-tab>
        </wc-tabs>
        <wc-tab-panel value="one">Panel 1</wc-tab-panel>
        <wc-tab-panel value="two">Panel 2</wc-tab-panel>
      </wc-tab-group>
    `);
    const [one, two] = Array.from(
      el.querySelectorAll<TabPanel>('wc-tab-panel'),
    );
    expect(one.active).to.be.false;
    expect(two.active).to.be.true;
  });

  it('shows the panel at the selected tab position when tabs have no value', async () => {
    const el = await fixture<TabGroup>(html`
      <wc-tab-group>
        <wc-tabs>
          <wc-tab>One</wc-tab>
          <wc-tab selected>Two</wc-tab>
        </wc-tabs>
        <wc-tab-panel>Panel 1</wc-tab-panel>
        <wc-tab-panel>Panel 2</wc-tab-panel>
      </wc-tab-group>
    `);
    const panels = Array.from(el.querySelectorAll<TabPanel>('wc-tab-panel'));
    expect(panels.map(panel => panel.active)).to.deep.equal([false, true]);
  });

  it('labels each panel by its tab and gives it role="tabpanel"', async () => {
    const el = await fixture<TabGroup>(html`
      <wc-tab-group>
        <wc-tabs>
          <wc-tab value="one">One</wc-tab>
          <wc-tab value="two">Two</wc-tab>
        </wc-tabs>
        <wc-tab-panel value="two">Panel 2</wc-tab-panel>
        <wc-tab-panel value="one">Panel 1</wc-tab-panel>
      </wc-tab-group>
    `);
    await settle(el);
    const [one, two] = Array.from(el.querySelectorAll<Tab>('wc-tab'));
    const panelTwo = el.querySelector<TabPanel>('wc-tab-panel[value="two"]')!;
    expect(panelTwo.getAttribute('role')).to.equal('tabpanel');
    expect(panelTwo.getAttribute('aria-labelledby')).to.equal(two.id);
    expect(two.panel).to.equal(panelTwo);
    expect(one.panel).to.equal(el.querySelector('wc-tab-panel[value="one"]'));

    const button = control(two) as HTMLElement & {
      ariaControlsElements?: Element[] | null;
    };
    if ('ariaControlsElements' in button) {
      expect(button.ariaControlsElements).to.deep.equal([panelTwo]);
    }
  });

  it('switches panels on change from its own tabs only', async () => {
    const el = await fixture<TabGroup>(html`
      <wc-tab-group>
        <wc-tabs>
          <wc-tab>One</wc-tab>
          <wc-tab>Two</wc-tab>
        </wc-tabs>
        <wc-tab-panel>Panel 1 <input /></wc-tab-panel>
        <wc-tab-panel>Panel 2</wc-tab-panel>
      </wc-tab-group>
    `);
    await settle(el);
    const panels = Array.from(el.querySelectorAll<TabPanel>('wc-tab-panel'));
    el.querySelector('input')!.dispatchEvent(
      new CustomEvent('change', { bubbles: true, detail: { index: 1 } }),
    );
    expect(panels.map(panel => panel.active)).to.deep.equal([true, false]);

    el.querySelectorAll<Tab>('wc-tab')[1].click();
    await settle(el);
    expect(panels.map(panel => panel.active)).to.deep.equal([false, true]);
  });

  it('wires tabs and panels added later', async () => {
    const el = await fixture<TabGroup>(html`
      <wc-tab-group>
        <wc-tabs>
          <wc-tab value="one">One</wc-tab>
        </wc-tabs>
        <wc-tab-panel value="one">Panel 1</wc-tab-panel>
      </wc-tab-group>
    `);
    const tab = document.createElement('wc-tab') as Tab;
    tab.value = 'two';
    tab.setAttribute('value', 'two');
    tab.textContent = 'Two';
    el.querySelector('wc-tabs')!.append(tab);
    const panel = document.createElement('wc-tab-panel') as TabPanel;
    panel.setAttribute('value', 'two');
    el.append(panel);
    await settle(el);

    expect(panel.getAttribute('aria-labelledby')).to.equal(tab.id);
    tab.click();
    await settle(el);
    expect(panel.active).to.be.true;
  });

  it('does not treat a link tab target as a panel key', async () => {
    const el = await fixture<TabGroup>(html`
      <wc-tab-group>
        <wc-tabs>
          <wc-tab>One</wc-tab>
          <wc-tab href="https://example.com" target="_blank">Docs</wc-tab>
        </wc-tabs>
        <wc-tab-panel>Panel 1</wc-tab-panel>
      </wc-tab-group>
    `);
    expect(el.querySelector<TabPanel>('wc-tab-panel')!.active).to.be.true;
  });
});

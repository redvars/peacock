/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync, waitUntil } from '@open-wc/testing';
import { AnchorNav } from '../src/anchor-nav/index.js';
import { ScrollArea } from '../src/scroll-area/index.js';

if (!customElements.get('wc-anchor-nav')) {
  customElements.define('wc-anchor-nav', AnchorNav);
}
if (!customElements.get('wc-scroll-area')) {
  customElements.define('wc-scroll-area', ScrollArea);
}

const section = 'block-size: 300px; margin: 0';

/** A nav next to a 200px scrolling column of four sections. */
async function setup(navAttributes = '') {
  const wrapper = fixtureSync<HTMLElement>(
    html`<div>
      <div id="column" style="block-size: 200px; overflow: auto">
        <article id="doc">
          <h2 id="intro" style=${section}>Introduction</h2>
          <h3 style=${section}>Install with npm</h3>
          <h2 id="usage" style=${section}>Usage</h2>
          <h2 id="faq" style="block-size: 40px; margin: 0">FAQ</h2>
        </article>
      </div>
    </div>`,
  );
  const nav = document.createElement('wc-anchor-nav') as AnchorNav;
  nav.setAttribute('for', 'doc');
  if (navAttributes) nav.setAttribute(navAttributes, '');
  wrapper.prepend(nav);
  await nav.updateComplete;
  await nav.updateComplete;
  const column = wrapper.querySelector<HTMLElement>('#column')!;
  return { nav, column, wrapper };
}

function links(nav: AnchorNav) {
  return Array.from(nav.shadowRoot!.querySelectorAll<HTMLAnchorElement>('a'));
}

function currentLink(nav: AnchorNav) {
  return links(nav).find(
    link => link.getAttribute('aria-current') === 'location',
  );
}

describe('wc-anchor-nav', () => {
  it('lists the headings of its for container, nesting h3 under h2', async () => {
    const { nav, wrapper } = await setup();
    const navElement = nav.shadowRoot!.querySelector('nav')!;
    expect(navElement.getAttribute('aria-label')).to.equal('On this page');
    expect(links(nav).map(link => link.textContent)).to.deep.equal([
      'Introduction',
      'Install with npm',
      'Usage',
      'FAQ',
    ]);
    // A heading without an id gets one from its text.
    const h3 = wrapper.querySelector('h3')!;
    expect(h3.id).to.equal('install-with-npm');
    expect(links(nav)[1].getAttribute('href')).to.equal('#install-with-npm');
    expect(links(nav)[1].closest('ul')!.classList.contains('level-2')).to.be
      .true;
    expect(nav.current).to.equal('intro');
    expect(currentLink(nav)!.textContent).to.equal('Introduction');
  });

  it('marks the section that passed the first third of the scroll container', async () => {
    const { nav, column } = await setup();
    let changes: string[] = [];
    nav.addEventListener('change', event =>
      changes.push((event as CustomEvent<{ value: string }>).detail.value),
    );
    column.scrollTop = 600;
    nav.refresh();
    await nav.updateComplete;
    expect(nav.current).to.equal('usage');
    expect(currentLink(nav)!.textContent).to.equal('Usage');
    expect(changes).to.deep.equal(['usage']);

    // The short last section is current at the very end.
    changes = [];
    column.scrollTop = 10_000;
    column.dispatchEvent(new Event('scroll'));
    await nav.updateComplete;
    expect(nav.current).to.equal('faq');
    expect(changes).to.deep.equal(['faq']);
  });

  it('scrolls to a section on click, moves focus to its heading and keeps it current', async () => {
    const { nav, wrapper } = await setup();
    const usage = wrapper.querySelector<HTMLElement>('#usage')!;
    const click = new MouseEvent('click', {
      bubbles: true,
      composed: true,
      cancelable: true,
      button: 0,
    });
    links(nav)[2].dispatchEvent(click);
    await nav.updateComplete;
    expect(click.defaultPrevented).to.be.true;
    expect(nav.current).to.equal('usage');
    expect(usage.getAttribute('tabindex')).to.equal('-1');
    expect(document.activeElement).to.equal(usage);
  });

  it('leaves modified clicks to the browser', async () => {
    const { nav } = await setup();
    const click = new MouseEvent('click', {
      bubbles: true,
      composed: true,
      cancelable: true,
      ctrlKey: true,
    });
    // Keep the test page where it is.
    links(nav)[2].addEventListener('click', event => {
      expect(event.defaultPrevented).to.be.false;
      event.preventDefault();
    });
    links(nav)[2].dispatchEvent(click);
    expect(nav.current).to.equal('intro');
  });

  it('updates the hash only with update-hash', async () => {
    const original = window.location.href;
    try {
      const { nav } = await setup();
      links(nav)[2].dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true }),
      );
      expect(window.location.hash).to.not.equal('#usage');

      const hashed = await setup('update-hash');
      links(hashed.nav)[2].dispatchEvent(
        new MouseEvent('click', { bubbles: true, cancelable: true }),
      );
      expect(window.location.hash).to.equal('#usage');
    } finally {
      window.history.replaceState(window.history.state, '', original);
    }
  });

  it('follows headings added and renamed later', async () => {
    const { nav, wrapper } = await setup();
    const heading = document.createElement('h2');
    heading.id = 'changelog';
    heading.textContent = 'Changelog';
    wrapper.querySelector('article')!.append(heading);
    await waitUntil(() => links(nav).length === 5);
    wrapper.querySelector('#faq')!.textContent = 'Questions';
    await waitUntil(() => links(nav)[3].textContent === 'Questions');
  });

  it('takes items, with a headline that names the landmark', async () => {
    const { nav } = await setup();
    nav.items = [
      { id: 'usage', label: 'How to use it' },
      { id: 'faq', label: 'Questions', level: 2 },
    ];
    nav.headline = 'Contents';
    await nav.updateComplete;
    const navElement = nav.shadowRoot!.querySelector('nav')!;
    expect(navElement.getAttribute('aria-labelledby')).to.equal('headline');
    expect(navElement.hasAttribute('aria-label')).to.be.false;
    expect(
      nav.shadowRoot!.querySelector('#headline')!.textContent!.trim(),
    ).to.equal('Contents');
    expect(links(nav).map(link => link.textContent)).to.deep.equal([
      'How to use it',
      'Questions',
    ]);
    nav.label = 'Sections';
    await nav.updateComplete;
    expect(navElement.getAttribute('aria-label')).to.equal('Sections');
  });

  it('spies on sections inside a wc-scroll-area', async () => {
    const wrapper = fixtureSync<HTMLElement>(
      html`<div>
        <wc-anchor-nav></wc-anchor-nav>
        <wc-scroll-area style="block-size: 200px">
          <section id="one" style=${section}><h2>One</h2></section>
          <section id="two" style=${section}><h2>Two</h2></section>
          <section id="three" style=${section}><h2>Three</h2></section>
        </wc-scroll-area>
      </div>`,
    );
    const nav = wrapper.querySelector('wc-anchor-nav') as AnchorNav;
    const area = wrapper.querySelector('wc-scroll-area') as ScrollArea;
    await area.updateComplete;
    nav.items = [
      { id: 'one', label: 'One' },
      { id: 'two', label: 'Two' },
      { id: 'three', label: 'Three' },
    ];
    await nav.updateComplete;
    const viewport = area.shadowRoot!.querySelector('.viewport');
    expect((nav as unknown as { scroller: Element | null }).scroller).to.equal(
      viewport,
    );
    area.scrollTo({ top: 300 });
    nav.refresh();
    await nav.updateComplete;
    expect(nav.current).to.equal('two');

    // A link press focuses the section's heading.
    links(nav)[2].dispatchEvent(
      new MouseEvent('click', { bubbles: true, cancelable: true }),
    );
    const heading = wrapper.querySelector('#three h2') as HTMLElement;
    expect(document.activeElement).to.equal(heading);
    expect(heading.getAttribute('tabindex')).to.equal('-1');
  });
});

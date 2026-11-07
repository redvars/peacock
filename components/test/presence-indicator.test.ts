/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync, waitUntil } from '@open-wc/testing';
import { PresenceIndicator } from '../src/presence-indicator/index.js';
import { Avatar } from '../src/avatar/index.js';

if (!customElements.get('wc-presence-indicator')) {
  customElements.define('wc-presence-indicator', PresenceIndicator);
}
if (!customElements.get('wc-avatar')) {
  customElements.define('wc-avatar', Avatar);
}

async function setup(template: ReturnType<typeof html>) {
  const el = fixtureSync<PresenceIndicator>(template);
  await el.updateComplete;
  // The slot reports its content after the first render.
  await new Promise(resolve => {
    setTimeout(resolve, 0);
  });
  await el.updateComplete;
  return el;
}

function dot(el: PresenceIndicator) {
  return el.shadowRoot!.querySelector<HTMLElement>('.dot')!;
}

function shapeMarkup(el: PresenceIndicator) {
  return el.shadowRoot!.querySelector('.shape')!.innerHTML;
}

describe('wc-presence-indicator', () => {
  it('on its own, is an image named by the status', async () => {
    const el = await setup(
      html`<wc-presence-indicator status="online"></wc-presence-indicator>`,
    );
    expect(dot(el).getAttribute('role')).to.equal('img');
    expect(dot(el).getAttribute('aria-label')).to.equal('Online');
    expect(dot(el).classList.contains('attached')).to.be.false;
    expect(dot(el).classList.contains('size-md')).to.be.true;

    el.label = 'In a meeting';
    await el.updateComplete;
    expect(dot(el).getAttribute('aria-label')).to.equal('In a meeting');
  });

  it('draws a different shape per status', async () => {
    const el = await setup(
      html`<wc-presence-indicator status="online"></wc-presence-indicator>`,
    );
    const shapes = new Set<string>();
    for (const status of ['online', 'away', 'busy', 'offline'] as const) {
      el.status = status;
      // eslint-disable-next-line no-await-in-loop
      await el.updateComplete;
      shapes.add(shapeMarkup(el));
    }
    expect(shapes.size).to.equal(4);
  });

  it('treats an unknown status as offline', async () => {
    const el = await setup(
      html`<wc-presence-indicator status="sleeping"></wc-presence-indicator>`,
    );
    expect(dot(el).getAttribute('aria-label')).to.equal('Offline');
  });

  it('attaches to a wrapped avatar and appends the status to its name', async () => {
    const el = await setup(
      html`<wc-presence-indicator status="online"
        ><wc-avatar name="Ana Lima" size="lg"></wc-avatar
      ></wc-presence-indicator>`,
    );
    const avatar = el.querySelector('wc-avatar') as Avatar;
    expect(dot(el).classList.contains('attached')).to.be.true;
    expect(dot(el).getAttribute('aria-hidden')).to.equal('true');
    expect(dot(el).hasAttribute('role')).to.be.false;
    expect(dot(el).classList.contains('size-lg')).to.be.true;
    expect(avatar.label).to.equal('Ana Lima, online');

    el.status = 'away';
    await el.updateComplete;
    expect(avatar.label).to.equal('Ana Lima, away');

    el.size = 'sm';
    await el.updateComplete;
    expect(dot(el).classList.contains('size-sm')).to.be.true;
  });

  it("follows changes to the avatar's name and label", async () => {
    const el = await setup(
      html`<wc-presence-indicator status="busy"
        ><wc-avatar name="Ana Lima"></wc-avatar
      ></wc-presence-indicator>`,
    );
    const avatar = el.querySelector('wc-avatar') as Avatar;
    avatar.setAttribute('name', 'Ana B. Lima');
    await waitUntil(() => avatar.label === 'Ana B. Lima, busy');
    avatar.setAttribute('label', 'Ana (design)');
    await waitUntil(() => avatar.label === 'Ana (design), busy');
  });

  it('gives the avatar its own label back when it leaves', async () => {
    const el = await setup(
      html`<wc-presence-indicator status="online"
        ><wc-avatar name="Ana Lima" label="Ana"></wc-avatar
      ></wc-presence-indicator>`,
    );
    const avatar = el.querySelector('wc-avatar') as Avatar;
    expect(avatar.label).to.equal('Ana, online');
    el.remove();
    expect(avatar.label).to.equal('Ana');
  });

  it('describes other wrapped content with screen-reader text', async () => {
    const el = await setup(
      html`<wc-presence-indicator status="away"
        ><img alt="Ana Lima" src="data:image/gif;base64,R0lGODlhAQABAAAAACw="
      /></wc-presence-indicator>`,
    );
    expect(dot(el).classList.contains('attached')).to.be.true;
    expect(
      el.shadowRoot!.querySelector('.screen-reader-only')!.textContent,
    ).to.equal('Away');
  });
});

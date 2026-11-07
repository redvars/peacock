/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync, waitUntil } from '@open-wc/testing';
import { AvatarGroup } from '../src/avatar-group/avatar-group.js';
import { Avatar } from '../src/avatar/avatar.js';
import { Popover } from '../src/popover/popover.js';
import { PopoverContent } from '../src/popover/popover-content.js';

for (const [tag, ctor] of [
  ['wc-avatar-group', AvatarGroup],
  ['wc-avatar', Avatar],
  ['wc-popover', Popover],
  ['wc-popover-content', PopoverContent],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, ctor);
}

async function render(template: ReturnType<typeof html>) {
  const el = fixtureSync<AvatarGroup>(template);
  await el.updateComplete;
  return el;
}

const five = html`<wc-avatar name="Ada Lovelace"></wc-avatar>
  <wc-avatar name="Grace Hopper"></wc-avatar>
  <wc-avatar name="Alan Turing"></wc-avatar>
  <wc-avatar
    name="Katherine Johnson"
    label="Katherine Johnson, away"
  ></wc-avatar>
  <wc-avatar name="Edsger Dijkstra"></wc-avatar>`;

function assigned(el: AvatarGroup) {
  const slot = el.shadowRoot!.querySelector('slot')!;
  return slot.assignedElements();
}

describe('AvatarGroup', () => {
  it('is a group named "Members" by default, or by label', async () => {
    const el = await render(html`<wc-avatar-group>${five}</wc-avatar-group>`);
    const group = el.shadowRoot!.querySelector('.group')!;
    expect(group.getAttribute('role')).to.equal('group');
    expect(group.getAttribute('aria-label')).to.equal('Members');
    el.label = 'Project team';
    await el.updateComplete;
    expect(group.getAttribute('aria-label')).to.equal('Project team');
  });

  it('shows every avatar and no button without max', async () => {
    const el = await render(html`<wc-avatar-group>${five}</wc-avatar-group>`);
    expect(assigned(el)).to.have.length(5);
    expect(el.shadowRoot!.querySelector('.more')).to.equal(null);
  });

  it('shows max avatars and a +N button listing the rest', async () => {
    const el = await render(
      html`<wc-avatar-group max="3">${five}</wc-avatar-group>`,
    );
    expect(assigned(el).map(a => a.getAttribute('name'))).to.deep.equal([
      'Ada Lovelace',
      'Grace Hopper',
      'Alan Turing',
    ]);
    const more = el.shadowRoot!.querySelector('.more')!;
    expect(more.localName).to.equal('button');
    expect(more.textContent!.trim()).to.equal('+2');
    expect(more.getAttribute('aria-label')).to.equal('2 more');
    const labels = Array.from(
      el.shadowRoot!.querySelectorAll('.list-label'),
      label => label.textContent,
    );
    expect(labels).to.deep.equal([
      'Katherine Johnson, away',
      'Edsger Dijkstra',
    ]);
    const popover = el.shadowRoot!.querySelector('wc-popover') as Popover;
    await popover.updateComplete;
    expect(more.getAttribute('aria-haspopup')).to.equal('dialog');
  });

  it('opens the list when the +N button is pressed', async () => {
    const el = await render(
      html`<wc-avatar-group max="1">${five}</wc-avatar-group>`,
    );
    const popover = el.shadowRoot!.querySelector('wc-popover') as Popover;
    await popover.updateComplete;
    (el.shadowRoot!.querySelector('.more') as HTMLButtonElement).click();
    await waitUntil(() => popover.open, 'popover did not open');
  });

  it("keeps the popover's open and close events inside", async () => {
    const el = await render(
      html`<wc-avatar-group max="1">${five}</wc-avatar-group>`,
    );
    const leaked: string[] = [];
    el.addEventListener('open', () => leaked.push('open'));
    el.addEventListener('close', () => leaked.push('close'));
    const popover = el.shadowRoot!.querySelector('wc-popover') as Popover;
    await popover.updateComplete;
    (el.shadowRoot!.querySelector('.more') as HTMLButtonElement).click();
    await waitUntil(() => popover.open, 'popover did not open');
    popover.open = false;
    await waitUntil(() => !popover.open, 'popover did not close');
    await popover.updateComplete;
    expect(leaked).to.deep.equal([]);
  });

  it('drops the button when max covers every avatar', async () => {
    const el = await render(
      html`<wc-avatar-group max="3">${five}</wc-avatar-group>`,
    );
    el.max = 5;
    await el.updateComplete;
    expect(assigned(el)).to.have.length(5);
    expect(el.shadowRoot!.querySelector('.more')).to.equal(null);
  });

  it('passes size down to the avatars', async () => {
    const el = await render(
      html`<wc-avatar-group size="lg">${five}</wc-avatar-group>`,
    );
    for (const avatar of Array.from(el.children)) {
      expect(avatar.getAttribute('size')).to.equal('lg');
    }
    el.size = 'sm';
    await el.updateComplete;
    expect(el.children[0].getAttribute('size')).to.equal('sm');
  });

  it('follows added and removed avatars', async () => {
    const el = await render(
      html`<wc-avatar-group max="3">${five}</wc-avatar-group>`,
    );
    const extra = document.createElement('wc-avatar');
    extra.setAttribute('name', 'Barbara Liskov');
    el.append(extra);
    await waitUntil(
      () =>
        el.shadowRoot!.querySelector('.more')?.getAttribute('aria-label') ===
        '3 more',
      'did not count the new avatar',
    );
    el.children[0].remove();
    el.children[0].remove();
    el.children[0].remove();
    await waitUntil(
      () => el.shadowRoot!.querySelector('.more') === null,
      'did not drop the button',
    );
    expect(assigned(el)).to.have.length(3);
  });

  it('overlaps the avatars and stacks from the right in RTL', async () => {
    const ltr = await render(html`<wc-avatar-group>${five}</wc-avatar-group>`);
    const [a, b] = Array.from(ltr.children) as HTMLElement[];
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();
    expect(bRect.left).to.be.greaterThan(aRect.left);
    expect(bRect.left).to.be.lessThan(aRect.right);

    const rtl = await render(
      html`<wc-avatar-group dir="rtl">${five}</wc-avatar-group>`,
    );
    const [c, d] = Array.from(rtl.children) as HTMLElement[];
    const cRect = c.getBoundingClientRect();
    const dRect = d.getBoundingClientRect();
    expect(dRect.right).to.be.lessThan(cRect.right);
    expect(dRect.right).to.be.greaterThan(cRect.left);
  });
});

/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { Chip } from '../src/chip/chip/chip.js';
import {
  ChipSet,
  type ChipSetChangeDetail,
} from '../src/chip/chip-set/chip-set.js';

if (!customElements.get('wc-chip')) {
  customElements.define('wc-chip', Chip);
}
if (!customElements.get('wc-chip-set')) {
  customElements.define('wc-chip-set', ChipSet);
}

function chips(el: ChipSet): Chip[] {
  return Array.from(el.querySelectorAll('wc-chip'));
}

function pressed(chip: Chip) {
  return chip.shadowRoot!.querySelector('.chip')!.getAttribute('aria-pressed');
}

async function settle(el: ChipSet) {
  await el.updateComplete;
  await Promise.all(chips(el).map(chip => chip.updateComplete));
}

function key(target: Element, name: string) {
  target.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: name,
      bubbles: true,
      composed: true,
      cancelable: true,
    }),
  );
}

describe('ChipSet', () => {
  it('only lays chips out by default', async () => {
    const el = await fixture<ChipSet>(html`
      <wc-chip-set>
        <wc-chip>One</wc-chip>
        <wc-chip>Two</wc-chip>
      </wc-chip-set>
    `);
    await settle(el);
    chips(el)[0].click();
    await settle(el);

    expect(el.hasAttribute('role')).to.be.false;
    expect(el.value).to.equal('');
    expect(chips(el)[0].selected).to.be.false;
    expect(pressed(chips(el)[0])).to.be.null;
    expect(chips(el)[0].hasAttribute('tabindex')).to.be.false;
  });

  it('is a named group of toggle chips when selectable', async () => {
    const el = await fixture<ChipSet>(html`
      <wc-chip-set selectable label="Status" value="b">
        <wc-chip value="a">A</wc-chip>
        <wc-chip value="b">B</wc-chip>
      </wc-chip-set>
    `);
    await settle(el);

    expect(el.getAttribute('role')).to.equal('group');
    expect(el.getAttribute('aria-label')).to.equal('Status');
    expect(pressed(chips(el)[0])).to.equal('false');
    expect(pressed(chips(el)[1])).to.equal('true');
    // The selected chip holds the tab stop.
    expect(chips(el)[1].tabIndex).to.equal(0);
    expect(chips(el)[0].tabIndex).to.equal(-1);
  });

  it('selects one chip at a time, and fires change', async () => {
    const el = await fixture<ChipSet>(html`
      <wc-chip-set selectable>
        <wc-chip value="a">A</wc-chip>
        <wc-chip>Bee</wc-chip>
      </wc-chip-set>
    `);
    await settle(el);

    setTimeout(() => chips(el)[0].click());
    let event = (await oneEvent(
      el,
      'change',
    )) as CustomEvent<ChipSetChangeDetail>;
    expect(event.detail).to.deep.equal({ value: 'a' });
    expect(event.bubbles && event.composed).to.be.true;
    expect(chips(el)[0].selected).to.be.true;

    // A chip without `value` stands for its text.
    setTimeout(() => chips(el)[1].click());
    event = (await oneEvent(el, 'change')) as CustomEvent<ChipSetChangeDetail>;
    expect(event.detail.value).to.equal('Bee');
    await settle(el);
    expect(chips(el)[0].selected).to.be.false;
    expect(pressed(chips(el)[1])).to.equal('true');

    // Clicking the selected chip again clears it.
    chips(el)[1].click();
    await settle(el);
    expect(el.value).to.equal('');
  });

  it('selects several chips with multiple, in chip order', async () => {
    const el = await fixture<ChipSet>(html`
      <wc-chip-set multiple>
        <wc-chip value="a">A</wc-chip>
        <wc-chip value="b">B</wc-chip>
        <wc-chip value="c">C</wc-chip>
      </wc-chip-set>
    `);
    await settle(el);

    chips(el)[2].click();
    setTimeout(() => chips(el)[0].click());
    const event = (await oneEvent(
      el,
      'change',
    )) as CustomEvent<ChipSetChangeDetail>;

    expect(event.detail).to.deep.equal({ value: 'a,c', values: ['a', 'c'] });
    expect(el.values).to.deep.equal(['a', 'c']);
    await settle(el);
    expect(pressed(chips(el)[0])).to.equal('true');
    expect(pressed(chips(el)[1])).to.equal('false');
  });

  it('ignores disabled chips and the dismiss button', async () => {
    const el = await fixture<ChipSet>(html`
      <wc-chip-set selectable>
        <wc-chip value="a" disabled>A</wc-chip>
        <wc-chip value="b" dismissible>B</wc-chip>
      </wc-chip-set>
    `);
    await settle(el);

    chips(el)[0].click();
    chips(el)[1]
      .shadowRoot!.querySelector<HTMLButtonElement>('.close-btn')!
      .click();
    await settle(el);
    expect(el.value).to.equal('');
  });

  it('moves focus with the arrow keys, wrapping', async () => {
    const el = await fixture<ChipSet>(html`
      <wc-chip-set selectable>
        <wc-chip value="a">A</wc-chip>
        <wc-chip value="b" disabled>B</wc-chip>
        <wc-chip value="c">C</wc-chip>
      </wc-chip-set>
    `);
    await settle(el);
    const [a, , c] = chips(el);

    a.focus();
    key(a, 'ArrowRight');
    expect(document.activeElement).to.equal(c);
    expect(c.tabIndex).to.equal(0);
    expect(a.tabIndex).to.equal(-1);

    key(c, 'ArrowRight');
    expect(document.activeElement).to.equal(a);

    key(a, 'End');
    expect(document.activeElement).to.equal(c);
  });

  it('submits its values with a form', async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <wc-chip-set name="tags" multiple value="a,b">
          <wc-chip value="a">A</wc-chip>
          <wc-chip value="b">B</wc-chip>
        </wc-chip-set>
      </form>
    `);
    const el = form.querySelector<ChipSet>('wc-chip-set')!;
    await settle(el);

    expect(new FormData(form).getAll('tags')).to.deep.equal(['a', 'b']);
  });

  it('is invalid while required and empty', async () => {
    const el = await fixture<ChipSet>(html`
      <wc-chip-set selectable required>
        <wc-chip value="a">A</wc-chip>
      </wc-chip-set>
    `);
    await settle(el);
    expect(el.checkValidity()).to.be.false;

    el.value = 'a';
    await settle(el);
    expect(el.checkValidity()).to.be.true;
  });
});

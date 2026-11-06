/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { Tag } from '../src/chip/tag/tag.js';
import { resetDeprecationWarnings } from '../src/__internal/utils/deprecate.js';

if (!customElements.get('wc-tag')) {
  customElements.define('wc-tag', Tag);
}

function surface(el: Tag) {
  return el.shadowRoot!.querySelector('.tag')!;
}

describe('Tag', () => {
  let warn: typeof console.warn;
  let warnings: string[];

  beforeEach(() => {
    resetDeprecationWarnings();
    warnings = [];
    warn = console.warn;
    console.warn = (message: string) => {
      warnings.push(message);
    };
  });

  afterEach(() => {
    console.warn = warn;
  });

  it('is neutral by default, with no warnings', async () => {
    const el = await fixture<Tag>(html`<wc-tag>Draft</wc-tag>`);
    expect(el.effectiveIntent).to.be.undefined;
    expect(el.getAttribute('variant')).to.equal('tonal');
    expect(el.hasAttribute('color')).to.be.false;
    expect(warnings).to.deep.equal([]);
  });

  it('styles an intent, which wins over an accent', async () => {
    const el = await fixture<Tag>(
      html`<wc-tag intent="danger" accent="blue">Failed</wc-tag>`,
    );
    expect(surface(el).classList.contains('intent-danger')).to.be.true;
    expect(surface(el).classList.contains('accent-blue')).to.be.false;
    expect(warnings).to.deep.equal([]);
  });

  it('styles a decorative accent', async () => {
    const el = await fixture<Tag>(
      html`<wc-tag
        accent="purple"
        style="--color-purple-container: rgb(1, 2, 3)"
        >Design</wc-tag
      >`,
    );
    expect(el.getAttribute('accent')).to.equal('purple');
    expect(surface(el).classList.contains('accent-purple')).to.be.true;
    const background = el.shadowRoot!.querySelector('.background')!;
    expect(getComputedStyle(background).backgroundColor).to.equal(
      'rgb(1, 2, 3)',
    );
  });

  it('maps the deprecated color onto intent and warns', async () => {
    const cases: Array<[string, string | undefined]> = [
      ['red', 'danger'],
      ['green', 'success'],
      ['yellow', 'warning'],
      ['orange', 'warning'],
      ['blue', 'info'],
      ['purple', undefined],
    ];
    const tags = await Promise.all(
      cases.map(([color]) =>
        fixture<Tag>(html`<wc-tag color=${color}>Tag</wc-tag>`),
      ),
    );
    tags.forEach((el, index) => {
      const [color, intent] = cases[index];
      expect(el.effectiveIntent, color).to.equal(intent);
    });
    const purple = await fixture<Tag>(html`<wc-tag color="purple">P</wc-tag>`);
    expect(purple.effectiveAccent).to.equal('purple');
    // One warning per page.
    expect(warnings.length).to.equal(1);
    expect(warnings[0]).to.contain('wc-tag: `color` is deprecated');
  });

  it('keeps dismissible working, deprecated, with a composed dismiss', async () => {
    const el = await fixture<Tag>(html`<wc-tag dismissible>Tag</wc-tag>`);
    expect(warnings[0]).to.contain(
      'wc-tag: `dismissible` is deprecated and will be removed in 4.0. Use wc-chip dismissible instead.',
    );

    const button =
      el.shadowRoot!.querySelector<HTMLButtonElement>('.dismiss-button')!;
    setTimeout(() => button.click());
    const event = await oneEvent(el, 'dismiss');
    expect(event.bubbles).to.be.true;
    expect(event.composed).to.be.true;
  });
});

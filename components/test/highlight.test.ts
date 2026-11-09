/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixture } from '@open-wc/testing';
import { findMatches, Highlight } from '../src/highlight/index.js';

if (!customElements.get('wc-highlight')) {
  customElements.define('wc-highlight', Highlight);
}

function marks(el: Highlight) {
  return Array.from(el.shadowRoot!.querySelectorAll('mark')).map(
    mark => mark.textContent,
  );
}

describe('findMatches', () => {
  it('marks each word on its own, ignoring case', () => {
    const text = 'Reset your password. Passwords reset daily.';
    const ranges = findMatches(text, 'reset PASSWORD');
    expect(ranges.map(([s, e]) => text.slice(s, e))).to.deep.equal([
      'Reset',
      'password',
      'Password',
      'reset',
    ]);
  });

  it('ignores accents in the text and the query', () => {
    const text = 'Upload your Résumé or resume';
    const ranges = findMatches(text, 'resumé');
    expect(ranges.map(([s, e]) => text.slice(s, e))).to.deep.equal([
      'Résumé',
      'resume',
    ]);
  });

  it('keeps offsets right when text holds combining marks', () => {
    const text = 'Café au lait';
    const [[start, end]] = findMatches(text, 'cafe');
    expect(text.slice(start, end)).to.equal('Café');
  });

  it('lets the longer word win where two overlap', () => {
    const text = 'password';
    expect(findMatches(text, 'pass password')).to.deep.equal([[0, 8]]);
  });

  it('skips one-letter words when the query has longer ones', () => {
    const text = 'reset a password';
    const ranges = findMatches(text, 'reset a password');
    expect(ranges.map(([s, e]) => text.slice(s, e))).to.deep.equal([
      'reset',
      'password',
    ]);
  });

  it('returns nothing for an empty query', () => {
    expect(findMatches('anything', '  ')).to.deep.equal([]);
  });
});

describe('Highlight', () => {
  it('renders the text with the query words marked', async () => {
    const el = await fixture<Highlight>(
      html`<wc-highlight query="reset password"
        >If you forgot your password, reset it.</wc-highlight
      >`,
    );
    expect(marks(el)).to.deep.equal(['password', 'reset']);
    expect(el.shadowRoot!.textContent).to.contain(
      'If you forgot your password, reset it.',
    );
  });

  it('renders markup in its children as text', async () => {
    const el = await fixture<Highlight>(
      html`<wc-highlight query="bold"
        ><b>bold</b> &lt;img src=x onerror=alert(1)&gt;</wc-highlight
      >`,
    );
    expect(el.shadowRoot!.querySelector('b')).to.be.null;
    expect(el.shadowRoot!.querySelector('img')).to.be.null;
    expect(marks(el)).to.deep.equal(['bold']);
  });

  it('follows changes to the query and the text', async () => {
    const el = await fixture<Highlight>(
      html`<wc-highlight query="one">one two</wc-highlight>`,
    );
    el.query = 'two';
    await el.updateComplete;
    expect(marks(el)).to.deep.equal(['two']);
    el.textContent = 'two three two';
    await new Promise(resolve => {
      setTimeout(resolve);
    });
    await el.updateComplete;
    expect(marks(el)).to.deep.equal(['two', 'two']);
  });

  it('marks given ranges instead of the query', async () => {
    const el = await fixture<Highlight>(
      html`<wc-highlight query="alpha">alpha beta gamma</wc-highlight>`,
    );
    el.ranges = [
      [11, 16],
      [6, 10],
    ];
    await el.updateComplete;
    expect(marks(el)).to.deep.equal(['beta', 'gamma']);
  });
});

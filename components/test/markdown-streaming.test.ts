/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Markdown } from '../src/markdown/markdown.js';
import { closeOpenMarkdown, StreamLexer } from '../src/markdown/streaming.js';
import { lexMarkdown } from '../src/__internal/rich-text/markdown-lexer.js';

if (!customElements.get('wc-markdown')) {
  customElements.define('wc-markdown', Markdown);
}

const shape = (tokens: Array<{ type: string; raw: string }>) =>
  tokens.map(token => [token.type, token.raw]);

describe('closeOpenMarkdown', () => {
  it('closes an open bold, strikethrough or code span in the last block', () => {
    expect(closeOpenMarkdown('Exports **failed')).to.equal(
      'Exports **failed**',
    );
    expect(closeOpenMarkdown('set to `0')).to.equal('set to `0`');
    expect(closeOpenMarkdown('was ~~wrong')).to.equal('was ~~wrong~~');
    expect(closeOpenMarkdown('**done** and `ok`')).to.equal(
      '**done** and `ok`',
    );
  });

  it('holds back a link until it is complete', () => {
    expect(closeOpenMarkdown('See the [rule](/rules/8')).to.equal('See the ');
    expect(closeOpenMarkdown('free[2')).to.equal('free');
    expect(closeOpenMarkdown('free[2](cite:asset_9)')).to.equal(
      'free[2](cite:asset_9)',
    );
  });

  it('drops a marker with nothing after it yet', () => {
    expect(closeOpenMarkdown('Exports **')).to.equal('Exports ');
    expect(closeOpenMarkdown('a `')).to.equal('a ');
  });

  it('leaves open code fences and earlier blocks alone', () => {
    const fenced = '```yaml\nretry: **';
    expect(closeOpenMarkdown(fenced)).to.equal(fenced);
    expect(closeOpenMarkdown('a **b\n\nc **d')).to.equal('a **b\n\nc **d**');
  });
});

describe('StreamLexer', () => {
  it('gives the same tokens as a full lex at every step of a stream', () => {
    const answer = [
      '# Loaners\n\n',
      'Desk support in Pune has ',
      '**2 loaner laptops** free[1](cite:asset_9).\n\n',
      '- Raise the incident before noon\n',
      '- Pick it up at desk 4\n\n',
      '| Site | Free |\n|---|---|\n| Pune | 2 |\n\n',
      '```yaml\nretry: 5\n```\n\nDone.',
    ];
    const lexer = new StreamLexer();
    let text = '';
    for (const piece of answer) {
      text += piece;
      expect(shape(lexer.lex(text, true))).to.deep.equal(
        shape(lexMarkdown(closeOpenMarkdown(text))),
      );
    }
    expect(shape(lexer.lex(text, false))).to.deep.equal(
      shape(lexMarkdown(text)),
    );
  });

  it('lexes in full when the text is replaced rather than extended', () => {
    const lexer = new StreamLexer();
    lexer.lex('First paragraph.\n\nSecond.\n\nThird', true);
    const tokens = lexer.lex('Something else.\n\nEntirely', true);
    expect(shape(tokens)).to.deep.equal(
      shape(lexMarkdown('Something else.\n\nEntirely')),
    );
  });
});

describe('Markdown streaming', () => {
  it('shows a caret in the last paragraph and marks the content busy', async () => {
    const el = await fixture<Markdown>(
      html`<wc-markdown
        streaming
        .value=${'One.\n\nTwo **bold'}
      ></wc-markdown>`,
    );
    const prose = el.shadowRoot!.querySelector('.prose') as HTMLElement;
    expect(prose.getAttribute('aria-busy')).to.equal('true');
    const paragraphs = prose.querySelectorAll('p');
    expect(paragraphs[1].querySelector('.stream-caret')).to.not.equal(null);
    expect(paragraphs[0].querySelector('.stream-caret')).to.equal(null);
    // The open bold already shows as bold, not as asterisks.
    expect(paragraphs[1].querySelector('strong')?.textContent).to.equal('bold');
    expect(prose.textContent).to.not.contain('**');
  });

  it('puts the caret after a last block that is not a paragraph', async () => {
    const el = await fixture<Markdown>(
      html`<wc-markdown streaming .value=${'- one\n- two'}></wc-markdown>`,
    );
    const prose = el.shadowRoot!.querySelector('.prose') as HTMLElement;
    expect(prose.querySelector(':scope > .stream-caret')).to.not.equal(null);
  });

  it('renders the finished text exactly once streaming stops', async () => {
    const el = await fixture<Markdown>(
      html`<wc-markdown streaming .value=${'Price: 5 **'}></wc-markdown>`,
    );
    el.value = 'Price: 5 ** stars';
    el.streaming = false;
    await el.updateComplete;
    const prose = el.shadowRoot!.querySelector('.prose') as HTMLElement;
    expect(prose.hasAttribute('aria-busy')).to.equal(false);
    expect(prose.querySelector('.stream-caret')).to.equal(null);
    expect(prose.textContent?.trim()).to.equal('Price: 5 ** stars');
  });

  it('keeps up with a growing value', async () => {
    const el = await fixture<Markdown>(
      html`<wc-markdown streaming .value=${''}></wc-markdown>`,
    );
    let text = '';
    for (const piece of ['Desk ', 'support has ', '2 loaners', ' free.']) {
      text += piece;
      el.value = text;
      // eslint-disable-next-line no-await-in-loop
      await el.updateComplete;
    }
    const p = el.shadowRoot!.querySelector('p') as HTMLElement;
    expect(p.textContent).to.equal('Desk support has 2 loaners free.');
  });
});

describe('Markdown citations', () => {
  it('renders cite: links as citations filled from citations', async () => {
    const el = await fixture<Markdown>(
      html`<wc-markdown
        .value=${'Readable by HR[1](cite:role_4) and Payroll[2](cite:rule%2088).'}
        .citations=${[
          {
            id: 'role_4',
            headline: 'HR manager',
            supportingText: 'Role · Human resources',
            href: '/roles/4',
          },
        ]}
        citation-href="/sources/{id}"
      ></wc-markdown>`,
    );
    const chips = el.shadowRoot!.querySelectorAll('wc-citation');
    expect(chips.length).to.equal(2);
    expect(chips[0].getAttribute('label')).to.equal('1');
    expect(chips[0].getAttribute('value')).to.equal('role_4');
    expect(chips[0].getAttribute('headline')).to.equal('HR manager');
    expect(chips[0].getAttribute('supporting-text')).to.equal(
      'Role · Human resources',
    );
    expect(chips[0].getAttribute('href')).to.equal('/roles/4');
    expect(chips[1].getAttribute('value')).to.equal('rule 88');
    expect(chips[1].getAttribute('href')).to.equal('/sources/rule%2088');
    // A cite: link is never an ordinary link.
    expect(el.shadowRoot!.querySelector('a')).to.equal(null);
  });

  it('renders citations in inline mode too', async () => {
    const el = await fixture<Markdown>(
      html`<wc-markdown
        inline
        .value=${'Fixed in 4.2.1[3](cite:c_3).'}
      ></wc-markdown>`,
    );
    expect(el.shadowRoot!.querySelector('wc-citation')).to.not.equal(null);
  });
});

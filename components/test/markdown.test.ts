/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
// wc-code-highlighter is left undefined, so code blocks show their light-DOM <pre>.
import { Markdown, safeUrl } from '../src/markdown/markdown.js';

if (!customElements.get('wc-markdown')) {
  customElements.define('wc-markdown', Markdown);
}

async function render(value: string, attrs: Partial<Markdown> = {}) {
  const el = await fixture<Markdown>(
    html`<wc-markdown .value=${value}></wc-markdown>`,
  );
  Object.assign(el, attrs);
  await el.updateComplete;
  return el;
}

function root(el: Markdown): ShadowRoot {
  return el.shadowRoot as ShadowRoot;
}

describe('Markdown', () => {
  it('renders blocks and inline formatting', async () => {
    const el = await render(
      [
        '# Title',
        '',
        'Some **bold**, _em_, ~~gone~~ and `code`.',
        '',
        '1. one',
        '2. two',
        '',
        '> quote',
        '',
        '---',
      ].join('\n'),
    );
    const r = root(el);
    expect(r.querySelector('h1')?.textContent).to.equal('Title');
    expect(r.querySelector('strong')?.textContent).to.equal('bold');
    expect(r.querySelector('em')?.textContent).to.equal('em');
    expect(r.querySelector('del')?.textContent).to.equal('gone');
    expect(r.querySelector('p code')?.textContent).to.equal('code');
    expect(r.querySelectorAll('ol li').length).to.equal(2);
    expect(r.querySelector('blockquote')).to.exist;
    expect(r.querySelector('hr')).to.exist;
  });

  it('renders task lists, tables and code blocks', async () => {
    const el = await render(
      [
        '- [x] done',
        '- [ ] todo',
        '',
        '| a | b |',
        '| :-- | --: |',
        '| 1 | 2 |',
        '',
        '```ts',
        'const x = 1 < 2;',
        '```',
      ].join('\n'),
    );
    const r = root(el);
    const boxes = r.querySelectorAll<HTMLInputElement>(
      'ul.task-list input[type=checkbox]',
    );
    expect(boxes.length).to.equal(2);
    expect(boxes[0].checked).to.equal(true);
    expect(boxes[0].disabled).to.equal(true);
    expect(boxes[1].checked).to.equal(false);
    expect(r.querySelectorAll('th').length).to.equal(2);
    expect(r.querySelector('td:last-child')?.getAttribute('style')).to.equal(
      'text-align: end',
    );
    const code = r.querySelector('wc-code-highlighter');
    expect(code?.getAttribute('language')).to.equal('ts');
    expect(code?.querySelector('pre code')?.textContent).to.equal(
      'const x = 1 < 2;',
    );
  });

  it('shows raw HTML as text instead of parsing it', async () => {
    const el = await render(
      'Hi <img src=x onerror="alert(1)"> there\n\n<script>alert(2)</script>',
    );
    const r = root(el);
    expect(r.querySelector('img')).to.equal(null);
    expect(r.querySelector('script')).to.equal(null);
    expect(r.textContent).to.contain('<img src=x onerror="alert(1)">');
    expect(r.textContent).to.contain('<script>alert(2)</script>');
  });

  it('follows only safe links, in a new tab', async () => {
    const el = await render(
      '[safe](https://example.com) [bad](javascript:alert(1)) [data](data:text/html,x) [here](#part)',
    );
    const links = Array.from(root(el).querySelectorAll('a'));
    expect(links.map(a => a.textContent)).to.deep.equal(['safe', 'here']);
    expect(links[0].target).to.equal('_blank');
    expect(links[0].rel).to.equal('noopener noreferrer');
    expect(links[1].hasAttribute('target')).to.equal(false);
    expect(root(el).textContent).to.contain('bad');
  });

  it('accepts http, mailto, tel and relative addresses only', () => {
    expect(safeUrl('https://a.b')).to.equal('https://a.b');
    expect(safeUrl('mailto:a@b.c')).to.equal('mailto:a@b.c');
    expect(safeUrl('/users/1?x=a:b')).to.equal('/users/1?x=a:b');
    expect(safeUrl('docs/a.md')).to.equal('docs/a.md');
    expect(safeUrl(' JavaScript:alert(1)')).to.equal(undefined);
    expect(safeUrl('vbscript:x')).to.equal(undefined);
    expect(safeUrl('')).to.equal(undefined);
  });

  it('shows mentions as chips, and as links with mention-href', async () => {
    const el = await render('Thanks [@Ana Lima](mention:usr%201)!');
    let chip = root(el).querySelector('.mention');
    expect(chip?.tagName).to.equal('SPAN');
    expect(chip?.textContent).to.equal('@Ana Lima');

    el.mentionHref = '/users/{id}';
    await el.updateComplete;
    chip = root(el).querySelector('.mention');
    expect(chip?.tagName).to.equal('A');
    expect(chip?.getAttribute('href')).to.equal('/users/usr%201');

    // eslint-disable-next-line no-script-url
    el.mentionHref = 'javascript:open({id})';
    await el.updateComplete;
    expect(root(el).querySelector('.mention')?.tagName).to.equal('SPAN');
  });

  it('renders one run of text when inline', async () => {
    const el = await render('First **line**\n\n- item\n\n```\ncode\n```', {
      inline: true,
    });
    const r = root(el);
    expect(r.querySelector('p, ul, pre')).to.equal(null);
    expect(r.querySelector('strong')?.textContent).to.equal('line');
    expect(r.textContent?.replace(/\s+/g, ' ').trim()).to.equal(
      'First line item code',
    );
  });

  it('re-renders when the value changes', async () => {
    const el = await render('one');
    el.value = '## two';
    await el.updateComplete;
    expect(root(el).querySelector('h2')?.textContent).to.equal('two');
  });
});

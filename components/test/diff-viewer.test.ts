/// <reference types="mocha" />
import { html } from 'lit';
import { fixtureSync, expect } from '@open-wc/testing';
import { DiffViewer } from '../src/diff-viewer/index.js';
import {
  diffTexts,
  editScript,
  splitText,
  wordDiff,
} from '../src/diff-viewer/diff.js';

if (!customElements.get('wc-diff-viewer')) {
  customElements.define('wc-diff-viewer', DiffViewer);
}

async function mount(template: ReturnType<typeof html>) {
  const el = fixtureSync<DiffViewer>(template);
  await el.updateComplete;
  return el;
}

function types(oldText: string, newText: string) {
  return diffTexts(oldText, newText).lines.map(
    line => `${line.type[0]}:${line.text}`,
  );
}

describe('diff (algorithm)', () => {
  it('finds the shortest edit script', () => {
    const a = 'abcabba'.split('').map(c => c.charCodeAt(0));
    const b = 'cbabac'.split('').map(c => c.charCodeAt(0));
    const ops = editScript(a, b, 100);
    expect(ops?.filter(op => op !== 'equal').length).to.equal(5);
    expect(ops?.filter(op => op !== 'insert').length).to.equal(a.length);
    expect(ops?.filter(op => op !== 'delete').length).to.equal(b.length);
  });

  it('gives up above the edit limit', () => {
    expect(editScript([1, 2, 3], [4, 5, 6], 2)).to.equal(null);
  });

  it('handles empty sides', () => {
    expect(types('', '')).to.deep.equal([]);
    expect(types('', 'a\nb\n')).to.deep.equal(['a:a', 'a:b']);
    expect(types('a\nb', '')).to.deep.equal(['r:a', 'r:b']);
    const result = diffTexts('', 'x');
    expect(result.additions).to.equal(1);
    expect(result.deletions).to.equal(0);
  });

  it('reports no changes for identical texts', () => {
    const result = diffTexts('a\nb\nc\n', 'a\nb\nc\n');
    expect(result.additions + result.deletions).to.equal(0);
    expect(result.lines.map(l => l.type)).to.deep.equal([
      'equal',
      'equal',
      'equal',
    ]);
  });

  it('numbers lines on both sides and lists removed before added', () => {
    const { lines } = diffTexts('a\nb\nc\nd', 'a\nB\nc\nd\ne');
    expect(lines.map(l => [l.type, l.oldNumber, l.newNumber])).to.deep.equal([
      ['equal', 1, 1],
      ['removed', 2, undefined],
      ['added', undefined, 2],
      ['equal', 3, 3],
      ['equal', 4, 4],
      ['added', undefined, 5],
    ]);
  });

  it('marks a missing final newline when only one side has it', () => {
    const { lines } = diffTexts('a\nb', 'a\nb\n');
    expect(types('a\nb', 'a\nb\n')).to.deep.equal(['e:a', 'r:b', 'a:b']);
    expect(lines[1].noNewline).to.equal(true);
    expect(lines[2].noNewline).to.equal(undefined);
    expect(types('a\nb', 'a\nb')).to.deep.equal(['e:a', 'e:b']);
  });

  it('compares CRLF and LF lines as equal and notes the difference', () => {
    const result = diffTexts('a\r\nb\r\n', 'a\nb\n');
    expect(result.additions + result.deletions).to.equal(0);
    expect(result.lineEndings).to.deep.equal({ old: 'CRLF', new: 'LF' });
    expect(diffTexts('a\nb\n', 'a\nc\n').lineEndings).to.equal(null);
    expect(splitText('a\rb').lines).to.deep.equal(['a', 'b']);
  });

  it('marks changed words in paired lines', () => {
    const words = wordDiff('const port = 8080;', 'const port = 9090;');
    expect(words?.old.filter(s => s.changed).map(s => s.text)).to.deep.equal([
      '8080',
    ]);
    expect(words?.new.filter(s => s.changed).map(s => s.text)).to.deep.equal([
      '9090',
    ]);
    // Completely different lines are not word-marked.
    expect(wordDiff('alpha beta', 'gamma delta')).to.equal(null);
    const { lines } = diffTexts('port: 8080\n', 'port: 9090\n');
    expect(lines[0].segments).to.exist;
    expect(lines[1].segments?.map(s => s.text).join('')).to.equal('port: 9090');
  });

  it('stays fast on long files with few changes', () => {
    const big = Array.from({ length: 50000 }, (_, i) => `line ${i}`);
    const changed = big.slice();
    changed[100] = 'changed';
    changed[40000] = 'changed too';
    const start = performance.now();
    const result = diffTexts(big.join('\n'), changed.join('\n'));
    expect(performance.now() - start).to.be.below(1000);
    expect(result.additions).to.equal(2);
    expect(result.deletions).to.equal(2);
    expect(result.approximate).to.equal(false);
  });

  it('falls back to replace-all when the texts are too different', () => {
    const a = Array.from({ length: 3000 }, (_, i) => `a${i}`).join('\n');
    const b = Array.from({ length: 3000 }, (_, i) => `b${i}`).join('\n');
    const start = performance.now();
    const result = diffTexts(a, b);
    expect(performance.now() - start).to.be.below(2000);
    expect(result.approximate).to.equal(true);
    expect(result.deletions).to.equal(3000);
    expect(result.additions).to.equal(3000);
    expect(result.lines[0].type).to.equal('removed');
    expect(result.lines[3000].type).to.equal('added');
  });
});

describe('wc-diff-viewer', () => {
  const oldText = Array.from({ length: 30 }, (_, i) => `line ${i + 1}`).join(
    '\n',
  );
  const newText = oldText.replace('line 15', 'line fifteen');

  it('shows a summary of additions and deletions', async () => {
    const el = await mount(
      html`<wc-diff-viewer
        old-value=${'a\nb\nc'}
        new-value=${'a\nc\nd\ne'}
      ></wc-diff-viewer>`,
    );
    const summary = el.shadowRoot?.querySelector('.summary');
    expect(summary?.textContent?.trim()).to.equal('2 additions, 1 deletion');
    expect(el.additions).to.equal(2);
    expect(el.deletions).to.equal(1);
  });

  it('says there are no changes for identical texts and folds them', async () => {
    const el = await mount(
      html`<wc-diff-viewer
        old-value=${oldText}
        new-value=${oldText}
      ></wc-diff-viewer>`,
    );
    const root = el.shadowRoot as ShadowRoot;
    expect(root.querySelector('.summary')?.textContent?.trim()).to.equal(
      'No changes',
    );
    expect(root.querySelectorAll('tr.line').length).to.equal(0);
    expect(root.querySelector('.gap')?.textContent).to.contain(
      'Show 30 unchanged lines',
    );
  });

  it('folds unchanged lines beyond the context and expands them', async () => {
    const el = await mount(
      html`<wc-diff-viewer
        old-value=${oldText}
        new-value=${newText}
      ></wc-diff-viewer>`,
    );
    const root = el.shadowRoot as ShadowRoot;
    // 3 context lines on each side plus the removed and added line.
    expect(root.querySelectorAll('tr.line').length).to.equal(8);
    const gaps = root.querySelectorAll('.gap');
    expect(gaps.length).to.equal(2);
    expect(gaps[0].textContent).to.contain('Show 11 unchanged lines');
    expect(gaps[1].textContent).to.contain('Show 12 unchanged lines');

    (gaps[0].querySelector('.gap-button') as HTMLElement).click();
    await el.updateComplete;
    expect(root.querySelectorAll('tr.line').length).to.equal(19);
    expect(root.querySelectorAll('.gap').length).to.equal(1);

    el.context = 0;
    await el.updateComplete;
    // The expanded run stays open; the other side folds closer.
    expect(root.querySelectorAll('.gap').length).to.equal(1);
  });

  it('gives changed lines markers and screen-reader text', async () => {
    const el = await mount(
      html`<wc-diff-viewer
        old-value=${oldText}
        new-value=${newText}
      ></wc-diff-viewer>`,
    );
    const root = el.shadowRoot as ShadowRoot;
    const removed = root.querySelector('tr[data-type="removed"]');
    const added = root.querySelector('tr[data-type="added"]');
    expect(removed?.querySelector('.marker')?.textContent).to.equal('−');
    expect(added?.querySelector('.marker')?.textContent).to.equal('+');
    expect(removed?.querySelector('.sr-only')?.textContent?.trim()).to.equal(
      'Removed line 15',
    );
    expect(added?.querySelector('.sr-only')?.textContent?.trim()).to.equal(
      'Added line 15',
    );
    expect(
      Array.from(removed?.querySelectorAll('.number') ?? []).map(
        cell => cell.textContent,
      ),
    ).to.deep.equal(['15', '']);
    expect(added?.querySelector('.word')?.textContent).to.equal('fifteen');
    const table = root.querySelector('table');
    expect(table?.getAttribute('aria-label')).to.equal('Changes');
    expect(table?.getAttribute('aria-describedby')).to.equal('summary');
  });

  it('pairs removed and added lines side by side in split view', async () => {
    const el = await mount(
      html`<wc-diff-viewer
        view="split"
        old-value=${'a\nb\nc'}
        new-value=${'a\nB\nx\nc'}
      ></wc-diff-viewer>`,
    );
    const rows = Array.from(
      el.shadowRoot?.querySelectorAll('tr.line') ?? [],
    ).map(row =>
      Array.from(row.querySelectorAll('.code')).map(cell => cell.textContent),
    );
    expect(rows).to.deep.equal([['a', 'a'], ['b', 'B'], ['x'], ['c', 'c']]);
    const headers = Array.from(
      el.shadowRoot?.querySelectorAll('th[scope="col"]') ?? [],
    ).map(th => th.textContent);
    expect(headers).to.deep.equal(['Old', 'New']);
  });

  it('notes differing line endings and fallbacks', async () => {
    const el = await mount(
      html`<wc-diff-viewer
        old-value=${'a\r\nb\r\n'}
        new-value=${'a\nb\n'}
      ></wc-diff-viewer>`,
    );
    expect(el.shadowRoot?.querySelector('.notes')?.textContent).to.contain(
      'CRLF in the old text, LF in the new text',
    );
  });

  it('shows the no-newline mark', async () => {
    const el = await mount(
      html`<wc-diff-viewer
        old-value=${'a\nb'}
        new-value=${'a\nb\n'}
      ></wc-diff-viewer>`,
    );
    expect(el.shadowRoot?.querySelector('tr[data-type="removed"] .no-newline'))
      .to.exist;
  });

  it('recomputes when the texts change', async () => {
    const el = await mount(
      html`<wc-diff-viewer old-value="a" new-value="a"></wc-diff-viewer>`,
    );
    el.newValue = 'b';
    await el.updateComplete;
    expect(el.additions).to.equal(1);
    expect(el.deletions).to.equal(1);
  });
});

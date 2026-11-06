/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect, oneEvent } from '@open-wc/testing';
import { CodeEditor } from '../src/code-editor/index.js';
import {
  buildEditorTheme,
  cssColorToHex,
  isDark,
  PALETTE_SOURCES,
  resolvePalette,
  type EditorPalette,
} from '../src/code-editor/editor-theme.js';
import { Icon } from '../src/icon/index.js';
import { IconButton } from '../src/button/index.js';
import { resetDeprecationWarnings } from '../src/__internal/utils/deprecate.js';

// Monaco is a large chunk with workers, which the test server does not build;
// these tests cover the component shell around it.
CodeEditor.prototype.initializeMonaco = async function initializeMonaco() {
  // Monaco is not loaded in tests.
};

for (const [tag, element] of [
  ['wc-icon', Icon],
  ['wc-icon-button', IconButton],
  ['wc-code-editor', CodeEditor],
] as const) {
  if (!customElements.get(tag)) customElements.define(tag, element);
}

function root(el: CodeEditor): ShadowRoot {
  return el.shadowRoot as ShadowRoot;
}

/** A palette with every color set to `hex`, then the given overrides. */
function palette(
  hex: string,
  overrides: Partial<EditorPalette> = {},
): EditorPalette {
  const entries = Object.keys(PALETTE_SOURCES).map(key => [key, hex]);
  return { ...Object.fromEntries(entries), ...overrides } as EditorPalette;
}

describe('code-editor theme', () => {
  it('converts CSS colors to hex', () => {
    expect(cssColorToHex('rgb(255, 0, 0)')).to.equal('#ff0000');
    expect(cssColorToHex('rgba(0, 0, 0, 0)')).to.equal('#00000000');
  });

  it('tells dark surfaces from light ones', () => {
    expect(isDark('#1c1b1e')).to.equal(true);
    expect(isDark('#fffbff')).to.equal(false);
  });

  it('builds a light or dark theme from the surface', () => {
    const light = buildEditorTheme(palette('#fffbff', { keyword: '#ba0061' }));
    expect(light.base).to.equal('vs');
    expect(
      light.rules.find(rule => rule.token === 'keyword')?.foreground,
    ).to.equal('ba0061');
    expect(light.colors['editor.background']).to.equal('#00000000');

    const dark = buildEditorTheme(palette('#1c1b1e'));
    expect(dark.base).to.equal('vs-dark');
  });

  it('reads the palette from the tokens around the probe', async () => {
    const host = await fixture<HTMLDivElement>(html`
      <div
        style="--color-purple: rgb(1, 2, 3); --code-highlighter-token-string: rgb(4, 5, 6)"
      >
        <span></span>
      </div>
    `);
    const resolved = resolvePalette(host.querySelector('span') as HTMLElement);
    expect(resolved.keyword).to.equal('#010203');
    expect(resolved.string).to.equal('#040506');
  });
});

describe('CodeEditor', () => {
  it('shows a floating copy button by default', async () => {
    const el = await fixture<CodeEditor>(
      html`<wc-code-editor></wc-code-editor>`,
    );
    expect(root(el).querySelector('.header')).to.not.exist;
    expect(root(el).querySelector('.actions.floating .copy-button')).to.exist;
    expect(
      root(el).querySelector('.copy-button')?.getAttribute('shape'),
    ).to.equal('round');
  });

  it('hides the copy button with hide-copy', async () => {
    const el = await fixture<CodeEditor>(
      html`<wc-code-editor hide-copy></wc-code-editor>`,
    );
    expect(el.hideCopy).to.equal(true);
    expect(root(el).querySelector('.copy-button')).to.not.exist;
    expect(root(el).querySelector('.actions')).to.not.exist;
  });

  it('fires copied with the value when the copy button is clicked', async () => {
    const el = await fixture<CodeEditor>(
      html`<wc-code-editor
        language="css"
        .value=${':root { --x: 1px; }'}
      ></wc-code-editor>`,
    );
    const button = root(el).querySelector('.copy-button') as HTMLElement;
    setTimeout(() => button.click());
    const event = (await oneEvent(el, 'copied')) as CustomEvent<{
      value: string;
    }>;
    expect(event.detail.value).to.equal(':root { --x: 1px; }');
  });

  it('shows a header for a file name or a title slot', async () => {
    const named = await fixture<CodeEditor>(
      html`<wc-code-editor file-name="theme.css"></wc-code-editor>`,
    );
    expect(root(named).querySelector('.title')?.textContent).to.contain(
      'theme.css',
    );
    expect(root(named).querySelector('.header .actions .copy-button')).to
      .exist;

    const slotted = await fixture<CodeEditor>(
      html`<wc-code-editor><span slot="title">Script</span></wc-code-editor>`,
    );
    expect(root(slotted).querySelector('.header')).to.exist;
  });

  it('still shows a label without file-name in the header, with a warning', async () => {
    resetDeprecationWarnings();
    const warnings: string[] = [];
    const { warn } = console;
    console.warn = (message: string) => warnings.push(message);
    try {
      const el = await fixture<CodeEditor>(
        html`<wc-code-editor label="theme.css"></wc-code-editor>`,
      );
      expect(root(el).querySelector('.title')?.textContent).to.contain(
        'theme.css',
      );
      expect(root(el).querySelector('.field-label')).to.not.exist;
    } finally {
      console.warn = warn;
    }
    expect(warnings.some(message => message.includes('file-name'))).to.be
      .true;
  });

  it('shows label, required mark and helper text as a field with file-name', async () => {
    const el = await fixture<CodeEditor>(
      html`<wc-code-editor
        label="Script"
        file-name="main.ts"
        helper-text="Runs on save"
        required
      ></wc-code-editor>`,
    );
    expect(root(el).querySelector('.field-label')?.textContent).to.contain(
      'Script',
    );
    expect(root(el).querySelector('.field-label .required')).to.exist;
    expect(root(el).querySelector('.title')?.textContent).to.contain(
      'main.ts',
    );
    expect(root(el).querySelector('.field-footer')?.textContent).to.contain(
      'Runs on save',
    );

    const fieldOnly = await fixture<CodeEditor>(
      html`<wc-code-editor label="Script" file-name=""></wc-code-editor>`,
    );
    expect(root(fieldOnly).querySelector('.header')).to.not.exist;
    expect(root(fieldOnly).querySelector('.field-label')).to.exist;
  });

  it('shows error-text in the error state', async () => {
    const el = await fixture<CodeEditor>(
      html`<wc-code-editor
        error
        error-text="Does not compile"
        helper-text="Help"
      ></wc-code-editor>`,
    );
    expect(root(el).querySelector('.code-block.has-error')).to.exist;
    expect(root(el).querySelector('.field-footer')?.textContent).to.contain(
      'Does not compile',
    );
  });

  it('is invalid while required and empty', async () => {
    const el = await fixture<CodeEditor>(
      html`<wc-code-editor required></wc-code-editor>`,
    );
    expect(el.checkValidity()).to.equal(false);
    expect(el.validity.valueMissing).to.equal(true);

    el.value = 'let a = 1;';
    await el.updateComplete;
    expect(el.checkValidity()).to.equal(true);
  });

  it('fires change on blur only after an edit', async () => {
    const el = await fixture<CodeEditor>(
      html`<wc-code-editor .value=${'a'}></wc-code-editor>`,
    );
    const handlers = el as unknown as {
      handleEditorFocus(): void;
      handleEditorBlur(): void;
    };
    const changes: unknown[] = [];
    el.addEventListener('change', event =>
      changes.push((event as CustomEvent).detail),
    );

    handlers.handleEditorFocus();
    handlers.handleEditorBlur();
    expect(changes).to.deep.equal([]);

    handlers.handleEditorFocus();
    el.value = 'ab';
    handlers.handleEditorBlur();
    expect(changes).to.deep.equal([{ value: 'ab' }]);
  });

  it('shows the code as plain text until Monaco loads', async () => {
    const el = await fixture<CodeEditor>(
      html`<wc-code-editor
        .value=${'const a = 1;\nconst b = 2;'}
      ></wc-code-editor>`,
    );
    expect(root(el).querySelector('.placeholder')?.textContent).to.equal(
      'const a = 1;\nconst b = 2;',
    );
  });

  it('accepts css as a language', async () => {
    const el = await fixture<CodeEditor>(
      html`<wc-code-editor language="css"></wc-code-editor>`,
    );
    expect(el.language).to.equal('css');
    el.language = 'scss';
    await el.updateComplete;
    expect(el.language).to.equal('scss');
  });

  it('shows line numbers by default and hides them with line-numbers="false"', async () => {
    const plain = await fixture<CodeEditor>(
      html`<wc-code-editor></wc-code-editor>`,
    );
    expect(plain.lineNumbers).to.equal(true);
    expect(root(plain).querySelector('.code-block.numbered')).to.exist;

    const off = await fixture<CodeEditor>(
      html`<wc-code-editor line-numbers="false"></wc-code-editor>`,
    );
    expect(off.lineNumbers).to.equal(false);
    expect(root(off).querySelector('.code-block.numbered')).to.not.exist;
  });

  it('still reads the deprecated line-numbers="off" and "on"', async () => {
    const off = await fixture<CodeEditor>(
      html`<wc-code-editor line-numbers="off"></wc-code-editor>`,
    );
    expect(off.lineNumbers).to.equal(false);
    expect(root(off).querySelector('.code-block.numbered')).to.not.exist;

    const on = await fixture<CodeEditor>(
      html`<wc-code-editor line-numbers="on"></wc-code-editor>`,
    );
    expect(on.lineNumbers).to.equal(true);

    (on as unknown as { lineNumbers: string }).lineNumbers = 'off';
    await on.updateComplete;
    expect(on.lineNumbers).to.equal(false);
  });

  it('toggles wrapping from the wrap button', async () => {
    const el = await fixture<CodeEditor>(
      html`<wc-code-editor wrap-toggle></wc-code-editor>`,
    );
    const button = root(el).querySelector('.wrap-button') as IconButton;
    expect(button.selected).to.equal(false);
    button.click();
    await el.updateComplete;
    expect(el.wrap).to.equal(true);
    expect(el.hasAttribute('wrap')).to.equal(true);
    expect(button.selected).to.equal(true);
  });

  it('shows the read-only badge only when asked, and keeps it visible', async () => {
    const plain = await fixture<CodeEditor>(
      html`<wc-code-editor readonly></wc-code-editor>`,
    );
    expect(root(plain).querySelector('.read-only-badge')).to.not.exist;

    const badged = await fixture<CodeEditor>(
      html`<wc-code-editor readonly show-readonly-badge></wc-code-editor>`,
    );
    expect(root(badged).querySelector('.read-only-badge')).to.exist;
    expect(root(badged).querySelector('.actions.floating.pinned')).to.exist;
  });

  it('accepts typescript as a language', async () => {
    const el = await fixture<CodeEditor>(
      html`<wc-code-editor language="typescript"></wc-code-editor>`,
    );
    expect(el.language).to.equal('typescript');
  });

  it("takes its container's height with fill, without a frame", async () => {
    const el = await fixture<CodeEditor>(
      html`<div style="height: 240px">
        <wc-code-editor fill hide-copy></wc-code-editor>
      </div>`,
    );
    const editor = el.querySelector('wc-code-editor') as CodeEditor;
    await editor.updateComplete;
    expect(editor.hasAttribute('fill')).to.equal(true);
    const frame = root(editor).querySelector('.code-block') as HTMLElement;
    expect(getComputedStyle(frame).borderTopWidth).to.equal('0px');
    const pane = root(editor).querySelector('.editor') as HTMLElement;
    expect(pane.getBoundingClientRect().height).to.equal(240);
  });

  it('keeps breakpoints, the current line and markers as given', async () => {
    const el = await fixture<CodeEditor>(
      html`<wc-code-editor
        breakpoint-gutter
        current-line="3"
        .breakpoints=${[1, 3]}
        .markers=${[{ line: 2, message: 'Nope' }]}
      ></wc-code-editor>`,
    );
    expect(el.breakpointGutter).to.equal(true);
    expect(el.currentLine).to.equal(3);
    expect(el.breakpoints).to.deep.equal([1, 3]);
    expect(el.markers[0].message).to.equal('Nope');
  });

  it('dims only a disabled editor, not a read-only one', async () => {
    const readonly = await fixture<CodeEditor>(
      html`<wc-code-editor readonly></wc-code-editor>`,
    );
    expect(root(readonly).querySelector('.code-block.disabled')).to.not.exist;

    const disabled = await fixture<CodeEditor>(
      html`<wc-code-editor disabled></wc-code-editor>`,
    );
    expect(root(disabled).querySelector('.code-block.disabled')).to.exist;
  });
});

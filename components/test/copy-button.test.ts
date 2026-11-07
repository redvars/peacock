/// <reference types="mocha" />
import { html } from 'lit';
import { expect, fixtureSync, oneEvent, waitUntil } from '@open-wc/testing';
import { CopyButton } from '../src/copy-button/copy-button.js';
import { writeClipboardText } from '../src/__internal/utils/clipboard.js';
import { IconButton } from '../src/button/icon-button/icon-button.js';

if (!customElements.get('wc-copy-button')) {
  customElements.define('wc-copy-button', CopyButton);
}
if (!customElements.get('wc-icon-button')) {
  customElements.define('wc-icon-button', IconButton);
}

type WriteText = (text: string) => Promise<void>;

/** Replaces the Clipboard API and execCommand for one test. */
function stubClipboard(writeText: WriteText | undefined, execResult = false) {
  const clipboardDescriptor = Object.getOwnPropertyDescriptor(
    navigator,
    'clipboard',
  );
  const originalExec = document.execCommand;
  const execCalls: string[] = [];
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  });
  document.execCommand = ((command: string) => {
    execCalls.push(command);
    return execResult;
  }) as typeof document.execCommand;
  return {
    execCalls,
    restore() {
      if (clipboardDescriptor) {
        Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
      } else {
        delete (navigator as { clipboard?: unknown }).clipboard;
      }
      document.execCommand = originalExec;
    },
  };
}

async function render(template: ReturnType<typeof html>) {
  const wrapper = fixtureSync<HTMLDivElement>(html`<div>${template}</div>`);
  const el = wrapper.querySelector('wc-copy-button') as CopyButton;
  await el.updateComplete;
  return el;
}

function innerButton(el: CopyButton) {
  return el.shadowRoot!.querySelector('wc-icon-button') as IconButton;
}

describe('CopyButton', () => {
  let stub: ReturnType<typeof stubClipboard> | undefined;

  afterEach(() => {
    stub?.restore();
    stub = undefined;
  });

  it('is a round icon button named "Copy" by default, or by label', async () => {
    const el = await render(html`<wc-copy-button value="x"></wc-copy-button>`);
    const button = innerButton(el);
    expect(button.getAttribute('shape')).to.equal('round');
    expect(button.getAttribute('size')).to.equal('sm');
    expect(button.getAttribute('variant')).to.equal('text');
    expect(button.getAttribute('aria-label')).to.equal('Copy');
    expect(button.tooltip).to.equal('Copy');
    el.label = 'Copy API key';
    el.size = 'md';
    await el.updateComplete;
    expect(button.getAttribute('aria-label')).to.equal('Copy API key');
    expect(button.getAttribute('size')).to.equal('md');
  });

  it('copies value with the Clipboard API and fires copy', async () => {
    const written: string[] = [];
    stub = stubClipboard(async text => {
      written.push(text);
    });
    const el = await render(
      html`<wc-copy-button value="npm i peacock"></wc-copy-button>`,
    );
    const event = oneEvent(el, 'copied');
    innerButton(el).click();
    const { detail, bubbles, composed } = (await event) as CustomEvent<{
      value: string;
    }>;
    expect(detail.value).to.equal('npm i peacock');
    expect(bubbles && composed).to.equal(true);
    expect(written).to.deep.equal(['npm i peacock']);
    expect(stub.execCalls).to.deep.equal([]);

    await el.updateComplete;
    expect(el.status).to.equal('copied');
    const button = innerButton(el);
    expect(button.tooltip).to.equal('Copied');
    expect(button.getAttribute('aria-label')).to.equal('Copy');
    expect(button.getAttribute('color')).to.equal('success');
    expect(
      el.shadowRoot!.querySelector('wc-icon')!.getAttribute('name'),
    ).to.equal('check');
    expect(
      el.shadowRoot!.querySelector('[role="status"]')!.textContent,
    ).to.equal('Copied');
  });

  it('copies the text of the element named by for, read at press time', async () => {
    const written: string[] = [];
    stub = stubClipboard(async text => {
      written.push(text);
    });
    const wrapper = fixtureSync<HTMLDivElement>(
      html`<div>
        <code id="snippet">first</code>
        <input id="field" value="typed" />
        <wc-copy-button for="snippet"></wc-copy-button>
      </div>`,
    );
    const el = wrapper.querySelector('wc-copy-button') as CopyButton;
    await el.updateComplete;
    wrapper.querySelector('#snippet')!.textContent = 'second';
    expect(await el.copy()).to.equal(true);
    el.for = 'field';
    expect(await el.copy()).to.equal(true);
    expect(written).to.deep.equal(['second', 'typed']);
  });

  it('falls back to execCommand when the Clipboard API rejects', async () => {
    stub = stubClipboard(() => Promise.reject(new Error('denied')), true);
    const el = await render(
      html`<wc-copy-button value="abc"></wc-copy-button>`,
    );
    expect(await el.copy()).to.equal(true);
    expect(stub.execCalls).to.deep.equal(['copy']);
    expect(el.status).to.equal('copied');
  });

  it('falls back to execCommand without the Clipboard API', async () => {
    stub = stubClipboard(undefined, true);
    await writeClipboardText('abc');
    expect(stub.execCalls).to.deep.equal(['copy']);
  });

  it('shows an error and fires copy-error when nothing copies', async () => {
    stub = stubClipboard(() => Promise.reject(new Error('denied')), false);
    const el = await render(
      html`<wc-copy-button value="abc"></wc-copy-button>`,
    );
    const event = oneEvent(el, 'copy-error');
    innerButton(el).click();
    const { detail } = (await event) as CustomEvent<{
      value: string;
      error: unknown;
    }>;
    expect(detail.value).to.equal('abc');
    expect(detail.error).to.be.instanceOf(Error);
    await el.updateComplete;
    expect(el.status).to.equal('error');
    expect(innerButton(el).tooltip).to.equal('Copy failed');
    expect(innerButton(el).getAttribute('color')).to.equal('danger');
    expect(
      el.shadowRoot!.querySelector('[role="status"]')!.textContent,
    ).to.equal('Copy failed');
  });

  it('fails when for names no element', async () => {
    stub = stubClipboard(async () => {});
    const el = await render(
      html`<wc-copy-button for="missing"></wc-copy-button>`,
    );
    expect(await el.copy()).to.equal(false);
    expect(el.status).to.equal('error');
  });

  it('returns to idle after the feedback time', async function resetsFeedback() {
    this.timeout(5000);
    stub = stubClipboard(async () => {});
    const el = await render(
      html`<wc-copy-button value="abc"></wc-copy-button>`,
    );
    await el.copy();
    expect(el.status).to.equal('copied');
    await waitUntil(() => el.status === 'idle', 'did not reset', {
      timeout: 3000,
    });
    await el.updateComplete;
    expect(innerButton(el).tooltip).to.equal('Copy');
  });

  it('puts focus back after the execCommand fallback', async () => {
    stub = stubClipboard(undefined, true);
    const wrapper = fixtureSync<HTMLDivElement>(
      html`<div><input id="keep" /></div>`,
    );
    const input = wrapper.querySelector('input') as HTMLInputElement;
    input.focus();
    await writeClipboardText('abc');
    expect(document.activeElement).to.equal(input);
    expect(document.querySelectorAll('textarea')).to.have.length(0);
  });
});

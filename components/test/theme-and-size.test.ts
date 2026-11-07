/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { isDarkMode } from '../src/__internal/utils/is-dark-mode.js';
import { Button } from '../src/button/index.js';
import { LoaderUtils } from '../src/LoaderUtils.js';

if (!customElements.get('wc-button')) {
  customElements.define('wc-button', Button);
}

function silenceWarnings() {
  const warnings: string[] = [];
  const original = console.warn;
  console.warn = (message: string) => {
    warnings.push(message);
  };
  return {
    warnings,
    restore: () => {
      console.warn = original;
    },
  };
}

describe('isDarkMode', () => {
  afterEach(() => {
    delete document.documentElement.dataset.theme;
  });

  it('follows data-theme when set', () => {
    document.documentElement.dataset.theme = 'dark';
    expect(isDarkMode()).to.be.true;
    document.documentElement.dataset.theme = 'light';
    expect(isDarkMode()).to.be.false;
  });

  it('follows the system preference without data-theme', () => {
    expect(isDarkMode()).to.equal(
      window.matchMedia('(prefers-color-scheme: dark)').matches,
    );
  });
});

describe('Density', () => {
  it('shortens buttons inside data-density="compact"', async () => {
    const el = await fixture<HTMLDivElement>(html`
      <div>
        <wc-button size="sm">Default</wc-button>
        <div data-density="compact" style="--density: -2">
          <wc-button size="sm">Compact</wc-button>
        </div>
      </div>
    `);
    const [regular, compact] = Array.from(
      el.querySelectorAll<Button>('wc-button'),
    );
    await regular.updateComplete;
    await compact.updateComplete;
    const height = (b: Button) =>
      b.shadowRoot!.querySelector('.button')!.getBoundingClientRect().height;

    expect(height(regular) - height(compact)).to.be.closeTo(8, 0.5);
  });
});

describe('LoaderUtils.registerComponent', () => {
  it('warns instead of failing when a tag is already defined by other code', () => {
    class Other extends HTMLElement {}
    class Mine extends HTMLElement {}
    customElements.define('test-taken-tag', Other);

    const { warnings, restore } = silenceWarnings();
    try {
      LoaderUtils.registerComponent('test-taken-tag', Mine);
      LoaderUtils.registerComponent('test-taken-tag', Mine);
    } finally {
      restore();
    }

    expect(customElements.get('test-taken-tag')).to.equal(Other);
    expect(warnings).to.have.length(1);
    expect(warnings[0]).to.contain('test-taken-tag');
  });
});

/// <reference types="mocha" />
import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';
import { Button } from '../src/button/button/button.js';
import { IconButton } from '../src/button/icon-button/icon-button.js';
import { resetDeprecationWarnings } from '../src/__internal/utils/deprecate.js';
import { resetWarnOnce } from '../src/__internal/utils/warn-once.js';

if (!customElements.get('wc-button')) {
  customElements.define('wc-button', Button);
}

if (!customElements.get('wc-icon-button')) {
  customElements.define('wc-icon-button', IconButton);
}

/** Collects console.warn messages while a test runs. */
function captureWarnings() {
  const warnings: string[] = [];
  let original: typeof console.warn;
  beforeEach(() => {
    resetDeprecationWarnings();
    resetWarnOnce();
    warnings.length = 0;
    original = console.warn;
    console.warn = (message: string) => {
      warnings.push(message);
    };
  });
  afterEach(() => {
    console.warn = original;
  });
  return warnings;
}

describe('Button', () => {
  const warnings = captureWarnings();

  it('reflects its default size, variant and color', async () => {
    const el = await fixture<Button>(html`<wc-button>Save</wc-button>`);

    expect(el.getAttribute('size')).to.equal('sm');
    expect(el.getAttribute('variant')).to.equal('filled');
    expect(el.getAttribute('color')).to.equal('primary');
  });

  it('renders a native button, or a link when href is set', async () => {
    const button = await fixture<Button>(html`<wc-button>Save</wc-button>`);
    expect(button.shadowRoot!.querySelector('#button')?.tagName).to.equal(
      'BUTTON',
    );

    const link = await fixture<Button>(
      html`<wc-button href="/docs">Docs</wc-button>`,
    );
    const anchor = link.shadowRoot!.querySelector('#link');
    expect(anchor?.tagName).to.equal('A');
    expect(anchor?.getAttribute('href')).to.equal('/docs');
  });

  it('warns once that href is deprecated in favour of wc-link-button', async () => {
    await fixture<Button>(html`<wc-button href="/a">A</wc-button>`);
    await fixture<Button>(html`<wc-button href="/b">B</wc-button>`);
    const hrefWarnings = warnings.filter(w => w.includes('`href`'));
    expect(hrefWarnings).to.have.length(1);
    expect(hrefWarnings[0]).to.contain('wc-link-button');
  });

  it('does not warn about href when none is set', async () => {
    await fixture<Button>(html`<wc-button>Save</wc-button>`);
    expect(warnings).to.have.length(0);
  });

  it('renders the tooltip once', async () => {
    const button = await fixture<Button>(
      html`<wc-button tooltip="Save the file">Save</wc-button>`,
    );
    expect(button.shadowRoot!.querySelectorAll('wc-tooltip')).to.have.length(1);

    const link = await fixture<Button>(
      html`<wc-button href="/docs" tooltip="Open docs">Docs</wc-button>`,
    );
    expect(link.shadowRoot!.querySelectorAll('wc-tooltip')).to.have.length(1);
  });

  it('renders no tooltip without the tooltip property', async () => {
    const el = await fixture<Button>(html`<wc-button>Save</wc-button>`);
    expect(el.shadowRoot!.querySelector('wc-tooltip')).to.not.exist;
  });

  describe('level', () => {
    it('maps level presets onto color and variant', async () => {
      const el = await fixture<Button>(
        html`<wc-button level="danger">Delete</wc-button>`,
      );

      expect(el.color).to.equal('danger');
      expect(el.variant).to.equal('filled');
      expect(el.getAttribute('color')).to.equal('danger');
      expect(el.getAttribute('variant')).to.equal('filled');
    });

    it('resolves secondary to surface tonal', async () => {
      const el = await fixture<Button>(
        html`<wc-button level="secondary">Cancel</wc-button>`,
      );
      expect(el.getAttribute('color')).to.equal('surface');
      expect(el.getAttribute('variant')).to.equal('tonal');
    });

    it('follows later changes to level', async () => {
      const el = await fixture<Button>(
        html`<wc-button level="danger">Delete</wc-button>`,
      );

      el.level = 'tertiary';
      await el.updateComplete;
      expect(el.getAttribute('color')).to.equal('primary');
      expect(el.getAttribute('variant')).to.equal('text');

      el.level = undefined;
      await el.updateComplete;
      expect(el.getAttribute('color')).to.equal('primary');
      expect(el.getAttribute('variant')).to.equal('filled');
    });

    it('lets an explicit color or variant win over the level', async () => {
      const el = await fixture<Button>(
        html`<wc-button level="danger" variant="outlined">Delete</wc-button>`,
      );
      expect(el.getAttribute('variant')).to.equal('outlined');
      expect(el.getAttribute('color')).to.equal('danger');

      el.color = 'warning';
      await el.updateComplete;
      el.level = 'primary';
      await el.updateComplete;
      expect(el.getAttribute('color')).to.equal('warning');
      expect(el.getAttribute('variant')).to.equal('outlined');
    });

    it('does not write the level into the color and variant it resolves', async () => {
      const el = await fixture<Button>(
        html`<wc-button level="danger">Delete</wc-button>`,
      );
      el.level = undefined;
      await el.updateComplete;
      // Had the level been written into `color`, it would still say danger.
      expect(el.color).to.equal('primary');
    });
  });

  it('accepts the secondary, tertiary and warning colors', async () => {
    for (const color of ['secondary', 'tertiary', 'warning'] as const) {
      // eslint-disable-next-line no-await-in-loop
      const el = await fixture<Button>(
        html`<wc-button color=${color}>Go</wc-button>`,
      );
      expect(el.color).to.equal(color);
      expect(el.getAttribute('color')).to.equal(color);
    }
  });

  it('disables the native button', async () => {
    const el = await fixture<Button>(
      html`<wc-button disabled>Save</wc-button>`,
    );
    const native = el.shadowRoot!.querySelector<HTMLButtonElement>('#button');
    expect(native?.disabled).to.be.true;
  });

  it('passes rel and download to its link', async () => {
    const el = await fixture<Button>(
      html`<wc-button href="/report.csv" rel="noopener" download="report.csv"
        >Get</wc-button
      >`,
    );
    const link = el.shadowRoot!.querySelector('#link')!;
    expect(link.getAttribute('rel')).to.equal('noopener');
    expect(link.getAttribute('download')).to.equal('report.csv');
  });

  it('sets aria-disabled="true" when soft-disabled, and omits it otherwise', async () => {
    const el = await fixture<Button>(
      html`<wc-button soft-disabled>Save</wc-button>`,
    );
    const native = el.shadowRoot!.querySelector('#button')!;
    expect(native.getAttribute('aria-disabled')).to.equal('true');

    el.softDisabled = false;
    await el.updateComplete;
    expect(native.hasAttribute('aria-disabled')).to.be.false;
  });

  it('reads throttle-delay as a number', async () => {
    const el = await fixture<Button>(
      html`<wc-button throttle-delay="300">Save</wc-button>`,
    );
    expect(el.throttleDelay).to.equal(300);
  });

  describe('toggle', () => {
    it('renders aria-pressed only while toggle is set', async () => {
      const el = await fixture<Button>(
        html`<wc-button selected>Bold</wc-button>`,
      );
      const native = el.shadowRoot!.querySelector('#button')!;
      expect(native.hasAttribute('aria-pressed')).to.be.false;

      el.toggle = true;
      await el.updateComplete;
      expect(native.getAttribute('aria-pressed')).to.equal('true');

      el.selected = false;
      await el.updateComplete;
      expect(native.getAttribute('aria-pressed')).to.equal('false');
    });

    it('flips selected on click and fires change', async () => {
      const el = await fixture<Button>(
        html`<wc-button toggle>Bold</wc-button>`,
      );
      const details: boolean[] = [];
      el.addEventListener('change', event => {
        details.push(
          (event as CustomEvent<{ selected: boolean }>).detail.selected,
        );
      });

      el.shadowRoot!.querySelector<HTMLButtonElement>('#button')!.click();
      await el.updateComplete;
      expect(el.selected).to.be.true;
      expect(
        el.shadowRoot!.querySelector('#button')!.getAttribute('aria-pressed'),
      ).to.equal('true');

      el.click();
      await el.updateComplete;
      expect(el.selected).to.be.false;
      expect(details).to.deep.equal([true, false]);
    });

    it('does not flip selected without toggle', async () => {
      const el = await fixture<Button>(html`<wc-button>Bold</wc-button>`);
      let changes = 0;
      el.addEventListener('change', () => {
        changes += 1;
      });
      el.click();
      expect(el.selected).to.be.false;
      expect(changes).to.equal(0);
    });

    it('does not flip while soft-disabled or disabled', async () => {
      const el = await fixture<Button>(
        html`<wc-button toggle soft-disabled>Bold</wc-button>`,
      );
      el.click();
      expect(el.selected).to.be.false;

      el.softDisabled = false;
      el.disabled = true;
      await el.updateComplete;
      el.click();
      expect(el.selected).to.be.false;
    });
  });

  describe('loading', () => {
    it('shows a spinner and sets aria-busy', async () => {
      const el = await fixture<Button>(
        html`<wc-button loading>Save</wc-button>`,
      );
      const native = el.shadowRoot!.querySelector('#button')!;
      expect(native.getAttribute('aria-busy')).to.equal('true');
      expect(el.shadowRoot!.querySelector('wc-circular-progress')).to.exist;

      el.loading = false;
      await el.updateComplete;
      expect(native.hasAttribute('aria-busy')).to.be.false;
      expect(el.shadowRoot!.querySelector('wc-circular-progress')).to.not.exist;
    });

    it('blocks clicks and toggling', async () => {
      const el = await fixture<Button>(
        html`<wc-button loading toggle>Save</wc-button>`,
      );
      let clicks = 0;
      el.addEventListener('click', () => {
        clicks += 1;
      });
      el.shadowRoot!.querySelector<HTMLButtonElement>('#button')!.click();
      expect(clicks).to.equal(0);
      expect(el.selected).to.be.false;
    });
  });
});

describe('IconButton', () => {
  const warnings = captureWarnings();

  it('maps level presets onto color and variant', async () => {
    const el = await fixture<IconButton>(
      html`<wc-icon-button
        level="tertiary"
        aria-label="Edit"
      ></wc-icon-button>`,
    );

    expect(el.color).to.equal('primary');
    expect(el.variant).to.equal('text');
  });

  it('uses the same secondary mapping as wc-button', async () => {
    const el = await fixture<IconButton>(
      html`<wc-icon-button
        level="secondary"
        aria-label="Edit"
      ></wc-icon-button>`,
    );
    expect(el.getAttribute('color')).to.equal('surface');
    expect(el.getAttribute('variant')).to.equal('tonal');
  });

  it('points its ripple at the link in link mode', async () => {
    const el = await fixture<IconButton>(
      html`<wc-icon-button href="/home" aria-label="Home"></wc-icon-button>`,
    );
    expect(
      el.shadowRoot!.querySelector('wc-ripple')!.getAttribute('for'),
    ).to.equal('link');
    expect(warnings.filter(w => w.includes('deprecated'))).to.have.length(0);
  });

  it('uses its tooltip as the accessible name when no aria-label is set', async () => {
    const el = await fixture<IconButton>(
      html`<wc-icon-button tooltip="Delete"
        ><span aria-hidden="true">x</span></wc-icon-button
      >`,
    );
    const native = el.shadowRoot!.querySelector('#button')!;
    expect(native.getAttribute('aria-label')).to.equal('Delete');

    el.setAttribute('aria-label', 'Delete row');
    await el.updateComplete;
    expect(native.getAttribute('aria-label')).to.equal('Delete row');
  });

  it('warns once per tag when it has no accessible name', async () => {
    await fixture(html`<wc-icon-button></wc-icon-button>`);
    await fixture(html`<wc-icon-button></wc-icon-button>`);
    const nameWarnings = warnings.filter(w => w.includes('accessible name'));
    expect(nameWarnings).to.have.length(1);
    expect(nameWarnings[0]).to.contain('wc-icon-button');
  });

  it('does not warn when named by aria-label or tooltip', async () => {
    await fixture(html`<wc-icon-button aria-label="Home"></wc-icon-button>`);
    await fixture(html`<wc-icon-button tooltip="Home"></wc-icon-button>`);
    expect(warnings.filter(w => w.includes('accessible name'))).to.have.length(
      0,
    );
  });

  it('toggles with aria-pressed and fires change', async () => {
    const el = await fixture<IconButton>(
      html`<wc-icon-button toggle aria-label="Bold"></wc-icon-button>`,
    );
    let detail: { selected: boolean } | undefined;
    el.addEventListener('change', event => {
      detail = (event as CustomEvent<{ selected: boolean }>).detail;
    });
    el.click();
    await el.updateComplete;
    expect(el.selected).to.be.true;
    expect(detail).to.deep.equal({ selected: true });
    expect(
      el.shadowRoot!.querySelector('#button')!.getAttribute('aria-pressed'),
    ).to.equal('true');
  });

  it('sets aria-busy and blocks clicks while loading', async () => {
    const el = await fixture<IconButton>(
      html`<wc-icon-button loading aria-label="Sync"></wc-icon-button>`,
    );
    let clicks = 0;
    el.addEventListener('click', () => {
      clicks += 1;
    });
    const native = el.shadowRoot!.querySelector<HTMLButtonElement>('#button')!;
    expect(native.getAttribute('aria-busy')).to.equal('true');
    expect(el.shadowRoot!.querySelector('wc-circular-progress')).to.exist;
    native.click();
    expect(clicks).to.equal(0);
  });
});

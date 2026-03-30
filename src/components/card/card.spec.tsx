import { newSpecPage } from '@stencil/core/testing';
import { Card } from './card';

describe('card', () => {
  it('uses elevated variant by default', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: '<pc-card></pc-card>',
    });

    expect(page.root).toEqualHtml(`
      <pc-card variant="elevated">
        <mock:shadow-root>
          <div class="card">
            <slot></slot>
          </div>
        </mock:shadow-root>
      </pc-card>
    `);
  });

  it('reflects variant and shadow-level attributes', async () => {
    const page = await newSpecPage({
      components: [Card],
      html: '<pc-card variant="outlined" shadow-level="md"></pc-card>',
    });

    expect(page.root).toEqualHtml(`
      <pc-card shadow-level="md" variant="outlined">
        <mock:shadow-root>
          <div class="card">
            <slot></slot>
          </div>
        </mock:shadow-root>
      </pc-card>
    `);
  });
});

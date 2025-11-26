import { newSpecPage } from '@stencil/core/testing';
import { Button } from './button';

describe('button', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [Button],
      html: '<goat-button></goat-button>',
    });
    expect(page.root).toEqualHtml(`
      <goat-button>
        <mock:shadow-root>
          <div class='button size-md type-default variant-default color-primary has-content'>
            <div class='button-background'></div>
            <button class='native-button' target='_self' type='button' role='button' aria-disabled='false'>
              <div class='button-content'><div class='slot-container'>
              <slot></slot>
</div></div>
            </button>
          </div>
        </mock:shadow-root>
      </goat-button>
    `);
  });
});

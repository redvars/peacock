import {
  argbFromHex,
  CorePalette,
  hexFromArgb,
} from '@material/material-color-utilities';

import { defineConfig, parse, build } from '@terrazzo/parser';
import css from '@terrazzo/plugin-css';
import { customTransformerPlugin } from '../terrazzo.operations.plugin.mjs';

// Define configuration, typically including plugins for output format
const config = defineConfig(
  {
    plugins: [
      css({
        filename: 'tokens.css',
        legacyHex: true,
        baseScheme: 'light dark', // Default is 'light', this enables both.

        // OPTION B: Define how 'dark' mode tokens are applied via CSS selectors.
        // This is the core of dark mode implementation.
        modeSelectors: [
          {
            mode: 'dark', // The token mode defined in your semantic JSON files ($modes: { "dark": ... })
            // The CSS selector(s) that will apply the dark mode values.
            selectors: [
              "[data-theme='dark']", // Selector for a manual toggle
            ],
          },
          // You could add other modes here, like high-contrast:
          // {
          //   mode: "high-contrast",
          //   selectors: ["@media (forced-colors: active)"],
          // },
        ],
      }),
      customTransformerPlugin(),
    ],
    outDir: './dist/',
    lint: {
      /** @see https://terrazzo.app/docs/cli/lint */
    },
  },
  { cwd: new URL(import.meta.url) },
);

export class PeacockColor {
  colorName;
  hexValue;
  argbColor;
  weightsUsed = {};
  constructor(colorName, hexValue) {
    this.colorName = colorName;
    this.hexValue = hexValue;
    this.argbColor = argbFromHex(hexValue);
  }

  __useWeight(weight) {
    this.weightsUsed[weight] = true;
    return `{color.${this.colorName}.${weight}}`;
  }

  __generetareColor(tone, darkTone) {
    return {
      $value: this.__useWeight(tone),
      $extensions: {
        mode: {
          dark: this.__useWeight(darkTone),
        },
      },
    };
  }

  async getPalette() {
    this.weightsUsed = {};
    const palette = {
      color: {
        $type: 'color',
        [`${this.colorName}-base`]: {
          $value: this.hexValue,
        },
        [this.colorName]: {
          '@': this.__generetareColor(40, 80),
        },
        [`on-${this.colorName}`]: this.__generetareColor(100, 20),
        [`${this.colorName}-container`]: this.__generetareColor(90, 30),
        [`on-${this.colorName}-container`]: this.__generetareColor(10, 90),
        [`inverse-${this.colorName}`]: this.__generetareColor(80, 40),
      },
    };

    const colorPalette = CorePalette.of(this.argbColor);

    Object.keys(this.weightsUsed).forEach(weight => {
      palette.color[this.colorName][weight] = {
        $value: hexFromArgb(colorPalette.a1.tone(parseInt(weight))),
      };
    });

    const { tokens, sources } = await parse(
      [
        {
          filename: new URL('file:///tokens.json'),
          src: JSON.stringify(palette),
        },
        {
          filename: new URL('file:///tokens3.json'),
          src: JSON.stringify(palette),
        },
      ],
      { config },
    );

    const buildResult = await build(tokens, { sources, config });

    console.log(buildResult.outputFiles);

    return palette;
  }

  getNeutralPalette() {}
}

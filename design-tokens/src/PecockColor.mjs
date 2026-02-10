import {
  argbFromHex,
  CorePalette,
  hexFromArgb,
} from '@material/material-color-utilities';

import { defineConfig, parse } from '@terrazzo/parser';
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
  /** @types {{{ hex: string, argbColor: string, name: string, toneType?: string}[]} **/
  colors;
  weightsUsed = {};
  constructor(colors) {
    this.colors = colors;

    this.colors.forEach(color => {
      color.argbColor = argbFromHex(color.hex);
    });
  }

  __useWeight(name, weight) {
    this.weightsUsed[weight] = true;
    return `{color.${name}.${weight}}`;
  }

  __generateColor(name, tone, darkTone) {
    return {
      $value: this.__useWeight(name, tone),
      $extensions: {
        mode: {
          dark: this.__useWeight(name, darkTone),
        },
      },
    };
  }

  async getPalette() {
    this.weightsUsed = {};
    const palette = {
      color: {
        $type: 'color',
      },
    };

    this.colors.forEach(color => {
      palette.color[color.name] = {
        '@': this.__generateColor(color.name, 40, 80),
        'base': this.hexValue,
      };
      palette.color[`on-${color.name}`] = this.__generateColor(
        color.name,
        100,
        20,
      );
      palette.color[`${color.name}-container`] = this.__generateColor(
        color.name,
        90,
        30,
      );
      palette.color[`on-${color.name}-container`] = this.__generateColor(
        color.name,
        10,
        90,
      );
      palette.color[`inverse-${color.name}`] = this.__generateColor(
        color.name,
        80,
        40,
      );

      const colorPalette = CorePalette.of(color.argbColor);

      debugger;

      [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].forEach(weight => {
        this.weightsUsed[weight] = true;
      });

      Object.keys(this.weightsUsed).forEach(weight => {
        if (!color.toneType)
          palette.color[color.name][weight] = {
            $value: hexFromArgb(colorPalette.a1.tone(parseInt(weight))),
          };
        if (color.toneType == 'neutral')
          palette.color[color.name][weight] = {
            $value: hexFromArgb(colorPalette.n1.tone(parseInt(weight))),
          };
      });
    });

    /* const { tokens, sources } = await parse(
      [
        {
          filename: new URL('file:///tokens.json'),
          src: JSON.stringify(palette),
        },
      ],
      { config },
    );*/

    // const buildResult = await build(tokens, { sources, config });

    // console.log(buildResult.outputFiles);

    return palette;
  }

  getNeutralPalette() {}
}

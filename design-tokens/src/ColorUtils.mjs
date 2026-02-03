import {
  argbFromHex,
  CorePalette,
  hexFromArgb,
  themeFromSourceColor,
} from '@material/material-color-utilities';

function capitalizeFirstLetter(string) {
  if (!string) return ''; // Handle empty or null strings
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const DEFAULT_WEIGHTS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 100];
const NEUTRAL_WEIGHTS = [
  0, 4, 6, 10, 12, 17, 20, 22, 30, 40, 50, 60, 70, 80, 87, 90, 92, 94, 95, 96,
  98, 99, 100,
];

export default class ColorUtils {
  static copyColor(color, weights = DEFAULT_WEIGHTS) {
    const result = {};
    result['@'] = {
      $value: `{color.${color}.@}`,
    };

    weights.forEach(weight => {
      result[weight] = {
        $value: `{color.${color}.${weight}}`,
      };
    });

    return result;
  }

  static onBaselineColor(colorName, baseColor) {
    if (!baseColor) {
      baseColor = colorName;
    }

    return {
      color: {
        $type: 'color',
        [colorName]: {
          $value: `{color.${baseColor}.40}`,
          $extensions: {
            mode: {
              dark: `{color.${baseColor}.80}`,
            },
          },
        },
        [`on${capitalizeFirstLetter(colorName)}`]: {
          $value: `{color.${baseColor}.100}`,
          $extensions: {
            mode: {
              dark: `{color.${baseColor}.20}`,
            },
          },
        },
        [`${colorName}Container`]: {
          $value: `{color.${baseColor}.90}`,
          $extensions: {
            mode: {
              dark: `{color.${baseColor}.30}`,
            },
          },
        },
        [`on${capitalizeFirstLetter(colorName)}Container`]: {
          $value: `{color.${baseColor}.10}`,
          $extensions: {
            mode: {
              dark: `{color.${baseColor}.90}`,
            },
          },
        },
        [`inverse${capitalizeFirstLetter(colorName)}`]: {
          $value: `{color.${baseColor}.80}`,
          $extensions: {
            mode: {
              dark: `{color.${baseColor}.40}`,
            },
          },
        },
      },
    };
  }

  /**
   *
   * @param hexColor
   * @param type 'primary' | 'neutral'
   */
  static generatePalette(hexColor, type = 'primary') {
    const result = {};
    const weights = type === 'neutral' ? NEUTRAL_WEIGHTS : DEFAULT_WEIGHTS;

    let arbFromHexColor = hexColor;
    if (
      /^#?([0-9A-F]{3}|[0-9A-F]{4}|[0-9A-F]{6}|[0-9A-F]{8})$/i.test(hexColor)
    ) {
      arbFromHexColor = argbFromHex(hexColor);
    }
    const colorPalette = CorePalette.of(arbFromHexColor);

    if (type === 'primary') {
      result['@'] = {
        $value: hexFromArgb(arbFromHexColor),
      };
      weights.forEach(weight => {
        result[weight] = {
          $value: hexFromArgb(colorPalette.a1.tone(weight)),
        };
      });
    } else if (type === 'neutral') {
      result['@'] = {
        $value: hexFromArgb(colorPalette.n2.tone(50)),
      };
      weights.forEach(weight => {
        result[weight] = {
          $value: hexFromArgb(colorPalette.n2.tone(weight)),
        };
      });
    }

    return result;
  }

  static generateTheme(primaryHexColor) {
    const arbFromHexColor = argbFromHex(primaryHexColor);
    const theme = themeFromSourceColor(arbFromHexColor);

    // console.log(JSON.stringify(theme, null, 2));

    const result = {
      $type: 'color',
    };
    const paletteNames = Object.keys(theme.palettes);
    /*console.log(paletteNames);
   paletteNames.map(key => {
     if (key === 'neutral' || key === 'neutralVariant') {
       result[key] = this.generatePalette(
         theme.palettes[key].keyColor.argb,
         'neutral',
       );
     } else {
       result[key] = this.generatePalette(theme.palettes[key].keyColor.argb);
     }
   });*/
    const colorPalette = CorePalette.of(
      theme.palettes['primary'].keyColor.argb,
    );

    result['primary'] = {
      '@': {
        $value: primaryHexColor,
      },
    };
    DEFAULT_WEIGHTS.forEach(weight => {
      result['primary'][weight] = {
        $value: hexFromArgb(colorPalette.a1.tone(weight)),
      };
    });
    result['secondary'] = {
      '@': {
        $value: hexFromArgb(colorPalette.a2.tone(50)),
      },
    };
    DEFAULT_WEIGHTS.forEach(weight => {
      result['secondary'][weight] = {
        $value: hexFromArgb(colorPalette.a2.tone(weight)),
      };
    });
    result['tertiary'] = {
      '@': {
        $value: hexFromArgb(colorPalette.a3.tone(50)),
      },
    };
    DEFAULT_WEIGHTS.forEach(weight => {
      result['tertiary'][weight] = {
        $value: hexFromArgb(colorPalette.a3.tone(weight)),
      };
    });
    result['neutral'] = {
      '@': {
        $value: hexFromArgb(colorPalette.n1.tone(50)),
      },
    };
    NEUTRAL_WEIGHTS.forEach(weight => {
      result['neutral'][weight] = {
        $value: hexFromArgb(colorPalette.n1.tone(weight)),
      };
    });
    result['neutralVariant'] = {
      '@': {
        $value: hexFromArgb(colorPalette.n2.tone(50)),
      },
    };
    NEUTRAL_WEIGHTS.forEach(weight => {
      result['neutralVariant'][weight] = {
        $value: hexFromArgb(colorPalette.n2.tone(weight)),
      };
    });

    Object.keys(theme.schemes.light.toJSON()).map(key => {
      if (paletteNames.includes(key)) return;
      result[key] = {
        $value: hexFromArgb(theme.schemes.light[key]),
        $extensions: {
          mode: {
            dark: hexFromArgb(theme.schemes.dark[key]),
          },
        },
      };
    });

    return result;
  }
}

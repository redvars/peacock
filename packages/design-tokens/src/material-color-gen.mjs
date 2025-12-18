import {
  argbFromHex,
  CorePalette,
  hexFromArgb,
  themeFromSourceColor,
} from '@material/material-color-utilities';

// Get the theme from a hex color

function getTheme(primaryHexColor) {
  const arbFromHexColor = argbFromHex(primaryHexColor);
  const theme = themeFromSourceColor(arbFromHexColor);

  // console.log(JSON.stringify(theme, null, 2));

  const result = {
    $type: 'color',
  };
  const paletteNames = Object.keys(theme.palettes);
  paletteNames.map(key => {
    if (key === 'neutral' || key === 'neutralVariant') {
      result[key] = getPalette(
        theme.palettes[key].keyColor.argb,
        [0, 4, 10, 12, 20, 30, 40, 50, 60, 70, 80, 90, 94, 95, 96, 99, 100],
      );
    } else {
      result[key] = getPalette(theme.palettes[key].keyColor.argb);
    }
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

function getPaletteFromHex(hexColor, weights) {
  return getPalette(argbFromHex(hexColor), weights);
}

function getPalette(
  arbFromHexColor,
  weights = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 100],
) {
  const colorPalette = CorePalette.of(arbFromHexColor);

  const result = {
    '@': {
      $value: hexFromArgb(arbFromHexColor),
    },
  };
  weights.forEach(weight => {
    result[weight] = getValue(weight);
  });

  return result;
  function getValue(tone) {
    return {
      $value: hexFromArgb(colorPalette.n1.tone(tone)),
    };
  }
}

//console.log(JSON.stringify(getTheme('#ff0000'), null, 4));

//console.log(JSON.stringify(getPaletteFromHex('#ff0000'), null, 4));
//console.log(JSON.stringify(getPaletteFromHex('#008000'), null, 4));
//console.log(JSON.stringify(getPaletteFromHex('#0000ff'), null, 4));
//console.log(JSON.stringify(getPaletteFromHex('#9d00ff'), null, 4));
console.log(
  JSON.stringify(
    getPaletteFromHex(
      '#000000',
      [
        0, 4, 6, 10, 12, 17, 20, 22, 30, 40, 50, 60, 70, 80, 87, 90, 92, 94, 95,
        96, 99, 100,
      ],
    ),
    null,
    4,
  ),
);

import ColorUtils from './ColorUtils.mjs';
import { PeacockColor } from './PecockColor.mjs';
//console.log(JSON.stringify(ColorUtils.copyColor('blue'), null, 2));

/*const result = {
  red: ColorUtils.generatePalette('#E73121'),
  green: ColorUtils.generatePalette('#2E6F40'),
  blue: ColorUtils.generatePalette('#305CDE'),
  purple: ColorUtils.generatePalette('#E40078'),
  yellow: ColorUtils.generatePalette('#FFED29'),
  orange: ColorUtils.generatePalette('#FF7518'),
};
console.log(JSON.stringify(result, null, 2));*/

//console.log(JSON.stringify(ColorUtils.generateTheme('#7c5df0'), null, 2));

// neutral
/*console.log(
  JSON.stringify(ColorUtils.generatePalette('#252525', 'neutral'), null, 2),
);*/
/*

console.log(
  JSON.stringify(ColorUtils.onBaselineColor('success', 'green'), null, 2),
);
*/

console.log(
  JSON.stringify(
    await new PeacockColor([
      { name: 'red', hex: '#CD1C18' },
      { name: 'blue', hex: '#305CDE' },
      { name: 'green', hex: '#2E6F40' },
      { name: 'purple', hex: '#e40078' },
      { name: 'yellow', hex: '#FFCE1B' },
      { name: 'orange', hex: '#FF7518' },
    ]).getPalette(),
    null,
    2,
  ),
);

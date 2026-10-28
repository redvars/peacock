// Tokens that don't depend on the theme config. Imported as JSON so the
// engine runs the same in Node and, bundled, in the browser.
import colorPalette from '../tokens/primitive/colors/color.palette.json' with { type: 'json' };
import accents from '../tokens/primitive/colors/accents.json' with { type: 'json' };
import fontWeights from '../tokens/primitive/typography/font-weights.json' with { type: 'json' };
import spacing from '../tokens/primitive/spacing/spacing.json' with { type: 'json' };
import container from '../tokens/primitive/spacing/container.json' with { type: 'json' };
import motion from '../tokens/primitive/animation/motion.json' with { type: 'json' };
import elevation from '../tokens/primitive/elevation/elevation.json' with { type: 'json' };
import state from '../tokens/primitive/state/state.json' with { type: 'json' };
import colorStatus from '../tokens/semantics/colors/color.status.json' with { type: 'json' };
import fontBody from '../tokens/semantics/typography/font.body.json' with { type: 'json' };
import components from '../tokens/semantics/components/components.json' with { type: 'json' };

/** [name, DTCG document] pairs; the name only shows up in parser errors. */
export const STATIC_TOKENS = [
  ['primitive/colors/color.palette.json', colorPalette],
  ['primitive/colors/accents.json', accents],
  ['primitive/typography/font-weights.json', fontWeights],
  ['primitive/spacing/spacing.json', spacing],
  ['primitive/spacing/container.json', container],
  ['primitive/animation/motion.json', motion],
  ['primitive/elevation/elevation.json', elevation],
  ['primitive/state/state.json', state],
  ['semantics/colors/color.status.json', colorStatus],
  ['semantics/typography/font.body.json', fontBody],
  ['semantics/components/components.json', components],
];

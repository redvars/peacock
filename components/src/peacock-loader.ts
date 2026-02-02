// Eager loaded
import cssComponentsStyleSheet from '@redvars/peacock-design-tokens/dist/tokens.css';
import { Icon } from './icon/icon.js';
import { Avatar } from './avatar/avatar.js';
import { Badge } from './badge/badge.js';
import { Divider } from './divider/divider.js';
import { Elevation } from './elevation/elevation.js';

import { LoaderConfig, LoaderUtils } from './LoaderUtils.js';
import linkStyles from './link/link.scss';
import textStylesheet from './text/text.scss';

const libraryPrefix = 'p';

function buildSheet(styleSheet: any) {
  const sheet = new CSSStyleSheet();
  // Add rules
  sheet.replaceSync(styleSheet.toString());
  return sheet;
}

const styleSheets = [
  buildSheet(cssComponentsStyleSheet),
  buildSheet(linkStyles),
  buildSheet(textStylesheet),
];

document.adoptedStyleSheets = styleSheets;

const loaderConfig: LoaderConfig = {
  prefix: libraryPrefix,
  components: {
    icon: {
      CustomElementClass: Icon,
      // importPath: './component/icon.js', - for lazy load give path instead of CustomElementClass
    },
    avatar: {
      CustomElementClass: Avatar,
    },
    badge: {
      CustomElementClass: Badge,
    },
    divider: {
      CustomElementClass: Divider,
    },
    elevation: {
      CustomElementClass: Elevation,
    },
    clock: {
      importPath: './clock.js',
    },
  },
};

new LoaderUtils(loaderConfig).start();

// Eager loaded
import cssComponentsStyleSheet from '@redvars/peacock-design-tokens/dist/tokens.css';

import { Elevation } from './elevation/elevation.js';
import { FocusRing } from './focus-ring/focus-ring.js';
import { Ripple } from './ripple/ripple.js';

import { Icon } from './icon/icon.js';
import { Avatar } from './avatar/avatar.js';
import { Badge } from './badge/badge.js';
import { Divider } from './divider/divider.js';
import { Button } from './button/button.js';
import { Accordion } from './accordion/accordion/accordion.js';
import { Link } from './link/link.js';

import { LoaderConfig, LoaderUtils } from './LoaderUtils.js';
import linkStyles from './link/link.css-component.scss';
import textStylesheet from './text/text.css-component.scss';

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
    'focus-ring': {
      CustomElementClass: FocusRing,
    },
    avatar: {
      CustomElementClass: Avatar,
    },
    badge: {
      CustomElementClass: Badge,
    },
    button: {
      CustomElementClass: Button,
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
    ripple: {
      CustomElementClass: Ripple,
    },
    accordion: {
      CustomElementClass: Accordion,
    },
    'accordion-item': {
      CustomElementClass: Accordion.Item,
    },
    link: {
      CustomElementClass: Link,
    },
  },
};

new LoaderUtils(loaderConfig).start();

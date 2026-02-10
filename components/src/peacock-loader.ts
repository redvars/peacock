// Eager loaded
import cssComponentsStyleSheet from '@redvars/peacock-design-tokens/dist/tokens.css';

import { Elevation } from './elevation/elevation.js';
import { FocusRing } from './focus-ring/focus-ring.js';
import { Ripple } from './ripple/ripple.js';

import { Icon } from './icon/icon.js';
import { Avatar } from './avatar/avatar.js';
import { Badge } from './badge/badge.js';
import { Divider } from './divider/divider.js';
import { Button } from './button/button/button.js';
import { ButtonGroup } from './button/button-group/button-group.js';
import { IconButton } from './button/icon-button/icon-button.js';

import { Accordion } from './accordion/accordion/accordion.js';
import { Link } from './link/link.js';
import { Tag } from './chip/tag/tag.js';
import { Chip } from './chip/chip/chip.js';
import { LinearProgress } from './progress/linear-progress/linear-progress.js';
import { CircularProgress } from './progress/circular-progress/circular-progress.js';

import { Skeleton } from './skeleton/skeleton.js';

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
    'icon-button': {
      CustomElementClass: IconButton,
    },
    'button-group': {
      CustomElementClass: ButtonGroup,
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
    chip: {
      CustomElementClass: Chip,
    },
    tag: {
      CustomElementClass: Tag,
    },
    'linear-progress': {
      CustomElementClass: LinearProgress,
    },
    'circular-progress': {
      CustomElementClass: CircularProgress,
    },
    skeleton: {
      CustomElementClass: Skeleton,
    },
  },
};

new LoaderUtils(loaderConfig).start();

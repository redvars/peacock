// Eager loaded
import cssComponentsStyleSheet from '@redvars/peacock-design-tokens/dist/tokens.css';
import { Icon } from './icon/icon.js';
import { Avatar } from './avatar/avatar.js';
import { Badge } from './badge/badge.js';
import { Divider } from './divider/divider.js';

import { LoaderConfig, LoaderUtils } from './LoaderUtils.js';
import { createLinkStyles } from './link/link.css.js';
import { createTextStyles } from './text/text.css.js';

const libraryPrefix = 'p';

function buildSheet(styleSheet: any) {
  const sheet = new CSSStyleSheet();
  // Add rules
  sheet.replaceSync(styleSheet.toString());
  return sheet;
}

const styleSheets = [buildSheet(cssComponentsStyleSheet)];

const linkStylesheet = createLinkStyles(libraryPrefix).styleSheet;
if (linkStylesheet) styleSheets.push(linkStylesheet);

const textStylesheet = createTextStyles(libraryPrefix).styleSheet;
if (textStylesheet) styleSheets.push(textStylesheet);

function stringifyStyleSheet(stylesheet: any) {
  // Use Array.from() to convert the CSSRuleList to an array
  return (
    Array.from(stylesheet.cssRules)
      // Map each rule to its cssText property
      .map((rule: any) => rule.cssText || '')
      // Join all the rules with a newline character
      .join('\\n')
  );
}

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
    clock: {
      importPath: '.' + '/clock.js',
    },
  },
};

new LoaderUtils(loaderConfig).start();

// Eager loaded
import { Icon } from './icon/icon.js';
import { Avatar } from './avatar/avatar.js';

import { LoaderConfig, LoaderUtils } from './LoaderUtils.js';
import cssComponentsStyleSheet from '../assets/styles/peacock.css';
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

document.adoptedStyleSheets = styleSheets;

const loaderConfig: LoaderConfig = {
  prefix: 'p',
  components: {
    icon: {
      CustomElementClass: Icon,
      // importPath: './component/icon.js', - for lazy load give path instead of CustomElementClass
    },
    avatar: {
      CustomElementClass: Avatar,
    },
  },
};

new LoaderUtils(loaderConfig).start();

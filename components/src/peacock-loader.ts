// Eager loaded
import cssComponentsStyleSheet from '../assets/styles/tokens.css';

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
import { InputField } from './input/input/input-field.js';
import { Field } from './input/field/field.js';
import { NumberField } from './input/number/number-field.js';
import { DatePicker } from './input/date-picker/date-picker.js';
import { TimePicker } from './input/time-picker/time-picker.js';

import { Accordion } from './accordion/accordion/accordion.js';
import { Link } from './link/link.js';
import { Tag } from './chip/tag/tag.js';
import { Chip } from './chip/chip/chip.js';
import { LinearProgress } from './progress/linear-progress/linear-progress.js';
import { CircularProgress } from './progress/circular-progress/circular-progress.js';

import { Tooltip } from './popover/tooltip/tooltip.js';
import { Breadcrumb, BreadcrumbItem } from './breadcrumb/index.js';

import { Skeleton } from './skeleton/skeleton.js';

import { LoaderConfig, LoaderUtils } from './LoaderUtils.js';
import linkStyles from './link/link.css-component.scss';
import textStylesheet from './text/text.css-component.scss';
import tooltipStyles from './popover/tooltip.css-component.scss';

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
  buildSheet(tooltipStyles),
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
    input: {
      CustomElementClass: InputField,
    },
    field: {
      CustomElementClass: Field,
    },
    number: {
      CustomElementClass: NumberField,
    },
    'date-picker': {
      CustomElementClass: DatePicker,
    },
    'time-picker': {
      CustomElementClass: TimePicker,
    },
    tooltip: {
      CustomElementClass: Tooltip,
    },
    'number-counter': {
      importPath: './number-counter.js',
    },
    'code-highlighter': {
      importPath: './code-highlighter.js',
    },
    breadcrumb: {
      CustomElementClass: Breadcrumb,
    },
    'breadcrumb-item': {
      CustomElementClass: BreadcrumbItem,
    },
  },
};

new LoaderUtils(loaderConfig).start();

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
import { Input } from './input/input/input.js';
import { Field } from './input/field/field.js';
import { NumberField } from './input/number/number-field.js';
import { DatePicker } from './input/date-picker/date-picker.js';
import { TimePicker } from './input/time-picker/time-picker.js';
import { Textarea } from './input/textarea/textarea.js';
import { Toggle } from './input/toggle/toggle.js';
import { Checkbox } from './checkbox/checkbox.js';

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
  components: {
    'base-icon': {
      CustomElementClass: Icon,
      // importPath: './component/icon.js', - for lazy load give path instead of CustomElementClass
    },
    'focus-ring': {
      CustomElementClass: FocusRing,
    },
    'base-avatar': {
      CustomElementClass: Avatar,
    },
    'base-badge': {
      CustomElementClass: Badge,
    },
    'base-button': {
      CustomElementClass: Button,
    },
    'icon-button': {
      CustomElementClass: IconButton,
    },
    'button-group': {
      CustomElementClass: ButtonGroup,
    },
    'base-divider': {
      CustomElementClass: Divider,
    },
    'base-elevation': {
      CustomElementClass: Elevation,
    },
    'base-clock': {
      importPath: './clock.js',
    },
    'base-ripple': {
      CustomElementClass: Ripple,
    },
    'base-accordion': {
      CustomElementClass: Accordion,
    },
    'accordion-item': {
      CustomElementClass: Accordion.Item,
    },
    'base-link': {
      CustomElementClass: Link,
    },
    'base-chip': {
      CustomElementClass: Chip,
    },
    'base-tag': {
      CustomElementClass: Tag,
    },
    'linear-progress': {
      CustomElementClass: LinearProgress,
    },
    'circular-progress': {
      CustomElementClass: CircularProgress,
    },
    'base-skeleton': {
      CustomElementClass: Skeleton,
    },
    'input-field': {
      CustomElementClass: Input,
    },
    'base-field': {
      CustomElementClass: Field,
    },
    'number-field': {
      CustomElementClass: NumberField,
    },
    'textarea-field': {
      CustomElementClass: Textarea,
    },
    'date-picker': {
      CustomElementClass: DatePicker,
    },
    'time-picker': {
      CustomElementClass: TimePicker,
    },
    'base-tooltip': {
      CustomElementClass: Tooltip,
    },
    'number-counter': {
      importPath: './number-counter.js',
    },
    'code-highlighter': {
      importPath: './code-highlighter.js',
    },
    'base-breadcrumb': {
      CustomElementClass: Breadcrumb,
    },
    'breadcrumb-item': {
      CustomElementClass: BreadcrumbItem,
    },
    'base-toggle': {
      CustomElementClass: Toggle,
    },
    'base-checkbox': {
      CustomElementClass: Checkbox,
    },
  },
};

new LoaderUtils(loaderConfig).start();

// Eager loaded

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
import { Input } from './input/input.js';
import { Field } from './field/field.js';
import { NumberField } from './number-field/number-field.js';
import { DatePicker } from './date-picker/date-picker.js';
import { TimePicker } from './time-picker/time-picker.js';
import { Textarea } from './textarea/textarea.js';
import { Switch } from './switch/switch.js';
import { Checkbox } from './checkbox/checkbox.js';

import { Menu } from './menu/menu/menu.js';
import { MenuItem } from './menu/menu-item/menu-item.js';
import { MenuList } from './menu/menu-list/menu-list.js';

import { Accordion } from './accordion/accordion/accordion.js';
import { Link } from './link/link.js';
import { Tag } from './chip/tag/tag.js';
import { Chip } from './chip/chip/chip.js';
import { LinearProgress } from './progress/linear-progress/linear-progress.js';
import { CircularProgress } from './progress/circular-progress/circular-progress.js';

import { Tooltip } from './popover/tooltip/tooltip.js';
import { Breadcrumb, BreadcrumbItem } from './breadcrumb/index.js';

import { Skeleton } from './skeleton/skeleton.js';
import { Spinner } from './spinner/spinner.js';

import { EmptyState } from './empty-state/empty-state.js';
import { Container } from './container/container.js';

import { LoaderConfig, LoaderUtils } from './LoaderUtils.js';
import { loadCSS } from './CssLoader.js';


const distDirectory = `${import.meta.url}/..`;
await loadCSS(`${distDirectory  }/assets/styles.css`);

/*
import tooltipStyles from './popover/tooltip.css-component.scss';

function buildSheet(styleSheet: any) {
  const sheet = new CSSStyleSheet();
  // Add rules
  sheet.replaceSync(styleSheet.toString());
  return sheet;
}

const styleSheets = [
// buildSheet(cssComponentsStyleSheet),
// buildSheet(linkStyles),
// buildSheet(textStylesheet),
  buildSheet(tooltipStyles),
];

document.adoptedStyleSheets = styleSheets;
*/

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
      importPath: `${distDirectory}/clock.js`,
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
      importPath: `${distDirectory}/number-counter.js`,
    },
    'code-highlighter': {
      importPath: `${distDirectory}/code-highlighter.js`,
    },
    'base-breadcrumb': {
      CustomElementClass: Breadcrumb,
    },
    'breadcrumb-item': {
      CustomElementClass: BreadcrumbItem,
    },
    'base-switch': {
      CustomElementClass: Switch,
    },
    'base-checkbox': {
      CustomElementClass: Checkbox,
    },
    'base-spinner': {
      CustomElementClass: Spinner,
    },
    'empty-state': {
      CustomElementClass: EmptyState,
    },
    'base-menu': {
      CustomElementClass: Menu,
    },
    'menu-item': {
      CustomElementClass: MenuItem,
    },
    'menu-list': {
      CustomElementClass: MenuList,
    },
    'base-container': {
      CustomElementClass: Container
    }
  },
};

new LoaderUtils(loaderConfig).start();

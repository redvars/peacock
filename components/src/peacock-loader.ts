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
import { SubMenu } from './menu/sub-menu/sub-menu.js';

import { Accordion } from './accordion/accordion.js';
import { Link } from './link/link.js';
import { Tag } from './chip/tag/tag.js';
import { Chip } from './chip/chip/chip.js';
import { LinearProgress } from './progress/linear-progress/linear-progress.js';
import { CircularProgress } from './progress/circular-progress/circular-progress.js';

import { Tooltip } from './tooltip/tooltip.js';
import { Breadcrumb, BreadcrumbItem } from './breadcrumb/index.js';

import { Skeleton } from './skeleton/skeleton.js';
import { Spinner } from './spinner/spinner.js';

import { EmptyState } from './empty-state/empty-state.js';
import { Container } from './container/container.js';
import { Image } from './image/image.js';

import { LoaderConfig, LoaderUtils } from './LoaderUtils.js';
import { loadCSS } from './CssLoader.js';
import { TabGroup } from './tabs/tab-group.js';
import { Tabs } from './tabs/tabs.js';
import { Tab } from './tabs/tab.js';
import { TabPanel } from './tabs/tab-panel.js';
import { Slider } from './slider/slider.js';
import { Table } from './table/table.js';
import { Pagination } from './pagination/pagination.js';
import { TreeView } from './tree-view/tree-view.js';
import { Card } from './card/card.js';
import { Snackbar } from './snackbar/snackbar.js';

const distDirectory = `${import.meta.url}/..`;
await loadCSS(`${distDirectory}/assets/styles.css`);

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
    'wc-icon': {
      CustomElementClass: Icon,
      // importPath: './component/icon.js', - for lazy load give path instead of CustomElementClass
    },
    'wc-focus-ring': {
      CustomElementClass: FocusRing,
    },
    'wc-avatar': {
      CustomElementClass: Avatar,
    },
    'wc-badge': {
      CustomElementClass: Badge,
    },
    'wc-button': {
      CustomElementClass: Button,
    },
    'wc-icon-button': {
      CustomElementClass: IconButton,
    },
    'wc-button-group': {
      CustomElementClass: ButtonGroup,
    },
    'wc-divider': {
      CustomElementClass: Divider,
    },
    'wc-elevation': {
      CustomElementClass: Elevation,
    },
    'wc-clock': {
      importPath: `${distDirectory}/clock.js`,
    },
    'wc-ripple': {
      CustomElementClass: Ripple,
    },
    'wc-accordion': {
      CustomElementClass: Accordion,
    },
    'wc-accordion-item': {
      CustomElementClass: Accordion.Item,
    },
    'wc-tabs': {
      CustomElementClass: Tabs,
    },
    'wc-tab-group': {
      CustomElementClass: TabGroup,
    },
    'wc-tab': {
      CustomElementClass: Tab,
    },
    'wc-tab-panel': {
      CustomElementClass: TabPanel,
    },
    'wc-link': {
      CustomElementClass: Link,
    },
    'wc-chip': {
      CustomElementClass: Chip,
    },
    'wc-card': {
      CustomElementClass: Card,
    },
    'wc-tag': {
      CustomElementClass: Tag,
    },
    'wc-linear-progress': {
      CustomElementClass: LinearProgress,
    },
    'wc-circular-progress': {
      CustomElementClass: CircularProgress,
    },
    'wc-skeleton': {
      CustomElementClass: Skeleton,
    },

    'wc-field': {
      CustomElementClass: Field,
    },
    'wc-input': {
      CustomElementClass: Input,
    },
    'wc-number-field': {
      CustomElementClass: NumberField,
    },
    'wc-textarea': {
      CustomElementClass: Textarea,
    },
    'wc-date-picker': {
      CustomElementClass: DatePicker,
    },
    'wc-time-picker': {
      CustomElementClass: TimePicker,
    },
    'wc-tooltip': {
      CustomElementClass: Tooltip,
    },
    'wc-number-counter': {
      importPath: `${distDirectory}/number-counter.js`,
    },
    'wc-code-editor': {
      importPath: `${distDirectory}/code-editor.js`,
    },
    'wc-code-highlighter': {
      importPath: `${distDirectory}/code-highlighter.js`,
    },
    'wc-breadcrumb': {
      CustomElementClass: Breadcrumb,
    },
    'wc-breadcrumb-item': {
      CustomElementClass: BreadcrumbItem,
    },
    'wc-switch': {
      CustomElementClass: Switch,
    },
    'wc-checkbox': {
      CustomElementClass: Checkbox,
    },
    'wc-spinner': {
      CustomElementClass: Spinner,
    },
    'wc-empty-state': {
      CustomElementClass: EmptyState,
    },
    'wc-menu': {
      CustomElementClass: Menu,
    },
    'wc-menu-item': {
      CustomElementClass: MenuItem,
    },
    'wc-sub-menu': {
      CustomElementClass: SubMenu,
    },
    'wc-container': {
      CustomElementClass: Container,
    },
    'wc-image': {
      CustomElementClass: Image,
    },
    'wc-slider': {
      CustomElementClass: Slider,
    },
    'wc-table': {
      CustomElementClass: Table,
    },
    'wc-pagination': {
      CustomElementClass: Pagination,
    },
    'wc-tree-view': {
      CustomElementClass: TreeView,
    },
    'wc-tree-node': {
      CustomElementClass: TreeView.Node,
    },
    'wc-snackbar': {
      CustomElementClass: Snackbar,
    },
    'wc-chart-doughnut': {
      importPath: `${distDirectory}/chart-doughnut.js`,
    },
    'wc-chart-pie': {
      importPath: `${distDirectory}/chart-pie.js`,
    },
    'wc-chart-bar': {
      importPath: `${distDirectory}/chart-bar.js`,
    },
    'wc-chart-stacked-bar': {
      importPath: `${distDirectory}/chart-stacked-bar.js`,
    },
  },
};

new LoaderUtils(loaderConfig).start();

import { LoaderConfig, LoaderUtils } from './LoaderUtils.js';
import { loadCSS } from './CssLoader.js';

// Eager loaded
import { Elevation } from '@/elevation/elevation.js';
import { FocusRing } from '@/focus-ring/focus-ring.js';
import { Ripple } from '@/ripple/ripple.js';
import { Icon } from '@/icon/icon.js';
import { Avatar } from '@/avatar/avatar.js';
import { Badge } from '@/badge/badge.js';
import { Divider } from '@/divider/divider.js';
import { Button } from '@/button/button/button.js';
import ButtonGroup from '@/button/button-group/button-group.js';
import { IconButton } from '@/button/icon-button/icon-button.js';
import { LinkButton } from '@/button/link-button/link-button.js';
import { Fab } from '@/button/fab/fab.js';
import { SegmentedButton } from '@/segmented-button/segmented-button.js';
import { SegmentedButtonGroup } from '@/segmented-button/segmented-button-group.js';
import { SplitButton } from '@/split-button/split-button.js';
import { DropdownButton } from '@/dropdown-button/dropdown-button.js';
import { Input } from '@/input/input.js';
import { PasswordField } from '@/password-field/password-field.js';
import { UrlField } from '@/url-field/url-field.js';
import { Field } from '@/field/field.js';
import { NumberField } from '@/number-field/number-field.js';
import { DatePicker } from '@/date-picker/date-picker.js';
import { TimePicker } from '@/time-picker/time-picker.js';
import { DateField } from '@/date-field/date-field.js';
import { DateRangeField } from '@/date-range-field/date-range-field.js';
import { TimeField } from '@/time-field/time-field.js';
import { DatetimeField } from '@/datetime-field/datetime-field.js';
import { Textarea } from '@/textarea/textarea.js';
import { Switch } from '@/switch/switch.js';
import { Checkbox } from '@/checkbox/checkbox.js';
import { Radio } from '@/radio/radio.js';
import { RadioGroup } from '@/radio/radio-group.js';

import { Menu } from '@/menu/menu/menu.js';
import { MenuItem } from '@/menu/menu-item/menu-item.js';
import { SubMenu } from '@/menu/sub-menu/sub-menu.js';
import { Item } from '@/item/item.js';
import { List } from '@/list/list.js';
import { ListItem } from '@/list/list-item.js';
import { Timeline } from '@/timeline/timeline.js';
import { TimelineItem } from '@/timeline/timeline-item.js';

import { Accordion } from '@/accordion/accordion.js';
import { Link } from '@/link/link.js';
import { Tag } from '@/chip/tag/tag.js';
import { Chip } from '@/chip/chip/chip.js';
import { ChipSet } from '@/chip/chip-set/chip-set.js';
import { LinearProgress } from '@/progress/linear-progress/linear-progress.js';
import { CircularProgress } from '@/progress/circular-progress/circular-progress.js';

import { Tooltip } from '@/tooltip/tooltip.js';
import { Popover } from '@/popover/popover.js';
import { PopoverContent } from '@/popover/popover-content.js';
import { Breadcrumb, BreadcrumbItem } from '@/breadcrumb/index.js';

import { Skeleton } from '@/skeleton/skeleton.js';
import { Spinner } from '@/spinner/spinner.js';

import { EmptyState } from '@/empty-state/empty-state.js';
import { Container } from '@/container/container.js';
import { Image } from '@/image/image.js';
import { Svg } from '@/svg/svg.js';

import { TabGroup } from '@/tabs/tab-group.js';
import { Tabs } from '@/tabs/tabs.js';
import { Tab } from '@/tabs/tab.js';
import { TabPanel } from '@/tabs/tab-panel.js';
import { Slider } from '@/slider/slider.js';
import { ColorPicker } from '@/color-picker/color-picker.js';
import { ColorField } from '@/color-field/color-field.js';
import { Table } from '@/table/table.js';
import { Pagination } from '@/pagination/pagination.js';
import { SidebarMenu } from '@/sidebar-menu/sidebar-menu.js';
import { SidebarMenuItem } from '@/sidebar-menu/sidebar-menu-item.js';
import { SidebarSubMenu } from '@/sidebar-menu/sidebar-sub-menu.js';
import { Card } from '@/card/card.js';
import { CardContent } from '@/card/card-content.js';
import { Alert } from '@/alert/alert.js';
import { Notification } from '@/notification/notification.js';
import { NotificationManager } from '@/notification-manager/notification-manager.js';
import { Snackbar } from '@/snackbar/snackbar.js';
import { BottomSheet } from '@/bottom-sheet/bottom-sheet.js';
import { SideSheet } from '@/side-sheet/side-sheet.js';
import { Modal } from '@/modal/modal.js';
import { Select } from '@/select/select.js';
import { Listbox, ListboxOption } from '@/listbox/index.js';
import { SelectOptionElement } from '@/select/option.js';
import { Search } from '@/search/search.js';
import { FilterBar } from '@/filter-bar/filter-bar.js';
import { PinInput } from '@/pin-input/pin-input.js';
import { FileUpload } from '@/file-upload/file-upload.js';
import { Stepper, Step } from '@/stepper/index.js';
import { ConfirmDialog } from '@/confirm-dialog/confirm-dialog.js';
import { Tree, TreeItem } from '@/tree/index.js';
import { CheckboxGroup } from '@/checkbox-group/checkbox-group.js';
import { Fieldset } from '@/fieldset/fieldset.js';
import { Form } from '@/form/form.js';
import { PhoneField } from '@/phone-field/phone-field.js';
import { CurrencyField } from '@/currency-field/currency-field.js';
import { DescriptionList, DescriptionItem } from '@/description-list/index.js';
import { Stat } from '@/stat/stat.js';
import { Sparkline } from '@/sparkline/sparkline.js';
import { TransferList } from '@/transfer-list/transfer-list.js';
import { StatusIndicator } from '@/status-indicator/status-indicator.js';
import { AppShell } from '@/app-shell/app-shell.js';
import { PageHeader } from '@/page-header/page-header.js';
import { ResizablePanels, Panel } from '@/resizable-panels/index.js';
import { Stack } from '@/stack/stack.js';
import { Grid } from '@/grid/grid.js';
import { AvatarGroup } from '@/avatar-group/avatar-group.js';
import { CopyButton } from '@/copy-button/copy-button.js';
import { CommandPalette } from '@/command-palette/command-palette.js';
import { WorkspaceSwitcher } from '@/workspace-switcher/workspace-switcher.js';
import { UserMenu } from '@/user-menu/user-menu.js';
import { Banner } from '@/banner/banner.js';
import { NotificationCenter } from '@/notification-center/notification-center.js';
import { Tour } from '@/tour/tour.js';
import { InlineEdit } from '@/inline-edit/inline-edit.js';
import { CommentThread, CommentElement } from '@/comment-thread/index.js';
import { Toolbar } from '@/toolbar/toolbar.js';
import { AppBar } from '@/app-bar/app-bar.js';
import { NavigationRail } from '@/navigation-rail/navigation-rail.js';
import { NavigationRailItem } from '@/navigation-rail/navigation-rail-item.js';
import { NavigationBar } from '@/navigation-bar/navigation-bar.js';
import { NavigationBarItem } from '@/navigation-bar/navigation-bar-item.js';
import { NavigationDrawer } from '@/navigation-drawer/navigation-drawer.js';
import { NavigationDrawerItem } from '@/navigation-drawer/navigation-drawer-item.js';
import { NavigationDrawerGroup } from '@/navigation-drawer/navigation-drawer-group.js';

// Resolve the folder this script was served from. `new URL('.', …)` drops the file name and any
// query string, so `loader.js?styles` still yields `…/dist` (no trailing slash).
const distDirectory = new URL('.', import.meta.url).href.replace(/\/$/, '');

const url = new URL(import.meta.url);
const params = url.searchParams;

// Example: loader.js?styles also loads dist/assets/styles.css
const includeStyles = params.has('styles');

if (includeStyles) {
  await loadCSS(`${distDirectory}/assets/styles.css`);
}

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
    'wc-link-button': {
      CustomElementClass: LinkButton,
    },
    'wc-fab': {
      CustomElementClass: Fab,
    },
    'wc-button-group': {
      CustomElementClass: ButtonGroup,
    },
    'wc-segmented-button': {
      CustomElementClass: SegmentedButton,
    },
    'wc-segmented-button-group': {
      CustomElementClass: SegmentedButtonGroup,
    },
    'wc-split-button': {
      CustomElementClass: SplitButton,
    },
    'wc-dropdown-button': {
      CustomElementClass: DropdownButton,
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
    'wc-chip-set': {
      CustomElementClass: ChipSet,
    },
    'wc-card': {
      CustomElementClass: Card,
    },
    'wc-card-content': {
      CustomElementClass: CardContent,
    },
    'wc-alert': {
      CustomElementClass: Alert,
    },
    'wc-notification': {
      CustomElementClass: Notification,
    },
    'wc-notification-manager': {
      CustomElementClass: NotificationManager,
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
    'wc-password-field': {
      CustomElementClass: PasswordField,
    },
    'wc-url-field': {
      CustomElementClass: UrlField,
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
    'wc-date-field': {
      CustomElementClass: DateField,
    },
    'wc-date-range-field': {
      CustomElementClass: DateRangeField,
    },
    'wc-time-field': {
      CustomElementClass: TimeField,
    },
    'wc-datetime-field': {
      CustomElementClass: DatetimeField,
    },
    'wc-tooltip': {
      CustomElementClass: Tooltip,
    },
    'wc-popover': {
      CustomElementClass: Popover,
    },
    'wc-popover-content': {
      CustomElementClass: PopoverContent,
    },
    'wc-number-counter': {
      importPath: `${distDirectory}/number-counter.js`,
    },
    'wc-code-editor': {
      importPath: `${distDirectory}/code-editor.js`,
    },
    'wc-html-editor': {
      importPath: `${distDirectory}/html-editor.js`,
      dependencies: ['wc-code-editor'],
    },
    'wc-markdown-editor': {
      importPath: `${distDirectory}/markdown-editor.js`,
      dependencies: ['wc-code-editor'],
    },
    'wc-code-highlighter': {
      importPath: `${distDirectory}/code-highlighter.js`,
    },
    'wc-code-group': {
      importPath: `${distDirectory}/code-group.js`,
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
    'wc-radio': {
      CustomElementClass: Radio,
    },
    'wc-radio-group': {
      CustomElementClass: RadioGroup,
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
    'wc-list': {
      CustomElementClass: List,
    },
    'wc-list-item': {
      CustomElementClass: ListItem,
    },
    'wc-timeline': {
      CustomElementClass: Timeline,
    },
    'wc-timeline-item': {
      CustomElementClass: TimelineItem,
    },
    'wc-item': {
      CustomElementClass: Item,
    },
    'wc-container': {
      CustomElementClass: Container,
    },
    'wc-image': {
      CustomElementClass: Image,
    },
    'wc-svg': {
      CustomElementClass: Svg,
    },
    'wc-slider': {
      CustomElementClass: Slider,
    },
    'wc-color-picker': {
      CustomElementClass: ColorPicker,
    },
    'wc-color-field': {
      CustomElementClass: ColorField,
    },
    'wc-table': {
      CustomElementClass: Table,
    },
    'wc-pagination': {
      CustomElementClass: Pagination,
    },
    'wc-sidebar-menu': {
      CustomElementClass: SidebarMenu,
    },
    'wc-sidebar-menu-item': {
      CustomElementClass: SidebarMenuItem,
    },
    'wc-sidebar-sub-menu': {
      CustomElementClass: SidebarSubMenu,
    },
    'wc-snackbar': {
      CustomElementClass: Snackbar,
    },
    'wc-bottom-sheet': {
      CustomElementClass: BottomSheet,
    },
    'wc-side-sheet': {
      CustomElementClass: SideSheet,
    },
    'wc-modal': {
      CustomElementClass: Modal,
    },
    'wc-select': {
      CustomElementClass: Select,
    },
    'wc-option': {
      CustomElementClass: SelectOptionElement,
    },
    'wc-listbox': {
      CustomElementClass: Listbox,
    },
    'wc-listbox-option': {
      CustomElementClass: ListboxOption,
    },
    'wc-search': {
      CustomElementClass: Search,
    },
    'wc-filter-bar': {
      CustomElementClass: FilterBar,
    },
    'wc-pin-input': {
      CustomElementClass: PinInput,
    },
    'wc-file-upload': {
      CustomElementClass: FileUpload,
    },
    'wc-stepper': {
      CustomElementClass: Stepper,
    },
    'wc-step': {
      CustomElementClass: Step,
    },
    'wc-confirm-dialog': {
      CustomElementClass: ConfirmDialog,
    },
    'wc-tree': {
      CustomElementClass: Tree,
    },
    'wc-tree-item': {
      CustomElementClass: TreeItem,
    },
    'wc-checkbox-group': {
      CustomElementClass: CheckboxGroup,
    },
    'wc-fieldset': {
      CustomElementClass: Fieldset,
    },
    'wc-form': {
      CustomElementClass: Form,
    },
    'wc-phone-field': {
      CustomElementClass: PhoneField,
    },
    'wc-currency-field': {
      CustomElementClass: CurrencyField,
    },
    'wc-description-list': {
      CustomElementClass: DescriptionList,
    },
    'wc-description-item': {
      CustomElementClass: DescriptionItem,
    },
    'wc-stat': {
      CustomElementClass: Stat,
    },
    'wc-sparkline': {
      CustomElementClass: Sparkline,
    },
    'wc-transfer-list': {
      CustomElementClass: TransferList,
    },
    'wc-status-indicator': {
      CustomElementClass: StatusIndicator,
    },
    'wc-app-shell': {
      CustomElementClass: AppShell,
    },
    'wc-page-header': {
      CustomElementClass: PageHeader,
    },
    'wc-resizable-panels': {
      CustomElementClass: ResizablePanels,
    },
    'wc-panel': {
      CustomElementClass: Panel,
    },
    'wc-stack': {
      CustomElementClass: Stack,
    },
    'wc-grid': {
      CustomElementClass: Grid,
    },
    'wc-avatar-group': {
      CustomElementClass: AvatarGroup,
    },
    'wc-copy-button': {
      CustomElementClass: CopyButton,
    },
    'wc-command-palette': {
      CustomElementClass: CommandPalette,
    },
    'wc-workspace-switcher': {
      CustomElementClass: WorkspaceSwitcher,
    },
    'wc-user-menu': {
      CustomElementClass: UserMenu,
    },
    'wc-banner': {
      CustomElementClass: Banner,
    },
    'wc-notification-center': {
      CustomElementClass: NotificationCenter,
    },
    'wc-tour': {
      CustomElementClass: Tour,
    },
    'wc-inline-edit': {
      CustomElementClass: InlineEdit,
    },
    'wc-comment-thread': {
      CustomElementClass: CommentThread,
    },
    'wc-comment': {
      CustomElementClass: CommentElement,
    },
    'wc-toolbar': {
      CustomElementClass: Toolbar,
    },
    'wc-app-bar': {
      CustomElementClass: AppBar,
    },
    'wc-navigation-rail': {
      CustomElementClass: NavigationRail,
    },
    'wc-navigation-rail-item': {
      CustomElementClass: NavigationRailItem,
    },
    'wc-navigation-bar': {
      CustomElementClass: NavigationBar,
    },
    'wc-navigation-bar-item': {
      CustomElementClass: NavigationBarItem,
    },
    'wc-navigation-drawer': {
      CustomElementClass: NavigationDrawer,
    },
    'wc-navigation-drawer-item': {
      CustomElementClass: NavigationDrawerItem,
    },
    'wc-navigation-drawer-group': {
      CustomElementClass: NavigationDrawerGroup,
    },
    'wc-calendar': {
      importPath: `${distDirectory}/calendar.js`,
      dependencies: [
        'wc-calendar-column-view',
        'wc-calendar-month-view',
        'wc-linear-progress',
      ],
    },
    'wc-calendar-column-view': {
      importPath: `${distDirectory}/calendar-column-view.js`,
    },
    'wc-calendar-month-view': {
      importPath: `${distDirectory}/calendar-month-view.js`,
    },
    'wc-flow': {
      importPath: `${distDirectory}/flow.js`,
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
    'wc-chart-line': {
      importPath: `${distDirectory}/chart-line.js`,
    },
    'wc-chart-area': {
      importPath: `${distDirectory}/chart-area.js`,
    },
    'wc-condition-builder': {
      importPath: `${distDirectory}/condition-builder.js`,
      dependencies: ['wc-cb-group', 'wc-cb-rule', 'wc-cb-divider'],
    },
    'wc-cb-group': {
      importPath: `${distDirectory}/cb-group.js`,
      dependencies: ['wc-cb-divider'],
    },
    'wc-cb-rule': {
      importPath: `${distDirectory}/cb-rule.js`,
    },
    'wc-cb-divider': {
      importPath: `${distDirectory}/cb-divider.js`,
    },
  },
};

const loader = new LoaderUtils(loaderConfig);

// Example: loader.js?no-shadow-watch leaves Element.prototype.attachShadow alone; the page then
// calls loadComponents(shadowRoot) for shadow roots it creates that contain Peacock components.
loader.start({ watchShadowRoots: !params.has('no-shadow-watch') });

/**
 * Loads the Peacock components in `root` (a shadow root, element or document) and those added to
 * it later. Only needed with `loader.js?no-shadow-watch`.
 */
export function loadComponents(root: Document | Element | ShadowRoot): void {
  loader.lazyLoadComponents(root);
}

export {
  setPeacockStrings,
  defaultStrings,
} from '@/__internal/i18n/strings.js';
export type { PeacockStrings } from '@/__internal/i18n/strings.js';

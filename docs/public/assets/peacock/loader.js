import { Elevation } from './elevation.js';
import { FocusRing } from './focus-ring.js';
import { Ripple } from './ripple.js';
import { Icon } from './icon.js';
import { Avatar } from './avatar.js';
import { Badge } from './badge.js';
import { Divider } from './divider.js';
import { Button } from './button.js';
import ButtonGroup from './button-group.js';
import { IconButton } from './icon-button.js';
import { Fab } from './fab.js';
import { SegmentedButton } from './segmented-button.js';
import { SegmentedButtonGroup } from './segmented-button-group.js';
import { SplitButton } from './split-button.js';
import { DropdownButton } from './dropdown-button.js';
import { Input } from './input.js';
import { UrlField } from './url-field.js';
import { Field } from './field.js';
import { NumberField } from './number-field.js';
import { DatePicker } from './date-picker.js';
import { TimePicker } from './time-picker.js';
import { Textarea } from './textarea.js';
import { Switch } from './switch.js';
import { Checkbox } from './checkbox.js';
import { Radio } from './radio.js';
import { RadioGroup } from './radio-group.js';
import { Menu } from './menu.js';
import { MenuItem } from './menu-item.js';
import { SubMenu } from './sub-menu.js';
import { Item } from './item.js';
import { List } from './list.js';
import { ListItem } from './list-item.js';
import { Timeline } from './timeline.js';
import { TimelineItem } from './timeline-item.js';
import { Accordion } from './accordion.js';
import { Link } from './link.js';
import { Tag } from './tag.js';
import { Chip } from './chip.js';
import { ChipSet } from './chip-set.js';
import { LinearProgress } from './linear-progress.js';
import { CircularProgress } from './circular-progress.js';
import { Tooltip } from './tooltip.js';
import { Popover } from './popover.js';
import { PopoverContent } from './popover-content.js';
import { Breadcrumb } from './breadcrumb.js';
import { BreadcrumbItem } from './breadcrumb-item.js';
import { Skeleton } from './skeleton.js';
import { Spinner } from './spinner.js';
import { EmptyState } from './empty-state.js';
import { Container } from './container.js';
import { Image } from './image.js';
import { Svg } from './svg.js';
import { TabGroup } from './tab-group.js';
import { Tabs } from './tabs.js';
import { Tab } from './tab.js';
import { TabPanel } from './tab-panel.js';
import { Slider } from './slider.js';
import { ColorPicker } from './color-picker.js';
import { ColorField } from './color-field.js';
import { Table } from './table.js';
import { Pagination } from './pagination.js';
import { SidebarMenu } from './sidebar-menu.js';
import { SidebarMenuItem } from './sidebar-menu-item.js';
import { SidebarSubMenu } from './sidebar-sub-menu.js';
import { Card } from './card.js';
import { CardContent } from './card-content.js';
import { Alert } from './alert.js';
import { Notification } from './notification.js';
import { NotificationManager } from './notification-manager.js';
import { Snackbar } from './snackbar.js';
import { BottomSheet } from './bottom-sheet.js';
import { SideSheet } from './side-sheet.js';
import { Modal } from './modal.js';
import { Select } from './select.js';
import { SelectOptionElement } from './option.js';
import { Search } from './search.js';
import { Toolbar } from './toolbar.js';
import { AppBar } from './app-bar.js';
import { NavigationRail } from './navigation-rail.js';
import { NavigationRailItem } from './navigation-rail-item.js';
import { NavigationBar } from './navigation-bar.js';
import { NavigationBarItem } from './navigation-bar-item.js';
import { NavigationDrawer } from './navigation-drawer.js';
import { NavigationDrawerItem } from './navigation-drawer-item.js';
import './IndividualComponent-Bdwyrvd6.js';
import './property-B49QQ8pS.js';
import './attachable-controller-CAKVrfcG.js';
import './state-DkTK9EGF.js';
import './query-CHb9Ft_d.js';
import './base-Cl6v8-BZ.js';
import './class-map-DG7CA1et.js';
import './directive-ZPhl09Yt.js';
import './sanitize-svg-_VNFLm82.js';
import './unsafe-html-Ct0N2_UU.js';
import './datasource-OwvH7SVq.js';
import './observe-slot-change-DPxaZrZF.js';
import './if-defined-BXZpRQ4P.js';
import './when-DEJm_QN9.js';
import './is-link-Dk2OV3PM.js';
import './dispatch-event-utils-CuEqjlPT.js';
import './ButtonConstants-CahP2_NA.js';
import './delegate-py-Ets8N.js';
import './form-submitter-DPI4L6gj.js';
import './element-internals-QME0yEz4.js';
import './hyperlink-DLvb6MXE.js';
import './throttle-C7ZAPqtu.js';
import './form-associated-Bhwwr6dT.js';
import './spread-B5cgadZl.js';
import './BaseInput-CV0pZgSb.js';
import './floating-controller-CZYwnRVu.js';
import './floating-ui.dom-oQieRCpS.js';
import './NativeHyperlinkMixin-D9J4aBTy.js';
import './query-assigned-elements-BJaGSqM0.js';
import './accordion-item.js';
import './style-map-BQD5Et1D.js';
import './base-progress-CLZTRveO.js';
import './is-dark-mode-DOcaw4Yq.js';

class LoaderUtils {
    constructor(loaderConfig) {
        this._loaderConfig = loaderConfig;
    }
    static registerComponent(tagName, CustomElementClass) {
        if (CustomElementClass && !customElements.get(tagName)) {
            customElements.define(tagName, CustomElementClass);
        }
    }
    start() {
        this.eagerLoadComponents();
        this.lazyLoadComponents(document);
    }
    eagerLoadComponents() {
        if (!this._loaderConfig.components)
            return;
        for (const [name, value] of Object.entries(this._loaderConfig.components)) {
            if (value.CustomElementClass)
                LoaderUtils.registerComponent(name, value.CustomElementClass);
        }
    }
    async registerAsync(tagName) {
        if (customElements.get(tagName))
            return;
        if (!this._loaderConfig.components)
            return;
        const config = this._loaderConfig.components[tagName];
        if (!config || !config.importPath)
            return;
        try {
            const module = await import(config.importPath);
            // Runtime definition: grabbing the class from the module
            const CustomElementClass = module.default || module[Object.keys(module)[0]];
            if (CustomElementClass && !customElements.get(tagName)) {
                customElements.define(tagName, CustomElementClass);
            }
            // Handle dependencies recursively
            if (config.dependencies) {
                for (const dep of config.dependencies) {
                    // eslint-disable-next-line no-await-in-loop
                    await this.registerAsync(dep);
                }
            }
        }
        catch (error) {
            console.error(`Unable to load <${tagName}> from ${config.importPath}`, error);
        }
    }
    async load(root) {
        const rootTagName = root instanceof Element ? root.tagName.toLowerCase() : '';
        const tags = Array.from(root.querySelectorAll(':not(:defined)')).map(el => el.tagName.toLowerCase());
        if (rootTagName.includes('-') && !customElements.get(rootTagName)) {
            tags.push(rootTagName);
        }
        const tagsToRegister = [...new Set(tags)];
        await Promise.allSettled(tagsToRegister.map(tagName => this.registerAsync(tagName)));
    }
    lazyLoadComponents(root) {
        this._observer = new MutationObserver(mutations => {
            for (const { addedNodes } of mutations) {
                for (const node of addedNodes) {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.load(node);
                    }
                }
            }
        });
        const target = root instanceof Document ? root.documentElement : root;
        this.load(target);
        this._observer.observe(target, {
            subtree: true,
            childList: true,
        });
    }
}

const sheetCache = new Map();
async function loadCSS(url, options = {}) {
    const { priority = "high", cache = "force-cache", media = "all", } = options;
    // Return cached sheet immediately
    if (sheetCache.has(url)) {
        const cached = sheetCache.get(url);
        if (!document.adoptedStyleSheets.includes(cached)) {
            document.adoptedStyleSheets = [...document.adoptedStyleSheets, cached];
        }
        return cached;
    }
    const response = await fetch(url, {
        cache,
        priority,
    });
    if (!response.ok) {
        throw new Error(`Failed to load CSS [${response.status}]: ${url}`);
    }
    const css = await response.text();
    const sheet = new CSSStyleSheet({ media });
    sheet.replaceSync(css);
    sheetCache.set(url, sheet);
    document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
    return sheet;
}

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
const loaderConfig = {
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
        'wc-search': {
            CustomElementClass: Search,
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
        'wc-calendar': {
            importPath: `${distDirectory}/calendar.js`,
            dependencies: ['wc-calendar-column-view', 'wc-calendar-month-view'],
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
        'wc-chart-stacked-bar': {
            importPath: `${distDirectory}/chart-stacked-bar.js`,
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
new LoaderUtils(loaderConfig).start();
//# sourceMappingURL=loader.js.map

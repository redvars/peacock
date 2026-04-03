# Peacock
**The foundation for beautiful user interfaces.**

[![Build](https://github.com/redvars/peacock/workflows/Build/badge.svg)](https://github.com/redvars/peacock/actions?workflow=Build)
[![GitHub license](https://img.shields.io/github/license/redvars/peacock.svg)](/LICENSE)
![Version](https://img.shields.io/npm/v/%40redvars%2Fpeacock)


<div align="center">
<img alt="Peacock LOGO" src="./logo.png" width="210">
</div>

Peacock gives you the tools and foundation to build beautiful, usable product interfaces. It’s the system you use to craft your own component library.

## What is Peacock?
Peacock is more than just a collection of components; it is an aesthetic philosophy. Like its avian namesake, it provides the core elements (the primitives) that allow the full, vibrant display (the design) to be unveiled.

**Opinionated Beauty:** We deliver pre-styled, beautiful components that follow modern design trends, significantly reducing the boilerplate needed to achieve a professional look.

**Foundation First:** Similar to projects like `shadcn/ui`, Peacock focuses on providing the foundational primitives, ensuring maximum flexibility for customization without sacrificing initial polish.

**Seamless Integration:** Designed with modern web frameworks in mind (e.g., React, Vue), integrating Peacock into your existing project structure is fast, efficient, and empowering.

## Key Features
Vibrant & Consistent Design System: Every component—from buttons and cards to complex data tables—shares a cohesive, high-quality visual language.

**Highly Extensible:** The component structure is designed for easy overwriting and theme customization, allowing you to quickly adapt the style to your specific brand identity.

**Built for Accessibility:** Focus on semantic HTML and proper ARIA attributes to ensure that your beautiful interfaces are accessible to all users.

**Responsive by Default:** Components are built with responsiveness baked in, guaranteeing a graceful display across all screen sizes and devices.

## Documentation
Visit [https://peacock.redvars.com](https://peacock.redvars.com) to view the documentation.

## Getting Started


```html
<head>
  
   <!-- Default font : Noto Sans and Noto Sans Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@100..900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">

  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@redvars/peacock@3.5.0/dist/assets/styles.css"></link>
  <script type='module'
          src='https://cdn.jsdelivr.net/npm/@redvars/peacock@3.5.0/dist/peacock-loader.js'></script>
</head>

<wc-button>Button</wc-button>
```

# Components

- 🟢 ready (feature complete for now)
- 🟡 beta (changes possible, not feature complete)
- 🔴 not ready (unstyled / no functions)
- 🔵 planned (created, but empty files)

## Input Controls

Input controls are UI design elements that allow users to input information into the system. They are essential for
collecting data and enabling user interactions. Some common examples of input controls include text fields, dropdown
menus, checkboxes, and radio buttons.

| Name                                                                    | Component       | State |
|-------------------------------------------------------------------------|-----------------|-------|
| [Checkbox](https://peacock.redvars.com/components/checkbox)             | wc-checkbox     | 🟢    |
| [Code editor](https://peacock.redvars.com/components/code-editor)       | wc-code-editor  | 🟢    |
| Color picker                                                            |                 | 🔴    |
| [Date picker](https://peacock.redvars.com/components/date-picker)       | wc-date-picker  | 🟡    |
| Date Time picker                                                        |                 | 🔴    |
| File picker                                                             |                 | 🔴    |
| [Form control](https://peacock.redvars.com/components/field)            | wc-field        | 🟡    |
| HTML editor                                                             |                 | 🔴    |
| [Input](https://peacock.redvars.com/components/input)                   | wc-input        | 🟢    |
| Month picker                                                            |                 | 🔴    |
| [Number](https://peacock.redvars.com/components/number)                 | wc-number-field | 🟢    |
| [Radio](https://peacock.redvars.com/components/radio)                   | wc-radio        | 🟡    |
| [Search](https://peacock.redvars.com/components/search)                 | wc-search       | 🟡    |
| [Select](https://peacock.redvars.com/components/select)                 | wc-select       | 🟢    |
| [Select Option](https://peacock.redvars.com/components/select)          | wc-option       | 🟢    |
| [Textarea](https://peacock.redvars.com/components/textarea)             | wc-textarea     | 🟢    |
| [Time picker](https://peacock.redvars.com/components/time-picker)       | wc-time-picker  | 🟡    |
| URL input                                                               |                 | 🔴    |
| Week picker                                                             |                 | 🔴    |

## Navigation

Navigational components are UI elements that help users move around the app or website. They provide users with a clear
and intuitive way to navigate through different sections and pages. Some common examples of navigational components
include menus, tabs, and breadcrumbs.

| Name                                                                    | Component            | State |
|-------------------------------------------------------------------------|----------------------|-------|
| [Breadcrumb](https://peacock.redvars.com/components/breadcrumb)         | wc-breadcrumb        | 🟢    |
| [Breadcrumb Item](https://peacock.redvars.com/components/breadcrumb)    | wc-breadcrumb-item   | 🟢    |
| Dropdown                                                                |                      | 🔴    |
| [Menu](https://peacock.redvars.com/components/menu)                     | wc-menu              | 🟡    |
| [Menu Item](https://peacock.redvars.com/components/menu)                | wc-menu-item         | 🟡    |
| [Sub Menu](https://peacock.redvars.com/components/menu)                 | wc-sub-menu          | 🟡    |
| [Tabs](https://peacock.redvars.com/components/tabs)                     | wc-tabs              | 🟢    |
| [Tab Group](https://peacock.redvars.com/components/tabs)                | wc-tab-group         | 🟢    |
| [Tab](https://peacock.redvars.com/components/tabs)                      | wc-tab               | 🟢    |
| [Tab Panel](https://peacock.redvars.com/components/tabs)                | wc-tab-panel         | 🟢    |
| [Toolbar](https://peacock.redvars.com/components/toolbar)               | wc-toolbar           | 🟡    |

## Informational

Informational components are UI elements that provide information to users. They communicate important messages,
updates, or instructions within the app or website. Some common examples of informational components
include notifications, tooltips, and progress bars.

| Name                                                                                | Component            | State |
|-------------------------------------------------------------------------------------|----------------------|-------|
| [Badge](https://peacock.redvars.com/components/badge)                               | wc-badge             | 🟢    |
| [Banner](https://peacock.redvars.com/components/banner)                             | wc-banner            | 🟢    |
| [Circular Progress](https://peacock.redvars.com/components/circular-progress)       | wc-circular-progress | 🟢    |
| [Linear Progress](https://peacock.redvars.com/components/linear-progress)           | wc-linear-progress   | 🟢    |
| [Notification](https://peacock.redvars.com/components/notification)                 | wc-notification      | 🟢    |
| [Notification Manager](https://peacock.redvars.com/components/notification-manager) |                      | 🔴    |
| [Skeleton](https://peacock.redvars.com/components/skeleton)                         | wc-skeleton          | 🟡    |
| [Snackbar](https://peacock.redvars.com/components/snackbar)                         | wc-snackbar          | 🟡    |
| [Spinner](https://peacock.redvars.com/components/spinner)                           | wc-spinner           | 🟢    |
| [Tooltip](https://peacock.redvars.com/components/tooltip)                           | wc-tooltip           | 🟢    |

## Containers

Containers are UI elements that group similar content together, making it easier for users to navigate and scan through
the interface. Examples of common containers include cards, carousels, and accordions, which provide structure and
organization to the content.

| Name                                                                    | Component         | State |
|-------------------------------------------------------------------------|-------------------|-------|
| [Accordion](https://peacock.redvars.com/components/accordion)           | wc-accordion      | 🟢    |
| [Accordion Item](https://peacock.redvars.com/components/accordion-item) | wc-accordion-item | 🟢    |
| [Bottom Sheet](https://peacock.redvars.com/components/bottom-sheet)     | wc-bottom-sheet   | 🟡    |
| [Card](https://peacock.redvars.com/components/card)                     | wc-card           | 🟡    |
| [Card Content](https://peacock.redvars.com/components/card)             | wc-card-content   | 🟡    |
| Modal                                                                   |                   | 🔴    |
| [Side Sheet](https://peacock.redvars.com/components/side-sheet)         | wc-side-sheet     | 🟡    |

## General

These components are used for general purpose. They include

| Name                                                                                    | Component                 | State |
|-----------------------------------------------------------------------------------------|---------------------------|-------|
| [Avatar](https://peacock.redvars.com/components/avatar)                                 | wc-avatar                 | 🟢    |
| [Button](https://peacock.redvars.com/components/button)                                 | wc-button                 | 🟢    |
| [Button Group](https://peacock.redvars.com/components/button-group)                     | wc-button-group           | 🟢    |
| Calendar                                                                                |                           | 🔴    |
| [Chip](https://peacock.redvars.com/components/chip)                                     | wc-chip                   | 🟡    |
| [Clock](https://peacock.redvars.com/components/clock)                                   | wc-clock                  | 🟢    |
| [Code Highlighter](https://peacock.redvars.com/components/code-highlighter)             | wc-code-highlighter       | 🟢    |
| [Container](https://peacock.redvars.com/components/container)                           | wc-container              | 🟡    |
| [Divider](https://peacock.redvars.com/components/divider)                               | wc-divider                | 🟡    |
| [Empty State](https://peacock.redvars.com/components/empty-state)                       | wc-empty-state            | 🟡    |
| [FAB](https://peacock.redvars.com/components/fab)                                       | wc-fab                    | 🟡    |
| [Flow Designer](https://peacock.redvars.com/components/flow-designer)                   |                           | 🔵    |
| [Icon](https://peacock.redvars.com/components/icon)                                     | wc-icon                   | 🟢    |
| [Icon Button](https://peacock.redvars.com/components/icon-button)                       | wc-icon-button            | 🟡    |
| [Image](https://peacock.redvars.com/components/image)                                   | wc-image                  | 🟡    |
| [Link](https://peacock.redvars.com/components/link)                                     | wc-link                   | 🟢    |
| [Number Counter](https://peacock.redvars.com/components/number-counter)                 | wc-number-counter         | 🟡    |
| Observer                                                                                |                           | 🔴    |
| [Pagination](https://peacock.redvars.com/components/pagination)                         | wc-pagination             | 🟡    |
| Radio Group                                                                             |                           | 🔴    |
| [Segmented Button](https://peacock.redvars.com/components/segmented-button)             | wc-segmented-button       | 🟡    |
| [Segmented Button Group](https://peacock.redvars.com/components/segmented-button)       | wc-segmented-button-group | 🟡    |
| [Slider](https://peacock.redvars.com/components/slider)                                 | wc-slider                 | 🟡    |
| Spoiler                                                                                 |                           | 🔴    |
| Stepper                                                                                 |                           | 🔴    |
| [Switch](https://peacock.redvars.com/components/switch)                                 | wc-switch                 | 🟢    |
| [Table](https://peacock.redvars.com/components/table)                                   | wc-table                  | 🟡    |
| [Tag](https://peacock.redvars.com/components/tag)                                       | wc-tag                    | 🟢    |
| [Tree View](https://peacock.redvars.com/components/tree-view)                           | wc-tree-view              | 🟡    |
| [Tree Node](https://peacock.redvars.com/components/tree-view)                           | wc-tree-node              | 🟡    |

## Charts

These components are used to display data in a graphical format. They include

| Name                                                                            | Component              | State |
|---------------------------------------------------------------------------------|------------------------|-------|
| [Bar Chart](https://peacock.redvars.com/components/chart-bar)                   | wc-chart-bar           | 🟡    |
| [Doughnut Chart](https://peacock.redvars.com/components/chart-doughnut)         | wc-chart-doughnut      | 🟢    |
| [Pie Chart](https://peacock.redvars.com/components/chart-pie)                   | wc-chart-pie           | 🟢    |
| Stacked Bar Chart                                                               | wc-chart-stacked-bar   | 🟡    |


## 📄 License

Peacock is open-source software licensed under the [Apache-2.0 License](LICENSE).

---

Made with 💖 by [shivajivarma](https://shivajivarma.com).

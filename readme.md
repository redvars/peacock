# Peacock
**The foundation for beautiful user interfaces.**

[![Build](https://github.com/redvars/peacock/workflows/Build/badge.svg)](https://github.com/goatui/components/actions?workflow=Build)
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
Visit [https://peacock.redvars.com](https://goatui.com) to view the documentation.

## Getting Started


```html
<!doctype html>
<html lang='en'>
<head>
  <meta charset='utf-8' />
  <meta name='viewport' content='width=device-width' />
  <title>Goat UI Component</title>

  <link href="https://cdn.jsdelivr.net/npm/@redvars/components@3.1.0/dist/assets/styles/tokens.css" rel='stylesheet' />

  <script type='module'
          src='https://cdn.jsdelivr.net/npm/@redvars/components@3.1.0/dist/peacock-loader.js'></script>

  <!-- Default font : Noto Sans and Noto Sans Mono -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@100..900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">


</head>
<body>
<p-avatar name="Shivaji Varma"></p-icon>

</body>
</html>
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

| Name                                                       | Component            | State |
|------------------------------------------------------------|----------------------|-------|
| [Code editor](https://peacock.redvars.com/components/code-editor)   | p-card-editor     | 🟢    |
| Color picker                                               | p-color-picker    | 🔴    |
| [Checkbox](https://peacock.redvars.com/components/checkbox)         | p-checkbox        | 🟢    |
| [Date picker](https://peacock.redvars.com/components/date-picker)   | p-date-picker     | 🟡    |
| Date Time picker                                           | p-datetime-picker | 🔴    |
| [Form control](https://peacock.redvars.com/components/form-control) | p-form-control    | 🟡    |
| File picker                                                | p-file-picker     | 🔴    |
| [HTML editor](https://peacock.redvars.com/components/html-editor)   | p-html-editor     | 🟢    |
| [Input](https://peacock.redvars.com/components/input)               | p-input           | 🟢    |
| [Input URL](https://peacock.redvars.com/components/input-url)       | p-input-url       | 🟢    |
| Month picker                                               | p-month-picker    | 🔴    |
| [Number](https://peacock.redvars.com/components/number)             | p-number          | 🟢    |
| [Select](https://peacock.redvars.com/components/select)             | p-select          | 🟢    |
| [Textarea](https://peacock.redvars.com/components/textarea)         | p-textarea        | 🟢    |
| [Time picker](https://peacock.redvars.com/components/time-picker)   | p-time-picker     | 🟡    |
| [URL input](https://peacock.redvars.com/components/url-input)       | p-url-input.      | 🔴    |
| Week picker                                                | p-week-picker     | 🔴    |

## Navigation

Navigational components are UI elements that help users move around the app or website. They provide users with a clear
and intuitive way to navigate through different sections and pages. Some common examples of navigational components
include menus, tabs, and breadcrumbs.

| Name                                                   | Component       | State |
|--------------------------------------------------------|-----------------|-------|
| [Breadcrumb](https://peacock.redvars.com/components/breadcrumb) | p-breadcrumb | 🟢    |
| [Dropdown](https://peacock.redvars.com/components/dropdown)     | p-dropdown   | 🟡    |
| [Menu](https://peacock.redvars.com/components/menu)             | p-menu       | 🟡    |
| [Tabs](https://peacock.redvars.com/components/tabs)             | p-tabs       | 🟢    |

## Informational

Informational components are UI elements that provide information to users. They communicate important messages,
updates, or instructions within the app or website. Some common examples of informational components include
notifications, tooltips, and progress bars.

| Name                                                                             | Component                 | State |
|----------------------------------------------------------------------------------|---------------------------|-------|
| [Badge](https://peacock.redvars.com/components/badge)                                     | p-badge                | 🟢    |
| [Progress](https://peacock.redvars.com/components/progress)                               | p-progress             | 🟢    |
| [Spinner](https://peacock.redvars.com/components/spinner)                                 | p-spinner              | 🟢    |
| [Tooltip](https://peacock.redvars.com/components/tooltip)                                 | p-tooltip              | 🟢    |
| [Notification](https://peacock.redvars.com/components/notification)                       | p-notification         | 🟢    |
| [Notification Manager](https://peacock.redvars.com/components/notification-manager)       | p-notification-manager | 🟢    |


## Containers

Containers are UI elements that group similar content together, making it easier for users to navigate and scan through
the interface. Examples of common containers include cards, carousels, and accordions, which provide structure and
organization to the content.

| Name                                                 | Component      | State |
|------------------------------------------------------|----------------|-------|
| [Accordion](https://peacock.redvars.com/components/accordion) | p-accordion | 🟢    |
| Card                                                 | p-card      | 🟡    |

## General

These components are used for general purpose. They include

| Name                                                                       | Component                 | State |
|----------------------------------------------------------------------------|---------------------------|-------|
| [Avatar](https://peacock.redvars.com/components/avatar)                             | p-avatar               | 🟢    |
| [Button](https://peacock.redvars.com/components/button)                             | p-button               | 🟢    |
| [Button Group](https://peacock.redvars.com/components/button-group)                 | p-button-group         | 🟢    |
| [Calendar](https://peacock.redvars.com/components/calendar)                         | p-calendar             | 🟢    |
| Card Select                                                                | p-cardselect           | 🔴    |
| [Code Highlighter](https://peacock.redvars.com/components/code-highlighter)         | p-card-highlighter     | 🟢    |
| Column                                                                     | p-col                  | 🔴    |
| [Empty State](https://peacock.redvars.com/components/empty-state)                   | p-empty-state          | 🟡    |
| [Flow Designer ](https://peacock.redvars.com/components/flow-designer)              | p-flow-designer        | 🔵    |
| Grid                                                                       | p-grid                 | 🔴    |
| Group                                                                      | p-group                | 🔴    |
| [Header](https://peacock.redvars.com/components/header)                             | p-header               | 🟢    |
| [Icon](https://peacock.redvars.com/components/icon)                                 | p-icon                 | 🟢    |
| [Link](https://peacock.redvars.com/components/link)                                 | p-link                 | 🟢    |
| [Modal](https://peacock.redvars.com/components/modal)                               | p-modal                | 🟢    |
| [Notification Manager](https://peacock.redvars.com/components/notification-manager) | p-notification-manager | 🟡    |
| Observer                                                                   | p-observer             | 🔴    |
| Pagination                                                                 | p-pagination           | 🔴    |
| Radio Group                                                                | p-radiogroup           | 🔴    |
| Row                                                                        | p-row                  | 🔴    |
| [Slider](https://peacock.redvars.com/components/slider)                             | p-slider               | 🟡    |
| Spoiler                                                                    | p-spoiler              | 🔴    |
| Stepper                                                                    | p-stepper              | 🔴    |
| [Table](https://peacock.redvars.com/components/table)                               | p-table                | 🟡    |
| [Tag](https://peacock.redvars.com/components/tag) / Chip                            | p-tag                  | 🟢    |
| [Text](https://peacock.redvars.com/components/text)                                 | p-text                 | 🟢    |
| [Tree View](https://peacock.redvars.com/components/tree-view)                       | p-tree-view            | 🟡    |
| [Toggle](https://peacock.redvars.com/components/toggle)                             | p-toggle               | 🟢    |

## Charts

These components are used to display data in a graphical format. They include

| Name                                                           | Component           | State |
|----------------------------------------------------------------|---------------------|-------|
| [Doughnut Chart](https://peacock.redvars.com/components/chart-doughnut) | p-chart-doughnut | 🟢    |
| [Pie Chart ](https://peacock.redvars.com/components/chart-pie)          | p-chart-pie      | 🟢    |


## 📄 License

Peacock is open-source software licensed under the [Apache-2.0 License](LICENSE).

---

Made with 💖 by [shivajivarma](https://shivajivarma.com).

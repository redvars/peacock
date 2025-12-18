# Peacock
**The foundation for beautiful user interfaces.**

[![Build](https://github.com/goatui/components/workflows/Build/badge.svg)](https://github.com/goatui/components/actions?workflow=Build)
[![GitHub license](https://img.shields.io/github/license/goatui/components.svg)](/LICENSE)
![Version](https://img.shields.io/npm/v/%40goatui%2Fcomponents)


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

### Script tag

- Put a script tag similar to
  this `<script type="module" src="https://cdn.jsdelivr.net/npm/@goatui/components@2.0.0-0/dist/goatui/goatui.esm.js"></script>`
  in
  the head of your index.html
- Include default font Roboto in the page
- Then you can use the element anywhere in your template, JSX, html etc

```html
<!doctype html>
<html lang='en'>
<head>
  <meta charset='utf-8' />
  <meta name='viewport' content='width=device-width' />
  <title>Goat UI Component</title>

  <!-- include your custom theme variable values, view variable names at https://cdn.jsdelivr.net/npm/@goatui/components@2.0.0-0/dist/goatui/assets/styles/theme.css -->
  <!--link rel="stylesheet" href="/custom-theme.css"></link-->
  <script type='module'
          src='https://cdn.jsdelivr.net/npm/@goatui/components@2.0.0-0/dist/goatui/goatui.esm.js'></script>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital@0;1&family=IBM+Plex+Sans+Condensed:ital@0;1&family=IBM+Plex+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;1,100;1,200;1,300;1,400;1,500;1,600;1,700&family=IBM+Plex+Serif:ital@0;1&display=swap');

    :root {
      --font-family-base: 'IBM Plex Sans', 'Helvetica Neue', Arial, sans-serif;
    }
  </style>
</head>
<body>
<goat-button size='lg' color='primary'>Click me</goat-button>
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
| [Code editor](https://goatui.com/components/code-editor)   | goat-card-editor     | 🟢    |
| Color picker                                               | goat-color-picker    | 🔴    |
| [Checkbox](https://goatui.com/components/checkbox)         | goat-checkbox        | 🟢    |
| [Date picker](https://goatui.com/components/date-picker)   | goat-date-picker     | 🟡    |
| Date Time picker                                           | goat-datetime-picker | 🔴    |
| [Form control](https://goatui.com/components/form-control) | goat-form-control    | 🟡    |
| File picker                                                | goat-file-picker     | 🔴    |
| [HTML editor](https://goatui.com/components/html-editor)   | goat-html-editor     | 🟢    |
| [Input](https://goatui.com/components/input)               | goat-input           | 🟢    |
| [Input URL](https://goatui.com/components/input-url)       | goat-input-url       | 🟢    |
| Month picker                                               | goat-month-picker    | 🔴    |
| [Number](https://goatui.com/components/number)             | goat-number          | 🟢    |
| [Select](https://goatui.com/components/select)             | goat-select          | 🟢    |
| [Textarea](https://goatui.com/components/textarea)         | goat-textarea        | 🟢    |
| [Time picker](https://goatui.com/components/time-picker)   | goat-time-picker     | 🟡    |
| [URL input](https://goatui.com/components/url-input)       | goat-url-input.      | 🔴    |
| Week picker                                                | goat-week-picker     | 🔴    |

## Navigation

Navigational components are UI elements that help users move around the app or website. They provide users with a clear
and intuitive way to navigate through different sections and pages. Some common examples of navigational components
include menus, tabs, and breadcrumbs.

| Name                                                   | Component       | State |
|--------------------------------------------------------|-----------------|-------|
| [Breadcrumb](https://goatui.com/components/breadcrumb) | pc-breadcrumb | 🟢    |
| [Dropdown](https://goatui.com/components/dropdown)     | goat-dropdown   | 🟡    |
| [Menu](https://goatui.com/components/menu)             | goat-menu       | 🟡    |
| [Tabs](https://goatui.com/components/tabs)             | goat-tabs       | 🟢    |

## Informational

Informational components are UI elements that provide information to users. They communicate important messages,
updates, or instructions within the app or website. Some common examples of informational components include
notifications, tooltips, and progress bars.

| Name                                                                             | Component                 | State |
|----------------------------------------------------------------------------------|---------------------------|-------|
| [Badge](https://goatui.com/components/badge)                                     | goat-badge                | 🟢    |
| [Progress](https://goatui.com/components/progress)                               | goat-progress             | 🟢    |
| [Spinner](https://goatui.com/components/spinner)                                 | goat-spinner              | 🟢    |
| [Tooltip](https://goatui.com/components/tooltip)                                 | goat-tooltip              | 🟢    |
| [Notification](https://goatui.com/components/notification)                       | goat-notification         | 🟢    |
| [Notification Manager](https://goatui.com/components/notification-manager)       | goat-notification-manager | 🟢    |


## Containers

Containers are UI elements that group similar content together, making it easier for users to navigate and scan through
the interface. Examples of common containers include cards, carousels, and accordions, which provide structure and
organization to the content.

| Name                                                 | Component      | State |
|------------------------------------------------------|----------------|-------|
| [Accordion](https://goatui.com/components/accordion) | goat-accordion | 🟢    |
| Card                                                 | goat-card      | 🟡    |

## General

These components are used for general purpose. They include

| Name                                                                       | Component                 | State |
|----------------------------------------------------------------------------|---------------------------|-------|
| [Avatar](https://goatui.com/components/avatar)                             | pc-avatar               | 🟢    |
| [Button](https://goatui.com/components/button)                             | goat-button               | 🟢    |
| [Button Group](https://goatui.com/components/button-group)                 | goat-button-group         | 🟢    |
| [Calendar](https://goatui.com/components/calendar)                         | goat-calendar             | 🟢    |
| Card Select                                                                | goat-cardselect           | 🔴    |
| [Code Highlighter](https://goatui.com/components/code-highlighter)         | goat-card-highlighter     | 🟢    |
| Column                                                                     | goat-col                  | 🔴    |
| [Empty State](https://goatui.com/components/empty-state)                   | goat-empty-state          | 🟡    |
| [Flow Designer ](https://goatui.com/components/flow-designer)              | goat-flow-designer        | 🔵    |
| Grid                                                                       | goat-grid                 | 🔴    |
| Group                                                                      | goat-group                | 🔴    |
| [Header](https://goatui.com/components/header)                             | goat-header               | 🟢    |
| [Icon](https://goatui.com/components/icon)                                 | pc-icon                 | 🟢    |
| [Link](https://goatui.com/components/link)                                 | goat-link                 | 🟢    |
| [Modal](https://goatui.com/components/modal)                               | goat-modal                | 🟢    |
| [Notification Manager](https://goatui.com/components/notification-manager) | goat-notification-manager | 🟡    |
| Observer                                                                   | goat-observer             | 🔴    |
| Pagination                                                                 | goat-pagination           | 🔴    |
| Radio Group                                                                | goat-radiogroup           | 🔴    |
| Row                                                                        | goat-row                  | 🔴    |
| [Slider](https://goatui.com/components/slider)                             | goat-slider               | 🟡    |
| Spoiler                                                                    | goat-spoiler              | 🔴    |
| Stepper                                                                    | goat-stepper              | 🔴    |
| [Table](https://goatui.com/components/table)                               | goat-table                | 🟡    |
| [Tag](https://goatui.com/components/tag) / Chip                            | goat-tag                  | 🟢    |
| [Text](https://goatui.com/components/text)                                 | pc-text                 | 🟢    |
| [Tree View](https://goatui.com/components/tree-view)                       | goat-tree-view            | 🟡    |
| [Toggle](https://goatui.com/components/toggle)                             | goat-toggle               | 🟢    |

## Charts

These components are used to display data in a graphical format. They include

| Name                                                           | Component           | State |
|----------------------------------------------------------------|---------------------|-------|
| [Doughnut Chart](https://goatui.com/components/chart-doughnut) | goat-chart-doughnut | 🟢    |
| [Pie Chart ](https://goatui.com/components/chart-pie)          | goat-chart-pie      | 🟢    |


## 📄 License

Peacock is open-source software licensed under the [Apache-2.0 License](LICENSE).

---

Made with 💖 by [shivajivarma](https://shivajivarma.com).

# Skill: Building UI Pages with Peacock LitJS Components

This guide explains how to consume Peacock web components — built on [Lit](https://lit.dev/) — to compose full UI pages in any web project.

---

## 1. Setup

Peacock components are distributed as standard web components (Custom Elements) and work in any HTML page or JavaScript framework.

### Via CDN (no build step required)

```html
<head>
  <!-- Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Mono:wght@100..900&family=Noto+Sans:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet">

  <!-- Peacock styles and components -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@redvars/peacock@latest/dist/assets/styles.css">
  <script type="module" src="https://cdn.jsdelivr.net/npm/@redvars/peacock@latest/dist/peacock-loader.js"></script>
</head>
```

### Via npm

```bash
npm install @redvars/peacock
```

Then import the loader in your entry file:

```js
import '@redvars/peacock/dist/peacock-loader.js';
import '@redvars/peacock/dist/assets/styles.css';
```

Or import individual components:

```js
import { Button, Card, Input } from '@redvars/peacock';
```

---

## 2. Component Basics

Every Peacock component is a Custom Element registered with a `wc-` prefix. Use them directly in HTML or inside any template (JSX, Vue templates, Svelte, etc.).

```html
<wc-button>Click me</wc-button>
<wc-card>Content goes here</wc-card>
<wc-input label="Name"></wc-input>
```

### Properties and Attributes

Peacock components expose both **HTML attributes** (lowercase, kebab-case) and **JavaScript properties** (camelCase). Most properties are reflected as attributes.

```html
<!-- via attribute -->
<wc-button variant="outlined" size="md">Save</wc-button>

<!-- via JS property -->
<script>
  const btn = document.querySelector('wc-button');
  btn.variant = 'filled';
  btn.disabled = true;
</script>
```

### Events

Components dispatch standard `CustomEvent` instances. Listen with `addEventListener` or inline `on*` handlers.

```html
<wc-button id="save-btn">Save</wc-button>
<script>
  document.getElementById('save-btn').addEventListener('click', () => {
    console.log('Saved!');
  });
</script>
```

---

## 3. Component Categories

### Input Controls

Collect data from users.

| Component         | Tag                | Notes                                        |
|-------------------|--------------------|----------------------------------------------|
| Button            | `<wc-button>`      | `variant`: filled, outlined, text, tonal, elevated, neo |
| Checkbox          | `<wc-checkbox>`    | Supports indeterminate state                 |
| Input             | `<wc-input>`       | Text, email, password, etc.                  |
| Number Field      | `<wc-number-field>`| Stepper-style numeric input                  |
| Radio             | `<wc-radio>`       | Group with shared `name` attribute           |
| Search            | `<wc-search>`      | Input with search icon                       |
| Select            | `<wc-select>`      | Single/multi-select with typeahead           |
| Slider            | `<wc-slider>`      | Range input                                  |
| Switch            | `<wc-switch>`      | Toggle on/off                                |
| Textarea          | `<wc-textarea>`    | Multi-line text input                        |
| Date Picker       | `<wc-date-picker>` | Calendar-based date selection                |
| Time Picker       | `<wc-time-picker>` | Clock-based time selection                   |

### Navigation

Help users move through the application.

| Component       | Tag                  | Notes                            |
|-----------------|----------------------|----------------------------------|
| Breadcrumb      | `<wc-breadcrumb>`    | With `<wc-breadcrumb-item>`      |
| Menu            | `<wc-menu>`          | With `<wc-menu-item>`            |
| Tabs            | `<wc-tab-group>`     | With `<wc-tab>` and `<wc-tab-panel>` |
| Toolbar         | `<wc-toolbar>`       | Action bar                       |
| Navigation Rail | `<wc-navigation-rail>`| Vertical nav with icons         |

### Containers

Group and structure related content.

| Component     | Tag                | Notes                              |
|---------------|--------------------|------------------------------------|
| Accordion     | `<wc-accordion>`   | Expandable sections                |
| Bottom Sheet  | `<wc-bottom-sheet>`| Slide-up panel                     |
| Card          | `<wc-card>`        | `variant`: elevated, filled, outlined |
| Side Sheet    | `<wc-side-sheet>`  | Slide-in panel from the side       |

### Informational

Communicate status, progress, and messages.

| Component         | Tag                    | Notes                       |
|-------------------|------------------------|-----------------------------|
| Badge             | `<wc-badge>`           | Numeric or dot indicator    |
| Banner            | `<wc-banner>`          | Page-level alert message    |
| Circular Progress | `<wc-circular-progress>`| Spinner or determinate ring |
| Linear Progress   | `<wc-linear-progress>` | Horizontal progress bar     |
| Notification      | `<wc-notification>`    | Alert / toast message       |
| Skeleton          | `<wc-skeleton>`        | Loading placeholder         |
| Snackbar          | `<wc-snackbar>`        | Brief status message        |
| Spinner           | `<wc-spinner>`         | Loading indicator           |
| Tooltip           | `<wc-tooltip>`         | Contextual hover text       |

### General Purpose

| Component          | Tag                    | Notes                           |
|--------------------|------------------------|---------------------------------|
| Avatar             | `<wc-avatar>`          | User image or initials          |
| Button Group       | `<wc-button-group>`    | Grouped action buttons          |
| Chip               | `<wc-chip>`            | Compact selectable label        |
| Divider            | `<wc-divider>`         | Horizontal or vertical rule     |
| Empty State        | `<wc-empty-state>`     | Placeholder for no-data view    |
| FAB                | `<wc-fab>`             | Floating action button          |
| Icon               | `<wc-icon>`            | Material Symbols icon           |
| Icon Button        | `<wc-icon-button>`     | Icon-only clickable button      |
| Image              | `<wc-image>`           | Responsive image with fallback  |
| Link               | `<wc-link>`            | Styled anchor element           |
| Pagination         | `<wc-pagination>`      | Page navigation controls        |
| Tag                | `<wc-tag>`             | Status or category label        |
| Table              | `<wc-table>`           | Data table with sorting         |
| Sidebar Menu       | `<wc-sidebar-menu>`    | Hierarchical menu               |

### Charts

| Component          | Tag                      |
|--------------------|--------------------------|
| Bar Chart          | `<wc-chart-bar>`         |
| Stacked Bar Chart  | `<wc-chart-stacked-bar>` |
| Doughnut Chart     | `<wc-chart-doughnut>`    |
| Pie Chart          | `<wc-chart-pie>`         |

---

## 4. Building a UI Page — Step-by-Step Examples

### Example A: Simple Login Form

```html
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@redvars/peacock@latest/dist/assets/styles.css">
  <script type="module" src="https://cdn.jsdelivr.net/npm/@redvars/peacock@latest/dist/peacock-loader.js"></script>
  <style>
    body { display: flex; justify-content: center; align-items: center; min-height: 100vh; background: var(--md-sys-color-surface); }
    .login-card { width: 360px; display: flex; flex-direction: column; gap: 1rem; }
  </style>
</head>
<body>
  <wc-card variant="outlined">
    <div class="login-card">
      <h2>Sign In</h2>

      <wc-input id="email" label="Email" type="email" placeholder="you@example.com"></wc-input>
      <wc-input id="password" label="Password" type="password"></wc-input>

      <wc-button id="login-btn" variant="filled">Sign In</wc-button>
      <wc-link href="/forgot-password">Forgot password?</wc-link>
    </div>
  </wc-card>

  <script>
    document.getElementById('login-btn').addEventListener('click', () => {
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      console.log('Login with', email, password);
    });
  </script>
</body>
</html>
```

---

### Example B: Dashboard Page with Cards, Tabs, and Charts

```html
<body>
  <!-- Navigation Toolbar -->
  <wc-toolbar>
    <wc-icon-button slot="start" icon="menu"></wc-icon-button>
    <span slot="title">Dashboard</span>
    <wc-avatar slot="end" label="JS"></wc-avatar>
  </wc-toolbar>

  <!-- KPI Cards -->
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; padding: 1rem;">
    <wc-card variant="filled">
      <wc-number-counter value="1234" label="Total Users"></wc-number-counter>
    </wc-card>
    <wc-card variant="filled">
      <wc-number-counter value="98" label="Active Sessions"></wc-number-counter>
    </wc-card>
    <wc-card variant="filled">
      <wc-number-counter value="42" label="Pending Tasks"></wc-number-counter>
    </wc-card>
  </div>

  <!-- Tabbed Content -->
  <wc-tab-group style="padding: 1rem;">
    <wc-tabs>
      <wc-tab panel="overview">Overview</wc-tab>
      <wc-tab panel="analytics">Analytics</wc-tab>
      <wc-tab panel="reports">Reports</wc-tab>
    </wc-tabs>

    <wc-tab-panel name="overview">
      <wc-chart-bar
        .data=${{
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
          datasets: [{ label: 'Sales', data: [120, 200, 150, 300, 250] }]
        }}
      ></wc-chart-bar>
    </wc-tab-panel>

    <wc-tab-panel name="analytics">
      <wc-chart-doughnut
        .data=${{
          labels: ['Desktop', 'Mobile', 'Tablet'],
          datasets: [{ data: [55, 35, 10] }]
        }}
      ></wc-chart-doughnut>
    </wc-tab-panel>

    <wc-tab-panel name="reports">
      <wc-empty-state icon="description" headline="No Reports Yet" description="Generate a report to view it here.">
        <wc-button slot="action" variant="filled">Generate Report</wc-button>
      </wc-empty-state>
    </wc-tab-panel>
  </wc-tab-group>
</body>
```

---

### Example C: Data Table with Search and Pagination

```html
<div style="display: flex; flex-direction: column; gap: 1rem; padding: 1rem;">

  <!-- Search bar -->
  <wc-search id="search" placeholder="Search users..."></wc-search>

  <!-- Table -->
  <wc-table id="users-table"></wc-table>

  <!-- Pagination -->
  <wc-pagination id="pagination" total="100" page-size="10"></wc-pagination>
</div>

<script>
  const table = document.getElementById('users-table');
  const search = document.getElementById('search');
  const pagination = document.getElementById('pagination');

  const users = [
    { name: 'Alice', role: 'Admin', status: 'Active' },
    { name: 'Bob', role: 'Editor', status: 'Inactive' },
    // ... more rows
  ];

  table.columns = [
    { key: 'name', label: 'Name' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
  ];
  table.data = users;

  search.addEventListener('change', (e) => {
    const query = e.detail.value.toLowerCase();
    table.data = users.filter(u => u.name.toLowerCase().includes(query));
  });

  pagination.addEventListener('change', (e) => {
    console.log('Page changed to', e.detail.page);
    // re-fetch or slice data accordingly
  });
</script>
```

---

### Example D: Settings Form with Select, Switch, and Accordion

```html
<wc-card variant="outlined" style="max-width: 600px; margin: 2rem auto;">
  <h2>Settings</h2>

  <wc-accordion>
    <div slot="header">Appearance</div>
    <div slot="content" style="display: flex; flex-direction: column; gap: 1rem;">
      <wc-select id="theme-select" label="Theme" placeholder="Choose theme...">
        <wc-option value="light">Light</wc-option>
        <wc-option value="dark">Dark</wc-option>
        <wc-option value="system">System Default</wc-option>
      </wc-select>

      <wc-switch id="compact-mode" label="Compact Mode"></wc-switch>
    </div>
  </wc-accordion>

  <wc-accordion>
    <div slot="header">Notifications</div>
    <div slot="content" style="display: flex; flex-direction: column; gap: 0.75rem;">
      <wc-switch label="Email notifications"></wc-switch>
      <wc-switch label="Push notifications" checked></wc-switch>
      <wc-switch label="Weekly digest"></wc-switch>
    </div>
  </wc-accordion>

  <wc-divider></wc-divider>

  <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
    <wc-button variant="text">Cancel</wc-button>
    <wc-button variant="filled">Save Changes</wc-button>
  </div>
</wc-card>

<script>
  document.getElementById('theme-select').addEventListener('change', (e) => {
    console.log('Theme changed:', e.detail.value);
  });
</script>
```

---

## 5. Theming & Customization

Peacock uses CSS custom properties (CSS variables) for theming. Override them at the `:root` level or on specific elements.

```css
:root {
  /* Primary brand color */
  --md-sys-color-primary: #6750a4;
  --md-sys-color-on-primary: #ffffff;

  /* Surface and background */
  --md-sys-color-surface: #fffbfe;
  --md-sys-color-background: #fffbfe;

  /* Card customization */
  --card-padding: 1.5rem;
  --card-shape: 16px;

  /* Button customization */
  --button-container-shape: 20px;
  --filled-button-container-color: #6750a4;
}
```

### Per-component CSS Properties

Components also expose their own tokens. See each component's documentation for the full list.

```css
/* Customize a specific card instance */
wc-card.hero-card {
  --card-padding: 2rem;
  --card-shape: 24px;
}
```

---

## 6. Using in JavaScript Frameworks

### React (with JSX)

```tsx
import '@redvars/peacock/dist/peacock-loader.js';

export function LoginForm() {
  const handleLogin = () => {
    const email = (document.getElementById('email') as any).value;
    console.log('Email:', email);
  };

  return (
    <wc-card variant="outlined">
      <wc-input id="email" label="Email" type="email" />
      <wc-button variant="filled" onClick={handleLogin}>Sign In</wc-button>
    </wc-card>
  );
}
```

> **Note:** For full React type support, declare the custom elements in a `custom-elements.d.ts` file or use the `@lit-labs/react` wrapper.

### Vue 3

```vue
<template>
  <wc-card variant="outlined">
    <wc-input label="Username" v-model="username" />
    <wc-button variant="filled" @click="submit">Login</wc-button>
  </wc-card>
</template>

<script setup>
import '@redvars/peacock/dist/peacock-loader.js';
import { ref } from 'vue';

const username = ref('');
function submit() {
  console.log('Username:', username.value);
}
</script>
```

### Lit (in another Lit component)

```ts
import { LitElement, html } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@redvars/peacock/dist/peacock-loader.js';

@customElement('my-page')
export class MyPage extends LitElement {
  @state() count = 0;

  render() {
    return html`
      <wc-card variant="elevated">
        <p>Count: ${this.count}</p>
        <wc-button @click=${() => this.count++}>Increment</wc-button>
      </wc-card>
    `;
  }
}
```

---

## 7. Slots

Many Peacock components use **named slots** to let you inject custom content into specific regions.

```html
<!-- wc-toolbar slots: start, title, end -->
<wc-toolbar>
  <wc-icon-button slot="start" icon="menu"></wc-icon-button>
  <span slot="title">My App</span>
  <wc-avatar slot="end" label="JD"></wc-avatar>
</wc-toolbar>

<!-- wc-button icon slot -->
<wc-button variant="filled">
  Save
  <wc-icon slot="icon">save</wc-icon>
</wc-button>

<!-- wc-empty-state action slot -->
<wc-empty-state headline="Nothing here yet">
  <wc-button slot="action" variant="tonal">Create New</wc-button>
</wc-empty-state>
```

---

## 8. Accessibility

Peacock components are built with accessibility in mind:

- Semantic HTML elements (`<button>`, `<a>`, `<input>`) are used inside shadow DOM where applicable.
- ARIA attributes are set and reflected automatically (e.g. `aria-disabled`, `aria-expanded`).
- All interactive components support keyboard navigation.
- Focus rings are visible and customizable via `<wc-focus-ring>`.

Ensure you always provide meaningful labels for form controls:

```html
<!-- Use the label attribute -->
<wc-input label="Email address" type="email"></wc-input>

<!-- Or use aria-label for icon-only controls -->
<wc-icon-button aria-label="Close dialog" icon="close"></wc-icon-button>
```

---

## 9. Further Resources

- **Documentation:** [https://peacock.redvars.com](https://peacock.redvars.com)
- **npm:** [@redvars/peacock](https://www.npmjs.com/package/@redvars/peacock)
- **Source:** [github.com/redvars/peacock](https://github.com/redvars/peacock)
- **Component source:** [`components/src/`](./src/)
- **Component list:** [`components/readme.md`](./readme.md)

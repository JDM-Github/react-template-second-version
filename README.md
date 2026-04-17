README

PROJECT TITLE
Modern React Component Library

---

OVERVIEW
A production-ready React component library built with TypeScript, Tailwind CSS, and CSS variables. It provides a full set of UI primitives, advanced form handling, data tables, notifications, and a responsive application layout with dark and light mode support.

---

FEATURES

* Fully custom component system with no external UI libraries
* Dark and light mode using CSS variables
* Comprehensive UI primitives: buttons, cards, dialogs, sheets, popovers, dropdowns, tabs, menus, and more
* Advanced dynamic form system with validation and configurable layouts
* Feature-rich data table with sorting, filtering, pagination, row selection, expandable rows, and export options
* Toast notification system with success, error, and async process states
* Responsive layout with sidebar, header, and mobile navigation
* Fully typed with TypeScript for scalability and safety

---

TECH STACK

* React 19 with React Router DOM
* TypeScript
* Tailwind CSS with tw-animate-css
* Framer Motion for animations
* Lucide React for icons
* Vite as the build tool

---

GETTING STARTED

1. Clone the repository

git clone https://github.com/your-username/your-repo.git
cd your-repo

2. Install dependencies

npm install

3. Start development server

npm run dev

Open the application at:
http://localhost:5173

4. Build for production

npm run build

---

THEMING SYSTEM

The application uses CSS custom properties defined in src/index.css. Themes are controlled by toggling a class on the html element.

Example structure:

:root, .dark
--color-text
--color-bg
--color-surface
--color-border
--color-accent

.light
--color-text
--color-bg

Theme switching is handled through a ThemeToggle component.

---

COMPONENT SHOWCASE

A full dashboard is included in:
src/pages/root/dashboard.tsx

This page demonstrates all components in real usage and serves as a reference implementation.

---

PROJECT STRUCTURE

src/
components/
ui/               Core UI primitives (buttons, cards, dialogs, etc.)
shared/           Higher-level components (data table, forms, notifications)
theme-toggle.tsx  Theme switcher component

contexts/
ThemeProvider
RouteProvider

hooks/
Custom React hooks (e.g., useMediaQuery)

layout/
Layout components (header, sidebar, footer)

lib/
Utility functions and helpers

pages/root/
Dashboard and component showcase pages

routes/
Application routing configuration

index.css
Global styles and CSS variables

---

KEY COMPONENTS

DynamicForm

A schema-driven form system supporting multiple input types, validation, sections, and flexible rendering modes.

Example usage:

fields =
name: Name, type: text, required: true
email: Email, type: email
role: Role, type: select, options: [...]
bio: Bio, type: textarea, section: Details

DynamicForm
fields={fields}
onSubmit={handleSubmit}
actionType=CREATE

DataTable

A feature-rich table supporting:

* Sorting
* Filtering
* Pagination
* Row selection
* Expandable rows
* Export functionality
* Custom row actions

Example usage:

DataTable
columns={columns}
data={data}
selectable
expandable
renderActions=(row) => Button Edit

Notifications

Toast system for user feedback and async operations.

Example usage:

toast.success(Saved)
toast.error(Something went wrong)
toast.process
task: async operation
loadingMessage: Processing

---

CONTRIBUTING

1. Fork the repository
2. Create a feature branch
3. Commit changes with clear messages
4. Push to your branch
5. Open a pull request

---

LICENSE

MIT License. See LICENSE file for details.

---

ACKNOWLEDGEMENTS

Inspired by modern UI system design principles and component-driven architecture. Built entirely from scratch.

# UI System README

This frontend now follows one shared editorial theme across the public website and CRM screens. The goal is to keep the Stitch-inspired visual direction consistent while making the code easier to extend.

## Theme direction

- Style: warm premium fashion editorial
- Shared experience: landing page, auth, customer dashboard, and admin pages all use the same tokens and surface patterns
- Global control: colors, spacing feel, radii, and shadows are centralized in `src/index.css`

## Global CSS

Primary design tokens live in `src/index.css` under `:root`.

Main variables:

- `--color-bg-page`, `--color-bg-canvas`, `--color-bg-card`, `--color-bg-sidebar`, `--color-bg-panel`
- `--color-text-primary`, `--color-text-secondary`, `--color-text-muted`, `--color-text-accent`, `--color-text-ivory`
- `--color-border-soft`, `--color-border-strong`
- `--color-btn-primary`, `--color-btn-hover`, `--color-btn-secondary`
- `--shadow-soft`, `--shadow-float`
- `--radius-sm`, `--radius-md`, `--radius-lg`

Reusable CSS utility classes are also defined there:

- `.ui-shell`: page background and overall atmosphere
- `.ui-container`: shared content width and horizontal padding
- `.ui-surface`: standard card/panel wrapper
- `.ui-panel-dark`: dark premium surface
- `.ui-label`: shared field label style
- `.ui-input`: shared input, select, and textarea style
- `.ui-eyebrow`: uppercase small heading style
- `.ui-table`: shared table styling

If you want to change the full project look, start with `src/index.css` first.

## Tailwind mapping

`tailwind.config.js` maps the CSS variables into utility names so the whole app can use the same palette:

- `bg-page`, `bg-canvas`, `bg-card`, `bg-sidebar`, `bg-panel`, `bg-input`, `bg-charcoal`
- `text-ink`, `text-secondary`, `text-muted`, `text-accent`, `text-ivory`
- `border-line`
- `shadow-soft`, `shadow-float`
- `rounded-card`, `rounded-luxe`

## Shared content

Visual content and landing/auth copy now live in:

- `src/data/themeContent.js`

This keeps recurring imagery and campaign text out of page components.

## Reusable components

Reusable UI parts are grouped under `src/components/common/`.

Main components:

- `Button.jsx`: primary and secondary actions
- `Input.jsx`: simple shared text input
- `FormField.jsx`: reusable input/select/textarea wrapper
- `PageHeader.jsx`: standard page intro block
- `SurfaceCard.jsx`: shared panel wrapper
- `MetricCard.jsx`: dashboard metric tile
- `StatusBanner.jsx`: success/error/info state message
- `EmptyState.jsx`: empty list placeholder

Special helper:

- `PasswordToggleButton.jsx`: auth password visibility toggle

## Frontend structure

High-level structure:

- `src/layouts/`
  - `AuthLayout.jsx`: shared auth shell
  - `DashboardLayout.jsx`: shared CRM sidebar and content shell
- `src/pages/`
  - public: `LandingPage.jsx`
  - auth: `Login.jsx`, `Signup.jsx`
  - customer: `Dashboard.jsx`, `Profile.jsx`, `Addresses.jsx`
  - admin: `AdminUsers.jsx`, `AdminUserForm.jsx`, `Categories.jsx`, `Brands.jsx`
- `src/components/common/`
  - shared visual building blocks
- `src/data/`
  - shared theme copy and image sources
- `src/services/`
  - API calls
- `src/utils/`
  - auth storage helpers

## Active UI flow

1. `/` shows the public editorial landing page
2. `/login` and `/signup` use the same shared auth shell
3. `/dashboard`, `/profile`, `/addresses` use the customer CRM shell
4. `/admin/*` pages use the same CRM shell with admin navigation

## Notes

- Some older experimental pages like `LoginPage.jsx` and `RegisterPage.jsx` still exist in the repo but are not used by the active routes.
- Because the Stitch project contents were not directly accessible from this environment, the implementation standardizes the current premium theme already present in the project and applies it consistently end-to-end.

## How to extend the UI

- Add or change global design tokens in `src/index.css`
- Prefer creating or extending reusable common components before styling a page directly
- Keep repeatable content in `src/data/themeContent.js`
- When adding a new page, wrap it with `PageHeader` and `SurfaceCard` where possible
- Reuse `FormField`, `StatusBanner`, and `Button` for forms and actions

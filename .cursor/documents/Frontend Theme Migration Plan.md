# "Future Purple" Theme Migration Plan

This plan details the steps to migrate the frontend project to the "Future Purple" theme, including variable setup, theme switching, component validation, and testing.

## Phase 1: Theme System Foundation
**Objective**: Establish the CSS variable system and Tailwind configuration.

1.  **Update CSS Variables (`frontend/src/assets/tailwind.css`)**:
    -   Convert provided Hex colors to HSL for compatibility with Tailwind's opacity modifiers.
    -   **Primary**: `#7c3aed` (Violet 600) -> `262.1 83.3% 57.8%`
    -   **Secondary**: `#8b5cf6` (Violet 500) -> `258.3 89.5% 66.3%`
    -   **Background**: `#ffffff` -> `0 0% 100%` (Light) / `262 80% 10%` (Dark - derived deep purple)
    -   **Surface**: `#faf5ff` (Purple 50) -> `270 50% 98%`
    -   **TextPrimary**: `#1e1b4b` (Indigo 950) -> `243 75% 20%`
    -   **TextSecondary**: `#6b7280` (Gray 500) -> `220 8.9% 46.1%`
    -   **Purple Scale**: Define `purple-50` to `purple-900` custom variables for gradients/states.

2.  **Configure Tailwind (`frontend/tailwind.config.js`)**:
    -   Map the new CSS variables to Tailwind utility classes.
    -   Add `purple-50` ~ `purple-900` to `theme.extend.colors`.
    -   Ensure `darkMode: 'class'` is active.

3.  **Create SCSS Mixins (Optional/If needed)**:
    -   Since the project uses Tailwind primarily, we will focus on Tailwind utilities. If SCSS is used in specific files, we will create a `_mixins.scss` for contrast checks, but standardizing on Tailwind classes like `text-primary-foreground` is preferred.

## Phase 2: Theme Switching & Persistence
**Objective**: Allow dynamic theme switching and save user preference.

1.  **Create Composable (`frontend/src/composables/useTheme.ts`)**:
    -   Implement logic to toggle `.dark` class on `<html>`.
    -   Listen to system preference changes.
    -   Read/Write to `localStorage` (key: `theme-preference`).

2.  **Develop Toggle Component (`frontend/src/components/ThemeToggle.vue`)**:
    -   Create a UI component (likely a button with Sun/Moon icons) using the new theme colors.
    -   Integrate `useTheme` for functionality.

## Phase 3: Component Verification (Storybook)
**Objective**: Visual validation of the new theme.

1.  **Install Storybook**:
    -   Run `npx storybook@latest init` in `frontend/`.
    -   Configure it to load `frontend/src/assets/tailwind.css`.

2.  **Create Stories**:
    -   **Button**: Show Primary, Secondary, Ghost variants with hover states.
    -   **Inputs**: Verify focus rings (using the new purple ring color).
    -   **Cards**: Check surface colors and text contrast.
    -   **Charts**: Create a mock chart story to verify data visualization colors.

## Phase 4: Testing & Quality Assurance
**Objective**: Ensure regression-free migration.

1.  **Visual Regression Setup**:
    -   Install `chromatic` (works seamlessly with Storybook).
    -   Add a CI script (or manual script) to run regression tests.

2.  **Migration Checklist Output**:
    -   Generate a `MIGRATION_CHECKLIST.md` file containing:
        -   List of hardcoded hex values found in the codebase that need replacement.
        -   SEO Meta tag updates (`theme-color`).
        -   Chart.js/ECharts config updates to use CSS variables.
        -   Accessibility (WCAG) contrast checks.

## Execution Order
1.  **Analyze**: Scan for hardcoded colors (Completed).
2.  **Implement**: CSS Variables & Tailwind Config.
3.  **Develop**: Theme Switcher & Logic.
4.  **Setup**: Storybook & Stories.
5.  **Document**: Migration Checklist.

# Future Purple Theme Migration Checklist

This document outlines the remaining steps to fully migrate the frontend project to the "Future Purple" theme.

## 1. Hardcoded Color Replacement
The following files contain hardcoded hex colors (e.g., `#667eea`, `#4299e1`) that need to be replaced with Tailwind CSS classes or CSS variables (e.g., `text-primary`, `bg-purple-100`).

- [ ] `frontend/src/views/auth/LoginPage.vue`
- [ ] `frontend/src/views/auth/RegisterPage.vue`
- [ ] `frontend/src/views/auth/ProfilePage.vue`
- [ ] `frontend/src/views/chat/ChatPage.vue`
- [ ] `frontend/src/views/home/HomePage.vue`
- [ ] `frontend/src/views/admin/AdminSystemPage.vue`
- [ ] `frontend/src/views/agent/AgentChatPage.vue`
- [ ] `frontend/src/views/agent/AgentCapabilitiesPage.vue`
- [ ] `frontend/src/views/agent/AgentFormPage.vue`
- [ ] `frontend/src/views/agent/AgentWidgetPage.vue`
- [ ] `frontend/src/views/agent/MyAgentsPage.vue`
- [ ] `frontend/src/views/knowledge/KnowledgePage.vue`
- [ ] `frontend/src/components/chat/VoiceInput.vue`
- [ ] `frontend/src/components/chat/MessageItem.vue`
- [ ] `frontend/src/components/chat/ChatHistoryDrawer.vue`
- [ ] `frontend/src/components/chat/XSender.vue`

**Action**: Replace hex codes with:
-   Primary Purple: `text-primary` / `bg-primary`
-   Secondary Purple: `text-secondary` / `bg-secondary`
-   Light Purple Backgrounds: `bg-purple-50` or `bg-muted`
-   Text Colors: `text-foreground` or `text-muted-foreground`

## 2. Global Configuration
- [ ] **SEO Meta Tag**: Update `theme-color` in `frontend/index.html`.
    ```html
    <meta name="theme-color" content="#7c3aed">
    ```
- [ ] **Chart Libraries**: If using ECharts or Chart.js, configure the global theme to use the new color palette:
    ```javascript
    const purpleTheme = ['#7c3aed', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe'];
    ```

## 3. Accessibility (A11y)
- [ ] **Contrast Check**: Verify that `text-primary-foreground` on `bg-primary` meets WCAG AA (4.5:1).
    -   Current: White on Violet-600 (Passes).
- [ ] **Focus States**: Ensure focus rings use the new purple ring color (`ring-primary`).

## 4. Visual Regression Testing
- [ ] **Chromatic Setup**:
    1.  Sign up at [chromatic.com](https://www.chromatic.com/).
    2.  Get your project token.
    3.  Run: `npx chromatic --project-token=<your-token>`
    4.  Or use the script: `pnpm run chromatic` (requires `CHROMATIC_PROJECT_TOKEN` env var).

## 5. Theme Switching
- [ ] Verify `localStorage` persistence works across reloads.
- [ ] Verify system preference sync works (toggle OS dark mode).

## 6. Storybook
- [ ] Run `pnpm storybook` to view the new theme in action.
- [ ] Check `ThemeToggle` story.
- [ ] Check `Button` variants in both Light and Dark modes.

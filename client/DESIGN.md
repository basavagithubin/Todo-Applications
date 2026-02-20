# Design System & UI Documentation

## Overview
The application has been redesigned to follow a modern, professional aesthetic using a clean layout, consistent typography, and a refined color palette. The implementation relies heavily on Tailwind CSS utility classes, supplemented by a few semantic component classes defined in `index.css`.

## Typography
- **Font Family**: Inter (Google Fonts), falling back to system sans-serif.
- **Scale**: Uses Tailwind's default type scale.
- **Weights**: 
  - Regular (400) for body text.
  - Medium (500) for buttons and navigation.
  - Semibold (600) for headings and emphasized text.
  - Bold (700) for major headings.

## Color Palette
The design uses a semantic color system mapped to Tailwind colors:
- **Primary**: Indigo (`indigo-600` for light, `indigo-500` for dark).
- **Background**: White / Slate-50 (`bg-white` / `bg-gray-50`) for light mode, Slate-900 (`bg-gray-900`) for dark mode.
- **Panel/Surface**: White (`bg-white`) / Slate-800 (`bg-gray-800`).
- **Text**: Slate-900 (`text-gray-900`) / Slate-50 (`text-white`).
- **Muted**: Slate-500 (`text-gray-500`) / Slate-400 (`text-gray-400`).
- **Success**: Green (`green-600` / `green-500`).
- **Warning**: Amber (`amber-600` / `amber-500`).
- **Danger**: Red (`red-600` / `red-500`).

## Layout
The application uses a responsive shell layout:
- **Desktop**: 
  - Sidebar (256px fixed width) for navigation.
  - Header (sticky top) for page title, theme toggle, and user profile.
  - Main Content Area (scrollable).
- **Mobile**:
  - Header (sticky top).
  - Bottom Navigation Bar (`MobileNav`) for primary actions.
  - Sidebar is hidden.

## Component Library (CSS Classes)
Defined in `index.css` using `@apply`:

### Buttons (`.btn`)
- Base: `inline-flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-all duration-200`.
- Variants:
  - `.btn-primary`: Indigo background, white text.
  - `.btn-ghost`: Transparent background, hover effect.
  - `.btn-danger`: Red background (light), red text.

### Inputs (`.input`)
- Base: `w-full px-4 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--panel)] focus:ring-1 focus:ring-[var(--primary)]`.

### Cards (`.card`)
- Base: `bg-[var(--panel)] border border-[var(--border)] rounded-2xl p-6 shadow-sm hover:shadow-md`.

### Badges (`.badge`)
- Base: `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border`.
- Variants: `.badge-success`, `.badge-warning`, `.badge-danger`.

## Responsive Grids
- **Dashboard KPIs**: 1 column (mobile) -> 2 columns (tablet) -> 4 columns (desktop).
- **Todo Grid**: 1 column (mobile) -> 2 columns (small tablet) -> 3 columns (large tablet/laptop) -> 4 columns (large desktop).

## Accessibility
- Focus rings are enabled for keyboard navigation.
- Semantic HTML elements (`nav`, `main`, `header`, `aside`) are used.
- Color contrast ratios meet WCAG AA standards (using Slate-500+ on white/slate-900).

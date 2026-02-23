# Release Notes - v1.1.0

## New Features

### 1. Todo Reminders
- **Functionality**: Users can now set date/time reminders for individual tasks.
- **UI Interaction**: Added a bell icon to each todo card.
  - **Set Reminder**: Click the bell icon to open a prompt.
  - **Visual Indicator**: The icon turns green (`primary-500`) when a reminder is active.
  - **Tooltip**: Hovering over the icon displays the scheduled reminder time.
- **Backend Support**: 
  - New `reminder` field in Todo schema.
  - Dedicated API endpoint: `PATCH /api/todos/:id/reminder`.

### 2. Enhanced Layout & Spacing
- **Detached Sidebar**: The navigation sidebar is now visually separated from the main content, creating a modern "floating card" aesthetic.
- **Improved Spacing System**:
  - Consistent `gap-6` (24px) between major layout sections.
  - Increased padding and margins (`p-6`, `my-4`) for a cleaner, less cluttered interface.
  - Standardized touch targets to minimum `48px` height for better accessibility on touch devices.
- **Search & Filter Redesign**:
  - Restructured the top toolbar into a responsive column/row layout.
  - Increased input and button heights to `h-12` for visual alignment.

### 3. Visual Polish
- **Glassmorphism 2.0**: Refined glass panel styles with smoother borders and shadows.
- **Theme Consistency**: All interactive elements now strictly follow the primary (Green) and secondary (Orange) color palette.
- **Text Truncation**: Improved handling of long task titles with intelligent wrapping and truncation to prevent layout breakage.

## Technical Improvements

- **CSS Architecture**: 
  - Centralized layout gaps in `index.css` using the `.layout` utility.
  - Removed rigid `h-screen` constraints in favor of `min-h-screen` for better scrolling behavior.
- **API Updates**:
  - Updated `todo.controller.js` to handle reminder updates safely.
  - Added validation middleware for reminder dates (`isISO8601`).

## Bug Fixes
- Fixed overlapping issues between Edit button and Priority badge on mobile views.
- Resolved horizontal scrolling issues caused by sidebar width constraints.

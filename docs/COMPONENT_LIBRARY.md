# UI Component Library

This document showcases the reusable UI components and design patterns used in the TodoPro application.

## Design Tokens

### Colors
- **Primary (Green)**: `#00C853` (Success, Growth, Action)
- **Secondary (Orange)**: `#FF6D00` (Energy, Attention, Highlights)
- **Background**: White / Slate-900 (Dark Mode)
- **Panel**: Glassmorphism (Blur 12px, White/10-70%)

### Typography
- **Font**: Inter (Sans-serif)
- **Headings**: Extra Bold / Black
- **Body**: Regular / Medium

## Components

### 1. Buttons

```jsx
// Primary Action
<button className="btn btn-primary">
  Save Changes
</button>

// Secondary/Accent
<button className="btn btn-secondary">
  Upgrade
</button>

// Ghost/Tertiary
<button className="btn btn-ghost">
  Cancel
</button>

// Danger
<button className="btn btn-danger">
  Delete
</button>
```

### 2. Cards (Glassmorphism)

```jsx
<div className="glass-panel p-6 rounded-3xl hover:-translate-y-1 transition-all duration-300">
  <h3 className="text-xl font-bold">Card Title</h3>
  <p className="text-gray-500">Card content goes here...</p>
</div>
```

### 3. Inputs

```jsx
<input 
  className="input" 
  placeholder="Enter text..." 
/>
```

### 4. Badges

```jsx
// Status Badges
<span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700">
  Completed
</span>

<span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-700">
  Pending
</span>
```

### 5. Progress Bars

```jsx
<div className="h-4 bg-gray-100 rounded-full overflow-hidden">
  <div 
    className="h-full bg-gradient-to-r from-primary-500 to-secondary-500" 
    style={{ width: '75%' }} 
  />
</div>
```

### 6. Animations

- `animate-fade-in`: Smooth entry opacity
- `animate-slide-in-right`: Slide from right
- `animate-float`: Floating background shapes
- `animate-pulse`: Subtle glowing effects

## Usage Guidelines

1. **Glassmorphism**: Always use `glass-panel` for content containers to maintain the depth hierarchy.
2. **Spacing**: Use multipliers of 4 (e.g., `p-4`, `gap-6`, `my-8`).
3. **Dark Mode**: Use `dark:` variants for all colors. Text should be `text-gray-800` (light) and `text-white` or `text-gray-200` (dark).

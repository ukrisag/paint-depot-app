# Design System Components Reference

## Component Hierarchy

```
Design System
├── Forms
│   ├── Input Components
│   │   ├── Floating Label Input
│   │   │   ├── States: Default, Focus, Error, Success
│   │   │   ├── Icons: Error, Success
│   │   │   └── Messages: Error, Helper
│   │   ├── Password Input with Toggle
│   │   │   └── Toggle Button: Show/Hide
│   │   ├── Text Input
│   │   ├── Email Input
│   │   ├── Number Input
│   │   └── Phone Input
│   │
│   ├── Selection Components
│   │   ├── Checkbox
│   │   │   ├── States: Unchecked, Checked, Disabled
│   │   │   └── Animation: Checkmark
│   │   └── Radio Button
│   │       ├── States: Unselected, Selected, Disabled
│   │       └── Animation: Scale
│   │
│   ├── File Upload
│   │   ├── States: Default, Hover, Dragover
│   │   ├── Icon: Upload cloud
│   │   └── Text: Instructions
│   │
│   └── Layouts
│       ├── Form Group (single field wrapper)
│       ├── Form Grid (vertical stack)
│       ├── Form Grid 2 (2-column responsive)
│       └── Form Section (card container)
│
└── Buttons
    ├── Button Variants
    │   ├── Primary (gradient purple-pink)
    │   ├── Secondary (outlined)
    │   ├── Tertiary (soft background)
    │   ├── Danger (red gradient)
    │   ├── Success (green gradient)
    │   └── Icon (circular)
    │
    ├── Button Sizes
    │   ├── Small (btn-sm)
    │   ├── Default
    │   └── Large (btn-lg)
    │
    ├── Button Modifiers
    │   ├── Block (full width)
    │   ├── Loading (spinner)
    │   └── Disabled
    │
    └── Button Features
        ├── Icon Support
        ├── Ripple Effect
        ├── Hover Glow
        └── Active State
```

---

## Component States Matrix

### Input Field States

| State | Border Color | Icon | Message | Animation |
|-------|-------------|------|---------|-----------|
| Default | Gray gradient | None | None | None |
| Focus | Purple-pink gradient | None | None | Slide up (2px) |
| Error | Red gradient | Exclamation | Error text | Shake |
| Success | Green gradient | Checkmark | None | None |
| Disabled | Gray solid | None | None | None |

### Button States

| State | Background | Cursor | Opacity | Transform |
|-------|-----------|--------|---------|-----------|
| Default | Full color | Pointer | 100% | None |
| Hover | Full color | Pointer | 100% | translateY(-2px) |
| Active | Full color | Pointer | 100% | scale(0.97) |
| Loading | Full color | Default | 100% | None |
| Disabled | Full color | Not-allowed | 60% | None |

### Checkbox States

| State | Border | Background | Checkmark | Animation |
|-------|--------|-----------|-----------|-----------|
| Unchecked | Gray | White | None | None |
| Checked | None | Purple-pink gradient | White | Checkmark draw |
| Hover | Purple | White | None | Ring appear |
| Disabled | Gray | Gray light | Gray | None |

---

## Color Usage Guide

### Primary Gradient (Purple to Pink)

**Hex Codes:**
- Start: `#a855f7`
- End: `#ec4899`

**CSS:**
```css
background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
```

**Used In:**
- Primary buttons
- Input focus borders
- Checkboxes when checked
- Radio buttons when selected
- Section titles
- Gradient text
- Active states

**Do:**
- Use for primary actions
- Use for focus states
- Use for selected states
- Use for CTAs

**Don't:**
- Use for errors
- Use for disabled states
- Overuse in small text

---

### Success Gradient (Green)

**Hex Codes:**
- Start: `#10b981`
- End: `#059669`

**CSS:**
```css
background: linear-gradient(135deg, #10b981 0%, #059669 100%);
```

**Used In:**
- Success buttons
- Valid input borders
- Success icons
- Confirmation states

**Do:**
- Use for positive actions
- Use for completed states
- Use for validation success

**Don't:**
- Use for errors
- Use for warnings
- Use for neutral actions

---

### Danger Gradient (Red)

**Hex Codes:**
- Start: `#ef4444`
- End: `#dc2626`

**CSS:**
```css
background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
```

**Used In:**
- Danger buttons
- Error input borders
- Error icons
- Delete actions
- Critical warnings

**Do:**
- Use for destructive actions
- Use for errors
- Use for critical states

**Don't:**
- Use for success
- Use for neutral actions
- Overuse - causes alarm

---

### Soft Background Gradient

**Hex Codes:**
- Start: `#f3e8ff` (Purple 100)
- End: `#fce7f3` (Pink 100)

**CSS:**
```css
background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%);
```

**Used In:**
- Tertiary buttons
- Icon buttons
- File upload areas
- Hover states
- Subtle backgrounds

**Do:**
- Use for secondary UI elements
- Use for subtle emphasis
- Use for hover states

**Don't:**
- Use for primary actions
- Use where high contrast needed

---

## Typography Scale

### Headings

```html
<!-- H1 - Page Titles -->
<h1 class="text-4xl font-bold gradient-text">
  Main Page Title
</h1>

<!-- H2 - Section Titles -->
<h2 class="form-section-title">
  Section Title
</h2>

<!-- H3 - Subsection Titles -->
<h3 class="text-lg font-semibold text-gray-700">
  Subsection Title
</h3>
```

### Body Text

```html
<!-- Regular Text -->
<p class="text-gray-600">
  Regular paragraph text
</p>

<!-- Small Text / Helper -->
<p class="text-sm text-gray-500">
  Helper text or descriptions
</p>

<!-- Form Labels -->
<label class="form-label">
  Field Label
</label>
```

---

## Spacing System

### Form Spacing

```
Form Section
├── Padding: 2rem (32px)
├── Margin Bottom: 1.5rem (24px)
└── Border Radius: 1rem (16px)

Form Group
├── Margin Bottom: 1.5rem (24px)
└── Position: Relative

Form Grid
└── Gap: 1.5rem (24px)

Form Grid 2
└── Gap: 1.5rem (24px)
```

### Button Spacing

```
Button
├── Padding: 0.75rem 1.5rem (12px 24px)
├── Gap (for icon): 0.5rem (8px)
└── Border Radius: 0.75rem (12px)

Button Small
├── Padding: 0.5rem 1rem (8px 16px)
└── Border Radius: 0.75rem (12px)

Button Large
├── Padding: 1rem 2rem (16px 32px)
└── Border Radius: 0.75rem (12px)

Icon Button
├── Padding: 0.75rem (12px)
├── Width/Height: 2.75rem (44px)
└── Border Radius: 50%
```

---

## Animation Timing

### Duration

- **Fast**: 0.2s - Fade in, quick transitions
- **Normal**: 0.3s - Standard transitions, label float
- **Slow**: 0.4s - Shake, bounce in, slide up
- **Loading**: 0.8s - Spinner rotation
- **Ambient**: 3s - Float animation

### Easing

**Primary Easing:**
```css
cubic-bezier(0.4, 0, 0.2, 1)
```
- Use for: Most transitions
- Feel: Smooth, modern

**Linear:**
```css
linear
```
- Use for: Continuous animations (spinner)
- Feel: Consistent speed

**Ease In Out:**
```css
ease-in-out
```
- Use for: Infinite animations (float)
- Feel: Natural loop

---

## Component Combinations

### Login Form Pattern

```html
<div class="form-section">
  <!-- Email -->
  <div class="form-group">
    <input class="form-input" />
    <label class="form-label" />
  </div>

  <!-- Password -->
  <div class="form-group">
    <input class="form-input" />
    <label class="form-label" />
    <button class="form-icon" />
  </div>

  <!-- Remember Me -->
  <div class="form-checkbox-container">
    <input class="form-checkbox" />
    <label />
  </div>

  <!-- Submit -->
  <button class="btn btn-primary btn-block btn-lg" />
</div>
```

### Multi-Section Form Pattern

```html
<div class="form-section">
  <!-- Section 1 -->
  <div class="form-section-title">Personal Info</div>
  <div class="form-grid form-grid-2">
    <div class="form-group">...</div>
    <div class="form-group">...</div>
  </div>

  <!-- Section 2 -->
  <div class="form-section-title">Contact Info</div>
  <div class="form-grid">
    <div class="form-group">...</div>
    <div class="form-group">...</div>
  </div>

  <!-- Submit -->
  <button class="btn btn-primary btn-block btn-lg" />
</div>
```

### Button Group Pattern

```html
<div class="flex gap-3 justify-end">
  <button class="btn btn-secondary">Cancel</button>
  <button class="btn btn-danger">Delete</button>
  <button class="btn btn-primary">Save</button>
</div>
```

### Icon Button Toolbar

```html
<div class="flex gap-2">
  <button class="btn btn-icon">
    <svg><!-- Edit --></svg>
  </button>
  <button class="btn btn-icon">
    <svg><!-- Delete --></svg>
  </button>
  <button class="btn btn-icon">
    <svg><!-- Share --></svg>
  </button>
</div>
```

---

## Responsive Breakpoints

### Form Grid Behavior

```css
/* Desktop (default) */
.form-grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

/* Mobile (<640px) */
@media (max-width: 640px) {
  .form-grid-2 {
    grid-template-columns: 1fr;
  }
}
```

### Button Sizing

- **Desktop**: Default sizes work well
- **Tablet**: Default sizes work well
- **Mobile**:
  - Consider btn-block for primary actions
  - Icon buttons remain same size (44px minimum)
  - Text may wrap in small buttons

---

## Accessibility Requirements

### Form Fields

**Required:**
- `id` attribute on input
- `for` attribute on label matching input `id`
- `placeholder=" "` for floating label to work
- Error messages inside `form-error` div

**Optional but Recommended:**
- `aria-invalid="true"` on error state
- `aria-describedby` pointing to error message
- `aria-required="true"` for required fields

### Buttons

**Required:**
- `type` attribute (submit, button, reset)
- Meaningful text or `aria-label` for icon buttons
- `disabled` attribute when not interactive

**Optional but Recommended:**
- `aria-busy="true"` during loading
- `aria-label` describing action for icon buttons

### Color Contrast

All text meets WCAG AA standards:
- Normal text: 4.5:1 minimum
- Large text: 3:1 minimum
- UI components: 3:1 minimum

---

## Browser Compatibility

### CSS Features Used

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| CSS Grid | ✅ 57+ | ✅ 52+ | ✅ 10.1+ | ✅ 16+ |
| Flexbox | ✅ 29+ | ✅ 28+ | ✅ 9+ | ✅ 12+ |
| Gradients | ✅ 26+ | ✅ 16+ | ✅ 7+ | ✅ 12+ |
| Transforms | ✅ 36+ | ✅ 16+ | ✅ 9+ | ✅ 12+ |
| Transitions | ✅ 26+ | ✅ 16+ | ✅ 9+ | ✅ 12+ |
| Animations | ✅ 43+ | ✅ 16+ | ✅ 9+ | ✅ 12+ |
| :placeholder-shown | ✅ 47+ | ✅ 51+ | ✅ 9+ | ✅ 79+ |
| backdrop-filter | ✅ 76+ | ✅ 103+ | ✅ 9+ | ✅ 79+ |

**Recommendation:** All modern browsers supported (last 2 years)

---

## Performance Tips

### Optimize Animations

```css
/* Use transform instead of position */
✅ transform: translateY(-2px);
❌ top: -2px;

/* Use opacity instead of visibility */
✅ opacity: 0;
❌ visibility: hidden;

/* Add will-change for complex animations */
.btn:hover {
  will-change: transform, box-shadow;
}
```

### Reduce Repaints

```css
/* Group related properties */
.form-input:focus {
  /* All border/shadow changes together */
  border: 2px solid transparent;
  box-shadow: 0 8px 16px rgba(...);
  transform: translateY(-2px);
}
```

---

## Common Patterns

### Search Form

```html
<div class="form-group">
  <input type="search" class="form-input" placeholder=" " />
  <label class="form-label">Search products...</label>
  <button type="submit" class="btn btn-icon">
    <svg><!-- Search icon --></svg>
  </button>
</div>
```

### Filter Form

```html
<div class="form-section">
  <div class="form-section-title">Filters</div>

  <!-- Price Range -->
  <div class="form-group">...</div>

  <!-- Categories -->
  <div class="space-y-2">
    <div class="form-checkbox-container">
      <input type="checkbox" class="form-checkbox" />
      <label>Category 1</label>
    </div>
    <!-- More checkboxes -->
  </div>

  <!-- Apply -->
  <button class="btn btn-primary btn-block">Apply Filters</button>
</div>
```

### Settings Form

```html
<div class="form-section">
  <div class="form-section-title">Account Settings</div>

  <div class="form-grid">
    <!-- Settings fields -->
  </div>

  <div class="flex gap-3 justify-end">
    <button class="btn btn-secondary">Cancel</button>
    <button class="btn btn-primary">Save Changes</button>
  </div>
</div>
```

---

## Testing Checklist

### Visual Tests
- [ ] Floating labels animate correctly
- [ ] Gradient borders appear on focus
- [ ] Error states show red borders
- [ ] Success states show green borders
- [ ] Buttons have hover effects
- [ ] Icons rotate/scale correctly
- [ ] Loading spinners appear
- [ ] Checkboxes show checkmarks
- [ ] Radio buttons show dots

### Functional Tests
- [ ] Form validation works
- [ ] Password toggle shows/hides
- [ ] Checkboxes toggle on/off
- [ ] Radio buttons select correctly
- [ ] Buttons trigger actions
- [ ] File upload accepts files
- [ ] Disabled states prevent interaction
- [ ] Loading states show feedback

### Accessibility Tests
- [ ] Tab navigation works
- [ ] Screen reader announces errors
- [ ] Focus visible on all elements
- [ ] Labels associated with inputs
- [ ] Error messages readable
- [ ] Button purposes clear
- [ ] Color contrast sufficient

---

**For complete documentation:**
- `/DESIGN-SYSTEM.md` - Full reference
- `/DESIGN-SYSTEM-QUICK-REFERENCE.md` - Code snippets
- `/DESIGN-SYSTEM-IMPLEMENTATION.md` - Implementation guide
- `/style-guide` route - Live examples

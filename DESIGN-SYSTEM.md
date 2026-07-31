# Paint Depot Design System

A modern, comprehensive design system for forms and buttons with floating labels, gradient borders, smooth animations, and validation states.

## Table of Contents
- [Installation](#installation)
- [Form Components](#form-components)
- [Button Components](#button-components)
- [Utilities](#utilities)
- [Examples](#examples)

---

## Installation

The design system is automatically imported in `src/styles.css`:

```css
@import './styles/design-system.css';
```

---

## Form Components

### 1. Floating Label Input

Modern input fields with floating labels, gradient borders, and validation states.

#### Basic Usage

```html
<div class="form-group">
  <input
    id="email"
    type="email"
    formControlName="email"
    class="form-input"
    [class.error]="email?.invalid && email?.touched"
    [class.success]="email?.valid && email?.touched"
    placeholder=" "
  />
  <label for="email" class="form-label">Email Address</label>

  <!-- Validation Icons -->
  <svg class="form-icon error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
  <svg class="form-icon success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>

  <!-- Error Message -->
  <div class="form-error">
    <svg fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
    </svg>
    <span>This field is required</span>
  </div>
</div>
```

#### Features
- Floating label animation on focus/input
- Gradient border on focus (purple to pink)
- Error state with red gradient border
- Success state with green gradient border
- Shake animation on error
- Smooth transitions

#### States
- **Default**: Gray gradient border
- **Focus**: Purple-to-pink gradient border with elevation
- **Error**: Red gradient border with shake animation
- **Success**: Green gradient border

---

### 2. Password Input with Toggle

Password field with show/hide functionality.

```html
<div class="form-group">
  <input
    id="password"
    [type]="showPassword ? 'text' : 'password'"
    formControlName="password"
    class="form-input"
    [class.error]="password?.invalid && password?.touched"
    placeholder=" "
  />
  <label for="password" class="form-label">Password</label>

  <button
    type="button"
    class="form-icon"
    style="opacity: 1; cursor: pointer; z-index: 10;"
    (click)="togglePasswordVisibility()"
  >
    <!-- Eye icons here -->
  </button>
</div>
```

---

### 3. Checkbox

Modern checkbox with gradient background when checked.

```html
<div class="form-checkbox-container">
  <input
    id="rememberMe"
    type="checkbox"
    class="form-checkbox"
    [(ngModel)]="rememberMe"
  />
  <label for="rememberMe" class="text-sm text-gray-700 cursor-pointer">
    Remember me
  </label>
</div>
```

#### Features
- Gradient background (purple to pink) when checked
- Animated checkmark
- Hover effect with ring
- Smooth transitions

---

### 4. Radio Button

Modern radio button with gradient indicator.

```html
<div class="form-checkbox-container">
  <input
    id="option1"
    type="radio"
    name="options"
    class="form-radio"
    value="option1"
  />
  <label for="option1" class="text-sm text-gray-700 cursor-pointer">
    Option 1
  </label>
</div>
```

#### Features
- Gradient inner circle when selected
- Hover effect with ring
- Scale animation on selection

---

### 5. File Upload

Beautiful drag-and-drop file upload area.

```html
<div class="file-upload-container">
  <div class="file-upload-area" [class.dragover]="isDragging">
    <input
      type="file"
      class="file-upload-input"
      id="fileUpload"
      (change)="onFileSelected($event)"
    />
    <label for="fileUpload" class="file-upload-content">
      <svg class="file-upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <div class="file-upload-text">Click to upload or drag and drop</div>
      <div class="file-upload-subtext">PNG, JPG, GIF up to 10MB</div>
    </label>
  </div>
</div>
```

#### Features
- Gradient background
- Drag and drop support
- Hover and dragover states
- Floating upload icon
- Custom styling

---

### 6. Form Layout Utilities

#### Form Grid

```html
<div class="form-grid">
  <!-- Fields here will have 1.5rem gap -->
</div>

<div class="form-grid form-grid-2">
  <!-- 2-column grid on desktop, 1-column on mobile -->
</div>
```

#### Form Section

```html
<div class="form-section">
  <div class="form-section-title">Personal Information</div>
  <!-- Form fields here -->
</div>
```

---

## Button Components

### 1. Primary Button

Gradient background button for main actions.

```html
<button class="btn btn-primary">
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <!-- Icon -->
  </svg>
  <span>Submit</span>
</button>
```

#### Features
- Purple-to-pink gradient background
- Glow effect on hover
- Ripple animation
- Elevation on hover
- Active state with scale down

---

### 2. Secondary Button

Outlined button with gradient border.

```html
<button class="btn btn-secondary">
  Secondary Action
</button>
```

#### Features
- White background with gradient border
- Subtle background on hover
- Purple text color

---

### 3. Tertiary Button

Soft background button.

```html
<button class="btn btn-tertiary">
  Tertiary Action
</button>
```

#### Features
- Soft purple/pink gradient background
- Darkens on hover

---

### 4. Danger Button

Red gradient for destructive actions.

```html
<button class="btn btn-danger">
  Delete
</button>
```

#### Features
- Red gradient background
- Glow effect on hover

---

### 5. Success Button

Green gradient for positive actions.

```html
<button class="btn btn-success">
  Confirm
</button>
```

#### Features
- Green gradient background
- Glow effect on hover

---

### 6. Icon Button

Circular button for icon-only actions.

```html
<button class="btn btn-icon">
  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <!-- Icon -->
  </svg>
</button>
```

#### Features
- Circular shape
- Soft gradient background
- Rotation animation on hover

---

### 7. Button Sizes

```html
<!-- Small -->
<button class="btn btn-primary btn-sm">Small</button>

<!-- Default -->
<button class="btn btn-primary">Default</button>

<!-- Large -->
<button class="btn btn-primary btn-lg">Large</button>

<!-- Full Width -->
<button class="btn btn-primary btn-block">Full Width</button>
```

---

### 8. Loading State

```html
<button class="btn btn-primary btn-loading" disabled>
  Loading...
</button>
```

#### Features
- Transparent text
- Spinning loader
- Disabled state

---

## Utilities

### 1. Gradient Text

```html
<h1 class="gradient-text">Purple to Pink Gradient Text</h1>
```

### 2. Gradient Border

```html
<div class="gradient-border p-4 rounded-lg">
  Content with gradient border
</div>
```

### 3. Helper Text

```html
<div class="form-helper">
  This is helper text for a form field
</div>
```

---

## Color Palette

The design system uses the following color gradients:

- **Primary Gradient**: Purple (#a855f7) to Pink (#ec4899)
- **Success Gradient**: Green (#10b981) to Dark Green (#059669)
- **Danger Gradient**: Red (#ef4444) to Dark Red (#dc2626)
- **Neutral**: Gray shades from 50 to 900

---

## Animations

All animations use `cubic-bezier(0.4, 0, 0.2, 1)` for smooth, modern transitions.

### Available Animations
- `shake` - Error state shake effect
- `bounceIn` - Icon appearance
- `slideDown` - Error message slide
- `checkmark` - Checkbox check animation
- `radioScale` - Radio button selection
- `spin` - Loading spinner
- `float` - Floating icon effect

---

## Best Practices

1. **Always use floating labels** - They provide better UX and save space
2. **Show validation states** - Use error and success classes with icons
3. **Provide helpful error messages** - Be specific about what's wrong
4. **Use appropriate button types** - Primary for main actions, secondary for alternatives
5. **Add loading states** - Show feedback during async operations
6. **Group related fields** - Use form sections with titles
7. **Make forms responsive** - Use form-grid-2 for multi-column layouts

---

## Examples

### Complete Login Form

See `/src/app/components/auth/login/login.component.html`

### Complete Registration Form

See `/src/app/components/auth/register/register.component.html`

### Checkout Form (Coming Soon)

Complex multi-step form with all component types.

---

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

---

## Accessibility

All form components include:
- Proper label associations
- ARIA attributes where needed
- Keyboard navigation support
- Focus indicators
- Error announcements

---

## Migration Guide

To migrate existing forms to the new design system:

1. Replace input classes with `form-input`
2. Wrap inputs in `form-group` div
3. Add floating labels with `form-label`
4. Add validation icons and error messages
5. Replace button classes with `btn` variants
6. Add appropriate states (error, success, loading)

Example:

**Before:**
```html
<label>Email</label>
<input type="email" class="old-input-class">
<span class="error-text">Error message</span>
```

**After:**
```html
<div class="form-group">
  <input
    id="email"
    type="email"
    class="form-input"
    [class.error]="hasError"
    placeholder=" "
  />
  <label for="email" class="form-label">Email</label>
  <svg class="form-icon error-icon">...</svg>
  <div class="form-error">
    <svg>...</svg>
    <span>Error message</span>
  </div>
</div>
```

---

## Contributing

To add new components to the design system:

1. Add styles to `/src/styles/design-system.css`
2. Document the component in this file
3. Create an example in the style guide
4. Update the changelog

---

## Changelog

### Version 1.0.0 (Current)
- Initial release
- Floating label inputs
- Modern checkboxes and radios
- File upload component
- Button variants (primary, secondary, tertiary, danger, success, icon)
- Form layout utilities
- Validation states and animations
- Complete login and register form examples

---

## Support

For issues or questions, please contact the development team.

# Design System Quick Reference Card

## Button Classes

```html
<!-- Primary (Gradient Purple to Pink) -->
<button class="btn btn-primary">Primary</button>

<!-- Secondary (Outlined with Gradient Border) -->
<button class="btn btn-secondary">Secondary</button>

<!-- Tertiary (Soft Background) -->
<button class="btn btn-tertiary">Tertiary</button>

<!-- Danger (Red Gradient) -->
<button class="btn btn-danger">Delete</button>

<!-- Success (Green Gradient) -->
<button class="btn btn-success">Confirm</button>

<!-- Icon (Circular) -->
<button class="btn btn-icon">
  <svg>...</svg>
</button>
```

## Button Sizes

```html
<button class="btn btn-primary btn-sm">Small</button>
<button class="btn btn-primary">Default</button>
<button class="btn btn-primary btn-lg">Large</button>
<button class="btn btn-primary btn-block">Full Width</button>
```

## Button States

```html
<!-- Loading -->
<button class="btn btn-primary btn-loading" disabled>Loading...</button>

<!-- Disabled -->
<button class="btn btn-primary" disabled>Disabled</button>
```

## Form Input Template

```html
<div class="form-group">
  <input
    id="fieldName"
    type="text"
    formControlName="fieldName"
    class="form-input"
    [class.error]="field?.invalid && field?.touched"
    [class.success]="field?.valid && field?.touched"
    placeholder=" "
  />
  <label for="fieldName" class="form-label">Field Label</label>

  <!-- Error Icon -->
  <svg class="form-icon error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>

  <!-- Success Icon -->
  <svg class="form-icon success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>

  <!-- Error Message -->
  <div class="form-error">
    <svg fill="currentColor" viewBox="0 0 20 20">
      <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
    </svg>
    <span>Error message here</span>
  </div>

  <!-- Helper Text (Optional) -->
  <div class="form-helper">Helper text here</div>
</div>
```

## Password Input with Toggle

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
    @if (showPassword) {
      <!-- Eye Icon (Visible) -->
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    } @else {
      <!-- Eye Slash Icon (Hidden) -->
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
      </svg>
    }
  </button>
</div>
```

## Checkbox

```html
<div class="form-checkbox-container">
  <input
    id="checkboxId"
    type="checkbox"
    class="form-checkbox"
    [(ngModel)]="modelValue"
  />
  <label for="checkboxId" class="text-sm text-gray-700 cursor-pointer">
    Checkbox Label
  </label>
</div>
```

## Radio Button

```html
<div class="form-checkbox-container">
  <input
    id="radioId"
    type="radio"
    name="radioGroup"
    class="form-radio"
    value="optionValue"
    [(ngModel)]="selectedValue"
  />
  <label for="radioId" class="text-sm text-gray-700 cursor-pointer">
    Radio Label
  </label>
</div>
```

## File Upload

```html
<div class="file-upload-container">
  <div class="file-upload-area" [class.dragover]="isDragging">
    <input
      type="file"
      class="file-upload-input"
      id="fileUpload"
      (change)="onFileSelected($event)"
    />
    <label for="fileUpload" class="file-upload-content cursor-pointer">
      <svg class="file-upload-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
      <div class="file-upload-text">Click to upload or drag and drop</div>
      <div class="file-upload-subtext">PNG, JPG, GIF up to 10MB</div>
    </label>
  </div>
</div>
```

## Form Layouts

```html
<!-- Single Column Form -->
<div class="form-section">
  <div class="form-section-title">Section Title</div>
  <div class="form-grid">
    <!-- Form fields here -->
  </div>
</div>

<!-- Two Column Form (Responsive) -->
<div class="form-grid form-grid-2">
  <!-- Fields here will be 2 columns on desktop, 1 on mobile -->
</div>
```

## Color Reference

### Gradients

**Primary (Purple to Pink)**
```css
background: linear-gradient(135deg, #a855f7 0%, #ec4899 100%);
```

**Success (Green)**
```css
background: linear-gradient(135deg, #10b981 0%, #059669 100%);
```

**Danger (Red)**
```css
background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
```

**Soft Background**
```css
background: linear-gradient(135deg, #f3e8ff 0%, #fce7f3 100%);
```

### Border Gradients

**Focus State**
```css
border: 2px solid transparent;
background: linear-gradient(white, white) padding-box,
            linear-gradient(135deg, #a855f7, #ec4899) border-box;
```

## Utility Classes

```html
<!-- Gradient Text -->
<h1 class="gradient-text">Purple to Pink Text</h1>

<!-- Gradient Border -->
<div class="gradient-border p-4 rounded-lg">
  Content with gradient border
</div>

<!-- Form Helper Text -->
<div class="form-helper">This is helper text</div>
```

## Component TypeScript Requirements

### For Password Toggle

```typescript
export class YourComponent {
  showPassword = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
```

### For Checkboxes/Radios with ngModel

```typescript
import { FormsModule } from '@angular/forms';

@Component({
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class YourComponent {
  rememberMe = false;
  selectedOption = 'option1';
}
```

### For Loading State

```typescript
export class YourComponent {
  loading = false;

  onSubmit(): void {
    this.loading = true;
    // Your async operation
    this.service.submit().subscribe({
      next: () => this.loading = false,
      error: () => this.loading = false
    });
  }
}
```

## Animation Classes

```html
<!-- Slide Up Animation -->
<div class="animate-slide-up">Content</div>

<!-- With Delay -->
<div class="animate-slide-up" style="animation-delay: 0.1s;">Content</div>

<!-- Float Animation -->
<div class="animate-float">Floating Content</div>
```

## Common Patterns

### Submit Button with Icon and Loading

```html
<button
  type="submit"
  [disabled]="form.invalid || loading"
  class="btn btn-primary btn-block btn-lg"
  [class.btn-loading]="loading"
>
  @if (!loading) {
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
    </svg>
    <span>Submit</span>
  } @else {
    <span>Submitting...</span>
  }
</button>
```

### Form Section with Grid

```html
<div class="form-section">
  <div class="form-section-title">Personal Information</div>
  <div class="form-grid form-grid-2">
    <div class="form-group">
      <!-- First Name -->
    </div>
    <div class="form-group">
      <!-- Last Name -->
    </div>
  </div>
</div>
```

### Action Button Group

```html
<div class="flex gap-3">
  <button class="btn btn-secondary">Cancel</button>
  <button class="btn btn-primary">Save</button>
</div>
```

## Icon SVG Library

### Checkmark
```html
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
</svg>
```

### X (Close)
```html
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
</svg>
```

### Plus
```html
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
</svg>
```

### Trash
```html
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
</svg>
```

### Edit
```html
<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
</svg>
```

---

**For full documentation, see:** `/DESIGN-SYSTEM.md`

**For live examples, visit:** `/style-guide` route

**For implementation details, see:** `/DESIGN-SYSTEM-IMPLEMENTATION.md`

# Visual Component Guide - Modern Navigation Header

## Desktop Layout (≥1024px)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [Gradient]    [Nav Links]      [Search Bar]        [Cart] [User] [≡]       │
│  ร้านสี●      หน้าแรก สินค้า    🔍 ค้นหาสินค้า...     🛒²   👤   |||        │
│              เกี่ยวกับเรา                                                    │
│             ─────────                                                        │
│           (active state)                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
    ↑             ↑                ↑                   ↑      ↑     ↑
  Logo    Nav with hover    Prominent search      Cart  User  Mobile
          underline         with dropdown         badge  menu  (hidden)
```

## Tablet Layout (768px - 1023px)

```
┌───────────────────────────────────────────────────────────────────┐
│  [Logo]    [Nav Links]    [Search]    [Cart] [User] [≡]           │
│  ร้านสี●   หน้าแรก สินค้า  🔍 Search   🛒²    👤    (hidden)      │
└───────────────────────────────────────────────────────────────────┘
    ↑           ↑              ↑         ↑      ↑
  Logo      Navigation     Compact    Cart   User
                          search bar   badge  menu
```

## Mobile Layout (<768px)

```
┌─────────────────────────────────────────┐
│  [Logo]           [🔍] [🛒²] [≡]        │
│  ร้านสี●                                │
└─────────────────────────────────────────┘
    ↑              ↑    ↑    ↑
  Logo         Search Cart  Hamburger
              (modal) badge  menu
```

## Component Breakdown

### 1. Logo Section
```
┌──────────────┐
│ ┌──────────┐ │ ← Gradient background (hover effect)
│ │ ร้านสี ● │ │ ← Gradient text + pulsing dot
│ └──────────┘ │
└──────────────┘
```
**Features:**
- Gradient: Indigo → Purple → Pink
- Hover: Lift animation + brightness
- Pulsing dot: 2s infinite animation

### 2. Navigation Links
```
หน้าแรก     สินค้า      เกี่ยวกับเรา
────────     ─────       ──────────
 (active)   (hover)      (default)
```
**Features:**
- Animated underline from left
- Color change: Gray → Purple
- Active state: Bold + underline

### 3. Search Bar (Desktop)
```
┌─────────────────────────────────┐
│ 🔍  ค้นหาสินค้า...          ✕  │ ← Glassmorphism
└─────────────────────────────────┘
     ↓ (when typing)
┌─────────────────────────────────┐
│ [Product Image] Product Name    │ ← Dropdown with
│                 ฿1,200          │   search results
├─────────────────────────────────┤
│ [Product Image] Product Name    │
│                 ฿850            │
└─────────────────────────────────┘
```
**Features:**
- Rounded corners (1rem)
- Backdrop blur effect
- Live search with 300ms debounce
- Gradient border on focus
- Clear button when typing

### 4. Cart Badge
```
     ┌──┐
     │2 │ ← Gradient badge (Purple → Pink)
 ┌───┴──┴──┐
 │  🛒    │ ← Cart icon
 └─────────┘
```
**Features:**
- Gradient background
- Only shows when count > 0
- Hover: Lift animation + purple glow
- Smooth count transitions

### 5. User Menu
```
┌──────┐  ▼
│ 👤  │
└──────┘
   ↓ (on click)
┌────────────────────────────┐
│ 👤  John Doe              │ ← User info
│     john@example.com      │   (gradient bg)
├───────────────────────────┤
│ 👤  โปรไฟล์              │
│ ⚙️   จัดการระบบ          │ ← Admin only
├───────────────────────────┤
│ 🚪  ออกจากระบบ           │ ← Red accent
└───────────────────────────┘
```
**Features:**
- Glassmorphism dropdown
- GSAP scale animation
- Click-outside to close
- Gradient avatar background
- Conditional admin link

### 6. Mobile Menu
```
Click [≡]
    ↓
┌─────────────────────────────┐ ← Slide in from right
│ 🔍  ค้นหาสินค้า...         │
├─────────────────────────────┤
│ 🏠  หน้าแรก                │ ← Staggered animation
│ 📦  สินค้า                 │
│ ℹ️   เกี่ยวกับเรา           │
├─────────────────────────────┤
│ ┌────┐                      │
│ │ 👤 │ John Doe             │
│ └────┘ john@example.com     │
│ 👤  โปรไฟล์                │
│ ⚙️   จัดการระบบ            │
│ 🚪  ออกจากระบบ             │
└─────────────────────────────┘
```
**Features:**
- Full-height overlay
- Backdrop blur background
- Smooth slide animation
- Touch-friendly spacing
- Icon + text layout

## Animation Timeline

### Initial Load (GSAP)
```
0.0s  ────────────────────────────────────
      Logo ↓ (fade + slide from top)

0.1s  ────────────────────────────────────
      Navigation ↓

0.2s  ────────────────────────────────────
      Search Bar ↓

0.3s  ────────────────────────────────────
      Actions ↓

0.8s  ────────────────────────────────────
      All visible
```

### Mobile Menu Open (GSAP)
```
0.0s  ────────────────────────────────────
      Menu slides in from right

0.0s  ────────────────────────────────────
      Search bar ↓

0.1s  ────────────────────────────────────
      Link 1 ↓ (stagger 0.05s)
      Link 2 ↓
      Link 3 ↓

0.3s  ────────────────────────────────────
      User section ↓

0.4s  ────────────────────────────────────
      All visible
```

### User Dropdown (GSAP)
```
0.0s  ────────────────────────────────────
      Dropdown scales in (0.95 → 1.0)

0.1s  ────────────────────────────────────
      Header ↓ (slide from left)
      Item 1 ↓ (stagger 0.04s)
      Item 2 ↓
      Item 3 ↓

0.3s  ────────────────────────────────────
      All visible
```

## State Changes

### Scroll State
```
Not Scrolled (scrollY ≤ 10px):
├─ Background: rgba(255, 255, 255, 0.8)
├─ Border: rgba(229, 231, 235, 0.5)
└─ Shadow: None

Scrolled (scrollY > 10px):
├─ Background: rgba(255, 255, 255, 0.95)
├─ Border: rgba(229, 231, 235, 0.8)
└─ Shadow: 0 4px 20px rgba(0, 0, 0, 0.08)
```

### Hover States
```
Navigation Link:
├─ Color: #4b5563 → #9333ea
└─ Underline: scaleX(0) → scaleX(1)

Cart Icon:
├─ Color: #4b5563 → #9333ea
├─ Background: transparent → rgba(147, 51, 234, 0.1)
└─ Transform: translateY(0) → translateY(-2px)

User Avatar:
└─ Background: rgba(147, 51, 234, 0.1)

Search Bar:
├─ Background: rgba(243, 244, 246, 0.6) → rgba(255, 255, 255, 0.9)
├─ Border: rgba(229, 231, 235, 0.8) → #9333ea
└─ Shadow: 0 0 0 3px rgba(147, 51, 234, 0.1)
```

## Glassmorphism Effects

All major components use this effect:
```
background: rgba(255, 255, 255, 0.98)
backdrop-filter: blur(20px)
-webkit-backdrop-filter: blur(20px)
border: 1px solid rgba(229, 231, 235, 0.8)
box-shadow: 0 10px 40px rgba(0, 0, 0, 0.12)
```

Applied to:
- Header wrapper
- Search bar
- Search dropdown
- User dropdown
- Mobile menu
- Mobile search modal

## Color Palette Reference

### Gradients
```
Logo Gradient:
  #4f46e5 ──→ #9333ea ──→ #ec4899
  (Indigo)    (Purple)    (Pink)

Cart Badge:
  #9333ea ──→ #ec4899
  (Purple)    (Pink)

Register Button:
  #ea580c ──→ #f97316
  (Orange)    (Light Orange)
```

### Text Colors
```
Default:    #4b5563 (Gray 600)
Hover:      #9333ea (Purple 600)
Active:     #9333ea (Purple 600)
Muted:      #6b7280 (Gray 500)
Heading:    #111827 (Gray 900)
Danger:     #dc2626 (Red 600)
```

### Background Colors
```
Primary:    rgba(255, 255, 255, 0.8)
Scrolled:   rgba(255, 255, 255, 0.95)
Dropdown:   rgba(255, 255, 255, 0.98)
Input:      rgba(243, 244, 246, 0.6)
Hover:      rgba(147, 51, 234, 0.1)
```

## Responsive Image

```
Desktop (≥1024px):
┌─────────────────────────────────────────────────────────────┐
│ [LOGO●] [หน้าแรก] [สินค้า] [🔍━━━━━━━━] [🛒²] [👤▼]      │
└─────────────────────────────────────────────────────────────┘

Tablet (768px-1023px):
┌──────────────────────────────────────────────────┐
│ [LOGO●] [หน้าแรก] [สินค้า] [🔍━━] [🛒²] [👤▼]  │
└──────────────────────────────────────────────────┘

Mobile (<768px):
┌─────────────────────────────┐
│ [LOGO●]      [🔍] [🛒²] [≡] │
└─────────────────────────────┘
```

## Accessibility Features

### Keyboard Navigation
- **Tab**: Move through interactive elements
- **Enter**: Activate buttons/links
- **Escape**: Close dropdowns/modals
- **Arrow Keys**: Navigate menu items (future)

### Focus Indicators
All interactive elements have visible focus states:
```css
:focus {
  outline: 2px solid #9333ea;
  outline-offset: 2px;
}
```

### ARIA Labels (Future Enhancement)
- `aria-label` on icon-only buttons
- `aria-expanded` on dropdown triggers
- `aria-current` on active nav links
- `role="search"` on search form

## Performance Metrics

### Animation Performance
- Uses `transform` and `opacity` (GPU accelerated)
- Avoids `width`, `height`, `top`, `left` animations
- GSAP ensures 60fps animations

### Bundle Size Impact
- GSAP: ~50KB (already included)
- Custom CSS: ~20KB
- Component JS: ~8KB
- Total: ~78KB additional

### Load Performance
- Initial render: <100ms
- Animation complete: 0.8s
- Search debounce: 300ms
- Smooth at 60fps

## Browser Compatibility

✅ Chrome 90+
✅ Firefox 88+
✅ Safari 14+
✅ Edge 90+
✅ Mobile Safari 14+
✅ Chrome Mobile 90+

### Fallbacks
- `-webkit-backdrop-filter` for Safari
- `backdrop-filter` for modern browsers
- Graceful degradation without blur support

# Paint Depot - E-Commerce Application

## 📋 ภาพรวมโปรเจกต์

Paint Depot คือเว็บแอปพลิเคชัน E-Commerce สำหรับร้านขายสีและอุปกรณ์ทาสี พัฒนาด้วย **Angular 19** และ **Tailwind CSS v3**

## ✨ Features ที่มีในโปรเจกต์

### 🏠 หน้าแรก (Home Page)
- Hero Section พร้อม Call-to-Action
- แสดงสินค้าแนะนำ (Featured Products)
- แสดงสินค้าขายดี (Bestsellers)
- แสดงแบรนด์สีชั้นนำ
- ข้อมูลบริการและจุดเด่น

### 🛍️ Product Features
- Product Listing Page พร้อม Grid Layout
- Product Card Component พร้อม:
  - รูปภาพสินค้า
  - ชื่อสินค้า, แบรนด์
  - ราคา (ปกติ/ลดราคา)
  - Rating และจำนวน Reviews
  - Badge (แนะนำ, ขายดี, ใหม่, ลดราคา)
  - Quick Add to Cart Button
  - สถานะสต็อก
- Product Detail Page
- Product Variants (ขนาด/สี)

### 🛒 Shopping Cart
- เพิ่มสินค้าเข้าตะกร้า
- แก้ไขจำนวนสินค้า
- ลบสินค้า
- แสดงยอดรวม
- Cart Badge บน Header
- LocalStorage Persistence

### 📱 Layout & Navigation
- Responsive Header พร้อม:
  - โลโก้และชื่อร้าน
  - Search Bar
  - Navigation Menu
  - Cart Icon พร้อม Badge
  - User Account Link
  - Mobile Menu (Hamburger)
- Footer พร้อม:
  - ข้อมูลร้าน
  - Quick Links
  - Customer Service Links
  - Contact Information
  - Social Media Links

## 🏗️ โครงสร้างโปรเจกต์

```
paint-depot-app/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── layout/
│   │   │   │   ├── header/       # Header component
│   │   │   │   └── footer/       # Footer component
│   │   │   ├── home/             # Home page
│   │   │   ├── products/
│   │   │   │   ├── product-list/      # Product listing
│   │   │   │   ├── product-detail/    # Product detail
│   │   │   │   └── product-card/      # Product card (reusable)
│   │   │   ├── cart/             # Shopping cart
│   │   │   ├── checkout/         # Checkout process
│   │   │   └── user/
│   │   │       └── profile/      # User profile
│   │   │
│   │   ├── services/
│   │   │   ├── product.service.ts    # Product data & logic
│   │   │   ├── cart.service.ts       # Cart management
│   │   │   ├── user.service.ts       # User authentication
│   │   │   ├── order.service.ts      # Order management
│   │   │   ├── category.service.ts   # Category data
│   │   │   └── brand.service.ts      # Brand data
│   │   │
│   │   ├── models/
│   │   │   ├── product.model.ts      # Product interfaces
│   │   │   ├── cart.model.ts         # Cart interfaces
│   │   │   ├── order.model.ts        # Order interfaces
│   │   │   └── user.model.ts         # User interfaces
│   │   │
│   │   ├── mock-data/
│   │   │   └── mock-products.ts      # Mock product data
│   │   │
│   │   ├── app.ts                # Main app component
│   │   ├── app.routes.ts         # Application routing
│   │   └── app.config.ts         # App configuration
│   │
│   ├── styles.css                # Global styles + Tailwind
│   └── index.html                # Main HTML file
│
├── tailwind.config.js            # Tailwind configuration
├── postcss.config.js             # PostCSS configuration
├── angular.json                  # Angular configuration
├── package.json                  # Dependencies
└── tsconfig.json                 # TypeScript configuration
```

## 🎨 สี Theme

```javascript
primary: {
  50: '#f0f9ff',
  100: '#e0f2fe',
  ...
  600: '#0284c7', // Primary color
  ...
  900: '#0c4a6e',
}
```

## 📦 Technologies

- **Angular**: v19 (Latest)
- **Tailwind CSS**: v3
- **TypeScript**: v5.7
- **RxJS**: สำหรับ Reactive Programming
- **Standalone Components**: ไม่ใช้ NgModules

## 🚀 การติดตั้งและรันโปรเจกต์

### 1. ติดตั้ง Dependencies
```bash
cd paint-depot-app
npm install
```

### 2. รัน Development Server
```bash
npm start
# หรือ
ng serve
```

เปิดเบราว์เซอร์ที่: `http://localhost:4200`

### 3. Build สำหรับ Production
```bash
npm run build
# หรือ
ng build
```

ไฟล์ที่ build จะอยู่ที่: `dist/paint-depot-app/`

### 4. รัน Tests
```bash
npm test
```

## 📊 Mock Data

โปรเจกต์มี Mock Data พร้อมใช้งานใน `src/app/mock-data/`:

- **Products**: 4 สินค้า (TOA Supermatex, TOA 4Seasons, Nippon Quick Coat, Captain Roof Paint)
- **Variants**: 9 variants พร้อมขนาดและสีต่างๆ
- **Categories**: 5 หมวดหมู่
- **Brands**: 5 แบรนด์ (TOA, Nippon, Jotun, Dulux, Captain)

## 🔧 Services

### ProductService
```typescript
- getProducts(filters?) // ดึงสินค้าทั้งหมด + กรอง
- getProductById(id)    // ดึงสินค้าตาม ID
- getProductBySlug(slug) // ดึงสินค้าตาม slug
- getFeaturedProducts() // ดึงสินค้าแนะนำ
- getBestsellerProducts() // ดึงสินค้าขายดี
- searchProducts(query) // ค้นหาสินค้า
- getCategories()       // ดึงหมวดหมู่
- getBrands()          // ดึงแบรนด์
```

### CartService
```typescript
- getCart()                    // ดูตะกร้า
- addToCart(request)           // เพิ่มสินค้า
- updateCartItem(id, quantity) // แก้ไขจำนวน
- removeCartItem(id)           // ลบสินค้า
- clearCart()                  // ล้างตะกร้า
- cart$ (Observable)           // Subscribe เพื่อ real-time update
```

## 🎯 Components

### Reusable Components

#### ProductCardComponent
```html
<app-product-card [product]="product"></app-product-card>
```

**Inputs:**
- `product: Product` - ข้อมูลสินค้า

**Features:**
- แสดงรูปภาพสินค้า
- Badge system (แนะนำ, ขายดี, ใหม่, ลดราคา)
- Rating display
- Quick add to cart
- Hover effects

## 🛣️ Routing

```typescript
/                  → HomePage
/products          → ProductListPage
/products/:slug    → ProductDetailPage
/cart              → CartPage
/checkout          → CheckoutPage
/profile           → ProfilePage
```

## 📱 Responsive Design

- **Desktop**: 1024px+ (4 columns grid)
- **Tablet**: 768px-1023px (2 columns grid)
- **Mobile**: < 768px (1 column grid)

## 🎨 Tailwind Custom Classes

```css
.btn-primary    // ปุ่มหลัก
.btn-secondary  // ปุ่มรอง
.card           // การ์ดพื้นฐาน
.input-field    // Input field พื้นฐาน
```

## 🔄 State Management

- **CartService** ใช้ `BehaviorSubject` สำหรับ real-time cart updates
- **LocalStorage** สำหรับเก็บข้อมูล cart แบบถาวร
- **RxJS Observables** สำหรับ async operations

## 🚧 TODO: Features ที่รอ Integrate กับ API

เมื่อ Backend API พร้อม ให้แก้ไขในส่วนนี้:

### 1. Update Services
แทนที่ Mock Data ด้วย HTTP Calls:

```typescript
// ก่อน (Mock)
getProducts(): Observable<Product[]> {
  return of(MOCK_PRODUCTS).pipe(delay(300));
}

// หลัง (Real API)
getProducts(): Observable<Product[]> {
  return this.http.get<Product[]>(`${API_URL}/products`);
}
```

### 2. Add HTTP Client
```typescript
import { HttpClient } from '@angular/common/http';
import { provideHttpClient } from '@angular/common/http';

// ใน app.config.ts
providers: [
  provideHttpClient(),
  ...
]
```

### 3. Environment Configuration
สร้างไฟล์ `src/environments/`:

```typescript
// environment.development.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};

// environment.ts
export const environment = {
  production: true,
  apiUrl: 'https://api.paintdepot.com'
};
```

### 4. ต้อง Implement
- [ ] Authentication (Login/Register)
- [ ] Order Creation & Management
- [ ] Payment Integration
- [ ] Address Management
- [ ] Review & Rating System
- [ ] Product Filtering (Advanced)
- [ ] Search with Autocomplete
- [ ] Order History
- [ ] Admin Panel

## 📖 การใช้งาน Components

### แสดงสินค้า
```typescript
// ใน component.ts
export class MyComponent implements OnInit {
  products: Product[] = [];

  constructor(private productService: ProductService) {}

  ngOnInit() {
    this.productService.getProducts().subscribe(result => {
      this.products = result.products;
    });
  }
}

// ใน template.html
<div class="grid grid-cols-4 gap-6">
  @for (product of products; track product.id) {
    <app-product-card [product]="product"></app-product-card>
  }
</div>
```

### จัดการ Cart
```typescript
// เพิ่มสินค้า
addToCart(variantId: number) {
  this.cartService.addToCart({
    productVariantId: variantId,
    quantity: 1
  }).subscribe(cart => {
    console.log('Cart updated:', cart);
  });
}

// Subscribe cart changes
ngOnInit() {
  this.cartService.cart$.subscribe(cart => {
    this.cartItemCount = cart.totalItems;
    this.cartSubtotal = cart.subtotal;
  });
}
```

## 🐛 Known Issues

- ยังไม่มี Product Detail Page implementation
- ยังไม่มี Checkout Flow implementation
- ยังไม่มี User Authentication
- Filter/Sort ใน Product List ยังไม่มี

## 📞 การติดต่อ

สำหรับคำถามหรือข้อเสนอแนะ กรุณาติดต่อทีมพัฒนา

## 📄 License

MIT License

---

**สร้างโดย**: Angular 19 + Tailwind CSS 3
**เวอร์ชัน**: 1.0.0
**อัพเดตล่าสุด**: 2024

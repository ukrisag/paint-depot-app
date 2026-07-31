import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../../services/product.service';
import { NotificationService } from '../../../services/notification.service';
import { Product } from '../../../models/product.model';

@Component({
  selector: 'app-products-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products-admin.component.html',
  styleUrls: ['./products-admin.component.css']
})
export class ProductsAdminComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  loading = true;
  error = '';
  searchQuery = '';

  // Pagination
  currentPage = 1;
  totalPages = 1;
  pageSize = 12;
  totalItems = 0;

  constructor(
    private productService: ProductService,
    private notificationService: NotificationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';

    this.productService.getProducts({
      page: this.currentPage,
      limit: this.pageSize
    }).subscribe({
      next: (response) => {
        this.products = response.products;
        this.filteredProducts = [...this.products];
        this.totalItems = response.total;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.loading = false;
      },
      error: (err) => {
        this.error = 'ไม่สามารถโหลดข้อมูลสินค้าได้';
        this.notificationService.error('ไม่สามารถโหลดข้อมูลสินค้าได้');
        this.loading = false;
        console.error('Error loading products:', err);
      }
    });
  }

  onSearch(): void {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) {
      this.filteredProducts = [...this.products];
      return;
    }

    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.sku.toLowerCase().includes(query)
    );
  }

  onEdit(productId: number): void {
    this.router.navigate(['/admin/products/edit', productId]);
  }

  onDelete(product: Product): void {
    this.notificationService.info('ฟีเจอร์นี้จะเปิดให้ใช้งานเร็วๆ นี้');
  }

  onAddNew(): void {
    this.notificationService.info('ฟีเจอร์นี้จะเปิดให้ใช้งานเร็วๆ นี้');
  }

  getStockStatus(product: Product): { text: string; class: string } {
    if (!product.variants || product.variants.length === 0) {
      return { text: 'ไม่มีข้อมูล', class: 'text-gray-500' };
    }

    const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);

    if (totalStock === 0) {
      return { text: 'สินค้าหมด', class: 'text-red-600 font-semibold' };
    } else if (totalStock < 10) {
      return { text: `เหลือ ${totalStock}`, class: 'text-orange-600 font-semibold' };
    } else {
      return { text: `เหลือ ${totalStock}`, class: 'text-green-600' };
    }
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('th-TH', {
      style: 'currency',
      currency: 'THB'
    }).format(price);
  }
}

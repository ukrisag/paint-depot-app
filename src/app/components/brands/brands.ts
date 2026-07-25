import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Brand } from '../../models/product.model';

@Component({
  selector: 'app-brands',
  imports: [CommonModule],
  templateUrl: './brands.html',
  styleUrl: './brands.css',
})
export class BrandsComponent implements OnInit {
  brands: Brand[] = [];
  loading = true;

  constructor(
    private productService: ProductService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadBrands();
  }

  loadBrands() {
    this.productService.getBrands().subscribe({
      next: (brands) => {
        this.brands = brands;
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  goToBrand(brandId: number) {
    this.router.navigate(['/products'], {
      queryParams: { brandId }
    });
  }
}

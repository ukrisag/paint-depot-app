import { Component, OnInit, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { Brand } from '../../models/product.model';

@Component({
  selector: 'app-brands',
  imports: [CommonModule, RouterModule],
  templateUrl: './brands.html',
  styleUrl: './brands.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BrandsComponent implements OnInit {
  brands = signal<Brand[]>([]);
  loading = signal(true);

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadBrands();
  }

  loadBrands() {
    this.productService.getBrands().subscribe({
      next: (brands) => {
        this.brands.set(brands);
        this.loading.set(false);
      }
    });
  }

  goToBrand(brandId: number) {
    this.router.navigate(['/products'], {
      queryParams: { brandId }
    });
  }
}

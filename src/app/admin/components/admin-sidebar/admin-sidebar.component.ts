import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  active?: boolean;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-sidebar.component.html',
  styleUrls: ['./admin-sidebar.component.css']
})
export class AdminSidebarComponent {
  @Input() isOpen: boolean = true;
  @Output() close = new EventEmitter<void>();

  menuItems: MenuItem[] = [
    {
      label: 'แดชบอร์ด',
      icon: '🏠',
      route: '/admin/dashboard'
    },
    {
      label: 'สินค้า',
      icon: '📦',
      route: '/admin/products'
    },
    {
      label: 'คำสั่งซื้อ',
      icon: '🛒',
      route: '/admin/orders'
    },
    {
      label: 'ผู้ใช้งาน',
      icon: '👥',
      route: '/admin/users'
    },
    {
      label: 'รีวิว',
      icon: '⭐',
      route: '/admin/reviews'
    },
    {
      label: 'คูปอง',
      icon: '🎟️',
      route: '/admin/coupons'
    },
    {
      label: 'หมวดหมู่',
      icon: '📂',
      route: '/admin/categories'
    },
    {
      label: 'แบรนด์',
      icon: '🏷️',
      route: '/admin/brands'
    }
  ];

  onClose(): void {
    this.close.emit();
  }
}

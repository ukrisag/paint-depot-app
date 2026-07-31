import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AdminSidebarComponent } from '../components/admin-sidebar/admin-sidebar.component';
import { AdminHeaderComponent } from '../components/admin-header/admin-header.component';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AdminSidebarComponent,
    AdminHeaderComponent
  ],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent {
  isSidebarOpen = signal<boolean>(this.getInitialSidebarState());

  private getInitialSidebarState(): boolean {
    // On desktop (≥1024px), sidebar is open by default
    // On mobile (<1024px), sidebar is closed by default
    return window.innerWidth >= 1024;
  }

  toggleSidebar(): void {
    this.isSidebarOpen.update(value => !value);
  }

  closeSidebar(): void {
    // Only close sidebar on mobile
    if (window.innerWidth < 1024) {
      this.isSidebarOpen.set(false);
    }
  }
}

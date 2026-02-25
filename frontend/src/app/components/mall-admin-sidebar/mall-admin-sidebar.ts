import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-mall-admin-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './mall-admin-sidebar.html',
  styleUrl: './mall-admin-sidebar.css',
})
export class MallAdminSidebar {
  isActive = false;
  isStockOpen = false;

  toggleSidebar(): void {
    this.isActive = !this.isActive;
    // Fermer le dropdown si on réduit la sidebar
    if (!this.isActive) {
      this.isStockOpen = false;
    }
  }

  toggleStock(event: Event): void {
    event.preventDefault();
    if (!this.isActive) {
      // Ouvrir la sidebar avant d'ouvrir le dropdown
      this.isActive = true;
      setTimeout(() => { this.isStockOpen = true; }, 50);
    } else {
      this.isStockOpen = !this.isStockOpen;
    }
  }

  closeOnMobile() {
    if (window.innerWidth <= 768) {
      this.isActive = false;
    }
  }

  ngOnInit(): void { }
}

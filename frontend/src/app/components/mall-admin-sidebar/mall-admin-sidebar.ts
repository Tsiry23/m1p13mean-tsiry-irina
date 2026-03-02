import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth';

@Component({
  standalone: true,
  selector: 'app-mall-admin-sidebar',
  imports: [CommonModule, RouterModule],
  templateUrl: './mall-admin-sidebar.html',
  styleUrls: ['./mall-admin-sidebar.css'],
})
export class MallAdminSidebar {
  isActive = false;
  isStockOpen = false;

  constructor(
      private authService: AuthService,
      private router: Router,
    ) {}

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

  logout () {
    this.authService.logout();

    this.router.navigate(['/']);
  }

  ngOnInit(): void { }
}

import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: 'sidebar.component.html',
  styleUrls: ['sidebar.component.css']
})
export class SidebarComponent implements OnInit {
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

  ngOnInit(): void {}
}
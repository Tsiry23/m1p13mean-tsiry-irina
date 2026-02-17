import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  isScrolled = false;

  @HostListener('window:scroll', [])
  onScroll() {
    const heroHeight = window.innerHeight * 0.8;
    this.isScrolled = window.scrollY > heroHeight;
  }
}

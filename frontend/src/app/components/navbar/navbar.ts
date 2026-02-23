import { Component, HostListener } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { RouterModule, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  imports: [RouterModule, RouterLink],
})
export class Navbar {

  isScrolled = false;
  isHomePage = false;

  constructor(private router: Router) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.isHomePage = event.urlAfterRedirects === '/' || event.urlAfterRedirects === '/home';
        
        console.log("'" +event.urlAfterRedirects + "'");

        // Si ce n’est PAS la home → navbar toujours opaque
        if (!this.isHomePage) {
          this.isScrolled = true;
        }
      });
  }

  @HostListener('window:scroll', [])
  onScroll() {
    if (!this.isHomePage) return;

    const heroHeight = window.innerHeight * 0.8;
    this.isScrolled = window.scrollY > heroHeight;
  }
}
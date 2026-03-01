import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../services/auth/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {

    return this.auth.getRoleFromToken().pipe(
      map(role => {

        const url = state.url;

        const isBoutiqueRoute = url.startsWith('/admin-boutique');
        const isMallRoute = url.startsWith('/admin-cc');

        // Pas de rôle → redirection vers le bon login
        if (!role) {
          if (isBoutiqueRoute) this.router.navigate(['/login/boutique']);
          if (isMallRoute) this.router.navigate(['/login/mall']);
          return false;
        }

        // Mauvais rôle pour la route
        if (isBoutiqueRoute && role !== 'admin de boutique') {
          this.router.navigate(['/login/boutique']);
          return false;
        }

        if (isMallRoute && role !== 'admin du centre commercial') {
          this.router.navigate(['/login/mall']);
          return false;
        }

        return true;
      })
    );
  }
}
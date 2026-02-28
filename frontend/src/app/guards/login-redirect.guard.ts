import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AuthService } from '../services/auth/auth';

@Injectable({
  providedIn: 'root'
})
export class LoginRedirectGuard implements CanActivate {

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

        // Pas de rôle → on laisse accéder au login
        if (!role) {
          return true;
        }

        const url = state.url;

        if (url.includes('/login/boutique') && role === 'admin de boutique') {
          this.router.navigate(['/admin-boutique']);
          return false;
        }

        if (url.includes('/login/mall') && role === 'admin du centre commercial') {
          this.router.navigate(['/admin-cc']);
          return false;
        }

        // Rôle présent mais ne correspond pas → login
        return true;
      })
    );
  }
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, map, tap, catchError } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = `${environment.apiBaseUrl}/auth`; // adapte si besoin

  constructor(private http: HttpClient) { }

  /**
   * Connexion utilisateur
   */
  login(email: string, mdp: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/login`, { email, mdp })
      .pipe(
        tap((response) => {
          if (response?.token) {
            localStorage.setItem('token', response.token);
          }
          if (response?.client) {
            localStorage.setItem('client', response.client);
          }else{
            localStorage.setItem('client', '');
            localStorage.removeItem('client');
          }
        })
      );
  }

  /**
 * Vérifie le token et retourne le rôle si valide
 */
  getRoleFromToken(): Observable<string | undefined> {
    const token = this.getToken();

    // Pas de token → pas d'appel API
    if (!token) {
      return of(undefined);
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http
      .get<{ valid: boolean; role: string }>(
        `${this.apiUrl}/verify-token`,
        { headers }
      )
      .pipe(
        map((response) => response.role),
        catchError(() => of(undefined))
      );
  }

  /**
   * Récupérer le token
   */
  getToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return localStorage.getItem('token');
  }

  /**
   * Déconnexion
   */
  logout(): void {
    localStorage.removeItem('token');
  }

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

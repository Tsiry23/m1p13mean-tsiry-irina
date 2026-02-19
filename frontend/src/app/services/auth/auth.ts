import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private apiUrl = `${environment.apiBaseUrl}/auth`; // adapte si besoin

  constructor(private http: HttpClient) {}

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
        })
      );
  }

  /**
   * Récupérer le token
   */
  getToken(): string | null {
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

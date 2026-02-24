import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FavorisService {

  private apiUrl = `${environment.apiBaseUrl}/favoris`; // adapte selon ton router

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: token ? `Bearer ${token}` : ''
    });
  }

  addToFavorites(produitId: string): Observable<any> {
    return this.http.post(this.apiUrl, { id_produit: produitId }, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => {
        console.error('Erreur add favorite', err);
        return throwError(() => err);
      })
    );
  }

  removeFromFavorites(produitId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${produitId}`, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => {
        console.error('Erreur remove favorite', err);
        return throwError(() => err);
      })
    );
  }

}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Boutique } from '../../models/boutique.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BoutiqueService {

  private apiUrl = `${environment.apiBaseUrl}/boutique`;

  constructor(private http: HttpClient) {}

  getBoutiques(): Observable<Boutique[]> {
    return this.http.get<Boutique[]>(this.apiUrl);
  }

  addBoutique(boutique: Boutique, file?: File): Observable<any> {
    const formData = new FormData();
    formData.append('nom', boutique.nom);
    formData.append('description', boutique.description || '');
    formData.append('taille_m2', (boutique.taille_m2 || 0).toString());
    formData.append('loyer', (boutique.loyer || 0).toString());

    if (file) {
      formData.append('image', file);
    }

    return this.http.post(this.apiUrl, formData, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(this.handleError('addBoutique'))
    );
  }

  private getAuthHeaders(): HttpHeaders | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed`, error);
      return throwError(() => error);
    };
  }
}

import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Commande } from '../../models/commande.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private apiUrl = `${environment.apiBaseUrl}/commande`;

  constructor(private http: HttpClient) {}

  search(params: any): Observable<Commande[]> {
    let httpParams = new HttpParams();
    const headers = this.getAuthHeaders();

    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.post<Commande[]>(`${this.apiUrl}/search`, null, {
      params: httpParams,
      headers: headers
    });
  }

  private getAuthHeaders(): HttpHeaders | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const token = window.localStorage.getItem('token');
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;
  }

}

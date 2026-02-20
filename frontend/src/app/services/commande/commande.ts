import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Commande } from '../../models/commande.model';

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private apiUrl = 'http://localhost:3000/commandes';

  constructor(private http: HttpClient) {}

  search(params: any): Observable<Commande[]> {
    let httpParams = new HttpParams();

    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    return this.http.post<Commande[]>(`${this.apiUrl}/search`, null, {
      params: httpParams
    });
  }
}

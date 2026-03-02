import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { HistoLoyerSimple } from '../../models/histo-loyer-simple.model';

@Injectable({
  providedIn: 'root',
})
export class HistoLoyerService {

  private apiUrl = `${environment.apiBaseUrl}/histo-loyer`;

  constructor(private http: HttpClient) {}

  // 🔐 Header avec token
  private getAuthHeaders(): HttpHeaders | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const token = localStorage.getItem('token');
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : undefined;
  }

  // 🔍 Récupérer l'historique de loyer d'une boutique
  getHistoLoyerByBoutique(idBoutique: string): Observable<HistoLoyerSimple[]> {
    return this.http.get<HistoLoyerSimple[]>(
      `${this.apiUrl}/search`,
      {
        headers: this.getAuthHeaders(),
        params: { id_boutique: idBoutique }
      }
    );
  }
}
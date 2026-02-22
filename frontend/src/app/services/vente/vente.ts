// src/app/services/vente/vente.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { EnregistrerVenteCommandeDto } from '../../models/enregistrer-vente-commandeDto.model';
import { TypePaiement } from '../../models/typepaiement.model';

export interface EnregistrerResponse {
  success: boolean;
  message: string;
  id?: string;           // id_vente ou id_commande
  type: 'vente' | 'commande';
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class VenteService {

  private apiUrl = `${environment.apiBaseUrl}/vente/enregistrer`;

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    });
  }

  enregistrerVenteOuCommande(payload: EnregistrerVenteCommandeDto): Observable<EnregistrerResponse> {
    return this.http.post<EnregistrerResponse>(this.apiUrl, payload, {
      headers: this.getAuthHeaders()
    }).pipe(
      catchError(err => {
        console.error('[VenteService] Erreur enregistrement :', err);
        const message = err.error?.message || 'Erreur lors de l\'enregistrement de la transaction';
        return throwError(() => new Error(message));
      })
    );
  }

  getTypesPaiement(): Observable<TypePaiement[]> {
    const url = `${environment.apiBaseUrl}/type-paiement`;
    return this.http.get<TypePaiement[]>(url, { headers: this.getAuthHeaders() }).pipe(
      catchError(err => {
        console.error('[VenteService] Erreur chargement types paiement :', err);
        return throwError(() => new Error('Impossible de charger les moyens de paiement'));
      })
    );
  }
}
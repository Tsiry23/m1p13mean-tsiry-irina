import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paiement } from '../../models/paiement.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {

  private apiUrl = `${environment.apiBaseUrl}/paiement`;

  constructor(private http: HttpClient) {}

  // 🔐 Header avec token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');

    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  // ➕ Créer un paiement
  addPaiement(paiement: Paiement): Observable<Paiement> {
    return this.http.post<Paiement>(
      this.apiUrl,
      paiement,
      { headers: this.getAuthHeaders() }
    );
  }

  // 📄 Récupérer tous les paiements
  getPaiements(): Observable<Paiement[]> {
    return this.http.get<Paiement[]>(
      this.apiUrl,
      { headers: this.getAuthHeaders() }
    );
  }

  // 📄 Récupérer un paiement par ID
  getPaiementById(id: string): Observable<Paiement> {
    return this.http.get<Paiement>(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }

  // ✏️ Mettre à jour un paiement
  updatePaiement(id: string, paiement: Paiement): Observable<Paiement> {
    return this.http.put<Paiement>(
      `${this.apiUrl}/${id}`,
      paiement,
      { headers: this.getAuthHeaders() }
    );
  }

  // 🗑️ Supprimer un paiement
  deletePaiement(id: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/${id}`,
      { headers: this.getAuthHeaders() }
    );
  }
}
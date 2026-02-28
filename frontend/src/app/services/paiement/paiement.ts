import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Paiement } from '../../models/paiement.model';
import { environment } from '../../../environments/environment';
import { PaiementPopulate } from '../../models/paiement-populate.model';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {

  private apiUrl = `${environment.apiBaseUrl}/paiement`;

  constructor(private http: HttpClient) { }

  // 🔐 Header avec token
  private getAuthHeaders(): HttpHeaders | undefined {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
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

  // 🔍 Rechercher des paiements avec filtres
  searchPaiements(filters: {
    id_boutique?: string;
    dateDebut?: string;
    dateFin?: string;
  }): Observable<PaiementPopulate[]> {

    const params: any = {};

    if (filters.id_boutique) {
      params.id_boutique = filters.id_boutique;
    }

    if (filters.dateDebut) {
      params.dateDebut = filters.dateDebut;
    }

    if (filters.dateFin) {
      params.dateFin = filters.dateFin;
    }

    return this.http.get<PaiementPopulate[]>(
      `${this.apiUrl}/search`,
      {
        headers: this.getAuthHeaders(),
        params
      }
    );
  }

  searchPaiementsForBoutique(filters: {
    dateDebut?: string;
    dateFin?: string;
  }): Observable<PaiementPopulate[]> {

    const params: any = {};

    if (filters.dateDebut) {
      params.dateDebut = filters.dateDebut;
    }

    if (filters.dateFin) {
      params.dateFin = filters.dateFin;
    }

    return this.http.get<PaiementPopulate[]>(
      `${this.apiUrl}/boutique/search`,
      {
        headers: this.getAuthHeaders(),
        params
      }
    );
  }
}
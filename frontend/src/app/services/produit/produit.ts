import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Produit } from '../../models/produit.model';
import { ProduitsParBoutique } from '../../models/produits-par-boutique.model';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {

  private apiUrl = `${environment.apiBaseUrl}/produit`;

  constructor(private http: HttpClient) {}

  /** Récupère la liste de tous les produits groupés  */
  getProduitsGroupByBoutique(): Observable<ProduitsParBoutique[]> {
    return this.http.get<ProduitsParBoutique[]>(this.apiUrl+'/group-by-boutique').pipe(
      tap(() => console.log('Produits chargés')),
      catchError(this.handleError<ProduitsParBoutique[]>('getProduitsGroupByBoutique', []))
    );
  }

  /** Récupère la liste de tous les produits */
  getProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(this.apiUrl).pipe(
      tap(() => console.log('Produits chargés')),
      catchError(this.handleError<Produit[]>('getProduits', []))
    );
  }

  /** Ajoute un nouveau produit (avec ou sans image) */
  addProduit(produit: Produit, file?: File): Observable<any> {
    const formData = this.createFormData(produit, file);
    const headers = this.getAuthHeaders();

    return this.http.post(this.apiUrl, formData, { headers }).pipe(
      catchError(this.handleError<any>('addProduit'))
    );
  }

  /** Met à jour un produit existant */
  updateProduit(id: string, produit: Produit, file?: File): Observable<any> {
    const formData = this.createFormData(produit, file);
    const headers = this.getAuthHeaders();

    return this.http.put(`${this.apiUrl}/${id}`, formData, { headers }).pipe(
      catchError(this.handleError<any>('updateProduit'))
    );

  }

  private createFormData(produit: Produit, file?: File): FormData {
    const formData = new FormData();
    formData.append('nom', produit.nom || '');
    formData.append('qt_actuel', (produit.qt_actuel || 0).toString());
    formData.append('qt_en_cours_commande', (produit.qt_en_cours_commande || 0).toString());
    formData.append('prix_actuel', (produit.prix_actuel || 0).toString());

    if (file) {
      formData.append('image', file);
    }
    return formData;
  }

  private getAuthHeaders(): HttpHeaders | undefined {
    const token = localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      // Tu peux ici ajouter un système de notification global si tu veux
      return throwError(() => new Error(`${operation} a échoué : ${error.message}`));
    };
  }
}
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CaParTypePaiement {
  ca: number;
  type_paiement: string;
}

export interface ProduitVendu {
  quantite_vendue: number;
  ca_genere: number;
  id_produit: string;
  nom: string;
}

export interface ProduitAppracie {
  nombre_favoris: number;
  id_produit: string;
  nom: string;
}

export interface EvolutionVentes {
  ca: number;
  nombre_ventes: number;
  periode: string;
  panier_moyen: number;
}

export interface ProduitStockFaible {
  id_produit: string;
  nom: string;
  qt_actuel: number;
}

export interface DashboardBoutiqueData {
  ca_periode: number;
  panier_moyen_periode: number;
  nombre_ventes_periode: number;
  clients_uniques_periode: number;
  ca_par_type_paiement: CaParTypePaiement[];
  produits_plus_vendus: ProduitVendu[];
  produits_moins_performants: ProduitVendu[];
  produits_plus_apprecies: ProduitAppracie[];
  evolution_ventes_annee: EvolutionVentes[];
  evolution_ventes_mois: EvolutionVentes[];
  evolution_ventes_semaine: EvolutionVentes[];
  produits_stock_faible: ProduitStockFaible[];
}

@Injectable({
  providedIn: 'root',
})
export class DashboardBoutique {

  private apiUrl = `${environment.apiBaseUrl}/dashboard-boutique`;

  constructor(private http: HttpClient) {}

  getDashboard(startDate: string, endDate: string): Observable<DashboardBoutiqueData> {
    const params = new HttpParams()
      .set('start_date', startDate)
      .set('end_date', endDate);

    const headers = this.getAuthHeaders();

    return this.http
      .get<DashboardBoutiqueData>(this.apiUrl, { headers, params, responseType: 'json' })
      .pipe(catchError(this.handleError<DashboardBoutiqueData>('getDashboard')));
  }

  private getAuthHeaders(): HttpHeaders | undefined {
    if (typeof window === 'undefined') return undefined;
    const token = window.localStorage.getItem('token');
    return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;
  }

  private handleError<T>(operation = 'operation') {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return throwError(() => new Error(`${operation} a échoué : ${error.message}`));
    };
  }
}
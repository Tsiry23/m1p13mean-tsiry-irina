import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { DashboardMetrics } from '../../models/dashboard-metrics.model';
import { environment } from '../../../environments/environment';
import { PaiementEvolution } from '../../models/paiement-evolution.model';
import { PaginatedResponse } from '../../models/paginated-response.model';
import { HistoLoyer } from '../../models/histo-loyer.model';

@Injectable({
  providedIn: 'root',
})
export class DashboardService {

  private apiUrl = `${environment.apiBaseUrl}/dashboard`;

  constructor(private http: HttpClient) { }

  getMetrics(periode?: string): Observable<DashboardMetrics> {
    let params = new HttpParams();

    if (periode) {
      params = params.set('periode', periode);
    }

    const headers = this.getAuthHeaders();

    return this.http
      .get<DashboardMetrics>(this.apiUrl + '/metrics', {
        headers,
        params,
        responseType: 'json'
      })
      .pipe(
        catchError(this.handleError<DashboardMetrics>('getMetrics'))
      );
  }

  getPaiementsEvolution(
    annee: number,
    idBoutique?: string
  ): Observable<PaiementEvolution> {

    let params = new HttpParams().set('annee', annee.toString());

    if (idBoutique) {
      params = params.set('id_boutique', idBoutique);
    }

    const headers = this.getAuthHeaders();

    return this.http
      .get<PaiementEvolution>(
        `${this.apiUrl}/paiements/evolution`,
        {
          headers,
          params,
          responseType: 'json',
        }
      )
      .pipe(
        catchError(this.handleError<PaiementEvolution>('getPaiementsEvolution'))
      );
  }

  getHistoLoyer(
    options: {
      id_boutique?: string | null;
      date_debut?: string;
      date_fin?: string;
      page?: number;
      limit?: number;
    }
  ): Observable<PaginatedResponse<HistoLoyer>> {

    const headers = this.getAuthHeaders();

    const params: any = {
      page: options.page ?? 1,
      limit: options.limit ?? 10,
    };

    if (options.id_boutique) params.id_boutique = options.id_boutique;
    if (options.date_debut) params.date_debut = options.date_debut;
    if (options.date_fin) params.date_fin = options.date_fin;

    return this.http
      .get<PaginatedResponse<HistoLoyer>>(
        `${this.apiUrl}/histo-loyer`,
        { headers, params }
      )
      .pipe(
        catchError(this.handleError<PaginatedResponse<HistoLoyer>>('getHistoLoyer'))
      );
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

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed:`, error);
      return throwError(() => new Error(`${operation} a échoué : ${error.message}`));
    };
  }
}
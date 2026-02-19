import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
}

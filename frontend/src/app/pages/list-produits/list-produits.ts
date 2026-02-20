import { Component, OnInit } from '@angular/core';
import { ProduitService } from '../../services/produit/produit'
import { ProduitsParBoutique } from '../../models/produits-par-boutique.model';
import { DecimalPipe, CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-produits',
  templateUrl: './list-produits.html',
  styleUrls: ['./list-produits.css'],
  imports: [ DecimalPipe, CommonModule, Navbar, Footer ]
})
export class ListProduits implements OnInit {

  produitsGroupes: ProduitsParBoutique[] = [];
  loading = true;
  error = '';

  constructor(private produitService: ProduitService) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.produitService.getProduitsGroupByBoutique().subscribe({
      next: (data) => {
        this.produitsGroupes = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });

    this.produitsGroupes = this.produitsGroupes;

    this.loading = false;
  }

  getImageUrl(image?: string): string {
    return image ? `${environment.apiBaseUrl}${image}` : '/img/default-product.png';
  }
}
// list-produits.component.ts
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProduitService } from '../../services/produit/produit';
import { FavorisService } from '../../services/favoris/favoris';
import { ProduitsParBoutique } from '../../models/produits-par-boutique.model';
import { DecimalPipe, CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { environment } from '../../../environments/environment';
import { Produit } from '../../models/produit.model';

declare const bootstrap: any;   // ← important pour manipuler le modal

@Component({
  selector: 'app-produits',
  templateUrl: './list-produits.html',
  styleUrls: ['./list-produits.css'],
  standalone: true,
  imports: [DecimalPipe, CommonModule, Navbar, Footer]
})
export class ListProduits implements OnInit {

  produitsGroupes: ProduitsParBoutique[] = [];
  loading = true;
  error = '';

  isClient = !!localStorage.getItem('client');

  selectedProduit: Produit | null = null;

  private modalInstance: any;

  constructor(
    private produitService: ProduitService,
    private favorisService: FavorisService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  ngAfterViewInit() {
    // Récupère l'instance du modal une fois le DOM prêt
    const modalEl = document.getElementById('produitDetailModal');
    if (modalEl) {
      this.modalInstance = new bootstrap.Modal(modalEl);
    }
  }

  loadProduits(): void {
    this.produitService.getProduitsGroupByBoutique().subscribe({
      next: (data) => {
        this.produitsGroupes = data;
        
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  openDetails(produit: Produit) {
    this.selectedProduit = produit;
    this.cdr.detectChanges();           // met à jour le modal avec les nouvelles données
    if (this.modalInstance) {
      this.modalInstance.show();
    }
  }

  toggleFavorite(produit: Produit): void {
    if (!this.isClient) {
      alert("Connectez-vous en tant que client pour utiliser les favoris");
      return;
    }

    const wasFavorite = !!produit.isFavorite;

    if (wasFavorite) {
      this.favorisService.removeFromFavorites(produit._id).subscribe({
        next: () => {
          produit.isFavorite = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          alert("Erreur lors du retrait des favoris");
        }
      });
    } else {
      this.favorisService.addToFavorites(produit._id).subscribe({
        next: () => {
          produit.isFavorite = true;
          this.cdr.detectChanges();
        },
        error: (err) => {
          if (err.status === 409) {
            produit.isFavorite = true;
          } else {
            console.error(err);
            alert("Erreur lors de l'ajout aux favoris");
          }
        }
      });
    }
  }


  getImageUrl(image?: string): string {
    return image ? `${environment.apiBaseUrl}${image}` : '/img/default-product.png';
  }

  truncateDescription(desc: string, maxLength = 80): string {
    if (!desc) return '';
    if (desc.length <= maxLength) return desc;
    return desc.substring(0, maxLength) + '...';
  }
}
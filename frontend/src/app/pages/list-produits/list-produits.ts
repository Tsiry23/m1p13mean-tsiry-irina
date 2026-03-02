import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ProduitService } from '../../services/produit/produit';
import { FavorisService } from '../../services/favoris/favoris';
import { ProduitsParBoutique } from '../../models/produits-par-boutique.model';
import { DecimalPipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ← ajouté
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { environment } from '../../../environments/environment';
import { Produit } from '../../models/produit.model';

declare const bootstrap: any;

@Component({
  selector: 'app-produits',
  templateUrl: './list-produits.html',
  styleUrls: ['./list-produits.css'],
  standalone: true,
  imports: [DecimalPipe, CommonModule, FormsModule, Navbar, Footer] // ← FormsModule ajouté
})
export class ListProduits implements OnInit {

  // Données brutes (non filtrées)
  allProduitsGroupes: ProduitsParBoutique[] = [];
  
  // Données affichées (après filtrage)
  produitsGroupes: ProduitsParBoutique[] = [];
  
  loading = true;
  error = '';

  isClient = !!localStorage.getItem('client');

  selectedProduit: Produit | null = null;
  private modalInstance: any;

  // Filtres
  filtreNomBoutique: string = '';
  filtreNomProduit: string = '';
  filtreQtMin: number | null = null;
  filtreQtMax: number | null = null;
  filtrePrixMin: number | null = null;
  filtrePrixMax: number | null = null;

  constructor(
    private produitService: ProduitService,
    private favorisService: FavorisService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  ngAfterViewInit() {
    const modalEl = document.getElementById('produitDetailModal');
    if (modalEl) {
      this.modalInstance = new bootstrap.Modal(modalEl);
    }
  }

  loadProduits(): void {
    this.produitService.getProduitsGroupByBoutique().subscribe({
      next: (data) => {
        this.allProduitsGroupes = data;
        this.applyFilters(); // applique les filtres (même vides au départ)
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.message;
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    if (!this.allProduitsGroupes.length) {
      this.produitsGroupes = [];
      return;
    }

    const nomBoutiqueLower = this.filtreNomBoutique?.trim().toLowerCase() || '';
    const nomProduitLower = this.filtreNomProduit?.trim().toLowerCase() || '';

    this.produitsGroupes = this.allProduitsGroupes
      .map(groupe => {
        // On filtre les produits de la boutique
        const produitsFiltres = groupe.produits.filter(p => {
          // Nom boutique
          if (nomBoutiqueLower && !groupe.boutique.nom.toLowerCase().includes(nomBoutiqueLower)) {
            return false;
          }

          // Nom produit
          if (nomProduitLower && !p.nom.toLowerCase().includes(nomProduitLower)) {
            return false;
          }

          // Quantité min
          if (this.filtreQtMin !== null && p.qt_actuel < this.filtreQtMin) {
            return false;
          }

          // Quantité max
          if (this.filtreQtMax !== null && p.qt_actuel > this.filtreQtMax) {
            return false;
          }

          // Prix min
          if (this.filtrePrixMin !== null && p.prix_actuel < this.filtrePrixMin) {
            return false;
          }

          // Prix max
          if (this.filtrePrixMax !== null && p.prix_actuel > this.filtrePrixMax) {
            return false;
          }

          return true;
        });

        // On ne garde la boutique que si elle a au moins un produit après filtrage
        if (produitsFiltres.length === 0) {
          return null;
        }

        return {
          ...groupe,
          produits: produitsFiltres
        };
      })
      .filter((g): g is ProduitsParBoutique => g !== null); // retire les null

    this.cdr.detectChanges();
  }

  // Méthode appelée à chaque changement de filtre
  onFilterChange(): void {
    this.applyFilters();
  }

  openDetails(produit: Produit) {
    this.selectedProduit = produit;
    this.cdr.detectChanges();
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

  // Optionnel : reset tous les filtres
  resetFilters(): void {
    this.filtreNomBoutique = '';
    this.filtreNomProduit = '';
    this.filtreQtMin = null;
    this.filtreQtMax = null;
    this.filtrePrixMin = null;
    this.filtrePrixMax = null;
    this.applyFilters();
  }
}
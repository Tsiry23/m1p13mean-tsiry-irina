import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProduitService } from '../../services/produit/produit';
import { VenteService, EnregistrerResponse } from '../../services/vente/vente';
import { Produit } from '../../models/produit.model';
import { environment } from '../../../environments/environment';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { TypePaiement } from '../../models/typepaiement.model';
import { EnregistrerVenteCommandeDto } from '../../models/enregistrer-vente-commandeDto.model';

interface PanierItem {
  produit: Produit;
  quantite: number;
}

@Component({
  selector: 'app-vente-produits',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './vente-produits.html',
  styleUrls: ['./vente-produits.css']
})
export class VenteProduitsComponent implements OnInit {

  produits: Produit[] = [];
  panier: { [key: string]: PanierItem } = {};

  typesPaiement: TypePaiement[] = [];
  selectedTypePaiement: string = '';

  loading = true;
  paiementLoading = false;
  transactionLoading = false;

  error = '';
  errorMessage = '';
  successMessage = '';

  constructor(
    private produitService: ProduitService,
    private venteService: VenteService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.chargerProduits();
    this.chargerTypesPaiement();
  }

  chargerProduits(): void {
    this.produitService.getProduits().subscribe({
      next: (data) => {
        this.produits = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.message || 'Impossible de charger les produits';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  chargerTypesPaiement(): void {
    this.paiementLoading = true;
    this.venteService.getTypesPaiement().subscribe({
      next: (types) => {
        this.typesPaiement = types;
        this.paiementLoading = false;
        if (types.length > 0) {
          this.selectedTypePaiement = types[0]._id;
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.message || 'Impossible de charger les moyens de paiement';
        this.paiementLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  getImageUrl(image?: string): string {
    return image ? `${environment.apiBaseUrl}${image}` : '/assets/img/default-product.png';
  }

  // ─── Gestion panier ────────────────────────────────────────

  ajouterAuPanier(produit: Produit): void {
    if (this.panier[produit._id]) {
      this.panier[produit._id].quantite += 1;
    } else {
      this.panier[produit._id] = { produit, quantite: 1 };
    }
    this.cdr.detectChanges();
  }

  retirerDuPanier(id: string): void {
    delete this.panier[id];
    this.cdr.detectChanges();
  }

  changerQuantite(id: string, nouvelleQt: number): void {
    if (nouvelleQt < 1) {
      this.retirerDuPanier(id);
    } else {
      this.panier[id].quantite = nouvelleQt;
    }
    this.cdr.detectChanges();
  }

  getPanierArray(): PanierItem[] {
    return Object.values(this.panier);
  }

  getTotalPanier(): number {
    return this.getPanierArray().reduce((sum, item) => {
      return sum + (item.produit.prix_actuel || 0) * item.quantite;
    }, 0);
  }

  panierEstVide(): boolean {
    return Object.keys(this.panier).length === 0;
  }

  peutFaireVente(): boolean {
    return this.getPanierArray().every(item => item.produit.qt_actuel >= item.quantite);
  }

  // ─── Validation ─────────────────────────────────────────────

  validerVente(): void {
    if (this.panierEstVide()) return;
    if (!this.selectedTypePaiement) {
      alert('Veuillez sélectionner un moyen de paiement.');
      return;
    }
    if (!this.peutFaireVente()) {
      alert('Vente impossible : stock insuffisant sur un ou plusieurs articles.');
      return;
    }

    if (!confirm(`Confirmer la VENTE pour ${this.getTotalPanier().toLocaleString()} Ar ?`)) {
      return;
    }

    this.executerTransaction();
  }

  private executerTransaction(): void {
    this.transactionLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload: EnregistrerVenteCommandeDto = {
      type: 'vente',
      id_client: '',
      id_type_paiement: this.selectedTypePaiement,
      produits: this.getPanierArray().map(item => ({
        id_produit: item.produit._id,
        qt: item.quantite,
        prix_vente: item.produit.prix_actuel || 0
      }))
    };

    this.venteService.enregistrerVenteOuCommande(payload).subscribe({
      next: (res: EnregistrerResponse) => {
        this.transactionLoading = false;
        alert(`${res.message} (Total: ${res.total.toLocaleString()} Ar)`);
        this.viderPanier();
        this.chargerProduits();
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.transactionLoading = false;
        alert('Erreur lors de l\'enregistrement');
        this.chargerProduits();
        this.cdr.detectChanges();
      }
    });
  }

  private viderPanier(): void {
    this.panier = {};
  }
}
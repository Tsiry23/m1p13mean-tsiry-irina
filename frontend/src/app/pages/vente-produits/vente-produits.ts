import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProduitService } from '../../services/produit/produit'; // adapte le chemin
import { Produit } from '../../models/produit.model';
import { environment } from '../../../environments/environment';
import { SidebarComponent } from '../../components/sidebar/sidebar';


interface PanierItem {
  produit: Produit;
  quantite: number;
}

@Component({
  selector: 'app-vente-produits',
  standalone: true,
  imports: [CommonModule, FormsModule,SidebarComponent],
  templateUrl: './vente-produits.html',
  styleUrls: ['./vente-produits.css']
})
export class VenteProduitsComponent implements OnInit {

  produits: Produit[] = [];
  panier: { [key: string]: PanierItem } = {};   // clé = _id du produit

  loading = true;
  error = '';

  constructor(
    private produitService: ProduitService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
      console.log("Charging");
    this.chargerProduits();
    this.cdr.detectChanges();
  }

  chargerProduits(): void {
    this.produitService.getProduits().subscribe({
      next: (data) => {
        this.produits = data;
        console.log("hehe");
        this.loading = false;

        this.cdr.detectChanges();
      },
      error: (err) => {
        this.error = err.message || 'Impossible de charger les produits';
        this.loading = false;
      }
    });
  }

  getImageUrl(image?: string): string {
    return image ? `${environment.apiBaseUrl}${image}` : '/assets/img/default-product.png';
  }

  // ─── Panier ────────────────────────────────────────
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

  // Vérifie si TOUS les produits du panier ont assez de stock
  peutFaireVente(): boolean {
    return this.getPanierArray().every(item => {
      return item.produit.qt_actuel >= item.quantite;
    });
  }

  // ─── Validation ─────────────────────────────────────
  validerVente(): void {
    if (this.panierEstVide()) return;

    if (!this.peutFaireVente()) {
      alert("Vente impossible : certains produits n'ont pas assez de stock.");
      return;
    }

    if (!confirm(`Confirmer la VENTE pour un total de ${this.getTotalPanier()} Ar ?`)) {
      return;
    }

    this.envoyerTransaction('vente');
    this.cdr.detectChanges();
  }

  validerCommande(): void {
    if (this.panierEstVide()) return;

    if (!confirm(`Confirmer la COMMANDE pour un total de ${this.getTotalPanier()} Ar ?`)) {
      return;
    }

    this.envoyerTransaction('commande');
    this.cdr.detectChanges();
  }

  private envoyerTransaction(type: 'vente' | 'commande'): void {
    // Préparation du payload attendu par le backend
    const payload = {
      type,
      id_client: 'Divers',   // ← À adapter (modal ? profil ?)
      produits: this.getPanierArray().map(item => ({
        id_produit: item.produit._id,
        qt: item.quantite,
        prix_vente: item.produit.prix_actuel   // ou prix négocié si tu veux
      })),
      // Ajoute selon besoin :
      // id_type_paiement: ...   (pour vente)
      // date_recuperation_prevue: ... (pour commande)
    };

    // À implémenter : appel HTTP vers ton endpoint
    // ex: this.http.post('/api/ventes/enregistrer', payload).subscribe(...)
    console.log('Envoi vers backend :', payload);

    this.cdr.detectChanges();
  }
}
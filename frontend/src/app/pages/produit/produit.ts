import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { Produit } from '../../models/produit.model';
import { ProduitService } from '../../services/produit/produit';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-produit',
  standalone: true,
  imports: [CommonModule, FormsModule, SidebarComponent],
  templateUrl: './produit.html',
  styleUrls: ['./produit.css']
})
export class ProduitComponent implements OnInit {
  produits: Produit[] = [];
  showForm = false;
  isEditing = false;
  apiUrl = `${environment.apiBaseUrl}`;

  currentProduit: Produit = {
    nom: '',
    description: '',
    qt_actuel: 0,
    qt_en_cours_commande: 0,
    prix_actuel: 0
  };

  quantiteAjout: number = 0;
  originalQtActuel: number | null = null;

  selectedFile: File | undefined = undefined;
  previewUrl: string | null = null;

  constructor(private produitService: ProduitService) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits() {
    this.produitService.getProduits().subscribe({
      next: (data) => {
        this.produits = [...data];
      },
      error: (err) => {
        console.error(err);
        alert('Impossible de charger les produits');
      }
    });
  }

  openAddForm() {
    this.isEditing = false;
    this.resetForm();
    this.showForm = true;
  }

  openEditForm(produit: Produit) {
    this.isEditing = true;
    this.currentProduit = { ...produit };
    this.originalQtActuel = produit.qt_actuel;
    this.quantiteAjout = 0;
    this.previewUrl = produit.image || null;
    this.selectedFile = undefined;
    this.showForm = true;
  }

  openEntreeForm(produit: Produit) {
    this.openEditForm(produit);
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  private resetForm() {
    this.currentProduit = {
      nom: '',
      description: '',
      qt_actuel: 0,
      qt_en_cours_commande: 0,
      prix_actuel: 0
    };
    this.originalQtActuel = null;
    this.quantiteAjout = 0;
    this.selectedFile = undefined;
    this.previewUrl = null;
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  get isEntreeMode(): boolean {
    return this.isEditing && this.originalQtActuel !== null;
  }

  get nouvelleQuantiteCalculee(): number {
    return (this.originalQtActuel || 0) + (this.quantiteAjout || 0);
  }

  get formTitle(): string {
    if (!this.isEditing) return 'Nouveau produit';
    return this.isEntreeMode ? 'Déclarer entrée de stock' : 'Modifier le produit';
  }

  get submitButtonText(): string {
    if (!this.isEditing) return 'Ajouter le produit';
    return this.isEntreeMode ? "Enregistrer l'entrée" : 'Enregistrer les modifications';
  }

  get submitButtonClass(): string {
    if (!this.isEditing) return 'btn-success';
    return this.isEntreeMode ? 'btn-info' : 'btn-primary';
  }

  saveProduit() {
    if (this.isEditing && this.currentProduit._id) {
      this.produitService.updateProduit(this.currentProduit._id, this.currentProduit, this.selectedFile)
        .subscribe({
          next: () => {
            this.loadProduits();
            this.closeForm();
            alert('Produit modifié avec succès');
          },
          error: (err) => {
            console.error(err);
            alert('Erreur lors de la modification');
          }
        });
    } else {
      this.produitService.addProduit(this.currentProduit, this.selectedFile)
        .subscribe({
          next: () => {
            this.loadProduits();
            this.closeForm();
            alert('Produit ajouté avec succès');
          },
          error: (err) => {
            console.error(err);
            alert('Erreur lors de l\'ajout');
          }
        });
    }
  }

  declareEntreeStock() {
    if (!this.currentProduit._id) return;
    if (this.quantiteAjout <= 0) {
      alert('Veuillez entrer une quantité positive à ajouter');
      return;
    }

    const nouvelleQt = this.nouvelleQuantiteCalculee;

    const payload = { qt_actuel: nouvelleQt };

    this.produitService.updateQuantiteActuelle(this.currentProduit._id, payload)
      .subscribe({
        next: () => {
          this.loadProduits();
          this.closeForm();
          alert(`Entrée de ${this.quantiteAjout} unités enregistrée. Nouvelle quantité : ${nouvelleQt}`);
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de l\'enregistrement de l\'entrée');
        }
      });
  }
}
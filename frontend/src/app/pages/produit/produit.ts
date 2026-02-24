import { Component, OnInit,ChangeDetectorRef } from '@angular/core';
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
    _id: '',
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

  constructor(private produitService: ProduitService,private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits() {
    this.produitService.getProduits().subscribe({
      next: (data) => {
        this.produits = [...data];
         this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('Impossible de charger les produits');
      }
    });
  }

  notify(id : string) {
    this.produitService.notify(id);
  }

  openAddForm() {
    this.isEditing = false;
    this.resetForm();
    this.showForm = true;
    this.cdr.detectChanges();
  }

  openEditForm(produit: Produit) {
    this.isEditing = true;
    this.currentProduit = { ...produit };
    this.originalQtActuel = produit.qt_actuel;
    this.quantiteAjout = 0;
    this.previewUrl = produit.image || null;
    this.selectedFile = undefined;
    this.showForm = true;
    this.cdr.detectChanges();
  }

  openEntreeForm(produit: Produit) {
    this.openEditForm(produit);
    this.cdr.detectChanges();
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
    this.cdr.detectChanges();
  }

  private resetForm() {
    this.currentProduit = {
      _id:'',
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
    this.cdr.detectChanges();
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = () => this.previewUrl = reader.result as string;
      reader.readAsDataURL(file);
    }
    this.cdr.detectChanges();
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
    this.cdr.detectChanges();
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
          this.notify(this.currentProduit._id);
          this.loadProduits();
          this.closeForm();
          alert(`Entrée de ${this.quantiteAjout} unités enregistrée. Nouvelle quantité : ${nouvelleQt}`);
        },
        error: (err) => {
          console.error(err);
          alert('Erreur lors de l\'enregistrement de l\'entrée');
        }
      });
    this.cdr.detectChanges();
  }
}
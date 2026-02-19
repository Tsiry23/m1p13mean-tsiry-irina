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
    qt_actuel: 0,
    qt_en_cours_commande: 0,
    prix_actuel: 0
  };

  selectedFile: File | undefined = undefined;
  previewUrl: string | null = null;

  constructor(private produitService: ProduitService) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits() {
    this.produitService.getProduits().subscribe({
      next: (data) => {
        this.produits = [...data]
      } ,
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
    this.previewUrl = produit.image || null;
    this.selectedFile = undefined;
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
    this.resetForm();
  }

  private resetForm() {
    this.currentProduit = { nom: '', qt_actuel: 0, qt_en_cours_commande: 0, prix_actuel: 0 };
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

  saveProduit() {
    if (this.isEditing && this.currentProduit._id) {
      // Mise à jour
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
      // Création
      // this.produits.push(this.currentProduit)
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
        this.produits = this.produits;
    }
  }
}
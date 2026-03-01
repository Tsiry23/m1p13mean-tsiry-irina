import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BoutiqueService } from '../../services/boutique/boutique';
import { Boutique } from '../../models/boutique.model';
import { environment } from '../../../environments/environment';
import { MallAdminSidebar } from '../../components/mall-admin-sidebar/mall-admin-sidebar';
import { DecimalPipe, CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms';
import { PaiementService } from '../../services/paiement/paiement';
import { Paiement } from '../../models/paiement.model';

@Component({
  selector: 'app-boutiques',
  imports: [MallAdminSidebar, DecimalPipe, CommonModule, FormsModule],
  templateUrl: './mall-boutique.html',
  styleUrls: ['../admin-home/variables.css', './mall-boutique.css']
})
export class MallBoutique implements OnInit {

  boutiques: Boutique[] = [];
  showForm = false;
  loading = false;

  apiUrl = environment.apiBaseUrl;

  currentBoutique: Boutique = {
    nom: '',
    nom_emplacement: '',
    description: '',
    taille_m2: 0,
    loyer: 0,
    email: ''
  };

  selectedFile?: File;
  previewUrl: string | null = null;

  showPaiementModal = false;
  selectedBoutique?: Boutique;

  paiement: Paiement = {
    total_a_payer: 0,
    date_: '',
    id_boutique: '',
    periode: ''
  };

  constructor(private boutiqueService: BoutiqueService, private paiementService: PaiementService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.loadBoutiques();
  }

  loadBoutiques() {
    this.boutiqueService.getBoutiques().subscribe({
      next: (data) => {
        this.boutiques = [...data];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('Impossible de charger les boutiques');
      }
    });
  }

  openAddForm() {
    this.resetForm();
    this.showForm = true;
  }

  closeForm() {
    this.showForm = false;
  }

  saveBoutique() {
    this.loading = true;

    console.log('Données envoyées :', this.currentBoutique);

    this.boutiqueService.addBoutique(this.currentBoutique, this.selectedFile).subscribe({
      next: (response) => {
        this.loading = false;
        this.showForm = false;
        this.loadBoutiques();
        this.cdr.detectChanges();

        // Succès : alerte ou toast de confirmation
        alert('Boutique créée avec succès !');
        // Ou mieux : this.toastr.success('Boutique créée avec succès');
      },
      error: (err: any) => {
        this.loading = false;

        let errorMessage = 'Une erreur est survenue lors de la création de la boutique.';

        // On essaie de récupérer le message précis envoyé par le backend
        if (err.error && err.error.message) {
          errorMessage = err.error.message;
        } else if (err.message) {
          errorMessage = err.message;
        }

        // Gestion par code HTTP (très utile pour ton cas)
        switch (err.status) {
          case 400:
            errorMessage = err.error?.message || 'Données invalides (champs manquants ou incorrects)';
            break;
          case 401:
            errorMessage = 'Non authentifié – Veuillez vous reconnecter';
            // Option : this.router.navigate(['/login']);
            break;
          case 403:
            errorMessage = 'Accès interdit – Vous n\'avez pas les droits nécessaires';
            break;
          case 404:
            errorMessage = err.error?.message || 'Ressource introuvable (utilisateur ou rôle non trouvé)';
            break;
          case 500:
            errorMessage = 'Erreur serveur interne – Contactez l\'administrateur';
            break;
          case 0:
            errorMessage = 'Impossible de contacter le serveur (problème réseau ou CORS)';
            break;
          default:
            errorMessage += ` (code ${err.status})`;
        }

        // Affichage final
        alert(errorMessage);  // ← alerte basique

        // Alternative recommandée si tu as une lib de notification :
        // this.toastr.error(errorMessage, 'Erreur');
        // Ou avec Angular Material Snackbar :
        // this.snackBar.open(errorMessage, 'Fermer', { duration: 8000, panelClass: ['error-snackbar'] });

        console.error('Erreur complète :', err);
        this.cdr.detectChanges();
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => this.previewUrl = reader.result as string;
    reader.readAsDataURL(file);
  }

  resetForm() {
    this.currentBoutique = { nom: '', description: '', taille_m2: 0, loyer: 0 };
    this.selectedFile = undefined;
    this.previewUrl = null;
  }

  openPaiementModal(boutique: Boutique) {
    this.selectedBoutique = boutique;

    const now = new Date();
    const localDateTime = now.toISOString().slice(0, 16);

    this.paiement = {
      total_a_payer: boutique.loyer ?? 0,
      date_: localDateTime,
      id_boutique: boutique._id!
    };

    this.showPaiementModal = true;
    this.cdr.detectChanges();
  }

  closePaiementModal() {
    this.showPaiementModal = false;
    this.selectedBoutique = undefined;
    this.cdr.detectChanges();
  }

  addPaiement() {
    if (!this.paiement.periode) {
      alert('Veuillez sélectionner une période');
      return;
    }

    this.loading = true;

    // Conversion "YYYY-MM" → Date (1er jour du mois)
    if (typeof this.paiement.periode === 'string') {
      const [year, month] = this.paiement.periode.split('-').map(Number);
      this.paiement.periode = new Date(year, month - 1, 1);
    }

    this.paiementService.addPaiement(this.paiement).subscribe({
      next: () => {
        this.loading = false;
        this.closePaiementModal();
        alert('Paiement enregistré avec succès');
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.loading = false;
        alert('Erreur lors de l’enregistrement du paiement');
        this.cdr.detectChanges();
      }
    });
  }

  getImageUrl(image?: string): string {
    return image ? `${environment.apiBaseUrl}${image}` : '/img/default-product.png';
  }
}
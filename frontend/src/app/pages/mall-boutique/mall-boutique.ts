import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { BoutiqueService } from '../../services/boutique/boutique';
import { Boutique } from '../../models/boutique.model';
import { environment } from '../../../environments/environment';
import { MallAdminSidebar } from '../../components/mall-admin-sidebar/mall-admin-sidebar';
import { DecimalPipe, CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms';
import { PaiementService } from '../../services/paiement/paiement';
import { Paiement } from '../../models/paiement.model';
import { LignePaiement } from '../../models/lignepaiement.model';
import { HistoLoyerService } from '../../services/histo-loyer/histo-loyer';
import { forkJoin } from 'rxjs';

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
  selectedYear = new Date().getFullYear();
  lignesPaiement: LignePaiement[] = [];
  paiementsExistants: any[] = [];
  histoLoyer: any[] = [];

  apiUrl = environment.apiBaseUrl;

  currentBoutique: Boutique = {
    nom: '',
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

  constructor(private boutiqueService: BoutiqueService, private paiementService: PaiementService, private histoLoyerService: HistoLoyerService, private cdr: ChangeDetectorRef) { }

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

    this.loadPaiementsAnnee();

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

  loadPaiementsAnnee() {
    if (!this.selectedBoutique) return;

    const debut = new Date(this.selectedYear, 0, 1).toISOString();
    const fin = new Date(this.selectedYear, 11, 31).toISOString();

    // ✅ On réinitialise AVANT de charger pour éviter l'affichage des données précédentes
    this.lignesPaiement = [];
    this.loading = true;

    forkJoin({
      paiements: this.paiementService.searchPaiements({
        id_boutique: this.selectedBoutique._id,
        dateDebut: debut,
        dateFin: fin
      }),
      histo: this.histoLoyerService.getHistoLoyerByBoutique(this.selectedBoutique._id ?? '')
    }).subscribe({
      next: ({ paiements, histo }) => {
        // ✅ Les deux réponses sont disponibles ICI, en même temps
        this.paiementsExistants = paiements;
        this.histoLoyer = histo;

        this.lignesPaiement = [];

        for (let mois = 0; mois < 12; mois++) {
          const periode = new Date(Date.UTC(this.selectedYear, mois, 1));

          const paiementExistant = paiements.find(p => {
            if (!p.periode) return false;
            const d = new Date(p.periode);
            return (
              d.getFullYear() === periode.getFullYear() &&
              d.getMonth() === periode.getMonth()
            );
          });

          const montant = this.getLoyerPourDate(periode, histo);

          // ✅ Conversion en string compatible avec datetime-local
          const dateFormatted = paiementExistant?.date_
            ? this.toDatetimeLocal(new Date(paiementExistant.date_))
            : null;

          this.lignesPaiement.push({
            periode,
            total_a_payer: montant,
            date_: dateFormatted,
            dejaPaye: !!paiementExistant
          });
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement paiements/histo', err);
        this.loading = false;
      }
    });
  }

  getLoyerPourDate(date: Date, histo: any[]): number {
    const changements = histo
      .filter(h => new Date(h.date_changement) <= date)
      .sort((a, b) =>
        new Date(b.date_changement).getTime() -
        new Date(a.date_changement).getTime()
      );

    const currentLoyer: number = this.selectedBoutique?.loyer ?? 0;

    return changements.length
      ? changements[0].nouvelle_valeur
      : currentLoyer;
  }

  toDatetimeLocal(date: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }

  validerPaiements() {
    if (!this.selectedBoutique) return;

    const paiements: Paiement[] = this.lignesPaiement
      .filter(l => !l.dejaPaye && l.date_ !== null)
      .map(l => ({
        total_a_payer: l.total_a_payer,
        periode: l.periode,
        date_: l.date_!,          // string "YYYY-MM-DDTHH:mm"
        id_boutique: this.selectedBoutique!._id ?? '',
        en_retard: l.periode < new Date()
      }));

    this.paiementService.createMany(paiements).subscribe({
      next: () => {
        alert("Insertion réussie");
        console.log("Insertion réussie");
        this.closePaiementModal();
      },
      error: (err) => {
        alert("Erreur lors de l'insertion");
        console.error("Erreur lors de l'insertion des paiements", err);
      }
    });
  }

  // 🗓️ Retourne les années disponibles pour le contrat de la boutique
  getAnneesDisponibles(): number[] {
    if (!this.selectedBoutique) {
      return [new Date().getFullYear()]; // fallback
    }

    const currentYear = new Date().getFullYear();

    // Début du contrat
    let debutAnnee = this.selectedBoutique.debut_contrat
      ? new Date(this.selectedBoutique.debut_contrat).getFullYear()
      : currentYear;

    // Fin du contrat
    let finAnnee = this.selectedBoutique.fin_contrat
      ? new Date(this.selectedBoutique.fin_contrat).getFullYear()
      : currentYear;

    // Sécurité : si les deux dates sont nulles, on garde l'année courante
    debutAnnee = debutAnnee || currentYear;
    finAnnee = finAnnee || currentYear;

    const annees: number[] = [];
    for (let y = debutAnnee; y <= finAnnee; y++) {
      annees.push(y);
    }

    return annees;
  }
}
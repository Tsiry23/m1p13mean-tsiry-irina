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
    description: '',
    taille_m2: 0,
    loyer: 0
  };

  selectedFile?: File;
  previewUrl: string | null = null;

  showPaiementModal = false;
  selectedBoutique?: Boutique;

  paiement: Paiement = {
    total_a_payer: 0,
    date_: '',
    id_boutique: ''
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

    this.boutiqueService.addBoutique(this.currentBoutique, this.selectedFile).subscribe({
      next: () => {
        this.loading = false;
        this.showForm = false;
        this.loadBoutiques();

        this.cdr.detectChanges();
      },
      error: () => this.loading = false
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
    this.loading = true;

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
}
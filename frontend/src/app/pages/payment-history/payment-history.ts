import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { MallAdminSidebar } from '../../components/mall-admin-sidebar/mall-admin-sidebar';
import { PaiementService } from '../../services/paiement/paiement';
import { BoutiqueService } from '../../services/boutique/boutique';
import { Boutique } from '../../models/boutique.model';
import { PaiementPopulate } from '../../models/paiement-populate.model';

@Component({
  selector: 'app-paiement-historique',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, MallAdminSidebar],
  templateUrl: './payment-history.html',
  styleUrls: ['../admin-home/variables.css']
})
export class PaymentHistory implements OnInit {

  paiements: PaiementPopulate[] = [];
  boutiques: Boutique[] = [];
  total = 0;

  filters = {
    id_boutique: '',
    dateDebut: '',
    dateFin: ''
  };

  constructor(
    private paiementService: PaiementService,
    private boutiqueService: BoutiqueService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadBoutiques();
    this.search();
  }

  loadBoutiques() {
    this.boutiqueService.getBoutiques().subscribe({
      next: (data) => {
        this.boutiques = [...data];
        this.cdr.detectChanges();
      }
    });
  }

  search() {
    this.paiementService.searchPaiements(this.filters).subscribe({
      next: (data) => {
        this.paiements = [...data];
        this.calculateTotal();
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        alert('Erreur lors du chargement des paiements');
      }
    });
  }

  calculateTotal() {
    this.total = this.paiements.reduce(
      (sum, p) => sum + (p.total_a_payer || 0),
      0
    );
  }
}
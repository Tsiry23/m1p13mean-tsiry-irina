import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { SidebarComponent } from '../../components/sidebar/sidebar';
import { PaiementService } from '../../services/paiement/paiement';
import { PaiementPopulate } from '../../models/paiement-populate.model';

@Component({
  selector: 'app-boutique-payment-history',
  imports: [CommonModule, FormsModule, DecimalPipe, SidebarComponent],
  templateUrl: './boutique-payment-history.html',
  styleUrls: ['../admin-home/variables.css', './boutique-payment-history.css'],
})
export class BoutiquePaymentHistory {
  paiements: PaiementPopulate[] = [];
  total = 0;

  filters = {
    dateDebut: '',
    dateFin: ''
  };

  constructor(
    private paiementService: PaiementService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.search();
  }

  search() {
    this.paiementService.searchPaiementsForBoutique(this.filters).subscribe({
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

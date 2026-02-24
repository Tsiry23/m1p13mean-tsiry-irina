import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MallAdminSidebar } from '../../components/mall-admin-sidebar/mall-admin-sidebar';
import { DashboardService } from '../../services/dashboard/dashboard';
import { BoutiqueService } from '../../services/boutique/boutique';
import { DashboardMetrics } from '../../models/dashboard-metrics.model';
import { CommonModule } from '@angular/common';
import { PaiementEvolution } from '../../models/paiement-evolution.model';
import { Boutique } from '../../models/boutique.model';
import { AfterViewInit, OnDestroy } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { FormsModule } from '@angular/forms';
import { HistoLoyer } from '../../models/histo-loyer.model';
import { PaginatedResponse } from '../../models/paginated-response.model';

@Component({
  selector: 'app-mall-admin-home',
  standalone: true,
  imports: [MallAdminSidebar, CommonModule, FormsModule],
  templateUrl: './mall-admin-home.html',
  styleUrls: ['../admin-home/variables.css', './mall-admin-home.css'],
})
export class MallAdminHome implements OnInit, AfterViewInit, OnDestroy {
  metrics?: DashboardMetrics;
  loading = true;

  paiementEvolution?: PaiementEvolution;
  chart?: Chart;

  selectedYear = new Date().getFullYear();
  selectedBoutiqueId?: string;

  loadingEvolution = false;

  loadingBoutiques = false;

  boutiques: Boutique[] = [];

  // Historique changement loyer

  histoLoyers: HistoLoyer[] = [];
  page = 1;
  limit = 10;
  totalPages = 0;
  dateDebut?: string;
  dateFin?: string;
  loadingHisto = false;
  selectedForTableBoutiqueId?: string;

  constructor(private dashboardService: DashboardService, private cdr: ChangeDetectorRef, private boutiqueService: BoutiqueService) { }

  ngAfterViewInit(): void {
    this.loadPaiementEvolution();
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  ngOnInit(): void {
    this.dashboardService.getMetrics().subscribe({
      next: (data) => {
        this.metrics = data;
        this.loading = false;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement metrics', err);
        this.loading = false;
      },
    });

    this.loadPaiementEvolution();
    this.loadBoutiques();
    this.loadHistoLoyer();
  }

  loadPaiementEvolution(): void {
    this.loadingEvolution = true;

    this.dashboardService
      .getPaiementsEvolution(this.selectedYear, this.selectedBoutiqueId || undefined)
      .subscribe({
        next: (data) => {
          this.paiementEvolution = data;
          this.renderChart();
          this.loadingEvolution = false;

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error(err);
          this.loadingEvolution = false;
        },
      });
  }

  loadBoutiques(): void {
    this.loadingBoutiques = true;

    this.boutiqueService.getBoutiques().subscribe({
      next: (data) => {
        this.boutiques = data;
        this.loadingBoutiques = false;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur chargement boutiques', err);
        this.loadingBoutiques = false;
      },
    });
  }

  loadHistoLoyer(): void {
    this.loadingHisto = true;

    this.dashboardService.getHistoLoyer({
      id_boutique: this.selectedForTableBoutiqueId,
      date_debut: this.dateDebut,
      date_fin: this.dateFin,
      page: this.page,
      limit: this.limit,
    }).subscribe({
      next: (res) => {
        this.histoLoyers = res.data;
        this.totalPages = res.totalPages;
        this.loadingHisto = false;

        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erreur histo loyer', err);
        this.loadingHisto = false;
      },
    });
  }

  renderChart(): void {
    const labels = [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
      'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc',
    ];

    const values = this.paiementEvolution?.data.map(d => d.totalPaye) ?? [];

    if (this.chart) {
      this.chart.destroy();
    }

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Total payé (Ar)',
            data: values,
            borderColor: '#0d6efd',
            backgroundColor: 'rgba(13,110,253,0.15)',
            tension: 0.35,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
          },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                `${ctx.parsed.y?.toLocaleString()} Ar`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) =>
                `${Number(value).toLocaleString()} Ar`,
            },
          },
        },
      },
    };

    const ctx = document.getElementById('paiementChart') as HTMLCanvasElement;
    this.chart = new Chart(ctx, config);
  }

  getMonthLabels(): string[] {
    return [
      'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin',
      'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc',
    ];
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.page++;
      this.loadHistoLoyer();
    }
  }

  prevPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadHistoLoyer();
    }
  }
}
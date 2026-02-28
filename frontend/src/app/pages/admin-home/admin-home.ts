import { Component, OnInit, OnDestroy, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { SidebarComponent } from '../../components/sidebar/sidebar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardBoutique, DashboardBoutiqueData } from '../../services/dashboard-boutique/dashboard-boutique';
import { Chart, ChartConfiguration } from 'chart.js/auto';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [SidebarComponent, CommonModule, FormsModule],
  templateUrl: 'admin-home.html',
  styleUrls: ['variables.css', 'admin-home.css']
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  data?: DashboardBoutiqueData;
  loading = true;

  // Filtre dates
  startDate = '2026-02-01';
  endDate = new Date().toISOString().split('T')[0];

  // Onglet actif pour le graphique évolution
  activeEvolution: 'annee' | 'mois' | 'semaine' = 'mois';

  // Charts
  chartEvolution?: Chart;
  chartPaiement?: Chart;

  constructor(
    private dashboardBoutiqueService: DashboardBoutique,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngAfterViewInit(): void {}

  ngOnDestroy(): void {
    this.chartEvolution?.destroy();
    this.chartPaiement?.destroy();
  }

  loadDashboard(): void {
    this.loading = true;
    this.dashboardBoutiqueService.getDashboard(this.startDate, this.endDate).subscribe({
      next: (data) => {
        this.data = data;
        this.loading = false;
        this.cdr.detectChanges();
        this.renderChartEvolution();
        this.renderChartPaiement();
      },
      error: (err) => {
        console.error('Erreur chargement dashboard boutique', err);
        this.loading = false;
      }
    });
  }

  setEvolutionTab(tab: 'annee' | 'mois' | 'semaine'): void {
    this.activeEvolution = tab;
    this.renderChartEvolution();
  }

  get evolutionData() {
    if (!this.data) return [];
    if (this.activeEvolution === 'annee') return this.data.evolution_ventes_annee;
    if (this.activeEvolution === 'semaine') return this.data.evolution_ventes_semaine;
    return this.data.evolution_ventes_mois;
  }

  renderChartEvolution(): void {
    const items = this.evolutionData;
    const labels = items.map(i => i.periode);
    const caData = items.map(i => i.ca);
    const ventesData = items.map(i => i.nombre_ventes);

    if (this.chartEvolution) {
      this.chartEvolution.destroy();
    }

    const ctx = document.getElementById('evolutionChart') as HTMLCanvasElement;
    if (!ctx) return;

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'CA (Ar)',
            data: caData,
            borderColor: '#0d6efd',
            backgroundColor: 'rgba(13,110,253,0.15)',
            tension: 0.35,
            fill: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: 'yCA',
          },
          {
            label: 'Nombre de ventes',
            data: ventesData,
            borderColor: '#198754',
            backgroundColor: 'rgba(25,135,84,0.1)',
            tension: 0.35,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6,
            yAxisID: 'yVentes',
          }
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: true },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const val = ctx.parsed.y;
                return ctx.dataset.yAxisID === 'yCA'
                  ? `CA : ${val?.toLocaleString()} Ar`
                  : `Ventes : ${val}`;
              }
            }
          }
        },
        scales: {
          yCA: {
            type: 'linear',
            position: 'left',
            beginAtZero: true,
            ticks: { callback: (v) => `${Number(v).toLocaleString()} Ar` }
          },
          yVentes: {
            type: 'linear',
            position: 'right',
            beginAtZero: true,
            grid: { drawOnChartArea: false }
          }
        }
      }
    };

    this.chartEvolution = new Chart(ctx, config);
  }

  renderChartPaiement(): void {
    if (!this.data) return;

    if (this.chartPaiement) {
      this.chartPaiement.destroy();
    }

    const ctx = document.getElementById('paiementChart') as HTMLCanvasElement;
    if (!ctx) return;

    const labels = this.data.ca_par_type_paiement.map(p => p.type_paiement);
    const values = this.data.ca_par_type_paiement.map(p => p.ca);
    const colors = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#0dcaf0', '#6f42c1'];

    const config: ChartConfiguration<'doughnut'> = {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: colors.slice(0, labels.length),
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label} : ${ctx.parsed?.toLocaleString()} Ar`
            }
          }
        }
      }
    };

    this.chartPaiement = new Chart(ctx, config);
  }
}
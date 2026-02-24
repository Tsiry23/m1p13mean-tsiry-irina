export interface DashboardMetrics {
  periode: Date | string;

  totalBoutiques: number;
  boutiquesActives: number;
  tauxOccupation: number;

  loyerAttendu: number;
  totalPaye: number;
  resteARecevoir: number;
}
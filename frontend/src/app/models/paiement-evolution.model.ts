export interface PaiementEvolutionPoint {
  mois: number;
  totalPaye: number;
}

export interface PaiementEvolution {
  annee: number;
  id_boutique: string | null;
  data: PaiementEvolutionPoint[];
}
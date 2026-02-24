export interface HistoLoyer {
  _id: string;
  date_changement: string;
  nouvelle_valeur: number;
  id_boutique: {
    _id: string;
    nom: string;
  };
  createdAt?: string;
  updatedAt?: string;
}
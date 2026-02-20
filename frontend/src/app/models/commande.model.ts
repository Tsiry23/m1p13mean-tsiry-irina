export interface Commande {
  _id?: string;

  date: Date;
  total?: number;

  date_confirmation?: Date | null;
  date_preparation?: Date | null;
  date_recuperation_prevue: Date;
  date_recuperation?: Date | null;

  date_rejet?: Date | null;
  date_annulation?: Date | null;
  date_remboursement?: Date | null;

  statut: string;

  id_client: {
    _id: string;
    nom: string;
    prenom: string;
  };
  
  id_vendeur: string;

  createdAt?: Date;
  updatedAt?: Date;
}

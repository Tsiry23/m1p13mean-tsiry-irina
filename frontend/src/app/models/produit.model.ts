export interface Produit {
  _id: string;
  nom: string;
  description: string;
  qt_actuel: number;
  qt_en_cours_commande: number;
  prix_actuel: number;
  image?: string;
  createdAt?: string;

  isFavorite?: boolean;          

  boutique?: { nom: string; };
}
import { Produit } from './produit.model';

export interface ProduitsParBoutique {
  boutique: {
    _id: string;
    nom: string;
  };
  produits: Produit[];
}
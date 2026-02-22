import { DetailProduitCommande } from "./detailproduitcommande.model";

export interface EnregistrerVenteCommandeDto {
  type: 'vente' | 'commande';
  id_client: string;
  id_type_paiement?: string;               // obligatoire pour vente
  date_recuperation_prevue?: string;       // obligatoire pour commande (ISO string)
  produits: DetailProduitCommande[];
}
import { Paiement } from './paiement.model';
import { Boutique } from './boutique.model';

export type PaiementPopulate = Omit<Paiement, 'id_boutique'> & {
  id_boutique: Boutique;
};
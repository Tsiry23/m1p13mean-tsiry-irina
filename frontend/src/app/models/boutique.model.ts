export interface Boutique {
  _id?: string;

  nom: string;
  
  email?: string;
  nom_emplacement?: string;

  description?: string | null;

  taille_m2?: number | null;
  loyer?: number | null;

  image?: string;

  contrat?: string | null;

  debut_contrat?: Date | string | null;
  fin_contrat?: Date | string | null;

  active?: boolean;

  heure_ouverture?: string | null;
  heure_fermeture?: string | null;

  contact?: string[];
  mail?: string[];

  createdAt?: Date | string;
  updatedAt?: Date | string;
}
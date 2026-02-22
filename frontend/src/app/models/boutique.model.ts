export interface Boutique {
  _id?: string;

  nom: string;
  description?: string | null;

  taille_m2?: number | null;
  loyer?: number | null;

  image?: string;

  contrat?: string | null;

  debut_contrat?: Date | string | null;
  fin_contrat?: Date | string | null;

  active?: boolean;

  heure_ouverture?: string | null; // "08:00"
  heure_fermeture?: string | null; // "18:00"

  contact?: string[]; // téléphones / responsables
  mail?: string[];    // emails

  createdAt?: Date | string;
  updatedAt?: Date | string;
}
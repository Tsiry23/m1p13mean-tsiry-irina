export interface Paiement {
  _id?: string;

  total_a_payer: number;

  periode?: Date | string;
  date_?: Date | string;

  en_retard?: boolean;

  id_boutique: string | undefined;

  createdAt?: Date | string;
  updatedAt?: Date | string;
}
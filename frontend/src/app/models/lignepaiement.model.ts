export interface LignePaiement {
  periode: Date;            // 2026-02-01
  total_a_payer: number;
  date_: string | null;
  dejaPaye: boolean;
}
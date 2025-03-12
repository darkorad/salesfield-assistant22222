
/**
 * Define interfaces for monthly items report
 */

export interface ItemSummary {
  name: string;
  manufacturer: string;
  unit: string;
  totalQuantity: number;
  totalValue: number;
  customers: Set<string>;
}

export interface ReportItem {
  'Naziv artikla': string;
  'Proizvođač': string;
  'Jedinica mere': string;
  'Kupci': string;
  'Ukupna količina': number;
  'Ukupna vrednost': number;
}

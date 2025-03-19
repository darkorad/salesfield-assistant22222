
/**
 * Define interfaces for monthly items report
 */

export interface ItemSummary {
  name: string;
  manufacturer: string;
  unit: string;
  totalQuantity: number;
  totalValue: number;
  customers: Set<string>; // We keep this in the summary for internal processing, but won't show in report
}

export interface ReportItem {
  'Naziv artikla': string;
  'Proizvođač': string;
  'Jedinica mere': string;
  'Ukupna količina': number;
  'Ukupna vrednost': number;
}

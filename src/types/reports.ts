import { Customer, Product } from ".";

export interface CashSaleItem {
  product: Product;
  quantity: number;
  total: number;
}

export interface CashSale {
  customer: Customer;
  items: CashSaleItem[];
  total: number;
  previousDebt: number;
}

export interface WorksheetConfig {
  orientation: 'portrait' | 'landscape';
  paper: number;
  scale: number;
  fitToPage: boolean;
  pageMargins: number[];
}
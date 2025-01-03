export interface Product {
  id: string;
  user_id: string;
  Naziv: string;
  Proizvođač: string;
  Cena: number;
  "Jedinica mere": string;
  created_at?: string;
  category_id?: string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}
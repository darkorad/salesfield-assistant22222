export interface User {
  id: string;
  username: string;
  password: string;
}

export interface Customer {
  id: string;
  user_id: string;
  code: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  pib: string;
  is_vat_registered: boolean;
  gps_coordinates?: string;
}

export interface Product {
  id: string;
  user_id: string;
  name: string; // Virtual property that maps to Naziv
  manufacturer: string; // Virtual property that maps to Proizvođač
  price: number; // Virtual property that maps to Cena
  unit: string; // Virtual property that maps to Jedinica mere
  // Original Serbian properties from database
  Naziv: string;
  Proizvođač: string;
  Cena: number;
  "Jedinica mere": string;
}

export interface OrderItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  date: string;
  paymentType: 'cash' | 'invoice';
  sent?: boolean;
}
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
  name: string;
  manufacturer: string;
  price: number;
  unit: string;
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
  userId: string; // Add userId to track which user created the order
  paymentType: 'cash' | 'invoice';
  sent?: boolean;
}
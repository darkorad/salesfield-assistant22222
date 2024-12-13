export interface User {
  id: string;
  username: string;
  password: string;
}

export interface Customer {
  id: string;
  name: string;
  address: string;
  city: string;
}

export interface Product {
  id: string;
  name: string;
  manufacturer: string;
  price: number;
  unit: string;
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
}
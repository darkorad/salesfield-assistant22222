import { Customer } from './customer';
import { OrderItem } from './product';

export interface Order {
  id: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  date: string;
  userId: string;
  paymentType: 'cash' | 'invoice';
  sent?: boolean;
}
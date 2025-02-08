
import { Customer } from './customer';
import { OrderItem } from './product';

export interface Order {
  id: string;
  customer: Customer;
  items: OrderItem[];
  total: number;
  date: string;
  userId: string;
  payment_type: 'cash' | 'invoice';
  payment_status: 'gotovina' | 'racun';
  sent?: boolean;
}


export * from './user';
export * from './customer';
export * from './product';
export * from './order';

export interface VisitPlan {
  id: string;
  customer_id: string;
  visit_day: string;
  visit_time: string | null;
  notes: string | null;
  customer: {
    name: string;
    address: string;
    city: string;
  };
  visit_status: 'planned' | 'completed' | 'cancelled';
  dan_obilaska: string | null;
}

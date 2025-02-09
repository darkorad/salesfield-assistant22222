
export * from './user';
export * from './customer';
export * from './product';
export * from './order';

// Adding visit plan type definition
export interface VisitPlan {
  id: string;
  customer_id: string;
  visit_day: string;
  visit_time: string | null;
  notes: string | null;
  completed: boolean;
  customer: {
    name: string;
    address: string;
    city: string;
  };
}

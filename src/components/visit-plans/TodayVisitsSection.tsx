
import React from "react";
import { format } from "date-fns";
import { TodayVisits } from "./TodayVisits";

interface VisitPlan {
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

interface TodayVisitsSectionProps {
  isLoading: boolean;
  visitPlans: VisitPlan[];
}

export const TodayVisitsSection: React.FC<TodayVisitsSectionProps> = ({ 
  isLoading, 
  visitPlans 
}) => {
  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold mb-2">Današnje posete</h2>
      <TodayVisits 
        isLoading={isLoading}
        visitPlans={visitPlans}
        date={format(new Date(), 'dd.MM.yyyy.')}
      />
    </div>
  );
};

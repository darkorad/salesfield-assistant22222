
import { useState } from "react";
import { TodayVisits } from "./TodayVisits";
import { format } from "date-fns";
import { useCustomersByDay } from "./hooks/useCustomersByDay";

interface TodayVisitsSectionProps {
  isLoading: boolean;
  visitPlans: any[];
  lastDataRefresh?: string | null;
  isOffline?: boolean;
  customers?: any[];
}

export const TodayVisitsSection = ({ 
  isLoading, 
  visitPlans = [], 
  lastDataRefresh,
  isOffline,
  customers = []
}: TodayVisitsSectionProps) => {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Get today's day name in Serbian
  const today = new Date().toLocaleString('sr-Latn-RS', { weekday: 'long' }).toLowerCase();
  
  // Format today's date to display
  const formattedDate = format(new Date(), 'dd.MM.yyyy.');
  
  // Filter visit plans for today
  const todayVisitPlans = refreshTrigger >= 0 ? visitPlans.filter(plan => 
    plan.visit_day?.toLowerCase() === today || 
    plan.dan_obilaska?.toLowerCase() === today
  ) : [];

  // Handle when a new visit is added
  const handleVisitAdded = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  return (
    <div className="mt-4">
      <h2 className="text-xl font-semibold mb-3">Današnje posete ({formattedDate})</h2>
      {lastDataRefresh && (
        <p className="text-xs text-gray-500 mb-3">
          Podaci poslednji put sinhronizovani: {new Date(lastDataRefresh).toLocaleString()}
        </p>
      )}
      
      <TodayVisits 
        isLoading={isLoading} 
        visitPlans={todayVisitPlans} 
        date={formattedDate}
        isOffline={isOffline}
        onVisitAdded={handleVisitAdded}
        allCustomers={customers}
      />
    </div>
  );
};


import { Customer } from "@/types";
import { RefreshCw, LoaderIcon, WifiOff } from "lucide-react";
import { TodayVisits } from "./TodayVisits";
import { Button } from "@/components/ui/button";

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
  lastDataRefresh?: string | null;
  isOffline?: boolean;
}

export const TodayVisitsSection = ({ 
  isLoading,
  visitPlans,
  lastDataRefresh,
  isOffline
}: TodayVisitsSectionProps) => {
  return (
    <div className="mt-6 space-y-4">
      {lastDataRefresh && (
        <div className="text-xs text-muted-foreground mb-2 flex items-center">
          {isOffline && <WifiOff className="h-3 w-3 mr-1 text-blue-600" />}
          <span>
            Poslednji uvoz podataka o kupcima: {new Date(lastDataRefresh).toLocaleString('sr-Latn-RS')}
          </span>
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <LoaderIcon className="animate-spin h-6 w-6 mr-2" />
          <span>Učitavanje...</span>
        </div>
      ) : (
        <TodayVisits 
          visitPlans={visitPlans} 
          date={new Date().toLocaleDateString('sr-Latn-RS')} 
          isLoading={isLoading} 
        />
      )}
    </div>
  );
};

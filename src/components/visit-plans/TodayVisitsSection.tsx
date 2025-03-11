
import { Customer } from "@/types";
import { ArrowPathIcon, LoaderIcon } from "lucide-react";
import { TodayVisits } from "./TodayVisits";
import { Button } from "@/components/ui/button";

interface VisitPlan {
  id: string;
  customer_id: string;
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
}

export const TodayVisitsSection = ({ 
  isLoading,
  visitPlans,
  lastDataRefresh
}: TodayVisitsSectionProps) => {
  return (
    <div className="mt-6 space-y-4">
      {lastDataRefresh && (
        <div className="text-xs text-muted-foreground mb-2">
          Poslednji uvoz podataka o kupcima: {new Date(lastDataRefresh).toLocaleString('sr-Latn-RS')}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex items-center justify-center p-8">
          <LoaderIcon className="animate-spin h-6 w-6 mr-2" />
          <span>Učitavanje...</span>
        </div>
      ) : (
        <TodayVisits visitPlans={visitPlans} />
      )}
    </div>
  );
};

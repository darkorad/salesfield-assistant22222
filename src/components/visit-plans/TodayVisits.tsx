
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Customer } from "@/types";
import { VisitPlansTable } from "./table/VisitPlansTable";
import { AddVisitPlanForm } from "./form/AddVisitPlanForm";

interface VisitPlan {
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
}

interface TodayVisitsProps {
  isLoading: boolean;
  visitPlans: VisitPlan[];
  date: string;
  isOffline?: boolean;
  onVisitAdded?: () => void;
  allCustomers?: Customer[];
}

export const TodayVisits = ({ 
  isLoading, 
  visitPlans, 
  date, 
  isOffline,
  onVisitAdded = () => {},
  allCustomers = []
}: TodayVisitsProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <VisitPlansTable 
        visitPlans={visitPlans} 
        isLoading={isLoading} 
        isOffline={isOffline} 
      />

      <div className="mt-4">
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Dodaj posetu
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Dodaj novu posetu za {date}</DialogTitle>
            </DialogHeader>
            <AddVisitPlanForm
              onVisitAdded={onVisitAdded}
              isOffline={isOffline}
              onClose={() => setIsAddDialogOpen(false)}
              allCustomers={allCustomers}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

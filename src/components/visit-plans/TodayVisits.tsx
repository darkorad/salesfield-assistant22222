
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Customer, VisitPlan } from "@/types";
import { AddVisitDialog } from "./AddVisitDialog";

interface TodayVisitsProps {
  isLoading: boolean;
  visitPlans: VisitPlan[];
  date: string;
  customers: Customer[];
  onVisitAdded: () => void;
}

export const TodayVisits = ({ 
  isLoading, 
  visitPlans, 
  date,
  customers,
  onVisitAdded 
}: TodayVisitsProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Kupac</TableHead>
            <TableHead>Adresa</TableHead>
            <TableHead>Vreme</TableHead>
            <TableHead>Napomene</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {visitPlans.map((visit) => (
            <TableRow key={visit.id}>
              <TableCell>{visit.customer?.name}</TableCell>
              <TableCell>
                {visit.customer?.address}, {visit.customer?.city}
              </TableCell>
              <TableCell>{visit.visit_time}</TableCell>
              <TableCell>{visit.notes}</TableCell>
              <TableCell>{visit.visit_status}</TableCell>
            </TableRow>
          ))}
          {visitPlans.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-gray-500">
                Nema planiranih poseta za danas
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="mt-4">
        <Button 
          className="w-full"
          onClick={() => setIsAddDialogOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Dodaj posetu
        </Button>
      </div>

      <AddVisitDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        date={date}
        customers={customers}
        onVisitAdded={onVisitAdded}
      />
    </div>
  );
};


import { useState } from "react";
import { Plus, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CustomerSelection } from "@/components/settings/group-prices/components/CustomerSelection";
import { Customer } from "@/types";
import { useCustomersByDay } from "./hooks/useCustomersByDay";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

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
  onVisitAdded,
  allCustomers = []
}: TodayVisitsProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get today's day name in Serbian
  const today = new Date().toLocaleString('sr-Latn-RS', { weekday: 'long' }).toLowerCase();

  const handleAddVisit = async () => {
    if (!selectedCustomer) {
      toast.error("Molimo izaberite kupca");
      return;
    }

    setIsSubmitting(true);

    try {
      // Check if we're offline
      if (isOffline) {
        toast.error("Nije moguće dodati posetu u offline režimu");
        return;
      }

      // Get current session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      // Create visit plan
      const newVisitPlan = {
        id: uuidv4(),
        customer_id: selectedCustomer.id,
        visit_day: today,
        visit_time: null,
        notes: `Dodatna poseta za ${format(new Date(), 'dd.MM.yyyy')}`,
        user_id: session.user.id,
        completed: false
      };

      // Insert into visit_plans table
      const { error } = await supabase.from('visit_plans').insert(newVisitPlan);

      if (error) {
        console.error("Error adding visit:", error);
        toast.error("Greška pri dodavanju posete");
        return;
      }

      toast.success("Poseta uspešno dodata");
      setIsAddDialogOpen(false);
      setSelectedCustomer(null);
      setCustomerSearch("");
      
      // Notify parent that a visit was added
      if (onVisitAdded) {
        onVisitAdded();
      }
    } catch (error) {
      console.error("Error adding visit:", error);
      toast.error("Greška pri dodavanju posete");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            </TableRow>
          ))}
          {visitPlans.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-gray-500">
                Nema planiranih poseta za danas
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

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
            <div className="p-4 space-y-4">
              <CustomerSelection
                selectedGroup={null}
                customers={allCustomers}
                customerSearch={customerSearch}
                selectedCustomer={selectedCustomer}
                onCustomerSearchChange={setCustomerSearch}
                onCustomerSelect={(customer) => setSelectedCustomer(customer)}
              />
              {selectedCustomer && (
                <div className="text-sm">
                  <p><span className="font-medium">Kupac:</span> {selectedCustomer.name}</p>
                  <p><span className="font-medium">Adresa:</span> {selectedCustomer.address}, {selectedCustomer.city}</p>
                </div>
              )}
              <Button 
                className="w-full mt-4" 
                disabled={!selectedCustomer || isSubmitting}
                onClick={handleAddVisit}
              >
                {isSubmitting ? "Dodavanje..." : "Dodaj posetu"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

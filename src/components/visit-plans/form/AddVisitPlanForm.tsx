
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { CustomerSelection } from "@/components/settings/group-prices/components/CustomerSelection";
import { Customer } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { format } from "date-fns";

interface AddVisitPlanFormProps {
  onVisitAdded: () => void;
  isOffline?: boolean;
  onClose: () => void;
  allCustomers: Customer[];
}

export const AddVisitPlanForm = ({ 
  onVisitAdded, 
  isOffline, 
  onClose, 
  allCustomers 
}: AddVisitPlanFormProps) => {
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
      onClose();
      onVisitAdded();
      
    } catch (error) {
      console.error("Error adding visit:", error);
      toast.error("Greška pri dodavanju posete");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
        disabled={!selectedCustomer || isSubmitting || isOffline}
        onClick={handleAddVisit}
      >
        {isSubmitting ? "Dodavanje..." : "Dodaj posetu"}
      </Button>
      
      {isOffline && (
        <p className="text-sm text-red-500 mt-2">
          Dodavanje posete nije moguće u offline režimu
        </p>
      )}
    </div>
  );
};

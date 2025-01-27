import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit } from "lucide-react";
import { toast } from "sonner";
import { CustomerFormData, initialCustomerFormData } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { CustomerFormFields } from "./CustomerFormFields";
import { Customer } from "@/types";

interface EditCustomerDialogProps {
  selectedCustomer: Customer | null;
  onCustomerUpdate: () => void;
}

export const EditCustomerDialog = ({ selectedCustomer, onCustomerUpdate }: EditCustomerDialogProps) => {
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerFormData>(initialCustomerFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (selectedCustomer) {
      setCustomer({
        name: selectedCustomer.name,
        address: selectedCustomer.address,
        city: selectedCustomer.city,
        phone: selectedCustomer.phone || "",
        email: selectedCustomer.email || "",
        pib: selectedCustomer.pib,
        isVatRegistered: selectedCustomer.is_vat_registered || false,
        gpsCoordinates: selectedCustomer.gps_coordinates || "",
        naselje: selectedCustomer.naselje || "",
        visit_day: selectedCustomer.visit_day || "",
        visit_type: selectedCustomer.visit_type || "visit",
        visit_duration: selectedCustomer.visit_duration || 30,
        visit_notes: selectedCustomer.visit_notes || ""
      });
    }
  }, [selectedCustomer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    
    setIsSubmitting(true);

    try {
      // Update both tables to maintain consistency
      const updatePromises = [
        supabase
          .from('customers')
          .update({
            name: customer.name,
            address: customer.address,
            city: customer.city,
            phone: customer.phone,
            email: customer.email,
            pib: customer.pib,
            is_vat_registered: customer.isVatRegistered,
            gps_coordinates: customer.gpsCoordinates,
            naselje: customer.naselje,
            visit_day: customer.visit_day,
            visit_type: customer.visit_type,
            visit_duration: customer.visit_duration,
            visit_notes: customer.visit_notes
          })
          .eq('id', selectedCustomer.id),
        
        supabase
          .from('kupci_darko')
          .update({
            name: customer.name,
            address: customer.address,
            city: customer.city,
            phone: customer.phone,
            email: customer.email,
            pib: customer.pib,
            is_vat_registered: customer.isVatRegistered,
            gps_coordinates: customer.gpsCoordinates,
            naselje: customer.naselje,
            visit_day: customer.visit_day,
            visit_type: customer.visit_type,
            visit_duration: customer.visit_duration,
            visit_notes: customer.visit_notes
          })
          .eq('id', selectedCustomer.id)
      ];

      const results = await Promise.all(updatePromises);
      const errors = results.filter(result => result.error);

      if (errors.length > 0) {
        console.error('Errors updating customer:', errors);
        throw new Error('Failed to update customer in all tables');
      }

      toast.success("Kupac je uspešno ažuriran");
      setOpen(false);
      onCustomerUpdate();
    } catch (error) {
      console.error('Error updating customer:', error);
      toast.error("Greška pri ažuriranju kupca");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CustomerFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomer(prev => ({ ...prev, [field]: e.target.value }));
  };

  if (!selectedCustomer) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <Edit className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Izmeni kupca</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <CustomerFormFields 
            customer={customer}
            handleInputChange={handleInputChange}
            setCustomer={setCustomer}
          />
          <Button 
            type="submit" 
            className="w-full mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Ažuriranje..." : "Sačuvaj izmene"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
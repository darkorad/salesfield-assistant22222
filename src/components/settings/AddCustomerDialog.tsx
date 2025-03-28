
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { toast } from "sonner";
import { CustomerFormData, initialCustomerFormData } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { CustomerFormFields } from "./customer/CustomerFormFields";

// Helper function to normalize day names for consistency
const normalizeDay = (day: string | undefined): string | undefined => {
  if (!day) return undefined;
  return day.toLowerCase().trim();
};

export const AddCustomerDialog = () => {
  const [open, setOpen] = useState(false);
  const [customer, setCustomer] = useState<CustomerFormData>(initialCustomerFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Morate biti prijavljeni da biste dodali novog kupca");
        return;
      }

      const code = Date.now().toString().slice(-6);

      // Normalize day fields before inserting
      const normalizedVisitDay = normalizeDay(customer.visitDay);
      const normalizedDanObilaska = normalizeDay(customer.danObilaska);

      // Check which table to use based on user email
      const userEmail = user.email;
      
      if (userEmail === 'zirmd.darko@gmail.com') {
        // Insert into kupci_darko table for Darko
        const { data, error } = await supabase
          .from('kupci_darko')
          .insert([{
            user_id: user.id,
            code: code,
            name: customer.name,
            address: customer.address,
            city: customer.city,
            phone: customer.phone,
            email: customer.email,
            pib: customer.pib,
            is_vat_registered: customer.isVatRegistered,
            gps_coordinates: customer.gpsCoordinates,
            naselje: customer.naselje,
            dan_posete: normalizedVisitDay,
            dan_obilaska: normalizedDanObilaska,
            visit_day: normalizedVisitDay
          }])
          .select()
          .single();

        if (error) throw error;
        
        toast.success("Kupac je uspešno dodat");
      } else if (userEmail === 'zirmd.veljko@gmail.com') {
        // Insert into customers table for Veljko
        const { data, error } = await supabase
          .from('customers')
          .insert([{
            user_id: user.id,
            code: code,
            name: customer.name,
            address: customer.address,
            city: customer.city,
            phone: customer.phone,
            email: customer.email,
            pib: customer.pib,
            is_vat_registered: customer.isVatRegistered,
            gps_coordinates: customer.gpsCoordinates,
            naselje: customer.naselje,
            visit_day: normalizedVisitDay,
            dan_obilaska: normalizedDanObilaska,
            dan_posete: normalizedVisitDay
          }])
          .select()
          .single();

        if (error) throw error;
        
        toast.success("Kupac je uspešno dodat");
      } else {
        // For any other user, use standard customers table
        const { data, error } = await supabase
          .from('customers')
          .insert([{
            user_id: user.id,
            code: code,
            name: customer.name,
            address: customer.address,
            city: customer.city,
            phone: customer.phone,
            email: customer.email,
            pib: customer.pib,
            is_vat_registered: customer.isVatRegistered,
            gps_coordinates: customer.gpsCoordinates,
            naselje: customer.naselje,
            visit_day: normalizedVisitDay,
            dan_obilaska: normalizedDanObilaska,
            dan_posete: normalizedVisitDay
          }])
          .select()
          .single();

        if (error) throw error;
        
        toast.success("Kupac je uspešno dodat");
      }

      setOpen(false);
      setCustomer(initialCustomerFormData);
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error("Greška pri dodavanju kupca");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CustomerFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomer(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full sm:w-auto">
          <PlusCircle className="mr-2 h-4 w-4" />
          Novi kupac
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj novog kupca</DialogTitle>
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
            {isSubmitting ? "Dodavanje..." : "Dodaj kupca"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

import { useState } from "react";
import { CustomerFormData, initialCustomerFormData } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useCustomerSubmit = (onSuccess: () => void) => {
  const [customer, setCustomer] = useState<CustomerFormData>(initialCustomerFormData);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Niste prijavljeni");
        return;
      }

      // Get the latest customer code
      const { data: customers } = await supabase
        .from('customers')
        .select('code')
        .order('code', { ascending: false })
        .limit(1);

      // Generate new code by incrementing the latest one
      const latestCode = customers && customers[0] ? parseInt(customers[0].code) : 0;
      const newCode = (latestCode + 1).toString();

      const newCustomer = {
        user_id: session.user.id,
        code: newCode,
        name: customer.name,
        address: customer.address,
        city: customer.city,
        phone: customer.phone,
        pib: customer.pib,
        is_vat_registered: customer.isVatRegistered,
        gps_coordinates: customer.gpsCoordinates
      };

      const { error } = await supabase
        .from('customers')
        .insert(newCustomer);

      if (error) throw error;

      toast.success("Kupac je uspešno dodat");
      setCustomer(initialCustomerFormData);
      onSuccess();
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error("Greška pri dodavanju kupca");
    }
  };

  const handleInputChange = (field: keyof CustomerFormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCustomer(prev => ({ ...prev, [field]: e.target.value }));
  };

  return {
    customer,
    handleSubmit,
    handleInputChange,
    setCustomer
  };
};
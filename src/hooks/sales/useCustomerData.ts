import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types";
import { toast } from "sonner";

export const useCustomerData = (userEmail: string) => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const fetchCustomers = async (userId: string) => {
    try {
      console.log("Fetching customers from kupci_darko table");
      const { data: customersData, error } = await supabase
        .from('kupci_darko')
        .select('*')
        .order('name');

      if (error) {
        throw new Error(`Error fetching customers: ${error.message}`);
      }

      if (customersData) {
        console.log("Fetched customers count:", customersData.length);
        setCustomers(customersData);
        return customersData;
      }
      return [];
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error("Greška pri učitavanju kupaca");
      return [];
    }
  };

  return { customers, fetchCustomers };
};
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types";
import { toast } from "sonner";

export const useCustomerData = (userEmail: string) => {
  const [customers, setCustomers] = useState<Customer[]>([]);

  const fetchCustomers = async (userId: string) => {
    try {
      let customersData;
      let customersError;

      if (userEmail === 'zirmd.darko@gmail.com') {
        console.log("Fetching customers from kupci_darko table");
        const response = await supabase
          .from('kupci_darko')
          .select('*');
        
        if (response.error) {
          throw new Error(`Error fetching customers: ${response.error.message}`);
        }

        customersData = response.data?.map(customer => ({
          id: customer.id || crypto.randomUUID(),
          user_id: userId,
          code: customer.code || '',
          name: customer.name || '',
          address: customer.address || '',
          city: customer.city || '',
          phone: customer.phone || '',
          pib: customer.pib || '',
          is_vat_registered: customer.is_vat_registered || false,
          gps_coordinates: customer.gps_coordinates || '',
          created_at: customer.created_at || new Date().toISOString(),
          group_name: customer.group_name || null,
          naselje: customer.naselje || null,
          email: customer.email || null
        }));
      } else {
        console.log("Fetching customers from regular customers table");
        const response = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', userId);
        
        customersData = response.data;
        customersError = response.error;
      }

      if (customersError) {
        throw customersError;
      }

      console.log("Fetched customers:", customersData?.length || 0);
      setCustomers(customersData || []);
      return customersData;
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast.error("Greška pri učitavanju kupaca");
      return [];
    }
  };

  return { customers, fetchCustomers };
};
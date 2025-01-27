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
        const transformedCustomers = customersData.map(customer => ({
          id: customer.id,
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

        console.log("Fetched customers:", transformedCustomers.length);
        setCustomers(transformedCustomers);
        return transformedCustomers;
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
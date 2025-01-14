import { useMemo } from "react";
import { Customer } from "@/types";
import { toast } from "sonner";

export const useCustomerFilter = (customers: Customer[], searchTerm: string) => {
  return useMemo(() => {
    if (!customers || !searchTerm) return [];
    
    try {
      const term = searchTerm.toLowerCase().trim();
      if (!term) return [];

      return customers.filter((customer) => {
        if (!customer) return false;
        
        const searchableFields = [
          customer.name,
          customer.group_name,
          customer.city,
          customer.address,
          customer.naselje
        ].map(field => (field || '').toLowerCase());

        return searchableFields.some(field => field.includes(term));
      });
    } catch (error) {
      console.error("Error filtering customers:", error);
      toast.error("Greška pri filtriranju kupaca");
      return [];
    }
  }, [customers, searchTerm]);
};
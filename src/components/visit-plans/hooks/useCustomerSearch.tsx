
import { useMemo } from "react";
import { Customer } from "@/types";

export const useCustomerSearch = (customers: Customer[], searchTerm: string) => {
  const filteredCustomers = useMemo(() => {
    if (!searchTerm.trim()) return customers;
    
    const term = searchTerm.toLowerCase().trim();
    return customers.filter(customer => {
      return (
        (customer.name || '').toLowerCase().includes(term) ||
        (customer.address || '').toLowerCase().includes(term) ||
        (customer.city || '').toLowerCase().includes(term) ||
        (customer.phone || '').toLowerCase().includes(term)
      );
    });
  }, [customers, searchTerm]);

  return filteredCustomers;
};

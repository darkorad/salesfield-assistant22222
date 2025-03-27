
import { Customer } from "@/types";
import { useMemo } from "react";

export const useCustomersByDay = (customers: Customer[] = [], day: string = '') => {
  return useMemo(() => {
    if (!day || !customers.length) return [];
    
    const normalizedDay = day.toLowerCase().trim();
    console.log(`Filtering customers for day: ${normalizedDay}`);
    
    const filteredCustomers = customers.filter(customer => {
      // Check all possible day fields
      const customerDanPosete = customer.dan_posete?.toLowerCase().trim() || '';
      const customerDanObilaska = customer.dan_obilaska?.toLowerCase().trim() || '';
      const customerVisitDay = customer.visit_day?.toLowerCase().trim() || '';
      
      // Consider a match if any of the day fields match the target day
      const isMatch = 
        customerDanPosete === normalizedDay || 
        customerDanObilaska === normalizedDay || 
        customerVisitDay === normalizedDay;
      
      if (isMatch) {
        console.log(`Customer matched day ${normalizedDay}:`, customer.name, {
          dan_posete: customerDanPosete,
          dan_obilaska: customerDanObilaska,
          visit_day: customerVisitDay
        });
      }
      
      return isMatch;
    });
    
    console.log(`Found ${filteredCustomers.length} customers for day ${normalizedDay}`);
    return filteredCustomers;
  }, [customers, day]);
};

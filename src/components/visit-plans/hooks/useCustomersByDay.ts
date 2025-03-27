
import { Customer } from "@/types";
import { useMemo } from "react";
import { areDaysSimilar, normalizeDay } from "../utils/dayUtils";

export const useCustomersByDay = (customers: Customer[] = [], day: string = '') => {
  return useMemo(() => {
    if (!day || !customers.length) return [];
    
    const normalizedDay = normalizeDay(day);
    console.log(`Filtering customers for day: ${normalizedDay}`);
    
    const filteredCustomers = customers.filter(customer => {
      // Check all possible day fields
      const customerDanPosete = normalizeDay(customer.dan_posete);
      const customerDanObilaska = normalizeDay(customer.dan_obilaska);
      const customerVisitDay = normalizeDay(customer.visit_day);
      
      // We'll use our improved day matching function to compare days
      const isMatch = 
        areDaysSimilar(customerDanPosete, normalizedDay) || 
        areDaysSimilar(customerDanObilaska, normalizedDay) || 
        areDaysSimilar(customerVisitDay, normalizedDay);
      
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

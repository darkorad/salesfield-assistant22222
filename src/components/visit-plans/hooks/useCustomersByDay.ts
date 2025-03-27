
import { Customer } from "@/types";
import { useMemo } from "react";
import { areDaysSimilar, normalizeDay } from "../utils/dayUtils";

export const useCustomersByDay = (customers: Customer[] = [], day: string = '') => {
  return useMemo(() => {
    if (!day || !customers.length) return [];
    
    const normalizedDay = normalizeDay(day);
    console.log(`Filtering customers for day: ${normalizedDay}`);
    
    const filteredCustomers = customers.filter(customer => {
      // Check all possible day fields - prioritize dan_posete
      const customerDanPosete = normalizeDay(customer.dan_posete);
      const customerDanObilaska = normalizeDay(customer.dan_obilaska);
      const customerVisitDay = normalizeDay(customer.visit_day);
      
      // First check dan_posete as it has priority
      if (customerDanPosete && areDaysSimilar(customerDanPosete, normalizedDay)) {
        console.log(`Customer matched on dan_posete: ${customer.name}`);
        return true;
      }
      
      // Then check other fields
      if (customerDanObilaska && areDaysSimilar(customerDanObilaska, normalizedDay)) {
        console.log(`Customer matched on dan_obilaska: ${customer.name}`);
        return true;
      }
      
      if (customerVisitDay && areDaysSimilar(customerVisitDay, normalizedDay)) {
        console.log(`Customer matched on visit_day: ${customer.name}`);
        return true;
      }
      
      return false;
    });
    
    console.log(`Found ${filteredCustomers.length} customers for day ${normalizedDay}`);
    
    if (filteredCustomers.length > 0) {
      console.log(`Sample day matches for ${normalizedDay}:`, 
        filteredCustomers.slice(0, 3).map(c => ({ 
          name: c.name, 
          dan_posete: c.dan_posete,
          dan_obilaska: c.dan_obilaska,
          visit_day: c.visit_day
        }))
      );
    }
    
    return filteredCustomers;
  }, [customers, day]);
};

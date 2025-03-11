
import { useMemo } from "react";
import { Customer } from "@/types";
import { normalizeDay, areDaysSimilar } from "../utils/dayUtils";

export const useCustomersByDay = (customers: Customer[], day: string) => {
  return useMemo(() => {
    console.log(`Filtering customers for day: ${day}`);
    
    // Create a Map to store unique customers by ID
    const uniqueCustomersMap = new Map<string, Customer>();
    const normalizedSelectedDay = normalizeDay(day);
    
    // First pass: Process customers with exact day matches
    customers.forEach(customer => {
      // Check all possible day fields
      const customerDayFields = [
        customer.dan_posete,
        customer.dan_obilaska,
        customer.visit_day
      ];
      
      // Find if any of the customer's day fields match the selected day
      const dayMatches = customerDayFields.some(customerDay => {
        if (!customerDay) return false;
        return areDaysSimilar(customerDay, day);
      });
      
      if (dayMatches && !uniqueCustomersMap.has(customer.id)) {
        uniqueCustomersMap.set(customer.id, customer);
      }
    });
    
    // Convert map back to array
    const uniqueCustomers = Array.from(uniqueCustomersMap.values());
    console.log(`Found ${uniqueCustomers.length} unique customers for day: ${day}`);
    
    return uniqueCustomers;
  }, [customers, day]);
};

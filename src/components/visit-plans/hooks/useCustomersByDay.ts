
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
      
      // For deduplication, use a composite key of name+address or just ID if those are missing
      const uniqueKey = customer.id;
      
      if (dayMatches && !uniqueCustomersMap.has(uniqueKey)) {
        uniqueCustomersMap.set(uniqueKey, customer);
      }
    });
    
    // Additional deduplication step to catch similar names in the same location
    const finalCustomersMap = new Map<string, Customer>();
    Array.from(uniqueCustomersMap.values()).forEach(customer => {
      // Create a normalized name for better comparison
      const normalizedName = customer.name.toLowerCase().trim();
      const normalizedAddress = (customer.address || '').toLowerCase().trim();
      
      // Use name+address as a composite key for additional deduplication
      const compositeKey = `${normalizedName}-${normalizedAddress}`;
      
      if (!finalCustomersMap.has(compositeKey)) {
        finalCustomersMap.set(compositeKey, customer);
      } else {
        console.log(`Found duplicate by name+address: ${customer.name} at ${customer.address}`);
      }
    });
    
    // Convert map back to array
    const uniqueCustomers = Array.from(finalCustomersMap.values());
    console.log(`Found ${uniqueCustomers.length} unique customers for day: ${day}`);
    
    return uniqueCustomers;
  }, [customers, day]);
};

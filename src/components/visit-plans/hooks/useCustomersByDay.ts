
import { useMemo } from "react";
import { Customer } from "@/types";
import { normalizeDay, areDaysSimilar } from "../utils/dayUtils";

export const useCustomersByDay = (customers: Customer[], day: string) => {
  return useMemo(() => {
    console.log(`Filtering customers for day: ${day}, total customers: ${customers.length}`);
    
    // Early return if no customers
    if (customers.length === 0) {
      console.log(`No customers to filter for day: ${day}`);
      return [];
    }
    
    // Create a Map to store unique customers by ID
    const uniqueCustomersMap = new Map<string, Customer>();
    const normalizedSelectedDay = normalizeDay(day);
    
    // First pass: Process customers with exact day matches
    customers.forEach(customer => {
      // Check all possible day fields with proper null checking
      const dayFields = [
        customer.dan_posete,
        customer.dan_obilaska,
        customer.visit_day
      ].filter(Boolean); // Filter out null/undefined values
      
      // If no day fields are defined, skip this customer
      if (dayFields.length === 0) return;
      
      // Find if any of the customer's day fields match the selected day
      const dayMatches = dayFields.some(customerDay => {
        if (!customerDay) return false;
        return areDaysSimilar(customerDay, day);
      });
      
      if (dayMatches) {
        uniqueCustomersMap.set(customer.id, customer);
      }
    });
    
    console.log(`First pass - Customers matching day ${day}:`, uniqueCustomersMap.size);
    
    // Sort by name and convert back to array
    return Array.from(uniqueCustomersMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [customers, day]);
};

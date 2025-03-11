
import { useMemo } from "react";
import { Customer } from "@/types";
import { normalizeDay } from "../utils/dayUtils";

export const useCustomersByDay = (customers: Customer[], day: string) => {
  return useMemo(() => {
    console.log(`Filtering customers for day: ${day}`);
    
    // Normalize the day name for comparison
    const dayLower = normalizeDay(day);
    
    // Deduplicate customers by ID first to avoid showing the same customer multiple times
    const uniqueCustomers = Array.from(
      new Map(customers.map(customer => [customer.id, customer])).values()
    );
    
    // Then filter the unique customers by day
    return uniqueCustomers.filter(customer => {
      // Try all possible day fields with better normalization
      const customerDays = [
        normalizeDay(customer.dan_posete),
        normalizeDay(customer.dan_obilaska),
        normalizeDay(customer.visit_day)
      ];
      
      // Check if any of the customer's day fields match the selected day
      const isMatch = customerDays.some(d => {
        // Only log matches, not every check (reduces console spam)
        if (d && d.includes(dayLower.substring(0, 3))) {
          console.log(`Match found for ${customer.name}: ${d} contains ${dayLower.substring(0, 3)}`);
          return true;
        }
        
        // Check for exact match or partial match (first 3 chars)
        return d === dayLower || 
               (d && d.includes(dayLower.substring(0, 3)));
      });
      
      return isMatch;
    });
  }, [customers, day]);
};

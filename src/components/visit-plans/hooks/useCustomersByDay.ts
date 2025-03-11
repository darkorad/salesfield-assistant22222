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
      
      if (dayMatches) {
        // For deduplication, use customer ID as the initial key
        const uniqueKey = customer.id;
        
        if (!uniqueCustomersMap.has(uniqueKey)) {
          uniqueCustomersMap.set(uniqueKey, customer);
        }
      }
    });
    
    // Second pass: Enhanced deduplication by name and address
    const finalCustomersMap = new Map<string, Customer>();
    Array.from(uniqueCustomersMap.values()).forEach(customer => {
      // Normalize name and address for more accurate comparison
      const normalizedName = customer.name.toLowerCase().trim().replace(/\s+/g, ' ');
      const normalizedAddress = (customer.address || '').toLowerCase().trim().replace(/\s+/g, ' ');
      const normalizedCity = (customer.city || '').toLowerCase().trim().replace(/\s+/g, ' ');
      
      // Create a composite key that considers all identifying information
      const compositeKey = `${normalizedName}-${normalizedAddress}-${normalizedCity}`;
      
      // If we haven't seen this exact customer (by normalized name+address+city) before, add them
      if (!finalCustomersMap.has(compositeKey)) {
        finalCustomersMap.set(compositeKey, customer);
      } else {
        console.log(`Found duplicate customer: "${customer.name}" at "${customer.address}" in "${customer.city}"`);
        
        // If we find a duplicate, keep the one with more complete information
        const existingCustomer = finalCustomersMap.get(compositeKey)!;
        const currentHasMoreInfo = Boolean(customer.phone) || Boolean(customer.email) || Boolean(customer.pib);
        const existingHasMoreInfo = Boolean(existingCustomer.phone) || Boolean(existingCustomer.email) || Boolean(existingCustomer.pib);
        
        // Replace the existing one if this one has more information
        if (currentHasMoreInfo && !existingHasMoreInfo) {
          finalCustomersMap.set(compositeKey, customer);
        }
      }
    });
    
    // Convert map back to array and sort alphabetically by name
    const uniqueCustomers = Array.from(finalCustomersMap.values())
      .sort((a, b) => a.name.localeCompare(b.name));
    
    console.log(`Found ${uniqueCustomers.length} unique customers for day: ${day}`);
    
    return uniqueCustomers;
  }, [customers, day]);
};

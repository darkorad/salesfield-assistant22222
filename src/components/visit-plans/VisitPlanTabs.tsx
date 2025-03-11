
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer } from "@/types";
import { DaySchedule } from "./DaySchedule";

interface VisitPlanTabsProps {
  selectedDay: string;
  onDayChange: (day: string) => void;
  customers: Customer[];
}

const DAYS_OF_WEEK = [
  "ponedeljak",
  "utorak",
  "sreda",
  "četvrtak",
  "petak",
  "subota",
  "nedelja"
];

// Split days into two rows for better mobile display
const FIRST_ROW = DAYS_OF_WEEK.slice(0, 4); // Mon-Thu
const SECOND_ROW = DAYS_OF_WEEK.slice(4); // Fri-Sun

// Helper function to normalize day names for consistent comparison
const normalizeDay = (day: string | undefined | null): string => {
  if (!day) return '';
  // Convert to lowercase, remove diacritics, and trim spaces
  return day.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/č/g, "c")
    .replace(/ć/g, "c")
    .replace(/š/g, "s")
    .replace(/ž/g, "z")
    .replace(/đ/g, "dj")
    .trim();
};

export const VisitPlanTabs = ({ selectedDay, onDayChange, customers }: VisitPlanTabsProps) => {
  const getDayCustomers = (day: string) => {
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
  };

  return (
    <div className="space-y-2">
      <Tabs defaultValue={selectedDay} onValueChange={onDayChange} className="w-full">
        <div className="space-y-1">
          {/* First row of days */}
          <TabsList className="w-full flex gap-1 justify-start">
            {FIRST_ROW.map((day) => (
              <TabsTrigger 
                key={day} 
                value={day}
                className="flex-1 min-w-0 px-1 py-0.5 text-[11px] sm:text-xs capitalize"
              >
                {day}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Second row of days */}
          <TabsList className="w-full flex gap-1 justify-start">
            {SECOND_ROW.map((day) => (
              <TabsTrigger 
                key={day} 
                value={day}
                className="flex-1 min-w-0 px-1 py-0.5 text-[11px] sm:text-xs capitalize"
              >
                {day}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {DAYS_OF_WEEK.map((day) => (
          <TabsContent key={day} value={day}>
            <DaySchedule 
              day={day} 
              customers={getDayCustomers(day)}
              onCustomerSelect={(customer) => {
                // We don't need to do anything with the customer here now,
                // since the DaySchedule component handles this internally
              }}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

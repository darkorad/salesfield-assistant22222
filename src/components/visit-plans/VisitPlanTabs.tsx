
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Customer } from "@/types";
import { DaySchedule } from "./DaySchedule";
import { supabase } from "@/integrations/supabase/client";

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
const normalizeDay = (day: string | undefined): string => {
  if (!day) return '';
  return day.toLowerCase().trim();
};

export const VisitPlanTabs = ({ selectedDay, onDayChange, customers }: VisitPlanTabsProps) => {
  const getDayCustomers = (day: string) => {
    console.log(`Filtering customers for day: ${day}`);
    console.log('All customers:', customers);
    
    // Normalize the day name for comparison
    const dayLower = normalizeDay(day);
    
    return customers.filter(customer => {
      // Get customer visit days and handle possible undefined values
      const danPosete = normalizeDay(customer.dan_posete);
      const danObilaska = normalizeDay(customer.dan_obilaska);
      const visitDay = normalizeDay(customer.visit_day);
      
      // Log debugging information
      console.log(`Customer ${customer.name}:`, {
        danPosete,
        danObilaska,
        visitDay,
        dayLower,
        matchDanPosete: danPosete === dayLower,
        matchDanObilaska: danObilaska === dayLower,
        matchVisitDay: visitDay === dayLower
      });
      
      // Check all three possible fields that might contain day information
      return danPosete === dayLower || 
             danObilaska === dayLower || 
             visitDay === dayLower;
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

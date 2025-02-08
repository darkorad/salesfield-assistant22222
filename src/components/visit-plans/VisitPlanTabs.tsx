
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

export const VisitPlanTabs = ({ selectedDay, onDayChange, customers }: VisitPlanTabsProps) => {
  const getDayCustomers = (day: string) => {
    return customers.filter(customer => {
      const customerDay = customer.dan_posete?.toLowerCase().trim();
      return customerDay === day.toLowerCase().trim();
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
              onCustomerSelect={() => {}}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
